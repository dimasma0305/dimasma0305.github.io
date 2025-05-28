"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Copy, Check, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLazyLoading } from "@/hooks/use-lazy-loading"
import { withBasePath } from "@/lib/utils"

interface RichText {
  type: string
  content: string
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  href?: string
}

interface NotionBlock {
  id: string
  type: string
  content?: any
  children?: NotionBlock[]
}

interface NotionRendererProps {
  blocks: NotionBlock[]
}

const NotionRenderer: React.FC<NotionRendererProps> = ({ blocks }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const contentRef = useRef<HTMLDivElement>(null)
  const { isDOMReady } = useLazyLoading({
    delayAfterDOMLoaded: 250,
  })

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const highlightCode = (code: string, language: string): string => {
    // Escape HTML first
    const escapedCode = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")

    // Define highlighting patterns for different languages
    const patterns: { [key: string]: Array<{ pattern: RegExp; className: string }> } = {
      javascript: [
        {
          pattern:
            /\b(function|return|if|else|for|while|const|let|var|class|import|export|from|async|await|try|catch|finally)\b/g,
          className: "text-purple-400",
        },
        { pattern: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, className: "text-green-400" },
        { pattern: /\/\/.*$/gm, className: "text-gray-500 italic" },
        { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
        { pattern: /\b\d+\.?\d*\b/g, className: "text-amber-400" },
        { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, className: "text-blue-400" },
      ],
      typescript: [
        {
          pattern:
            /\b(function|return|if|else|for|while|const|let|var|class|import|export|from|async|await|try|catch|finally|interface|type|enum|namespace)\b/g,
          className: "text-purple-400",
        },
        { pattern: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, className: "text-green-400" },
        { pattern: /\/\/.*$/gm, className: "text-gray-500 italic" },
        { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
        { pattern: /\b\d+\.?\d*\b/g, className: "text-amber-400" },
        { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, className: "text-blue-400" },
      ],
      python: [
        {
          pattern:
            /\b(def|return|if|elif|else|for|while|class|import|from|as|try|except|finally|with|lambda|and|or|not|in|is)\b/g,
          className: "text-purple-400",
        },
        { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, className: "text-green-400" },
        { pattern: /#.*$/gm, className: "text-gray-500 italic" },
        { pattern: /\b\d+\.?\d*\b/g, className: "text-amber-400" },
        { pattern: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, className: "text-blue-400" },
      ],
      html: [
        { pattern: /(&lt;\/?\w+[^&gt;]*&gt;)/g, className: "text-red-400" },
        { pattern: /(&quot;[^&quot;]*&quot;)/g, className: "text-green-400" },
        { pattern: /\b\d+\.?\d*\b/g, className: "text-amber-400" },
      ],
      css: [
        { pattern: /([a-zA-Z-]+)(?=\s*:)/g, className: "text-blue-400" },
        { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, className: "text-green-400" },
        { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
        { pattern: /\b\d+\.?\d*(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?\b/g, className: "text-amber-400" },
      ],
      json: [
        { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1(?=\s*:)/g, className: "text-blue-400" },
        { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1(?!\s*:)/g, className: "text-green-400" },
        { pattern: /\b(true|false|null)\b/g, className: "text-purple-400" },
        { pattern: /\b-?\d+\.?\d*\b/g, className: "text-amber-400" },
      ],
      bash: [
        {
          pattern: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|export|source|alias)\b/g,
          className: "text-purple-400",
        },
        { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, className: "text-green-400" },
        { pattern: /#.*$/gm, className: "text-gray-500 italic" },
        { pattern: /\$[a-zA-Z_][a-zA-Z0-9_]*/g, className: "text-yellow-400" },
        { pattern: /\b\d+\.?\d*\b/g, className: "text-amber-400" },
      ],
      sql: [
        {
          pattern:
            /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|INDEX|TABLE|DATABASE|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|AS|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|TRUE|FALSE)\b/gi,
          className: "text-purple-400",
        },
        { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, className: "text-green-400" },
        { pattern: /--.*$/gm, className: "text-gray-500 italic" },
        { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
        { pattern: /\b\d+\.?\d*\b/g, className: "text-amber-400" },
      ],
      text: [
        { pattern: /\b\d+\.?\d*\b/g, className: "text-amber-400" },
        { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, className: "text-green-400" },
        { pattern: /#.*$/gm, className: "text-gray-500 italic" },
      ],
    }

    // Apply highlighting patterns
    let highlightedCode = escapedCode
    const langPatterns = patterns[language.toLowerCase()] || patterns.text

    // Apply patterns in sequence, being careful not to double-process
    langPatterns.forEach(({ pattern, className }) => {
      highlightedCode = highlightedCode.replace(pattern, (match) => {
        // Don't highlight if already inside a span tag
        if (match.includes("<span")) return match
        return `<span class="${className}">${match}</span>`
      })
    })

    return highlightedCode
  }

  const detectLanguage = (code: string): string => {
    // Simple language detection based on common patterns
    if (code.includes("function") || code.includes("const ") || code.includes("let ") || code.includes("=>"))
      return "javascript"
    if (code.includes("interface ") || code.includes("type ") || code.includes(": string") || code.includes(": number"))
      return "typescript"
    if (code.includes("def ") || code.includes("import ") || code.includes("print(")) return "python"
    if (code.includes("<") && code.includes(">") && code.includes("html")) return "html"
    if (code.includes("{") && code.includes("}") && code.includes(":") && !code.includes("function")) return "css"
    if (code.includes("SELECT") || code.includes("FROM") || code.includes("WHERE")) return "sql"
    if (code.includes("#!/bin/bash") || code.includes("echo ") || code.includes("$")) return "bash"
    if (code.startsWith("{") && code.endsWith("}")) return "json"
    return "text"
  }

  const renderRichText = (richTextArray: any[]): React.ReactNode => {
    if (!richTextArray || !Array.isArray(richTextArray)) return null

    return richTextArray.map((text, index) => {
      const { content, annotations, href } = text

      let element: React.ReactNode = content

      if (annotations?.bold) element = <strong key={index}>{element}</strong>
      if (annotations?.italic) element = <em key={index}>{element}</em>
      if (annotations?.strikethrough) element = <del key={index}>{element}</del>
      if (annotations?.underline) element = <u key={index}>{element}</u>
      if (annotations?.code)
        element = (
          <code key={index} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
            {element}
          </code>
        )

      if (href) {
        element = (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {element}
          </a>
        )
      }

      return <span key={index}>{element}</span>
    })
  }

  const renderBlock = (block: NotionBlock): React.ReactNode => {
    const { type, content, children } = block

    switch (type) {
      case "paragraph":
        return (
          <p key={block.id} className="mb-4 leading-relaxed">
            {renderRichText(content?.rich_text)}
          </p>
        )

      case "heading_1":
        return (
          <h1 key={block.id} className="text-3xl font-bold mb-6 mt-8">
            {renderRichText(content?.rich_text)}
          </h1>
        )

      case "heading_2":
        return (
          <h2 key={block.id} className="text-2xl font-bold mb-4 mt-6">
            {renderRichText(content?.rich_text)}
          </h2>
        )

      case "heading_3":
        return (
          <h3 key={block.id} className="text-xl font-bold mb-3 mt-5">
            {renderRichText(content?.rich_text)}
          </h3>
        )

      case "bulleted_list_item":
        return (
          <li key={block.id} className="mb-2">
            {renderRichText(content?.rich_text)}
            {children && children.length > 0 && (
              <ul className="ml-6 mt-2">{children.map((child) => renderBlock(child))}</ul>
            )}
          </li>
        )

      case "numbered_list_item":
        return (
          <li key={block.id} className="mb-2">
            {renderRichText(content?.rich_text)}
            {children && children.length > 0 && (
              <ol className="ml-6 mt-2">{children.map((child) => renderBlock(child))}</ol>
            )}
          </li>
        )

      case "code":
        const codeContent = content?.rich_text?.[0]?.content || ""
        const language = content?.language || detectLanguage(codeContent)
        const lines = codeContent.split("\n")
        const showLineNumbers = lines.length > 2
        const highlightedCode = highlightCode(codeContent, language)
        const isCopied = copiedStates[block.id]

        return (
          <div key={block.id} className="relative group mb-6">
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300 font-medium capitalize">{language}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(codeContent, block.id)}
                  className="h-8 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {/* Code content */}
              <div className="relative">
                <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                  <code className="text-gray-100 font-mono" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                </pre>

                {/* Line numbers */}
                {showLineNumbers && (
                  <div className="absolute left-0 top-0 p-4 pointer-events-none select-none">
                    <div className="text-gray-500 text-sm font-mono leading-relaxed">
                      {lines.map((_, index) => (
                        <div key={index} className="text-right pr-4 min-w-[2rem]">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case "quote":
        return (
          <blockquote
            key={block.id}
            className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic bg-blue-50 dark:bg-blue-900/20"
          >
            {renderRichText(content?.rich_text)}
          </blockquote>
        )

      case "callout":
        return (
          <div
            key={block.id}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4"
          >
            <div className="flex items-start space-x-3">
              {content?.icon && <span className="text-xl">{content.icon.emoji || content.icon.external?.url}</span>}
              <div className="flex-1">{renderRichText(content?.rich_text)}</div>
            </div>
          </div>
        )

      case "divider":
        return <hr key={block.id} className="my-8 border-gray-300 dark:border-gray-600" />

      case "image":
        const imageUrl = content?.url || content?.file?.url || content?.external?.url
        const caption = content?.caption?.[0]?.content

        return (
          <figure key={block.id} className="mb-6">
            {imageUrl && (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={caption || "Image"}
                className="w-full rounded-lg shadow-lg"
              />
            )}
            {caption && (
              <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">{caption}</figcaption>
            )}
          </figure>
        )

      case "file":
        const fileName = content?.name || "Download file"
        const fileUrl = content?.url || content?.file?.url || content?.external?.url

        return (
          <div key={block.id} className="mb-4">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FileText className="w-4 h-4" />
              <span>{fileName}</span>
            </a>
          </div>
        )

      case "table":
        return (
          <div key={block.id} className="mb-6 overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <tbody>
                {children?.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={rowIndex === 0 && content?.has_row_header ? "bg-gray-100 dark:bg-gray-800" : ""}
                  >
                    {row.content?.cells?.map((cell: any[], cellIndex: number) => {
                      const CellComponent =
                        (rowIndex === 0 && content?.has_column_header) || (cellIndex === 0 && content?.has_row_header)
                          ? "th"
                          : "td"
                      return (
                        <CellComponent
                          key={cellIndex}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left"
                        >
                          {renderRichText(cell)}
                        </CellComponent>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case "table_row":
        // Table rows are handled by the table block
        return null

      case "toggle":
        return (
          <details key={block.id} className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <summary className="cursor-pointer p-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
              {renderRichText(content?.rich_text)}
            </summary>
            <div className="p-4 pt-0">{children?.map((child) => renderBlock(child))}</div>
          </details>
        )

      case "link_preview":
        return (
          <div key={block.id} className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <a
              href={content?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {content?.url}
            </a>
          </div>
        )

      case "embed":
        return (
          <div key={block.id} className="mb-6">
            <iframe
              src={content?.url}
              className="w-full h-96 border border-gray-300 dark:border-gray-600 rounded-lg"
              title="Embedded content"
            />
          </div>
        )

      default:
        return (
          <div key={block.id} className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Unsupported block type: {type}</p>
            {content?.rich_text && <div className="mt-2">{renderRichText(content.rich_text)}</div>}
          </div>
        )
    }
  }

  // Group consecutive list items
  const groupBlocks = (blocks: NotionBlock[]): React.ReactNode[] => {
    const grouped: React.ReactNode[] = []
    let currentList: NotionBlock[] = []
    let currentListType: string | null = null

    blocks.forEach((block, index) => {
      if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
        if (currentListType === block.type) {
          currentList.push(block)
        } else {
          // Finish previous list if exists
          if (currentList.length > 0) {
            const ListComponent = currentListType === "numbered_list_item" ? "ol" : "ul"
            grouped.push(
              <ListComponent
                key={`list-${index}`}
                className={currentListType === "numbered_list_item" ? "list-decimal ml-6 mb-4" : "list-disc ml-6 mb-4"}
              >
                {currentList.map((item) => renderBlock(item))}
              </ListComponent>,
            )
          }
          // Start new list
          currentList = [block]
          currentListType = block.type
        }
      } else {
        // Finish current list if exists
        if (currentList.length > 0) {
          const ListComponent = currentListType === "numbered_list_item" ? "ol" : "ul"
          grouped.push(
            <ListComponent
              key={`list-${index}`}
              className={currentListType === "numbered_list_item" ? "list-decimal ml-6 mb-4" : "list-disc ml-6 mb-4"}
            >
              {currentList.map((item) => renderBlock(item))}
            </ListComponent>,
          )
          currentList = []
          currentListType = null
        }
        // Add non-list block
        grouped.push(renderBlock(block))
      }
    })

    // Handle remaining list items
    if (currentList.length > 0) {
      const ListComponent = currentListType === "numbered_list_item" ? "ol" : "ul"
      grouped.push(
        <ListComponent
          key="final-list"
          className={currentListType === "numbered_list_item" ? "list-decimal ml-6 mb-4" : "list-disc ml-6 mb-4"}
        >
          {currentList.map((item) => renderBlock(item))}
        </ListComponent>,
      )
    }

    return grouped
  }

  useEffect(() => {
    if (contentRef.current && isDOMReady) {
      // Enhanced image handling with lazy loading
      const images = contentRef.current.querySelectorAll("img")
      images.forEach((img) => {
        // Skip if already processed
        if (img.hasAttribute("data-lazy-processed")) return

        // Mark as processed
        img.setAttribute("data-lazy-processed", "true")

        // Store original src
        const originalSrc = img.src
        const originalAlt = img.alt || "Image"

        // Create wrapper for lazy loading
        const wrapper = document.createElement("div")
        wrapper.className = "lazy-image-wrapper relative overflow-hidden"
        wrapper.style.minHeight = "200px"

        // Create placeholder
        const placeholder = document.createElement("div")
        placeholder.className = "absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
        placeholder.innerHTML = '<div class="text-muted-foreground text-sm">Loading image...</div>'

        // Create new image element
        const newImg = document.createElement("img")
        newImg.alt = originalAlt
        newImg.className = img.className + " transition-opacity duration-300 opacity-0"

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
                newImg.classList.remove("opacity-0")
                newImg.classList.add("opacity-100")
                placeholder.remove()
              }
              newImg.onerror = () => {
                newImg.src = withBasePath("/placeholder.svg?height=400&width=600&text=Image%20Not%20Found")
                newImg.onload = () => {
                  newImg.classList.remove("opacity-0")
                  newImg.classList.add("opacity-100")
                  placeholder.remove()
                }
              }
              observer.disconnect()
            }
          },
          {
            threshold: 0.1,
            rootMargin: "50px",
          },
        )

        // Replace original image with wrapper
        img.parentNode?.insertBefore(wrapper, img)
        wrapper.appendChild(placeholder)
        wrapper.appendChild(newImg)
        img.remove()

        // Start observing
        observer.observe(wrapper)
      })
    }
  }, [blocks, isDOMReady])

  return (
    <div
      ref={contentRef}
      className="notion-content prose prose-lg dark:prose-invert max-w-none 
        prose-headings:scroll-mt-24
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-img:rounded-xl prose-img:shadow-lg
        prose-blockquote:border-l-primary prose-blockquote:bg-muted/30
        prose-th:bg-muted prose-th:font-semibold
        prose-td:border-border prose-th:border-border
        prose-table:border-collapse prose-table:border prose-table:border-border"
    >
      {groupBlocks(blocks)}
    </div>
  )
}

export { NotionRenderer }
export default NotionRenderer
