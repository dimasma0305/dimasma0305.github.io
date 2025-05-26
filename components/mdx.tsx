"use client"

import { withBasePath } from "@/lib/utils"
import { useEffect, useRef } from "react"
import { useLazyLoading } from "@/hooks/use-lazy-loading"
import { initializeLazyLoadingTimer } from "@/lib/scroll-utils"

// Import Prism.js for syntax highlighting
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css' // Dark theme

// Load core components first
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'

// Load language components in dependency order
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-shell-session'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-nginx'

// Load PHP last as it has complex dependencies
import 'prismjs/components/prism-markup-templating'
import 'prismjs/components/prism-php'

interface MdxProps {
  content: string
}

export function Mdx({ content }: MdxProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { isDOMReady } = useLazyLoading({
    delayAfterDOMLoaded: 250
  })

  useEffect(() => {
    // Initialize the lazy loading timer for scroll utilities
    initializeLazyLoadingTimer(250)
    
    if (contentRef.current && isDOMReady) {
      // Enhanced image handling with lazy loading
      const images = contentRef.current.querySelectorAll("img")
      images.forEach((img, index) => {
        // Skip if already processed
        if (img.hasAttribute('data-lazy-processed')) return
        
        // Mark as processed
        img.setAttribute('data-lazy-processed', 'true')
        
        // Store original src
        const originalSrc = img.src
        const originalAlt = img.alt || 'Image'
        
        // Create wrapper for lazy loading
        const wrapper = document.createElement('div')
        wrapper.className = 'lazy-image-wrapper relative overflow-hidden'
        wrapper.style.minHeight = '200px'
        
        // Create placeholder
        const placeholder = document.createElement('div')
        placeholder.className = 'absolute inset-0 bg-muted animate-pulse flex items-center justify-center'
        placeholder.innerHTML = '<div class="text-muted-foreground text-sm">Loading image...</div>'
        
        // Create new image element
        const newImg = document.createElement('img')
        newImg.alt = originalAlt
        newImg.className = img.className + ' transition-opacity duration-300 opacity-0'
        
        // Add enhanced styling if not present
        if (!newImg.classList.contains("enhanced")) {
          newImg.classList.add(
            "enhanced",
            "rounded-xl",
            "shadow-lg",
            "my-8",
            "border",
            "transition-transform",
            "hover:scale-[1.02]",
            "cursor-zoom-in",
          )
        }
        
        // Set up intersection observer for this specific image
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              // Load the image
              newImg.src = originalSrc
              newImg.onload = () => {
                newImg.classList.remove('opacity-0')
                newImg.classList.add('opacity-100')
                placeholder.remove()
              }
              newImg.onerror = () => {
                newImg.src = withBasePath("/placeholder.svg?height=400&width=600&text=Image%20Not%20Found")
                newImg.onload = () => {
                  newImg.classList.remove('opacity-0')
                  newImg.classList.add('opacity-100')
                  placeholder.remove()
                }
              }
              observer.disconnect()
            }
          },
          {
            threshold: 0.1,
            rootMargin: '50px'
          }
        )
        
        // Replace original image with wrapper
        img.parentNode?.insertBefore(wrapper, img)
        wrapper.appendChild(placeholder)
        wrapper.appendChild(newImg)
        img.remove()
        
        // Start observing
        observer.observe(wrapper)
      })

      // Enhanced heading styling and ID generation
      const headings = contentRef.current.querySelectorAll("h1, h2, h3, h4, h5, h6")
      headings.forEach((heading, index) => {
        // Type guard to ensure heading is HTMLElement
        if (!(heading instanceof HTMLElement)) return

        if (!heading.id) {
          const text = heading.textContent || ""
          const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') 
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-') 
            .trim()

          heading.id = `${index}-${slug}`
        }

        // Enhanced heading styling
        heading.style.scrollMarginTop = "120px"
        heading.classList.add("group", "relative")

        // Add anchor link
        if (!heading.querySelector(".anchor-link")) {
          const anchor = document.createElement("a")
          anchor.href = `#${heading.id}`
          anchor.className =
            "anchor-link absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
          anchor.innerHTML = "#"
          anchor.setAttribute("aria-label", "Link to this section")
          heading.appendChild(anchor)
        }
      })

      // Enhanced code block styling
      const codeBlocks = contentRef.current.querySelectorAll("pre")
      codeBlocks.forEach((pre) => {
        if (!pre.classList.contains("enhanced")) {
          pre.classList.add(
            "enhanced",
            "relative",
            "rounded-xl",
            "border",
            "shadow-sm",
            "bg-muted/50",
            "my-6",
            "overflow-x-auto",
          )

          // Create a sticky header container for buttons
          const headerContainer = document.createElement("div")
          headerContainer.className = "sticky top-0 left-0 right-0 flex justify-between items-start p-2 bg-transparent pointer-events-none z-10"

          // Add language label if available and apply syntax highlighting
          const code = pre.querySelector("code")
          if (code) {
            const className = code.className
            const languageMatch = className.match(/language-(\w+)/)

            if (languageMatch) {
              const language = languageMatch[1].toLowerCase()
              
              // Language aliases for better compatibility
              const languageAliases: { [key: string]: string } = {
                'py': 'python',
                'js': 'javascript',
                'ts': 'typescript',
                'sh': 'bash',
                'shell': 'bash',
                'yml': 'yaml',
                'md': 'markdown',
                'cs': 'csharp',
                'cpp': 'cpp',
                'c++': 'cpp',
                'rb': 'ruby',
                'rs': 'rust',
                'dockerfile': 'docker'
              }
              
              const actualLanguage = languageAliases[language] || language
              
              // Apply Prism.js syntax highlighting
              try {
                // Check if Prism is available and properly loaded
                if (typeof Prism === 'undefined' || !Prism.languages) {
                  console.warn('Prism.js not properly loaded')
                  code.classList.add(`language-${actualLanguage}`)
                  return
                }

                // Ensure the language is supported by Prism
                if (Prism.languages[actualLanguage]) {
                  const codeText = code.textContent || ''
                  if (codeText.trim()) {
                    const highlightedCode = Prism.highlight(
                      codeText,
                      Prism.languages[actualLanguage],
                      actualLanguage
                    )
                    code.innerHTML = highlightedCode
                  }
                } else {
                  // Fallback for unsupported languages - just add the language class
                  console.warn(`Language '${actualLanguage}' not supported by Prism.js`)
                  code.classList.add(`language-${actualLanguage}`)
                }
              } catch (error) {
                console.error(`Error highlighting code for language '${actualLanguage}':`, error)
                // Fallback: just add the language class without highlighting
                code.classList.add(`language-${actualLanguage}`)
              }

              // Add language label
              const label = document.createElement("div")
              label.className =
                "language-label px-2 py-1 text-xs bg-background/90 backdrop-blur-sm rounded border text-muted-foreground pointer-events-auto"
              label.textContent = (languageAliases[language] || language).toUpperCase()
              headerContainer.appendChild(label)
            }
          }

          // Enhanced copy button
          const copyButton = document.createElement("button")
          copyButton.className =
            "copy-button px-3 py-1 text-xs bg-background/90 backdrop-blur-sm border rounded hover:bg-muted transition-colors pointer-events-auto"
          copyButton.textContent = "Copy"
          copyButton.onclick = () => {
            const code = pre.querySelector("code")?.textContent || ""
            navigator.clipboard.writeText(code).then(() => {
              copyButton.textContent = "Copied!"
              copyButton.classList.add("text-green-600")
              setTimeout(() => {
                copyButton.textContent = "Copy"
                copyButton.classList.remove("text-green-600")
              }, 2000)
            })
          }

          // Add copy button to the left side of header
          const leftContainer = document.createElement("div")
          leftContainer.appendChild(copyButton)
          headerContainer.insertBefore(leftContainer, headerContainer.firstChild)

          // Insert header container at the beginning of pre
          pre.insertBefore(headerContainer, pre.firstChild)
        }
      })

      // Run Prism highlighting on any remaining code blocks that weren't manually processed
      try {
        // Only highlight code blocks that don't have the 'enhanced' class
        const unprocessedCodeBlocks = contentRef.current.querySelectorAll("pre:not(.enhanced) code[class*='language-']")
        unprocessedCodeBlocks.forEach((code) => {
          const pre = code.closest('pre')
          if (pre && !pre.classList.contains('enhanced')) {
            try {
              Prism.highlightElement(code as HTMLElement)
            } catch (error) {
              console.error('Error highlighting individual code block:', error)
            }
          }
        })
      } catch (error) {
        console.error('Error running Prism highlighting:', error)
      }

      // Enhanced blockquote styling
      const blockquotes = contentRef.current.querySelectorAll("blockquote")
      blockquotes.forEach((blockquote) => {
        if (!blockquote.classList.contains("enhanced")) {
          blockquote.classList.add("enhanced", "border-l-4", "border-primary", "bg-muted/30", "rounded-r-lg", "my-6")
        }
      })

      // Enhanced table styling
      const tables = contentRef.current.querySelectorAll("table")
      tables.forEach((table) => {
        if (!table.classList.contains("enhanced")) {
          table.classList.add("enhanced")

          // Wrap table in a container for better responsive handling
          if (!table.parentElement?.classList.contains("table-container")) {
            const wrapper = document.createElement("div")
            wrapper.className = "table-container overflow-x-auto rounded-lg border my-6"
            table.parentNode?.insertBefore(wrapper, table)
            wrapper.appendChild(table)
          }
        }
      })
    }
  }, [content, isDOMReady])

  return (
    <div
      ref={contentRef}
      className="mdx prose prose-lg dark:prose-invert max-w-none 
        prose-headings:scroll-mt-24
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-transparent prose-pre:p-0
        prose-img:rounded-xl prose-img:shadow-lg
        prose-blockquote:border-l-primary prose-blockquote:bg-muted/30
        prose-th:bg-muted prose-th:font-semibold
        prose-td:border-border prose-th:border-border"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
