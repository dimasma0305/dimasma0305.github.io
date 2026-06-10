"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/* One tiled star field: 8 small + 4 large dots, each list tiled at its own
   size so no grid pattern reads. Single element = single GPU texture. */
const STARS = [
  "radial-gradient(1px 1px at 12px 34px, hsl(0 0% 100% / 0.95), transparent)",
  "radial-gradient(1px 1px at 78px 110px, hsl(0 0% 100% / 0.7), transparent)",
  "radial-gradient(1px 1px at 145px 56px, hsl(0 0% 100% / 0.85), transparent)",
  "radial-gradient(1px 1px at 190px 150px, hsl(0 0% 100% / 0.65), transparent)",
  "radial-gradient(1px 1px at 55px 180px, hsl(0 0% 100% / 0.8), transparent)",
  "radial-gradient(1px 1px at 160px 205px, hsl(0 0% 100% / 0.6), transparent)",
  "radial-gradient(1px 1px at 102px 8px, hsl(0 0% 100% / 0.75), transparent)",
  "radial-gradient(1px 1px at 25px 130px, hsl(0 0% 100% / 0.55), transparent)",
  "radial-gradient(1.5px 1.5px at 40px 60px, hsl(210 60% 92%), transparent)",
  "radial-gradient(1.5px 1.5px at 210px 140px, hsl(210 60% 92% / 0.85), transparent)",
  "radial-gradient(2px 2px at 130px 240px, hsl(45 80% 90% / 0.95), transparent)",
  "radial-gradient(1.5px 1.5px at 280px 40px, hsl(210 60% 92% / 0.75), transparent)",
].join(",");

const STARS_TILE = [
  ...Array(8).fill("220px 230px"),
  ...Array(4).fill("300px 320px"),
].join(",");

/**
 * Fixed background sky that travels through a full day as the page scrolls:
 * sunrise at the top of the page, a bright midday around a third of the way
 * down, a warm dusk as the sun dives behind the mountain ridge, then deep
 * night with twinkling stars, a moon, the odd shooting star, and fireflies
 * over the hills.
 *
 * Driven by a single `--sky` custom property (0 = morning … 1 = night):
 * - The night sky + milky way are the root's STATIC background (rastered
 *   once). Only three viewport gradients (morning / midday / dusk) fade over
 *   it, each promoted with will-change so per-frame work is pure compositing
 *   — no layout, no paint, no React re-renders.
 * - `--sky` eases toward the scroll position with time-based exponential
 *   decay (frame-rate independent), and the per-frame step is capped so a
 *   smooth-scrolled anchor jump plays as a graceful time-lapse rather than a
 *   sub-second sweep. The rAF loop stops once converged.
 * - A data-sky-phase attribute pauses + hides whichever ambient animations
 *   (clouds/birds by day, stars/fireflies by night) are invisible at the
 *   current phase, so the compositor isn't ticking transparent layers.
 * - prefers-reduced-motion is read live each tick: the crossfade (which
 *   strictly tracks scroll position) applies directly with no easing drift,
 *   translations are disabled via motion-reduce:!transform-none, and the
 *   global reduced-motion CSS kills the ambient keyframes.
 * - Below lg the bright sun/moon discs are replaced by low-alpha glows: on
 *   single-column layouts text scrolls right through that region, and a
 *   near-opaque disc behind body text fails WCAG contrast.
 */
