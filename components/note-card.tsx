"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Clock, ExternalLink, Folder, Tag } from "lucide-react"
import type { Note } from "@/lib/notes-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { NotionLinkButton } from "@/components/notion-link-button"

interface NoteCardProps {
  note: Note
  className?: string
}

export default function NoteCard({ note, className }: NoteCardProps) {
  return (
    <Card className={cn("group overflow-hidden hover:shadow-lg transition-shadow", className)}>
      <Link href={`/notes/${note.slug}`}>
        <CardContent className="p-4 flex flex-col h-full">
          {/* Categories */}
          {note.categories && note.categories.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Folder className="h-3 w-3 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {note.categories.slice(0, 3).map((category) => (
                  <span key={category} className="text-xs px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
                    {category}
                  </span>
                ))}
                {note.categories.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
                    +{note.categories.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {note.title}
          </h3>

          {/* Excerpt */}
          {note.excerpt && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{note.excerpt}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <time dateTime={note.created_time}>{format(new Date(note.created_time), "MMM d, yyyy")}</time>
              </div>
              {note.reading_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{note.reading_time} min</span>
                </div>
              )}
            </div>

            {note.public_url && (
              <NotionLinkButton notionUrl={note.public_url} variant="badge" />
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
