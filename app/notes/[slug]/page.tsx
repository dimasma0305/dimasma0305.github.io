import NotePageClient from "@/components/note-page-client"
import { generateNoteMetadata, NoteStructuredData } from "@/components/seo"
import type { Metadata } from "next"
import { Suspense } from "react"
import ShareButtons from "@/components/share-buttons"

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
  return (
    <>
      <NoteStructuredData slug={slug} />
      <NotePageClient slug={slug} />
    </>
  )
}
