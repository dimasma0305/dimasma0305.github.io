import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";

const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const output = process.env.ROOM_SCREENSHOTS || "/tmp/dimasc-content-theme";
await mkdir(output, { recursive: true });
const axeSource = process.env.AXE_MODULE
  ? await readFile(process.env.AXE_MODULE, "utf8")
  : null;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];
const findings = [];
try {
  const discovery = await browser.newPage();
  await discovery.goto(`${base}/blog/`, { waitUntil: "networkidle" });
  await discovery.locator(".post-card").first().waitFor();
  const post = await discovery
    .locator('.post-card a[href*="/posts/"]')
    .first()
    .getAttribute("href");
  await discovery.goto(`${base}/categories/`, { waitUntil: "networkidle" });
  const category = await discovery
    .locator('main a[href*="/categories/"]')
    .first()
    .getAttribute("href");
  await discovery.goto(`${base}/tags/`, { waitUntil: "networkidle" });
  const tag = await discovery
    .locator('main a[href*="/tags/"]')
    .first()
    .getAttribute("href");
  await discovery.close();
  const routes = [
    "/blog/",
    "/notes/",
    "/tools/",
    "/services/",
    "/tools/ctf-calculator/",
    "/notes/node-js/",
    "/search/",
    "/categories/",
    "/tags/",
    post,
    category,
    tag,
  ];
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      const response = await page.goto(new URL(route, base).href, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200, route);
      await page.locator("main h1").first().waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px ${route}: page overflow`,
      );
      const theme = await page.locator(".content-shell").evaluate((el) => ({
        background: getComputedStyle(el).backgroundColor,
        heading: getComputedStyle(el.querySelector("h1")).fontFamily,
      }));
      assert.equal(theme.background, "rgb(17, 25, 21)", route);
      assert.match(theme.heading, /DM[ _]Serif[ _]Display/, route);
      if (axeSource && width !== 390) {
        await page.addScriptTag({ content: axeSource });
        const violations = await page.evaluate(async () =>
          (
            await axe.run({
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            })
          ).violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          })),
        );
        if (violations.length) {
          findings.push({ width, route, violations });
          console.log(JSON.stringify({ width, route, violations }));
        }
      }
      const name = route
        .split("?")[0]
        .replaceAll("/", "-")
        .replace(/^-|-$/g, "");
      await page.screenshot({ path: `${output}/${name}-${width}.png` });
      console.log(`PASS ${width}px ${route}: warm theme, heading, no overflow`);
    }

    await page.goto(`${base}/blog/`, { waitUntil: "networkidle" });
    const blogSearch = page.getByRole("searchbox");
    await blogSearch.fill("PatchStack");
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll(".post-card-title")].length > 0 &&
        [...document.querySelectorAll(".post-card-title")].every((el) =>
          /patchstack/i.test(el.textContent),
        ),
    );
    await page
      .getByRole("button", { name: "Clear search", exact: true })
      .first()
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll(".post-card").length > 1,
    );

    await page.goto(`${base}/notes/`, { waitUntil: "networkidle" });
    const noteSearch = page.getByRole("searchbox", {
      name: "Search the notebook",
    });
    await noteSearch.fill("Node");
    await page.locator(".note-card").first().waitFor();
    assert.match(
      await page.locator(".notes-result-count").innerText(),
      /matching “Node”/,
    );
    await noteSearch.fill("a-note-that-does-not-exist-731");
    await page.waitForFunction(
      () => document.querySelectorAll(".note-card").length === 0,
    );
    await noteSearch.fill("");
    const topic = page.getByRole("combobox", { name: "Topic" });
    await topic.click();
    const option = page.getByRole("option").nth(1);
    const topicName = await option.innerText();
    await option.click();
    assert.match(
      await page.locator(".notes-result-count").innerText(),
      new RegExp(` in ${topicName}`),
    );
    await page.locator(".note-card > a").first().focus();
    assert.equal(
      await page
        .locator(".note-card")
        .first()
        .evaluate((el) => getComputedStyle(el).outlineStyle),
      "solid",
      "Stretched note links keep a visible, unclipped focus outline",
    );

    await page.goto(`${base}/tools/ctf-calculator/`, {
      waitUntil: "networkidle",
    });
    const tableRegion = page.getByRole("region", {
      name: "Scrollable data table",
    });
    if (await tableRegion.evaluate((el) => el.scrollWidth > el.clientWidth)) {
      await tableRegion.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(
        () =>
          document.querySelector('[aria-label="Scrollable data table"]')
            .scrollLeft > 0,
      );
    }
    const slider = page.getByRole("slider").first();
    const initial = Number(await slider.getAttribute("aria-valuenow"));
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    assert.ok(Number(await slider.getAttribute("aria-valuenow")) > initial);
    const guide = page
      .getByRole("button", { name: /^Scoring guide for/ })
      .first();
    await guide.click();
    await page.getByRole("dialog").waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(
      await guide.evaluate((el) => el === document.activeElement),
      true,
    );
    await page.getByRole("button", { name: "Reset All Values" }).click();
    assert.equal(Number(await slider.getAttribute("aria-valuenow")), initial);

    await page.goto(`${base}/services/`, { waitUntil: "networkidle" });
    const faq = page.locator("summary").first();
    await faq.focus();
    await page.keyboard.press("Enter");
    assert.equal(await faq.evaluate((el) => el.parentElement.open), true);
    assert.equal(await page.locator(".diff-status-before").isVisible(), false);
    assert.equal(await page.locator(".diff-scan").isVisible(), false);

    await page.goto(`${base}/notes/node-js/`, { waitUntil: "networkidle" });
    if (width < 1024) {
      await page.locator(".article-outline-mobile > summary").click();
    }
    const toc = page.locator(".article-outline-list a:visible").first();
    await toc.waitFor();
    const target = (await toc.getAttribute("href")).slice(1);
    await toc.click();
    await page.waitForFunction((id) => {
      const heading = document.getElementById(id);
      const header = document.querySelector(".site-global-header");
      const top = heading?.getBoundingClientRect().top;
      return (
        top >= header.getBoundingClientRect().bottom &&
        top < header.getBoundingClientRect().bottom + 130
      );
    }, target);
    await page.evaluate(
      (id) =>
        document
          .getElementById(id)
          .scrollIntoView({ behavior: "instant", block: "start" }),
      target,
    );
    const nativeClearance = await page.evaluate(
      (id) =>
        document.getElementById(id).getBoundingClientRect().top -
        document.querySelector(".site-global-header").getBoundingClientRect()
          .bottom,
      target,
    );
    assert.ok(
      nativeClearance >= (width < 1024 ? 80 : 20) &&
        nativeClearance <= (width < 1024 ? 104 : 40),
      "Native anchors clear the responsive header and mobile note outline",
    );
    await page.screenshot({ path: `${output}/reading-anchor-${width}.png` });
    console.log(
      `PASS ${width}px: search, filtering, empty results, keyboard calculator, modal focus, FAQ, reduced motion and TOC clearance`,
    );
    await page.close();
  }
  const plain = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await plain.goto(`${base}/notes/node-js/`, { waitUntil: "networkidle" });
  assert.ok(
    (await plain.locator("article").innerText()).length > 500,
    "Static reading content survives without JavaScript",
  );
  await plain.close();
  assert.deepEqual(errors, [], "Browser runtime errors");
  assert.deepEqual(findings, [], "WCAG A/AA violations");
  console.log(
    "PASS static reading fallback, zero runtime errors and accessibility checks",
  );
} finally {
  await browser.close();
}
