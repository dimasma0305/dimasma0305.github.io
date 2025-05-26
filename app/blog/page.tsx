import { generateBlogMetadata, BlogStructuredData } from "@/components/seo"
import { Suspense, lazy } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

// Lazy load BlogPageClient for better initial page load
const BlogPageClient = lazy(() => import("@/components/blog-page-client"))

export const metadata = generateBlogMetadata()

export default function BlogPage() {
  return (
    <>
      <BlogStructuredData />
      <Suspense fallback={
        <div className="container px-4 py-12 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground mt-4">Loading blog...</p>
          </div>
        </div>
      }>
        <BlogPageClient />
      </Suspense>
    </>
  )
}
