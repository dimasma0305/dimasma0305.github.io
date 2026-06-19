import { afterEach, describe, expect, test } from "bun:test"
import {
  cn,
  withBasePath,
  formatDate,
  slugify,
  truncateText,
  extractTextFromHtml,
  getReadingTime,
  isValidUrl,
  sanitizeHtml,
  unescapeHtml,
  cleanText,
  sanitizeForDisplay,
  normalizeWhitespace,
  stripHtmlTags,
  generateId,
  debounce,
} from "./utils"

// Covers the utils.ts exports NOT already pinned by utils.test.ts (which owns
// sanitizeUrl + escapeHtml). These assert the REAL contract observed in source,
// including the env-driven branch of withBasePath.

describe("cn - tailwind class merge", () => {
  test("merges conflicting tailwind classes, last wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })

  test("dedupes / resolves conflicts and keeps non-conflicting classes", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg")
    expect(cn("px-2", "py-2")).toBe("px-2 py-2")
  })

  test("ignores falsy values via clsx", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b")
  })

  test("supports conditional object syntax", () => {
    expect(cn({ active: true, hidden: false })).toBe("active")
  })
})

describe("withBasePath - prefixing is env-driven", () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV
  const ORIGINAL_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH

  afterEach(() => {
    // Restore env so other tests/files see the original values.
    if (ORIGINAL_NODE_ENV === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = ORIGINAL_NODE_ENV
    if (ORIGINAL_BASE_PATH === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH
    else process.env.NEXT_PUBLIC_BASE_PATH = ORIGINAL_BASE_PATH
  })

  test("non-production: returns the path unchanged (empty base)", () => {
    process.env.NODE_ENV = "test"
    expect(withBasePath("/blog-index.json")).toBe("/blog-index.json")
  })

  test("production with NEXT_PUBLIC_BASE_PATH: prefixes the path", () => {
    process.env.NODE_ENV = "production"
    process.env.NEXT_PUBLIC_BASE_PATH = "/base"
    expect(withBasePath("/posts/x/post.json")).toBe("/base/posts/x/post.json")
  })

  test("production with unset base path: does not stringify undefined into the path", () => {
    process.env.NODE_ENV = "production"
    delete process.env.NEXT_PUBLIC_BASE_PATH
    const out = withBasePath("/blog-index.json")
    expect(out).toBe("/blog-index.json")
    expect(out).not.toContain("undefined")
  })
})

describe("slugify", () => {
  test("lowercases, strips punctuation, hyphenates spaces", () => {
    expect(slugify("Hello World!")).toBe("hello-world")
  })

  test("collapses repeated hyphens and spaces", () => {
    expect(slugify("a   b---c")).toBe("a-b-c")
  })

  test("keeps existing word characters and digits", () => {
    expect(slugify("Web3 Security 101")).toBe("web3-security-101")
  })
})

describe("truncateText", () => {
  test("returns input unchanged when within maxLength", () => {
    expect(truncateText("short", 10)).toBe("short")
  })

  test("truncates and appends ellipsis when over maxLength", () => {
    expect(truncateText("abcdefghij", 5)).toBe("abcde...")
  })

  test("trims trailing whitespace before the ellipsis", () => {
    expect(truncateText("abcd efgh", 5)).toBe("abcd...")
  })
})

describe("extractTextFromHtml", () => {
  test("strips tags and trims", () => {
    expect(extractTextFromHtml("<p>hello <b>world</b></p>")).toBe("hello world")
  })

  test("returns empty for tag-only input", () => {
    expect(extractTextFromHtml("<br/>")).toBe("")
  })
})

describe("getReadingTime", () => {
  test("rounds up based on 200 wpm", () => {
    expect(getReadingTime("one two three")).toBe(1)
  })

  test("longer content scales up", () => {
    const words = Array(401).fill("word").join(" ")
    expect(getReadingTime(words)).toBe(3) // ceil(401/200)
  })
})

describe("isValidUrl", () => {
  test("true for absolute URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true)
    expect(isValidUrl("mailto:a@b.com")).toBe(true)
  })

  test("false for non-URL strings", () => {
    expect(isValidUrl("not a url")).toBe(false)
    expect(isValidUrl("/relative/path")).toBe(false)
  })
})

describe("sanitizeHtml - coarse tag/handler stripping", () => {
  test("removes script and iframe blocks", () => {
    const out = sanitizeHtml("<p>ok</p><script>alert(1)</script><iframe src=x></iframe>")
    expect(out).not.toContain("<script>")
    expect(out).not.toContain("<iframe")
    expect(out).toContain("<p>ok</p>")
  })

  test("strips javascript: protocol and inline event handlers", () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)" onclick="x()">y</a>')
    expect(out.toLowerCase()).not.toContain("javascript:")
    expect(out.toLowerCase()).not.toContain("onclick=")
  })
})

