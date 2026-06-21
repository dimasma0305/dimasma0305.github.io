import type { Metadata } from "next"
import fs from "fs"
import path from "path"
import Link from "next/link"
import { Hash } from "lucide-react"

import { SectionHeader } from "@/components/section-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const baseUrl =
  (process.env.NEXT_PUBLIC_BASE_URL || "https://dimasma0305.github.io") +
  (process.env.NEXT_PUBLIC_BASE_PATH || "")

interface TagSummary {
  name: string
  count: number
}

// Read tag taxonomy from public/blog-index.json at build time. Falls back to
// deriving tags + counts from posts when taxonomy.tags is absent.
function getTagSummaries(): TagSummary[] {
  try {
    const indexPath = path.join(process.cwd(), "public", "blog-index.json")
    const blogIndex = JSON.parse(fs.readFileSync(indexPath, "utf8"))

    const taxonomyTags = blogIndex.taxonomy?.tags
    if (Array.isArray(taxonomyTags) && taxonomyTags.length > 0) {
      return taxonomyTags
        .filter((t: any) => t && typeof t.name === "string")
        .map((t: any) => ({ name: t.name as string, count: Number(t.count) || 0 }))
        .sort(
          (a: TagSummary, b: TagSummary) =>
            b.count - a.count || a.name.localeCompare(b.name),
        )
    }

    const posts =
      (Array.isArray(blogIndex.posts?.published) && blogIndex.posts.published) ||
      (Array.isArray(blogIndex.posts?.all) && blogIndex.posts.all) ||
      []
    const counts = new Map<string, number>()
    posts.forEach((p: any) =>
      (p.tags || []).forEach((t: string) =>
        counts.set(t, (counts.get(t) || 0) + 1),
      ),
    )
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  } catch (error) {
    console.error("Error reading blog index for tags index:", error)
    return []
  }
}

// Identical slug format to category links: encodeURIComponent + lowercase.
function tagToSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase())
}

export function generateMetadata(): Metadata {
  const title = "Tags | Dimas Maulana"
  const description =
    "Browse cybersecurity writeups and CTF solutions by tag — RCE, XSS, and more security research topics by Dimas Maulana."
  const canonical = `${baseUrl}/tags/`

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "Dimas Maulana",
      images: [
        { url: `${baseUrl}/og-image.jpg`, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@dimasma__",
      images: [`${baseUrl}/og-image.jpg`],
    },
    robots: { index: true, follow: true },
  }
}

export default function TagsPage() {
  const tags = getTagSummaries()

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl">
      <SectionHeader
        titleAs="h1"
        eyebrow="Browse"
        title="Tags"
        subtitle="Pick a tag to explore related writeups."
      />

      {tags.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map(({ name, count }) => (
            <Link
              key={name}
              href={`/tags/${tagToSlug(name)}`}
              className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="h-full transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[var(--elevation-2)]">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:bg-primary/20">
                    <Hash className="h-6 w-6" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <h2 className="truncate text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      {name}
                    </h2>
                    <Badge variant="secondary" className="shrink-0">
                      {count} post{count !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No tags yet. New writeups will show up here grouped by tag.
          </p>
        </div>
      )}
    </div>
  )
}
