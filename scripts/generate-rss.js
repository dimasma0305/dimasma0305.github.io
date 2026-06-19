const fs = require('fs')
const path = require('path')

// Site configuration. NOTE: this script runs inside `refresh-content`, BEFORE the
// build step sets NEXT_PUBLIC_BASE_URL, so the canonical domain must be the
// default here (env is honored if present). Pointing the feed at github.io sent
// all syndication/link equity to the redirect host.
const siteConfig = {
  name: "Dimas Maulana's Blog",
  description: "Cybersecurity research, CTF writeups, and security tutorials by Dimas Maulana.",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://dimasc.tf",
  author: {
    name: "Dimas Maulana",
    // Domain address rather than a personal inbox (avoids publishing a personal
    // email in a public feed). Change if you prefer a real contact address.
    email: "noreply@dimasc.tf"
  }
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Read one content index (blog-index.json / notes-index.json shape) and turn
// its published entries into RSS items. `urlPrefix` is the served route base
// ("/posts" for the blog, "/notes" for notes). Missing/unreadable index files
// are skipped gracefully so the feed still builds from whatever exists.
function collectItemsFromIndex(indexPath, urlPrefix, baseUrl) {
  if (!fs.existsSync(indexPath)) {
    return []
  }

  let index
  try {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  } catch (error) {
    console.warn(`⚠️  Skipping ${indexPath} (could not parse): ${error.message}`)
    return []
  }

  const published = (index.posts?.published || [])
    .filter(entry => entry.properties?.published)

  return published.map(entry => ({
    title: entry.title,
    url: `${baseUrl}${urlPrefix}/${entry.slug}/`,
    description: entry.excerpt || '',
    pubDate: new Date(entry.last_edited_time || entry.created_time).toUTCString(),
    categories: entry.categories || []
  }))
}

function generateRssFeed() {
  try {
    const currentDate = new Date().toUTCString()
    const baseUrl = siteConfig.url
    let allItems = []

    // A feed should contain real content only. Nav/utility pages (Home, Blog
    // index, Categories, Search, Tools) as feed items get the feed
    // deprioritized by aggregators, so they are intentionally excluded.

    // Blog posts (served at /posts/<slug>/).
    allItems = allItems.concat(
      collectItemsFromIndex(
        path.join(process.cwd(), 'public', 'blog-index.json'),
        '/posts',
        baseUrl
      )
    )

    // Notes (served at /notes/<slug>/). Same index shape; skipped gracefully if
    // notes-index.json doesn't exist (e.g. a blog-only build).
    allItems = allItems.concat(
      collectItemsFromIndex(
        path.join(process.cwd(), 'public', 'notes-index.json'),
        '/notes',
        baseUrl
      )
    )

    // Sort all items (blog + notes merged) by publication date (newest first)
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

    // Generate RSS XML
    let rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
    <managingEditor>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</managingEditor>
    <webMaster>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</webMaster>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <generator>Custom RSS Generator</generator>
`

    // Add items to RSS
    allItems.forEach(item => {
      rssXml += `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <author>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</author>
`
      
      // Add categories
      item.categories.forEach(category => {
        rssXml += `      <category>${escapeXml(category)}</category>
`
      })
      
      rssXml += `    </item>
`
    })

    rssXml += `  </channel>
</rss>`

    // Write RSS file to public directory
    const rssPath = path.join(process.cwd(), 'public', 'rss.xml')
    fs.writeFileSync(rssPath, rssXml, 'utf8')
    
    console.log(`✅ RSS feed generated successfully with ${allItems.length} items (blog + notes)`)
    console.log(`📄 RSS file saved to: ${rssPath}`)
    
  } catch (error) {
    console.error('❌ Error generating RSS feed:', error)
  }
}

// Run the generator
generateRssFeed()