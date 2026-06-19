"use client"

import { useEffect, useState } from "react"
import { type NotesStats as NotesStatsType, fetchNotesStats } from "@/lib/notes-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

function Metric({
  value,
  label,
  accent = false,
}: {
  value: number
  label: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col">
      <span
        className={`font-mono text-2xl font-bold leading-none ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

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
      <Card className="mb-8">
        <CardContent className="flex flex-wrap items-center gap-6 p-5">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="ml-auto h-6 w-48" />
        </CardContent>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card className="mb-8 border-destructive/20">
        <CardContent className="p-5">
          <p className="text-sm text-destructive">Failed to load statistics</p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  return (
    <Card className="mb-8">
      <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:gap-8">
        {/* Compact metric row — no ballooning tiles */}
        <div className="flex items-center gap-6">
          <Metric value={stats.totalNotes} label="Notes" accent />
          <div aria-hidden className="h-9 w-px bg-border" />
          <Metric value={stats.categories.length} label="Categories" />
          {stats.notesWithNotionLinks > 0 && (
            <>
              <div aria-hidden className="h-9 w-px bg-border" />
              <Metric value={stats.notesWithNotionLinks} label="Notion linked" />
            </>
          )}
        </div>

        {/* Categories + freshness */}
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex flex-wrap gap-1.5">
            {stats.categories.slice(0, 6).map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {stats.categories.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{stats.categories.length - 6} more
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar aria-hidden className="h-3 w-3" />
            <span>Updated {formatDate(stats.lastGenerated)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
