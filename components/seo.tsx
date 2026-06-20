import { Metadata } from "next"
import type { Post } from "@/lib/posts-client"
import { faqs } from "@/lib/services-data"

interface SEOProps {
  post: Post
  baseUrl?: string
}

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://dimasma0305.github.io') + (process.env.NEXT_PUBLIC_BASE_PATH || '')

// Serialize JSON-LD safely for embedding inside a <script> element.
// JSON.stringify does NOT escape "<", ">" or "/", so a value containing
// "</script>" would otherwise break out of the ld+json block and allow
// arbitrary markup/script execution. Escape the characters that are
// significant in an HTML <script> context (plus U+2028/U+2029, which are
// valid JSON but invalid raw in JS string literals / can break parsing).
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
export function generatePostMetadata({ post }: SEOProps): Metadata {
  const postUrl = `${baseUrl}/posts/${post.slug}/`
  const imageUrl = post.coverImage?.startsWith('http') 
    ? post.coverImage 
    : `${baseUrl}${post.coverImage || '/og-image.jpg'}`

  // Create a clean description from excerpt
  const description = post.excerpt
    .replace(/[#*_`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
    .substring(0, 160)

  // Generate keywords from categories and title
  const keywords = [
    ...post.categories,
    'cybersecurity',
    'CTF',
    'writeup',
    'security research',
    'Dimas Maulana'
  ].join(', ')

  return {
    title: post.title,
    description,
    keywords,
    authors: [{ name: post.owner?.name || 'Dimas Maulana' }],
    creator: post.owner?.name || 'Dimas Maulana',
    publisher: 'Dimas Maulana',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      type: 'article',
      url: postUrl,
      // og/twitter titles do NOT inherit the metadata title.template, so the
      // name is added explicitly — every share becomes a brand impression.
      title: `${post.title} | Dimas Maulana`,
      description,
      siteName: 'Dimas Maulana',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.owner?.name || 'Dimas Maulana'],
      tags: [...post.categories],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Dimas Maulana`,
      description,
      creator: '@dimasma__',
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'article:author': post.owner?.name || 'Dimas Maulana',
      'article:published_time': post.createdAt,
      'article:modified_time': post.updatedAt,
      'article:section': post.categories[0] || 'Technology',
      'article:tag': post.categories.join(','),
    },
  }
}

export function generateBlogMetadata(): Metadata {
  return {
    title: "Blog | Cybersecurity Research & CTF Writeups",
    description: "Explore cybersecurity research, CTF writeups, vulnerability analysis, and security tutorials by Dimas Maulana. Learn about web security, penetration testing, and ethical hacking.",
    keywords: "cybersecurity blog, CTF writeups, security research, penetration testing, web security, vulnerability analysis, ethical hacking, bug bounty, infosec",
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
    openGraph: {
      type: 'website',
      url: `${baseUrl}/blog`,
      title: "Blog | Cybersecurity Research & CTF Writeups",
      description: "Explore cybersecurity research, CTF writeups, vulnerability analysis, and security tutorials by Dimas Maulana.",
      siteName: 'Dimas Maulana',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Dimas Maulana Blog",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Blog | Cybersecurity Research & CTF Writeups",
      description: "Explore cybersecurity research, CTF writeups, vulnerability analysis, and security tutorials.",
      creator: '@dimasma__',
      images: [`${baseUrl}/og-image.jpg`],
    },
  }
}

export function generateNotesMetadata(): Metadata {
  return {
    title: "Notes | Technical Notes & Research",
    description: "Browse technical notes, research findings, and documentation on various topics including cybersecurity, programming, and system architecture.",
    keywords: "technical notes, research notes, documentation, cybersecurity notes, programming notes, system architecture, CTF notes, security research, Dimas Maulana",
    authors: [{ name: "Dimas Maulana" }],
    creator: "Dimas Maulana",
    publisher: "Dimas Maulana",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/notes`,
    },
    openGraph: {
      type: 'website',
      url: `${baseUrl}/notes`,
      title: "Notes | Technical Notes & Research",
      description: "Browse technical notes, research findings, and documentation on various topics including cybersecurity, programming, and system architecture.",
      siteName: 'Dimas Maulana',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Dimas Maulana Notes",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Notes | Technical Notes & Research",
      description: "Browse technical notes, research findings, and documentation on various topics.",
      creator: '@dimasma__',
      images: [`${baseUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Read the index reading_time for a post slug. The component receives a Post
// whose `content` is empty at this layer (post page passes content: ""), so
// wordCount/timeRequired/articleBody must NOT be derived from it. reading_time
// (minutes) lives in blog-index.json; read it by slug, mirroring
// generateNoteMetadata. Returns undefined on any failure so callers can omit
// the dependent JSON-LD fields instead of emitting wrong values.
function getPostReadingTime(slug: string): number | undefined {
  // Server-only: guard so a future client import can't bundle/run fs in the browser.
  if (typeof window !== 'undefined') return undefined
  try {
    const fs = require('fs')
    const path = require('path')
    const indexPath = path.join(process.cwd(), 'public', 'blog-index.json')
    const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    const entry = (data.posts?.all || data.posts?.published || []).find(
      (p: any) => p.slug === slug
    )
    const rt = entry?.reading_time
    return typeof rt === 'number' && rt > 0 ? rt : undefined
  } catch (error) {
    console.error('Error reading post reading_time:', error)
    return undefined
  }
}

const READING_WORDS_PER_MINUTE = 200

// Enhanced JSON-LD Structured Data Component
export function PostStructuredData({ post }: SEOProps) {
  const postUrl = `${baseUrl}/posts/${post.slug}/`
  const imageUrl = post.coverImage?.startsWith('http')
    ? post.coverImage
    : `${baseUrl}${post.coverImage || '/og-image.jpg'}`

  // reading_time (minutes) sourced from the index, not from the empty content
  // string. timeRequired/wordCount are derived from it; both are omitted when
  // unknown (JSON.stringify drops undefined keys) so we never emit wordCount:0.
  const readingTime = getPostReadingTime(post.slug)

  // Main Article structured data
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": postUrl,
    headline: post.title,
    description: post.excerpt?.replace(/[#*_`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim(),
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
      caption: post.title
    },
    url: postUrl,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: post.owner?.name || "Dimas Maulana",
      url: baseUrl,
      image: {
        "@type": "ImageObject",
        url: post.owner?.avatar_url || "https://avatars.githubusercontent.com/u/92920739",
        caption: post.owner?.name || "Dimas Maulana"
      },
      sameAs: [
        "https://twitter.com/dimasma__",
        "https://github.com/dimasma0305",
        "https://linkedin.com/in/solderet"
      ],
      jobTitle: "Cybersecurity Researcher",
      worksFor: {
        "@type": "Organization",
        name: "Independent"
      }
    },
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Dimas Maulana Blog",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512
      },
      sameAs: [
        "https://twitter.com/dimasma__",
        "https://github.com/dimasma0305"
      ]
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
      url: postUrl,
      name: post.title,
      description: post.excerpt,
      inLanguage: "en-US",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Dimas Maulana Blog"
      }
    },
    keywords: post.categories?.join(", "),
    // Estimate wordCount from reading_time (minutes * WPM); omit both when
    // reading_time is unknown rather than emit wordCount:0 / a bogus default.
    wordCount: readingTime ? readingTime * READING_WORDS_PER_MINUTE : undefined,
    timeRequired: readingTime ? `PT${readingTime}M` : undefined,
    articleSection: post.categories?.[0] || "Technology",
    // content is empty at this layer; only emit articleBody when it actually
    // has text (otherwise the old code emitted the literal string "...").
    articleBody: post.content
      ? post.content.replace(/<[^>]*>/g, '').substring(0, 500) + "..."
      : undefined,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    genre: ["Technology", "Cybersecurity", "Tutorial"],
    about: post.categories?.map(category => ({
      "@type": "Thing",
      name: category,
      sameAs: `${baseUrl}/categories/${encodeURIComponent(category.toLowerCase())}/`
    })),
    mentions: post.categories?.map(category => ({
      "@type": "Thing",
      name: category
    })),
    potentialAction: [
      {
        "@type": "ReadAction",
        target: postUrl
      },
      {
        "@type": "ShareAction",
        target: postUrl,
        agent: {
          "@type": "Person",
          name: "Reader"
        }
      }
    ]
  }

  // Website structured data
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Dimas Maulana Blog",
    description: "Cybersecurity research, CTF writeups, vulnerability analysis, and security tutorials",
    publisher: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    inLanguage: "en-US"
  }

  // Person structured data
  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: "Dimas Maulana",
    givenName: "Dimas",
    familyName: "Maulana",
    url: baseUrl,
    image: {
      "@type": "ImageObject",
      url: post.owner?.avatar_url || "https://avatars.githubusercontent.com/u/92920739",
      caption: "Dimas Maulana"
    },
    sameAs: [
      "https://twitter.com/dimasma__",
      "https://github.com/dimasma0305",
      "https://linkedin.com/in/solderet"
    ],
    jobTitle: "Cybersecurity Researcher",
    description: "Cybersecurity researcher specializing in CTF challenges, vulnerability analysis, and security tutorials",
    knowsAbout: [
      "Cybersecurity",
      "Penetration Testing",
      "Web Security",
      "CTF Challenges",
      "Vulnerability Analysis",
      "Ethical Hacking"
    ],
    worksFor: {
      "@type": "Organization",
      name: "Independent"
    }
  }

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${baseUrl}/blog/`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.categories?.[0] || "Article",
        item: post.categories?.[0] ? `${baseUrl}/categories/${encodeURIComponent(post.categories[0].toLowerCase())}/` : `${baseUrl}/blog/`
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: postUrl
      }
    ]
  }

  // Combine all structured data. (No synthetic FAQPage: emitting hardcoded Q&A
  // that never appears on the page is structured-data spam and risks a manual
  // action suppressing every post from rich results. The real FAQ lives on
  // /services.)
  const combinedStructuredData = [
    articleStructuredData,
    websiteStructuredData,
    personStructuredData,
    breadcrumbStructuredData,
  ]

  return (
    <>
      {combinedStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
        />
      ))}
    </>
  )
}

// Enhanced Blog Section Structured Data
export function BlogStructuredData() {
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${baseUrl}/blog#blog`,
    url: `${baseUrl}/blog`,
    name: "Dimas Maulana Blog",
    description: "Cybersecurity research, CTF writeups, vulnerability analysis, and security tutorials",
    publisher: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: "Dimas Maulana",
      url: baseUrl,
      sameAs: [
        "https://twitter.com/dimasma__",
        "https://github.com/dimasma0305",
        "https://linkedin.com/in/solderet"
      ]
    },
    inLanguage: "en-US",
    genre: ["Technology", "Cybersecurity", "Education"],
    keywords: "cybersecurity, CTF, writeups, security research, penetration testing, vulnerability analysis",
    about: [
      {
        "@type": "Thing",
        name: "Cybersecurity",
        sameAs: "https://en.wikipedia.org/wiki/Computer_security"
      },
      {
        "@type": "Thing", 
        name: "Capture The Flag",
        sameAs: "https://en.wikipedia.org/wiki/Capture_the_flag_(cybersecurity)"
      }
    ],
    potentialAction: [
      {
        "@type": "ReadAction",
        target: `${baseUrl}/blog`
      },
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    ]
  }

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Dimas Maulana Blog",
    description: "Cybersecurity research, CTF writeups, vulnerability analysis, and security tutorials",
    publisher: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    inLanguage: "en-US"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(blogStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteStructuredData) }}
      />
    </>
  )
}

