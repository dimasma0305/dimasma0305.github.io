import { describe, expect, test } from "bun:test"
import {
  convertNotionContentToHtml,
  extractExcerptFromNotionContent,
  processRichText,
  escapeHtml,
  sanitizeUrl,
  type NotionBlock,
  type RichText,
} from "./notion-content-utils"

// This module is the XSS-critical renderer: the site feeds Notion-sourced HTML
// into dangerouslySetInnerHTML, so every text/href/url sink here is the last
// line of defense against stored XSS. These tests pin the SECURE contract of
// the renderer, not the historical behavior of any single block type.
//
// NOTE: the renderer is async (convertNotionContentToHtml / convertNotionBlockToHtml
// return Promise<string>). processRichText / extractExcerptFromNotionContent are sync.
//
// The Notion block shape used here is the project's CUSTOM shape (see RichText /
// NotionBlock interfaces), NOT the raw Notion API shape: rich text lives in
// `content` (not `text`/`plain_text`), and block payloads live under `content`.

// ---------------------------------------------------------------------------
// Helpers to build fake blocks in the project's custom shape.
// ---------------------------------------------------------------------------
const NO_ANNOTATIONS = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: "default",
}

function rt(content: string, extra: Partial<RichText> = {}): RichText {
  return {
    type: "text",
    content,
    annotations: { ...NO_ANNOTATIONS, ...(extra.annotations || {}) },
    ...(extra.href !== undefined ? { href: extra.href } : {}),
  }
}

function paragraph(richText: RichText[]): NotionBlock {
  return {
    id: "p1",
    type: "paragraph",
    created_time: "",
    last_edited_time: "",
    has_children: false,
    archived: false,
    content: { rich_text: richText },
  }
}

function block(type: string, content: NotionBlock["content"]): NotionBlock {
  return {
    id: `b-${type}`,
    type,
    created_time: "",
    last_edited_time: "",
    has_children: false,
    archived: false,
    content,
  }
}

describe("convertNotionContentToHtml - happy path renders block markup", () => {
  test("renders paragraph, heading, code and image blocks into a single HTML string", async () => {
    const blocks: NotionBlock[] = [
      block("heading_1", { rich_text: [rt("My Title")] }),
      paragraph([rt("Hello "), rt("world", { href: "https://example.com/page" })]),
      block("code", { rich_text: [rt('const a = 1;')], language: "javascript" }),
      block("image", { url: "/posts/x/media.png", caption: [rt("a caption")] }),
    ]

    const html = await convertNotionContentToHtml(blocks)

    expect(typeof html).toBe("string")
    // heading
    expect(html).toContain("notion-heading-1")
    expect(html).toContain("My Title")
    // paragraph + safe link (normalized absolute URL)
    expect(html).toContain("notion-paragraph")
    expect(html).toContain("Hello")
    expect(html).toContain('href="https://example.com/page"')
    expect(html).toContain('rel="noopener noreferrer"')
    // code block keeps the language and content
    expect(html).toContain("notion-code-block")
    expect(html).toContain("language-javascript")
    expect(html).toContain("const a = 1;")
    // localized same-origin image url survives verbatim
    expect(html).toContain('src="/posts/x/media.png"')
    expect(html).toContain("a caption")
  })
})

