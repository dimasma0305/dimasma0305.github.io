"use client"

import { memo, useCallback, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

import type { Post } from "@/lib/posts-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FallbackImage } from "@/components/fallback-image"
import { NotionLinkButton } from "@/components/notion-link-button"
import { withBasePath } from "@/lib/utils"
import { fetchPostBySlug } from "@/lib/posts-loader"

interface PostCardProps {
  post: Post
}

// Memoized cover image component
const CoverImage = memo(({
  coverImage,
  title,
  iconEmoji,
}: {
  coverImage: string
  title: string
  iconEmoji?: string
}) => {
  // Only apply withBasePath to internal/relative paths, not external URLs
  const imageSrc = coverImage?.startsWith('http')
    ? coverImage
    : withBasePath(coverImage)

  return (
    <div className="relative w-full h-48 overflow-hidden bg-muted">
      {/* A blurred, zoomed copy of the cover fills the box so there are no empty
          bars; the real cover sits on top with object-contain, fully visible and
          never cropped. The backdrop is decorative (the foreground carries alt). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl opacity-60 transition-transform duration-300 group-hover:scale-125"
        style={{ backgroundImage: `url("${imageSrc}")` }}
      />
      <FallbackImage
        src={imageSrc}
        alt={title}
        fill
        className="object-contain transition-transform duration-300 group-hover:scale-105"
        fallbackSrc={withBasePath("/placeholder.svg?height=192&width=384")}
      />
      {iconEmoji && (
        <div className="absolute flex items-center justify-center w-10 h-10 text-xl rounded-full bg-background/90 border border-border top-4 right-4 shadow-sm">
          {iconEmoji}
        </div>
      )}
    </div>
  )
})

CoverImage.displayName = 'CoverImage'

// Memoized card footer
const PostFooter = memo(({ createdAt, categories }: { 
  createdAt: string
  categories: string[]
}) => {
  const formattedDate = useMemo(() => 
    format(new Date(createdAt), "MMM d, yyyy"), 
    [createdAt]
  )

  return (
    <CardFooter className="flex flex-wrap items-center justify-between">
      <div className="flex items-center text-sm text-muted-foreground">
        <Calendar className="w-4 h-4 mr-1" />
        <time dateTime={createdAt}>{formattedDate}</time>
      </div>
      {categories.length > 0 && (
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">
            {categories[0]}
          </Badge>
          {categories.length > 1 && (
            <Badge variant="outline" className="text-xs">
              +{categories.length - 1}
            </Badge>
          )}
        </div>
      )}
    </CardFooter>
  )
})

PostFooter.displayName = 'PostFooter'

// CSS-based hover effect only

function PostCard({ post }: PostCardProps) {
  // Memoize post URL
  const postUrl = useMemo(() => `/posts/${post.slug}`, [post.slug])
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const hasPrefetchedRef = useRef(false)

  const prefetch = useCallback(() => {
    if (hasPrefetchedRef.current) return
    hasPrefetchedRef.current = true
    try {
      router.prefetch(postUrl)
    } catch (_) {}
    // Warm the post content cache
    fetchPostBySlug(post.slug).catch(() => {})
  }, [router, postUrl, post.slug])

  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            prefetch()
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [prefetch])

  return (
    <div
      ref={cardRef}
      className="group relative transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-1"
    >
      <Card className="overflow-hidden h-full transition-shadow duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:shadow-[var(--elevation-2)]">
        {post.coverImage && (
          <CoverImage
            coverImage={post.coverImage}
            title={post.title}
            iconEmoji={post.iconEmoji}
          />
        )}

        <CardHeader className="pb-2">
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </CardContent>

        <PostFooter
          createdAt={post.createdAt}
          categories={post.categories as string[]}
        />
      </Card>

      {/* Stretched primary link — covers the card without nesting other controls */}
      <Link
        href={postUrl}
        onMouseEnter={prefetch}
        aria-label={post.title}
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />

      {post.notionUrl && (
        <div className="absolute top-4 left-4 z-10">
          <NotionLinkButton notionUrl={post.notionUrl} variant="badge" />
        </div>
      )}
    </div>
  )
}

export default memo(PostCard)
