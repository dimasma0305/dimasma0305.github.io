import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const output = process.env.ROOM_SCREENSHOTS || "/tmp/dimasc-blog";
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
    "no horizontal overflow",
  );
  if (axe) {
    await page.evaluate(axe);
    const issues = await page.evaluate(async () =>
      (
        await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        })
      ).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    );
    assert.deepEqual(issues, []);
  }
}
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 950 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (error) => errors.push(error.message));
    const requests = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto(`${base}/blog/`, { waitUntil: "networkidle" });
    const total = await page.locator(".post-card").count();
    assert.ok(total > 3);
    assert.ok(
      await page
        .locator(".blog-page")
        .evaluate((el) => el.getBoundingClientRect().width <= 1161),
      "archive keeps a comfortable reading width inside the route transition wrapper",
    );
    assert.equal(await page.locator(".blog-feature").count(), 1);
    assert.equal(
      requests.filter((url) => /(?:blog-index|post)\.json$/.test(url)).length,
      0,
      "blog is statically rendered, no index or article fetches",
    );
    const destinations = await page
      .locator(".post-card h2 a, .post-card h3 a")
      .evaluateAll((links) => links.map((a) => a.href));
    assert.equal(
      new Set(destinations).size,
      total,
      "featured article is not duplicated in archive",
    );
    await audit(page);
    await page.screenshot({ path: `${output}/archive-${width}.png` });
    const search = page.getByRole("searchbox", { name: "Search the archive" });
    await search.fill("PatchStack");
    await page
      .getByRole("combobox", { name: "Topic", exact: true })
      .selectOption("wordpress");
    await page
      .getByRole("combobox", { name: "Sort by" })
      .selectOption("shortest");
    assert.equal(await page.locator(".blog-feature").count(), 0);
    assert.equal(new URL(page.url()).searchParams.get("topic"), "wordpress");
    const filteredCount = await page.locator(".blog-entry").count();
    assert.ok(filteredCount > 0 && filteredCount < total);
    const times = await page.locator(".blog-entry-meta").allTextContents();
    const minutes = times.map((text) =>
      Number(text.match(/(\d+) min read/)[1]),
    );
    assert.deepEqual(
      minutes,
      [...minutes].sort((a, b) => a - b),
    );
    const first = page.locator(".blog-entry h3 a").first();
    const title = await first.innerText();
    await first.focus();
    assert.equal(
      await page
        .locator(".blog-entry")
        .first()
        .evaluate((el) => getComputedStyle(el).outlineStyle),
      "solid",
    );
    await page.keyboard.press("Enter");
    await page.waitForURL((url) => url.pathname.startsWith("/posts/"));
    assert.equal(await page.locator("main h1").first().innerText(), title);
    await page.locator("#article-body .prose").waitFor();
    await audit(page);
    await page.screenshot({ path: `${output}/article-${width}.png` });
    await page.getByRole("link", { name: "Start reading" }).click();
    await page.waitForTimeout(350);
    const clearance = await page.locator("#article-body").evaluate((el) => ({
      top: el.getBoundingClientRect().top,
      header: document
        .querySelector(".site-global-header")
        .getBoundingClientRect().height,
    }));
    assert.ok(
      clearance.top >= clearance.header &&
        clearance.top < clearance.header + 100,
      JSON.stringify(clearance),
    );
    await page.locator(".blog-return-link").first().click();
    await search.waitFor();
    await page.waitForFunction(
      () => document.querySelector("#blog-search").value === "PatchStack",
    );
    assert.equal(await page.locator(".blog-entry").count(), filteredCount);
    assert.equal(await page.locator("#blog-sort").inputValue(), "shortest");
    await search.fill("nothing-matches-this-731");
    assert.equal(await page.locator(".blog-entry").count(), 0);
    await page
      .getByRole("button", { name: "Clear filters and browse all articles" })
      .click();
    assert.equal(await page.locator(".post-card").count(), total);
    assert.ok(await search.evaluate((el) => el === document.activeElement));
    assert.equal(new URL(page.url()).search, "");
    await search.fill("PHP");
    await page.keyboard.press("Escape");
    assert.equal(await search.inputValue(), "");
    console.log(
      `PASS ${width}px: readable archive, search/topic/sort, persistent results, keyboard, empty states, article anchor and accessibility`,
    );
    await page.close();
  }

  const direct = await browser.newPage({ reducedMotion: "reduce" });
  direct.on("pageerror", (error) => errors.push(error.message));
  await direct.goto(`${base}/blog/?q=PatchStack&sort=oldest`, {
    waitUntil: "networkidle",
  });
  assert.equal(await direct.locator("#blog-search").inputValue(), "PatchStack");
  const title = await direct.locator(".blog-entry h3 a").first().innerText();
  await direct.locator(".blog-entry h3 a").first().click();
  await direct.waitForURL((url) => url.pathname.startsWith("/posts/"));
  await direct.goBack();
  await direct.waitForFunction(
    () => document.querySelector("#blog-search")?.value === "PatchStack",
  );
  assert.equal(await direct.locator("#blog-sort").inputValue(), "oldest");
  await direct.locator(".blog-entry h3 a").first().click();
  const next = direct.getByRole("link", { name: /Newer article/ });
  await next.waitFor();
  await next.click();
  await direct.waitForFunction(
    (previous) => document.querySelector("main h1")?.textContent !== previous,
    title,
  );
  assert.notEqual(
    await direct.locator("main h1").first().innerText(),
    title,
    "adjacent navigation must render the new post, not stale state",
  );
  await direct.close();

  const staticPage = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  await staticPage.goto(`${base}/blog/`, { waitUntil: "networkidle" });
  assert.ok((await staticPage.locator(".post-card").count()) > 3);
  assert.ok(await staticPage.locator(".blog-no-js").isVisible());
  assert.ok(await staticPage.locator("#blog-search").isDisabled());
  await staticPage.locator(".blog-feature h2 a").click();
  assert.ok(
    (await staticPage.locator("#article-body").innerText()).length > 100,
  );
  await staticPage.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS direct filtered URLs, browser Back, adjacent post navigation, no-JavaScript archive/reading and zero runtime errors",
  );
} finally {
  await browser.close();
}
