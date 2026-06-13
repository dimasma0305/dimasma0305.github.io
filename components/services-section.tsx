"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { CodeDiffDemo } from "@/components/code-diff-demo";

// Compact teaser on the (CV-focused) homepage. Full details live on /services.
const highlights = [
  "Real, exploitable bugs, not scanner noise",
  "Ready-to-merge fixes, not just a list",
  "Plain-English report in PDF and Markdown",
];

export function ServicesSection() {
  return (
    <div
      className="container px-4 section-y mx-auto max-w-7xl scroll-mt-20"
      id="services"
    >
      <SectionHeader
        eyebrow="Services"
        title="Source Code Security Review"
        subtitle="I find the security bugs hiding in your code, then hand you back working fixes."
        action={
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-md border border-primary/50 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10"
          >
            See details & pricing
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm text-muted-foreground">Starting at</span>
            <span className="text-3xl font-bold tracking-tight">$99</span>
            <span className="text-sm text-muted-foreground">
              per project
            </span>
          </div>

          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View service details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          <CodeDiffDemo />
          <p className="text-center text-xs text-muted-foreground">
            Real findings from a scan of this very site, already patched.
          </p>
        </div>
      </div>
    </div>
  );
}
