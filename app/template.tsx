"use client";

import { usePathname } from "next/navigation";

/**
 * Per-navigation enter transition. `template.tsx` re-mounts on every route
 * change (unlike layout.tsx), so the CSS enter animation replays each time —
 * the new page fades in smoothly instead of snapping, making navigation feel
 * seamless. The progress bar (NavigationLoader) + warmed caches
 * (BackgroundPreloader) mean content is usually ready by the time it fades in.
 *
 * The home route renders a position:fixed ScrollSky; a `transform` on its
 * ancestor would re-anchor that fixed layer and make the sky jump. So home
 * cross-fades (opacity only) while content routes also get a subtle rise.
 * Reduced-motion users get an instant swap via the global reset in globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div key={pathname} className={isHome ? "page-enter-fade" : "page-enter-rise"}>
      {children}
    </div>
  );
}
