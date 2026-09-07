import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/site-seo";

// Search must remain crawlable so crawlers can read noindex in the static HTML.
// Do not block it in robots.txt or inherit the root's Googlebot index directive.
export const metadata = pageMetadata({
  title: "Search",
  path: "/search/",
  noIndex: true,
  description:
    "Search Dimas Maulana’s projects, research writeups, and field notes on dimasc.tf.",
});

export default function SearchLayout({ children }: { children: ReactNode }) {
  return children;
}
