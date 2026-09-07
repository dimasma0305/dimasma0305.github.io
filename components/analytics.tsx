"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  METRICS_CHANGE,
  METRICS_PREFERENCE,
  metricNames,
  readMetricsMode,
  recordMetric,
  type MetricName,
  type MetricsMode,
} from "@/lib/site-metrics";

let vitalsStarted = false;
const initialPage = typeof location === "undefined" ? "/" : location.pathname;
async function startVitals() {
  if (vitalsStarted || readMetricsMode() === "off") {
    return;
  }
  vitalsStarted = true;
  try {
    const { onLCP, onINP, onCLS } = await import("web-vitals");
    if (readMetricsMode() === "off") {
      vitalsStarted = false;
      return;
    }
    const report = (metric: { name: string; value: number; id: string }) =>
      recordMetric(
        metric.name as MetricName,
        metric.value,
        initialPage,
        metric.id,
      );
    // One set of observers per document. Callbacks check current consent again.
    // No attribution build: DOM targets and interaction text never enter records.
    onLCP(report);
    onINP(report);
    onCLS(report);
  } catch {
    vitalsStarted = false;
  }
}
export function Analytics() {
  const pathname = usePathname() || "/";
  const [mode, setMode] = useState<MetricsMode>("off");
  const page = useRef(pathname);
  page.current = pathname;
  useEffect(() => {
    const sync = () => setMode(readMetricsMode());
    const storage = (event: StorageEvent) => {
      if (!event.key || event.key === METRICS_PREFERENCE) {
        sync();
      }
    };
    sync();
    addEventListener(METRICS_CHANGE, sync);
    addEventListener("storage", storage);
    return () => {
      removeEventListener(METRICS_CHANGE, sync);
      removeEventListener("storage", storage);
    };
  }, []);
  useEffect(() => {
    if (mode === "off") {
      return;
    }
    void startVitals();
    const seen = new Set<string>();
    const chapter = (event: Event) => {
      const name = (event as CustomEvent).detail;
      if (
        typeof name !== "string" ||
        !metricNames.includes(name as MetricName) ||
        seen.has(name)
      ) {
        return;
      }
      seen.add(name);
      recordMetric(name as MetricName, 1, page.current);
    };
    const click = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!link) {
        return;
      }
      const url = new URL(link.href, location.href);
      if (["mailto:", "tel:"].includes(url.protocol)) {
        recordMetric("contact_link", 1, page.current);
      } else if (url.hostname === "github.com") {
        recordMetric("repository_link", 1, page.current);
      }
    };
    document.addEventListener("dimasc:room-chapter", chapter);
    document.addEventListener("click", click, { passive: true });
    return () => {
      document.removeEventListener("dimasc:room-chapter", chapter);
      document.removeEventListener("click", click);
    };
  }, [mode, pathname]);
  useEffect(() => {
    if (mode !== "off") {
      recordMetric("page_view", 1, pathname);
    }
  }, [mode, pathname]);
  return null;
}
