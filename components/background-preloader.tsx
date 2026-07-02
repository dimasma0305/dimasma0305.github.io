"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { warmPostsCache } from "@/hooks/use-posts"
import { warmNotesCache } from "@/hooks/use-notes"
import { fetchNotesStats } from "@/lib/notes-client"

/**
 * Warms commonly-visited routes, their client-fetched DATA, and a few heavy
 * lazy chunks during browser IDLE time — one task per idle slice — so
 * subsequent navigations render instantly (no skeleton flash) without competing
 * with initial render/hydration or saturating the network.
 */
export function BackgroundPreloader() {
  const router = useRouter()

  useEffect(() => {
    const tasks: Array<() => void> = [
      () =>
        ["/", "/blog", "/notes", "/tools", "/search"].forEach((r) => {
          try {
            router.prefetch(r)
          } catch {
            /* prefetch may be unavailable in some environments */
          }
        }),
      // Warm the client-fetched data caches so /blog and /notes render content
      // on arrival (no skeleton) — router.prefetch only warms route code, not the
      // JSON. warmPostsCache also warms the posts index used by post pages.
      () => void warmPostsCache(),
      () => void warmNotesCache(),
      () => void fetchNotesStats().catch(() => {}),
      () => void import("@/components/footer"),
      // Warm section chunks in the homepage's visual order (skills, ctf,
      // projects, experience) so the first-seen sections win the idle slices.
      () => void import("@/components/skills-section"),
      () => void import("@/components/ctf-section"),
      () => void import("@/components/projects-section"),
      () => void import("@/components/experience-section"),
      () => void import("@/components/mdx"),
      () => void import("@/components/table-of-contents"),
      () => void import("@/components/share-buttons"),
      () => void import("@/components/post-navigation"),
    ]

    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }
    const idle = (cb: () => void): number =>
      typeof win.requestIdleCallback === "function"
        ? win.requestIdleCallback(cb, { timeout: 2000 })
        : window.setTimeout(cb, 1)

    const handles: number[] = []
    // Drain one task per idle slice so we never block a frame.
    const schedule = (i: number) => {
      if (i >= tasks.length) return
      handles.push(
        idle(() => {
          try {
            tasks[i]()
          } catch {
            /* ignore */
          }
          schedule(i + 1)
        }),
      )
    }
    schedule(0)

    return () => {
      handles.forEach((h) => {
        if (typeof win.cancelIdleCallback === "function") win.cancelIdleCallback(h)
        else window.clearTimeout(h)
      })
    }
  }, [router])

  return null
}
