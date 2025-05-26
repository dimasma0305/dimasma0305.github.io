import { useState, useEffect, useCallback, useRef } from "react"

// Optimized mobile detection hook with throttling and memoization
export function useMobile(breakpoint = 768): boolean {
  // Initialize with SSR-safe value
  const [isMobile, setIsMobile] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef<boolean>(false)

  // Memoized check function
  const checkMobile = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint
  }, [breakpoint])

  // Throttled resize handler for better performance
  const handleResize = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsMobile(checkMobile())
    }, 150) // Throttle to 150ms for better performance
  }, [checkMobile])

  useEffect(() => {
    // Set initial value
    if (!isInitializedRef.current) {
      setIsMobile(checkMobile())
      isInitializedRef.current = true
    }

    // Use passive event listener for better performance
    window.addEventListener('resize', handleResize, { passive: true })
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleResize, checkMobile])

  return isMobile
}
