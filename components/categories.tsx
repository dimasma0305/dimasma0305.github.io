"use client"

import { usePosts } from "@/hooks/use-posts"
import { getAllCategories } from "@/lib/posts-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { BookOpen, Folder } from "lucide-react"
import Link from "next/link"

export function Categories() {
  const { posts, loading } = usePosts()

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  const categories = getAllCategories(posts)

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No categories available yet.</p>
        </CardContent>
      </Card>
    )
  }

  // Count posts per category
  const categoriesWithCounts = categories.map((name) => ({
    name,
    count: posts.filter((post) => post.categories.includes(name)).length,
  }))

  // Sort by count (descending) then alphabetically
  categoriesWithCounts.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.name.localeCompare(b.name)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Categories
          <Badge variant="secondary" className="text-xs">
            {categories.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categoriesWithCounts.map(({ name, count }) => (
            <Link key={name} href={`/categories/${encodeURIComponent(name)}`}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">{name}</span>
                </div>
                <Badge variant="outline" className="group-hover:border-primary/50 transition-colors">
                  {count}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
