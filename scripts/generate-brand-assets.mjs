import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import { brandMarkSVG } from "../lib/site-brand.mjs";

// Raster exports of our code-native vector, not independent/generated artwork.
const output = new URL("../public/", import.meta.url);
const svg = brandMarkSVG({ tile: true });
await writeFile(new URL("favicon.svg", output), svg + "\n");
const sizes = [
  ["favicon-32.png", 32],
  ["favicon-48.png", 48],
  ["favicon-96.png", 96],
  ["apple-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["logo.png", 512],
];
for (const [name, size] of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(new URL(name, output).pathname);
}
// ICO containers can hold PNG frames. Include useful small browser sizes.
const frames = await Promise.all(
  [16, 32, 48].map((size) =>
    sharp(Buffer.from(svg)).resize(size, size).png().toBuffer(),
  ),
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
