import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const screenshots = process.env.ROOM_SCREENSHOTS || "/tmp/portfolio-room-site";
await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: [
    "--no-sandbox",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--disable-dev-shm-usage",
  ],
});
const errors = [];
async function ready(page) {
  await page.waitForFunction(
    () => {
      const d = document.querySelector("#tour-scene")?.dataset;
      return (
        d?.state === "ready" &&
        d.cameraMotion === "idle" &&
        d.renderQuality === "detail"
      );
    },
    null,
    { timeout: 45000 },
  );
}
async function go(page, id) {
  const headerLink = page.locator(`.tour-nav a[href="#${id}"]`);
  const link = (await headerLink.isVisible())
    ? headerLink
    : page.locator(`.tour-room-index a[href="#${id}"]`);
  await link.evaluate((el) => el.focus({ preventScroll: true }));
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    (id) => document.querySelector(".tour-page").dataset.chapter === id,
    id,
  );
  await page.waitForTimeout(900);
}
async function navigation(page) {
  assert.equal(
    await page
      .getByRole("link", { name: "dimasc.tf — home", exact: true })
      .count(),
    1,
  );
  const links = page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .locator("a");
  assert.deepEqual(await links.allTextContents(), [
    "Blog",
    "Notes",
    "Tools",
    "Services",
  ]);
  assert.ok(
    await links.evaluateAll((items) =>
      items.every((item) => {
        const r = item.getBoundingClientRect();
        return (
          r.x >= 0 &&
          r.right <= innerWidth &&
          r.y >= 0 &&
          r.height >= 44 &&
          r.bottom <= innerHeight
        );
      }),
    ),
    "All four main links must be visible and touch-sized without opening a menu",
  );
}
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const failedAssets = [];
  page.on("response", (response) => {
    if (response.url().startsWith(`${base}/room/`) && response.status() >= 400)
      failedAssets.push(response.url());
  });
  await page.goto(`${base}/?room=3d`, { waitUntil: "networkidle" });
  await ready(page);
  await navigation(page);
  assert.equal(await page.locator("main").count(), 1);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator("canvas").count(), 1);
  assert.equal(
    await page.locator("#tour-scene").getAttribute("data-vr-headset"),
    "meta-quest-3",
  );
  assert.equal(
    await page.locator("#tour-scene").getAttribute("data-award-count"),
    "21",
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({ path: `${screenshots}/desktop-welcome.png` });
  for (const id of ["work", "writing", "about", "achievements", "services"]) {
    await go(page, id);
    await ready(page);
    await page.screenshot({ path: `${screenshots}/desktop-${id}.png` });
  }
  await go(page, "writing");
  await page.locator("#tour-library-query").fill("patchstack");
  assert.ok(await page.locator("#tour-library").evaluate((el) => el.open));
  assert.ok(
    (await page.locator("#tour-library [data-library-item]:visible").count()) >
      0,
  );
  await page.locator("#tour-library-query").fill("");
  await go(page, "work");
  await page.locator("[data-portfolio-project] summary").first().click();
  assert.ok(
    await page
      .locator("[data-portfolio-project]")
      .first()
      .evaluate((el) => el.open),
  );
  await ready(page);
  const count = await page
    .locator("#tour-scene")
    .getAttribute("data-render-count");
  await page.waitForTimeout(700);
  assert.equal(
    await page.locator("#tour-scene").getAttribute("data-render-count"),
    count,
  );

  if (process.env.AXE_MODULE) {
    await page.addScriptTag({
      content: await readFile(process.env.AXE_MODULE, "utf8"),
    });
    const violations = await page.evaluate(async () =>
      (
        await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        })
      ).violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          why: n.failureSummary,
        })),
      })),
    );
    assert.deepEqual(violations, [], JSON.stringify(violations, null, 2));
  }
  // Navigate through Next's client router and back: no orphaned room canvas,
  // listeners, document styles, or duplicated controller on re-entry.
  await page.evaluate(() => {
    window.roomNavigationMarker = "same-document";
  });
  await page.locator('.tour-site-nav a[href="/blog/"]').click();
  await page.waitForURL("**/blog/");
  assert.equal(
    await page.evaluate(() => window.roomNavigationMarker),
    "same-document",
  );
  await navigation(page);
  assert.equal(
    await page.locator('.site-primary-nav a[aria-current="page"]').innerText(),
    "Blog",
  );
  await page.screenshot({ path: `${screenshots}/desktop-blog.png` });
  assert.equal(await page.locator("canvas").count(), 0);
  assert.equal(
    await page.evaluate(() =>
      document.documentElement.classList.contains("tour-document"),
    ),
    false,
  );
  await page.goBack();
  await page.waitForSelector(".tour-page[data-enhanced=true]");
  await ready(page);
  assert.equal(await page.locator("canvas").count(), 1);
  assert.deepEqual(failedAssets, []);
  console.log(
    "PASS desktop: complete content, gaming/Quest scene, search, keyboard navigation, disclosure, idle rendering, client-route cleanup, no missing assets",
  );
  await page.close();

  for (const width of [390, 320, 844]) {
    const mobile = await browser.newPage({
      viewport: { width, height: width === 844 ? 390 : 844 },
      isMobile: true,
      hasTouch: true,
    });
    mobile.on("pageerror", (error) => errors.push(error.message));
    await mobile.goto(`${base}/?room=3d`, { waitUntil: "networkidle" });
    await ready(mobile);
    await navigation(mobile);
    assert.ok(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await mobile.screenshot({ path: `${screenshots}/mobile-${width}.png` });
    await go(mobile, "services");
    await mobile.waitForFunction(
      () => document.querySelector(".tour-page").dataset.roomMode === "reading",
    );
    assert.equal(
      await mobile.locator("#tour-scene").getAttribute("data-render-paused"),
      "true",
    );
    await mobile.screenshot({
      path: `${screenshots}/mobile-${width}-services.png`,
    });
    // Use an actual touch at the visible sticky bar. Locator.click() first
    // scrolls transformed sticky controls into view and changes the chapter.
    const readingY = await mobile.evaluate(() => scrollY);
    const toggle = mobile.locator("[data-tour-room-toggle]");
    const bounds = await toggle.boundingBox();
    await mobile.touchscreen.tap(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    await mobile.waitForFunction(
      () => document.querySelector(".tour-page").dataset.roomMode === "open",
    );
    assert.equal(await mobile.evaluate(() => scrollY), readingY);
    await toggle.evaluate((el) => el.focus({ preventScroll: true }));
    await mobile.keyboard.press("Enter");
    await mobile.waitForFunction(
      () => document.querySelector(".tour-page").dataset.roomMode === "reading",
    );
    assert.equal(await mobile.evaluate(() => scrollY), readingY);
    console.log(
      `PASS ${width}px: no horizontal overflow, readable content, collapsed renderer, explicit room toggle`,
    );
    await mobile.close();
  }
  for (const mode of ["reduced", "no-webgl", "no-js"]) {
    const fallback = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
      javaScriptEnabled: mode !== "no-js",
    });
    fallback.on("pageerror", (error) => errors.push(error.message));
    if (mode === "no-webgl")
      await fallback.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
          return /webgl/.test(kind) ? null : original.call(this, kind, ...args);
        };
      });
    await fallback.goto(base, { waitUntil: "networkidle" });
    if (mode !== "no-js")
      await fallback.waitForSelector('.tour-page[data-render-mode="stills"]');
    assert.equal(await fallback.locator("canvas").count(), 0);
    assert.equal(await fallback.locator("[data-portfolio-project]").count(), 9);
    assert.ok(
      await fallback
        .locator("#tour-scene img")
        .first()
        .evaluate((img) => img.complete && img.naturalWidth === 2048),
    );
    await fallback.locator('a[href="#work"]').first().click();
    await fallback.locator("[data-portfolio-project] summary").first().click();
    assert.ok(
      await fallback
        .locator("[data-portfolio-project]")
        .first()
        .evaluate((el) => el.open),
    );
    await fallback.screenshot({ path: `${screenshots}/${mode}.png` });
    if (mode === "no-js") {
      await fallback.locator('.tour-nav a[href="#about"]').click();
      const photos = await fallback
        .locator("[data-portfolio-photo]")
        .evaluateAll((elements) =>
          elements.map((el) => {
            const bounds = el.getBoundingClientRect();
            return {
              top: bounds.top,
              bottom: bounds.bottom,
              visible: getComputedStyle(el).visibility,
            };
          }),
        );
      assert.equal(photos.length, 7);
      for (const [index, photo] of photos.entries()) {
        assert.equal(photo.visible, "visible");
        if (index)
          assert.ok(
            photo.top >= photos[index - 1].bottom,
            "No-JS album photos must not overlap",
          );
      }
      await fallback.screenshot({ path: `${screenshots}/no-js-photos.png` });
    }
    console.log(
      `PASS ${mode}: static room, complete content, working native links/disclosures`,
    );
    await fallback.close();
  }
  const legacy = await browser.newPage({ reducedMotion: "reduce" });
  legacy.on("pageerror", (error) => errors.push(error.message));
  await legacy.goto(`${base}/#projects`, { waitUntil: "networkidle" });
  await legacy.waitForFunction(
    () => document.querySelector(".tour-page").dataset.chapter === "work",
  );
  assert.ok(
    await legacy
      .locator("#work")
      .evaluate((el) => el.getBoundingClientRect().top < 200),
  );
  await legacy.goto(`${base}/#%E0%A4%A`, { waitUntil: "networkidle" });
  await legacy.waitForSelector('.tour-page[data-enhanced="true"]');
  await legacy.close();
  for (const route of [
    "/blog/",
    "/notes/",
    "/tools/ctf-calculator/",
    "/services/",
    "/sample-report/source-code-pentest-sample-report.pdf",
  ]) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, route);
  }
  assert.deepEqual(errors, []);
  console.log("PASS old anchors, preserved pages/downloads, zero page errors");
} finally {
  await browser.close();
}
