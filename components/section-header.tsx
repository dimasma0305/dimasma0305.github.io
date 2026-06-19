import type React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  /** Small uppercase kicker above the title (accent-colored). */
  eyebrow?: string;
  title: string;
  /** Heading level for the title. Page-level headers should pass "h1". */
  titleAs?: "h1" | "h2";
  subtitle?: React.ReactNode;
  /** Optional right-aligned element (e.g. a "View all" link). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * One consistent section header across the homepage: left-aligned editorial
 * layout (eyebrow → title → subtitle) with an optional trailing action.
 * Keeps heading scale, spacing, and alignment uniform section-to-section.
 */
export function SectionHeader({
  eyebrow,
  title,
  titleAs: TitleTag = "h2",
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow && (
          /* Brighter step of the single blue accent: --primary (60% lightness)
             is 3.8:1 on the midday sky top — below AA for 14px text. 72%
             clears every sky phase and card surface; same hue/chroma, so it
             reads as a lightness ramp, not a second accent. */
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-bright">
            {eyebrow}
          </p>
        )}
        <TitleTag className="section-heading">{title}</TitleTag>
        {subtitle && (
          <p className="max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
