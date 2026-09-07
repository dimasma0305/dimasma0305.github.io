export const READING_KEY = "dimasc:reading:v1";
export const READING_EVENT = "dimasc:reading-changed";
export interface ReadingEntry {
  path: string;
  title: string;
  kind: "post" | "note";
  progress: number;
  section: string;
  sectionTitle: string;
  revision: string;
  updated: number;
}
export function validReadingPath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    /^\/(posts|notes)\/[^/?#\\\s]+\/$/.test(path) &&
    !/%2f|%5c|%2e|\.\./i.test(path)
  );
}
export function parseReadingList(raw: string | null): ReadingEntry[] {
  try {
    const items: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(items)) {
      return [];
    }
    const valid = items
      .slice(0, 100)
      .filter(
        (item): item is ReadingEntry =>
          !!item &&
          validReadingPath(item.path) &&
          typeof item.title === "string" &&
          (item.kind === "post" || item.kind === "note") &&
          item.path.startsWith(
            `/${item.kind === "post" ? "posts" : "notes"}/`,
          ) &&
          Number.isFinite(item.updated),
      )
      .map((item) => ({
        path: item.path,
        title: item.title.slice(0, 240),
        kind: item.kind,
        progress: Number.isFinite(item.progress)
          ? Math.max(0, Math.min(100, Math.round(item.progress)))
          : 0,
        section:
          typeof item.section === "string" ? item.section.slice(0, 500) : "",
        sectionTitle:
          typeof item.sectionTitle === "string"
            ? item.sectionTitle.slice(0, 180)
            : "",
        revision:
          typeof item.revision === "string" ? item.revision.slice(0, 50) : "",
        updated: item.updated,
      }));
    return [
      ...new Map(
        valid
          .sort((a, b) => a.updated - b.updated)
          .map((item) => [item.path, item]),
      ).values(),
    ]
      .sort((a, b) => b.updated - a.updated)
      .slice(0, 50);
  } catch {
    return [];
  }
}
export function getReadingList(): ReadingEntry[] {
  try {
    return parseReadingList(localStorage.getItem(READING_KEY));
  } catch {
    return [];
  }
}
export function putReadingList(items: ReadingEntry[]): boolean {
  try {
    localStorage.setItem(
      READING_KEY,
      JSON.stringify(parseReadingList(JSON.stringify(items))),
    );
    dispatchEvent(new Event(READING_EVENT));
    return true;
  } catch {
    return false;
  }
}
