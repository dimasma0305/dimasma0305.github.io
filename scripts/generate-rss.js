const fs = require("fs");
const path = require("path");

// Site configuration. NOTE: this script runs inside `refresh-content`, BEFORE the
// build step sets NEXT_PUBLIC_BASE_URL, so the canonical domain must be the
// default here (env is honored if present). Pointing the feed at github.io sent
// all syndication/link equity to the redirect host.
const siteConfig = {
  name: "dimasc.tf — Blog & Notes",
  description:
    "Security research, CTF writeups, and technical notes by Dimas Maulana.",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://dimasc.tf",
  author: {
    name: "Dimas Maulana",
    // Domain address rather than a personal inbox (avoids publishing a personal
    // email in a public feed). Change if you prefer a real contact address.
    email: "noreply@dimasc.tf",
  },
};

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}

// Read one content index (blog-index.json / notes-index.json shape) and turn
// its published entries into RSS items. `urlPrefix` is the served route base
// ("/posts" for the blog, "/notes" for notes). Missing/unreadable index files
// are skipped gracefully so the feed still builds from whatever exists.
function collectItemsFromIndex(indexPath, urlPrefix, baseUrl) {
  if (!fs.existsSync(indexPath)) {
    return [];
  }

  let index;
  try {
    index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  } catch (error) {
    console.warn(
      `⚠️  Skipping ${indexPath} (could not parse): ${error.message}`,
    );
    return [];
  }

  const published = (index.posts?.published ?? index.posts?.all ?? []).filter(
    (entry) =>
      entry.slug &&
      entry.title &&
      entry.properties?.published &&
      !entry.archived,
  );

  return published.map((entry) => ({
    title: entry.title,
    url: `${baseUrl}${urlPrefix}/${entry.slug}/`,
    description: entry.excerpt || "",
    pubDate: Number.isFinite(Date.parse(entry.created_time))
      ? new Date(entry.created_time).toUTCString()
      : undefined,
    categories: entry.categories || [],
  }));
}

function generateRssFeed() {
  try {
    const root = siteConfig.url.replace(/\/+$/, "");
    const prefix = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(
      /^\/+|\/+$/g,
      "",
    );
    const baseUrl =
      prefix && !root.endsWith(`/${prefix}`) ? `${root}/${prefix}` : root;
    let allItems = [];

    // A feed should contain real content only. Nav/utility pages (Home, Blog
    // index, Categories, Search, Tools) as feed items get the feed
    // deprioritized by aggregators, so they are intentionally excluded.

    // Blog posts (served at /posts/<slug>/).
    allItems = allItems.concat(
      collectItemsFromIndex(
        path.join(process.cwd(), "public", "blog-index.json"),
        "/posts",
        baseUrl,
      ),
    );

    // Notes (served at /notes/<slug>/). Same index shape; skipped gracefully if
    // notes-index.json doesn't exist (e.g. a blog-only build).
    allItems = allItems.concat(
      collectItemsFromIndex(
        path.join(process.cwd(), "public", "notes-index.json"),
        "/notes",
        baseUrl,
      ),
    );

    // Sort all items (blog + notes merged) by publication date (newest first)
    allItems = [...new Map(allItems.map((item) => [item.url, item])).values()];
    allItems.sort(
      (a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0),
    );

    // Generate RSS XML
    let rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${escapeXml(baseUrl)}/</link>
    <atom:link href="${escapeXml(baseUrl)}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
    <managingEditor>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</managingEditor>
    <webMaster>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</webMaster>
    <generator>Custom RSS Generator</generator>
`;

    // Add items to RSS
    allItems.forEach((item) => {
      rssXml += `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <description>${escapeXml(item.description)}</description>
      ${item.pubDate ? `<pubDate>${item.pubDate}</pubDate>` : ""}
      <author>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</author>
`;

      // Add categories
      item.categories.forEach((category) => {
        rssXml += `      <category>${escapeXml(category)}</category>
`;
      });

      rssXml += `    </item>
`;
    });

    rssXml += `  </channel>
</rss>`;

    // Write RSS file to public directory
    const rssPath = path.join(process.cwd(), "public", "rss.xml");
    fs.writeFileSync(rssPath, rssXml, "utf8");

    console.log(
      `✅ RSS feed generated successfully with ${allItems.length} items (blog + notes)`,
    );
    console.log(`📄 RSS file saved to: ${rssPath}`);
  } catch (error) {
    console.error("❌ Error generating RSS feed:", error);
  }
}

// Run the generator
generateRssFeed();
