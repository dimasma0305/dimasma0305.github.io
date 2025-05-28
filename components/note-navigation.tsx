"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotes } from "@/hooks/use-notes"
import type { Note } from "@/lib/notes-client"

interface NoteNavigationProps {
  currentSlug: string
}

export function NoteNavigation({ currentSlug }: NoteNavigationProps) {
  const [prevNote, setPrevNote] = useState<Note | null>(null)
  const [nextNote, setNextNote] = useState<Note | null>(null)
  const { notes } = useNotes()

  useEffect(() => {
    if (notes.length > 0) {
      const currentIndex = notes.findIndex(note => note.slug === currentSlug)
      if (currentIndex > 0) {
        setPrevNote(notes[currentIndex - 1])
      }
      if (currentIndex < notes.length - 1) {
        setNextNote(notes[currentIndex + 1])
      }
    }
  }, [notes, currentSlug])

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-12 pt-6 border-t">
      {prevNote ? (
        <Link href={`/notes/${prevNote.slug}`} className="flex-1 sm:flex-initial">
          <Button variant="ghost" className="flex items-center gap-2 h-auto p-3 w-full sm:w-auto justify-start">
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <div className="text-left min-w-0 flex-1 sm:max-w-[200px]">
              <div className="text-xs text-muted-foreground mb-1">Previous</div>
              <span className="line-clamp-2 break-words text-sm font-medium">{prevNote.title}</span>
            </div>
          </Button>
        </Link>
      ) : (
        <div className="flex-1 sm:flex-initial" />
      )}

      {nextNote ? (
        <Link href={`/notes/${nextNote.slug}`} className="flex-1 sm:flex-initial">
          <Button variant="ghost" className="flex items-center gap-2 h-auto p-3 w-full sm:w-auto justify-end sm:flex-row-reverse">
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
            <div className="text-right min-w-0 flex-1 sm:max-w-[200px]">
              <div className="text-xs text-muted-foreground mb-1">Next</div>
              <span className="line-clamp-2 break-words text-sm font-medium">{nextNote.title}</span>
            </div>
          </Button>
        </Link>
      ) : (
        <div className="flex-1 sm:flex-initial" />
      )}
    </div>
  )
}
