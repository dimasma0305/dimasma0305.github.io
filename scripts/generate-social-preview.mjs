import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { brandMarkSVG, siteBrand } from "../lib/site-brand.mjs";

// Compose a code-native brand card using the real room render and self-hosted
// site fonts. Run after a build; no external image/font requests are needed.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const root = new URL("../", import.meta.url);
const cssDir = new URL("out/_next/static/css/", root);
const css = (
  await Promise.all(
    (await readdir(cssDir))
      .filter((name) => name.endsWith(".css"))
      .map((name) => readFile(new URL(name, cssDir), "utf8")),
  )
).join("\n");
async function font(family, alias, weight = "400") {
  const face = [...css.matchAll(/@font-face\{[^}]+\}/g)]
    .map((m) => m[0])
    .find(
      (rule) =>
        rule.match(/font-family:([^;]+)/)?.[1].replaceAll('"', "") === family &&
        rule.includes("font-style:normal") &&
        rule.includes(`font-weight:${weight}`) &&
        /u\+(?:0{0,3}0-0{0,2}ff|00\?\?)/i.test(rule),
    );
  if (!face)
    throw new Error(`Build the site first: missing Latin ${family} font`);
  const file = path.basename(face.match(/url\(([^)]+\.woff2)\)/)[1]);
  const data = await readFile(new URL(`out/_next/static/media/${file}`, root));
  return `@font-face{font-family:${alias};font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${data.toString("base64")}) format("woff2")}`;
}
const fonts = (
  await Promise.all([
    font("DM Serif Display", "RoomHeading"),
    font("DM Sans", "RoomSans"),
    font("DM Sans", "RoomSans", "600"),
  ])
).join("\n");
const room = (
  await readFile(new URL("public/room/assets/room-stills/welcome.jpg", root))
).toString("base64");
const { background, ink, accent } = siteBrand.colors.dark;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${fonts}
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:${background};color:${ink};font-family:RoomSans,sans-serif}
.card{position:relative;width:1200px;height:630px;background:radial-gradient(ellipse at 78% 48%,#e4ac8315,transparent 55%)}
.frame{position:absolute;inset:24px;border:1px solid #3b4a3e;border-radius:18px}
.brand{position:absolute;left:60px;top:50px;display:flex;align-items:center;gap:13px;font-size:28px;font-weight:600;letter-spacing:-1px}.brand svg{width:39px;height:39px}.brand em{font-style:normal;color:${accent}}
.eyebrow{position:absolute;left:63px;top:168px;font-size:12px;letter-spacing:2.1px;color:${accent}}
h1{position:absolute;left:58px;top:204px;margin:0;font:400 82px/1.04 RoomHeading,Georgia,serif;letter-spacing:-2px}h1 em{font-style:normal;color:${accent}}
.intro{position:absolute;left:63px;top:408px;font-size:21px;line-height:1.55;color:#bac4b8;margin:0}
.name{position:absolute;left:63px;bottom:62px;font-size:23px;font-weight:600;margin:0}
.room{position:absolute;left:605px;top:18px;width:590px;height:590px;object-fit:contain;mix-blend-mode:lighten}
</style></head><body><main class="card"><div class="frame"></div><div class="brand">${brandMarkSVG()}<span>dimasc<em>.tf</em></span></div><p class="eyebrow">SECURITY · CODE · COMMUNITY</p><h1>A room for<br><em>curiosity.</em></h1><p class="intro">Security research. Open source.<br>Things worth sharing.</p><p class="name">Dimas Maulana</p><img class="room" src="data:image/jpeg;base64,${room}" alt="Dimas’s 3D room"></main></body></html>`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/snap/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(html);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode()));
  });
  const output = new URL("public/social/", root);
  await mkdir(output, { recursive: true });
  const jpeg = await page.screenshot({ type: "jpeg", quality: 94 });
  await writeFile(new URL("room-v1.jpg", output), jpeg);
  // Keep the old public image URL useful for existing integrations.
  await writeFile(new URL("public/og-image.jpg", root), jpeg);
  console.log(
    `Generated 1200 × 630 room share image (${Math.round(jpeg.length / 1024)} KiB).`,
  );
} finally {
  await browser.close();
}
