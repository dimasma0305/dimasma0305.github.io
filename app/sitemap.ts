import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

// Configure for static export
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://dimasma0305.github.io') + (process.env.NEXT_PUBLIC_BASE_PATH || '')
  
  // Static pages. URLs use the trailing-slash form to match trailingSlash:true
  // (otherwise every sitemap entry 301-redirects, wasting crawl budget). /search
  // is intentionally omitted: it is a thin, client-only utility page.
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/notes/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/ctf-calculator/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Dynamic blog posts
  let blogPosts: MetadataRoute.Sitemap = []
  let categories: MetadataRoute.Sitemap = []
  let notePosts: MetadataRoute.Sitemap = []

  try {
    // Read the blog index
    const indexPath = path.join(process.cwd(), 'public', 'blog-index.json')
    
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      const blogIndex = JSON.parse(indexContent)
      
      // Get published posts
      const publishedPosts = blogIndex.posts?.published || []
      
      // Generate sitemap entries for blog posts
      blogPosts = publishedPosts.map((post: any) => ({
        url: `${baseUrl}/posts/${post.slug}/`,
        lastModified: new Date(post.last_edited_time || post.created_time),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

      // Get categories from taxonomy section
      const taxonomyCategories = blogIndex.taxonomy?.categories || []
      
      // Generate sitemap entries for categories
      categories = taxonomyCategories.map((category: any) => ({
        url: `${baseUrl}/categories/${encodeURIComponent(category.name.toLowerCase())}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  // Dynamic note pages. Read notes-index.json the same way as blog-index.json.
  // Notes are emitted under /notes/<slug>/ (matching the app/notes/[slug] route
  // and trailingSlash:true). The /notes/ index route is already in staticPages.
  // Note CATEGORY pages are intentionally NOT emitted: the /categories/[category]
  // route generates its static params from blog-index taxonomy only, so a
  // note-only category would 404. Kept in a SEPARATE try/catch so a missing or
  // corrupt notes-index.json degrades gracefully without dropping blog entries.
  try {
    const notesIndexPath = path.join(process.cwd(), 'public', 'notes-index.json')

    if (fs.existsSync(notesIndexPath)) {
      const notesIndexContent = fs.readFileSync(notesIndexPath, 'utf8')
      const notesIndex = JSON.parse(notesIndexContent)

      // notes-index.json exposes every note under posts.all
      const allNotes = notesIndex.posts?.all || []

      notePosts = allNotes.map((note: any) => ({
        url: `${baseUrl}/notes/${note.slug}/`,
        lastModified: new Date(note.last_edited_time || note.created_time),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error generating notes sitemap:', error)
  }

  return [...staticPages, ...blogPosts, ...categories, ...notePosts]
}
