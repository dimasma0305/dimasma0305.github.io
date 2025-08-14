"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

// A small, professional top progress bar that reacts to internal navigations.
export function NavigationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isActive, setIsActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<number | null>(null)
  const clickedRef = useRef(false)
  const prefersReducedMotion = useReducedMotion()

  const currentLocationKey = useMemo(() => `${pathname}?${searchParams?.toString() ?? ""}`,[pathname, searchParams])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return
      const target = e.target as HTMLElement | null
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null
      if (!anchor) return

      // Ignore modifier clicks/new tabs/external links/hash-only
      const isModified = (e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey || (e as MouseEvent).shiftKey || (e as MouseEvent).altKey
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
          const increment = prefersReducedMotion ? 10 : (p < 30 ? 8 : p < 60 ? 4 : 2)
          return Math.min(90, p + increment)
        })
      }, prefersReducedMotion ? 200 : 120) as unknown as number
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100]">
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            className="relative h-0.5 w-full"
          >
            <motion.div
              className="h-0.5 bg-primary"
              animate={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              transition={{ ease: "linear", duration: prefersReducedMotion ? 0 : 0.12 }}
            />
            {/* Glow */}
            <motion.div
              className="absolute right-0 -top-[2px] h-1.5 w-16 rounded-full bg-primary/40 blur-sm"
              animate={prefersReducedMotion ? undefined : { x: 0 }}
              initial={prefersReducedMotion ? undefined : { x: -20 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NavigationLoader


