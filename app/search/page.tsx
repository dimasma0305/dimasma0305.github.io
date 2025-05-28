"use client"

import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { usePosts } from "@/hooks/use-posts"
import { searchPosts } from "@/lib/posts-client"
import { LoadingSpinner } from "@/components/loading-spinner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"
import { withBasePath } from "@/lib/utils"

// Lazy load components for better initial page load
const PostCard = lazy(() => import("@/components/post-card"))
const SearchBar = lazy(() => import("@/components/search-bar").then(m => ({ default: m.SearchBar })))

export default function SearchPage() {
  const { posts, loading, error } = usePosts()
  const [searchQuery, setSearchQuery] = useState("")
  
  const searchParams = useSearchParams()
  const initialQuery = searchParams?.get('q') ?? ""

  // Set initial search query from URL params
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery)
    }
  }, [initialQuery])

  // Advanced search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }

    const query = searchQuery.toLowerCase()
    const results = posts.filter((post) => {
      const titleMatch = post.title?.toLowerCase().includes(query) || false
      const excerptMatch = post.excerpt?.toLowerCase().includes(query) || false
      const contentMatch = post.content?.toLowerCase().includes(query) || false
      const categoryMatch = post.categories?.some(category => 
        category?.toLowerCase().includes(query)
      ) || false
      const ownerMatch = post.owner?.name?.toLowerCase().includes(query) || false

      return titleMatch || excerptMatch || contentMatch || categoryMatch || ownerMatch
    })

    // Sort by relevance (title matches first, then excerpt, then content)
    return results.sort((a, b) => {
      const aTitle = a.title?.toLowerCase().includes(query) ? 3 : 0
      const aExcerpt = a.excerpt?.toLowerCase().includes(query) ? 2 : 0
      const aCategory = a.categories?.some(cat => cat?.toLowerCase().includes(query)) ? 1 : 0
      
      const bTitle = b.title?.toLowerCase().includes(query) ? 3 : 0
      const bExcerpt = b.excerpt?.toLowerCase().includes(query) ? 2 : 0
      const bCategory = b.categories?.some(cat => cat?.toLowerCase().includes(query)) ? 1 : 0
      
      const aScore = aTitle + aExcerpt + aCategory
      const bScore = bTitle + bExcerpt + bCategory
      
      return bScore - aScore
    })
  }, [posts, searchQuery])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // Update URL without navigation
    const url = new URL(window.location.href)
    if (query) {
      url.searchParams.set('q', query)
    } else {
      url.searchParams.delete('q')
    }
    window.history.replaceState(null, '', url.toString())
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    const url = new URL(window.location.href)
    url.searchParams.delete('q')
    window.history.replaceState(null, '', url.toString())
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

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Search Posts</h1>
          <p className="text-muted-foreground">Find articles by title, content, or category</p>
        </div>
        <Link href={"/blog"}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="max-w-2xl">
          <Suspense fallback={<LoadingSpinner />}>
            <SearchBar 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search posts, categories, content..."
              className="w-full max-w-none"
            />
          </Suspense>
        </div>
      </div>

      {searchQuery && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-lg font-medium">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            <button 
              onClick={handleClearSearch}
              className="text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {searchQuery && searchResults.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((post) => (
            <Suspense key={post.id} fallback={<LoadingSpinner />}>
              <PostCard post={post} />
            </Suspense>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No posts found matching "{searchQuery}".</p>
          <p className="text-sm text-muted-foreground mb-4">
            Try different keywords or search terms.
          </p>
          <button 
            onClick={handleClearSearch}
            className="text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Enter a search term to find posts.</p>
          <p className="text-sm text-muted-foreground">
            You can search by title, content, categories, or author.
          </p>
        </div>
      )}
    </div>
  )
}
