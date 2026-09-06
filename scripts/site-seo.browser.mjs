import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";

const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const root = path.resolve("out");
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];

try {
  // Parse the actual exported HTML without running application JavaScript or
  // fetching third-party assets. This is not a live Google indexing test.
  const reader = await browser.newPage({ javaScriptEnabled: false });
  await reader.route("**/*", (route) => route.abort());
  const sitemapXml = await readFile(path.join(root, "sitemap.xml"), "utf8");
  const entries = await reader.evaluate((xml) => {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    if (doc.querySelector("parsererror")) {
      throw new Error("Malformed sitemap");
    }
    return [...doc.querySelectorAll("url")].map((item) => ({
      url: item.querySelector("loc").textContent,
      date: item.querySelector("lastmod")?.textContent,
    }));
  }, sitemapXml);
  assert.ok(entries.length > 8);
  const production = new URL(entries[0].url);
  const prefix = production.pathname.replace(/\/$/, "");
  const fileFor = (pathname) => {
    const localPath = decodeURIComponent(pathname)
      .slice(prefix.length)
      .replace(/^\/+/, "");
    return path.join(
      root,
      localPath,
      pathname.endsWith("/") || !path.extname(localPath) ? "index.html" : "",
    );
  };
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  const titles = new Set();
  const links = new Set();
  const localImages = new Set();
  const articleTypes = new Set(["Article", "BlogPosting", "TechArticle"]);
  for (const entry of entries) {
    const url = new URL(entry.url);
    assert.equal(url.origin, production.origin);
    assert.ok(url.pathname.endsWith("/") && !url.search && !url.hash);
    assert.notEqual(url.pathname, `${prefix}/search/`);
    if (entry.date) {
      assert.ok(Number.isFinite(Date.parse(entry.date)));
    }
    if (!/\/(?:posts|notes)\/[^/]+\/$/.test(url.pathname)) {
      assert.equal(entry.date, undefined, "unknown content dates are omitted");
    }
    await reader.setContent(await readFile(fileFor(url.pathname), "utf8"), {
      waitUntil: "domcontentloaded",
    });
    const data = await reader.evaluate((canonical) => {
      const meta = (name) =>
        [
          ...document.querySelectorAll(
            `meta[name="${name}"],meta[property="${name}"]`,
          ),
        ].map((el) => el.content);
      return {
        title: document.title,
        descriptions: meta("description"),
        canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map(
          (el) => el.getAttribute("href"),
        ),
        ogUrl: meta("og:url"),
        ogImage: meta("og:image"),
        ogSite: meta("og:site_name"),
        twitterImage: meta("twitter:image"),
        robots: [...meta("robots"), ...meta("googlebot")],
        h1: document.querySelectorAll("main h1").length,
        feed: document
          .querySelector('link[type="application/rss+xml"]')
          ?.getAttribute("href"),
        structured: [
          ...document.querySelectorAll('script[type="application/ld+json"]'),
        ].flatMap((el) => JSON.parse(el.textContent)),
        links: [...document.querySelectorAll("a[href]")]
          .filter((el) => !el.closest(".reading-body"))
          .map((el) => {
            try {
              return new URL(el.getAttribute("href"), canonical).href;
            } catch {
              return null;
            }
          })
          .filter(Boolean),
        notes: document.querySelectorAll(".note-card").length,
      };
    }, entry.url);
    assert.equal(data.canonicals.length, 1, url.pathname);
    assert.equal(data.canonicals[0], entry.url, url.pathname);
    assert.deepEqual(data.ogUrl, [entry.url], url.pathname);
    assert.deepEqual(data.ogSite, ["dimasc.tf"], url.pathname);
    assert.equal(data.descriptions.length, 1);
    assert.ok(
      data.descriptions[0].length >= 30 && data.descriptions[0].length <= 160,
      `${url.pathname}: description length`,
    );
    assert.equal(data.h1, 1, `${url.pathname}: one static page heading`);
    assert.ok(
      data.title.includes("dimasc.tf") && !titles.has(data.title),
      `${url.pathname}: unique branded title`,
    );
    titles.add(data.title);
    assert.ok(
      data.robots.every((value) => !/noindex|nofollow/.test(value)),
      url.pathname,
    );
    assert.ok(
      data.feed?.endsWith("/rss.xml"),
      `${url.pathname}: feed discovery`,
    );
    assert.equal(data.ogImage.length, 1);
    assert.deepEqual(data.twitterImage, data.ogImage);
    for (const source of data.ogImage) {
      const image = new URL(source);
      assert.ok(["https:", "http:"].includes(image.protocol));
      if (image.origin === production.origin) {
        localImages.add(image.pathname);
      }
    }
    for (const item of data.structured) {
      if (articleTypes.has(item["@type"])) {
        assert.equal(item.url, entry.url);
        assert.equal(item.mainEntityOfPage["@id"], entry.url);
        assert.equal(item.author.name, "Dimas Maulana");
        assert.ok(item.author.url.endsWith("/"));
        assert.ok(
          item.headline && Number.isFinite(Date.parse(item.datePublished)),
        );
        assert.equal(item.wordCount, undefined);
      }
      if (item["@type"] === "BreadcrumbList") {
        assert.ok(item.itemListElement.length >= 2);
        assert.equal(item.itemListElement.at(-1).item, entry.url);
        item.itemListElement.forEach((crumb, index) => {
          assert.equal(crumb.position, index + 1);
          links.add(crumb.item);
        });
      }
      if (item["@type"] === "WebSite") {
        assert.equal(item.name, "dimasc.tf");
      }
    }
    if (url.pathname === `${prefix}/notes/`) {
      assert.ok(
        data.notes > 0,
        "Notes directory renders links without JavaScript",
      );
    }
    data.links.forEach((link) => links.add(link));
  }
  for (const source of localImages) {
    await access(fileFor(source));
  }
  for (const href of links) {
    const url = new URL(href);
    if (
      url.origin !== production.origin ||
      !url.pathname.startsWith(`${prefix}/`)
    ) {
      continue;
    }
    await access(fileFor(url.pathname)).catch(() => {
      throw new Error(`Broken managed internal link: ${url.pathname}`);
    });
  }
  const robots = await readFile(path.join(root, "robots.txt"), "utf8");
  assert.ok(
    robots.includes(`Sitemap: ${production.origin}${prefix}/sitemap.xml`),
  );
  assert.ok(!/Disallow:.*search/.test(robots));
  await reader.setContent(await readFile(fileFor(`${prefix}/search/`), "utf8"));
  for (const name of ["robots", "googlebot"]) {
    assert.match(
      await reader.locator(`meta[name="${name}"]`).getAttribute("content"),
      /noindex/,
    );
  }
  // Existing category aliases continue to resolve, but consolidate to lowercase.
  await reader.setContent(
    await readFile(fileFor(`${prefix}/categories/CTF/`), "utf8"),
  );
  assert.equal(
    await reader.locator('link[rel="canonical"]').getAttribute("href"),
    `${production.origin}${prefix}/categories/ctf/`,
  );
  const rss = await readFile(path.join(root, "rss.xml"), "utf8");
  assert.ok(!rss.includes("Invalid Date"));
  const feedLinks = await reader.evaluate((xml) => {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    if (doc.querySelector("parsererror")) {
      throw new Error("Malformed RSS");
    }
    return [...doc.querySelectorAll("item > link")].map((el) => el.textContent);
  }, rss);
  assert.equal(new Set(feedLinks).size, feedLinks.length);
  assert.ok(
    feedLinks.every((link) => entries.some((entry) => entry.url === link)),
  );
  await reader.close();
  console.log(
    `PASS ${entries.length} canonical pages: static metadata, sitemap dates, JSON-LD, internal links, local share images, RSS, category aliases and search noindex`,
  );

  // Confirm that pre-rendered directory content survives hydration and filters.
  const page = await browser.newPage({
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const requests = [];
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  await page.goto(`${base}/notes/`, { waitUntil: "networkidle" });
  assert.ok(await page.locator(".note-card").count());
  assert.ok(
    !requests.some((url) => url.endsWith("/notes-index.json")),
    "directory does not refetch its build snapshot",
  );
  await page.goto(`${base}/notes/?topic=Tutorial`, {
    waitUntil: "networkidle",
  });
  assert.match(
    await page.locator(".notes-result-count").innerText(),
    /in Tutorial/,
  );
  assert.ok(await page.locator(".note-card").count());
  await page.goto(`${base}/notes/?q=Programming`, { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("searchbox").inputValue(), "Programming");
  assert.ok(await page.locator(".note-card").count());
  await page.getByRole("searchbox").fill("no-matching-note-seo-check-835");
  await page.waitForURL(
    (url) => url.searchParams.get("q") === "no-matching-note-seo-check-835",
  );
  assert.equal(
    new URL(page.url()).searchParams.get("q"),
    "no-matching-note-seo-check-835",
  );
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.waitForURL((url) => url.search === "");
  assert.equal(new URL(page.url()).search, "");
  assert.ok(await page.locator(".note-card").count());
  const notes = page.locator('a[href="/notes/"]').first();
  const categories = `${base}/categories/ctf/`;
  await page.goto(categories, { waitUntil: "networkidle" });
  await notes.focus();
  await page.waitForTimeout(300);
  assert.ok(
    !requests.some((url) => url.endsWith("/notes-index.json")),
    "Notes intent does not prefetch redundant JSON",
  );
  assert.ok(await page.locator(".post-card").count());
  assert.ok(
    !requests.some((url) => url.endsWith("/blog-index.json")),
    "category page does not fetch a listing index",
  );
  assert.deepEqual(errors, []);
  await page.close();
  console.log(
    "PASS pre-rendered directory hydration, note-only topic/tag destinations and zero runtime errors",
  );
} finally {
  await browser.close();
}
