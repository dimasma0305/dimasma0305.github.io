require('dotenv').config();
const fs = require("fs")
const path = require("path")

// Configuration
const POSTS_DIR = process.env.POSTS_DIR || "public/posts"
const INDEX_OUTPUT = process.env.INDEX_OUTPUT || "public/posts/index.json"
const FULL_INDEX_OUTPUT = process.env.FULL_INDEX_OUTPUT || "public/blog-index.json"

// Helper function to safely read JSON file
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    return JSON.parse(content)
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message)
    return null
  }
}

// Helper function to extract excerpt from content blocks
function extractExcerpt(content, maxLength = 200) {
  if (!content || !Array.isArray(content)) return ""

  let excerpt = ""
  for (const block of content) {
    if (block.type === "paragraph" && block.content && block.content.rich_text) {
      for (const textBlock of block.content.rich_text) {
        excerpt += textBlock.content || ""
        if (excerpt.length >= maxLength) break
      }
      if (excerpt.length >= maxLength) break
    }
  }

  return excerpt.length > maxLength ? excerpt.substring(0, maxLength).trim() + "..." : excerpt.trim()
}

// Helper function to extract reading time estimate
function estimateReadingTime(content) {
  if (!content || !Array.isArray(content)) return 0

  let wordCount = 0
  const countWords = (richText) => {
    if (!richText || !Array.isArray(richText)) return 0
    return richText.reduce((count, text) => {
      const words = (text.content || "").split(/\s+/).filter((word) => word.length > 0)
      return count + words.length
    }, 0)
  }

  for (const block of content) {
    if (block.content && block.content.rich_text) {
      wordCount += countWords(block.content.rich_text)
    }
  }

  // Average reading speed: 200 words per minute
  return Math.ceil(wordCount / 200)
}

// Helper function to extract featured image
function extractFeaturedImage(post) {
  // Check if there's a featured image in properties
  if (post.properties && post.properties.featured_image && post.properties.featured_image.length > 0) {
    return post.properties.featured_image[0].url
  }

  // Check cover image
  if (post.cover) {
    if (post.cover.type === "external") {
      return post.cover.external.url
    } else if (post.cover.type === "file") {
      return post.cover.file.url
    }
  }

  // Look for first image in content
  if (post.content && Array.isArray(post.content)) {
    for (const block of post.content) {
      if (block.type === "image" && block.content && block.content.url) {
        return block.content.url
      }
    }
  }

  return null
}

// Enhanced function to extract categories and tags from post
function extractCategoriesAndTags(post) {
  const categories = new Set()
  const tags = new Set()

  if (!post.properties) {
    return { categories: [], tags: [] }
  }

  // Extract from various property fields
  const propertyFields = [
    "tags",
    "tag",
    "Tags",
    "Tag",
    "categories",
    "category",
    "Categories",
    "Category",
    "topics",
    "topic",
    "Topics",
    "Topic",
  ]

  propertyFields.forEach((field) => {
    const value = post.properties[field]
    if (value) {
      // Handle different property types
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "string" && item.trim()) {
            // Categorize based on field name
            if (field.toLowerCase().includes("categor") || field.toLowerCase().includes("topic")) {
              categories.add(item.trim())
            } else {
              tags.add(item.trim())
            }
          } else if (item && typeof item === "object") {
            // Handle Notion property objects
            const name = item.name || item.title || item.plain_text
            if (name && typeof name === "string" && name.trim()) {
              if (field.toLowerCase().includes("categor") || field.toLowerCase().includes("topic")) {
                categories.add(name.trim())
              } else {
                tags.add(name.trim())
              }
            }
          }
        })
      } else if (typeof value === "string" && value.trim()) {
        // Handle comma-separated strings
        const items = value
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item)
        items.forEach((item) => {
          if (field.toLowerCase().includes("categor") || field.toLowerCase().includes("topic")) {
            categories.add(item)
          } else {
            tags.add(item)
          }
        })
      }
    }
  })

  // Auto-categorize based on title and content
  const title = (post.title || "").toLowerCase()
  const excerpt = extractExcerpt(post.content).toLowerCase()
  const text = `${title} ${excerpt}`

  // Auto-detect categories based on keywords
  const categoryKeywords = {
    CTF: ["ctf", "capture the flag", "writeup", "challenge"],
    Security: ["security", "vulnerability", "exploit", "hack", "penetration"],
    Web: ["web", "html", "css", "javascript", "react", "node"],
    Programming: ["programming", "code", "development", "algorithm"],
    Tutorial: ["tutorial", "guide", "how to", "step by step"],
    Analysis: ["analysis", "review", "research", "study"],
  }

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    if (keywords.some((keyword) => text.includes(keyword))) {
      categories.add(category)
    }
  })

  // Auto-detect tags based on technical terms
  const tagKeywords = {
    XSS: ["xss", "cross-site scripting"],
    "SQL Injection": ["sql injection", "sqli"],
    RCE: ["rce", "remote code execution"],
    CSRF: ["csrf", "cross-site request forgery"],
    XXE: ["xxe", "xml external entity"],
    SSRF: ["ssrf", "server-side request forgery"],
    LFI: ["lfi", "local file inclusion"],
    RFI: ["rfi", "remote file inclusion"],
    PHP: ["php"],
    Python: ["python"],
    JavaScript: ["javascript", "js"],
    "Node.js": ["node.js", "nodejs"],
    React: ["react"],
    "Next.js": ["next.js", "nextjs"],
  }

  Object.entries(tagKeywords).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.add(tag)
    }
  })

  return {
    categories: Array.from(categories),
    tags: Array.from(tags),
  }
}

