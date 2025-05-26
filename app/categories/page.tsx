"use client"

import { useEffect, useState, lazy, Suspense } from "react"
import { fetchAllPosts } from "@/lib/posts-loader"
import { getAllCategories, getPostsByCategory } from "@/lib/posts-client"
import type { Post } from "@/lib/posts-client"
import { LoadingSpinner } from "@/components/loading-spinner"

// Lazy load PostCard for better initial page load
const PostCard = lazy(() => import("@/components/post-card"))

export default function CategoriesPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const allPosts = await fetchAllPosts()
        setPosts(allPosts)
      } catch (error) {
        console.error("Error loading posts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  const categories = getAllCategories(posts)

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : categories.length > 0 ? (
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryPosts = getPostsByCategory(posts, category)

            return (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight" id={category}>
                  {category}
                </h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryPosts.map((post) => (
                    <Suspense key={post.id} fallback={<LoadingSpinner />}>
                      <PostCard post={post} />
                    </Suspense>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No categories found. Add posts with categories to see them here.</p>
        </div>
      )}
    </div>
  )
}
