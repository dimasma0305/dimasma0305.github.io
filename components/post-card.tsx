"use client"

import { memo, useCallback, useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Calendar } from "lucide-react"

import type { Post } from "@/lib/posts-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FallbackImage } from "@/components/fallback-image"
import { NotionLinkButton } from "@/components/notion-link-button"
import { withBasePath } from "@/lib/utils"

interface PostCardProps {
  post: Post
}

// Memoized Notion button with optimized click handling
const NotionButton = memo(({ notionUrl }: { notionUrl: string }) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div className="absolute top-4 left-4" onClick={handleClick}>
      <NotionLinkButton notionUrl={notionUrl} variant="badge" />
    </div>
  )
})

NotionButton.displayName = 'NotionButton'

// Memoized cover image component
const CoverImage = memo(({ 
  coverImage, 
  title, 
  iconEmoji, 
  notionUrl 
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
    <div className="relative w-full h-48 overflow-hidden">
      <FallbackImage
        src={imageSrc}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        fallbackSrc={withBasePath("/placeholder.svg?height=192&width=384")}
      />
      {iconEmoji && (
        <div className="absolute flex items-center justify-center w-10 h-10 text-xl bg-white rounded-full dark:bg-gray-800 top-4 right-4 shadow-sm">
          {iconEmoji}
        </div>
      )}
      {notionUrl && <NotionButton notionUrl={notionUrl} />}
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

// Optimized animation variants
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -5 }
}

function PostCard({ post }: PostCardProps) {
  // Memoize post URL
  const postUrl = useMemo(() => `/posts/${post.slug}`, [post.slug])

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <Link href={postUrl} prefetch={false}>
        <Card className="overflow-hidden h-full transition-shadow duration-200 hover:shadow-lg">
          {post.coverImage && (
            <CoverImage
              coverImage={post.coverImage}
              title={post.title}
              iconEmoji={post.iconEmoji}
              notionUrl={post.notionUrl}
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
      </Link>
    </motion.div>
  )
}

export default memo(PostCard)
