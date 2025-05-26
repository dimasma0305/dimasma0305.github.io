"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { ChevronRight, ChevronDown, BookOpen, Eye, EyeOff, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

interface TocItem {
  id: string
  title: string
  level: number
  children: TocItem[]
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [showOnlyTopLevel, setShowOnlyTopLevel] = useState(false)
  const [dynamicHeight, setDynamicHeight] = useState("60vh")
  const [isScrolling, setIsScrolling] = useState(false)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const desktopScrollRef = useRef<HTMLDivElement>(null)
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate dynamic height based on viewport and content
  const calculateDynamicHeight = useCallback(() => {
    const viewportHeight = window.innerHeight
    const headerHeight = 100
    const footerHeight = 100
    const padding = 40

    const availableHeight = viewportHeight - headerHeight - footerHeight - padding
    const maxHeight = Math.max(300, Math.min(availableHeight, viewportHeight * 0.8))

    setDynamicHeight(`${maxHeight}px`)
  }, [])

  // Check scroll indicators
  const checkScrollIndicators = useCallback((element: HTMLDivElement | null) => {
    if (!element) return

    const { scrollTop, scrollHeight, clientHeight } = element
    const threshold = 5 // Small threshold to account for rounding

    setCanScrollUp(scrollTop > threshold)
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - threshold)
  }, [])

  // Auto-scroll TOC to show active item
  const scrollToActiveItem = useCallback((activeItemId: string) => {
    if (!activeItemId) return

    // Clear any existing timeout
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current)
    }

    // Delay the scroll to avoid conflicts with user scrolling
    autoScrollTimeoutRef.current = setTimeout(() => {
      const scrollActiveItem = (container: HTMLDivElement | null) => {
        if (!container) return

        // Find the active item button in the TOC
        const activeButton = container.querySelector(`button[data-toc-id="${activeItemId}"]`) as HTMLElement
        if (!activeButton) return

        const containerRect = container.getBoundingClientRect()
        const buttonRect = activeButton.getBoundingClientRect()
        
        // Calculate if the button is visible in the container
        const isVisible = 
          buttonRect.top >= containerRect.top && 
          buttonRect.bottom <= containerRect.bottom

        if (!isVisible) {
          // Calculate the scroll position to center the active item
          const containerHeight = container.clientHeight
          const scrollTop = container.scrollTop
          const buttonOffsetTop = activeButton.offsetTop
          const buttonHeight = activeButton.offsetHeight
          
          // Center the active item in the container
          const targetScrollTop = buttonOffsetTop - (containerHeight / 2) + (buttonHeight / 2)
          
          // Smooth scroll to the target position
          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
          })
        }
      }

      // Scroll both mobile and desktop containers
      scrollActiveItem(mobileScrollRef.current)
      scrollActiveItem(desktopScrollRef.current)
    }, 300) // Small delay to avoid conflicts with user interactions
  }, [])

  useEffect(() => {
    calculateDynamicHeight()
    window.addEventListener("resize", calculateDynamicHeight)
    return () => window.removeEventListener("resize", calculateDynamicHeight)
  }, [calculateDynamicHeight])

  // Parse content and extract headings
  useEffect(() => {
    if (!content) return

    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = content

    const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6")
    const items: TocItem[] = []
    const stack: TocItem[] = []

    headings.forEach((heading, index) => {
      const level = Number.parseInt(heading.tagName.charAt(1))
      const title = heading.textContent || ""
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') 
        .replace(/\s+/g, '-') 
        .replace(/-+/g, '-') 
        .trim();
      const id = `${index}-${slug}`

      if (heading.id === "") {
        heading.id = id
      }

      const item: TocItem = {
        id: heading.id || id,
        title,
        level,
        children: [],
      }

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      if (stack.length === 0) {
        items.push(item)
      } else {
        stack[stack.length - 1].children.push(item)
      }

      stack.push(item)
    })

    setTocItems(items)

    // Auto-enable smart features for long TOCs
    const totalItems = items.reduce((count, item) => {
      return count + 1 + item.children.length
    }, 0)

    if (totalItems > 15) {
      setShowOnlyTopLevel(true)
    }
  }, [content])

  // Auto-scroll to active item when activeId changes
  useEffect(() => {
    if (activeId) {
      scrollToActiveItem(activeId)
    }
  }, [activeId, scrollToActiveItem])

  // Check scroll indicators when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollIndicators(mobileScrollRef.current)
      checkScrollIndicators(desktopScrollRef.current)
    }, 100)

    return () => clearTimeout(timer)
  }, [tocItems, showOnlyTopLevel, collapsedSections, checkScrollIndicators])

  // Set up intersection observer
  useEffect(() => {
    if (tocItems.length === 0) return

    const headingElements = tocItems.flatMap(function flattenItems(item: TocItem): string[] {
      return [item.id, ...item.children.flatMap(flattenItems)]
    })

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0,
      },
    )

    headingElements.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observerRef.current?.observe(element)
      }
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [tocItems])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current)
      }
    }
  }, [])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
      window.history.pushState(null, '', `#${id}`)
    }
  }

  const toggleSection = (itemId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    checkScrollIndicators(element)
    
    setIsScrolling(true)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 1000)
  }

  const renderTocItems = (items: TocItem[], depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children.length > 0
      const isCollapsed = collapsedSections.has(item.id)
      const shouldShowChildren = !showOnlyTopLevel || depth === 0 || !isCollapsed

      return (
        <div key={item.id} className={`${depth > 0 ? "ml-4 border-l border-border pl-4" : ""}`}>
          <div className="flex items-center gap-1">
            {hasChildren && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleSection(item.id)}>
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            )}
            <button
              data-toc-id={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={`
                flex-1 text-left px-3 py-2 rounded-md text-sm transition-all duration-200
                hover:bg-muted hover:text-foreground
                ${
                  activeId === item.id
                    ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
                ${depth === 0 ? "font-medium" : ""}
                ${hasChildren ? "ml-0" : "ml-7"}
              `}
            >
              <span className="line-clamp-2 leading-relaxed">{item.title}</span>
            </button>
          </div>
          {hasChildren && shouldShowChildren && !isCollapsed && (
            <div className="mt-1 space-y-1">{renderTocItems(item.children, depth + 1)}</div>
          )}
        </div>
      )
    })
  }

  const getTotalItemCount = () => {
    return tocItems.reduce((count, item) => {
      return count + 1 + item.children.length
    }, 0)
  }

  if (tocItems.length === 0) {
    return null
  }

  const totalItems = getTotalItemCount()

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-12">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Table of Contents</span>
                <Badge variant="secondary" className="text-xs">
                  {totalItems}
                </Badge>
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Navigation</CardTitle>
                  <div className="flex gap-1">
                    {totalItems > 10 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOnlyTopLevel(!showOnlyTopLevel)}
                        className="h-7 px-2"
                      >
                        {showOnlyTopLevel ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative">
                  {/* Scroll Up Indicator */}
                  {canScrollUp && (
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card via-card/80 to-transparent z-10 flex items-start justify-center pt-1 pointer-events-none">
                      <ChevronUp className="h-4 w-4 text-muted-foreground animate-bounce" />
                    </div>
                  )}
                  
                  <div
                    ref={mobileScrollRef}
                    className={`toc-scroll-area overflow-y-auto overflow-x-hidden ${isScrolling ? "scrolling" : ""}`}
                    style={{ maxHeight: dynamicHeight }}
                    onScroll={handleScroll}
                  >
                    <div className="space-y-1 pr-3 pb-2" style={{ minHeight: "100px" }}>
                      {renderTocItems(tocItems)}
                    </div>
                  </div>
                  
                  {/* Scroll Down Indicator */}
                  {canScrollDown && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card via-card/80 to-transparent z-10 flex items-end justify-center pb-1 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
                    </div>
                  )}
                  
                  <div className="scroll-indicator" />
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-6 max-w-xs">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5" />
                  Table of Contents
                  <Badge variant="secondary" className="text-xs">
                    {totalItems}
                  </Badge>
                </CardTitle>
                <div className="flex gap-1">
                  {totalItems > 10 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOnlyTopLevel(!showOnlyTopLevel)}
                      className="h-7 w-7 p-0"
                      title={showOnlyTopLevel ? "Show all sections" : "Show only main sections"}
                    >
                      {showOnlyTopLevel ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              </div>
              {showOnlyTopLevel && (
                <p className="text-xs text-muted-foreground">Showing main sections only. Click sections to expand.</p>
              )}
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="relative">
                {/* Scroll Up Indicator */}
                {canScrollUp && (
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card via-card/80 to-transparent z-10 flex items-start justify-center pt-1 pointer-events-none">
                    <ChevronUp className="h-4 w-4 text-muted-foreground animate-bounce" />
                  </div>
                )}
                
                <div
                  ref={desktopScrollRef}
                  className={`toc-scroll-area overflow-y-auto overflow-x-hidden ${isScrolling ? "scrolling" : ""}`}
                  style={{
                    maxHeight: dynamicHeight,
                    minHeight: "200px",
                  }}
                  onScroll={handleScroll}
                >
                  <div className="space-y-1 pr-3 pb-4" style={{ minHeight: "150px" }}>
                    {renderTocItems(tocItems)}
                  </div>
                </div>
                
                {/* Scroll Down Indicator */}
                {canScrollDown && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card via-card/80 to-transparent z-10 flex items-end justify-center pb-1 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
                  </div>
                )}
                
                <div className="scroll-indicator" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
