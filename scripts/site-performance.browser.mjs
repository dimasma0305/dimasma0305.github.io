import { writeFile } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const results = [];
try {
  for (const profile of [
    { name: "home-desktop", route: "/", width: 1440 },
    { name: "home-mobile", route: "/", width: 390 },
    { name: "home-still", route: "/", width: 1440, reducedMotion: "reduce" },
    { name: "blog-desktop", route: "/blog/", width: 1440 },
    { name: "notes-mobile", route: "/notes/", width: 390 },
  ]) {
    const page = await browser.newPage({
      viewport: { width: profile.width, height: 900 },
      deviceScaleFactor: profile.width < 700 ? 2 : 1,
      reducedMotion: profile.reducedMotion || "no-preference",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() => {
      window.siteMetrics = { lcp: 0, cls: 0, longTasks: 0, blockingMs: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          window.siteMetrics.lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.siteMetrics.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.siteMetrics.longTasks++;
          window.siteMetrics.blockingMs += Math.max(0, entry.duration - 50);
        }
      }).observe({ type: "longtask", buffered: true });
    });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await page.goto(new URL(profile.route, base).href, { waitUntil: "load" });
    await page.waitForTimeout(10000);
    const result = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource").map((e) => ({
        url: new URL(e.name).pathname,
        type: e.initiatorType,
        bytes: e.decodedBodySize,
        transfer: e.transferSize,
      }));
      return {
        ...window.siteMetrics,
        requests: resources.length,
        bytes: resources.reduce((sum, r) => sum + r.bytes, 0),
        resources: resources.sort((a, b) => b.bytes - a.bytes),
        renderMode: document.querySelector(".tour-page")?.dataset.renderMode,
      };
    });
    results.push({ name: profile.name, ...result, errors });
    console.log(
      JSON.stringify(
        {
          name: profile.name,
          ...result,
          resources: result.resources.slice(0, 12),
          errors,
        },
        null,
        2,
      ),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
if (process.env.PERF_REPORT)
  await writeFile(process.env.PERF_REPORT, JSON.stringify(results, null, 2));