// Homepage Structured Data Component
export function HomepageStructuredData() {
  // Person schema for Dimas Maulana
  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: "Dimas Maulana",
    givenName: "Dimas",
    familyName: "Maulana",
    url: baseUrl,
    image: {
      "@type": "ImageObject",
      url: "https://avatars.githubusercontent.com/u/92920739",
      caption: "Dimas Maulana - Cybersecurity Researcher"
    },
    sameAs: [
      "https://twitter.com/dimasma__",
      "https://github.com/dimasma0305",
      "https://linkedin.com/in/solderet"
    ],
    jobTitle: "Cybersecurity Researcher",
    description: "Cybersecurity enthusiast and CTF player specializing in penetration testing, vulnerability analysis, and security research",
    knowsAbout: [
      "Cybersecurity",
      "Penetration Testing",
      "Web Security",
      "CTF Challenges",
      "Vulnerability Analysis",
      "Ethical Hacking",
      "Linux Security",
      "Security Research"
    ],
    worksFor: {
      "@type": "Organization",
      name: "Independent Researcher"
    },
    memberOf: [
      {
        "@type": "Organization",
        name: "TCP1P",
        url: "https://github.com/TCP1P"
      },
      {
        "@type": "Organization", 
        name: "Project Sekai CTF",
        url: "https://github.com/project-sekai-ctf"
      }
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Denpasar",
      addressRegion: "Bali",
      addressCountry: "Indonesia"
    },
    nationality: {
      "@type": "Country",
      name: "Indonesia"
    }
  }

  // Website schema
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Dimas Maulana - Cybersecurity Researcher",
    description: "Personal website of Dimas Maulana, a cybersecurity researcher, CTF player, and security enthusiast from Indonesia",
    publisher: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`
    },
    author: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`
    },
    inLanguage: "en-US",
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`
    },
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "ReadAction",
        target: `${baseUrl}/blog`
      }
    ]
  }

  // Organization schema for professional identity
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "Dimas Maulana",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
      width: 512,
      height: 512
    },
    image: {
      "@type": "ImageObject",
      url: "https://avatars.githubusercontent.com/u/92920739",
      caption: "Dimas Maulana"
    },
    description: "Cybersecurity research and CTF writeups by Dimas Maulana",
    founder: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`
    },
    sameAs: [
      "https://twitter.com/dimasma__",
      "https://github.com/dimasma0305",
      "https://linkedin.com/in/solderet"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Professional",
      availableLanguage: ["English", "Indonesian"]
    }
  }

  // Blog schema
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${baseUrl}/blog#blog`,
    url: `${baseUrl}/blog`,
    name: "Dimas Maulana Blog",
    description: "Cybersecurity research, CTF writeups, vulnerability analysis, and security tutorials",
    author: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`
    },
    publisher: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`
    },
    inLanguage: "en-US",
    genre: ["Technology", "Cybersecurity", "Education"],
    keywords: "cybersecurity, CTF, writeups, security research, penetration testing, vulnerability analysis",
    about: [
      {
        "@type": "Thing",
        name: "Cybersecurity",
        sameAs: "https://en.wikipedia.org/wiki/Computer_security"
      },
      {
        "@type": "Thing",
        name: "Capture The Flag",
        sameAs: "https://en.wikipedia.org/wiki/Capture_the_flag_(cybersecurity)"
      }
    ],
    isPartOf: {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`
    }
  }

  // Breadcrumb for homepage
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl
      }
    ]
  }

  // Combine all structured data
  const combinedStructuredData = [
    personStructuredData,
    websiteStructuredData,
    organizationStructuredData,
    blogStructuredData,
    breadcrumbStructuredData
  ]

  return (
    <>
      {combinedStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
        />
      ))}
    </>
  )
}

export function NotesStructuredData() {
  const notesStructuredData = {
    "@context": "https://schema.org",
    "@type": "Collection",
    "@id": `${baseUrl}/notes#collection`,
    url: `${baseUrl}/notes`,
    name: "Dimas Maulana Technical Notes",
    description: "Collection of technical notes, research findings, and documentation",
    creator: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: "Dimas Maulana",
      url: baseUrl,
      sameAs: [
        "https://twitter.com/dimasma__",
        "https://github.com/dimasma0305",
        "https://linkedin.com/in/solderet"
      ]
    },
    inLanguage: "en-US",
    genre: ["Technology", "Research", "Documentation"],
    keywords: "technical notes, research notes, documentation, cybersecurity, programming",
    about: [
      {
        "@type": "Thing",
        name: "Technical Documentation",
        sameAs: "https://en.wikipedia.org/wiki/Technical_documentation"
      },
      {
        "@type": "Thing",
        name: "Research Notes",
        sameAs: "https://en.wikipedia.org/wiki/Research"
      }
    ],
    potentialAction: [
      {
        "@type": "ReadAction",
        target: `${baseUrl}/notes`
      },
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLd(notesStructuredData),
      }}
    />
  )
}

