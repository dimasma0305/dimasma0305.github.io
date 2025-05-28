import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function withBasePath(path: string): string {
  const basePath = process.env.NODE_ENV === "production" ? "/dimasma0305.github.io" : ""
  return `${basePath}${path}`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}

export function extractTextFromHtml(html: string): string {
  // Simple HTML tag removal - in a real app you might want to use a proper HTML parser
  return html.replace(/<[^>]*>/g, "").trim()
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production you should use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
}

// HTML entity encoding/decoding functions
export function escapeHtml(text: string): string {
  const htmlEntities: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  }

  return text.replace(/[&<>"'`=/]/g, (match) => htmlEntities[match] || match)
}

export function unescapeHtml(html: string): string {
  const htmlEntities: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x2F;": "/",
    "&#x60;": "`",
    "&#x3D;": "=",
    "&nbsp;": " ",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&hellip;": "…",
    "&mdash;": "—",
    "&ndash;": "–",
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&bull;": "•",
  }

  return html.replace(/&[a-zA-Z0-9#]+;/g, (match) => htmlEntities[match] || match)
}

export function cleanText(text: string): string {
  if (!text) return ""

  // First unescape HTML entities
  let cleaned = unescapeHtml(text)

  // Remove any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, "")

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim()

  // Remove control characters except newlines and tabs
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

  return cleaned
}

export function sanitizeForDisplay(text: string): string {
  if (!text) return ""

  // Clean the text first
  let sanitized = cleanText(text)

  // Escape for safe HTML display
  sanitized = escapeHtml(sanitized)

  return sanitized
}

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n") // Convert remaining \r to \n
    .replace(/\t/g, "    ") // Convert tabs to spaces
    .replace(/\u00A0/g, " ") // Convert non-breaking spaces to regular spaces
    .replace(/\s+$/gm, "") // Remove trailing whitespace from each line
    .replace(/^\s+$/gm, "") // Remove lines with only whitespace
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines to 2
}

export function stripHtmlTags(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, "") // Remove style tags and content
    .replace(/<script[^>]*>.*?<\/script>/gis, "") // Remove script tags and content
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
      // Decode common HTML entities
      const entities: { [key: string]: string } = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
        "&nbsp;": " ",
      }
      return entities[entity] || entity
    })
}
