"use client"

import { useNotes } from "@/hooks/use-notes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategoriesProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export function Categories({ selectedCategory, onSelectCategory }: CategoriesProps) {
  const { notes } = useNotes()

  // Get unique categories and their counts
  const categories = notes.reduce((acc, note) => {
    note.categories.forEach(category => {
      acc[category] = (acc[category] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Categories</h3>
        <div className="mt-4 space-y-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectCategory(null)}
          >
            All Categories
            <span className="ml-auto text-muted-foreground">
              {notes.length}
            </span>
          </Button>
          {Object.entries(categories)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, count]) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSelectCategory(category)}
              >
                {category}
                <span className="ml-auto text-muted-foreground">
                  {count}
                </span>
              </Button>
            ))}
        </div>
      </div>
    </div>
  )
}
