import { withBasePath } from "@/lib/utils"

interface RichText {
  type: string
  content: string
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  href?: string
}

interface TableRow {
  type: 'table_row'
  content?: {
    cells: RichText[][]
  }
}

interface NotionBlock {
  id: string
  type: string
  created_time: string
  last_edited_time: string
  has_children: boolean
  archived: boolean
  content: {
    rich_text?: RichText[]
    language?: string
    caption?: RichText[]
    color?: string
    is_toggleable?: boolean
    table_width?: number
    has_column_header?: boolean
    has_row_header?: boolean
    cells?: RichText[][][]
    type?: string
    name?: string
    url?: string
    expiry_time?: string
  }
  children?: TableRow[]
}

export interface Note {
  id: string
  title: string
  slug: string
  folder: string
  excerpt?: string
  featured_image?: string
  created_time: string
  last_edited_time: string
  reading_time?: number
  url: string
  public_url?: string
  archived: boolean
  categories: string[]
  tags: string[]
  properties: {
    published: boolean
    featured: boolean
    author: string
  }
  content?: string | NotionBlock[]
}

export interface NotesIndex {
  meta: {
    generated_at: string
    total_posts: number
    published_posts: number
    draft_posts: number
    featured_posts: number
    total_tags: number
    total_categories: number
    posts_directory: string
  }
  taxonomy: {
    categories: Array<{
      name: string
      count: number
      slug: string
    }>
    tags: Array<{
      name: string
      count: number
      slug: string
    }>
  }
  posts: {
    all: Note[]
  }
}

export interface NotesStats {
  totalNotes: number
  categories: string[]
  lastGenerated: string
  notesWithNotionLinks: number
}

let cachedIndex: { data: NotesIndex; timestamp: number } | null = null
let pendingIndex: Promise<NotesIndex> | null = null
const INDEX_TTL = 5 * 60 * 1000

function fetchNotesIndex(force = false): Promise<NotesIndex> {
  if (!force && cachedIndex && Date.now() - cachedIndex.timestamp < INDEX_TTL) {
    return Promise.resolve(cachedIndex.data)
  }
  if (!force && pendingIndex) { return pendingIndex }
  if (force) { cachedIndex = null }
  const request = (async () => {
    const response = await fetch(withBasePath('/notes-index.json'))
    if (!response.ok) { throw new Error('Failed to fetch notes') }
    return await response.json() as NotesIndex
  })()
  pendingIndex = request
  return request.then(data => {
    if (pendingIndex === request) {
      cachedIndex = { data, timestamp: Date.now() }
      pendingIndex = null
    }
    return data
  }, error => {
    if (pendingIndex === request) { pendingIndex = null }
    throw error
  })
}

export async function fetchNotes(force = false): Promise<Note[]> {
  try {
    const data = await fetchNotesIndex(force)
    
    // Handle case where posts might be undefined
    const posts = data.posts?.all || []
    return posts.filter(note => note.properties.published && !note.archived)
  } catch (error) {
    console.error('Error fetching notes:', error)
    throw error
  }
}

export async function fetchNotesStats(): Promise<NotesStats> {
  try {
    const data = await fetchNotesIndex()
    
    // Get unique categories from taxonomy
    const categories = data.taxonomy?.categories?.map(cat => cat.name) || []

    // Count notes with Notion links from posts
    const notesWithNotionLinks = data.posts?.all?.filter(note => note.public_url)?.length || 0

    return {
      totalNotes: data.meta?.total_posts || 0,
      categories: categories,
      lastGenerated: data.meta?.generated_at || new Date().toISOString(),
      notesWithNotionLinks
    }
  } catch (error) {
    console.error('Error fetching notes stats:', error)
    throw error
  }
}

export async function fetchNoteBySlug(slug: string): Promise<Note | null> {
  try {
    const notes = await fetchNotes()
    return notes.find(note => note.slug === slug) || null
  } catch (error) {
    console.error('Error fetching note by slug:', error)
    throw error
  }
}
