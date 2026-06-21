// Server-only post loader used at BUILD time (SSG).
//
// This mirrors `fetchPostBySlug` from `lib/posts-loader.ts`, but reads from the
// filesystem (fs/path) instead of `fetch`/`withBasePath`, so the fully rendered
// post body HTML lands in the static export. Crawlers, AI agents, and no-JS
// clients then receive the real article instead of an empty skeleton.
//
// Do NOT import this from a client component — it touches the filesystem.

import fs from "fs"
import path from "path"
import { convertNotionContentToHtml, extractExcerptFromNotionContent } from "@/lib/notion-content-utils"
import type { Post } from "@/lib/posts-loader"

// Reimplemented locally because the loader's `createNotionPublicUrl` is not exported.
function createNotionPublicUrl(pageId: string): string {
  const cleanId = pageId.replace(/-/g, "")
  return `https://www.notion.so/${cleanId}`
}

// Apply the SAME `<pre><code>` language-class normalization that
// `post-page-client.tsx` applies after fetching, so the returned `content` is
// render-ready and the client never needs to re-process it for the SSG path.
// (The converter never emits a bare `<pre><code>` — it always includes a
// language class — so this is effectively a no-op on current content and is
// idempotent regardless.)
function normalizeCodeBlocks(html: string): string {
  return html
    .replace(/<pre><code>/g, '<pre><code class="language-text">')
    .replace(/<pre><code class="language-(\w+)">/g, (_match, lang) => {
      return `<pre><code class="language-${lang}">`
    })
}

/**
 * Build a fully-rendered `Post` for the given slug by reading the static
 * content files from `public/`. Returns null when the slug is not found or the
 * post cannot be read, so the caller can fall back to client-side fetching.
 */
export async function getPostBySlugAtBuild(slug: string): Promise<Post | null> {
  try {
    // 1. Read the blog index and find the entry by slug (search posts.all,
    //    matching the client loader's `fetchIndex` source).
    const indexPath = path.join(process.cwd(), "public", "blog-index.json")
    const indexContent = fs.readFileSync(indexPath, "utf8")
    const blogIndex = JSON.parse(indexContent)

    const indexEntry = (blogIndex.posts?.all || []).find((p: any) => p.slug === slug)
    if (!indexEntry) {
      console.warn(`Post ${slug} not found in blog index (build)`)
      return null
    }

    const folder: string = indexEntry.folder || ""

    // 2. Read the post.json for this folder.
    const postPath = path.join(process.cwd(), "public", "posts", folder, "post.json")
    const postFileContent = fs.readFileSync(postPath, "utf8")
    const postData = JSON.parse(postFileContent)
    const notionPost = postData.post

    // 3. Convert Notion content blocks to render-ready HTML.
    const processedHtml = await convertNotionContentToHtml(notionPost.content, folder)
    const content = normalizeCodeBlocks(processedHtml)

    // 4. Excerpt: prefer the index excerpt, fall back to first paragraph.
    let excerpt = indexEntry.excerpt || ""
    if (!excerpt && notionPost.content) {
      excerpt = extractExcerptFromNotionContent(notionPost.content)
    }

    // 5. Cover image: prefer the build-localized copy, then external/file URLs,
    //    then a properties-level featured image. (Same precedence as the loader.)
    let coverImage = ""
    if (notionPost.cover) {
      const localCover =
        typeof notionPost.featured_image === "string" && notionPost.featured_image.startsWith("/")
          ? notionPost.featured_image
          : ""
      if (localCover) {
        coverImage = localCover
      } else if (notionPost.cover.type === "external") {
        coverImage = notionPost.cover.external?.url || ""
      } else if (notionPost.cover.type === "file") {
        coverImage = notionPost.cover.file?.url || ""
      }
    } else if (notionPost.properties?.featured_image) {
      coverImage = Array.isArray(notionPost.properties.featured_image)
        ? notionPost.properties.featured_image[0]?.url || ""
        : notionPost.properties.featured_image
    }

    // notionUrl precedence mirrors the loader: the index entry already resolves
    // `public_url || createNotionPublicUrl(id)`, with a final fallback to the
    // notionPost id.
    const indexNotionUrl: string = indexEntry.public_url || createNotionPublicUrl(indexEntry.id)

    const post: Post = {
      id: notionPost.id,
      slug: indexEntry.slug,
      title: notionPost.title || notionPost.properties?.title || "Untitled",
      excerpt,
      content,
      createdAt: notionPost.created_time,
      updatedAt: notionPost.last_edited_time,
      coverImage: coverImage || "",
      iconEmoji: notionPost.icon?.emoji || "",
      categories: Array.isArray(indexEntry.categories) ? indexEntry.categories : [],
      notionUrl: indexNotionUrl || createNotionPublicUrl(notionPost.id),
      verification: {
        state: "verified",
        verified_by: "notion",
        date: notionPost.last_edited_time,
      },
      // Use the SAME author default that page.tsx uses for structured data,
      // not the loader's `properties.author`-gated owner (which is undefined for
      // these posts). This intentionally surfaces an author block in the SSG'd
      // markup and yields accurate Article/Person JSON-LD.
      owner: {
        id: "author",
        name: "Dimas Maulana",
        avatar_url: "https://avatars.githubusercontent.com/u/92920739",
        type: "person",
      },
    }

    return post
  } catch (error) {
    console.error(`Error building post ${slug} at build time:`, error)
    return null
  }
}
