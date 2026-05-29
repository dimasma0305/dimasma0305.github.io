"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Warms commonly-visited routes and a few heavy lazy chunks during browser
 * IDLE time — one task per idle slice — so subsequent navigations are fast
 * without competing with initial render/hydration or saturating the network.
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
      () => void import("@/components/footer"),
      () => void import("@/components/projects-section"),
      () => void import("@/components/skills-section"),
      () => void import("@/components/ctf-section"),
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
