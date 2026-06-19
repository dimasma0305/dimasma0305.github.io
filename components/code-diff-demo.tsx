"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  FileWarning,
  Globe,
} from "lucide-react";

type Line = {
  /** " " context · "-" removed (the problem) · "+" added (the AI fix) */
  sign: " " | "-" | "+";
  text: string;
};

type Pill = { label: string; icon: LucideIcon };

type Example = {
  file: string;
  /** Pill shown before the fix; tone tints it red (security) or amber (else). */
  bad: Pill & { tone: "red" | "amber" };
  good: Pill;
  caption: string;
  lines: Line[];
};

// These are REAL findings from an AI scan of this very portfolio, each with the
// fix that was applied. Distilled from the security report for display.
const examples: Example[] = [
  {
    file: "components/seo.tsx",
    bad: { label: "Stored XSS · High", icon: ShieldAlert, tone: "red" },
    good: { label: "Fixed by AI", icon: ShieldCheck },
    caption:
      "A blog title from Notion could break out of the JSON-LD script tag and run code. Now the output is escaped.",
    lines: [
      { sign: " ", text: '<script type="application/ld+json"' },
      { sign: "-", text: "  dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}" },
      { sign: "+", text: "  dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}" },
      { sign: " ", text: "/>" },
      { sign: " ", text: "// safeJsonLd escapes < > & so a title can't" },
      { sign: " ", text: "// close the tag and inject its own <script>" },
    ],
  },
  {
    file: "scripts/generate-blog-content.js",
    bad: { label: "Path traversal · High", icon: FileWarning, tone: "red" },
    good: { label: "Fixed by AI", icon: ShieldCheck },
    caption:
      "The saved image name came from a response header an attacker sets, so it could write files outside the posts folder. Locked to an allowlist.",
    lines: [
      { sign: " ", text: "let ext = contentType.split('/')[1]  // attacker-set header" },
      { sign: "-", text: "save(`${slug}.${ext}`)   // ext = '../../etc/passwd'" },
      { sign: "+", text: "const ok = ['jpg','png','gif','webp','svg']" },
      { sign: "+", text: "if (!ok.includes(ext)) ext = ''" },
      { sign: "+", text: "save(`${slug}.${ext}`)" },
    ],
  },
  {
    file: "lib/notion-content-utils.ts",
    bad: { label: "Stored XSS · Med", icon: ShieldAlert, tone: "amber" },
    good: { label: "Fixed by AI", icon: Wrench },
    caption:
      "sanitizeUrl handed back the raw URL, so a crafted link could break out of an HTML attribute. Now it returns the encoded href.",
    lines: [
      { sign: " ", text: "if (['http:','https:'].includes(parsedUrl.protocol)) {" },
      { sign: "-", text: "  return url          // raw, breaks out of src=\"...\"" },
      { sign: "+", text: "  return parsedUrl.href // percent-encodes \" < >" },
      { sign: " ", text: "}" },
    ],
  },
  {
    file: "scripts/generate-blog-content.js",
    bad: { label: "SSRF · Med", icon: Globe, tone: "amber" },
    good: { label: "Fixed by AI", icon: ShieldCheck },
    caption:
      "Build-time image fetches followed any URL, even internal ones. Added an https-only host allowlist and blocked private IPs.",
    lines: [
      { sign: " ", text: "const url = new URL(urlString)" },
      { sign: "-", text: "const client = url.protocol === 'https:' ? https : http" },
      { sign: "+", text: "assertAllowedDownloadUrl(url)  // https + host allowlist" },
      { sign: "+", text: "const client = https           // no private IPs" },
      { sign: " ", text: "client.get(url, handleResponse)" },
    ],
  },
];

// Each example shows for one full animation cycle, then the next rotates in.
const CYCLE_MS = 5500;

function lineClass(sign: Line["sign"]) {
  if (sign === "-")
    return "bg-red-500/10 text-red-200/90 [animation:diff-removed-out_5.5s_ease-in-out_infinite_both]";
  if (sign === "+")
    return "bg-emerald-500/10 text-emerald-200/95 [animation:diff-added-in_5.5s_ease-in-out_infinite_both]";
  return "text-muted-foreground";
}

function badPillClass(tone: "red" | "amber") {
  return tone === "red"
    ? "border-red-500/30 bg-red-500/10 text-red-300"
    : "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

/**
 * Animated "before / after AI" code diff that rotates through a security bug, a
 * logic bug, and a performance bug. The red/green diff is real and fully legible
 * at rest; the looping animation (scan sweep, fix reveal, status pill) dramatizes
 * the AI applying each fix. Decorative, so hidden from the a11y tree.
 *
 * Honors prefers-reduced-motion: no auto-rotation, and every keyframe ends on the
 * resolved "fixed" frame, so the reset lands on a sensible static state.
 */
export function CodeDiffDemo() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % examples.length),
      CYCLE_MS,
    );
    return () => clearInterval(id);
  }, []);

  const example = examples[index];
  const BadIcon = example.bad.icon;
  const GoodIcon = example.good.icon;

  return (
    <div
      className="relative overflow-hidden rounded-xl glass-card shadow-xl"
      aria-hidden="true"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border/50 bg-card/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          {example.file}
        </span>

        {/* Status pill: cross-fades problem → fixed, settling on "fixed" */}
        <span className="relative ml-auto grid h-6 place-items-center">
          <span
            className={`col-start-1 row-start-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold [animation:diff-status-vuln_5.5s_ease-in-out_infinite_both] ${badPillClass(
              example.bad.tone,
            )}`}
          >
            <BadIcon className="h-3 w-3" />
            {example.bad.label}
          </span>
          <span className="col-start-1 row-start-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 [animation:diff-status-fixed_5.5s_ease-in-out_infinite_both]">
            <GoodIcon className="h-3 w-3" />
            {example.good.label}
          </span>
        </span>
      </div>

      {/* Code body, keyed so the fade + diff animations restart on each swap */}
      <div className="relative">
        {/* AI scan sweep */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-primary/25 to-transparent [animation:diff-scan_5.5s_ease-in-out_infinite_both]" />

        <pre
          key={index}
          className="min-h-[12.5rem] overflow-x-auto p-4 font-mono text-[13px] leading-relaxed [animation:diff-fade-in_0.45s_ease-out]"
        >
          <code className="block">
            {example.lines.map((line, i) => (
              <span
                key={i}
                className={`-mx-4 flex gap-3 px-4 ${lineClass(line.sign)}`}
              >
                <span
                  className={`w-3 flex-shrink-0 select-none ${
                    line.sign === "-"
                      ? "text-red-400"
                      : line.sign === "+"
                        ? "text-emerald-400"
                        : "text-muted-foreground/40"
                  }`}
                >
                  {line.sign === " " ? "" : line.sign}
                </span>
                <span className="whitespace-pre">{line.text}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      {/* Footer: caption + which example is showing */}
      <div className="flex items-center gap-2 border-t border-border/50 bg-card/40 px-4 py-2.5 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-primary-bright" />
        <span className="min-w-0 flex-1">{example.caption}</span>
        <span className="flex flex-shrink-0 gap-1.5">
          {examples.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