// Helper function to sort posts
function sortPosts(posts, sortBy = "date") {
  return posts.sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.last_edited_time) - new Date(a.last_edited_time)
      case "created":
        return new Date(b.created_time) - new Date(a.created_time)
      case "title":
        return a.title.localeCompare(b.title)
      case "reading_time":
        return b.reading_time - a.reading_time
      default:
        return new Date(b.last_edited_time) - new Date(a.last_edited_time)
    }
  })
}

// Main function to generate blog index
async function generateBlogIndex() {
  try {
    console.log("🚀 Generating blog index from posts directory...")
    console.log(`📂 Reading from: ${POSTS_DIR}`)

    // Check if posts directory exists
    if (!fs.existsSync(POSTS_DIR)) {
      console.error(`❌ Posts directory not found: ${POSTS_DIR}`)
      process.exit(1)
    }

    // Read all folders in posts directory
    const postFolders = fs
      .readdirSync(POSTS_DIR, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    console.log(`📁 Found ${postFolders.length} post folders`)

    const posts = []
    const allTags = new Set()
    const allCategories = new Set()
    const categoryPostCount = new Map()
    const tagPostCount = new Map()

    for (const folder of postFolders) {
      const postPath = path.join(POSTS_DIR, folder, "post.json")

      if (!fs.existsSync(postPath)) {
        console.warn(`⚠️  No post.json found in ${folder}, skipping...`)
        continue
      }

      const postData = readJsonFile(postPath)
      if (!postData || !postData.post) {
        console.warn(`⚠️  Invalid post data in ${folder}, skipping...`)
        continue
      }

      const post = postData.post

      // Extract categories and tags
      const { categories, tags } = extractCategoriesAndTags(post)

      // Create index entry
      const indexEntry = {
        id: post.id,
        title: post.title || "Untitled",
        slug: postData.meta.slug || folder,
        folder: folder,
        excerpt: extractExcerpt(post.content),
        featured_image: extractFeaturedImage(post),
        created_time: post.created_time,
        last_edited_time: post.last_edited_time,
        reading_time: estimateReadingTime(post.content),
        url: post.url,
        public_url: post.public_url,
        archived: post.archived || false,
        categories: categories,
        tags: tags,
        properties: {
          published: post.properties?.published !== false,
          featured: post.properties?.featured === true,
          author: post.properties?.author || "Anonymous",
        },
      }

      // Add to global collections
      categories.forEach((cat) => {
        allCategories.add(cat)
        categoryPostCount.set(cat, (categoryPostCount.get(cat) || 0) + 1)
      })

      tags.forEach((tag) => {
        allTags.add(tag)
        tagPostCount.set(tag, (tagPostCount.get(tag) || 0) + 1)
      })

      posts.push(indexEntry)
      console.log(`✅ Processed: ${indexEntry.title} (${categories.length} categories, ${tags.length} tags)`)
    }

    console.log(`📊 Processed ${posts.length} posts successfully`)
    console.log(`🏷️  Found ${allCategories.size} unique categories`)
    console.log(`🔖 Found ${allTags.size} unique tags`)

    // Create taxonomy with counts
    const sortedCategories = Array.from(allCategories)
      .map((cat) => ({
        name: cat,
        count: categoryPostCount.get(cat) || 0,
        slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }))
      .sort((a, b) => b.count - a.count)

    const sortedTags = Array.from(allTags)
      .map((tag) => ({
        name: tag,
        count: tagPostCount.get(tag) || 0,
        slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }))
      .sort((a, b) => b.count - a.count)

    // Create comprehensive index
    const blogIndex = {
      meta: {
        generated_at: new Date().toISOString(),
        total_posts: posts.length,
        published_posts: posts.filter((p) => p.properties.published !== false).length,
        draft_posts: posts.filter((p) => p.properties.published === false).length,
        featured_posts: posts.filter((p) => p.properties.featured === true).length,
        total_tags: allTags.size,
        total_categories: allCategories.size,
        posts_directory: POSTS_DIR,
      },
      taxonomy: {
        categories: sortedCategories,
        tags: sortedTags,
      },
      posts: {
        all: sortPosts([...posts], "date"),
        published: sortPosts(
          posts.filter((p) => p.properties.published !== false),
          "date",
        ),
        drafts: sortPosts(
          posts.filter((p) => p.properties.published === false),
          "date",
        ),
        featured: sortPosts(
          posts.filter((p) => p.properties.featured === true),
          "date",
        ),
        by_date: sortPosts([...posts], "date"),
        by_title: sortPosts([...posts], "title"),
        by_reading_time: sortPosts([...posts], "reading_time"),
      },
    }

    // Create simple index for posts directory
    const simpleIndex = {
      meta: blogIndex.meta,
      posts: blogIndex.posts.published,
      categories: sortedCategories,
      tags: sortedTags,
    }

    // Ensure output directories exist
    const indexOutputDir = path.dirname(INDEX_OUTPUT)
    const fullIndexOutputDir = path.dirname(FULL_INDEX_OUTPUT)

    if (!fs.existsSync(indexOutputDir)) {
      fs.mkdirSync(indexOutputDir, { recursive: true })
    }

    if (!fs.existsSync(fullIndexOutputDir)) {
      fs.mkdirSync(fullIndexOutputDir, { recursive: true })
    }

    // Write index files
    fs.writeFileSync(INDEX_OUTPUT, JSON.stringify(simpleIndex, null, 2), "utf8")
    fs.writeFileSync(FULL_INDEX_OUTPUT, JSON.stringify(blogIndex, null, 2), "utf8")

    console.log(`✅ Blog index generated successfully!`)
    console.log(`📁 Simple index: ${INDEX_OUTPUT}`)
    console.log(`📁 Full index: ${FULL_INDEX_OUTPUT}`)
    console.log(`📊 Statistics:`)
    console.log(`   📝 Total posts: ${blogIndex.meta.total_posts}`)
    console.log(`   ✅ Published: ${blogIndex.meta.published_posts}`)
    console.log(`   📄 Drafts: ${blogIndex.meta.draft_posts}`)
    console.log(`   ⭐ Featured: ${blogIndex.meta.featured_posts}`)
    console.log(`   🏷️  Categories: ${blogIndex.meta.total_categories}`)
    console.log(`   🔖 Tags: ${blogIndex.meta.total_tags}`)

    // Log top categories and tags
    console.log(`\n📂 Top Categories:`)
    sortedCategories.slice(0, 10).forEach((cat) => {
      console.log(`   ${cat.name}: ${cat.count} posts`)
    })

    console.log(`\n🔖 Top Tags:`)
    sortedTags.slice(0, 10).forEach((tag) => {
      console.log(`   ${tag.name}: ${tag.count} posts`)
    })

    // Calculate file sizes
    const simpleStats = fs.statSync(INDEX_OUTPUT)
    const fullStats = fs.statSync(FULL_INDEX_OUTPUT)
    console.log(`\n📦 File sizes:`)
    console.log(`   Simple index: ${(simpleStats.size / 1024).toFixed(2)} KB`)
    console.log(`   Full index: ${(fullStats.size / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.error("❌ Error generating blog index:", error)
    process.exit(1)
  }
}

// Run the generator
if (require.main === module) {
  generateBlogIndex()
}

module.exports = { generateBlogIndex }
