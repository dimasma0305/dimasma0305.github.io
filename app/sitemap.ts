import type { MetadataRoute } from "next";
import { readPublicIndex } from "@/lib/content-index.server";
import { contentDate, siteUrls } from "@/lib/site-seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = readPublicIndex("blog");
  const notes = readPublicIndex("notes");
  const staticPaths = [
    "/",
    "/blog/",
    "/notes/",
    "/services/",
    "/categories/",
    "/tags/",
    "/tools/",
    "/tools/ctf-calculator/",
  ];
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: siteUrls.page(path),
  }));
  for (const [kind, items] of [
    ["posts", posts],
    ["notes", notes],
  ] as const) {
    entries.push(
      ...items.map((item) => ({
        url: siteUrls.page(`/${kind}/${item.slug}/`),
        lastModified:
          contentDate(item.last_edited_time) || contentDate(item.created_time),
      })),
    );
  }
  for (const [kind, names] of [
    ["categories", posts.flatMap((post) => post.categories || [])],
    ["tags", posts.flatMap((post) => post.tags || [])],
  ] as const) {
    entries.push(
      ...[...new Set(names.map((name) => name.toLowerCase()))]
        .sort()
        .map((name) => ({
          url: siteUrls.page(`/${kind}/${encodeURIComponent(name)}/`),
        })),
    );
  }
  // Unknown modification dates are omitted: rebuilding is not a content update.
  // Search/filter URLs and legacy casing variants are not canonical entries.
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
