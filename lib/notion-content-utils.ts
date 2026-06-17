import { withBasePath } from "@/lib/utils"

// Types
export interface RichText {
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

export interface NotionIcon {
  type: string
  emoji?: string
}

export interface TableRow {
  id: string
  type: 'table_row'
  created_time: string
  last_edited_time: string
  has_children: boolean
  archived: boolean
  content: {
    cells: RichText[][]
  }
}

export interface NotionBlock {
  id: string
  type: string
  created_time: string
  last_edited_time: string
  has_children: boolean
  archived: boolean
  content: {
    rich_text?: RichText[]
    language?: string
    caption?: RichText[]
    color?: string
    is_toggleable?: boolean
    table_width?: number
    has_column_header?: boolean
    has_row_header?: boolean
    cells?: RichText[][]
    type?: string
    name?: string
    url?: string
    expiry_time?: string
    icon?: NotionIcon
    size?: number
  }
  children?: (NotionBlock | TableRow)[]
}

// Utility function to escape HTML entities
export function escapeHtml(text: string): string {
  const htmlEntities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char])
}

// Utility function to format file size
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
}

// Utility function to sanitize URLs
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  // Allow root-relative paths. Build-time image localization rewrites Notion
  // media to local copies under /posts/... or /notes/..., and those would
  // otherwise fail `new URL()` (no origin) and be blanked to "". Permit a
  // SINGLE leading slash only — reject protocol-relative "//host" and the
  // backslash variant browsers may treat as "//" — and forbid characters that
  // could break out of the double-quoted src/href attribute (stored XSS).
  if (/^\/(?![/\\])[^"'<>\s]*$/.test(url)) {
    return url
  }
  try {
    const parsedUrl = new URL(url)
    if (['http:', 'https:'].includes(parsedUrl.protocol)) {
      // Return the normalized href, NOT the raw input. URL normalization
      // percent-encodes characters such as " < > and spaces, preventing the
      // URL from breaking out of the double-quoted HTML attribute it is later
      // interpolated into (src="..."/href="..."), which would otherwise allow
      // stored XSS via Notion-sourced block URLs.
      return parsedUrl.href
    }
  } catch {
    // If URL parsing fails, return an empty string
    return ''
  }
  return ''
}

// Utility function to extract domain from URL
export function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname
  } catch {
    return url
  }
}

// Process rich text content
export function processRichText(richText: RichText[]): string {
  if (!richText || !Array.isArray(richText)) {
    return ""
  }
  
  return richText
    .map((rt) => {
      let text = rt.content || ""
      
      // Only escape HTML entities for text content, not for code
      if (rt.annotations?.code) {
        return `<code class="notion-inline-code">${escapeHtml(text)}</code>`
      }

      // For regular text, escape HTML entities
      text = escapeHtml(text)

      if (rt.annotations?.bold) {
        text = `<strong class="font-semibold">${text}</strong>`
      }
      if (rt.annotations?.italic) {
        text = `<em>${text}</em>`
      }
      if (rt.annotations?.strikethrough) {
        text = `<del>${text}</del>`
      }
      if (rt.annotations?.underline) {
        text = `<u>${text}</u>`
      }
      if (rt.href) {
        const safeUrl = sanitizeUrl(rt.href)
        text = `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="notion-link">${text}</a>`
      }
      
      return text
    })
    .join("")
}

// Process children blocks
export async function processChildBlocks(children: (NotionBlock | TableRow)[], folder: string = ""): Promise<string> {
  if (!children || !Array.isArray(children)) {
    return ""
  }
  
  const childPromises = children
    .filter((child): child is NotionBlock => child.type !== 'table_row')
    .map((child) => convertNotionBlockToHtml(child, folder))
  const childResults = await Promise.all(childPromises)
  return childResults.join("")
}

