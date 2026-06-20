import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"

import { SectionHeader } from "@/components/section-header"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FallbackImage } from "@/components/fallback-image"
import { Button } from "@/components/ui/button"
import { withBasePath, formatDate } from "@/lib/utils"

// Canonical site origin (mirrors app/sitemap.ts and components/seo.tsx).
const baseUrl =
  (process.env.NEXT_PUBLIC_BASE_URL || "https://dimasma0305.github.io") +
  (process.env.NEXT_PUBLIC_BASE_PATH || "")

// Shape of a post entry in public/blog-index.json (snake_case fields).
interface IndexPost {
  slug: string
  title: string
  excerpt?: string
  featured_image?: string | null
  created_time?: string
  categories?: string[]
  tags?: string[]
}

interface IndexTag {
  name: string
  count?: number
  slug?: string
}

// Read and parse public/blog-index.json from disk at build time. Returns a
// safe empty shape on any failure so the page degrades instead of throwing.
function readBlogIndex(): { tags: IndexTag[]; posts: IndexPost[] } {
  try {
    const indexPath = path.join(process.cwd(), "public", "blog-index.json")
    const blogIndex = JSON.parse(fs.readFileSync(indexPath, "utf8"))

    const tags: IndexTag[] = Array.isArray(blogIndex.taxonomy?.tags)
      ? blogIndex.taxonomy.tags
      : []

    // Prefer published; it equals `all` today but guards drafts from surfacing
    // if that ever diverges.
    const posts: IndexPost[] =
      (Array.isArray(blogIndex.posts?.published) && blogIndex.posts.published) ||
      (Array.isArray(blogIndex.posts?.all) && blogIndex.posts.all) ||
      []

    return { tags, posts }
  } catch (error) {
    console.error("Error reading blog index for tag page:", error)
    return { tags: [], posts: [] }
  }
}

// Build the unique set of tag display names. Prefer taxonomy.tags; fall back to
// deriving from each post's `tags` array.
function getAllTagNames(tags: IndexTag[], posts: IndexPost[]): string[] {
  if (tags.length > 0) {
    // Guard against a malformed taxonomy entry without a string `name`
    // (would crash later on n.toLowerCase()).
    return tags.map((t) => t.name).filter((name): name is string => typeof name === "string")
  }
  const set = new Set<string>()
  posts.forEach((p) =>
    (p.tags || []).forEach((t) => {
      if (typeof t === "string") set.add(t)
    }),
  )
  return Array.from(set)
}

// Slug used in the URL. Identical to how category links are built
// (encodeURIComponent + lowercase) so links stay consistent across the site.
function tagToSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase())
}

// One param per unique tag (lowercase slug). generateMetadata supplies a
// canonical, so a single canonical-cased param per tag is correct here — no
// need for the categories route's exact/encoded casing variants.
export async function generateStaticParams() {
  const { tags, posts } = readBlogIndex()
  const names = getAllTagNames(tags, posts)
  return names.map((name) => ({ tag: name.toLowerCase() }))
}

interface TagPageProps {
  params: Promise<{ tag: string }>
}

// Resolve the canonical display name (e.g. "RCE") for a decoded slug, matching
// case-insensitively the way the categories client resolves its display name.
function resolveTagName(
  decoded: string,
  tags: IndexTag[],
  posts: IndexPost[],
): string | null {
  const names = getAllTagNames(tags, posts)
  return names.find((n) => n.toLowerCase() === decoded.toLowerCase()) || null
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params
  const decoded = decodeURIComponent(tag)
  const { tags, posts } = readBlogIndex()
  const name = resolveTagName(decoded, tags, posts) || decoded

  const title = `#${name} writeups | Dimas Maulana`
  const description = `Cybersecurity writeups, CTF solutions, and security research tagged #${name} by Dimas Maulana.`
  const canonical = `${baseUrl}/tags/${tagToSlug(name)}/`

  return {
    title,
    description,
    keywords: [
      name,
      "cybersecurity",
      "CTF",
      "writeup",
      "security research",
      "Dimas Maulana",
    ].join(", "),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "Dimas Maulana",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@dimasma__",
      images: [`${baseUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

// Local copy of seo.tsx's safeJsonLd (not exported there, and seo.tsx is out of
// scope to edit). Escapes the characters significant in an HTML <script>
// context so a value cannot break out of the ld+json block.
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data, null, 2)
    .replace(/[<>&\u2028\u2029]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"))
}

// Server-rendered post card: a plain anchor wrapping the same dark surface as
// PostCard, but with no client-only deps (no router prefetch, no Intersection
// Observer). This is what puts the post list into static HTML.
function TagPostCard({ post }: { post: IndexPost }) {
  const postUrl = `/posts/${post.slug}`
  const cover = post.featured_image
  const imageSrc = cover
    ? cover.startsWith("http")
      ? cover
      : withBasePath(cover)
    : null
  const categories = post.categories || []

  return (
    <Link
      href={postUrl}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="overflow-hidden h-full transition-[transform,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:shadow-[var(--elevation-2)]">
        {imageSrc ? (
          <div className="relative w-full h-48 overflow-hidden bg-muted">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-muted via-card to-muted"
            />
            <FallbackImage
              src={imageSrc}
              alt={post.title}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              fallbackSrc={withBasePath("/placeholder.svg?height=192&width=384")}
            />
          </div>
        ) : (
          <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-card to-background">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/70">
              {categories[0] ?? "Writeup"}
            </span>
          </div>
        )}

        <CardHeader className="pb-2">
          <h2 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between">
          {post.created_time && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1" />
              <time dateTime={post.created_time}>
                {formatDate(post.created_time)}
              </time>
            </div>
          )}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{categories[0]}</Badge>
              {categories.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  +{categories.length - 1}
                </Badge>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const decoded = decodeURIComponent(tag)
  const { tags, posts } = readBlogIndex()

  const name = resolveTagName(decoded, tags, posts)

  // Tag does not exist in the taxonomy / any post.
  if (!name) {
    return (
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Tag Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The tag &quot;{decoded}&quot; does not exist.
          </p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Server-side filter: posts whose `tags` include this tag (case-insensitive).
  const tagPosts = posts.filter((p) =>
    (p.tags || []).some((t) => t.toLowerCase() === name.toLowerCase()),
  )

  // CollectionPage + ItemList JSON-LD describing the server-rendered listing.
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${baseUrl}/tags/${tagToSlug(name)}/`,
    url: `${baseUrl}/tags/${tagToSlug(name)}/`,
    name: `#${name} writeups`,
    description: `Cybersecurity writeups and CTF solutions tagged #${name} by Dimas Maulana.`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tagPosts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/posts/${post.slug}/`,
        name: post.title,
      })),
    },
  }

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
      />

      <Link
        href="/tags"
        className="mb-6 -ml-2 inline-flex items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="w-4 h-4" />
        All tags
      </Link>

      <SectionHeader
        titleAs="h1"
        eyebrow="Tag"
        title={`#${name}`}
        subtitle={`${tagPosts.length} post${tagPosts.length !== 1 ? "s" : ""} tagged ${name}`}
      />

      {tagPosts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tagPosts.map((post) => (
            <TagPostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts tagged {name} yet.
          </p>
        </div>
      )}
    </div>
  )
}
