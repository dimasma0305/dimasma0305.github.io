import fs from "fs"
import path from "path"

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  createdAt: string
  updatedAt: string
  coverImage: string
  iconEmoji: string
  categories: string[]
  verification: {
    state: string
    verified_by: string
    date: string
  }
  owner?: {
    id: string
    name: string
    avatar_url: string
    type: string
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    // Read the blog index
    const indexPath = path.join(process.cwd(), "public", "blog-index.json")

    if (!fs.existsSync(indexPath)) {
      return []
    }

    const indexContent = fs.readFileSync(indexPath, "utf8")
    const blogIndex = JSON.parse(indexContent)

    // Get published posts from the index
    const publishedPosts = blogIndex.posts?.published || []

    if (publishedPosts.length === 0) {
      return []
    }

    // Convert index posts to our Post format
    const allPosts = publishedPosts.map((indexPost: any) => {
      const post: Post = {
        id: indexPost.id,
        slug: indexPost.slug,
        title: indexPost.title,
        excerpt: indexPost.excerpt || "",
        content: "", // Will be loaded on demand
        createdAt: indexPost.created_time,
        updatedAt: indexPost.last_edited_time,
        coverImage: indexPost.featured_image || "",
        iconEmoji: "",
        categories: indexPost.properties?.tags || [],
        verification: {
          state: "verified",
          verified_by: "notion",
          date: indexPost.last_edited_time,
        },
        owner: indexPost.properties?.author
          ? {
              id: "author",
              name: indexPost.properties.author,
              avatar_url: "",
              type: "person",
            }
          : undefined,
      }
      return post
    })

    // Sort by date
    return allPosts.sort((a: Post, b: Post) => (new Date(b.createdAt) > new Date(a.createdAt) ? 1 : -1))
  } catch (e) {
    console.error("Error reading blog index:", e)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // First get the post info from the index
    const indexPath = path.join(process.cwd(), "public", "blog-index.json")

    if (!fs.existsSync(indexPath)) {
      return null
    }

    const indexContent = fs.readFileSync(indexPath, "utf8")
    const blogIndex = JSON.parse(indexContent)

    // Find the post in the index
    const indexPost = blogIndex.posts?.published?.find((p: any) => p.slug === slug)
    if (!indexPost) {
      return null
    }

    // Read the individual post.json file
    const postJsonPath = path.join(process.cwd(), "public", "posts", indexPost.folder, "post.json")

    if (!fs.existsSync(postJsonPath)) {
      return null
    }

    const postContent = fs.readFileSync(postJsonPath, "utf8")
    const postData = JSON.parse(postContent)
    const notionPost = postData.post

    // Convert Notion content to HTML
    const processedHtml = convertNotionContentToHtmlServer(notionPost.content || [])

    // Extract excerpt if not available
    let excerpt = indexPost.excerpt
    if (!excerpt && notionPost.content) {
      excerpt = extractExcerptFromNotionContentServer(notionPost.content)
    }

    // Process cover image
    let coverImage = ""
    if (notionPost.cover) {
      if (notionPost.cover.type === "external") {
        coverImage = notionPost.cover.external.url
      } else if (notionPost.cover.type === "file") {
        coverImage = notionPost.cover.file.url
      }
    } else if (notionPost.properties?.featured_image) {
      const featuredImg = notionPost.properties.featured_image
      coverImage = Array.isArray(featuredImg) ? featuredImg[0]?.url || "" : featuredImg
    }

    // Create post object
    const post: Post = {
      id: notionPost.id,
      slug: indexPost.slug,
      title: notionPost.title || notionPost.properties?.title || "Untitled",
      excerpt,
      content: processedHtml,
      createdAt: notionPost.created_time,
      updatedAt: notionPost.last_edited_time,
      coverImage,
      iconEmoji: notionPost.icon?.emoji || "",
      categories: notionPost.properties?.tags || [],
      verification: {
        state: "verified",
        verified_by: "notion",
        date: notionPost.last_edited_time,
      },
      owner: notionPost.properties?.author
        ? {
            id: "author",
            name: notionPost.properties.author,
            avatar_url: "",
            type: "person",
          }
        : undefined,
    }

    return post
  } catch (e) {
    console.error(`Error processing post ${slug}:`, e)
    return null
  }
}

