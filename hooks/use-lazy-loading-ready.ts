import { useEffect, useState } from 'react'

interface UseLazyLoadingReadyOptions {
  delayAfterDOMLoaded?: number
}

export function useLazyLoadingReady({
  delayAfterDOMLoaded = 250
}: UseLazyLoadingReadyOptions = {}) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Wait for DOM to be fully loaded, then add delay
    const timer = setTimeout(() => {
      setIsReady(true)
    }, delayAfterDOMLoaded)

    return () => clearTimeout(timer)
  }, [delayAfterDOMLoaded])

  return isReady
}
