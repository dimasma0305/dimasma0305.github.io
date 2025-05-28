"use client"

import { useState, useEffect, lazy, Suspense, memo } from "react"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Tag, Clock, Share2, Folder, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { withBasePath } from "@/lib/utils"
import { handleHashOnPageLoad } from "@/lib/scroll-utils"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mdx } from "@/components/mdx"
import { LoadingSpinner } from "@/components/loading-spinner"
import { NotionLinkButton } from "@/components/notion-link-button"
import { useLazyLoadingReady } from "@/hooks/use-lazy-loading-ready"
import { convertNotionContentToHtml, type NotionBlock } from "@/lib/notion-content-utils"
import { TableOfContents } from "@/components/table-of-contents"

// Lazy load heavy components
const ShareButtons = lazy(() => import("@/components/share-buttons").then((m) => ({ default: m.ShareButtons })))
const NoteNavigation = lazy(() => import("@/components/note-navigation").then((m) => ({ default: m.NoteNavigation })))

// Memoized error component
const ErrorDisplay = memo(({ error }: { error: string }) => (
  <div className="container px-4 py-12 mx-auto max-w-7xl">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Note Not Found</h1>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Link href={"/notes"}>
        <Button>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes
        </Button>
      </Link>
    </div>
  </div>
))

ErrorDisplay.displayName = "ErrorDisplay"

