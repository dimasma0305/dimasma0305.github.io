"use client";

import Link from "next/link";
import { Sparkles, MessageCircle, Check } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { CodeDiffDemo } from "@/components/code-diff-demo";

// Contact endpoints for the "Work with me" CTA.
const WHATSAPP_URL = "https://wa.me/6285967149226";
// TODO: replace with your numeric Discord user ID (Settings → Advanced → enable
// Developer Mode, then right-click your name → Copy User ID).
const DISCORD_USER_ID = "YOUR_DISCORD_ID";
const DISCORD_URL = `https://discord.com/users/${DISCORD_USER_ID}`;

// lucide-react has no Discord glyph, so inline the brand mark.
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.2a.074.074 0 0 0-.079.037c-.34.6-.717 1.385-.98 2.003a18.27 18.27 0 0 0-5.005 0 12.6 12.6 0 0 0-.997-2.003.077.077 0 0 0-.078-.037A19.74 19.74 0 0 0 5.66 4.369a.07.07 0 0 0-.032.027C2.273 9.36 1.36 14.214 1.81 19.006a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127c-.598.349-1.22.645-1.873.891a.076.076 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.539-.838-10.353-3.549-14.61a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}

const features = [
  "I read through every line of your code",
  "I find the bugs that can actually be exploited",
  "You get working fixes, not just a list of problems",
  "Reports written in plain words you can act on",
];

export function ServicesSection() {
  return (
    <div
      className="container px-4 section-y mx-auto max-w-7xl scroll-mt-20"
      id="services"
    >
      <SectionHeader
        eyebrow="Services"
        title="What I Do"
        subtitle="I find the security bugs hiding in your code, then fix them for you."
      />

      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Left: the pitch */}
        <div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(217_91%_72%)]">
            <Sparkles className="w-3.5 h-3.5" />
            AI-powered
          </span>

          <h3 className="mt-4 text-2xl font-semibold sm:text-3xl">
            Source Code Pentest
          </h3>

          <p className="mt-3 max-w-xl text-lg text-muted-foreground leading-relaxed">
            I go through your code the way a real attacker would, find the
            security holes, and send you back the fixed code. You don&apos;t just
            get a report, you get fixes that work.
          </p>

          <ul className="mt-6 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: animated before/after diff */}
        <CodeDiffDemo />
      </div>

      <div className="mt-12 flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">Want to work together? Message me on</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-primary/50 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10"
          >
            <DiscordIcon className="w-4 h-4" />
            Discord
          </Link>
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-primary/50 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}
