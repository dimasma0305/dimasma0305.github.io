"use client";

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NoteCard from "@/components/note-card";
import { SectionHeader } from "@/components/section-header";
import { useNotes } from "@/hooks/use-notes";

export default function NotesPageClient() {
  // useNotes shares a module cache that BackgroundPreloader warms during idle,
  // so arriving here from another page renders content with no skeleton flash.
  const { notes: loadedNotes, loading: isLoading, error, refresh } = useNotes();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Newest first.
  const notes = useMemo(
    () =>
      [...loadedNotes].sort(
        (a, b) =>
          new Date(b.created_time).getTime() -
          new Date(a.created_time).getTime(),
      ),
    [loadedNotes],
  );

  // Unique categories derived from the notes' categories arrays
  const categories = useMemo(() => {
    return Array.from(
      new Set(notes.flatMap((note) => note.categories || [])),
    ).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          (note.excerpt && note.excerpt.toLowerCase().includes(query)),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((note) =>
        note.categories?.includes(selectedCategory),
      );
    }

    return filtered;
  }, [notes, searchQuery, selectedCategory]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all-categories" ? null : value);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <SectionHeader
        titleAs="h1"
        index="02"
        eyebrow="Field notes"
        title="Notes"
        subtitle={
          <>
            Short reference notes and cheatsheets.{" "}
            <Link href="/blog" className="text-primary hover:underline">
              Read the blog →
            </Link>
          </>
        }
      />

      <div className="notes-collection-summary">
        <span>
          <strong>{isLoading ? "—" : notes.length}</strong> reference notes
        </span>
        <span>
          <strong>{isLoading ? "—" : categories.length}</strong> topics on the
          shelf
        </span>
        <span>Small discoveries, kept within reach.</span>
      </div>

      <div className="notes-toolbar flex flex-col gap-4 mb-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="notes-search"
            className="mb-2 block text-sm text-muted-foreground"
          >
            Search the notebook
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
            />
            <Input
              id="notes-search"
              type="search"
              placeholder="Search notes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="notes-category"
            className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Filter aria-hidden="true" className="h-3 w-3" />
            Topic
          </label>
          <Select
            value={selectedCategory || "all-categories"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="notes-category" className="w-full sm:w-[220px]">
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

      <p className="notes-result-count" role="status" aria-live="polite">
        {isLoading
          ? "Opening the notebook…"
          : error
            ? "Notes could not be loaded."
            : `${filteredNotes.length} ${filteredNotes.length === 1 ? "note" : "notes"}${selectedCategory ? ` in ${selectedCategory}` : " to explore"}${searchQuery ? ` matching “${searchQuery}”` : ""}`}
      </p>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-card p-6 mb-6"
        >
          <p>Unable to open the notebook right now.</p>
          <Button variant="outline" className="mt-3" onClick={refresh}>
            Try again
          </Button>
        </div>
      )}
      {isLoading ? (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-hidden="true"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border bg-card p-6">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : error ? null : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No notes found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedCategory
              ? "Try adjusting your search or filter criteria"
              : "No notes have been created yet"}
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        // items-start so short reference notes size to their content instead of
        // stretching to the tallest card and leaving dead space.
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