describe("convertNotionContentToHtml - list grouping (numbered lists restart per run)", () => {
  const num = (s: string) => block("numbered_list_item", { rich_text: [rt(s)] })
  const bul = (s: string) => block("bulleted_list_item", { rich_text: [rt(s)] })
  const count = (h: string, needle: string) => h.split(needle).length - 1

  test("consecutive numbered items collapse into a single <ol>", async () => {
    const html = await convertNotionContentToHtml([num("one"), num("two"), num("three")])
    expect(count(html, "<ol")).toBe(1)
    expect(count(html, 'class="notion-numbered-item"')).toBe(3)
  })

  test("numbered lists split by a paragraph render as separate <ol> (each restarts at 1)", async () => {
    const html = await convertNotionContentToHtml([
      num("a1"),
      num("a2"),
      paragraph([rt("interruption")]),
      num("b1"),
      num("b2"),
    ])
    // Two distinct <ol> elements => the browser's list-item counter restarts for
    // the second list instead of continuing from the first (the reported bug).
    expect(count(html, "<ol")).toBe(2)
    expect(count(html, 'class="notion-numbered-item"')).toBe(4)
  })

  test("adjacent bulleted and numbered runs each get their own <ul>/<ol>", async () => {
    const html = await convertNotionContentToHtml([bul("dot"), num("digit")])
    expect(count(html, "<ul")).toBe(1)
    expect(count(html, "<ol")).toBe(1)
  })
})

describe("convertNotionContentToHtml - XSS is escaped / neutralized at every sink", () => {
  test("script payload in paragraph rich_text is HTML-escaped, not emitted raw", async () => {
    const html = await convertNotionContentToHtml([
      paragraph([rt("<script>alert(1)</script>")]),
    ])
    expect(html).not.toContain("<script>")
    expect(html).not.toContain("</script>")
    expect(html).toContain("&lt;script&gt;")
  })

  test("javascript: href is rejected by sanitizeUrl (no javascript: in output)", async () => {
    const html = await convertNotionContentToHtml([
      paragraph([rt("click me", { href: "javascript:alert(1)" })]),
    ])
    // sanitizeUrl returns "" for disallowed protocols, so the anchor gets href="".
    expect(html.toLowerCase()).not.toContain("javascript:")
    expect(html).toContain('href=""')
    // the visible link text is still present and escaped
    expect(html).toContain("click me")
  })

  test("script payload in code block content is escaped", async () => {
    const html = await convertNotionContentToHtml([
      block("code", { rich_text: [rt("<script>alert(1)</script>")], language: "html" }),
    ])
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })

  test("dangerous image src (javascript:) is dropped to empty by sanitizeUrl", async () => {
    const html = await convertNotionContentToHtml([
      block("image", { url: "javascript:alert(1)", caption: [] }),
    ])
    expect(html.toLowerCase()).not.toContain("javascript:")
    expect(html).toContain('src=""')
  })

  test("attribute-breaking image caption is escaped in alt", async () => {
    const html = await convertNotionContentToHtml([
      block("image", { url: "/posts/x/m.png", caption: [rt('"><img src=x onerror=alert(1)>')] }),
    ])
    // alt is built from raw caption text then escapeHtml'd exactly once
    expect(html).not.toContain("onerror=alert(1)>")
    expect(html).toContain("&lt;img")
    expect(html).toContain("&quot;")
  })

  test("localized same-origin image url survives sanitizeUrl unchanged", async () => {
    const html = await convertNotionContentToHtml([
      block("image", { url: "/posts/my-post/media.png", caption: [] }),
    ])
    expect(html).toContain('src="/posts/my-post/media.png"')
  })
})

describe("processRichText - escaping contract (sync, separate fn from utils.test.ts)", () => {
  test("escapes HTML in plain text", () => {
    expect(processRichText([rt("a < b & c > d")])).toBe("a &lt; b &amp; c &gt; d")
  })

  test("escapes HTML inside inline code annotation", () => {
    const out = processRichText([rt("<b>x</b>", { annotations: { ...NO_ANNOTATIONS, code: true } })])
    expect(out).toContain("notion-inline-code")
    expect(out).toContain("&lt;b&gt;x&lt;/b&gt;")
    expect(out).not.toContain("<b>")
  })

  test("wraps bold/italic and escapes inner text", () => {
    const out = processRichText([
      rt("<i>", { annotations: { ...NO_ANNOTATIONS, bold: true, italic: true } }),
    ])
    expect(out).toContain("<strong")
    expect(out).toContain("<em>")
    expect(out).toContain("&lt;i&gt;")
  })

  test("href is sanitized; javascript: becomes empty href", () => {
    const out = processRichText([rt("link", { href: "javascript:alert(1)" })])
    expect(out.toLowerCase()).not.toContain("javascript:")
    expect(out).toContain('href=""')
  })

  test("returns empty string for missing / non-array input", () => {
    // @ts-expect-error testing runtime robustness against bad callers
    expect(processRichText(null)).toBe("")
    // @ts-expect-error testing runtime robustness against bad callers
    expect(processRichText(undefined)).toBe("")
    expect(processRichText([])).toBe("")
  })
})

