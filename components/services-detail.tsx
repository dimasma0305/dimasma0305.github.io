import Link from "next/link";
import {
  Sparkles,
  Check,
  FileText,
  FileCode2,
  MessageCircle,
  Lock,
  Send,
  ScanSearch,
  FileCheck2,
} from "lucide-react";
import { CodeDiffDemo } from "@/components/code-diff-demo";
import { withBasePath } from "@/lib/utils";

// Downloadable sample so clients see the exact deliverable before they buy.
const SAMPLE_PDF = withBasePath(
  "/sample-report/source-code-pentest-sample-report.pdf",
);
const SAMPLE_MD = withBasePath(
  "/sample-report/source-code-pentest-sample-report.md",
);

// Contact endpoints for the "Start a review" CTA.
const WHATSAPP_URL = "https://wa.me/6285967149226";
const DISCORD_URL = "https://discord.com/users/663394727688798231";

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
  "An AI agent reviews your whole codebase, fast",
  "Potential vulnerabilities surfaced, with the exploitable ones flagged",
  "Dynamic checks that the program runs and works correctly",
  "A suggested, ready-to-merge fix for each finding",
  "Reports written in plain words you can act on",
];

const steps = [
  {
    icon: Send,
    title: "1. Share your code",
    text: "Send a private GitHub or GitLab invite, or just zip it up and email it over. NDA on request.",
  },
  {
    icon: ScanSearch,
    title: "2. Review and run",
    text: "An AI agent reviews your codebase for potential vulnerabilities, and I run the program to check it behaves correctly. I triage the results and flag the ones that are actually exploitable.",
  },
  {
    icon: FileCheck2,
    title: "3. Report and fixes",
    text: "You get a plain-English report in PDF and Markdown, with a suggested fix for every finding.",
  },
];

const included = [
  "Your whole codebase reviewed by an AI agent",
  "Potential vulnerabilities surfaced, with the genuinely exploitable ones flagged",
  "Dynamic checks that the program runs and works correctly",
  "A suggested, ready-to-merge fix for each finding",
  "One free re-test after you apply the fixes",
];

const limits = [
  "Static code review plus dynamic checks that the program runs correctly",
  "No live production or infrastructure penetration testing",
  "Languages: JavaScript and TypeScript, Python, PHP, Go, and most web backends",
  "Turnaround is usually 1 to 2 days when I'm not busy",
  "Patches are provided as-is, so test before you deploy",
];

const faqs = [
  {
    q: "Is this just an automated scanner?",
    a: "It is AI-driven, but I triage every finding by hand and tell you which are actually exploitable, which are only potential, and which are just hardening. You get a reviewed report, not a raw tool dump.",
  },
  {
    q: "What if you don't find anything?",
    a: "You still get a report of everything the review checked, plus hardening notes. I won't pad it with findings that are not real.",
  },
  {
    q: "Which languages do you cover?",
    a: "JavaScript and TypeScript, Python, PHP, Go, and most web backends. Ask if yours is not listed.",
  },
  {
    q: "How do I send my code?",
    a: "A private GitHub or GitLab invite works best, but a plain zip over email is fine too. Whatever is easiest for you.",
  },
  {
    q: "How does payment work?",
    a: "We agree on the scope and price first, then you pay by bank transfer or your preferred method before I start.",
  },
];

/**
 * Full details for the Source Code Pentest service. Lives on the dedicated
 * /services page; the homepage shows only a compact teaser that links here.
 */
export function ServicesDetail() {
  return (
    <>
      {/* Pitch + live demo */}
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(217_91%_72%)]">
            <Sparkles className="w-3.5 h-3.5" />
            AI-automated review
          </span>

          <p className="mt-4 text-sm text-muted-foreground">
            By Dimas Maulana, CTF player and security researcher.
          </p>

          <p className="mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">
            An AI agent reviews your whole codebase for potential
            vulnerabilities. I triage what it finds, flag the ones that are
            actually exploitable, and send back suggested fixes. I also run the
            program to confirm it works correctly and that the fixes don&apos;t
            break anything, so you don&apos;t just get a list, you get patches you
            can merge with confidence.
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

          <div className="mt-7">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm text-muted-foreground">Starting at</span>
              <span className="text-3xl font-bold tracking-tight">$99</span>
            </div>
            <p className="mt-1 text-muted-foreground">
              about Rp 1.780.000
              <span className="ml-2 text-sm">
                · per project, scoped to your codebase size
              </span>
            </p>
          </div>

          <div className="mt-7">
            <p className="text-sm font-medium">
              Every project ships as a full report, in Markdown and PDF:
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={SAMPLE_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-primary/50 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10"
              >
                <FileText className="h-4 w-4" />
                Sample report (PDF)
              </Link>
              <Link
                href={SAMPLE_MD}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                <FileCode2 className="h-4 w-4" />
                Sample report (Markdown)
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <CodeDiffDemo />
          <p className="text-center text-xs text-muted-foreground">
            Real findings from a scan of this very site, already patched.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="p-6 rounded-lg glass-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* What's included + scope/limits */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-2xl glass-panel">
          <h2 className="font-semibold">What you get</h2>
          <ul className="mt-4 space-y-2.5">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 rounded-2xl glass-panel">
          <h2 className="font-semibold">Scope and limits</h2>
          <ul className="mt-4 space-y-2.5">
            {limits.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/50" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Confidentiality */}
      <div className="mt-6 flex items-start gap-4 rounded-2xl glass-card p-6">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Your code stays private</h2>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            I review your code in an isolated workspace, never share it, and
            delete it after delivery on request. NDA available on request, and
            you can send your code however is easiest, a repo invite or a zip
            over email.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold">Questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-lg glass-card px-5 py-4 [&_summary]:cursor-pointer"
            >
              <summary className="flex items-center justify-between gap-4 font-medium list-none">
                {faq.q}
                <span
                  aria-hidden="true"
                  className="text-primary transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <h2 className="text-xl font-semibold">Start a review</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Message me to scope your project, then share your code however is
          easiest, a repo invite or a zip over email.
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
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
    </>
  );
}
