"use client"

import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

function AnalyticsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // This is where you would typically add your analytics tracking code
    // For example, Google Analytics or Plausible
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    console.log(`Page view: ${url}`)

    // Example of how you might track page views with a service like Google Analytics
    // if (typeof window.gtag === 'function') {
    //   window.gtag('config', 'GA-TRACKING-ID', {
    //     page_path: url,
    //   })
    // }
  }, [pathname, searchParams])

  return null
}

export function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  )
}
