"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", query)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Search">
        <Search className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Search Posts</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex items-center space-x-2">
              <Input
                type="search"
                placeholder="Search for posts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit">Search</Button>
            </div>
          </form>
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium">Recent Searches</h4>
            <ul className="space-y-1">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setQuery("CTF")
                    handleSearch(new Event("submit") as any)
                  }}
                >
                  CTF
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setQuery("RCE")
                    handleSearch(new Event("submit") as any)
                  }}
                >
                  RCE
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setQuery("Julia")
                    handleSearch(new Event("submit") as any)
                  }}
                >
                  Julia
                </Button>
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
