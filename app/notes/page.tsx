import { generateNotesMetadata, NotesStructuredData } from "@/components/seo"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import NotesPageClient from "@/components/notes-page-client"

export const metadata = generateNotesMetadata()

export default function NotesPage() {
  return (
    <>
      <NotesStructuredData />
      <Suspense fallback={
        <div className="container px-4 py-12 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground mt-4">Loading notes...</p>
          </div>
        </div>
      }>
        <NotesPageClient />
      </Suspense>
    </>
  )
}
