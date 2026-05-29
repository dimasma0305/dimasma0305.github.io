"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter } from "lucide-react"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NoteCard from "@/components/note-card"
import { NotesStats } from "@/components/notes-stats"
import { LoadingSpinner } from "@/components/loading-spinner"
import { fetchNotes, type Note } from "@/lib/notes-client"

export default function NotesPageClient() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadNotes() {
      try {
        setIsLoading(true)
        const data = await fetchNotes()
        if (!active) return
        // Sort newest first
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime(),
        )
        setNotes(sorted)
      } catch (error) {
        console.error("Error fetching notes:", error)
        if (active) setNotes([])
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadNotes()
    return () => {
      active = false
    }
  }, [])

  // Unique categories derived from the notes' categories arrays
  const categories = useMemo(() => {
    return Array.from(new Set(notes.flatMap((note) => note.categories || []))).sort()
  }, [notes])

  const filteredNotes = useMemo(() => {
    let filtered = notes

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          (note.excerpt && note.excerpt.toLowerCase().includes(query)),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((note) => note.categories?.includes(selectedCategory))
    }

    return filtered
  }, [notes, searchQuery, selectedCategory])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all-categories" ? null : value)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground mt-4">Loading notes...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
        <p className="text-sm text-muted-foreground">
          Short reference notes and cheatsheets.{" "}
          <Link href="/blog" className="text-primary hover:underline">
            Read the blog →
          </Link>
        </p>
      </div>

      <NotesStats />

      <div className="flex flex-col gap-4 mb-8 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory || "all-categories"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No notes found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedCategory
              ? "Try adjusting your search or filter criteria"
              : "No notes have been created yet"}
          </p>
          <Button
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory(null)
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