// Convert Notion block to HTML
export async function convertNotionBlockToHtml(block: NotionBlock, folder: string = ""): Promise<string> {
  if (!block || !block.type) {
    return ""
  }

  switch (block.type) {
    case "paragraph":
      const pText = processRichText(block.content?.rich_text || [])
      return pText ? `<p class="notion-paragraph">${pText}</p>` : ""

    case "heading_1":
      const h1Text = processRichText(block.content?.rich_text || [])
      return h1Text ? `<h1 class="notion-heading-1">${h1Text}</h1>` : ""

    case "heading_2":
      const h2Text = processRichText(block.content?.rich_text || [])
      return h2Text ? `<h2 class="notion-heading-2">${h2Text}</h2>` : ""

    case "heading_3":
      const h3Text = processRichText(block.content?.rich_text || [])
      return h3Text ? `<h3 class="notion-heading-3">${h3Text}</h3>` : ""

    case "bulleted_list_item":
      const liText = processRichText(block.content?.rich_text || [])
      const liChildren = await processChildBlocks(block.children || [], folder)
      return liText || liChildren
        ? `<li class="notion-list-item">${liText}${liChildren ? `<ul class="notion-nested-list">${liChildren}</ul>` : ""}</li>`
        : ""

    case "numbered_list_item":
      const numLiText = processRichText(block.content?.rich_text || [])
      const numLiChildren = await processChildBlocks(block.children || [], folder)
      return numLiText || numLiChildren
        ? `<li class="notion-numbered-item">${numLiText}${numLiChildren ? `<ol class="notion-nested-list">${numLiChildren}</ol>` : ""}</li>`
        : ""

    case "code":
      const codeContent = block.content?.rich_text?.map(rt => rt.content || "").join("") || ""
      const language = block.content?.language || ""
      return `<pre class="notion-code-block"><code class="language-${escapeHtml(language)}">${escapeHtml(codeContent)}</code></pre>`

    case "quote":
      const quoteText = processRichText(block.content?.rich_text || [])
      // processRichText already escapes text and emits formatting markup — do not re-escape.
      return quoteText ? `<blockquote class="notion-quote">${quoteText}</blockquote>` : ""

    case "callout":
      const calloutText = processRichText(block.content?.rich_text || [])
      const icon = block.content?.icon?.emoji || "💡"
      const calloutChildren = await processChildBlocks(block.children || [], folder)
      return calloutText || calloutChildren
        ? `<div class="notion-callout">
             <span class="notion-callout-icon">${escapeHtml(icon)}</span>
             <div class="notion-callout-content">
               ${calloutText}
               ${calloutChildren}
             </div>
           </div>`
        : ""

    case "divider":
      return '<hr class="notion-divider">'

    case "image":
      if (block.content?.url) {
        const caption = processRichText(block.content?.caption || [])
        const safeUrl = sanitizeUrl(block.content.url)
        // Build the alt from the raw caption text so escapeHtml runs exactly once
        // (the figcaption uses the already-escaped HTML from processRichText).
        const altText =
          (block.content?.caption || [])
            .map((rt: RichText) => rt.content || "")
            .join("")
            .trim() || "Image"
        return `<figure class="notion-image">
          <img src="${safeUrl}" alt="${escapeHtml(altText)}" class="notion-image-content" loading="lazy"
               onerror="this.onerror=null;this.src='${withBasePath('/placeholder.svg?height=400&width=600&text=Image%20Not%20Found')}'">
          ${caption ? `<figcaption class="notion-image-caption">${caption}</figcaption>` : ""}
        </figure>`
      }
      return ""

    case "video":
      if (block.content?.url) {
        const safeUrl = sanitizeUrl(block.content.url)
        return `<div class="notion-video">
          <video controls class="notion-video-content">
            <source src="${safeUrl}">
            Your browser does not support the video tag.
          </video>
        </div>`
      }
      return ""

    case "embed":
      if (block.content?.url) {
        const safeUrl = sanitizeUrl(block.content.url)
        return `<div class="notion-embed">
          <iframe src="${safeUrl}" class="notion-embed-content" frameborder="0"></iframe>
        </div>`
      }
      return ""

    case "bookmark":
      if (block.content?.url) {
        const safeUrl = sanitizeUrl(block.content.url)
        return `<div class="notion-bookmark">
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="notion-bookmark-link">
            <div class="notion-bookmark-title">🔗 Bookmark</div>
            <div class="notion-bookmark-url">${escapeHtml(safeUrl)}</div>
          </a>
        </div>`
      }
      return ""

    case "file":
    case "pdf":
      if (block.content?.url) {
        const fileName = block.content?.name || "Download file"
        const safeUrl = sanitizeUrl(block.content.url)
        const fileSize = block.content?.size ? formatFileSize(block.content.size) : ""
        const fileIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`
        const dlIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>`
        return `<div class="notion-file">
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="notion-file-link">
            <span class="notion-file-icon">${fileIcon}</span>
            <span class="notion-file-info">
              <span class="notion-file-name">${escapeHtml(fileName)}</span>
              ${fileSize ? `<span class="notion-file-size">${escapeHtml(fileSize)}</span>` : ""}
            </span>
            <span class="notion-file-dl">${dlIcon}</span>
          </a>
        </div>`
      }
      return ""

    case "audio":
      if (block.content?.url) {
        const safeUrl = sanitizeUrl(block.content.url)
        return `<div class="notion-audio">
          <audio controls class="notion-audio-content">
            <source src="${safeUrl}">
            Your browser does not support the audio element.
          </audio>
        </div>`
      }
      return ""

    case "table":
      if (block.children && Array.isArray(block.children)) {
        const hasColumnHeader = block.content?.has_column_header || false
        const hasRowHeader = block.content?.has_row_header || false
        
        const rows = block.children
          .filter((row): row is TableRow => row.type === 'table_row' && !!row.content)
          .map((row, rowIndex) => {
            const cells = row.content.cells.map((cell: RichText[], cellIndex: number) => {
              const isHeaderCell = (hasColumnHeader && rowIndex === 0) || 
                                 (hasRowHeader && cellIndex === 0)
              const cellContent = processRichText(cell)
              const Tag = isHeaderCell ? 'th' : 'td'
              const cellClasses = [
                'px-4',
                'py-3',
                'text-left',
                isHeaderCell ? 'font-medium text-foreground bg-muted/50' : 'text-muted-foreground'
              ].join(' ')
              
              return `<${Tag} class="${cellClasses}">${cellContent}</${Tag}>`
            }).join('')
            
            return `<tr class="divide-x divide-border">${cells}</tr>`
          })
          .join('')
        
        return `
          <div class="my-6 overflow-x-auto">
            <table class="w-full">
              <tbody class="divide-y divide-border bg-background text-sm">
                ${rows}
              </tbody>
            </table>
          </div>
        `
      }
      return ""

    case "toggle":
      const toggleText = processRichText(block.content?.rich_text || [])
      const toggleContent = await processChildBlocks(block.children || [], folder)
      return `<details class="notion-toggle">
        <summary class="notion-toggle-summary">${toggleText}</summary>
        <div class="notion-toggle-content">${toggleContent}</div>
      </details>`
    case "link_preview": {
      const previewUrl = sanitizeUrl(block.content?.url || "")
      if (!previewUrl) return ""
      return `
        <div class="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <a
            href="${previewUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            ${escapeHtml(block.content?.url || "")}
          </a>
        </div>
      `
    }
    default:
      // Generic fallback for any block type that has children but isn't explicitly handled
      if (block.children && Array.isArray(block.children)) {
        const childrenContent = await processChildBlocks(block.children, folder)
        if (childrenContent) {
          return `<div class="notion-block notion-${escapeHtml(block.type)}">${childrenContent}</div>`
        }
      }
      return ""
  }
}

// Main function to convert Notion content to HTML
export async function convertNotionContentToHtml(blocks: NotionBlock[], folder: string = ""): Promise<string> {
  if (!blocks || !Array.isArray(blocks)) {
    return ""
  }

  const htmlBlocks: string[] = []

  for (const block of blocks) {
    const html = await convertNotionBlockToHtml(block, folder)
    if (html) {
      htmlBlocks.push(html)
    }
  }

  return htmlBlocks.join("\n")
}

// Extract excerpt from Notion content
export function extractExcerptFromNotionContent(content: NotionBlock[]): string {
  if (!content || !Array.isArray(content)) return ""

  for (const block of content) {
    if (block.type === "paragraph" && block.content?.rich_text) {
      const text = block.content.rich_text
        .map((rt: RichText) => rt.content || "")
        .join("")
        .trim()
      if (text) {
        return text.length > 200 ? text.substring(0, 200) + "..." : text
      }
    }
  }
  return ""
} 