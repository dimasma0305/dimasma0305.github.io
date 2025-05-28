import { withBasePath } from "@/lib/utils"
import { convertNotionContentToHtml, extractExcerptFromNotionContent, type NotionBlock } from "@/lib/notion-content-utils"

// Define types for Post and PostIndex
export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  content?: string
  createdAt: string
  updatedAt: string
  coverImage: string
  iconEmoji: string
  categories: string[]
  notionUrl?: string
  folder?: string
  verification: {
    state: 'verified' | 'unverified' | 'pending'
    verified_by: string | null
    date: string | null
  }
  owner?: {
    id: string
    name: string
    avatar_url: string
    type: string
  }
}

export type PostIndex = {
  generated: string
  version: string
  totalPosts: number
  categories: string[]
  posts: Post[]
  postsWithNotionLinks: number
}

export type BlogStats = {
  totalPosts: number
  categories: string[]
  lastGenerated: string
  postsWithNotionLinks?: number
}

// Configuration constants
const CACHE_DURATION = 60 * 60 * 24 // 24 hours
const ENABLE_LOCAL_STORAGE_CACHE = true
const LOCAL_STORAGE_KEY = "blogIndexCache"

// In-memory cache
let indexMemoryCache: { data: PostIndex; timestamp: number } | null = null

// Pending request promise (for deduplication)
let pendingIndexRequest: Promise<PostIndex> | null = null
const pendingPostRequests = new Map<string, Promise<Post | null>>()

function createNotionPublicUrl(pageId: string): string {
  // Remove hyphens and create public Notion URL
  const cleanId = pageId.replace(/-/g, "")
  return `https://www.notion.so/${cleanId}`
}

// Helper function to escape HTML entities for safe rendering
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Helper function to validate and clean URLs
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Only allow http and https protocols
    if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
      return escapeHtml(url)
    }
    return "#"
  } catch {
    return "#"
  }
}

// Helper function to extract categories from posts
function extractCategories(posts: Post[]): string[] {
  const categorySet = new Set<string>()

  posts.forEach((post) => {
    if (post.categories && Array.isArray(post.categories)) {
      post.categories.forEach((category) => {
        if (category && typeof category === "string" && category.trim()) {
          categorySet.add(category.trim())
        }
      })
    }
  })

  return Array.from(categorySet).sort()
}

// Helper functions for localStorage caching
function getCachedIndex(): PostIndex | null {
  if (!ENABLE_LOCAL_STORAGE_CACHE || typeof localStorage === "undefined") {
    return null
  }
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    return cached ? (JSON.parse(cached) as PostIndex) : null
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return null
  }
}

function setCachedIndex(index: PostIndex): void {
  if (!ENABLE_LOCAL_STORAGE_CACHE || typeof localStorage === "undefined") {
    return
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(index))
  } catch (error) {
    console.error("Error writing to localStorage:", error)
  }
}

// Optimized function to fetch index with caching and deduplication
async function fetchIndex(): Promise<PostIndex> {
  // Check memory cache first
  if (indexMemoryCache && Date.now() - indexMemoryCache.timestamp < CACHE_DURATION) {
    return indexMemoryCache.data
  }

  // Check localStorage cache
  const cachedIndex = getCachedIndex()
  if (cachedIndex) {
    indexMemoryCache = { data: cachedIndex, timestamp: Date.now() }
    return cachedIndex
  }

  // If there's already a pending request, wait for it
  if (pendingIndexRequest) {
    return pendingIndexRequest
  }

  // Create new request
  pendingIndexRequest = (async () => {
    try {
      const response = await fetch(withBasePath("/blog-index.json"))
      if (!response.ok) {
        throw new Error("Failed to fetch blog index")
      }

      const blogIndex = await response.json()

      // Convert blog-index.json format to our expected PostIndex format
      const posts: Post[] = blogIndex.posts.all.map((post: any) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || "",
        createdAt: post.created_time,
        updatedAt: post.last_edited_time,
        coverImage: post.featured_image || "",
        iconEmoji: "",
        categories: Array.isArray(post.categories) ? post.categories : [],
        notionUrl: post.public_url || createNotionPublicUrl(post.id),
        verification: {
          state: "unverified",
          verified_by: null,
          date: null,
        },
        folder: post.folder,
      }))

      const indexData: PostIndex = {
        generated: blogIndex.meta.generated_at,
        version: "2.0",
        totalPosts: blogIndex.meta.total_posts,
        categories: extractCategories(posts),
        posts,
        postsWithNotionLinks: blogIndex.meta.total_posts,
      }

      // Cache the results
      setCachedIndex(indexData)
      indexMemoryCache = { data: indexData, timestamp: Date.now() }

      return indexData
    } finally {
      pendingIndexRequest = null
    }
  })()

  return pendingIndexRequest
}

