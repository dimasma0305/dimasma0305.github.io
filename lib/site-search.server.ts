import { readPublicIndex } from "./content-index.server";
import type { PublicEntry } from "./content-index.server";
import { searchDescription } from "./site-seo";
import portfolio from "./portfolio-data.json";
import type { SearchEntry } from "./site-search";

type SearchIndex = Pick<
  PublicEntry,
  "slug" | "title" | "created_time" | "excerpt" | "categories" | "tags"
>[];

export function buildSearchDirectory(posts: SearchIndex): SearchEntry[] {
  const projects: SearchEntry[] = portfolio.projects.map((project, index) => ({
    id: `project:${index}`,
    kind: "project",
    title: project.title,
    description: project.description,
    href: `/#project-${index}`,
    topics: project.tags,
  }));
  const writing: SearchEntry[] = [...posts]
    .sort((a, b) => Date.parse(b.created_time) - Date.parse(a.created_time))
    .map((entry) => ({
      id: `blog:${entry.slug}`,
      kind: "post",
      title: entry.title,
      description: searchDescription(
        entry.excerpt,
        `A research writeup by Dimas Maulana. ${[...(entry.categories || []), ...(entry.tags || [])].slice(0, 4).join(" · ")}`,
      ),
      href: `/posts/${encodeURIComponent(entry.slug)}/`,
      topics: [...(entry.categories || []), ...(entry.tags || [])],
    }));
  return [
    ...new Map(
      [...projects, ...writing].map((entry) => [entry.id, entry]),
    ).values(),
  ];
}

export function getSearchDirectory(): SearchEntry[] {
  return buildSearchDirectory(readPublicIndex("blog"));
}
