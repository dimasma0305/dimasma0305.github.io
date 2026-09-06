import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  optimizedRoomPath,
  optimizedContentCover,
} from "../lib/optimized-media.mjs";

const publicDir = new URL("../public/", import.meta.url);
const jobs = [];
const stillDir = new URL("room/assets/room-stills/", publicDir);
for (const file of await readdir(stillDir)) {
  if (file.endsWith(".jpg")) {
    const input = `room/assets/room-stills/${file}`;
    jobs.push([input, optimizedRoomPath(input), 93]);
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
let originalBytes = 0,
  optimizedBytes = 0,
  generated = 0;
const seen = new Set();
for (const [source, target, quality] of jobs) {
  if (seen.has(source) || source === target) continue;
  seen.add(source);
  const input = new URL(source, publicDir),
    output = new URL(target, publicDir);
  let sourceInfo;
  try {
    sourceInfo = await stat(input);
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  const cached = await stat(output).catch(() => null);
  if (!cached || cached.mtimeMs < sourceInfo.mtimeMs) {
    await sharp(input.pathname)
      .webp({ quality, effort: 6 })
      .toFile(output.pathname);
    generated++;
  }
  originalBytes += sourceInfo.size;
  optimizedBytes += (await stat(output)).size;
}
console.log(
  `Media: ${seen.size} full-resolution companions, ${generated} generated; ${(originalBytes / 1048576).toFixed(2)} → ${(optimizedBytes / 1048576).toFixed(2)} MiB.`,
);
