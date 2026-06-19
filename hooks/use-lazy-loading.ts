import { useEffect, useRef, useState } from 'react'

interface UseLazyLoadingOptions {
  threshold?: number
  rootMargin?: string
}

/**
 * Loads content once it scrolls within `rootMargin` of the viewport. The
 * observer is created immediately on mount (no artificial delay): above-the-fold
 * elements resolve on the first frame, and the generous rootMargin pre-warms
 * images just before they enter view.
 */
export function useLazyLoading({
  threshold = 0.1,
  rootMargin = '200px',
}: UseLazyLoadingOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return {
    elementRef,
    shouldLoad: isInView,
    isLoaded,
    setIsLoaded,
    isInView,
  }
}
