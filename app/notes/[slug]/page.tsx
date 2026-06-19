import NotePageClient from "@/components/note-page-client"
import { generateNoteMetadata, NoteStructuredData } from "@/components/seo"
import { getNoteBySlugAtBuild } from "@/lib/notes-server"
import type { Metadata } from "next"
import type { ComponentProps } from "react"

// Generate static params for all notes
export async function generateStaticParams() {
  try {
    // Read the notes-index.json file directly from the file system during build
    const fs = require('fs')
    const path = require('path')

    // Use absolute path resolution
    const indexPath = path.join(process.cwd(), 'public', 'notes-index.json')
    console.log('📝 Reading notes index from:', indexPath)
    
    if (!fs.existsSync(indexPath)) {
      console.error('❌ Notes index file not found at:', indexPath)
      return []
    }

    const indexContent = fs.readFileSync(indexPath, 'utf8')
    const notesIndex = JSON.parse(indexContent)

    // Extract slugs from the notes-index.json format
    const slugs = notesIndex.posts?.all?.map((note: any) => note.slug) || []
    console.log('📝 Generated static params for', slugs.length, 'notes')
    
    // Return array of slug objects
    return slugs.map((slug: string) => ({
      slug: slug,
    }))
  } catch (error) {
    console.error('❌ Error generating static params for notes:', error)
    return []
  }
}

// Generate metadata for each note
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return generateNoteMetadata(slug)
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Pre-render the full note body at build time so the note text lands in the
  // static HTML (for crawlers, AI, and no-JS clients). Falls back to null on any
  // failure, in which case the client fetches the note as before.
  const initialNote = await getNoteBySlugAtBuild(slug)

  return (
    <>
      <NoteStructuredData slug={slug} />
      {/* notes-client's Note and note-page-client's local Note are field-identical
          except the vestigial NotionBlock branch of the `content` union (content is
          always an HTML string at runtime). Cast to the component's own prop type. */}
      <NotePageClient
        slug={slug}
        initialNote={
          (initialNote ?? undefined) as ComponentProps<typeof NotePageClient>["initialNote"]
        }
      />
    </>
  )
}
