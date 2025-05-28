"use client"

import { useEffect, useState, useMemo, useCallback, memo, useRef, Suspense, lazy } from "react"
import { usePosts } from "@/hooks/use-posts"
import PostCard from "@/components/post-card"
import { SearchBar } from "@/components/search-bar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { Post } from "@/lib/posts-client"

// Lazy load sidebar components for better initial page load
const BlogStats = lazy(() => import("@/components/blog-stats").then(m => ({ default: m.BlogStats })))
const BlogCategories = lazy(() => import("@/components/blog-categories").then(m => ({ default: m.BlogCategories })))

// Memoized error component
const ErrorDisplay = memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
    <p className="text-destructive text-sm">{error}</p>
    <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
      Try Again
    </Button>
  </div>
))

ErrorDisplay.displayName = "ErrorDisplay"

// Memoized search results display
const SearchResults = memo(
  ({
    query,
    resultCount,
    totalCount,
    onClear,
  }: {
    query: string
    resultCount: number
    totalCount: number
    onClear: () => void
  }) => (
    <div className="mb-6 flex items-center gap-2">
      <p className="text-sm text-muted-foreground">
        {resultCount} result{resultCount !== 1 ? "s" : ""} for "{query}"
      </p>
      <button onClick={onClear} className="text-sm text-primary hover:underline">
        Clear search
      </button>
    </div>
  ),
)

SearchResults.displayName = "SearchResults"

// Memoized posts grid with virtual scrolling for large lists
const PostsGrid = memo(({ posts }: { posts: Post[] }) => {
  const [visiblePosts, setVisiblePosts] = useState(12) // Initial batch
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Load more posts when scrolling near bottom
  useEffect(() => {
    if (!loadMoreRef.current || posts.length <= visiblePosts) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visiblePosts < posts.length) {
          setVisiblePosts((prev) => Math.min(prev + 6, posts.length))
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [posts.length, visiblePosts])

  // Reset visible posts when posts change
  useEffect(() => {
    setVisiblePosts(12)
  }, [posts])

  const displayedPosts = useMemo(() => posts.slice(0, visiblePosts), [posts, visiblePosts])

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {displayedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {visiblePosts < posts.length && (
        <div ref={loadMoreRef} className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Showing {visiblePosts} of {posts.length} posts
          </p>
        </div>
      )}
    </>
  )
})

PostsGrid.displayName = "PostsGrid"

// Memoized empty states
const EmptyState = memo(
  ({
    searchQuery,
    onClearSearch,
  }: {
    searchQuery: string
    onClearSearch?: () => void
  }) => (
    <div className="text-center py-12">
      {searchQuery ? (
        <>
          <p className="text-muted-foreground">No posts found matching "{searchQuery}".</p>
          {onClearSearch && (
            <button onClick={onClearSearch} className="mt-2 text-primary hover:underline">
              Clear search to see all posts
            </button>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">No posts found. Add markdown files to the /posts directory.</p>
      )}
    </div>
  ),
)

EmptyState.displayName = "EmptyState"

// Memoized sidebar with lazy loaded components
const Sidebar = memo(({ posts }: { posts: Post[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="w-full lg:w-1/4 space-y-6">
      <Suspense fallback={<div className="h-32 bg-muted/20 rounded-lg animate-pulse" />}>
        <BlogStats />
      </Suspense>
      <Suspense fallback={<div className="h-48 bg-muted/20 rounded-lg animate-pulse" />}>
        <BlogCategories 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </Suspense>
    </div>
  )
})

Sidebar.displayName = "Sidebar"

function BlogPageClient() {
  const { posts, loading, refreshing, error, refresh } = usePosts()
  const [searchQuery, setSearchQuery] = useState("")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Optimized search function with debouncing
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts
    }

    const query = searchQuery.toLowerCase().trim()

    // Early exit for empty query
    if (!query) return posts

    return posts.filter((post) => {
      // Quick string includes check (most common case)
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.categories.some((cat) => cat.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query))
      )
    })
  }, [posts, searchQuery])

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(query)
    }, 150) // Reduced debounce for better responsiveness
  }, [])

  const handleClearSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    setSearchQuery("")
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <SearchBar 
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search posts..."
        />
      </div>

      {searchQuery && (
        <SearchResults
          query={searchQuery}
          resultCount={filteredPosts.length}
          totalCount={posts.length}
          onClear={handleClearSearch}
        />
      )}

      {error && <ErrorDisplay error={error} onRetry={refresh} />}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-3/4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground mt-4">Loading posts...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <PostsGrid posts={filteredPosts} />
          ) : (
            <EmptyState searchQuery={searchQuery} onClearSearch={handleClearSearch} />
          )}
        </div>

        <Sidebar posts={posts ? posts : []} />
      </div>
    </div>
  )
}

export default memo(BlogPageClient)
