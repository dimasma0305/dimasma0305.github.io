import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const route = "/posts/patchstack-ctf-2025-end-of-the-year-alliance-captu/";
const output = process.env.ROOM_SCREENSHOTS || "/tmp/dimasc-article";
await mkdir(output, { recursive: true });
const axe = process.env.AXE_MODULE
  ? await readFile(process.env.AXE_MODULE, "utf8")
  : null;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];
async function audit(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "no page-level horizontal overflow",
  );
  if (!axe) return;
  await page.evaluate(axe);
  const violations = await page.evaluate(async () =>
    (
      await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })
    ).violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  );
  assert.deepEqual(violations, []);
}
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await page.locator(".article-code-toolbar").first().waitFor();
    assert.equal(
      await page.locator("main h1").count(),
      1,
      "one page heading, sections nested beneath it",
    );
    assert.equal(await page.locator("[data-article-chapter]").count(), 8);
    assert.equal(
      await page.locator("#article-body pre").count(),
      33,
      "all original code blocks remain available",
    );
    const outline = page.locator(
      width >= 1024 ? ".article-outline-desktop" : ".article-outline-mobile",
    );
    if (width < 1024) await outline.locator(":scope > summary").click();
    assert.equal(
      await outline.locator(".article-outline-list > li").count(),
      8,
      "all eight primary sections fit into the outline",
    );
    await audit(page);
    if (width < 1024) await outline.locator(":scope > summary").click();
    await page.screenshot({ path: `${output}/intro-${width}.png` });

    if (width < 1024) await outline.locator(":scope > summary").click();
    // The ordinal is decorative, so the accessible name contains only the title.
    const chapterLink = outline.getByRole("link", {
      name: "Super Malware Scanner",
      exact: true,
    });
    await chapterLink.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(900);
    const landing = await page
      .locator('[id="4-super-malware-scanner"]')
      .evaluate((el) => ({
        top: el.getBoundingClientRect().top,
        header: document
          .querySelector(".site-global-header")
          .getBoundingClientRect().bottom,
        focus: el === document.activeElement,
      }));
    assert.ok(landing.focus, "section navigation transfers keyboard focus");
    assert.ok(
      landing.top >= landing.header + (width < 1024 ? 60 : 0) &&
        landing.top < landing.header + 130,
      JSON.stringify(landing),
    );
    assert.equal(new URL(page.url()).hash, "#4-super-malware-scanner");
    if (width < 1024)
      assert.equal(
        await outline.getAttribute("open"),
        null,
        "mobile outline closes after navigation",
      );
    const beforeScroll = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(600);
    assert.ok(
      await page.evaluate((before) => scrollY > before + 200, beforeScroll),
      "normal wheel scrolling remains under user control",
    );

    const block = page.locator(".article-code-block").first();
    const code = block.locator("pre code");
    await block.scrollIntoViewIfNeeded();
    assert.equal(
      await block
        .locator("pre")
        .evaluate((el) => getComputedStyle(el).marginTop),
      "0px",
      "legacy code spacing must not create a second frame inside the toolbar",
    );
    const original = await code.textContent();
    await block.getByRole("button", { name: "Wrap code lines" }).click();
    assert.equal(
      await code.evaluate((el) => getComputedStyle(el).whiteSpace),
      "pre-wrap",
    );
    assert.equal(
      await code.textContent(),
      original,
      "wrapping changes presentation only",
    );
    await block.getByRole("button", { name: "Wrap code lines" }).click();
    assert.equal(
      await code.evaluate((el) => getComputedStyle(el).whiteSpace),
      "pre",
    );
    await block.locator(".copy-button").focus();
    await page.keyboard.press("Tab");
    assert.ok(
      await block
        .locator("pre")
        .evaluate((el) => el === document.activeElement),
    );
    assert.equal(
      await block
        .locator("pre")
        .evaluate((el) => getComputedStyle(el).outlineStyle),
      "solid",
    );
    // Simulate a denied clipboard without writing to the system clipboard.
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error("test denial")) },
      }),
    );
    await block.locator(".copy-button").click();
    await page.waitForFunction(
      () =>
        document.querySelector(".copy-button")?.textContent ===
        "Selected — copy manually",
    );
    assert.equal(
      (await page.evaluate(() => getSelection()?.toString())).trimEnd(),
      original.trimEnd(),
    );
    await page.evaluate(() => getSelection()?.removeAllRanges());
    await page.screenshot({ path: `${output}/reading-${width}.png` });
    await audit(page);

    const trigger = page.locator(".article-image-trigger").first();
    await trigger.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const image = document.querySelector(".article-image-trigger img");
      return image?.complete && image.naturalWidth > 0;
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.getByRole("dialog").waitFor();
    assert.ok(
      await page.getByRole("link", { name: "Open original image" }).isVisible(),
    );
    await audit(page);
    await page.keyboard.press("Tab");
    assert.ok(
      await page.evaluate(
        () => !!document.activeElement.closest('[role="dialog"]'),
      ),
      "focus stays in image viewer",
    );
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.ok(
      await trigger.evaluate((el) => el === document.activeElement),
      "image viewer restores focus",
    );
    console.log(
      `PASS ${width}px: section map, anchors/focus, free scrolling, code wrapping/clipboard fallback, image dialog and accessibility`,
    );
    await page.close();
  }
  const direct = await browser.newPage({
    viewport: { width: 390, height: 1000 },
    reducedMotion: "reduce",
  });
  direct.on("pageerror", (error) => errors.push(error.message));
  await direct.goto(`${base}${route}#42-stututu`, { waitUntil: "networkidle" });
  await direct.waitForFunction(() => {
    const target = document.getElementById("42-stututu");
    const header = document.querySelector(".site-global-header");
    const top = target?.getBoundingClientRect().top;
    return (
      top >= header.getBoundingClientRect().bottom + 60 &&
      top < header.getBoundingClientRect().bottom + 130
    );
  });
  await direct.close();
  const staticPage = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 1000 },
    reducedMotion: "reduce",
  });
  await staticPage.goto(`${base}${route}`, { waitUntil: "networkidle" });
  assert.equal(await staticPage.locator("[data-article-chapter]").count(), 8);
  const outline = staticPage.locator(".article-outline-mobile");
  await outline.locator(":scope > summary").click();
  await outline
    .getByRole("link", { name: "Super Malware Scanner", exact: true })
    .click();
  assert.equal(new URL(staticPage.url()).hash, "#4-super-malware-scanner");
  assert.equal(
    await staticPage
      .locator(".article-outline")
      .evaluate((el) => getComputedStyle(el).position),
    "relative",
    "without JavaScript, the open outline must not cover the reading target",
  );
  assert.ok(
    (await staticPage.locator("#article-body").innerText()).length > 1000,
  );
  await staticPage.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS no-JavaScript article/outline/anchors and zero browser runtime errors",
  );
} finally {
  await browser.close();
}
