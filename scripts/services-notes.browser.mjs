import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const output = process.env.ROOM_SCREENSHOTS || "/tmp/dimasc-services-notes";
const noteRoute = "/notes/path-traversal/";
const targetId = "0-url-decoded-last-segment-traversal-to-binary-overwrite";
await mkdir(output, { recursive: true });
const axe = process.env.AXE_MODULE
  ? await readFile(process.env.AXE_MODULE, "utf8")
  : null;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];
let enhancedCode;
async function audit(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "no horizontal page overflow",
  );
  assert.equal(await page.locator("main h1").count(), 1);
  if (axe) {
    await page.evaluate(axe);
    const issues = await page.evaluate(async () =>
      (
        await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        })
      ).violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
    );
    assert.deepEqual(issues, []);
  }
}
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/services/`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".service-price").count(), 1);
    assert.match(await page.locator(".service-price").innerText(), /\$99/);
    assert.equal(
      await page
        .locator(".service-price > span")
        .evaluate((el) => getComputedStyle(el).fontSize),
      "13px",
      "price suffix stays compact",
    );
    assert.equal(
      await page.locator(".service-deliverables article").count(),
      3,
    );
    assert.equal(await page.locator(".service-faq details").count(), 5);
    await audit(page);
    await page.screenshot({
      path: `${output}/services-${width}.png`,
      fullPage: true,
    });
    const faq = page.locator(".service-faq summary").first();
    await faq.focus();
    await page.keyboard.press("Enter");
    assert.ok(await faq.evaluate((el) => el.parentElement.open));
    const actualFaqs = await page
      .locator(".service-faq details")
      .evaluateAll((items) =>
        items.map((item) => ({
          q: item.querySelector("summary").firstChild.textContent,
          a: item.querySelector("p").textContent,
        })),
      );
    const structuredFaqs = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((el) => JSON.parse(el.textContent))
        .find((data) => data["@type"] === "FAQPage")
        .mainEntity.map((item) => ({
          q: item.name,
          a: item.acceptedAnswer.text,
        })),
    );
    assert.deepEqual(
      actualFaqs,
      structuredFaqs,
      "visible FAQ and structured data stay in sync",
    );
    await page
      .getByRole("link", { name: "Discuss your project", exact: true })
      .click();
    await page.waitForTimeout(300);
    assert.ok(
      await page
        .locator("#start-a-review")
        .evaluate(
          (el) =>
            el.getBoundingClientRect().top >=
            document
              .querySelector(".site-global-header")
              .getBoundingClientRect().bottom,
        ),
    );
    assert.match(
      await page
        .locator('#start-a-review a[href^="mailto:"]')
        .getAttribute("href"),
      /dimasmaulana0305@gmail.com/,
    );
    assert.equal(
      await page
        .locator('#start-a-review a[href^="https://wa.me/"]')
        .getAttribute("href"),
      "https://wa.me/6285967149226",
    );
    // Validate destinations without sending a message or launching a mail app.
    for (const href of await page
      .locator('.service-sample a[href*="sample-report"]')
      .evaluateAll((links) => links.map((a) => a.href))) {
      assert.equal((await page.request.get(href)).status(), 200);
    }
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__testBrief = text;
          },
        },
      }),
    );
    await page.getByRole("button", { name: "Copy brief", exact: true }).click();
    await page.getByRole("button", { name: "Copied", exact: true }).waitFor();
    assert.equal(
      await page.evaluate(() => window.__testBrief),
      await page.locator("#review-brief").inputValue(),
    );
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      }),
    );
    await page.getByRole("button", { name: "Copied", exact: true }).click();
    assert.ok(
      await page
        .locator("#review-brief")
        .evaluate(
          (el) =>
            el === document.activeElement &&
            el.selectionEnd === el.value.length &&
            el.selectionStart === 0,
        ),
    );
    assert.match(
      await page.locator('.service-brief [role="status"]').innerText(),
      /Template selected/,
    );

    await page.goto(`${base}${noteRoute}#${targetId}`, {
      waitUntil: "networkidle",
    });
    await page
      .locator(".article-code-toolbar")
      .first()
      .waitFor({ state: "attached" });
    await page.waitForFunction(
      ({ id, mobile }) => {
        const el = document.getElementById(id);
        const header = document
          .querySelector(".site-global-header")
          .getBoundingClientRect().bottom;
        const top = el?.getBoundingClientRect().top;
        return top >= header + (mobile ? 60 : 0) && top < header + 130;
      },
      { id: targetId, mobile: width < 1024 },
    );
    assert.equal(await page.locator("#article-body pre").count(), 5);
    enhancedCode = await page
      .locator("#article-body pre code")
      .allTextContents();
    assert.equal(
      await page.locator(".article-outline-list > li").count(),
      2,
      "one section per responsive outline, not duplicate category panels",
    );
    await audit(page);
    await page.screenshot({ path: `${output}/note-anchor-${width}.png` });
    const block = page.locator(".article-code-block").first();
    // Preserve the note's native, initially collapsed examples. Open the
    // existing disclosure before exercising its generic reading controls.
    const disclosure = block.locator("xpath=ancestor::details[1]");
    if (await disclosure.count()) {
      await disclosure.locator(":scope > summary").click();
    }
    await block.getByRole("button", { name: "Wrap code lines" }).click();
    assert.equal(
      await block
        .locator("code")
        .evaluate((el) => getComputedStyle(el).whiteSpace),
      "pre-wrap",
    );
    assert.deepEqual(
      await page.locator("#article-body pre code").allTextContents(),
      enhancedCode,
    );
    await page.goto(`${base}${noteRoute}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${output}/note-intro-${width}.png` });
    const outline = page.locator(
      width < 1024 ? ".article-outline-mobile" : ".article-outline-desktop",
    );
    if (width < 1024) {
      await outline.locator(":scope > summary").click();
    }
    await outline.locator(".article-outline-list a").first().focus();
    await page.keyboard.press("Enter");
    assert.ok(
      await page.evaluate((id) => document.activeElement.id === id, targetId),
    );
    const adjacent = page
      .getByRole("link", { name: /(?:Newer|Older) note/ })
      .first();
    await adjacent.waitFor();
    const previousTitle = await page.locator("main h1").innerText();
    await adjacent.click();
    await page.waitForFunction(
      (previous) => document.querySelector("main h1")?.textContent !== previous,
      previousTitle,
    );
    console.log(
      `PASS ${width}px: service scope/pricing/FAQ/contact/brief, notes deep links/wrapping/adjacent navigation and accessibility`,
    );
    await page.close();
  }
  const plain = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 1000 },
    reducedMotion: "reduce",
  });
  await plain.goto(`${base}${noteRoute}#${targetId}`, {
    waitUntil: "networkidle",
  });
  assert.deepEqual(
    await plain.locator("#article-body pre code").allTextContents(),
    enhancedCode,
    "reading enhancements never change technical content",
  );
  assert.equal(await plain.locator(`[id="${targetId}"]`).count(), 1);
  await plain.goto(`${base}/services/`, { waitUntil: "networkidle" });
  assert.ok(
    await plain.getByRole("button", { name: "Copy brief" }).isDisabled(),
  );
  await plain.locator(".service-faq summary").first().click();
  assert.ok(
    await plain
      .locator(".service-faq details")
      .first()
      .evaluate((el) => el.open),
  );
  assert.equal(await plain.locator("#start-a-review a").count(), 3);
  await plain.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS no-JavaScript services/notes, original note text preserved, and zero runtime errors",
  );
} finally {
  await browser.close();
}