// Memoized hero section
const NoteHero = memo(({ note }: { note: Note }) => {
  const createdDate = note.created_time ? new Date(note.created_time) : null
  const updatedDate = note.last_edited_time ? new Date(note.last_edited_time) : null

  return (
    <div className="bg-gradient-to-b from-muted/30 to-background border-b overflow-x-hidden">
      <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="max-w-4xl">
          {/* Back Button */}
          <Link href={"/notes"}>
            <Button variant="ghost" size="sm" className="mb-4 lg:mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all notes
            </Button>
          </Link>

          {/* Categories */}
          {note.categories && note.categories.length > 0 && (
            <div className="mb-4 lg:mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Folder className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {note.categories.map((category) => (
                  <Link key={category} href={`/categories/${encodeURIComponent(category.toLowerCase())}`}>
                    <Badge
                      variant="default"
                      className="text-sm px-3 py-1 hover:bg-primary/90 transition-colors cursor-pointer max-w-[200px] truncate"
                      title={category}
                    >
                      {category}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 lg:mb-6 leading-tight break-words">
            {note.title}
          </h1>

          {/* Excerpt */}
          {note.excerpt && (
            <p className="text-lg lg:text-xl text-muted-foreground mb-6 lg:mb-8 leading-relaxed max-w-3xl break-words">
              {note.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 lg:gap-6 text-sm">
            {/* Date */}
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <time dateTime={note.created_time} className="font-medium whitespace-nowrap">
                  {createdDate ? format(createdDate, "MMMM d, yyyy") : "Invalid Date"}
                </time>
                <p className="text-muted-foreground text-xs">Created</p>
              </div>
            </div>

            {/* Updated Date */}
            {note.last_edited_time && (
              <>
                <Separator orientation="vertical" className="h-12 hidden sm:block" />
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <time dateTime={note.last_edited_time} className="font-medium whitespace-nowrap">
                      {updatedDate ? format(updatedDate, "MMMM d, yyyy") : "Invalid Date"}
                    </time>
                    <p className="text-muted-foreground text-xs">Updated</p>
                  </div>
                </div>
              </>
            )}

            {/* Reading Time */}
            {note.content && (
              <>
                <Separator orientation="vertical" className="h-12 hidden sm:block" />
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium whitespace-nowrap">
                      {typeof note.content === 'string' ? estimateReadingTime(note.content) : 0} min read
                    </p>
                    <p className="text-muted-foreground text-xs">Reading time</p>
                  </div>
                </div>
              </>
            )}

            {/* Categories Count */}
            {note.categories && note.categories.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-12 hidden sm:block" />
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium whitespace-nowrap">{note.categories.length} categories</p>
                    <p className="text-muted-foreground text-xs">Topics covered</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-6 lg:mt-8">
            {note.public_url && <NotionLinkButton notionUrl={note.public_url} />}
            <Suspense fallback={<div>Loading Share Buttons...</div>}>
              <ShareButtons
                title={note.title}
                slug={note.slug}
                excerpt={note.excerpt}
                categories={note.categories}
                type="notes"
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
})

NoteHero.displayName = "NoteHero"

// Helper function to estimate reading time
const estimateReadingTime = (content: string) => {
  const wordsPerMinute = 200
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

interface Note {
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

interface NotesIndex {
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

interface NoteData {
  meta: {
    generated_at: string
    notion_api_version: string
    includes_content: boolean
    folder: string
    slug: string
  }
  post: NotePost
}

interface NotePost {
  id: string
  created_time: string
  last_edited_time: string
  url: string
  public_url?: string
  archived: boolean
  icon?: any
  cover?: any
  properties: any
  title: string
  content: NotionBlock[]
}

// Separate component for Table of Contents rendering
const NoteTOC = memo(({ content }: { content: string | NotionBlock[] }) => {
  const [tocContent, setTocContent] = useState<string>("")

  useEffect(() => {
    async function processContent() {
      let htmlContent: string
      if (typeof content === 'string') {
        htmlContent = content
      } else {
        htmlContent = await convertNotionContentToHtml(content)
      }
      setTocContent(htmlContent)
    }

    processContent()
  }, [content])

  if (!tocContent) return null

  return <TableOfContents content={tocContent} />
})

NoteTOC.displayName = "NoteTOC"

export default function NotePageClient({ slug }: { slug: string }) {
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tocContent, setTocContent] = useState<string>("")
  const isReady = useLazyLoadingReady()

  useEffect(() => {
    async function fetchNote() {
      try {
        setIsLoading(true)
        setError(null)

        const indexResponse = await fetch(withBasePath("/notes-index.json"))
        if (!indexResponse.ok) {
          throw new Error("Failed to fetch notes index")
        }

        const notesIndex: NotesIndex = await indexResponse.json()
        const noteInfo = notesIndex.posts.all.find((note) => note.slug === slug)

        if (!noteInfo) {
          throw new Error("Note not found in index")
        }

        const noteResponse = await fetch(withBasePath(`/notes/${noteInfo.folder}/post.json`))
        if (!noteResponse.ok) {
          throw new Error(`Failed to fetch note content: ${noteResponse.status}`)
        }

        const noteData: NoteData = await noteResponse.json()
        const htmlContent = await convertNotionContentToHtml(noteData.post.content)

        const fullNote: Note = {
          ...noteInfo,
          content: htmlContent,
          title: noteData.post.title,
          created_time: noteData.post.created_time,
          last_edited_time: noteData.post.last_edited_time,
          url: noteData.post.url,
          public_url: noteData.post.public_url,
        }

        setNote(fullNote)

        // Process TOC content
        const tocHtmlContent = fullNote.content 
          ? (typeof fullNote.content === 'string' 
              ? fullNote.content 
              : await convertNotionContentToHtml(fullNote.content))
          : ""
        setTocContent(tocHtmlContent)
      } catch (err) {
        console.error("Error fetching note:", err)
        setError(err instanceof Error ? err.message : "Failed to load note. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchNote()
    }
  }, [slug])

  // Handle scroll to hash on page load with lazy loading awareness
  useEffect(() => {
    if (!isLoading && note) {
      handleHashOnPageLoad({
        headerOffset: 80,
        behavior: "smooth",
        lazyLoadDelay: 250,
      })
    }
  }, [isLoading, note])

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !note) {
    return <ErrorDisplay error={error || "The requested note could not be found."} />
  }

  return (
    <div className="min-h-screen">
      <NoteHero note={note} />
      
      {/* Cover Image */}
      {note.featured_image && (
        <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8 overflow-x-hidden">
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden rounded-xl shadow-2xl">
            <Image
              src={note.featured_image || "/placeholder.svg"}
              alt={note.title}
              width={1200}
              height={600}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12 relative">
          {/* Article Content */}
          <div className="lg:col-span-3 min-w-0 overflow-x-hidden">
            {/* Table of Contents - Mobile */}
            {tocContent && (
              <div className="lg:hidden mb-8">
                <Suspense fallback={<div>Loading Table of Contents...</div>}>
                  <TableOfContents content={tocContent} />
                </Suspense>
              </div>
            )}

            {/* Article Body */}
            <article className="prose prose-lg dark:prose-invert max-w-none prose-pre:overflow-x-auto prose-code:break-words prose-p:break-words prose-headings:break-words">
              <div className="bg-card rounded-xl p-4 md:p-8 shadow-sm border overflow-hidden">
                {note.content && (
                  <NotionContent content={note.content} />
                )}
              </div>
            </article>

            {/* Note Footer */}
            <div className="mt-8 lg:mt-12 space-y-6 lg:space-y-8">
              {/* Categories - Detailed Section */}
              {note.categories && note.categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Folder className="w-5 h-5" />
                      Categories & Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This note is categorized under the following topics. Click on any category to explore more
                        related content.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {note.categories.map((category) => (
                          <Link key={category} href={`/categories/${encodeURIComponent(category.toLowerCase())}`}>
                            <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group min-w-0">
                              <div className="p-2 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                <Tag className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="font-medium group-hover:text-primary transition-colors truncate"
                                  title={category}
                                >
                                  {category}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Share Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Share2 className="w-5 h-5" />
                    Share this note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>Loading Share Buttons...</div>}>
                    <ShareButtons
                      title={note.title}
                      slug={note.slug}
                      excerpt={note.excerpt}
                      categories={note.categories}
                      type="notes"
                    />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Note Navigation */}
              <Suspense fallback={<div>Loading note navigation...</div>}>
                <NoteNavigation currentSlug={slug} />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4 lg:space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto sidebar-scroll-area">
              {/* Table of Contents - Desktop */}
              {tocContent && (
                <div className="hidden lg:block">
                  <Suspense fallback={<div>Loading Table of Contents...</div>}>
                    <TableOfContents content={tocContent} />
                  </Suspense>
                </div>
              )}

              {/* Categories Sidebar */}
              {note.categories && note.categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Folder className="w-5 h-5" />
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {note.categories.map((category) => (
                      <Link key={category} href={`/categories/${encodeURIComponent(category.toLowerCase())}`}>
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group min-w-0">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Tag className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                            <span
                              className="font-medium group-hover:text-primary transition-colors truncate"
                              title={category}
                            >
                              {category}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Separate component for rendering Notion content
function NotionContent({ 
  content, 
  renderToc 
}: { 
  content: string | NotionBlock[], 
  renderToc?: (content: string) => React.ReactNode 
}) {
  const [renderedContent, setRenderedContent] = useState<string>("")

  useEffect(() => {
    async function processContent() {
      let htmlContent: string
      if (typeof content === 'string') {
        htmlContent = content
      } else {
        htmlContent = await convertNotionContentToHtml(content)
      }
      setRenderedContent(htmlContent)
    }

    processContent()
  }, [content])

  // If renderToc is provided, return the TOC rendering
  if (renderToc) {
    return renderToc(renderedContent)
  }

  // Otherwise, render the Mdx content
  return renderedContent ? <Mdx content={renderedContent} /> : null
}