// Highly optimized function to fetch individual posts with request deduplication
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  // Check if there's already a pending request for this slug
  if (pendingPostRequests.has(slug)) {
    return pendingPostRequests.get(slug)!
  }

  const fetchPromise = (async (): Promise<Post | null> => {
    try {
      // Get index data efficiently (uses shared cache)
      const indexData = await fetchIndex()
      const postFromIndex = indexData.posts?.find((p) => p.slug === slug)

      if (!postFromIndex) {
        console.warn(`Post ${slug} not found in index`)
        return null
      }

      // Fetch the post.json file
      const response = await fetch(withBasePath(`/posts/${postFromIndex.folder}/post.json`))
      if (!response.ok) {
        throw new Error(`Failed to fetch post ${slug}`)
      }

      const postData = await response.json()
      const notionPost = postData.post

      // Convert Notion content blocks to HTML
      const processedHtml = await convertNotionContentToHtml(notionPost.content, postFromIndex.folder || "")

      // Extract excerpt from content if not available
      let excerpt = postFromIndex.excerpt
      if (!excerpt && notionPost.content) {
        excerpt = extractExcerptFromNotionContent(notionPost.content)
      }

      // Process cover image
      let coverImage = ""
      if (notionPost.cover) {
        if (notionPost.cover.type === "external") {
          coverImage = notionPost.cover.external.url
        } else if (notionPost.cover.type === "file") {
          coverImage = notionPost.cover.file.url
        }
      } else if (notionPost.properties.featured_image) {
        coverImage = Array.isArray(notionPost.properties.featured_image)
          ? notionPost.properties.featured_image[0]?.url || ""
          : notionPost.properties.featured_image
      }

      // Create optimized post object
      const post: Post = {
        id: notionPost.id,
        slug: postFromIndex.slug,
        title: notionPost.title || notionPost.properties.title || "Untitled",
        excerpt,
        content: processedHtml, // No sanitization, just safe HTML entity encoding
        createdAt: notionPost.created_time,
        updatedAt: notionPost.last_edited_time,
        coverImage: notionPost.featured_image || "",
        iconEmoji: notionPost.icon?.emoji || "",
        categories: Array.isArray(postFromIndex.categories) ? postFromIndex.categories : [],
        notionUrl: postFromIndex.notionUrl || createNotionPublicUrl(notionPost.id),
        verification: {
          state: "verified",
          verified_by: "notion",
          date: notionPost.last_edited_time,
        },
        owner: notionPost.properties.author
          ? {
              id: "author",
              name: notionPost.properties.author,
              avatar_url: "",
              type: "person",
            }
          : undefined,
      }

      return post
    } catch (error) {
      console.error(`Error processing post ${slug}:`, error)
      return null
    } finally {
      // Clean up pending request
      pendingPostRequests.delete(slug)
    }
  })()

  // Store the promise to avoid duplicate requests
  pendingPostRequests.set(slug, fetchPromise)
  return fetchPromise
}

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes"
  }
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Function to get blog statistics
export async function getBlogStats(): Promise<BlogStats | null> {
  try {
    const indexData = await fetchIndex()

    return {
      totalPosts: indexData.totalPosts,
      categories: indexData.categories,
      lastGenerated: indexData.generated,
      postsWithNotionLinks: indexData.postsWithNotionLinks,
    }
  } catch (error) {
    console.error("Error fetching blog stats:", error)
    return null
  }
}

// Function to invalidate all caches
export function invalidateCache(): void {
  // Clear memory cache
  indexMemoryCache = null

  // Clear localStorage cache
  if (ENABLE_LOCAL_STORAGE_CACHE && typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing localStorage cache:", error)
    }
  }

  // Clear any pending requests
  pendingIndexRequest = null
  pendingPostRequests.clear()

  console.log("Blog cache invalidated")
}

// Function to prefetch posts for performance optimization
export async function prefetchPosts(slugs?: string[]): Promise<void> {
  try {
    // Always prefetch the index first
    await fetchIndex()

    // If specific slugs are provided, prefetch those posts
    if (slugs && slugs.length > 0) {
      // Prefetch posts in parallel but limit concurrency to avoid overwhelming the server
      const batchSize = 3
      for (let i = 0; i < slugs.length; i += batchSize) {
        const batch = slugs.slice(i, i + batchSize)
        await Promise.all(
          batch.map((slug) =>
            fetchPostBySlug(slug).catch((error) => {
              console.warn(`Failed to prefetch post ${slug}:`, error)
              return null
            }),
          ),
        )
      }
    }

  } catch (e) {
    console.error("Error prefetching posts:", e)
  }
}

// Optimized function to fetch all posts with caching
export async function fetchAllPosts(): Promise<Post[]> {
  try {
    // Get index data efficiently (uses shared cache)
    const indexData = await fetchIndex()

    // Return posts from index (without full content for performance)
    return indexData.posts || []
  } catch (error) {
    console.error("Error fetching all posts:", error)
    return []
  }
}
