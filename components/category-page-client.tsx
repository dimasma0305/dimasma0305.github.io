"use client"

import { useState, useMemo, useCallback } from "react"
import { usePosts } from "@/hooks/use-posts"
import { getAllCategories, getPostsByCategory } from "@/lib/posts-client"
import PostCard from "@/components/post-card"
import { SearchBar } from "@/components/search-bar"
import { LoadingSpinner } from "@/components/loading-spinner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CategoryPageClientProps {
  category: string
}

export default function CategoryPageClient({ category }: CategoryPageClientProps) {
  const { posts, loading, error } = usePosts()
  const [searchQuery, setSearchQuery] = useState("")

  // Decode URL-encoded category name (e.g., "CSS%20Leak" -> "CSS Leak")
  const decodedCategory = decodeURIComponent(category)

  const categories = getAllCategories(posts)
  
  // Find the actual category name (case-insensitive)
  const actualCategoryName = categories.find(cat => 
    cat.toLowerCase() === decodedCategory.toLowerCase()
  ) || decodedCategory
  
  const categoryPosts = getPostsByCategory(posts, actualCategoryName)

  // Filter category posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return categoryPosts
    }

    const query = searchQuery.toLowerCase()
    return categoryPosts.filter((post) => {
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        (post.content && post.content.toLowerCase().includes(query))
      )
    })
  }, [categoryPosts, searchQuery])

  // Check if category exists after posts are loaded (case-insensitive)
  const categoryExists = categories.some(cat => cat.toLowerCase() === decodedCategory.toLowerCase())

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  if (loading) {
    return (
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground mt-4">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Error Loading Posts</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href={"/blog"}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!categoryExists) {
    return (
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-4">The category "{decodedCategory}" does not exist.</p>
          <Link href={"/blog"}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Category: {actualCategoryName}</h1>
        <SearchBar 
          value={searchQuery}
          onChange={handleSearch}
          placeholder={`Search in ${actualCategoryName}...`}
        />
      </div>

      {searchQuery && (
        <div className="mb-6 flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}" in {actualCategoryName}
          </p>
          <button 
            onClick={handleClearSearch}
            className="text-sm text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found matching "{searchQuery}" in {actualCategoryName}.</p>
          <button 
            onClick={handleClearSearch}
            className="mt-2 text-primary hover:underline"
          >
            Clear search to see all posts in this category
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found in this category.</p>
        </div>
      )}
    </div>
  )
}
