import { expect, test } from "bun:test";
import { fetchNotes, fetchNotesStats } from "./notes-client";

test("notes and stats share one request, refresh explicitly, and retry errors", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  const index = {
    meta: { total_posts: 3, generated_at: "2026-09-06" },
    taxonomy: { categories: [{ name: "Research" }] },
    posts: {
      all: [
        {
          slug: "published",
          properties: { published: true },
          archived: false,
          public_url: "https://notion.so/example",
        },
        { slug: "draft", properties: { published: false }, archived: false },
        { slug: "archived", properties: { published: true }, archived: true },
      ],
    },
  };
  try {
    globalThis.fetch = (async () => {
      calls++;
      return Response.json(index);
    }) as typeof fetch;
    const [notes, stats] = await Promise.all([
      fetchNotes(true),
      fetchNotesStats(),
      fetchNotes(),
    ]);
    expect(calls).toBe(1);
    expect(notes.map((n) => n.slug)).toEqual(["published"]);
    expect(stats.categories).toEqual(["Research"]);
    expect(stats.totalNotes).toBe(3);
    expect(stats.notesWithNotionLinks).toBe(1);
    await fetchNotes();
    expect(calls).toBe(1);
    await fetchNotes(true);
    expect(calls).toBe(2);
    globalThis.fetch = (async () => {
      calls++;
      return new Response(null, { status: 503 });
    }) as typeof fetch;
    await expect(fetchNotes(true)).rejects.toThrow("Failed to fetch notes");
    globalThis.fetch = (async () => {
      calls++;
      return Response.json(index);
    }) as typeof fetch;
    await fetchNotes();
    expect(calls).toBe(4);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
