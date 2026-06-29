export interface ScrollOptions {
  headerOffset?: number
  behavior?: ScrollBehavior
  waitForLazyLoad?: boolean
  lazyLoadDelay?: number
}

// The sticky site header is 64px tall; leave a little breathing room beneath it.
// Single source of truth so the JS scroll, the heading `scroll-margin-top`, and
// the CSS `scroll-padding-top` all agree (mismatched offsets were one cause of
// inaccurate landings).
export const HEADER_OFFSET = 80

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

/**
 * Keep `el` pinned `offset` px below the viewport top until the layout stops
 * moving. Long posts render code blocks with `content-visibility: auto` (their
 * height is only an estimate until they scroll into view) and lazy-load images
 * behind placeholder heights, so a single `scrollTo` lands in the wrong place
 * and the target keeps drifting as content settles. Re-correcting every frame
 * until the heading's viewport position is stable (and all images have loaded)
 * makes the landing accurate regardless. Any deliberate user gesture aborts it.
 */
function pinToTarget(el: HTMLElement, offset: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve()
      return
    }

    let raf = 0
    let cancelled = false
    let stableMs = 0
    let lastTop = Number.NaN
    let lastT = performance.now()
    const startT = lastT

    const cancel = () => {
      cancelled = true
    }
    const passive: AddEventListenerOptions = { passive: true }
    window.addEventListener("wheel", cancel, passive)
    window.addEventListener("touchmove", cancel, passive)
    window.addEventListener("keydown", cancel)

    const cleanup = () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("wheel", cancel, passive)
      window.removeEventListener("touchmove", cancel, passive)
      window.removeEventListener("keydown", cancel)
      resolve()
    }

    const imagesReady = () => {
      const scope = el.closest("article") ?? document
      return Array.from(scope.querySelectorAll("img")).every(
        (img) => (img as HTMLImageElement).complete,
      )
    }

    const tick = () => {
      if (cancelled) {
        cleanup()
        return
      }
      const now = performance.now()
      const dt = now - lastT
      lastT = now

      // Position the heading reads at *before* we re-correct this frame.
      const top = el.getBoundingClientRect().top
      const want = Math.max(0, window.scrollY + top - offset)
      if (Math.abs(window.scrollY - want) > 1) {
        window.scrollTo({ top: want, behavior: "auto" })
      }

      // "Settled" = the heading's viewport position has stopped moving.
      if (!Number.isNaN(lastTop) && Math.abs(top - lastTop) <= 1) {
        stableMs += dt
      } else {
        stableMs = 0
      }
      lastTop = top

      // Stop once the heading has held still briefly AND every image has loaded
      // (a late image above the target would otherwise push it after we stop).
      // Generous cap so slow image loads still get corrected; the loop is cheap
      // and any user gesture aborts it.
      const settled = stableMs >= 400 && imagesReady()
      if (settled || now - startT > 5000) {
        cleanup()
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
  })
}

export function smoothScrollToElement(
  elementId: string,
  options: ScrollOptions = {},
): Promise<boolean> {
  const {
    headerOffset = HEADER_OFFSET,
    behavior = "smooth",
    waitForLazyLoad = false,
    lazyLoadDelay = 250,
  } = options

  return new Promise((resolve) => {
    const run = (element: HTMLElement) => {
      // Stabilize layout before measuring. Long posts skip rendering off-screen
      // code blocks (`content-visibility: auto`), so each is only a 320px
      // placeholder until first render — a jump computed from those estimates
      // lands far short. Force them to real height in one pass; the
      // `contain-intrinsic-size: auto` keyword then remembers each measured
      // size, so restoring afterwards keeps the paint-skipping with no reflow.
      const article = element.closest<HTMLElement>("article")
      const blocks = article
        ? Array.from(article.querySelectorAll<HTMLElement>("pre"))
        : []
      blocks.forEach((b) => {
        b.style.contentVisibility = "visible"
      })
      if (article) {
        void article.offsetHeight // flush layout so the forced heights apply
      }

      const want = Math.max(
        0,
        window.scrollY + element.getBoundingClientRect().top - headerOffset,
      )
      // A smooth animation across many screens would chase a moving target (and
      // be disorienting); jump instantly for long hops, then self-correct.
      const far = Math.abs(want - window.scrollY) > window.innerHeight * 3
      window.scrollTo({ top: want, behavior: far ? "auto" : behavior })
      pinToTarget(element, headerOffset).then(() => {
        // Re-enable paint-skipping; sizes are remembered, so no reflow.
        blocks.forEach((b) => {
          b.style.contentVisibility = ""
        })
        resolve(true)
      })
    }

    // The target heading may not exist yet on first load (content/IDs are
    // assigned during hydration), so retry briefly before giving up.
    const attempt = (retriesLeft: number) => {
      const element = document.getElementById(elementId)
      if (element) {
        run(element)
      } else if (retriesLeft > 0) {
        setTimeout(() => attempt(retriesLeft - 1), 250)
      } else {
        resolve(false)
      }
    }

    if (waitForLazyLoad && !isLazyLoadingReady(lazyLoadDelay)) {
      const remainingTime = Math.max(
        0,
        (lazyLoadingStartTime || Date.now()) + lazyLoadDelay - Date.now(),
      )
      setTimeout(() => attempt(8), remainingTime + 100)
    } else {
      attempt(8)
    }
  })
}

export function handleAnchorNavigation(
  e: React.MouseEvent<HTMLAnchorElement>,
  path: string,
  currentPathname: string,
  options: ScrollOptions = {},
) {
  if (path.includes("#")) {
    const hash = path.split("#")[1]

    if (currentPathname === "/") {
      // On home page, scroll to the element immediately
      e.preventDefault()
      smoothScrollToElement(hash, options).then((success) => {
        if (success) {
          // replaceState (not `location.hash =`) so the URL updates without
          // firing a second, native smooth scroll that fights ours.
          history.replaceState(null, "", `#${hash}`)
        }
      })
    }
    // For other pages, let the default navigation happen
    // The target page will handle the scroll on load
  }
}

export function handleHashOnPageLoad(options: ScrollOptions = {}) {
  // Initialize the lazy loading timer
  initializeLazyLoadingTimer(options.lazyLoadDelay)

  const hash = window.location.hash
  if (hash) {
    const elementId = hash.substring(1)
    // Always wait for lazy loading on page load
    smoothScrollToElement(elementId, {
      ...options,
      waitForLazyLoad: true,
    })
  }
}
