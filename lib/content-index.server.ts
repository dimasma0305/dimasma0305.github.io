import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Note } from "./notes-client";
import type { Post } from "./posts-client";

export type PublicEntry = Omit<Note, "content"> & { og_image?: string };

/** Build-time public metadata only; never load article bodies for a listing. */
export function readPublicIndex(kind: "blog" | "notes"): PublicEntry[] {
  const index = JSON.parse(
    readFileSync(join(process.cwd(), `public/${kind}-index.json`), "utf8"),
  );
  const entries: PublicEntry[] =
    index.posts?.published ?? index.posts?.all ?? [];
  return entries.filter(
    (entry) =>
      entry.slug &&
      entry.title &&
      entry.properties?.published &&
      !entry.archived,
  );
}

export function getNotesArchive(): Note[] {
  return readPublicIndex("notes").map((note) => ({
    id: note.id,
    title: note.title,
    slug: note.slug,
    folder: note.folder,
    excerpt: note.excerpt || "",
    featured_image: note.featured_image || "",
    created_time: note.created_time,
    last_edited_time: note.last_edited_time,
    reading_time: note.reading_time || undefined,
    url: note.url,
    public_url: note.public_url || "",
    archived: false,
    categories: note.categories || [],
    tags: note.tags || [],
    properties: note.properties,
  }));
}

export function getPublishedPostSummaries(): Post[] {
  return readPublicIndex("blog")
    .map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      createdAt: post.created_time,
      updatedAt: post.last_edited_time,
      coverImage: post.featured_image || "",
      categories: post.categories || [],
      notionUrl: post.public_url,
      readingTime: post.reading_time,
      verification: {
        state: "unverified" as const,
        verified_by: null,
        date: null,
      },
    }))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
