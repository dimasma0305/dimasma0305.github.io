export type MetricsMode = "off" | "local" | "share";
export const METRICS_PREFERENCE = "dimasc:metrics-preference:v1";
export const METRICS_DATA = "dimasc:metrics-session:v1";
export const METRICS_CHANGE = "dimasc:metrics-preference-changed";
export const METRICS_UPDATE = "dimasc:metrics-updated";
export const metricNames = [
  "LCP",
  "INP",
  "CLS",
  "page_view",
  "welcome",
  "room",
  "work",
  "writing",
  "about",
  "achievements",
  "skills",
  "experience",
  "services",
  "contact",
  "contact_link",
  "repository_link",
] as const;
export type MetricName = (typeof metricNames)[number];
export interface SiteMetric {
  sample: string;
  name: MetricName;
  value: number;
  page: string;
  viewport: "small" | "medium" | "large";
  motion: "reduced" | "standard";
  room: "3d" | "stills" | "none";
}
/** Never retain paths, slugs, search terms, fragments, referrers, or DOM text. */
export function pageBucket(path: string): string {
  const prefix = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const local =
    prefix && path.startsWith(prefix + "/") ? path.slice(prefix.length) : path;
  const first = local.split(/[?#]/)[0].split("/").filter(Boolean)[0] || "home";
  return [
    "home",
    "blog",
    "posts",
    "notes",
    "tools",
    "services",
    "search",
    "reading-list",
    "privacy",
  ].includes(first)
    ? first
    : "other";
}
export function metricsEndpoint(
  value = process.env.NEXT_PUBLIC_METRICS_ENDPOINT || "",
): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function privacySignal(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl === true)
  );
}
export function readMetricsMode(): MetricsMode {
  if (privacySignal()) {
    return "off";
  }
  try {
    const mode = localStorage.getItem(METRICS_PREFERENCE);
    return mode === "local" || (mode === "share" && metricsEndpoint())
      ? mode
      : "off";
  } catch {
    return "off";
  }
}
export function setMetricsMode(mode: MetricsMode): boolean {
  try {
    if (
      (privacySignal() && mode !== "off") ||
      (mode === "share" && !metricsEndpoint())
    ) {
      return false;
    }
    localStorage.setItem(METRICS_PREFERENCE, mode);
    dispatchEvent(new Event(METRICS_CHANGE));
    return true;
  } catch {
    return false;
  }
}
export function parseMetrics(raw: string | null): SiteMetric[] {
  try {
    const data: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) {
      return [];
    }
    return data
      .slice(-60)
      .filter(
        (item): item is SiteMetric =>
          item &&
          typeof item.sample === "string" &&
          /^[a-zA-Z\d.-]{1,100}$/.test(item.sample) &&
          metricNames.includes(item.name) &&
          Number.isFinite(item.value) &&
          item.value >= 0 &&
          typeof item.page === "string" &&
          pageBucket(`/${item.page}/`) === item.page &&
          ["small", "medium", "large"].includes(item.viewport) &&
          ["reduced", "standard"].includes(item.motion) &&
          ["3d", "stills", "none"].includes(item.room),
      )
      .map(({ sample, name, value, page, viewport, motion, room }) => ({
        sample,
        name,
        value,
        page,
        viewport,
        motion,
        room,
      }));
  } catch {
    return [];
  }
}
export function readMetrics(): SiteMetric[] {
  try {
    return parseMetrics(sessionStorage.getItem(METRICS_DATA));
  } catch {
    return [];
  }
}
export function clearMetrics(): boolean {
  try {
    sessionStorage.removeItem(METRICS_DATA);
    dispatchEvent(new Event(METRICS_UPDATE));
    return true;
  } catch {
    return false;
  }
}
const sampleKey = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;
export function recordMetric(
  name: MetricName,
  value: number,
  page: string,
  sample = sampleKey(),
) {
  const mode = readMetricsMode();
  if (mode === "off") {
    return;
  }
  const renderMode =
    document.querySelector<HTMLElement>(".tour-page")?.dataset.renderMode;
  const entry = parseMetrics(
    JSON.stringify([
      {
        sample,
        name,
        value:
          name === "CLS" ? Math.round(value * 1000) / 1000 : Math.round(value),
        page: pageBucket(page),
        viewport:
          innerWidth < 700 ? "small" : innerWidth < 1100 ? "medium" : "large",
        motion: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "reduced"
          : "standard",
        room:
          renderMode === "stills"
            ? "stills"
            : renderMode === "live"
              ? "3d"
              : "none",
      },
    ]),
  )[0];
  if (!entry) {
    return;
  }
  try {
    sessionStorage.setItem(
      METRICS_DATA,
      JSON.stringify(
        [
          ...readMetrics().filter((item) => item.sample !== sample),
          entry,
        ].slice(-60),
      ),
    );
    dispatchEvent(new Event(METRICS_UPDATE));
  } catch {
    /* Blocked storage must never break browsing or reading. */
  }
  const endpoint = mode === "share" && metricsEndpoint();
  if (endpoint) {
    // No cookies/referrer. The collector still sees network metadata such as IP;
    // deployment documentation requires aggregate retention and IP scrubbing.
    void fetch(endpoint, {
      method: "POST",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: 1, ...entry }),
    }).catch(() => {});
  }
}