// Look up a note in notes-index.json by slug so the structured data can carry
// real title/dates/description/image/keywords instead of a slug-derived guess.
// Mirrors generateNoteMetadata's read pattern; returns null on any failure so
// the component degrades to slug-only data without throwing during render.
function getNoteFromIndex(slug: string): any | null {
  // Server-only: guard so a future client import can't bundle/run fs in the browser.
  if (typeof window !== 'undefined') return null
  try {
    const fs = require('fs')
    const path = require('path')
    const indexPath = path.join(process.cwd(), 'public', 'notes-index.json')
    const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    return data.posts?.all?.find((n: any) => n.slug === slug) || null
  } catch (error) {
    console.error('Error reading note from index:', error)
    return null
  }
}

export function NoteStructuredData({ slug }: { slug: string }) {
  const noteUrl = `${baseUrl}/notes/${slug}`

  // Pull real metadata from the index; fall back to slug-derived values if the
  // note (or the index) is unavailable.
  const note = getNoteFromIndex(slug)

  const headline = note?.title
    ? note.title
    : slug
        .split("-")
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ")

  // Clean the excerpt into a plain-text description, mirroring the post version.
  const description = note?.excerpt
    ? note.excerpt
        .replace(/[#*_`]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim()
        .substring(0, 160)
    : undefined

  // featured_image is null for most notes; fall back to the default OG image
  // (consistent with generateNoteMetadata) so we never emit image: null.
  const imageUrl = note?.featured_image
    ? `${baseUrl}${note.featured_image}`
    : `${baseUrl}/og-image.jpg`

  // Keywords from the note's categories + tags (deduped), mirroring the post.
  const keywords = note
    ? [...new Set([...(note.categories || []), ...(note.tags || [])])].join(", ") || undefined
    : undefined

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": noteUrl,
    headline,
    description,
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
      caption: headline
    },
    url: noteUrl,
    datePublished: note?.created_time,
    dateModified: note?.last_edited_time || note?.created_time,
    keywords,
    author: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: "Dimas Maulana",
      url: baseUrl,
      image: {
        "@type": "ImageObject",
        url: "https://avatars.githubusercontent.com/u/92920739",
        caption: "Dimas Maulana"
      },
      sameAs: [
        "https://twitter.com/dimasma__",
        "https://github.com/dimasma0305",
        "https://linkedin.com/in/solderet"
      ],
      jobTitle: "Cybersecurity Researcher"
    },
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Dimas Maulana Notes",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512
      },
      sameAs: [
        "https://twitter.com/dimasma__",
        "https://github.com/dimasma0305",
        "https://linkedin.com/in/solderet"
      ]
    },
    inLanguage: "en-US",
    isAccessibleForFree: true,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": noteUrl,
      url: noteUrl,
      name: `Technical Note: ${headline}`,
      inLanguage: "en-US",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Dimas Maulana Notes"
      }
    },
    genre: ["Technology", "Research", "Documentation"],
    potentialAction: [
      {
        "@type": "ReadAction",
        target: noteUrl
      },
      {
        "@type": "ShareAction",
        target: noteUrl,
        agent: {
          "@type": "Person",
          name: "Reader"
        }
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
    />
  )
}