describe("unescapeHtml", () => {
  test("decodes the core HTML entities", () => {
    expect(unescapeHtml("&lt;a&gt; &amp; &quot;b&quot; &#39;c&#39;")).toBe(`<a> & "b" 'c'`)
  })

  test("decodes typographic entities and leaves unknown entities intact", () => {
    expect(unescapeHtml("a&mdash;b &unknownentity;")).toBe("a—b &unknownentity;")
  })
})

describe("cleanText", () => {
  test("unescapes, strips tags, normalizes whitespace", () => {
    expect(cleanText("&lt;b&gt;hello&lt;/b&gt;   <i>world</i>")).toBe("hello world")
  })

  test("removes control characters but keeps normal text", () => {
    expect(cleanText("a\x00b\x07c")).toBe("abc")
  })

  test("returns empty string for falsy input", () => {
    expect(cleanText("")).toBe("")
  })
})

describe("sanitizeForDisplay - clean then escape (round-trips safely)", () => {
  test("escaped tag input is decoded, stripped, then re-escaped to inert text", () => {
    // Input arrives HTML-escaped (e.g. from a JSON field). cleanText decodes it,
    // strips the now-real tag, and the result is re-escaped for safe display.
    const out = sanitizeForDisplay("&lt;script&gt;alert(1)&lt;/script&gt;")
    expect(out).not.toContain("<script>")
    // The decoded-then-stripped text "alert(1)" remains, escaped where needed.
    expect(out).toContain("alert(1)")
  })

  test("raw dangerous markup is neutralized (no executable tag survives)", () => {
    const out = sanitizeForDisplay('<img src=x onerror="alert(1)">')
    expect(out).not.toContain("<img")
    expect(out).not.toContain("onerror")
  })

  test("benign text passes through, special chars escaped", () => {
    expect(sanitizeForDisplay("a & b")).toBe("a &amp; b")
  })

  test("returns empty string for falsy input", () => {
    expect(sanitizeForDisplay("")).toBe("")
  })
})

describe("normalizeWhitespace", () => {
  test("normalizes CRLF and lone CR to LF", () => {
    expect(normalizeWhitespace("a\r\nb\rc")).toBe("a\nb\nc")
  })

  test("converts tabs to 4 spaces", () => {
    expect(normalizeWhitespace("a\tb")).toBe("a    b")
  })

  test("collapses runs of blank lines (trailing-whitespace strip consumes the extra newlines)", () => {
    // The multiline trailing-whitespace strip (/\s+$/gm) matches the newline runs
    // between content lines, so a 4-newline gap collapses to a single newline here
    // rather than the naive two. Pin the actual behavior.
    expect(normalizeWhitespace("a\n\n\n\nb")).toBe("a\nb")
  })

  test("converts non-breaking spaces to regular spaces", () => {
    expect(normalizeWhitespace("a b")).toBe("a b")
  })
})

describe("stripHtmlTags", () => {
  test("removes style and script blocks with their content, then remaining tags", () => {
    const html = "<style>.x{}</style><script>bad()</script><p>keep</p>"
    expect(stripHtmlTags(html)).toBe("keep")
  })

  test("decodes the common entities it knows", () => {
    expect(stripHtmlTags("<span>a &amp; b</span>")).toBe("a & b")
  })
})

describe("formatDate", () => {
  test("formats an ISO date into a long en-US string", () => {
    // Use a clearly mid-day UTC time to avoid TZ off-by-one on the date.
    const out = formatDate("2024-03-15T12:00:00Z")
    expect(out).toContain("2024")
    expect(out).toContain("March")
    expect(out).toContain("15")
  })
})

describe("generateId", () => {
  test("returns a non-empty base36 string within the expected length bound", () => {
    const id = generateId()
    expect(typeof id).toBe("string")
    // Math.random().toString(36).substr(2, 9): 1..9 base36 chars (can be < 9).
    expect(id.length).toBeGreaterThan(0)
    expect(id.length).toBeLessThanOrEqual(9)
    expect(id).toMatch(/^[0-9a-z]+$/)
  })

  test("produces different ids across calls", () => {
    expect(generateId()).not.toBe(generateId())
  })
})

describe("debounce", () => {
  // Timing-based debounce assertions are inherently flaky and our testing rules
  // warn against timeout-based tests, so this is a smoke test of the contract:
  // debounce returns a callable wrapper. The actual delay behavior is left
  // unasserted by design.
  test("returns a function wrapper", () => {
    const wrapped = debounce(() => {}, 10)
    expect(typeof wrapped).toBe("function")
  })

  test("the wrapper is safely invokable without throwing", () => {
    const wrapped = debounce((x: number) => x + 1, 5)
    expect(() => wrapped(1)).not.toThrow()
  })
})
