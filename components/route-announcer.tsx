"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function RouteAnnouncer() {
  const pathname = usePathname()
  const [message, setMessage] = useState("")
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      setMessage("Page loaded")
      return
    }
    const title = document.title || "Page"
    setMessage(`${title} loaded`)
  }, [pathname])

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

export default RouteAnnouncer


