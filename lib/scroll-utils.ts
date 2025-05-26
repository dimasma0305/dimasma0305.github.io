export interface ScrollOptions {
  headerOffset?: number
  behavior?: ScrollBehavior
  waitForLazyLoad?: boolean
  lazyLoadDelay?: number
}

let lazyLoadingStartTime: number | null = null

export function initializeLazyLoadingTimer(delay: number = 250) {
  if (!lazyLoadingStartTime) {
    lazyLoadingStartTime = Date.now()
  }
  return lazyLoadingStartTime + delay
}

export function isLazyLoadingReady(delay: number = 250): boolean {
  if (!lazyLoadingStartTime) {
    initializeLazyLoadingTimer(delay)
    return false
  }
  return Date.now() >= lazyLoadingStartTime + delay
}

export function smoothScrollToElement(
  elementId: string, 
  options: ScrollOptions = {}
): Promise<boolean> {
  const {
    headerOffset = 80,
    behavior = 'smooth',
    waitForLazyLoad = false,
    lazyLoadDelay = 250
  } = options

  return new Promise((resolve) => {
    const scrollToTarget = () => {
      const element = document.getElementById(elementId)
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior
        })
        resolve(true)
      } else {
        // If element not found, try again after a short delay (content might still be loading)
        setTimeout(() => {
          const retryElement = document.getElementById(elementId)
          if (retryElement) {
            const elementPosition = retryElement.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - headerOffset

            window.scrollTo({
              top: offsetPosition,
              behavior
            })
            resolve(true)
          } else {
            resolve(false)
          }
        }, 500)
      }
    }

    if (waitForLazyLoad) {
      if (isLazyLoadingReady(lazyLoadDelay)) {
        scrollToTarget()
      } else {
        // Wait for lazy loading to complete before scrolling
        const remainingTime = Math.max(0, (lazyLoadingStartTime || Date.now()) + lazyLoadDelay - Date.now())
        setTimeout(scrollToTarget, remainingTime + 100) // Add extra 100ms buffer
      }
    } else {
      scrollToTarget()
    }
  })
}

export function handleAnchorNavigation(
  e: React.MouseEvent<HTMLAnchorElement>,
  path: string,
  currentPathname: string,
  options: ScrollOptions = {}
) {
  if (path.includes('#')) {
    const hash = path.split('#')[1]
    
    if (currentPathname === '/') {
      // On home page, scroll to the element immediately
      e.preventDefault()
      smoothScrollToElement(hash, options).then((success) => {
        if (success) {
          window.history.pushState(null, '', `#${hash}`)
        }
      })
    }
    // For other pages, let the default navigation happen
    // The target page will handle the scroll on load
  }
}

export function handleHashOnPageLoad(
  options: ScrollOptions = {}
) {
  // Initialize the lazy loading timer
  initializeLazyLoadingTimer(options.lazyLoadDelay)
  
  const hash = window.location.hash
  if (hash) {
    const elementId = hash.substring(1)
    // Always wait for lazy loading on page load
    smoothScrollToElement(elementId, { 
      ...options, 
      waitForLazyLoad: true 
    })
  }
} 