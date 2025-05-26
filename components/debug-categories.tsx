"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { invalidateCache } from "@/lib/posts-loader"
import type { Post } from "@/lib/posts-client"

interface DebugCategoriesProps {
  posts: Post[]
}

export function DebugCategories({ posts }: DebugCategoriesProps) {
  const [showDebug, setShowDebug] = useState(false)

  const handleClearCache = () => {
    invalidateCache()
    window.location.reload() // Force a full page reload to clear all caches
  }

  if (!showDebug) {
    return (
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(true)}>
          Debug Categories
        </Button>
        <Button variant="outline" size="sm" onClick={handleClearCache}>
          Clear Cache & Reload
        </Button>
      </div>
    )
  }

  // Extract all categories from posts
  const allCategories = posts.flatMap((post) => post.categories || [])
  const uniqueCategories = [...new Set(allCategories)]
  const categoryCounts = uniqueCategories.map((cat) => ({
    name: cat,
    count: allCategories.filter((c) => c === cat).length,
  }))

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Debug: Categories Data
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClearCache}>
              Clear Cache & Reload
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
              ✕
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Total Posts: {posts.length}</h4>
            <h4 className="font-semibold">Unique Categories: {uniqueCategories.length}</h4>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Category Counts:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {categoryCounts.map(({ name, count }) => (
                <div key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span className="font-mono">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Sample Post Categories:</h4>
            <div className="space-y-2 text-sm">
              {posts.slice(0, 3).map((post) => (
                <div key={post.id} className="border-l-2 pl-2">
                  <div className="font-medium">{post.title}</div>
                  <div className="text-muted-foreground">Categories: {post.categories?.join(", ") || "None"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
