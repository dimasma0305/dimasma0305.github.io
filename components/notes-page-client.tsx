"use client"

import { useState, useEffect } from "react"
import { Search, Filter } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NoteCard from "@/components/note-card"
import { NotesStats } from "@/components/notes-stats"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Note {
  id: string
  slug: string
  title: string
  category: string
  created_time: string
  last_edited_time: string
  excerpt?: string
  folder: string
  url: string
  archived: boolean
  properties: {
    published: boolean
    featured: boolean
    author: string
  }
}

export default function NotesPageClient() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchNotes() {
      try {
        setIsLoading(true)
        const response = await fetch("/notes/index.json")
        if (!response.ok) {
          throw new Error("Failed to fetch notes")
        }

        const data = await response.json()
        const notesData = data.posts || []

        // Sort notes by date (newest first)
        const sortedNotes = notesData.sort((a: Note, b: Note) => {
          return new Date(b.created_time).getTime() - new Date(a.created_time).getTime()
        })

        setNotes(sortedNotes)
        setFilteredNotes(sortedNotes)

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(sortedNotes.map((note: Note) => note.category).filter(Boolean)),
        ) as string[]

        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching notes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [])

  useEffect(() => {
    // Filter notes based on search query and selected category
    let filtered = [...notes]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) || (note.excerpt && note.excerpt.toLowerCase().includes(query)),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((note) => note.category === selectedCategory)
    }

    setFilteredNotes(filtered)
  }, [searchQuery, selectedCategory, notes])

  const handleCategoryChange = (value: string) => {
    if (value === "all-categories") {
      setSelectedCategory(null)
    } else {
      setSelectedCategory(value)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notes</h1>

      <NotesStats />

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
            <SelectTrigger className="w-[180px]">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={{
                id: note.id,
                slug: note.slug,
                title: note.title,
                categories: [note.category].filter(Boolean),
                created_time: note.created_time,
                last_edited_time: note.last_edited_time,
                excerpt: note.excerpt,
                folder: note.folder,
                url: note.url,
                archived: note.archived,
                properties: note.properties,
                tags: [],
                reading_time: undefined,
                public_url: undefined,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
