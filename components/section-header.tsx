import type React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  /** Small uppercase kicker above the title (accent-colored). */
  eyebrow?: string;
  /** Editorial section index ("01"), rendered in mono before the eyebrow. */
  index?: string;
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
  index,
  title,
  titleAs: TitleTag = "h2",
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "section-header mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      data-heading-level={TitleTag}
    >
      <div className="space-y-2">
        {eyebrow && (
          <p className="section-eyebrow text-sm font-semibold uppercase tracking-widest text-primary-bright">
            {/* Full accent brightness: at reduced opacity this small text
                fails WCAG contrast against the lighter sky phases. */}
            {index && (
              <span className="font-mono font-normal text-primary-bright">
                {index}
                <span aria-hidden className="mx-2">
                  /
                </span>
              </span>
            )}
            {eyebrow}
          </p>
        )}
        <TitleTag className="section-heading">{title}</TitleTag>
        {subtitle && (
          <p className="section-subtitle max-w-2xl text-lg text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="section-action shrink-0">{action}</div>}
    </div>
  );
}
