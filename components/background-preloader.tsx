"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Preloads critical routes and lazily-loaded components in the background
 * after the first page is interactive. This improves subsequent navigations
 * without impacting initial render.
 */
export function BackgroundPreloader() {
  const router = useRouter()

  useEffect(() => {
    // Prefetch commonly visited routes
    const routesToPrefetch = ["/", "/blog", "/notes", "/search", "/tools"]
    for (const route of routesToPrefetch) {
      try {
        router.prefetch(route)
      } catch (_) {
        // Ignore if prefetch is unavailable in some environments
      }
    }

    // Warm up dynamic chunks for heavy components used across the app
    const dynamicImports: Array<() => Promise<unknown>> = [
      () => import("@/components/footer").then((m) => m.Footer),
      () => import("@/components/theme-toggle").then((m) => m.ThemeToggle),
      () => import("@/components/hero-section").then((m) => m.HeroSection),
      () => import("@/components/projects-section").then((m) => m.ProjectsSection),
      () => import("@/components/skills-section").then((m) => m.SkillsSection),
      () => import("@/components/ctf-section").then((m) => m.CTFSection),
      () => import("@/components/experience-section").then((m) => m.ExperienceSection),
      () => import("@/components/mdx").then((m) => m.Mdx),
      () => import("@/components/table-of-contents").then((m) => m.TableOfContents),
      () => import("@/components/share-buttons").then((m) => m.ShareButtons),
      () => import("@/components/post-navigation").then((m) => m.PostNavigation),
      () => import("@/components/blog-stats").then((m) => m.BlogStats),
      () => import("@/components/blog-categories").then((m) => m.BlogCategories),
      () => import("@/components/note-navigation").then((m) => m.NoteNavigation),
    ]

    for (const load of dynamicImports) {
      // Fire-and-forget to avoid blocking the main thread or hydration
      load().catch(() => {})
    }
  }, [router])

  return null
}


