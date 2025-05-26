"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchAllPosts } from "@/lib/posts-loader"
import type { Post } from "@/lib/posts-client"
import { withBasePath } from "@/lib/utils"

interface PostNavigationProps {
  currentSlug: string
}

export function PostNavigation({ currentSlug }: PostNavigationProps) {
  const [prevPost, setPrevPost] = useState<Post | null>(null)
  const [nextPost, setNextPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdjacentPosts = async () => {
      try {
        const allPosts = await fetchAllPosts()

        // Sort posts by date
        const sortedPosts = [...allPosts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        // Find the index of the current post
        const currentIndex = sortedPosts.findIndex((post) => post.slug === currentSlug)

        if (currentIndex > 0) {
          setPrevPost(sortedPosts[currentIndex - 1])
        }

        if (currentIndex < sortedPosts.length - 1 && currentIndex !== -1) {
          setNextPost(sortedPosts[currentIndex + 1])
        }
      } catch (error) {
        console.error("Error fetching adjacent posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdjacentPosts()
  }, [currentSlug])

  if (loading) {
    return (
      <div className="flex justify-between mt-12 pt-6 border-t">
        <div className="w-32 h-10 rounded-lg animate-pulse bg-muted"></div>
        <div className="w-32 h-10 rounded-lg animate-pulse bg-muted"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-12 pt-6 border-t">
      {prevPost ? (
        <Link href={`/posts/${prevPost.slug}`} className="flex-1 sm:flex-initial">
          <Button variant="ghost" className="flex items-center gap-2 h-auto p-3 w-full sm:w-auto justify-start">
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <div className="text-left min-w-0 flex-1 sm:max-w-[200px]">
              <div className="text-xs text-muted-foreground mb-1">Previous</div>
              <span className="line-clamp-2 break-words text-sm font-medium">{prevPost.title}</span>
            </div>
          </Button>
        </Link>
      ) : (
        <div className="flex-1 sm:flex-initial" />
      )}

      {nextPost ? (
        <Link href={`/posts/${nextPost.slug}`} className="flex-1 sm:flex-initial">
          <Button variant="ghost" className="flex items-center gap-2 h-auto p-3 w-full sm:w-auto justify-end sm:flex-row-reverse">
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
            <div className="text-right min-w-0 flex-1 sm:max-w-[200px]">
              <div className="text-xs text-muted-foreground mb-1">Next</div>
              <span className="line-clamp-2 break-words text-sm font-medium">{nextPost.title}</span>
            </div>
          </Button>
        </Link>
      ) : (
        <div className="flex-1 sm:flex-initial" />
      )}
    </div>
  )
}
