import NotePageClient from "@/components/note-page-client"
import { generateNoteMetadata, NoteStructuredData } from "@/components/seo"
import type { Metadata } from "next"

// Generate static params for all notes
export async function generateStaticParams() {
  try {
    // Read the notes-index.json file directly from the file system during build
    const fs = require("fs")
    const path = require("path")

    const indexPath = path.join(process.cwd(), "public", "notes-index.json")
    const indexContent = fs.readFileSync(indexPath, "utf8")
    const notesIndex = JSON.parse(indexContent)

    // Extract slugs from the notes-index.json format
    const slugs = notesIndex.posts?.all?.map((note: any) => note.slug) || []

    return slugs.map((slug: string) => ({
      slug: slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

// Generate metadata for each note
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return generateNoteMetadata((await params).slug)
}

export default async function NotePage({ params }: { params: { slug: string } }) {
  return (
    <>
      <NoteStructuredData slug={(await params).slug} />
      <NotePageClient slug={(await params).slug} />
    </>
  )
}
