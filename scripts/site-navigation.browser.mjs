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
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];
try {
  for (const width of [1440, 700, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      window.brandRouteMarker = true;
    });
    for (const [label, path] of [
      ["Blog", "blog"],
      ["Notes", "notes"],
      ["Tools", "tools"],
      ["Services", "services"],
    ]) {
      const nav = page.getByRole("navigation", {
        name: "Main navigation",
        exact: true,
      });
      const link = nav.getByRole("link", { name: label, exact: true });
      await link.focus();
      await page.keyboard.press("Enter");
      await page.waitForURL(`**/${path}/`);
      await page.waitForLoadState("networkidle");
      assert.equal(
        await page.evaluate(() => window.brandRouteMarker),
        true,
        "Use client navigation, not a document reload",
      );
      assert.equal(await page.locator("main").count(), 1);
      assert.equal(
        await page.locator(".site-primary-nav [aria-current=page]").innerText(),
        label,
      );
      assert.deepEqual(await nav.locator("a").allTextContents(), [
        "Blog",
        "Notes",
        "Tools",
        "Services",
      ]);
      assert.ok(
        await nav.locator("a").evaluateAll((links) =>
          links.every((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.left >= 0 &&
              r.right <= innerWidth &&
              r.top >= 0 &&
              r.bottom <= innerHeight &&
              r.height >= 44
            );
          }),
        ),
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px ${path}: horizontal overflow`,
      );
      assert.ok(
        await page.locator("main").evaluate((el) => {
          const header = document
            .querySelector(".site-global-header")
            .getBoundingClientRect();
          return (
            el.getBoundingClientRect().top +
              parseFloat(getComputedStyle(el).paddingTop) >=
            header.bottom
          );
        }),
        "Header must not cover content",
      );
      if (path === "blog")
        await page.screenshot({
          path: `${screenshots}/brand-blog-${width}.png`,
        });
    }
    if (process.env.AXE_MODULE) {
      await page.addScriptTag({
        content: await readFile(process.env.AXE_MODULE, "utf8"),
      });
      const violations = await page.evaluate(
        async () =>
          (
            await axe.run(".site-global-header", {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            })
          ).violations,
      );
      assert.deepEqual(violations, [], `Header accessibility at ${width}px`);
    }
    await page
      .getByRole("link", { name: "dimasc.tf — home", exact: true })
      .click();
    await page.waitForSelector('.tour-page[data-enhanced="true"]');
    assert.match(await page.title(), /dimasc\.tf/);
    assert.equal(await page.locator("canvas").count(), 0);
    console.log(
      `PASS ${width}px: all four navbar routes, active states, keyboard navigation, brand home link, readable content clearance`,
    );
    await page.close();
  }
  const plain = await browser.newPage({
    viewport: { width: 320, height: 844 },
    javaScriptEnabled: false,
  });
  plain.on("pageerror", (error) => errors.push(error.message));
  await plain.goto(base, { waitUntil: "networkidle" });
  await plain
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Blog", exact: true })
    .click();
  await plain.waitForURL("**/blog/");
  assert.equal(await plain.locator(".site-primary-nav a:visible").count(), 4);
  assert.equal(
    await plain
      .getByRole("link", { name: "dimasc.tf — home", exact: true })
      .count(),
    1,
  );
  await plain.screenshot({ path: `${screenshots}/brand-blog-no-js.png` });
  await plain.close();
  assert.deepEqual(errors, []);
  console.log("PASS no-JavaScript mobile navigation and zero browser errors");
} finally {
  await browser.close();
}
