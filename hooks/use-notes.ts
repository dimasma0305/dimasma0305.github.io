"use client"

import { useState, useEffect, useRef } from 'react'
import { Note, fetchNotes } from '@/lib/notes-client'

// Shared cache so a warmed list (see warmNotesCache) lets the notes page render
// content immediately on navigation instead of flashing a skeleton.
let sharedNotesCache: Note[] | null = null
let notesCacheTimestamp = 0
const NOTES_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const isNotesCacheValid = () =>
  !!sharedNotesCache && Date.now() - notesCacheTimestamp < NOTES_CACHE_DURATION

/**
 * Populate the shared notes cache ahead of navigation (BackgroundPreloader,
 * during idle) so useNotes initializes with loading:false.
 */
export async function warmNotesCache(): Promise<void> {
  if (isNotesCacheValid()) return
  try {
    const data = await fetchNotes()
    if (data) {
      sharedNotesCache = data
      notesCacheTimestamp = Date.now()
    }
  } catch {
    /* best-effort warm; the hook will retry on mount */
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(sharedNotesCache || [])
  const [loading, setLoading] = useState(!isNotesCacheValid())
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const loadNotes = async (force = false) => {
    try {
      if (!force && isNotesCacheValid()) {
        setNotes(sharedNotesCache!)
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      const data = await fetchNotes()
      if (!mountedRef.current) return
      sharedNotesCache = data
      notesCacheTimestamp = Date.now()
      setNotes(data)
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load notes')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    loadNotes()
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refresh = async () => {
    await loadNotes(true)
  }

  return {
    notes,
    loading,
    error,
    refresh,
  }
}
