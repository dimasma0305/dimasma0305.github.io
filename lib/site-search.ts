export type SearchKind = "project" | "post" | "note";
export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  description: string;
  href: string;
  topics: string[];
}
export const searchKinds = ["all", "project", "post", "note"] as const;
export type SearchFilter = (typeof searchKinds)[number];
export function searchFilter(value: string | null): SearchFilter {
  return searchKinds.includes(value as SearchFilter)
    ? (value as SearchFilter)
    : "all";
}
const normalize = (text: string) =>
  text.normalize("NFKC").toLocaleLowerCase("en").trim();
/** Only public summaries are searched. Article bodies stay out of the bundle. */
export function findEntries(
  entries: SearchEntry[],
  query: string,
  kind: SearchFilter = "all",
) {
  const words = normalize(query).split(/\s+/).filter(Boolean).slice(0, 12);
  return entries
    .map((entry, index) => {
      const title = normalize(entry.title);
      const topics = normalize(entry.topics.join(" "));
      const text = `${title} ${topics} ${normalize(entry.description)}`;
      return {
        entry,
        index,
        match:
          (kind === "all" || entry.kind === kind) &&
          words.every((word) => text.includes(word)),
        score: words.reduce(
          (score, word) =>
            score + (title.includes(word) ? 4 : topics.includes(word) ? 2 : 1),
          0,
        ),
      };
    })
    .filter((item) => item.match)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.entry);
}
