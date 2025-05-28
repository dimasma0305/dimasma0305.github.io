import PostPageClient from "@/components/post-page-client"
import { generatePostMetadata, PostStructuredData } from "@/components/seo"
import type { Metadata } from "next"
import fs from "fs"
import path from "path"

// Generate static params for all posts
export async function generateStaticParams() {
  try {
    // Read the blog-index.json file directly from the file system during build
    const indexPath = path.join(process.cwd(), "public", "blog-index.json")
    const indexContent = fs.readFileSync(indexPath, "utf8")
    const blogIndex = JSON.parse(indexContent)

    // Extract slugs from the blog-index.json format
    const slugs = blogIndex.posts?.published?.map((post: any) => post.slug) || []

    return slugs.map((slug: string) => ({
      slug: slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    console.log("🔄 Attempting to generate blog-index.json...")

    // Try to generate the blog index if it doesn't exist
    try {
      const { generateBlogIndex } = await import("../../../scripts/generate-blog-index")
      await generateBlogIndex()

      // Try again after generating
      const indexPath = path.join(process.cwd(), "public", "blog-index.json")
      const indexContent = fs.readFileSync(indexPath, "utf8")
      const blogIndex = JSON.parse(indexContent)

      const slugs = blogIndex.posts?.published?.map((post: any) => post.slug) || []
      console.log(`✅ Generated blog-index and static params for ${slugs.length} posts`)

      return slugs.map((slug: string) => ({
        slug: slug,
      }))
    } catch (generateError) {
      console.error("Failed to generate blog-index:", generateError)
      return []
    }
  }
}

// Generate metadata for each post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params

    // Read the post data from the blog-index for metadata generation
    const indexPath = path.join(process.cwd(), "public", "blog-index.json")
    const indexContent = fs.readFileSync(indexPath, "utf8")
    const blogIndex = JSON.parse(indexContent)

    // Find the post in the blog index
    const post = blogIndex.posts?.published?.find((p: any) => p.slug === slug)

    if (!post) {
      // Fallback metadata for posts not found in index
      return {
        title: "Post Not Found",
        description: "The requested blog post could not be found.",
      }
    }

    // Generate SEO metadata for the post
    return generatePostMetadata({
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || "",
        createdAt: post.created_time,
        updatedAt: post.last_edited_time,
        coverImage: post.featured_image || "",
        iconEmoji: "",
        categories: post.properties?.tags || [],
        verification: {
          state: "unverified" as const,
          verified_by: null,
          date: null,
        },
      },
    })
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Blog Post",
      description: "A blog post by Dimas Maulana",
    }
  }
}

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params

  // Get post data for structured data
  let post = null
  try {
    const indexPath = path.join(process.cwd(), "public", "blog-index.json")
    const indexContent = fs.readFileSync(indexPath, "utf8")
    const blogIndex = JSON.parse(indexContent)

    // Find the post in the blog index
    const foundPost = blogIndex.posts?.published?.find((p: any) => p.slug === slug)

    if (foundPost) {
      post = {
        id: foundPost.id,
        slug: foundPost.slug,
        title: foundPost.title,
        excerpt: foundPost.excerpt || "",
        createdAt: foundPost.created_time,
        updatedAt: foundPost.last_edited_time,
        coverImage: foundPost.featured_image || "",
        iconEmoji: "",
        categories: foundPost.properties?.tags || [],
        content: "", // Will be loaded client-side
        verification: {
          state: "unverified" as const,
          verified_by: null,
          date: null,
        },
        owner: {
          id: "author",
          name: "Dimas Maulana",
          avatar_url: "/avatar.jpg",
          type: "person",
        },
      }
    }
  } catch (error) {
    console.error("Error loading post for structured data:", error)
  }

  return (
    <>
      {post && <PostStructuredData post={post} />}
      <PostPageClient slug={slug} />
    </>
  )
}
