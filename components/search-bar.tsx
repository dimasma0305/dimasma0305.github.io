"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search posts...",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState("")

  // Debounce search to avoid too many calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, onSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative flex w-full max-w-sm items-center ${className}`}
    >
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-20"
      />
      
      {query && (
        <Button 
          type="button"
          variant="ghost" 
          size="icon" 
          onClick={handleClear}
          className="absolute right-8 h-8 w-8"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
      
      <Button 
        type="submit" 
        variant="ghost" 
        size="icon" 
        className="absolute right-0 h-8 w-8"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}
