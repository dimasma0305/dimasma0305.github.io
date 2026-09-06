import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import { brandMarkSVG } from "../lib/site-brand.mjs";

// Raster exports of our code-native vector, not independent/generated artwork.
const output = new URL("../public/", import.meta.url);
const svg = brandMarkSVG({ tile: true, small: true });
await writeFile(new URL("favicon.svg", output), svg + "\n");
await writeFile(
  new URL("icon.svg", output),
  brandMarkSVG({ tile: true }) + "\n",
);
await writeFile(new URL("logo-mark.svg", output), brandMarkSVG() + "\n");
await writeFile(
  new URL("logo-mark-light.svg", output),
  brandMarkSVG({ variant: "light" }) + "\n",
);
await writeFile(
  new URL("logo-mark-mono.svg", output),
  brandMarkSVG({ monochrome: true }) + "\n",
);
await writeFile(
  new URL("logo-mark-small.svg", output),
  brandMarkSVG({ small: true }) + "\n",
);
const sizes = [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["favicon-48.png", 48],
  ["favicon-96.png", 96],
  ["apple-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["logo.png", 512],
];
function rasterMark(size, tile = true) {
  return sharp(
    Buffer.from(brandMarkSVG({ tile, small: size <= 32 })),
    // Render vectors at the target resolution; never enlarge a 48px bitmap.
    { density: 72 * Math.max(1, size / 48) },
  )
    .resize(size, size)
    .png();
}
for (const [name, size] of sizes) {
  await rasterMark(size).toFile(new URL(name, output).pathname);
}
await rasterMark(1024, false).toFile(
  new URL("logo-transparent.png", output).pathname,
);
// ICO containers can hold PNG frames. Include useful small browser sizes.
const frames = await Promise.all(
  [16, 32, 48].map((size) => rasterMark(size).toBuffer()),
);
const header = Buffer.alloc(6 + frames.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
for (const [index, frame] of frames.entries()) {
  const entry = 6 + index * 16;
  header[entry] = header[entry + 1] = [16, 32, 48][index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frame.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
}
await writeFile(
  new URL("favicon.ico", output),
  Buffer.concat([header, ...frames]),
);
console.log(
  "Updated dimasc.tf vector, favicon, and app icons from the shared brand mark.",
);
