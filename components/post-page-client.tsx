"use client"

import { useEffect, useState, lazy, Suspense } from "react"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Tag, Clock, Share2, Folder } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { withBasePath } from "@/lib/utils"
import { handleHashOnPageLoad } from "@/lib/scroll-utils"

import { fetchPostBySlug } from "@/lib/posts-loader"
import { usePosts } from "@/hooks/use-posts"
import type { Post } from "@/lib/posts-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import dynamic from "next/dynamic"
const Mdx = dynamic(() => import("@/components/mdx").then(m => m.Mdx), { ssr: false })
import { LoadingSpinner } from "@/components/loading-spinner"
import { NotionLinkButton } from "@/components/notion-link-button"

// Lazy load heavy components for better initial page load
const TableOfContents = lazy(() =>
  import("@/components/table-of-contents").then((m) => ({ default: m.TableOfContents })),
)
const ShareButtons = lazy(() => import("@/components/share-buttons").then((m) => ({ default: m.ShareButtons })))
const PostNavigation = lazy(() => import("@/components/post-navigation").then((m) => ({ default: m.PostNavigation })))

interface PostPageClientProps {
  slug: string
}

export default function PostPageClient({ slug }: PostPageClientProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { posts } = usePosts()

  useEffect(() => {
    const loadPost = async () => {
      try {
        const fetchedPost = await fetchPostBySlug(slug)
        if (!fetchedPost) {
          setError("Post not found")
          return
        }

        // Process the content if needed
        if (fetchedPost.content) {
          // Make sure code blocks have proper language classes
          fetchedPost.content = fetchedPost.content
            .replace(/<pre><code>/g, '<pre><code class="language-text">')
            .replace(/<pre><code class="language-(\w+)">/g, (match, lang) => {
              return `<pre><code class="language-${lang}">`
            })
        }

        setPost(fetchedPost)
      } catch (err) {
        console.error("Error loading post:", err)
        setError("Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadPost()
    }
  }, [slug])

  // Handle scroll to hash on page load with lazy loading awareness
  useEffect(() => {
    if (!loading && post) {
      handleHashOnPageLoad({
        headerOffset: 80,
        behavior: "smooth",
        lazyLoadDelay: 250,
      })
    }
  }, [loading, post])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "The requested post could not be found."}</p>
          <Link href={"/blog"}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate reading time
  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  // Get related posts
  const relatedPosts = posts
    .filter((p) => p.id !== post.id && p.categories?.some((cat) => post.categories?.includes(cat)))
    .slice(0, 3)

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-muted/30 to-background border-b overflow-x-hidden">
          <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8">
            <div className="max-w-4xl">
              {/* Back Button */}
              <Link href={"/blog"}>
                <Button variant="ghost" size="sm" className="mb-4 lg:mb-6 -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to all posts
                </Button>
              </Link>

              {/* Categories - Primary Display */}
              {post.categories && post.categories.length > 0 && (
                <div className="mb-4 lg:mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category) => (
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
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg lg:text-xl text-muted-foreground mb-6 lg:mb-8 leading-relaxed max-w-3xl break-words">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 lg:gap-6 text-sm">
                {/* Author */}
                {post.owner && (
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage
                        src={post.owner.avatar_url || withBasePath("/placeholder.svg")}
                        alt={post.owner.name}
                      />
                      <AvatarFallback>{post.owner.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[150px]">{post.owner.name}</p>
                      <p className="text-muted-foreground text-xs">Author</p>
                    </div>
                  </div>
                )}

                <Separator orientation="vertical" className="h-12 hidden sm:block" />

                {/* Date */}
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <time dateTime={post.createdAt} className="font-medium whitespace-nowrap">
                      {format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </time>
                    <p className="text-muted-foreground text-xs">Published</p>
                  </div>
                </div>

                {/* Reading Time */}
                {post.content && (
                  <>
                    <Separator orientation="vertical" className="h-12 hidden sm:block" />
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium whitespace-nowrap">{estimateReadingTime(post.content)} min read</p>
                        <p className="text-muted-foreground text-xs">Reading time</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Categories Count */}
                {post.categories && post.categories.length > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-12 hidden sm:block" />
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium whitespace-nowrap">{post.categories.length} categories</p>
                        <p className="text-muted-foreground text-xs">Topics covered</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-6 lg:mt-8">
                {post.notionUrl && <NotionLinkButton notionUrl={post.notionUrl} />}
                <Suspense fallback={<div>Loading Share Buttons...</div>}>
                  <ShareButtons
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    categories={post.categories}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8 overflow-x-hidden">
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden rounded-xl shadow-2xl">
              <Image
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
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
              {post.content && (
                <div className="lg:hidden mb-8">
                  <Suspense fallback={<div>Loading Table of Contents...</div>}>
                    <TableOfContents content={post.content} />
                  </Suspense>
                </div>
              )}

              {/* Article Body */}
              <article className="prose prose-lg dark:prose-invert max-w-none prose-pre:overflow-x-auto prose-code:break-words prose-p:break-words prose-headings:break-words">
                <div className="bg-card rounded-xl p-4 md:p-8 shadow-sm border overflow-hidden">
                  {post.content ? (
                    <Mdx content={post.content} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No content available for this post.</p>
                    </div>
                  )}
                </div>
              </article>

              {/* Post Footer */}
              <div className="mt-8 lg:mt-12 space-y-6 lg:space-y-8">
                {/* Categories - Detailed Section */}
                {post.categories && post.categories.length > 0 && (
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
                          This article is categorized under the following topics. Click on any category to explore more
                          related content.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {post.categories.map((category) => (
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
                                  <p className="text-xs text-muted-foreground">
                                    {posts.filter((p) => p.categories?.includes(category)).length} posts
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
                      Share this post
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div>Loading Share Buttons...</div>}>
                      <ShareButtons
                        title={post.title}
                        slug={post.slug}
                        excerpt={post.excerpt}
                        categories={post.categories}
                      />
                    </Suspense>
                  </CardContent>
                </Card>

                {/* Post Navigation */}
                <Suspense fallback={<div>Loading Post Navigation...</div>}>
                  <PostNavigation currentSlug={post.slug} />
                </Suspense>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4 lg:space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto sidebar-scroll-area">
                {/* Table of Contents - Desktop */}
                {post.content && (
                  <div className="hidden lg:block">
                    <Suspense fallback={<div>Loading Table of Contents...</div>}>
                      <TableOfContents content={post.content} />
                    </Suspense>
                  </div>
                )}

                {/* Categories Sidebar */}
                {post.categories && post.categories.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Folder className="w-5 h-5" />
                        Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {post.categories.map((category) => (
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
                            <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                              {posts.filter((p) => p.categories?.includes(category)).length}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Tag className="w-5 h-5" />
                        Related Posts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <div key={relatedPost.id} className="group">
                          <Link
                            href={`/posts/${relatedPost.slug}`}
                            className="block space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <h4
                              className="font-medium line-clamp-2 group-hover:text-primary transition-colors break-words"
                              title={relatedPost.title}
                            >
                              {relatedPost.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span className="whitespace-nowrap">
                                {format(new Date(relatedPost.createdAt), "MMM d, yyyy")}
                              </span>
                            </div>
                            {relatedPost.categories && relatedPost.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {relatedPost.categories.slice(0, 2).map((category) => (
                                  <Badge
                                    key={category}
                                    variant="outline"
                                    className="text-xs max-w-[100px] truncate"
                                    title={category}
                                  >
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </Link>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recent Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="w-5 h-5" />
                      Recent Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {posts.slice(0, 5).map((recentPost) => (
                      <div key={recentPost.id} className="group">
                        <Link
                          href={`/posts/${recentPost.slug}`}
                          className="block space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <h4
                            className="font-medium line-clamp-2 group-hover:text-primary transition-colors break-words"
                            title={recentPost.title}
                          >
                            {recentPost.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {format(new Date(recentPost.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
