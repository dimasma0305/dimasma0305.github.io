"use client"

import { useEffect, useState } from "react"
import { getBlogStats } from "@/lib/posts-loader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Folder, ExternalLink } from "lucide-react"

interface BlogStats {
  totalPosts: number
  categories: string[]
  lastGenerated: string
  postsWithNotionLinks?: number
}

export function BlogStats() {
  const [stats, setStats] = useState<BlogStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const blogStats = await getBlogStats()
        if (blogStats) {
          setStats(blogStats)
        }
      } catch (error) {
        console.error("Error loading blog stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Blog Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-semibold">{stats.totalPosts}</span> posts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-semibold">{stats.categories.length}</span> categories
          </span>
        </div>

        {stats.postsWithNotionLinks !== undefined && (
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">{stats.postsWithNotionLinks}</span> with Notion links
            </span>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Categories:</div>
          <div className="flex flex-wrap gap-1">
            {stats.categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Updated: {formatDate(stats.lastGenerated)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
