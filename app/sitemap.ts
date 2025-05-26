import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

// Configure for static export
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://dimasma0305.github.io') + (process.env.NEXT_PUBLIC_BASE_PATH || '')
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Dynamic blog posts
  let blogPosts: MetadataRoute.Sitemap = []
  let categories: MetadataRoute.Sitemap = []

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
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: new Date(post.last_edited_time || post.created_time),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

      // Get categories from taxonomy section
      const taxonomyCategories = blogIndex.taxonomy?.categories || []
      
      // Generate sitemap entries for categories
      categories = taxonomyCategories.map((category: any) => ({
        url: `${baseUrl}/categories/${encodeURIComponent(category.name.toLowerCase())}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return [...staticPages, ...blogPosts, ...categories]
} 