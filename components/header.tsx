"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import { handleAnchorNavigation } from "@/lib/scroll-utils"

import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/logo-mark"

type NavItem = { name: string; path: string }

// In-page anchors — only meaningful on the homepage.
const sectionItems: NavItem[] = [
  { name: "About", path: "/#about" },
  { name: "Skills", path: "/#skills" },
  { name: "Experience", path: "/#experience" },
  { name: "Projects", path: "/#projects" },
  { name: "CTF", path: "/#ctf" },
]

// Site areas — always present.
const routeItems: NavItem[] = [
  { name: "Services", path: "/services" },
  { name: "Blog", path: "/blog" },
  { name: "Notes", path: "/notes" },
  { name: "Tools", path: "/tools" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isHome = (pathname || "/") === "/"

  // Custom scroll handler for anchor links using centralized utility
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    handleAnchorNavigation(e, path, pathname || "/", {
      headerOffset: 80,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Set up intersection observer for section detection on home page
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("")
      return
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Wait for components to be fully loaded (especially lazy-loaded ones)
    const setupObserver = () => {
      // Get all sections that correspond to navigation items
      const sections = ["about", "skills", "experience", "projects", "ctf", "blog"]
      const sectionElements: HTMLElement[] = []

      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
          sectionElements.push(element)
        }
      })

      if (sectionElements.length === 0) {
        // Retry after a delay if sections aren't loaded yet
        setTimeout(setupObserver, 500)
        return
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Sort entries by intersection ratio to find the most visible section
          const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

          if (visibleEntries.length > 0) {
            const mostVisible = visibleEntries[0]
            setActiveSection(mostVisible.target.id)
          } else {
            // If no section is intersecting, check scroll position
            const scrollY = window.scrollY
            if (scrollY < 200) {
              setActiveSection("") // At top, no section active
            }
          }
        },
        {
          rootMargin: "-10% 0% -50% 0%", // More lenient margins for better detection
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0], // More threshold points for better accuracy
        },
      )

      sectionElements.forEach((element) => {
        observerRef.current?.observe(element)
      })
    }

    // Initial setup with delay to ensure lazy-loaded components are ready
    setTimeout(setupObserver, 1000)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [pathname])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false)
  }, [pathname])

  // Active state: section anchors light up via the observer on home; routes via path.
  const isNavItemActive = (item: NavItem) => {
    const currentPath = pathname || "/"

    if (item.path.startsWith("/#")) {
      return isHome && activeSection === item.path.substring(2)
    }

    return currentPath === item.path || currentPath.startsWith(item.path + "/")
  }

  const navButtonClass = (active: boolean) =>
    `relative rounded-full px-4 transition-colors duration-200 ${
      active
        ? "text-primary-foreground bg-primary hover:bg-primary/90"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-border shadow-lg" : "bg-transparent"
        }`}
    >
      <div className="container flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoMark variant="dark" size={32} className="shrink-0" />
          <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            Dimas Maulana
          </span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <nav className="flex items-center gap-1 p-1 rounded-full bg-secondary/30 backdrop-blur-md border border-border">
            {sectionItems.map((item) => (
              <Link key={item.path} href={item.path} onClick={(e) => handleAnchorClick(e, item.path)}>
                <Button variant="ghost" size="sm" className={navButtonClass(isNavItemActive(item))}>
                  {item.name}
                </Button>
              </Link>
            ))}

            <span aria-hidden className="mx-1 h-5 w-px bg-border" />

            {routeItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button variant="ghost" size="sm" className={navButtonClass(isNavItemActive(item))}>
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          <Link href="/search" aria-label="Search">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Search className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center lg:hidden">
          <Link href="/search" aria-label="Search">
            <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
            className="h-11 w-11"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-xl animate-in slide-in-from-top-5">
          <div className="container px-4 py-4 mx-auto">
            <nav className="flex flex-col space-y-1.5">
              {sectionItems.map((item) => (
                <Link key={item.path} href={item.path} onClick={(e) => handleAnchorClick(e, item.path)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-12 text-base ${isNavItemActive(item) ? "bg-primary/15 text-primary border-l-2 border-primary" : ""}`}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}

              <span aria-hidden className="my-1 h-px w-full bg-border" />

              {routeItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-12 text-base ${isNavItemActive(item) ? "bg-primary/15 text-primary border-l-2 border-primary" : ""}`}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
