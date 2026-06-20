"use client";

import { SectionHeader } from "@/components/section-header";

// Photos are hot-linked from Google Drive via the lh3 user-content CDN, which
// serves a resized copy when you append a size hint (=w1200 / =w800) — so we
// never pull the multi-MB originals. They stay live as long as the source
// folder remains shared. gd() builds the URL from a Drive file id.
const gd = (id: string, w: number) =>
  `https://lh3.googleusercontent.com/d/${id}=w${w}`;

// The headline events get a feature card each; the strip below mixes action
// shots from across them.
const FEATURES = [
  {
    id: "1hA9LIS5pdZYTgHrbD5OEUs0AP17hr0pS",
    chip: "SAS CTF 2024",
    caption: "Security Analyst Summit finals in Bali, a 5,000 USD win with Project Sekai.",
    alt: "Project Sekai holding the 5,000 USD prize check at the Security Analyst Summit CTF 2024 finals in Bali",
  },
  {
    id: "1OeGxOhCW3sB7tlv73Fdi5d6nYNfeNCSj",
    chip: "XCTF 2025",
    caption: "9th XCTF International Invitational in China, representing Project Sekai.",
    alt: "Project Sekai with their banner at the 9th XCTF International Invitational in China",
  },
  {
    id: "1ILzurxhpI4Q-gkg7z2oLGXt7s6KTJvm3",
    chip: "ISITDTU CTF 2024",
    caption:
      "ISITDTU CTF 2024 finals in Vietnam, second place in Attack & Defense with Project Sekai.",
    alt: "Project Sekai at the ISITDTU CTF 2024 finals (Attack & Defense) in Vietnam, second place",
  },
];

const STRIP = [
  {
    id: "1rCV1eBT0EOF0Nay1BDw4Jo_74JwZ07nu",
    alt: "Competing at the SAS CTF 2024 finals in Bali",
  },
  {
    id: "1sT4icN3lqZSl0HUHRexTWyBEnovJ4uci",
    alt: "Heads-down during the XCTF Invitational in China",
  },
  {
    id: "1NX2PnjiLI6_QFU03wr8T5BsOWoYLWN7C",
    alt: "At the Security Analyst Summit 2024 venue in Bali",
  },
  {
    id: "1GHGgcsIuu7NIsQlDl6N6WF3J5rtXsh48",
    alt: "With teammates at the XCTF Invitational in China",
  },
];

export function PhotoGallerySection() {
  return (
    <section
      id="moments"
      className="container px-4 section-y mx-auto max-w-7xl scroll-mt-20"
    >
      <SectionHeader
        eyebrow="In person"
        title="On the CTF Floor"
        subtitle="Moments from international CTF finals with Project Sekai, across Bali, Vietnam, and China."
      />

      {/* Two headline events */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {FEATURES.map((f) => (
          <figure key={f.id} className="space-y-3">
            <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-[var(--elevation-2)]">
              <img
                src={gd(f.id, 1200)}
                alt={f.alt}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:scale-[1.04]"
              />
              <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-[var(--elevation-1)]">
                {f.chip}
              </span>
            </div>
            <figcaption className="text-sm text-muted-foreground">
              {f.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Mixed action strip from both events */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-4">
        {STRIP.map((photo) => (
          <figure
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted transition-[border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:border-primary/40 hover:shadow-[var(--elevation-2)]"
          >
            <img
              src={gd(photo.id, 800)}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:scale-105"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
