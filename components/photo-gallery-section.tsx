"use client";

import portfolio from "@/lib/portfolio-data.json";
import { SectionHeader } from "@/components/section-header";

// Photos are hot-linked from Google Drive via the lh3 user-content CDN, which
// serves a resized copy when you append a size hint (=w1200 / =w800) — so we
// never pull the multi-MB originals. They stay live as long as the source
// folder remains shared. gd() builds the URL from a Drive file id.
const gd = (id: string, w: number) =>
  `https://lh3.googleusercontent.com/d/${id}=w${w}`;

// The headline events get a feature card each; the strip below mixes action
// shots from across them.
const FEATURES = portfolio.photos.slice(0, 3);

const STRIP = portfolio.photos.slice(3);

export function PhotoGallerySection() {
  return (
    <section
      id="moments"
      className="container px-4 section-y mx-auto max-w-7xl scroll-mt-20"
    >
      <SectionHeader
        index="04"
        eyebrow="In person"
        title="On the CTF Floor"
        subtitle="Moments from international CTF finals with Project Sekai, across Bali, Vietnam, and China."
      />

      {/* Headline events: one card each, balanced 3-up from tablet width */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
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
