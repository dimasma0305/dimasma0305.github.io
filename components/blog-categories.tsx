"use client"

import { usePosts } from "@/hooks/use-posts"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface BlogCategoriesProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export function BlogCategories({ selectedCategory, onSelectCategory }: BlogCategoriesProps) {
  const { posts } = usePosts()

  // Get unique categories and their counts
  const categories = posts.reduce((acc, post) => {
    post.categories?.forEach(category => {
      acc[category] = (acc[category] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Categories</h3>
        <div className="mt-4 space-y-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectCategory(null)}
          >
            All Categories
            <span className="ml-auto text-muted-foreground">
              {posts.length}
            </span>
          </Button>
          {Object.entries(categories)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, count]) => (
              <Link 
                key={category} 
                href={`/categories/${encodeURIComponent(category.toLowerCase())}`}
                className="block"
              >
                <Button
                  variant={selectedCategory === category ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onSelectCategory(category)}
                >
                  {category}
                  <span className="ml-auto text-muted-foreground">
                    {count}
                  </span>
                </Button>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
} 