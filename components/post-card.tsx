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
  notionUrl,
}: {
  coverImage: string
  title: string
  iconEmoji?: string
  notionUrl?: string | null
}) => {
  // Only apply withBasePath to internal/relative paths, not external URLs
  const imageSrc = coverImage?.startsWith('http')
    ? coverImage
    : withBasePath(coverImage)

  return (
    <div className="relative w-full h-48 overflow-hidden bg-muted">
      {/* Token gradient fills the letterbox bars behind the object-contain cover
          (which is shown whole, never cropped). A static gradient — not a copy of
          the cover — so the box paints instantly and never eagerly fetches the
          image, leaving the lazy foreground to control the actual download. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-muted via-card to-muted"
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
      {/* Bottom-right keeps the badge clear of cover-art titles and banner
          strips (typically top/left); z-10 keeps it clickable above the
          card's stretched link overlay. */}
      {notionUrl && (
        <div className="absolute bottom-3 right-3 z-10">
          <NotionLinkButton notionUrl={notionUrl} variant="badge" />
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
        {post.coverImage ? (
          <CoverImage
            coverImage={post.coverImage}
            title={post.title}
            iconEmoji={post.iconEmoji}
            notionUrl={post.notionUrl}
          />
        ) : (
          /* Branded header keeps the grid rhythm when a post has no cover. */
          <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-card to-background">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/70">
              {post.categories?.[0] ?? "Writeup"}
            </span>
            {post.iconEmoji && (
              <div className="absolute flex items-center justify-center w-10 h-10 text-xl rounded-full bg-background/90 border border-border top-4 right-4 shadow-sm">
                {post.iconEmoji}
              </div>
            )}
            {post.notionUrl && (
              <div className="absolute bottom-3 right-3 z-10">
                <NotionLinkButton notionUrl={post.notionUrl} variant="badge" />
              </div>
            )}
          </div>
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
    </div>
  )
}

export default memo(PostCard)