// Server-side helper functions
function extractExcerptFromNotionContentServer(content: any[]): string {
  if (!content || !Array.isArray(content)) return ""

  for (const block of content) {
    if (block.type === "paragraph" && block.content?.rich_text) {
      const text = block.content.rich_text
        .map((rt: any) => rt.content || "")
        .join("")
        .trim()
      if (text) {
        return text.length > 200 ? text.substring(0, 200) + "..." : text
      }
    }
  }
  return ""
}

function convertNotionContentToHtmlServer(content: any[]): string {
  if (!content || !Array.isArray(content)) return ""

  const htmlBlocks: string[] = []

  for (const block of content) {
    const html = convertNotionBlockToHtmlServer(block)
    if (html) {
      htmlBlocks.push(html)
    }
  }

  return htmlBlocks.join("\n")
}

function convertNotionBlockToHtmlServer(block: any): string {
  if (!block || !block.type) return ""

  const processRichText = (richText: any[]) => {
    if (!richText || !Array.isArray(richText)) return ""
    return richText
      .map((rt) => {
        let text = rt.content || ""
        if (rt.annotations?.bold) text = `<strong>${text}</strong>`
        if (rt.annotations?.italic) text = `<em>${text}</em>`
        if (rt.annotations?.strikethrough) text = `<del>${text}</del>`
        if (rt.annotations?.underline) text = `<u>${text}</u>`
        if (rt.annotations?.code) text = `<code>${text}</code>`
        if (rt.href) text = `<a href="${rt.href}" target="_blank" rel="noopener noreferrer">${text}</a>`
        return text
      })
      .join("")
  }

  switch (block.type) {
    case "paragraph":
      const pText = processRichText(block.content?.rich_text)
      return pText ? `<p>${pText}</p>` : ""

    case "heading_1":
      const h1Text = processRichText(block.content?.rich_text)
      return h1Text ? `<h1>${h1Text}</h1>` : ""

    case "heading_2":
      const h2Text = processRichText(block.content?.rich_text)
      return h2Text ? `<h2>${h2Text}</h2>` : ""

    case "heading_3":
      const h3Text = processRichText(block.content?.rich_text)
      return h3Text ? `<h3>${h3Text}</h3>` : ""

    case "bulleted_list_item":
      const liText = processRichText(block.content?.rich_text)
      return liText ? `<li>${liText}</li>` : ""

    case "numbered_list_item":
      const numLiText = processRichText(block.content?.rich_text)
      return numLiText ? `<li>${numLiText}</li>` : ""

    case "code":
      const codeText = processRichText(block.content?.rich_text)
      const language = block.content?.language || ""
      return codeText ? `<pre><code class="language-${language}">${codeText}</code></pre>` : ""

    case "quote":
      const quoteText = processRichText(block.content?.rich_text)
      return quoteText ? `<blockquote>${quoteText}</blockquote>` : ""

    case "callout":
      const calloutText = processRichText(block.content?.rich_text)
      const icon = block.content?.icon?.emoji || "💡"
      return calloutText
        ? `<div class="callout"><span class="callout-icon">${icon}</span><div class="callout-content">${calloutText}</div></div>`
        : ""

    case "divider":
      return "<hr>"

    case "image":
      if (block.content?.url) {
        const caption = processRichText(block.content?.caption || [])
        const altText = caption || "Image"
        return `<img src="${block.content.url}" alt="${altText}" class="rounded-lg my-8" loading="lazy" onerror="this.onerror=null;this.src='/placeholder.svg?height=400&width=600&text=Image%20Not%20Found'">${caption ? `<figcaption>${caption}</figcaption>` : ""}`
      }
      return ""

    case "video":
      if (block.content?.url) {
        return `<video controls class="rounded-lg my-8"><source src="${block.content.url}">Your browser does not support the video tag.</video>`
      }
      return ""

    case "embed":
      if (block.content?.url) {
        return `<iframe src="${block.content.url}" class="w-full h-96 rounded-lg my-8" frameborder="0"></iframe>`
      }
      return ""

    case "bookmark":
      if (block.content?.url) {
        return `<a href="${block.content.url}" target="_blank" rel="noopener noreferrer" class="bookmark-link">${block.content.url}</a>`
      }
      return ""

    default:
      return ""
  }
}
