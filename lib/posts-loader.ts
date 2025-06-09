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
const CACHE_DURATION = 60 * 60 * 24 * 1000 // 24 hours in milliseconds
const INDEX_CACHE_KEY = "blogIndex"
const POST_CACHE_KEY_PREFIX = "blogPost_"

// In-memory cache structure
interface CacheEntry<T> {
  data: T
  timestamp: number
  expires: number
}

// In-memory caches
const indexCache = new Map<string, CacheEntry<PostIndex>>()
const postCache = new Map<string, CacheEntry<Post>>()

// Pending request promises (for deduplication)
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

// Cache management functions
function getCachedData<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key)
  if (!entry) {
    return null
  }

  const now = Date.now()
  console.log("expires:", entry.expires)
  if (now > entry.expires) {
    cache.delete(key)
    return null
  }

  return entry.data
}

function setCachedData<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
  const now = Date.now()
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    expires: now + CACHE_DURATION
  }
  cache.set(key, entry)
}

function isCacheExpired(entry: CacheEntry<any>): boolean {
  return Date.now() > entry.expires
}

// Optimized function to fetch index with caching and deduplication
async function fetchIndex(): Promise<PostIndex> {
  // Check memory cache first
  const cachedIndex = getCachedData(indexCache, INDEX_CACHE_KEY)
  if (cachedIndex) {
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
        throw new Error(`Failed to fetch blog index: ${response.status} ${response.statusText}`)
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
      setCachedData(indexCache, INDEX_CACHE_KEY, indexData)

      return indexData
    } catch (error) {
      console.error("Error fetching blog index:", error)
      throw error
    } finally {
      pendingIndexRequest = null
    }
  })()

  return pendingIndexRequest
}

// Highly optimized function to fetch individual posts with request deduplication
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  // Check cache first
  const cacheKey = `${POST_CACHE_KEY_PREFIX}${slug}`
  const cachedPost = getCachedData(postCache, cacheKey)
  if (cachedPost) {
    return cachedPost
  }

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
        throw new Error(`Failed to fetch post ${slug}: ${response.status} ${response.statusText}`)
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
        content: processedHtml,
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

      // Cache the post
      setCachedData(postCache, cacheKey, post)

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
  // Clear memory caches
  indexCache.clear()
  postCache.clear()

  // Clear any pending requests
  pendingIndexRequest = null
  pendingPostRequests.clear()

  console.log("Blog cache invalidated")
}

// Function to get cache statistics
export function getCacheStats() {
  const now = Date.now()
  
  const indexCacheEntry = indexCache.get(INDEX_CACHE_KEY)
  const indexCacheStatus = indexCacheEntry 
    ? (isCacheExpired(indexCacheEntry) ? 'expired' : 'valid')
    : 'empty'

  const postCacheEntries = Array.from(postCache.entries())
  const validPostCacheEntries = postCacheEntries.filter(([_, entry]) => !isCacheExpired(entry))
  
  return {
    indexCache: {
      status: indexCacheStatus,
      cachedAt: indexCacheEntry?.timestamp ? new Date(indexCacheEntry.timestamp).toISOString() : null,
      expiresAt: indexCacheEntry?.expires ? new Date(indexCacheEntry.expires).toISOString() : null
    },
    postCache: {
      totalEntries: postCache.size,
      validEntries: validPostCacheEntries.length,
      expiredEntries: postCache.size - validPostCacheEntries.length,
      cachedSlugs: validPostCacheEntries.map(([key]) => key.replace(POST_CACHE_KEY_PREFIX, ''))
    },
    pendingRequests: {
      indexRequest: !!pendingIndexRequest,
      postRequests: Array.from(pendingPostRequests.keys())
    }
  }
}

// Function to clean expired cache entries
export function cleanExpiredCache(): void {
  const now = Date.now()
  let cleanedCount = 0

  // Clean index cache
  const indexEntry = indexCache.get(INDEX_CACHE_KEY)
  if (indexEntry && isCacheExpired(indexEntry)) {
    indexCache.delete(INDEX_CACHE_KEY)
    cleanedCount++
  }

  // Clean post cache
  for (const [key, entry] of postCache.entries()) {
    if (isCacheExpired(entry)) {
      postCache.delete(key)
      cleanedCount++
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned ${cleanedCount} expired cache entries`)
  }
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

// Auto-cleanup function to run periodically
export function startCacheCleanup(intervalMinutes: number = 60): () => void {
  const intervalId = setInterval(() => {
    cleanExpiredCache()
  }, intervalMinutes * 60 * 1000)

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
  }
}