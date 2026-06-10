"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Lightweight scroll parallax: the content lags behind the page by `speed`
 * (a 0–1 fraction of the scroll delta), which reads as gentle depth.
 * 0.1 is barely-there; 0.3 is a clearly "background" layer.
 *
 * Kept cheap on purpose:
 * - the getBoundingClientRect read happens in the scroll listener, where the
 *   document is still style/layout-clean (scroll events fire before the same
 *   frame's rAF writes), so it forces no flush; the rAF callback is
 *   write-only — one compositor-friendly transform, no React re-renders
 * - IntersectionObserver pauses all work while off-screen
 * - prefers-reduced-motion is honored live: toggling the OS setting clears
 *   the transform immediately, no reload needed
 */
export function Parallax({
  speed = 0.15,
  className,
  children,
}: {
  speed?: number;
  className?: string;
  children: ReactNode;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let inView = true;
    let offset = 0;

    // Offset of the element's center from the viewport's center; measured
    // on the untransformed outer so the value never feeds back on itself.
    const measure = () => {
      const rect = outer.getBoundingClientRect();
      offset = rect.top + rect.height / 2 - window.innerHeight / 2;
    };

    const update = () => {
      frame = 0;
      if (mq.matches) {
        inner.style.transform = "";
        return;
      }
      inner.style.transform = `translate3d(0, ${(offset * -speed).toFixed(1)}px, 0)`;
    };

    const schedule = () => {
      measure();
      if (inView && !frame) frame = requestAnimationFrame(update);
    };

    // On toggle, run unconditionally (even off-screen) so a stale transform
    // is cleared the moment the user opts out of motion.
    const onMotionChange = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Only the newest record reflects current visibility.
        inView = entries[entries.length - 1].isIntersecting;
        schedule();
      },
      // Generous margin so the element never pops when entering the viewport.
      { rootMargin: "25% 0px" },
    );
    observer.observe(outer);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    mq.addEventListener("change", onMotionChange);
    measure();
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mq.removeEventListener("change", onMotionChange);
      if (frame) cancelAnimationFrame(frame);
      inner.style.transform = "";
    };
  }, [speed]);

  return (
    <div ref={outerRef} className={className}>
      <div
        ref={innerRef}
        className="h-full w-full motion-safe:will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
