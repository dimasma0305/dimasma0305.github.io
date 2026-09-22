import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import {
  optimizedRoomPath,
  optimizedContentCover,
  roomStillVariant,
  roomStillWidths,
  roomPhotoThumb,
  roomPhotoThumbWidth,
  roomPhotoMedium,
  roomPhotoMediumWidth,
  optimizedStoryImage,
  roomAvif,
} from "../lib/optimized-media.mjs";

// Bump when encoder settings change so every companion is regenerated.
const ENCODER_VERSION = 2;
// AVIF twins: effort 3 keeps a full rebuild near a minute; quality is set per
// source kind below (rendered stills tolerate less than photographs).
const avifQuality = (source) =>
  source.includes("room-stills/") ? 72 : source.endsWith(".png") ? 80 : 62;

const publicDir = new URL("../public/", import.meta.url);
const jobs = [];
const stillDir = new URL("room/assets/room-stills/", publicDir);
for (const file of await readdir(stillDir)) {
  if (file.endsWith(".jpg")) {
    const input = `room/assets/room-stills/${file}`;
    jobs.push([input, optimizedRoomPath(input), 93]);
    // Same encoder settings at fewer pixels, selected by `srcset` on screens
    // that cannot show the full 2048px render.
    for (const width of roomStillWidths) {
      const target = roomStillVariant(input, width);
      if (target !== input) jobs.push([input, target, 93, width]);
    }
  }
}
// Album and keepsake photographs: a same-size WebP and a small thumbnail.
const photoDirs = ["room/assets/", "room/assets/portfolio/"];
for (const dir of photoDirs) {
  for (const file of await readdir(new URL(dir, publicDir))) {
    const input = `${dir}${file}`;
    const target = optimizedRoomPath(input);
    if (!file.endsWith(".jpg") || target === input) continue;
    jobs.push([input, target, 82]);
    const thumb = roomPhotoThumb(input);
    if (thumb !== input) jobs.push([input, thumb, 80, roomPhotoThumbWidth]);
    const medium = roomPhotoMedium(input);
    if (medium !== input) jobs.push([input, medium, 82, roomPhotoMediumWidth]);
  }
}
// Project screenshots: pixel-identical lossless WebP at about half the bytes.
for (const dir of ["portfolio/", "room/assets/portfolio/"]) {
  for (const file of await readdir(new URL(dir, publicDir))) {
    const input = `${dir}${file}`;
    const target = optimizedStoryImage(`/${input}`).slice(1);
    if (file.endsWith(".png") && target !== input)
      jobs.push([input, target, "lossless"]);
  }
}
jobs.push([
  "room/assets/bali-night-window.png",
  "room/assets/bali-night-window.webp",
  93,
]);
for (const name of ["blog", "notes"]) {
  let index;
  try {
    index = JSON.parse(
      await readFile(new URL(`${name}-index.json`, publicDir), "utf8"),
    );
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  for (const post of index.posts?.all || []) {
    const source = post.featured_image;
    if (typeof source !== "string") continue;
    const target = optimizedContentCover(source);
    if (target === source) continue;
    const input = path.resolve(publicDir.pathname, `.${source}`);
    if (
      !input.startsWith(publicDir.pathname) ||
      source.split("/").includes("..")
    )
      throw new Error("Invalid local cover path");
    jobs.push([source.slice(1), target.slice(1), 92]);
  }
}
// Every room WebP (not the lossless screenshots) gets an AVIF twin.
for (const job of [...jobs]) {
  const [source, target, quality, width] = job;
  const avif = roomAvif(target);
  if (avif !== target && quality !== "lossless")
    jobs.push([source, avif, avifQuality(source), width, "avif"]);
}

// Freshness is decided by a manifest of source hashes and encoder settings,
// not file times: a fresh checkout or a restored CI cache must not re-encode
// unchanged images, and a changed setting must.
// Outside `public/`, which is copied into the export wholesale.
const manifestPath = new URL("../.cache/media-manifest.json", import.meta.url);
await mkdir(new URL("./", manifestPath), { recursive: true });
let manifest = {};
try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch {}
const nextManifest = {};
const sourceHashes = new Map();
async function sourceHash(source) {
  if (!sourceHashes.has(source))
    sourceHashes.set(
      source,
      createHash("sha1")
        .update(await readFile(new URL(source, publicDir)))
        .digest("hex"),
    );
  return sourceHashes.get(source);
}

let originalBytes = 0,
  optimizedBytes = 0,
  generated = 0;
const seen = new Set();
const work = [];
for (const [source, target, quality, width, format = "webp"] of jobs) {
  if (seen.has(target) || source === target) continue;
  seen.add(target);
  work.push(async () => {
    const input = new URL(source, publicDir),
      output = new URL(target, publicDir);
    let sourceInfo;
    try {
      sourceInfo = await stat(input);
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    const recipe = `${await sourceHash(source)}:${format}:${quality}:${width || "full"}:${ENCODER_VERSION}`;
    nextManifest[target] = recipe;
    const cached = await stat(output).catch(() => null);
    if (!cached || manifest[target] !== recipe) {
      const image = sharp(input.pathname);
      if (width) image.resize({ width, withoutEnlargement: true });
      await mkdir(new URL("./", output), { recursive: true });
      if (format === "avif") {
        await image.avif({ quality, effort: 3 }).toFile(output.pathname);
      } else {
        await image
          .webp(
            quality === "lossless"
              ? { lossless: true, effort: 6 }
              : { quality, effort: 6 },
          )
          .toFile(output.pathname);
      }
      generated++;
    }
    // Resized variants and AVIF twins are extra candidates, not replacements.
    if (!width && format === "webp") {
      // Read the size before adding: `a += await b` reads `a` first and would
      // drop updates made by the other workers during the wait.
      const size = (await stat(output)).size;
      originalBytes += sourceInfo.size;
      optimizedBytes += size;
    }
  });
}
// A few encodes at a time: AVIF is CPU-bound and CI runners have few cores.
const concurrency = 4;
let cursor = 0;
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (cursor < work.length) await work[cursor++]();
  }),
);
await writeFile(manifestPath, JSON.stringify(nextManifest, null, 1));
console.log(
  `Media: ${seen.size} companions, ${generated} generated; full-size ${(originalBytes / 1048576).toFixed(2)} → ${(optimizedBytes / 1048576).toFixed(2)} MiB.`,
);
