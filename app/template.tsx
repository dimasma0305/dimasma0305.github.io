"use client";

import { usePathname } from "next/navigation";

/**
 * Per-navigation enter transition. `template.tsx` re-mounts on every route
 * change (unlike layout.tsx), so the CSS enter animation replays each time —
 * the new page fades in smoothly instead of snapping, making navigation feel
 * seamless. The progress bar (NavigationLoader) + warmed caches
 * (BackgroundPreloader) mean content is usually ready by the time it fades in.
 *
 * The home route skips the enter animation entirely. It used to cross-fade
 * (opacity only, to avoid a `transform` re-anchoring the fixed ScrollSky
 * background), but that hit a real compositor bug on home's very tall,
 * content-visibility-heavy layout: the wrapper gets promoted to its own layer
 * for the animation, and content still resolving below the fold at that
 * moment never gets painted after demotion — a permanently blank lower half.
 * Confirmed to disappear once the animation was removed, and to persist with
 * `will-change: opacity` alone. Content routes are shorter and use
 * `page-enter-rise` (transform + opacity, with `will-change`) without issue.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div key={pathname} className={isHome ? "" : "page-enter-rise"}>
      {children}
    </div>
  );
}
