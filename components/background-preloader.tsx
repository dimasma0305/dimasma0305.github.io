"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { prefetchDestination, shouldPrefetch } from "@/lib/navigation-prefetch";

/** Prepare the destination on hover, keyboard focus or touch intent, not every
 * visible page at startup. Navigation never waits for this best-effort work. */
export function BackgroundPreloader() {
  const router = useRouter();

  useEffect(() => {
    const seen = new Set<string>();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const connection = () =>
      (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;

    const prepare = (anchor: HTMLAnchorElement) => {
      if (
        !anchor.isConnected ||
        !shouldPrefetch(connection(), document.hidden)
      ) {
        return;
      }
      const target = prefetchDestination(
        anchor.href,
        location.href,
        process.env.NEXT_PUBLIC_BASE_PATH || "",
      );
      if (!target || seen.has(target) || seen.size >= 24) {
        return;
      }
      seen.add(target);
      try {
        router.prefetch(target);
      } catch {
        /* Navigation can still fetch normally. */
      }
      const pathname = target.split("?")[0];
      // Categories/search need JSON caches. The blog archive and article bodies
      // are already statically built; do not download their data twice.
      if (
        /^\/categories(?:\/|$)/.test(pathname) ||
        /^\/search\/?$/.test(pathname)
      ) {
        void import("@/hooks/use-posts")
          .then((m) => m.warmPostsCache())
          .catch(() => {});
      }
      if (/^\/(?:notes|search)\/?$/.test(pathname)) {
        void import("@/hooks/use-notes")
          .then((m) => m.warmNotesCache())
          .catch(() => {});
      }
    };

    const onIntent = (event: Event) => {
      const anchor =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }
      clearTimeout(timer);
      if (event.type === "pointerover") {
        if ((event as PointerEvent).pointerType === "touch") {
          return;
        }
        timer = setTimeout(() => {
          if (anchor.matches(":hover")) {
            prepare(anchor);
          }
        }, 100);
      } else {
        prepare(anchor);
      }
    };

    const events = ["pointerover", "focusin", "pointerdown"];
    events.forEach((event) =>
      document.addEventListener(event, onIntent, { passive: true }),
    );
    return () => {
      clearTimeout(timer);
      events.forEach((event) => document.removeEventListener(event, onIntent));
    };
  }, [router]);

  return null;
}
