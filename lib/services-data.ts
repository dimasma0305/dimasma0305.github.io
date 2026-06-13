// Single source of truth for the Services FAQ. Used both by the visible FAQ on
// /services (components/services-detail.tsx) and by the FAQPage JSON-LD
// (components/seo.tsx ServicesStructuredData), so the two never drift apart —
// Google flags a mismatch between visible content and FAQ structured data.
export const faqs = [
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
