import { readPublicIndex } from "./content-index.server";
import { searchDescription } from "./site-seo";
import portfolio from "./portfolio-data.json";
import type { SearchEntry } from "./site-search";
export function getSearchDirectory(): SearchEntry[] {
  const projects: SearchEntry[] = portfolio.projects.map((project, index) => ({
    id: `project:${index}`,
    kind: "project",
    title: project.title,
    description: project.description,
    href: `/#project-${index}`,
    topics: project.tags,
  }));
  const writing = (["blog", "notes"] as const).flatMap((kind) =>
    readPublicIndex(kind)
      .sort((a, b) => Date.parse(b.created_time) - Date.parse(a.created_time))
      .map((entry) => ({
        id: `${kind}:${entry.slug}`,
        kind: kind === "blog" ? ("post" as const) : ("note" as const),
        title: entry.title,
        description: searchDescription(
          entry.excerpt,
          `${kind === "blog" ? "A research writeup" : "A field note"} by Dimas Maulana. ${[...(entry.categories || []), ...(entry.tags || [])].slice(0, 4).join(" · ")}`,
        ),
        href: `/${kind === "blog" ? "posts" : "notes"}/${encodeURIComponent(entry.slug)}/`,
        topics: [...(entry.categories || []), ...(entry.tags || [])],
      })),
  );
  return [
    ...new Map(
      [...projects, ...writing].map((entry) => [entry.id, entry]),
    ).values(),
  ];
}
