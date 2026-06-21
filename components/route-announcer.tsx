"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

// Delay reading document.title so the new route's <head> has committed its
// updated <title> before we announce it. ~100ms comfortably clears the
// metadata flush without a noticeable lag for screen-reader users.
const ANNOUNCE_DELAY_MS = 100

/**
 * Announces client-side route changes to assistive technology.
 *
 * On SPA navigation the browser does not move focus or speak the new page, so
 * screen-reader users get no feedback that the route changed. This mounts a
 * persistent visually-hidden polite live region and, on each pathname change
 * (after the initial hard load), writes the new document.title into it.
 *
 * Focus management is intentionally out of scope — it is owned by the
 * skip-link / page-transition system and we must not fight it here.
 */
export function RouteAnnouncer() {
  const pathname = usePathname()
  const [message, setMessage] = useState("")
  // Skip the first pathname value: on a hard load the page title is already
  // read by the AT, so re-announcing it would double up.
  const didMountRef = useRef(false)

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    const timer = window.setTimeout(() => {
      setMessage(document.title)
    }, ANNOUNCE_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      <p>{message}</p>
    </div>
  )
}

export default RouteAnnouncer