export async function generateNoteMetadata(slug: string): Promise<Metadata> {
  try {
    // Read the notes-index.json file directly from the file system during build
    const fs = require("fs")
    const path = require("path")

    const indexPath = path.join(process.cwd(), "public", "notes-index.json")
    const indexContent = fs.readFileSync(indexPath, "utf8")
    const data = JSON.parse(indexContent)
    
    const note = data.posts?.all?.find((note: any) => note.slug === slug)

    if (!note) {
      return {
        title: 'Note Not Found',
        description: 'The requested technical note could not be found.'
      }
    }

    const noteUrl = `${baseUrl}/notes/${note.slug}`
    
    // Use OG image first, then featured image, then default
    const imageUrl = note.og_image 
      ? `${baseUrl}${note.og_image}` 
      : note.featured_image 
        ? `${baseUrl}${note.featured_image}` 
        : `${baseUrl}/og-image.jpg`

    const description = note.excerpt
      ?.replace(/[#*_`]/g, '')
      ?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      ?.trim()
      ?.substring(0, 160) || 'Technical note'

    // Generate keywords from categories, tags, and title
    const keywords = [
      ...(note.categories || []),
      ...(note.tags || []),
      'technical notes',
      'documentation',
      'research notes',
      'Dimas Maulana'
    ].join(', ')

    return {
      title: note.title,
      description,
      keywords,
      authors: [{ name: note.properties?.author || 'Dimas Maulana' }],
      creator: note.properties?.author || 'Dimas Maulana',
      publisher: 'Dimas Maulana',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: noteUrl,
      },
      openGraph: {
        type: 'article',
        url: noteUrl,
        title: `${note.title} | Dimas Maulana`,
        description,
        siteName: 'Dimas Maulana',
        publishedTime: note.created_time,
        modifiedTime: note.last_edited_time,
        authors: [note.properties?.author || 'Dimas Maulana'],
        tags: [...(note.categories || []), ...(note.tags || [])],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: note.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${note.title} | Dimas Maulana`,
        description,
        creator: '@dimasma__',
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      other: {
        'article:author': note.properties?.author || 'Dimas Maulana',
        'article:published_time': note.created_time,
        'article:modified_time': note.last_edited_time,
        'article:section': note.categories?.[0] || 'Technology',
        'article:tag': (note.categories || []).concat(note.tags || []).join(','),
      },
    }
  } catch (error) {
    console.error('Error generating note metadata:', error)
    return {
      title: 'Technical Note',
      description: 'A technical note on various topics including cybersecurity, programming, and system architecture.'
    }
  }
}

// Structured data for the /services page: the Source Code Security Review as a
// schema.org Service with an Offer (price), an FAQPage built from the same FAQ
// the page renders, and a Home > Services breadcrumb. URLs use the trailing
// slash form to match trailingSlash:true and the page canonical.
export function ServicesStructuredData() {
  const servicesUrl = `${baseUrl}/services/`

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${servicesUrl}#service`,
    serviceType: "Source code security review",
    name: "AI-automated Source Code Security Review",
    description:
      "An AI agent reviews your whole codebase for potential vulnerabilities; findings are triaged by hand for real exploitability, the program is run to confirm it works, and you receive suggested ready-to-merge fixes with a plain-English PDF and Markdown report.",
    url: servicesUrl,
    provider: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: "Dimas Maulana",
      url: `${baseUrl}/`,
    },
    areaServed: "Worldwide",
    offers: {
      "@type": "Offer",
      price: "99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: servicesUrl,
    },
  }

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${servicesUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: servicesUrl },
    ],
  }

  const combined = [
    serviceStructuredData,
    faqStructuredData,
    breadcrumbStructuredData,
  ]

  return (
    <>
      {combined.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
        />
      ))}
    </>
  )
}
