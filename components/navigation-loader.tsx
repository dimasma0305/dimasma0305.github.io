"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// A small top progress bar that reacts to internal navigations.
// Implemented with plain DOM + CSS transitions (no framer-motion) so the
// root layout doesn't pull the animation library onto every route.
export function NavigationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isActive, setIsActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<number | null>(null)
  const clickedRef = useRef(false)

  const currentLocationKey = useMemo(
    () => `${pathname}?${searchParams?.toString() ?? ""}`,
    [pathname, searchParams],
  )

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return
      const target = e.target as HTMLElement | null
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null
      if (!anchor) return

      // Ignore modifier clicks/new tabs/external links/hash-only
      const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      if (isModified) return
      if (anchor.target === "_blank") return
      if (!anchor.href) return
      const href = anchor.getAttribute("href") || ""
      if (href.startsWith("#")) return
      const isInternal = anchor.href.startsWith(window.location.origin)
      if (!isInternal) return

      // If navigating to the same route (including search), skip
      const url = new URL(anchor.href)
      const nextKey = `${url.pathname}?${url.searchParams.toString()}`
      if (nextKey === currentLocationKey) return

      // Start loader
      clickedRef.current = true
      setIsActive(true)
      setProgress(8)

      // Advance to 90% while waiting for path to change
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = window.setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p
          const increment = p < 30 ? 8 : p < 60 ? 4 : 2
          return Math.min(90, p + increment)
        })
      }, 120) as unknown as number
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [currentLocationKey])

  // When route actually changes, complete the bar
  useEffect(() => {
    if (!clickedRef.current) return
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    setProgress(100)
    const hide = window.setTimeout(() => {
      setIsActive(false)
      setProgress(0)
      clickedRef.current = false
    }, 250)
    return () => window.clearTimeout(hide)
  }, [currentLocationKey])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
      aria-hidden="true"
    >
      <div
        className="h-0.5 w-full origin-left bg-primary [transition:transform_var(--dur-fast)_var(--ease-out),opacity_var(--dur-fast)_var(--ease-out)]"
        style={{ transform: `scaleX(${progress / 100})`, opacity: isActive ? 1 : 0 }}
      />
    </div>
  )
}

export default NavigationLoader
