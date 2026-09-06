import assert from "node:assert/strict";
import sharp from "sharp";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];
try {
  // Read precisely what a link-preview crawler gets: server HTML, no JavaScript.
  const crawler = await browser.newPage({
    javaScriptEnabled: false,
    userAgent: "Discordbot/2.0",
  });
  for (const route of [
    "/",
    "/blog/",
    "/notes/",
    "/tools/",
    "/services/",
    "/tools/ctf-calculator/",
    "/tags/",
  ]) {
    const response = await crawler.goto(new URL(route, base).href, {
      waitUntil: "domcontentloaded",
    });
    assert.equal(response.status(), 200);
    const meta = (name) =>
      crawler
        .locator(`meta[property="${name}"],meta[name="${name}"]`)
        .first()
        .getAttribute("content");
    assert.match(
      await meta("og:image"),
      /^https:\/\/[^/]+(?:\/[^/]+)*\/social\/room-v1\.jpg$/,
    );
    assert.equal(await meta("og:image:width"), "1200");
    assert.equal(await meta("og:image:height"), "630");
    assert.equal(await meta("twitter:card"), "summary_large_image");
    assert.equal(await meta("twitter:image"), await meta("og:image"));
    assert.ok((await meta("og:description")).length > 30);
    if (route === "/") {
      assert.match(await meta("og:description"), /digital room/);
      assert.match(await meta("og:image:alt"), /DM monogram/);
    }
  }
  const imageResponse = await crawler.request.get(`${base}/social/room-v1.jpg`);
  assert.equal(imageResponse.status(), 200);
  assert.match(imageResponse.headers()["content-type"], /image\/jpeg/);
  const dimensions = await sharp(await imageResponse.body()).metadata();
  assert.equal(dimensions.width, 1200);
  assert.equal(dimensions.height, 630);
  await crawler.close();
  console.log(
    "PASS crawler-visible room metadata on seven routes and real 1200 × 630 JPEG",
  );

  const page = await browser.newPage({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const requests = [];
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  assert.equal(
    requests.filter((url) => /\/(?:blog|notes)-index\.json$/.test(url)).length,
    0,
    "home must not download unused listing indexes",
  );
  assert.ok(
    await page
      .locator(".tour-still-image")
      .first()
      .evaluate(
        (img) =>
          img.complete &&
          img.naturalWidth === 2048 &&
          img.currentSrc.endsWith(".webp"),
      ),
  );
  const blog = page.locator('a[href="/blog/"]').first();
  await blog.focus();
  await page.waitForTimeout(500);
  assert.equal(
    requests.filter((url) => url.endsWith("/blog-index.json")).length,
    0,
  );
  await blog.click();
  await page.locator(".post-card").first().waitFor();
  await page.waitForTimeout(2000);
  assert.equal(
    requests.filter((url) => url.endsWith("/blog-index.json")).length,
    0,
    "statically rendered archive does not refetch listing metadata",
  );
  assert.equal(
    requests.filter((url) => url.endsWith("/post.json")).length,
    0,
    "visible cards must not download raw articles",
  );
  assert.equal(
    requests.filter((url) => url.endsWith("/notes-index.json")).length,
    0,
  );
  const cover = page.locator(".post-cover img").first();
  const coverSource = await cover.getAttribute("src");
  assert.ok(
    await cover.evaluate(
      (img) =>
        img.complete &&
        img.naturalWidth > 0 &&
        img.currentSrc.endsWith(".webp"),
    ),
  );
  await page.evaluate(() => {
    window.__loadingTest = "same document";
  });
  const article = page.locator('.post-card a[href*="/posts/"]').first();
  const destination = await article.getAttribute("href");
  await article.hover();
  await page.waitForTimeout(500);
  await article.click();
  await page.waitForURL(
    (url) => url.pathname.replace(/\/$/, "") === destination.replace(/\/$/, ""),
  );
  await page.locator("main h1").first().waitFor();
  assert.equal(
    await page.evaluate(() => window.__loadingTest),
    "same document",
    "article navigation stays client-side",
  );
  console.log(
    "PASS idle downloads, focus/hover warming, full-resolution images and client navigation",
  );
  await page.close();

  const saver = await browser.newPage({ reducedMotion: "reduce" });
  await saver.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true, effectiveType: "4g" },
    }),
  );
  const saverRequests = [];
  saver.on("request", (request) => saverRequests.push(request.url()));
  await saver.goto(`${base}/`, { waitUntil: "networkidle" });
  await saver.locator('a[href="/notes/"]').first().focus();
  await saver.waitForTimeout(1000);
  assert.equal(
    saverRequests.filter((url) => url.endsWith("/notes-index.json")).length,
    0,
  );
  await saver.locator('a[href="/notes/"]').first().click();
  await saver.locator(".note-card").first().waitFor();
  assert.equal(
    saverRequests.filter((url) => url.endsWith("/notes-index.json")).length,
    1,
    "data saving must not block actual navigation",
  );
  await saver.close();
  console.log(
    "PASS data-saving users skip speculation and still navigate normally",
  );

  // A temporarily missing generated cover falls back to the original, not a loop.
  const fallback = await browser.newPage({ reducedMotion: "reduce" });
  await fallback.route(new URL(coverSource, base).href, (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await fallback.goto(`${base}/blog/`, { waitUntil: "networkidle" });
  await fallback.locator(".post-cover img").first().waitFor();
  await fallback.waitForFunction((initialSource) => {
    const img = document.querySelector(".post-cover img");
    return (
      img?.complete &&
      img.naturalWidth > 0 &&
      new URL(img.currentSrc).pathname !==
        new URL(initialSource, location.origin).pathname
    );
  }, coverSource);
  await fallback.close();
  console.log("PASS unavailable-cover fallback");
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
