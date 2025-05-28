"use client"

import { useEffect, useState } from "react"
import { type NotesStats as NotesStatsType, fetchNotesStats } from "@/lib/notes-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Folder, ExternalLink, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function NotesStats() {
  const [stats, setStats] = useState<NotesStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchNotesStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats")
        console.error("Error loading stats:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Failed to load statistics</p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="text-2xl font-bold text-primary">{stats.totalNotes}</div>
            <div className="text-xs text-muted-foreground">Total Notes</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg border">
            <div className="text-2xl font-bold">{stats.categories.length}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-3">
          {stats.notesWithNotionLinks > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Notion Links</span>
              </div>
              <Badge variant="secondary">{stats.notesWithNotionLinks}</Badge>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Categories</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {stats.categories.slice(0, 6).map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {stats.categories.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{stats.categories.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Updated {formatDate(stats.lastGenerated)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
