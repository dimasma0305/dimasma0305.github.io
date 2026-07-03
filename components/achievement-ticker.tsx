// Kinetic-type strip of real career records, shown once under the hero.
// Pure CSS animation (see .ticker-track in globals.css): transform-only,
// pauses on hover/focus, and the global reduced-motion block freezes it into
// a static row. The second copy exists only to make the loop seamless, so it
// is aria-hidden; assistive tech reads the list exactly once.
const ITEMS = [
  "170+ validated CVEs",
  "CVE-2025-26909 · CVSS 9.6",
  "#1 CTFtime team in Indonesia",
  "8x first place",
  "20+ podium finishes",
  "$5,000 SAS CTF win",
  "Patchstack Alliance researcher",
  "Project Sekai CTF author",
];

export function AchievementTicker() {
  return (
    <section
      aria-label="Career highlights"
      className="ticker relative overflow-hidden border-y border-border/60 bg-background/60 py-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
    >
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            role="list"
            aria-hidden={copy === 1 || undefined}
            className="flex shrink-0 items-center"
          >
            {ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 whitespace-nowrap px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground sm:px-5 sm:text-sm"
              >
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
                />
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