describe("extractExcerptFromNotionContent - first paragraph as plain text", () => {
  test("returns the first paragraph's joined rich_text content (raw, unescaped)", () => {
    const excerpt = extractExcerptFromNotionContent([
      block("heading_1", { rich_text: [rt("Title")] }),
      paragraph([rt("First "), rt("paragraph text.")]),
      paragraph([rt("second")]),
    ])
    expect(excerpt).toBe("First paragraph text.")
  })

  test("skips non-paragraph and empty paragraphs until it finds text", () => {
    const excerpt = extractExcerptFromNotionContent([
      block("divider", {}),
      paragraph([rt("   ")]), // whitespace-only -> trimmed to "" -> skipped
      paragraph([rt("real content")]),
    ])
    expect(excerpt).toBe("real content")
  })

  test("truncates content longer than 200 chars with an ellipsis", () => {
    const long = "x".repeat(250)
    const excerpt = extractExcerptFromNotionContent([paragraph([rt(long)])])
    expect(excerpt.endsWith("...")).toBe(true)
    expect(excerpt.length).toBe(203) // 200 chars + "..."
  })

  test("does NOT add an ellipsis for content at or under 200 chars", () => {
    const text = "y".repeat(200)
    const excerpt = extractExcerptFromNotionContent([paragraph([rt(text)])])
    expect(excerpt).toBe(text)
    expect(excerpt.endsWith("...")).toBe(false)
  })

  test("returns empty string for empty array, null, and no-paragraph input", () => {
    expect(extractExcerptFromNotionContent([])).toBe("")
    // @ts-expect-error testing runtime robustness against bad callers
    expect(extractExcerptFromNotionContent(null)).toBe("")
    // @ts-expect-error testing runtime robustness against bad callers
    expect(extractExcerptFromNotionContent(undefined)).toBe("")
    expect(extractExcerptFromNotionContent([block("divider", {})])).toBe("")
  })
})

describe("convertNotionContentToHtml - edge cases do not throw", () => {
  test("empty array returns empty string", async () => {
    expect(await convertNotionContentToHtml([])).toBe("")
  })

  test("null / undefined input returns empty string (no throw)", async () => {
    // @ts-expect-error testing runtime robustness against bad callers
    expect(await convertNotionContentToHtml(null)).toBe("")
    // @ts-expect-error testing runtime robustness against bad callers
    expect(await convertNotionContentToHtml(undefined)).toBe("")
  })

  test("malformed blocks (missing type / empty content) do not throw and skip", async () => {
    const malformed: NotionBlock[] = [
      { } as NotionBlock,
      { type: "" } as NotionBlock,
      { type: "paragraph", content: {} } as NotionBlock, // no rich_text
      { type: "totally-unknown-type", content: {} } as NotionBlock,
    ]
    const html = await convertNotionContentToHtml(malformed)
    expect(typeof html).toBe("string")
  })

  test("unknown block type with no children renders nothing (no raw type leak)", async () => {
    const html = await convertNotionContentToHtml([block("mystery", {})])
    expect(html).toBe("")
  })
})

describe("re-exported sanitizers come from the canonical source", () => {
  test("escapeHtml is re-exported and works", () => {
    expect(escapeHtml("<x>")).toBe("&lt;x&gt;")
  })

  test("sanitizeUrl is re-exported and works", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("")
    expect(sanitizeUrl("https://x.com")).toBe("https://x.com/")
  })
})
