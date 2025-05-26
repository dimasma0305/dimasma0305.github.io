import { useEffect, useRef, useState } from 'react'

interface UseLazyLoadingOptions {
  threshold?: number
  rootMargin?: string
  delayAfterDOMLoaded?: number
}

export function useLazyLoading({
  threshold = 0.1,
  rootMargin = '50px',
  delayAfterDOMLoaded = 250
}: UseLazyLoadingOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [isDOMReady, setIsDOMReady] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Wait for DOM to be fully loaded, then add delay
    const timer = setTimeout(() => {
      setIsDOMReady(true)
    }, delayAfterDOMLoaded)

    return () => clearTimeout(timer)
  }, [delayAfterDOMLoaded])

  useEffect(() => {
    if (!isDOMReady || !elementRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(elementRef.current)

    return () => observer.disconnect()
  }, [isDOMReady, threshold, rootMargin])

  const shouldLoad = isDOMReady && isInView

  return {
    elementRef,
    shouldLoad,
    isLoaded,
    setIsLoaded,
    isInView,
    isDOMReady
  }
} 