export function ScrollSky() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let target = 0;
    let current = -1; // sentinel: force the first write
    let last = 0;
    let phase = "";

    const apply = () => {
      el.style.setProperty("--sky", current.toFixed(4));
      // Both ambient groups are at clamped opacity 0 around 0.57, so the
      // pause/hide flip is never visible.
      const p = current < 0.57 ? "day" : "night";
      if (p !== phase) {
        phase = p;
        el.dataset.skyPhase = p;
      }
    };

    const readTarget = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Reach full night a little before the absolute bottom of the page.
      const raw = max > 0 ? window.scrollY / (max * 0.85) : 0;
      target = Math.min(1, Math.max(0, raw));
    };

    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
      last = now;
      let next: number;
      if (mq.matches) {
        next = target;
      } else {
        // k = 9/s matches a 0.14-per-frame feel at 60Hz on any refresh rate.
        let step = (target - current) * (1 - Math.exp(-9 * dt));
        // Cap the rate so multi-viewport anchor jumps (html has
        // scroll-behavior: smooth) become a ~1.5s day→night time-lapse;
        // ordinary wheel/touch deltas sit far below the cap.
        const cap = 0.75 * dt;
        step = Math.max(-cap, Math.min(cap, step));
        next = current + step;
      }
      current = Math.abs(next - target) < 0.0005 ? target : next;
      apply();
      if (current !== target) frame = requestAnimationFrame(tick);
    };

    const schedule = () => {
      readTarget();
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    // Lazy sections / posts change the document height without any scroll
    // event — re-derive the target when that happens.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);

    // First paint: jump straight to the scroll position, no glide-in.
    readTarget();
    current = target;
    apply();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-sky-phase="day"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={
        {
          "--sky": 0,
          // Static base: the night sky with a faint milky-way band baked in.
          // Rastered once; the day phases fade over it.
          background:
            "linear-gradient(115deg, transparent 30%, hsl(218 70% 75% / 0.09) 45%, hsl(0 0% 100% / 0.065) 50%, hsl(218 70% 75% / 0.09) 55%, transparent 70%), linear-gradient(to bottom, hsl(232 50% 3%) 0%, hsl(227 40% 5%) 55%, hsl(222 40% 6%) 100%)",
        } as CSSProperties
      }
    >
      {/* Day-phase gradients, stacked bottom→top: dusk, midday, morning.
          Each fades out to reveal the one beneath; the gates overlap so the
          night base never bleeds through mid-transition. */}
      <div
        className="absolute inset-0"
        style={{
          opacity:
            "min(calc((var(--sky) - 0.45) * 6), calc((1 - var(--sky)) * 3.4))",
          willChange: "opacity",
          background:
            "linear-gradient(to bottom, hsl(256 34% 9%) 0%, hsl(242 30% 8%) 50%, hsl(22 50% 13%) 88%, hsl(28 60% 17%) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity:
            "min(calc(var(--sky) * 5), calc((0.72 - var(--sky)) * 4.4))",
          willChange: "opacity",
          background:
            "linear-gradient(to bottom, hsl(212 55% 19%) 0%, hsl(216 48% 12%) 55%, hsl(220 45% 7%) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: "calc(1 - var(--sky) * 2.2)",
          willChange: "opacity",
          background:
            "linear-gradient(to bottom, hsl(214 52% 15%) 0%, hsl(219 45% 10%) 55%, hsl(220 45% 7%) 100%)",
        }}
      />
      {/* Warm dawn band at the horizon — its own layer so it burns off
          before midday (the morning blues above linger longer); a lingering
          warm bottom would read as orange in a midday sky. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[40vh]"
        style={{
          opacity: "calc(1 - var(--sky) * 3.2)",
          willChange: "opacity",
          background:
            "linear-gradient(to top, hsl(24 45% 13% / 0.85), transparent 70%)",
        }}
      />

      {/* Sun for single-column layouts: a soft low-alpha glow only — a bright
          disc would sit behind full-width body text and break contrast. */}
      <div
        className="absolute right-[4%] top-[6%] h-44 w-44 rounded-full lg:hidden"
        style={{
          opacity: "calc(1.2 - var(--sky) * 2)",
          willChange: "opacity",
          background:
            "radial-gradient(circle, hsl(40 90% 62% / 0.16), transparent 70%)",
        }}
      />

      {/* Sun (lg+) — travels a true circular arc (a wheel 100vh tall,
          squeezed to <=62vh wide so it fits widescreens), parameterized by
          the wheel angle 60° → −98°: it rises low in the east hugging the
          right screen edge (the gutter beside the hero card — the one spot a
          low morning sun isn't occluded), peaks just right of center at
          midday, then descends left and slips behind the mountain ridge at
          dusk, staying bright so the occlusion reads as a real sunset.
          The anchor (= the noon apex) has a px floor so the disc clears the
          fixed header on short laptops (the header is opaque by midday
          scroll, so its glow can't wash the nav links); the x amplitude is
          capped by vw so portrait monitors can't push the path off-screen. */}
      <div
        className="hidden lg:block absolute left-[64%] top-[max(14vh,132px)] motion-reduce:!transform-none"
        style={{
          opacity: "calc((0.84 - var(--sky)) * 9)",
          transform:
            "translate3d(calc(sin(60deg - var(--sky) * 158deg) * min(62vh, 58vw)), calc((1 - cos(60deg - var(--sky) * 158deg)) * 100vh), 0)",
        }}
      >
        <div
          className="h-24 w-24 -ml-12 -mt-12 rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(42 95% 72% / 0.95) 0%, hsl(38 90% 62% / 0.85) 70%)",
            boxShadow:
              "0 0 50px 24px hsl(40 90% 60% / 0.30), 0 0 90px 45px hsl(35 85% 55% / 0.12)",
          }}
        />
      </div>

      {/* Stars — one merged field; fade in as dusk burns out, drifting down
          and wheeling slightly like the night sky turning. Oversized so the
          rotation never exposes corners. The inner layer twinkles (paused
          while invisible). */}
      <div
        className="absolute inset-[-8%] motion-reduce:!transform-none"
        style={{
          opacity: "calc(var(--sky) * 3.6 - 2.6)",
          transform:
            "translate3d(0, calc((1 - var(--sky)) * 8vh), 0) rotate(calc((1 - var(--sky)) * 5deg))",
        }}
      >
        <div
          className="sky-night-anim h-full w-full"
          style={{
            backgroundImage: STARS,
            backgroundSize: STARS_TILE,
            animation: "sky-twinkle 5.5s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* A shooting star streaks by every ~22s, deep into the night.
          Base opacity 0 so reduced-motion users never see a frozen streak. */}
      <div
        className="absolute right-[18%] top-[16%]"
        style={{ opacity: "calc(var(--sky) * 3 - 2.4)" }}
      >
        <div
          className="sky-night-anim"
          style={{
            animation: "sky-shooting-star 22s linear infinite",
            opacity: 0,
          }}
        >
          <div
            className="h-0.5 w-24 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.9))",
              transform: "rotate(145deg)",
            }}
          />
        </div>
      </div>

      {/* Morning birds in the open sky band above the hero content,
          making one slow forward pass. No text-free slot below sm. */}
      <div
        className="hidden sm:block absolute left-[40%] top-[8%]"
        style={{ opacity: "calc(0.8 - var(--sky) * 1.7)" }}
      >
        <svg
          width="64"
          height="28"
          viewBox="0 0 64 28"
          fill="none"
          className="sky-day-anim"
          style={{ animation: "sky-birds 30s linear infinite" }}
        >
          <path
            d="M2 10 Q6 4 10 10 Q14 4 18 10"
            stroke="hsl(214 35% 72% / 0.55)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M30 20 Q33 15 36 20 Q39 15 42 20"
            stroke="hsl(214 35% 72% / 0.45)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M48 6 Q51 1 54 6 Q57 1 60 6"
            stroke="hsl(214 35% 72% / 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Daytime clouds — drift idly, then slide away as dusk falls */}
      <div
        className="absolute left-[14%] top-[24%] h-16 w-64 sm:h-24 sm:w-[26rem] motion-reduce:!transform-none"
        style={{
          opacity: "calc(1.15 - var(--sky) * 2.1)",
          transform:
            "translate3d(calc(var(--sky) * -10vw), calc(var(--sky) * 22vh), 0)",
        }}
      >
        <div
          className="sky-day-anim sky-cloud-a h-full w-full rounded-full"
          style={{
            animation: "sky-cloud-drift 26s ease-in-out infinite alternate",
          }}
        />
      </div>
      <div
        className="absolute right-[20%] top-[38%] h-14 w-48 sm:h-20 sm:w-[20rem] motion-reduce:!transform-none"
        style={{
          opacity: "calc(1 - var(--sky) * 2)",
          transform:
            "translate3d(calc(var(--sky) * 8vw), calc(var(--sky) * 16vh), 0)",
        }}
      >
        <div
          className="sky-day-anim sky-cloud-b h-full w-full rounded-full"
          style={{
            animation:
              "sky-cloud-drift 34s ease-in-out infinite alternate-reverse",
          }}
        />
      </div>

      {/* Moon for single-column layouts: a cool glow, same contrast logic
          as the mobile sun. */}
      <div
        className="absolute left-[6%] top-[8%] h-36 w-36 rounded-full lg:hidden"
        style={{
          opacity: "calc(var(--sky) * 4 - 3)",
          willChange: "opacity",
          background:
            "radial-gradient(circle, hsl(210 65% 80% / 0.14), transparent 70%)",
        }}
      />

      {/* Moon (lg+) — climbs the same kind of circular track the sun rode,
          from lower-right of its apex up to top-left as night settles in */}
      {/* px floor so the disc never tucks behind the fixed 64px header */}
      <div
        className="hidden lg:block absolute left-[4%] top-[max(13vh,120px)] motion-reduce:!transform-none"
        style={{
          opacity: "calc(var(--sky) * 4 - 3)",
          transform:
            "translate3d(calc(sin((1 - var(--sky)) * 90deg) * min(62vh, 58vw)), calc((1 - cos((1 - var(--sky)) * 90deg)) * 100vh), 0)",
        }}
      >
        <div
          className="h-16 w-16 -ml-8 -mt-8 rounded-full"
          style={{
            background: "hsl(210 40% 93%)",
            boxShadow:
              "inset -9px -6px 0 2px hsl(212 32% 82%), 0 0 36px 14px hsl(210 70% 82% / 0.28), 0 0 70px 35px hsl(215 80% 70% / 0.10)",
          }}
        />
      </div>

      {/* Horizon, back to front: a shaded mountain ridge, then two rolling
          hills. The nearer a layer, the more it eases down as night falls. */}
      <svg
        className="absolute bottom-0 left-0 h-[20vh] w-full motion-reduce:!transform-none"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        style={{ transform: "translate3d(0, calc(var(--sky) * 1vh), 0)" }}
      >
        <defs>
          <linearGradient id="sky-mtn-shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(217 28% 16%)" />
            <stop offset="100%" stopColor="hsl(220 32% 9%)" />
          </linearGradient>
        </defs>
        <path
          d="M0,240 L0,150 L120,90 L210,140 L330,52 L450,128 L560,84 L690,150 L810,60 L930,130 L1040,96 L1170,156 L1290,86 L1380,128 L1440,108 L1440,240 Z"
          fill="url(#sky-mtn-shade)"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 h-[14vh] w-full motion-reduce:!transform-none"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        style={{ transform: "translate3d(0, calc(var(--sky) * 2.5vh), 0)" }}
      >
        <path
          d="M0,120 C240,60 480,140 720,100 C960,60 1200,130 1440,90 L1440,200 L0,200 Z"
          fill="hsl(220 32% 8%)"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 h-[10vh] w-full motion-reduce:!transform-none"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        style={{ transform: "translate3d(0, calc(var(--sky) * 4vh), 0)" }}
      >
        <path
          d="M0,150 C200,110 420,170 700,140 C980,110 1200,170 1440,130 L1440,200 L0,200 Z"
          fill="hsl(223 35% 4.5%)"
        />
      </svg>

      {/* Fireflies hovering over the front hill at night */}
      <div
        className="absolute bottom-[7vh] left-[14%] h-10 w-56"
        style={{ opacity: "calc(var(--sky) * 2.5 - 1.5)" }}
      >
        <div
          className="sky-night-anim h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(3px 3px at 12px 30px, hsl(45 95% 70% / 0.95), hsl(45 95% 65% / 0.3) 60%, transparent), radial-gradient(2px 2px at 74px 10px, hsl(45 95% 70% / 0.7), transparent), radial-gradient(3px 3px at 138px 22px, hsl(45 95% 70% / 0.85), hsl(45 95% 65% / 0.25) 60%, transparent), radial-gradient(2px 2px at 196px 14px, hsl(45 95% 70% / 0.75), transparent), radial-gradient(2.5px 2.5px at 226px 28px, hsl(45 95% 70% / 0.8), transparent)",
            animation: "sky-twinkle 3.4s ease-in-out infinite alternate",
          }}
        />
      </div>
    </div>
  );
}
