"use client"

import { usePosts } from "@/hooks/use-posts"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BlogCategories() {
  const { posts } = usePosts()
  const pathname = usePathname()
  // Normalize away the export trailingSlash so /blog/ and /blog both match.
  const currentPath = (pathname || "/").replace(/\/$/, "") || "/"

  const activeClass = (active: boolean) =>
    `w-full justify-start ${active ? "bg-primary/15 text-primary font-medium" : ""}`

  // Get unique categories and their counts
  const categories = posts.reduce(
    (acc, post) => {
      post.categories?.forEach((category) => {
        acc[category] = (acc[category] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-[var(--elevation-1)]">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Categories</h3>
        <div className="mt-4 space-y-2">
          <Button
            asChild
            variant="ghost"
            className={activeClass(currentPath === "/blog")}
          >
            <Link
              href="/blog"
              aria-current={currentPath === "/blog" ? "page" : undefined}
            >
              All Categories
              <span className="ml-auto text-muted-foreground">{posts.length}</span>
            </Link>
          </Button>
          {Object.entries(categories)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, count]) => {
              const href = `/categories/${encodeURIComponent(category.toLowerCase())}`
              const active = currentPath === href
              return (
                <Button
                  key={category}
                  asChild
                  variant="ghost"
                  className={activeClass(active)}
                >
                  <Link href={href} aria-current={active ? "page" : undefined}>
                    {category}
                    <span className="ml-auto text-muted-foreground">{count}</span>
                  </Link>
                </Button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
