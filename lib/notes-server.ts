// Server-only note loader used at BUILD time (SSG).
//
// This mirrors `fetchNoteBySlug` from `lib/notes-client.ts` together with the
// content-building that `components/note-page-client.tsx` performs after its
// fetch, but it reads from the filesystem (fs/path) instead of `fetch`, so the
// fully rendered note body HTML lands in the static export. Crawlers, AI agents,
// and no-JS clients then receive the real note instead of an empty skeleton.
//
// Do NOT import this from a client component — it touches the filesystem.

import fs from "fs"
import path from "path"
import { convertNotionContentToHtml } from "@/lib/notion-content-utils"
import type { Note } from "@/lib/notes-client"

/**
 * Build a fully-rendered `Note` for the given slug by reading the static
 * content files from `public/`. Returns null when the slug is not found or the
 * note cannot be read, so the caller can fall back to client-side fetching.
 *
 * The returned object matches exactly what `note-page-client.tsx` constructs
 * from its fetch: the index entry merged with the post.json overrides, and
 * `content` set to the HTML produced by `convertNotionContentToHtml`. We mirror
 * that path byte-for-byte (no `folder` argument, no code-block normalization)
 * so the SSG output is identical to the client-rendered output.
 */
export async function getNoteBySlugAtBuild(slug: string): Promise<Note | null> {
  try {
    // 1. Read the notes index and find the entry by slug (search posts.all,
    //    matching the client's fetch source).
    const indexPath = path.join(process.cwd(), "public", "notes-index.json")
    const indexContent = fs.readFileSync(indexPath, "utf8")
    const notesIndex = JSON.parse(indexContent)

    const noteInfo = (notesIndex.posts?.all || []).find((n: any) => n.slug === slug)
    if (!noteInfo) {
      console.warn(`Note ${slug} not found in notes index (build)`)
      return null
    }

    const folder: string = noteInfo.folder || ""

    // 2. Read the post.json for this folder.
    const postPath = path.join(process.cwd(), "public", "notes", folder, "post.json")
    const postFileContent = fs.readFileSync(postPath, "utf8")
    const noteData = JSON.parse(postFileContent)
    const notionPost = noteData.post

    // 3. Convert Notion content blocks to render-ready HTML. Mirror the client:
    //    no folder argument (it only affects nested-child recursion, not image
    //    URLs) so the output matches the client path exactly.
    const htmlContent = await convertNotionContentToHtml(notionPost.content)

    // 4. Merge index entry with post.json overrides — the SAME shape the client
    //    builds in its fetch effect.
    const fullNote: Note = {
      ...noteInfo,
      content: htmlContent,
      title: notionPost.title,
      created_time: notionPost.created_time,
      last_edited_time: notionPost.last_edited_time,
      url: notionPost.url,
      public_url: notionPost.public_url,
    }

    return fullNote
  } catch (error) {
    console.error(`Error building note ${slug} at build time:`, error)
    return null
  }
}
