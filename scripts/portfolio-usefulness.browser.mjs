import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const output = "/tmp/dimasc-usefulness";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];
const axe = process.env.AXE_MODULE
  ? await readFile(process.env.AXE_MODULE, "utf8")
  : null;
const READING_KEY = "dimasc:reading:v1";
const METRICS_DATA = "dimasc:metrics-session:v1";
const post = "/posts/patchstack-ctf-2025-end-of-the-year-alliance-captu/";
async function check(page) {
  assert.equal(await page.locator("main").count(), 1);
  assert.equal(await page.locator("h1").count(), 1);
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "No horizontal overflow",
  );
  if (axe) {
    await page.evaluate(axe);
    const result = await page.evaluate(() =>
      axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      }),
    );
    assert.deepEqual(
      result.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.target),
      })),
      [],
      "Automated WCAG checks",
    );
  }
}
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/search/?q=ctfify&type=project`, {
    waitUntil: "networkidle",
  });
  await page.waitForFunction(
    () => document.querySelector("#site-query").value === "ctfify",
  );
  assert.equal(await page.locator(".library-results li").count(), 1);
  await check(page);
  await page.locator(".library-results a").first().click();
  await page.waitForFunction(
    () => document.querySelector("#project-4")?.open === true,
  );
  assert.equal(await page.locator(".tour-project-case").count(), 3);
  assert.equal(await page.locator("[data-portfolio-project]").count(), 9);
  assert.ok(await page.locator("#project-4 .tour-case-facts").isVisible());
  assert.equal(
    await page
      .locator("#project-4 .tour-case-takeaway")
      .evaluate((el) => getComputedStyle(el).fontSize),
    "13px",
  );
  await page.waitForFunction(() =>
    [...document.querySelectorAll("#project-4 img")].every(
      (img) => img.complete && img.naturalWidth > 0,
    ),
  );
  const heading = await page.locator("#project-4 summary").boundingBox();
  const header = await page.locator(".tour-header").boundingBox();
  assert.ok(
    heading.y >= header.height + 56,
    "Deep-linked case study clears the collapsed room",
  );
  await page.screenshot({ path: `${output}/project-phone.png` });
  await check(page);
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForFunction(
    () => document.querySelector("#site-query")?.value === "ctfify",
  );
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await page.getByRole("button", { name: /^Notes \d/ }).click();
  await page.getByRole("searchbox").fill("path traversal");
  assert.ok((await page.locator(".library-results li").count()) > 0);
  await page.screenshot({ path: `${output}/search-phone.png` });
  await page.getByRole("searchbox").fill("no-match-zzzz");
  assert.ok(
    await page.getByRole("heading", { name: "No matches yet." }).isVisible(),
  );
  await page.getByRole("button", { name: "Reset search" }).click();
  const initial = await page.locator(".library-results li").count();
  await page.getByRole("button", { name: /^Show more results/ }).click();
  assert.ok((await page.locator(".library-results li").count()) > initial);

  await page.goto(`${base}/#project-0`, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () =>
      document.querySelector("#project-0")?.open &&
      document.querySelector("#tour-more-projects")?.open,
  );
  assert.ok(
    await page.locator("#project-0 .tour-expansion").isVisible(),
    "Search reveals projects inside the full collection",
  );

  await page.goto(base + post, { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Save for later", exact: true })
    .click();
  await page.evaluate(() => {
    const article = document.querySelector("#article-body");
    scrollTo({
      top:
        article.getBoundingClientRect().top +
        scrollY +
        article.getBoundingClientRect().height * 0.35,
      behavior: "instant",
    });
  });
  await page.waitForFunction(
    (key) => JSON.parse(localStorage.getItem(key) || "[]")[0]?.progress > 20,
    READING_KEY,
  );
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key))[0],
    READING_KEY,
  );
  assert.ok(
    saved.progress < 98 && saved.section,
    "Actual scrolling persists a resumable section",
  );
  await page.goto(`${base}/reading-list/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".saved-entry");
  await page.screenshot({ path: `${output}/saved-phone.png` });
  await check(page);
  await page.locator(".saved-entry h2 a").click();
  await page
    .getByRole("button", { name: "Continue reading", exact: true })
    .waitFor();
  assert.ok(
    await page.evaluate(() => scrollY < 200),
    "Resume is offered without a forced scroll",
  );
  await page
    .getByRole("button", { name: "Continue reading", exact: true })
    .click();
  await page.waitForFunction(
    (id) => document.activeElement?.id === id,
    saved.section,
  );
  await page.goto(`${base}/reading-list/`, { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: /^Remove .* from saved reading/ })
    .click();
  assert.equal(await page.locator(".saved-entry").count(), 0);
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "saved-title",
  );
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), READING_KEY),
    "[]",
  );

  await page.goto(`${base}/notes/path-traversal/`, {
    waitUntil: "networkidle",
  });
  await page.locator(".note-review summary").click();
  assert.ok(
    (await page.locator(".note-review").textContent()).includes(
      "not a verification date",
    ),
  );
  await page
    .getByRole("button", { name: "Save for later", exact: true })
    .click();
  assert.equal(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key))[0].kind,
      READING_KEY,
    ),
    "note",
  );

  await page.goto(`${base}/privacy/`, { waitUntil: "networkidle" });
  await check(page);
  assert.ok(await page.getByRole("radio", { name: /^Off / }).isChecked());
  assert.ok(
    await page.getByRole("radio", { name: /^Share performance/ }).isDisabled(),
  );
  assert.equal(
    await page.evaluate((key) => sessionStorage.getItem(key), METRICS_DATA),
    null,
  );
  await page.getByRole("radio", { name: /^Only on this device/ }).check();
  await page.waitForFunction(
    (key) => JSON.parse(sessionStorage.getItem(key) || "[]").length > 0,
    METRICS_DATA,
  );
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator('.tour-room-index a[href="#work"]').click();
  await page.waitForFunction(
    (key) =>
      JSON.parse(sessionStorage.getItem(key) || "[]").some(
        (item) => item.name === "work",
      ),
    METRICS_DATA,
  );
  await page.goto(`${base}/privacy/`, { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: /^Off / }).check();
  await page.getByRole("button", { name: "Clear local measurements" }).click();
  assert.equal(
    await page.evaluate((key) => sessionStorage.getItem(key), METRICS_DATA),
    null,
  );
  await page.screenshot({ path: `${output}/privacy-phone.png` });
  assert.ok(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)).length === 1,
      READING_KEY,
    ),
    "Analytics controls do not erase functional saved reading",
  );

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/search/", "/reading-list/", "/privacy/"]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      await check(page);
    }
  }
  const restricted = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await restricted.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
    Object.defineProperty(navigator, "globalPrivacyControl", { value: true });
  });
  const blocked = await restricted.newPage();
  blocked.on("pageerror", (error) => errors.push(error.message));
  await blocked.goto(base + post, { waitUntil: "networkidle" });
  await blocked
    .getByRole("button", { name: "Save for later", exact: true })
    .click();
  assert.ok(
    (await blocked.locator(".reading-tools > p").textContent()).includes(
      "blocked storage",
    ),
  );
  await blocked.goto(`${base}/privacy/`, { waitUntil: "networkidle" });
  assert.ok(
    await blocked
      .getByRole("radio", { name: /^Only on this device/ })
      .isDisabled(),
  );
  const plain = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 780 },
  });
  for (const route of [
    "/search/",
    "/reading-list/",
    "/privacy/",
    "/#project-4",
  ]) {
    await plain.goto(base + route, { waitUntil: "networkidle" });
    assert.equal(await plain.locator("main").count(), 1);
    assert.equal(await plain.locator("h1").count(), 1);
    assert.ok(
      await plain.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: unified search, case deep links, saved reading/resume, note status, privacy defaults, local diagnostics, storage failure, no-JS, phone/desktop and automated accessibility.",
  );
} finally {
  await browser.close();
}
