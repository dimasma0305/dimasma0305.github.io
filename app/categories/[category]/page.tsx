import CategoryPageClient from "@/components/category-page-client"
import { withBasePath } from "@/lib/utils"

// Generate static params for all categories
export async function generateStaticParams() {
  try {
    // Read the blog index file directly from the file system during build
    const fs = require('fs')
    const path = require('path')
    
    const indexPath = path.join(process.cwd(), 'public', 'blog-index.json')
    const indexContent = fs.readFileSync(indexPath, 'utf8')
    const blogIndex = JSON.parse(indexContent)
    
    // Extract categories from the blog index structure
    let categories: string[] = []
    
    if (blogIndex.taxonomy && blogIndex.taxonomy.categories && Array.isArray(blogIndex.taxonomy.categories)) {
      // Get categories from taxonomy section
      categories = blogIndex.taxonomy.categories.map((cat: any) => cat.name)
      console.log(`📁 Generated static params for ${categories.length} categories from taxonomy`)
    } else if (blogIndex.posts && blogIndex.posts.all && Array.isArray(blogIndex.posts.all)) {
      // Extract categories from posts
      const categoriesSet = new Set<string>()
      
      blogIndex.posts.all.forEach((post: any) => {
        if (post.categories && Array.isArray(post.categories)) {
          post.categories.forEach((category: string) => {
            categoriesSet.add(category)
          })
        }
      })
      
      categories = Array.from(categoriesSet)
      console.log(`📁 Generated static params for ${categories.length} categories from posts`)
    }
    
    console.log('📁 Categories found:', categories)
    
    // Generate params for both exact case and lowercase versions
    const categoryParams: { category: string }[] = []
    
    categories.forEach((category) => {
      // Add exact case
      categoryParams.push({ category: category })
      
      // Add URL-encoded version for categories with spaces
      const encoded = encodeURIComponent(category)
      if (encoded !== category) {
        categoryParams.push({ category: encoded })
      }
      
      // Add lowercase version if it's different
      const lowercase = category.toLowerCase()
      if (lowercase !== category) {
        categoryParams.push({ category: lowercase })
        
        // Add URL-encoded lowercase version
        const encodedLowercase = encodeURIComponent(lowercase)
        if (encodedLowercase !== lowercase) {
          categoryParams.push({ category: encodedLowercase })
        }
      }
    })
    
    console.log('📁 Total category params generated:', categoryParams.length)
    return categoryParams
  } catch (error) {
    console.error('Error generating static params for categories:', error)
    
    // Fallback: return common categories with both cases
    const fallbackCategories = [
      'CTF', 'ctf',
      'Web', 'web', 
      'Security', 'security',
      'wordpress',
      'XSS', 'xss',
      'Programming', 'programming',
      'Domclobering', 'domclobering',
      'CSS Leak', 'css leak', 'css-leak', 'CSS%20Leak', 'css%20leak',
      'XXE', 'xxe',
    ]
    
    return fallbackCategories.map((category) => ({
      category: category,
    }))
  }
}

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  return <CategoryPageClient category={category} />
}
