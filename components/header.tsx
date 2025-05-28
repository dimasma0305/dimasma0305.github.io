"use client"

import type React from "react"

import { useState, useEffect, useRef, lazy, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, Shield, BookOpen, Search } from "lucide-react"
import { handleAnchorNavigation } from "@/lib/scroll-utils"

import { Button } from "@/components/ui/button"

// Lazy load ThemeToggle for better initial page load
const ThemeToggle = lazy(() => import("@/components/theme-toggle").then((m) => ({ default: m.ThemeToggle })))

const navItems = [
  { name: "Home", path: "/", icon: <Shield className="w-4 h-4" /> },
  { name: "About", path: "/#about", icon: <BookOpen className="w-4 h-4" /> },
  { name: "Skills", path: "/#skills", icon: <Shield className="w-4 h-4" /> },
  { name: "Experience", path: "/#experience", icon: <Shield className="w-4 h-4" /> },
  { name: "Projects", path: "/#projects", icon: <BookOpen className="w-4 h-4" /> },
  { name: "CTF", path: "/#ctf", icon: <Shield className="w-4 h-4" /> },
  { name: "Blog", path: "/blog", icon: <BookOpen className="w-4 h-4" /> },
  { name: "Notes", path: "/notes", icon: <BookOpen className="w-4 h-4" /> },
  { name: "Search", path: "/search", icon: <Search className="w-4 h-4" /> },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")
  const pathname = usePathname()
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Custom scroll handler for anchor links using centralized utility
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    handleAnchorNavigation(e, path, pathname, {
      headerOffset: 80,
      behavior: "smooth",
    })
  }

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

    // Fallback scroll handler for manual section detection
    const handleScroll = () => {
      const sections = ["about", "skills", "experience", "projects", "ctf", "blog"]
      const scrollY = window.scrollY + 100 // Account for header height

      // If at the very top, no section is active
      if (window.scrollY < 200) {
        setActiveSection("")
        return
      }

      // Find which section is currently in view
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          const elementBottom = elementTop + rect.height

          // Check if the section is in the viewport
          if (scrollY >= elementTop - 200 && scrollY < elementBottom - 200) {
            setActiveSection(sectionId)
            return
          }
        }
      }
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

      // Add scroll listener as fallback
      window.addEventListener("scroll", handleScroll, { passive: true })
    }

    // Initial setup with delay to ensure lazy-loaded components are ready
    setTimeout(setupObserver, 1000)

    return () => {
      observerRef.current?.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [pathname])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false)
  }, [pathname])

  // Helper function to determine if a nav item should be active
  const isNavItemActive = (item: { name: string; path: string }) => {
    if (pathname !== "/") {
      // For non-home pages, use the original logic
      return pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path))
    }

    // For home page, check section-based activation
    if (item.path === "/") {
      return activeSection === "" // Home is active when no section is active (at top)
    }

    if (item.path.startsWith("/#")) {
      const sectionId = item.path.substring(2) // Remove '/#'
      return activeSection === sectionId
    }

    return false
  }

  return (
    <header className={`sticky top-0 z-40 w-full transition-all bg-background/80 backdrop-blur-md shadow-md`}>
      <div className="container flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-2xl font-bold">Dimas Maulana</span>
          </motion.div>
        </Link>

        <div className="hidden md:flex md:items-center md:space-x-1">
          <nav className="flex items-center">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} onClick={(e) => handleAnchorClick(e, item.path)}>
                <Button
                  variant="ghost"
                  className={`group relative overflow-hidden ${isNavItemActive(item) ? "text-primary" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.name}
                  </span>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                      isNavItemActive(item) ? "scale-x-100" : "scale-x-0"
                    } group-hover:scale-x-100`}
                  />
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <Suspense fallback={<div>Loading ThemeToggle...</div>}>
              <ThemeToggle />
            </Suspense>
          </div>
        </div>

        <div className="flex items-center md:hidden">
          <Suspense fallback={<div>Loading ThemeToggle...</div>}>
            <ThemeToggle />
          </Suspense>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="ml-2"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md">
          <div className="container px-4 py-4 mx-auto">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path} onClick={(e) => handleAnchorClick(e, item.path)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isNavItemActive(item) ? "bg-primary/20 text-primary" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.name}
                    </span>
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
