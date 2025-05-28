"use client"

import { useState, useEffect } from 'react'
import { Note, fetchNotes } from '@/lib/notes-client'

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchNotes()
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const refresh = async () => {
    await loadNotes()
  }

  return {
    notes,
    loading,
    error,
    refresh
  }
}
