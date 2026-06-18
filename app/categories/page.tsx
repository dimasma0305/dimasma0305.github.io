"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Folder } from "lucide-react"
import { fetchAllPosts } from "@/lib/posts-loader"
import { getAllCategories, getPostsByCategory } from "@/lib/posts-client"
import type { Post } from "@/lib/posts-client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CardSkeleton } from "@/components/card-skeleton"
import { SectionHeader } from "@/components/section-header"

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

  // Build one summary per category (count + latest post), biggest topics first
  // so the page leads with what the site is actually about.
  const summaries = getAllCategories(posts)
    .map((category) => {
      const categoryPosts = getPostsByCategory(posts, category)
      return { category, count: categoryPosts.length, latest: categoryPosts[0] }
    })
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl">
      <SectionHeader
        titleAs="h1"
        eyebrow="Browse"
        title="Categories"
        subtitle="Pick a topic to explore related writeups and notes."
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : summaries.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map(({ category, count, latest }) => (
            <Link
              key={category}
              href={`/categories/${encodeURIComponent(category.toLowerCase())}`}
              className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="h-full transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[var(--elevation-2)]">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:bg-primary/20">
                    <Folder className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {category}
                      </h2>
                      <Badge variant="secondary" className="shrink-0">
                        {count} post{count !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {latest && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                        Latest: {latest.title}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No categories yet. New writeups will show up here grouped by topic.
          </p>
        </div>
      )}
    </div>
  )
}
