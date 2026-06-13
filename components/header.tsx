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
  // Briefly ignore scroll-spy after a nav click so the highlight doesn't
  // flicker through intermediate sections while the smooth-scroll is running.
  const spyLockRef = useRef(0)
  const rafRef = useRef(0)
  const isHome = (pathname || "/") === "/"

  // Custom scroll handler for anchor links using centralized utility
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    handleAnchorNavigation(e, path, pathname || "/", {
      headerOffset: 80,
      behavior: "smooth",
    })
    if (path.startsWith("/#")) {
      // Match the navbar to the click instantly, and let the scroll settle
      // before the spy takes over again.
      setActiveSection(path.slice(2))
      spyLockRef.current = Date.now() + 1000
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll-spy (home only). The active section is the LAST one whose top has
  // scrolled above the header line — i.e. the section currently sitting under
  // the header. This is position-based and uses the same 80px offset the nav
  // click scrolls to, so the highlight always matches where you land (the old
  // IntersectionObserver picked "most visible by ratio", which let a short
  // section win over the one you actually scrolled to).
  useEffect(() => {
    if (!isHome) {
      setActiveSection("")
      return
    }

    const ids = ["about", "skills", "experience", "projects", "ctf", "blog"]
    const HEADER_LINE = 90 // header height (64) + a little slack past the 80px scroll offset

    const compute = () => {
      rafRef.current = 0
      if (Date.now() < spyLockRef.current) return // a nav click is still settling
      if (window.scrollY < 120) {
        setActiveSection("")
        return
      }
      let current = ""
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= HEADER_LINE) current = id
      }
      setActiveSection(current)
    }

    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(compute)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    // Recompute once now and again after lazy sections have settled.
    const settle = setTimeout(compute, 1200)
    compute()

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearTimeout(settle)
    }
  }, [isHome])

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
