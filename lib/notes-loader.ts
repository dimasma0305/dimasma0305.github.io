import fs from 'fs'
import path from 'path'
import type { Note, NotesIndex } from './notes-client'

const NOTES_INDEX_PATH = path.join(process.cwd(), 'public', 'notes', 'index.json')

export async function getNotesStats() {
  try {
    const indexContent = await fs.promises.readFile(NOTES_INDEX_PATH, 'utf8')
    const notesIndex: NotesIndex = JSON.parse(indexContent)

    // Get unique categories
    const categories = new Set<string>()
    notesIndex.posts.all.forEach(note => {
      note.categories.forEach(category => categories.add(category))
    })

    // Count notes with Notion links
    const notesWithNotionLinks = notesIndex.posts.all.filter(note => note.public_url).length

    return {
      totalNotes: notesIndex.meta.total_posts,
      categories: Array.from(categories),
      lastGenerated: notesIndex.meta.generated_at,
      notesWithNotionLinks
    }
  } catch (error) {
    console.error('Error loading notes stats:', error)
    throw error
  }
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  try {
    const indexContent = await fs.promises.readFile(NOTES_INDEX_PATH, 'utf8')
    const notesIndex: NotesIndex = JSON.parse(indexContent)

    const note = notesIndex.posts.all.find(note => note.slug === slug)
    if (!note) {
      return null
    }

    // Load the full note content
    const noteContentPath = path.join(process.cwd(), 'public', 'notes', note.folder, 'post.json')
    const noteContent = await fs.promises.readFile(noteContentPath, 'utf8')
    const fullNote = JSON.parse(noteContent)

    return {
      ...note,
      content: fullNote.post.content
    }
  } catch (error) {
    console.error('Error loading note by slug:', error)
    throw error
  }
}

export async function getAllNotes(): Promise<Note[]> {
  try {
    const indexContent = await fs.promises.readFile(NOTES_INDEX_PATH, 'utf8')
    const notesIndex: NotesIndex = JSON.parse(indexContent)
    return notesIndex.posts.all
  } catch (error) {
    console.error('Error loading all notes:', error)
    throw error
  }
}
