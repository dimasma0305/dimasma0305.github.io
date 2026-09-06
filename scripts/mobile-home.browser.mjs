import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";

const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.ROOM_SITE_URL || "http://127.0.0.1:4001";
const output = process.env.ROOM_SCREENSHOTS || "/tmp/dimasc-mobile";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];
const axe = process.env.AXE_MODULE
  ? await readFile(process.env.AXE_MODULE, "utf8")
  : null;

async function noOverflow(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "No horizontal page overflow",
  );
}

async function tapVisible(page, selector) {
  const box = await page.locator(selector).boundingBox();
  assert.ok(
    box && box.y >= 0 && box.y + box.height <= page.viewportSize().height,
    `${selector} is in view`,
  );
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

async function corner(page, id) {
  // Exercise the real directory and native hash handling, not a scroll stub.
  const shortcut = page.locator(".tour-room-directory-link");
  if (await shortcut.isVisible())
    await tapVisible(page, ".tour-room-directory-link");
  await page.locator(`.tour-room-index a[href="#${id}"]`).tap();
  await page.waitForFunction(
    (id) => document.querySelector(".tour-page").dataset.chapter === id,
    id,
  );
  await page.waitForFunction(
    () => document.querySelector(".tour-page").dataset.roomMode === "reading",
  );
}

try {
  for (const [width, height] of [
    [320, 640],
    [360, 780],
    [390, 844],
    [430, 932],
    [768, 1024],
    [844, 390],
    [600, 360],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForSelector('.tour-page[data-render-mode="stills"]');
    await page.evaluate(() => document.fonts.ready);
    await noOverflow(page);
    assert.ok(
      await page
        .locator(".tour-scene")
        .evaluate((el) => parseFloat(getComputedStyle(el).opacity) > 0.8),
      "The welcome room stays visible in portrait and side-by-side landscape",
    );
    const header = await page.locator(".tour-header").boundingBox();
    if (width <= 700) assert.ok(header.height <= 102, "Two-row phone header");
    if (height <= 500 && width >= 600)
      assert.ok(header.height <= 58, "One-row landscape header");
    assert.deepEqual(await page.locator(".tour-site-nav a").allTextContents(), [
      "Blog",
      "Notes",
      "Tools",
      "Services",
    ]);
    for (const link of await page.locator(".tour-site-nav a").all()) {
      const box = await link.boundingBox();
      assert.ok(
        box.width >= 44 &&
          box.height >= 44 &&
          box.x >= 0 &&
          box.x + box.width <= width,
      );
    }
    if (width === 390) {
      const actions = await page.locator(".tour-intro-actions").boundingBox();
      assert.ok(
        actions.y + actions.height < height,
        "Both intro actions fit on a typical phone's first screen",
      );
    }
    await page.screenshot({ path: `${output}/home-${width}x${height}.png` });
    await page.locator(".tour-start").tap();
    for (const link of await page.locator(".tour-room-index a").all()) {
      const box = await link.boundingBox();
      assert.ok(box.height >= 48 && box.width >= 44);
    }
    await corner(page, "work");
    const card = await page.locator(".tour-card-work").boundingBox();
    if (width <= 430)
      assert.ok(
        card.width >= width - 40,
        "Cards use the phone width without nested gutters",
      );
    const heading = await page.locator("#tour-work-title").boundingBox();
    assert.ok(
      heading.y >= header.height + 56,
      "Anchor heading clears both sticky controls",
    );
    await noOverflow(page);
    await page.screenshot({
      path: `${output}/projects-${width}x${height}.png`,
    });

    const y = await page.evaluate(() => scrollY);
    await tapVisible(page, "[data-tour-room-toggle]");
    await page.waitForFunction(
      () => document.querySelector(".tour-page").dataset.roomMode === "open",
    );
    assert.equal(
      await page.evaluate(() => scrollY),
      y,
      "Opening the room does not move reading position",
    );
    await tapVisible(page, "[data-tour-room-toggle]");
    await page.waitForFunction(
      () => document.querySelector(".tour-page").dataset.roomMode === "reading",
    );
    assert.equal(
      await page.evaluate(() => scrollY),
      y,
      "Closing the room does not move reading position",
    );

    // A real browser touch-scroll through the reading surface must remain native.
    const cdp = await page.context().newCDPSession(page);
    // Dispatch a drag explicitly: Chromium's synthetic touch scroll gesture
    // is a no-op in some headless builds. End slowly to avoid inertial flings.
    const drag = Math.min(240, height - header.height - 150);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: width / 2, y: height - 50 }],
    });
    for (let step = 1; step <= 12; step++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: width / 2, y: height - 50 - (drag * step) / 12 }],
      });
      await page.waitForTimeout(20);
    }
    await page.waitForTimeout(120);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    const after = await page.evaluate(() => scrollY);
    assert.ok(
      after > y + 80 && after < y + 650,
      "Touch scrolling advances without jumping to a later chapter",
    );
    await page.waitForTimeout(250);
    assert.ok(
      Math.abs((await page.evaluate(() => scrollY)) - after) < 3,
      "No delayed scroll chase after the gesture ends",
    );

    await page.locator("[data-portfolio-project] summary").first().tap();
    assert.equal(
      await page
        .locator("[data-portfolio-project]")
        .first()
        .evaluate((el) => el.open),
      true,
    );
    await noOverflow(page);
    await page.locator("[data-portfolio-project] summary").first().tap();
    await corner(page, "writing");
    assert.ok(
      await page
        .locator("#tour-library-query")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16),
      "Search text avoids small-input auto zoom",
    );
    await page.locator("#tour-library-query").fill("patchstack");
    assert.ok(await page.locator("#tour-library").evaluate((el) => el.open));
    await noOverflow(page);
    await page.locator("#tour-library-query").fill("");
    await page.screenshot({ path: `${output}/writing-${width}x${height}.png` });

    await corner(page, "about");
    const photo = await page
      .locator(".tour-album-stage figure:not([hidden]) img")
      .boundingBox();
    if (width <= 430)
      assert.ok(
        photo.width >= width - 60,
        "Album photos are large enough to see",
      );
    const lastPhoto = page.locator("[data-tour-photo]").last();
    await lastPhoto.tap();
    assert.equal(await lastPhoto.getAttribute("aria-pressed"), "true");
    assert.equal(
      await page.locator("[data-portfolio-photo]:not([hidden])").count(),
      1,
    );
    await noOverflow(page);
    await corner(page, "contact");
    for (const link of await page.locator(".tour-contact-socials a").all()) {
      assert.ok((await link.boundingBox()).height >= 44);
    }
    if (axe && [320, 390].includes(width)) {
      await page.evaluate(axe);
      const issues = await page.evaluate(async () =>
        (
          await window.axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          })
        ).violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
      );
      assert.deepEqual(issues, []);
    }
    await page.screenshot({ path: `${output}/contact-${width}x${height}.png` });
    console.log(
      `PASS ${width}×${height}: header, intro, touch navigation/scroll, reading width, room toggle, projects, search, album, contact`,
    );
    await page.close();
  }

  const plain = await browser.newPage({
    viewport: { width: 320, height: 740 },
    javaScriptEnabled: false,
    isMobile: true,
    hasTouch: true,
  });
  await plain.goto(base, { waitUntil: "networkidle" });
  await noOverflow(plain);
  assert.equal(await plain.locator("h1").count(), 1);
  assert.equal(
    await plain.locator(".tour-room-directory-link").isVisible(),
    false,
  );
  await plain.locator(".tour-start").tap();
  await plain.locator('.tour-room-index a[href="#work"]').tap();
  await plain.locator("[data-portfolio-project] summary").first().tap();
  assert.ok(
    await plain
      .locator("[data-portfolio-project]")
      .first()
      .evaluate((el) => el.open),
  );
  await noOverflow(plain);
  await plain.close();
  console.log(
    "PASS 320px without JavaScript: complete readable content and native navigation/disclosures",
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
