"use client";
import { useEffect, useState } from "react";
import {
  clearMetrics,
  METRICS_CHANGE,
  METRICS_DATA,
  METRICS_PREFERENCE,
  METRICS_UPDATE,
  metricsEndpoint,
  privacySignal,
  readMetrics,
  readMetricsMode,
  setMetricsMode,
  type MetricsMode,
  type SiteMetric,
} from "@/lib/site-metrics";
import "@/lib/library.css";

export function PerformanceSettings() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<MetricsMode>("off");
  const [blocked, setBlocked] = useState(false);
  const [entries, setEntries] = useState<SiteMetric[]>([]);
  const [status, setStatus] = useState("");
  const endpoint = metricsEndpoint();
  useEffect(() => {
    const sync = () => {
      setMode(readMetricsMode());
      setEntries(readMetrics());
      setBlocked(privacySignal());
    };
    const storage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === METRICS_PREFERENCE ||
        event.key === METRICS_DATA
      ) {
        sync();
      }
    };
    sync();
    setReady(true);
    addEventListener(METRICS_CHANGE, sync);
    addEventListener(METRICS_UPDATE, sync);
    addEventListener("storage", storage);
    return () => {
      removeEventListener(METRICS_CHANGE, sync);
      removeEventListener(METRICS_UPDATE, sync);
      removeEventListener("storage", storage);
    };
  }, []);
  function choose(value: MetricsMode) {
    if (!setMetricsMode(value)) {
      setStatus(
        "Could not change this setting. Browser privacy signals and storage restrictions take priority.",
      );
      return;
    }
    setStatus(
      value === "off"
        ? "Recording and sharing are off. You can clear existing local measurements below."
        : value === "local"
          ? "Local diagnostics are on. No measurements are sent. Visit a page, interact, then return here."
          : "Sharing is on for future measurements. You can turn it off at any time.",
    );
  }
  return (
    <>
      <fieldset className="performance-choices" disabled={!ready || blocked}>
        <legend>Optional performance measurement</legend>
        {(
          [
            [
              "off",
              "Off",
              "Default. No optional performance records or reports.",
            ],
            [
              "local",
              "Only on this device",
              "Keep up to 60 measurements in this tab’s session storage. Nothing is sent.",
            ],
            [
              "share",
              "Share performance measurements",
              endpoint
                ? `Send to ${new URL(endpoint).origin}. No persistent visitor identifier, search text, page slugs, or article contents.`
                : "Unavailable: no collection service has been configured.",
            ],
          ] as const
        ).map(([value, title, description]) => (
          <label key={value}>
            <input
              type="radio"
              name="metrics-mode"
              value={value}
              checked={mode === value}
              disabled={value === "share" && !endpoint}
              onChange={() => choose(value)}
            />
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      {blocked && (
        <p>
          Your browser’s Do Not Track or Global Privacy Control signal keeps
          optional measurement off.
        </p>
      )}
      <p role="status" className="performance-status">
        {status}
      </p>
      <section
        className="performance-diagnostics"
        aria-labelledby="diagnostic-title"
      >
        <h2 id="diagnostic-title">This tab’s measurements</h2>
        <p>
          These are your device’s samples, not site-wide visitor statistics.
          Loading, interaction delay, and layout stability are measured across a
          full page visit; client-side route changes do not reset these vitals.
          Reload a page for a fresh sample. Some results arrive after
          interaction or when you switch tabs.
        </p>
        <button
          type="button"
          disabled={!ready || !entries.length}
          onClick={() =>
            setStatus(
              clearMetrics()
                ? "Local measurements cleared."
                : "Your browser blocked clearing local storage.",
            )
          }
        >
          Clear local measurements
        </button>
        <ul className="performance-samples" aria-label="Recent measurements">
          {entries
            .slice()
            .reverse()
            .map((item) => (
              <li key={item.sample}>
                <strong>
                  {item.name === "LCP"
                    ? "Loading · LCP"
                    : item.name === "INP"
                      ? "Interaction · INP"
                      : item.name === "CLS"
                        ? "Layout shift · CLS"
                        : item.name.replaceAll("_", " ")}
                </strong>
                <span>
                  {item.value}
                  {["LCP", "INP"].includes(item.name) ? " ms" : ""} ·{" "}
                  {item.page} · {item.viewport} screen · {item.motion} motion
                  {item.room !== "none" ? ` · ${item.room} room` : ""}
                </span>
              </li>
            ))}
        </ul>
        {!entries.length && (
          <p>
            No measurements recorded in this tab. Diagnostics stay off unless
            you choose an option above.
          </p>
        )}
      </section>
    </>
  );
}
