export type BlogEntry = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cover: string;
  topics: string[];
  tags: string[];
  minutes: number | null;
};

type IndexEntry = {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  created_time?: string;
  featured_image?: string;
  categories?: string[];
  tags?: string[];
  reading_time?: number;
  archived?: boolean;
  properties?: { published?: boolean };
};

export type BlogFilters = {
  query: string;
  topic: string;
  sort: "newest" | "oldest" | "shortest";
};
export const defaultBlogFilters: BlogFilters = {
  query: "",
  topic: "",
  sort: "newest",
};

export function blogEntries(entries: IndexEntry[]): BlogEntry[] {
  return entries
    .filter(
      (p) =>
        p.slug && p.title && !p.archived && p.properties?.published !== false,
    )
    .map((p) => ({
      id: p.id || p.slug!,
      slug: p.slug!,
      title: p.title!,
      excerpt: (p.excerpt || "").replace(/\s+/g, " ").trim(),
      date: p.created_time || "",
      cover: p.featured_image || "",
      topics: [...new Set(p.categories || [])],
      tags: [...new Set(p.tags || [])],
      minutes:
        Number.isFinite(p.reading_time) && p.reading_time! > 0
          ? Math.ceil(p.reading_time!)
          : null,
    }));
}

export function readBlogFilters(search: string): BlogFilters {
  const params = new URLSearchParams(search);
  const sort = params.get("sort");
  return {
    query: (params.get("q") || "").slice(0, 200),
    topic: params.get("topic") || "",
    sort: sort === "oldest" || sort === "shortest" ? sort : "newest",
  };
}

export function blogFilterQuery(filters: BlogFilters): string {
  const params = new URLSearchParams();
  if (filters.query) {
    params.set("q", filters.query);
  }
  if (filters.topic) {
    params.set("topic", filters.topic);
  }
  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

const timestamp = (date: string) => Date.parse(date) || 0;
export function filterBlogEntries(
  entries: BlogEntry[],
  filters: BlogFilters,
): BlogEntry[] {
  const words = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return entries
    .filter((entry) => {
      const text = [entry.title, entry.excerpt, ...entry.topics, ...entry.tags]
        .join(" ")
        .toLowerCase();
      return (
        (!filters.topic || entry.topics.includes(filters.topic)) &&
        words.every((word) => text.includes(word))
      );
    })
    .sort((a, b) => {
      if (filters.sort === "shortest") {
        const reading = (a.minutes ?? Infinity) - (b.minutes ?? Infinity);
        if (reading && !Number.isNaN(reading)) {
          return reading;
        }
      }
      const delta = timestamp(b.date) - timestamp(a.date);
      return (
        (filters.sort === "oldest" ? -delta : delta) ||
        a.slug.localeCompare(b.slug)
      );
    });
}

export function blogTopics(
  entries: BlogEntry[],
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  entries.forEach((entry) =>
    entry.topics.forEach((topic) =>
      counts.set(topic, (counts.get(topic) || 0) + 1),
    ),
  );
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function formatBlogDate(date: string): string {
  return Number.isFinite(Date.parse(date))
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(date))
    : "Undated";
}

export function validBlogReturn(search: string): string {
  // Persist only filter parameters, never an arbitrary navigation destination.
  return `/blog/${blogFilterQuery(readBlogFilters(search))}`;
}
