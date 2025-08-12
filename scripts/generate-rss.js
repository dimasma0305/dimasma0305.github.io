const fs = require('fs')
const path = require('path')

// Site configuration
const siteConfig = {
  name: "Dimas Maulana's Blog",
  description: "Personal blog about technology, programming, and insights",
  url: "https://dimasma0305.github.io",
  author: {
    name: "Dimas Maulana",
    email: "dimasmaulana0305@gmail.com"
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

function generateRssFeed() {
  try {
    const currentDate = new Date().toUTCString()
    const baseUrl = siteConfig.url
    const allItems = []

    // Static pages with descriptions
    const staticPages = [
      {
        title: 'Home - Dimas Maulana\'s Blog',
        url: baseUrl,
        description: 'Welcome to my personal blog about technology, programming, cybersecurity, and CTF writeups.',
        pubDate: currentDate,
        category: 'Static Page'
      },
      {
        title: 'Blog - All Posts',
        url: `${baseUrl}/blog`,
        description: 'Browse all blog posts about cybersecurity, CTF writeups, web development, and programming.',
        pubDate: currentDate,
        category: 'Static Page'
      },

      {
        title: 'Categories - Browse by Topic',
        url: `${baseUrl}/categories`,
        description: 'Browse blog posts organized by categories like CTF, Web Security, Programming, and more.',
        pubDate: currentDate,
        category: 'Static Page'
      },
      {
        title: 'Search - Find Content',
        url: `${baseUrl}/search`,
        description: 'Search through all blog posts and content on the site.',
        pubDate: currentDate,
        category: 'Static Page'
      },
      {
        title: 'Tools - Utilities',
        url: `${baseUrl}/tools`,
        description: 'Useful tools and utilities for developers and security researchers.',
        pubDate: currentDate,
        category: 'Tools'
      },
      {
        title: 'CTF Calculator - Points Calculator',
        url: `${baseUrl}/tools/ctf-calculator`,
        description: 'Calculate CTF points and scores for cybersecurity competitions.',
        pubDate: currentDate,
        category: 'Tools'
      }
    ]

    // Add static pages to items
    staticPages.forEach(page => {
      allItems.push({
        title: page.title,
        url: page.url,
        description: page.description,
        pubDate: page.pubDate,
        categories: [page.category]
      })
    })

    // Read the blog index for dynamic content
    const indexPath = path.join(process.cwd(), 'public', 'blog-index.json')
    
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      const blogIndex = JSON.parse(indexContent)
      
      // Get published posts and sort by date (newest first)
      const publishedPosts = (blogIndex.posts?.published || [])
        .filter(post => post.properties?.published)
        .sort((a, b) => new Date(b.last_edited_time || b.created_time) - new Date(a.last_edited_time || a.created_time))

      // Add blog posts to items
      publishedPosts.forEach(post => {
        allItems.push({
          title: post.title,
          url: `${baseUrl}/posts/${post.slug}`,
          description: post.excerpt || '',
          pubDate: new Date(post.last_edited_time || post.created_time).toUTCString(),
          categories: post.categories || []
        })
      })

      // Get categories and add category pages
      const taxonomyCategories = blogIndex.taxonomy?.categories || []
      taxonomyCategories.forEach(category => {
        allItems.push({
          title: `${category.name} - Category`,
          url: `${baseUrl}/categories/${encodeURIComponent(category.name.toLowerCase())}`,
          description: `Browse all posts in the ${category.name} category (${category.count} posts).`,
          pubDate: currentDate,
          categories: ['Category Page', category.name]
        })
      })
    }

    // Sort all items by publication date (newest first)
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
    
    console.log(`✅ RSS feed generated successfully with ${allItems.length} items`)
    console.log(`📊 Breakdown:`)
    console.log(`   - Static pages: ${staticPages.length}`)
    
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      const blogIndex = JSON.parse(indexContent)
      const publishedPosts = (blogIndex.posts?.published || []).filter(post => post.properties?.published)
      const categories = blogIndex.taxonomy?.categories || []
      
      console.log(`   - Blog posts: ${publishedPosts.length}`)
      console.log(`   - Category pages: ${categories.length}`)
    }
    
    console.log(`📄 RSS file saved to: ${rssPath}`)
    
  } catch (error) {
    console.error('❌ Error generating RSS feed:', error)
  }
}

// Run the generator
generateRssFeed()