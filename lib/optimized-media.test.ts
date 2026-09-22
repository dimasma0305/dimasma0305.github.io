import { expect, test } from "bun:test";
import {
  optimizedRoomPath,
  optimizedContentCover,
  roomPhotoThumb,
  roomStillSrcset,
  roomStillVariant,
} from "./optimized-media.mjs";
import { roomAsset } from "./room/assets.js";

test("uses full-resolution companions only for known room assets", () => {
  expect(optimizedRoomPath("./assets/bali-night-window.png")).toBe(
    "./assets/bali-night-window.webp",
  );
  expect(
    roomAsset("/portfolio/room/", "./assets/room-stills/welcome.jpg"),
  ).toBe("/portfolio/room/assets/room-stills/welcome.webp");
  expect(optimizedRoomPath("./assets/team-bali.jpg")).toBe(
    "./assets/team-bali.webp",
  );
  expect(optimizedRoomPath("./assets/portfolio/photo-3.jpg")).toBe(
    "./assets/portfolio/photo-3.webp",
  );
  expect(optimizedRoomPath("./assets/dimas.jpg")).toBe("./assets/dimas.webp");
  // Anything the build does not generate a companion for keeps its URL.
  for (const src of [
    "./assets/portfolio/tcp1p-theme.png",
    "./assets/team-other.jpg",
    "./assets/room-stills/unknown.jpg",
    "https://cdn.example/assets/team-bali.jpg?v=1",
  ]) {
    expect(optimizedRoomPath(src)).toBe(src);
  }
});

test("offers narrower still renders without dropping the full one", () => {
  const still = "./assets/room-stills/welcome.jpg";
  expect(roomStillVariant(still, 1024)).toBe(
    "./assets/room-stills/welcome-1024.webp",
  );
  expect(roomStillSrcset(still, (path) => roomAsset("/room/", path))).toBe(
    "/room/assets/room-stills/welcome-1024.webp 1024w, " +
      "/room/assets/room-stills/welcome-1536.webp 1536w, " +
      "/room/assets/room-stills/welcome.webp 2048w",
  );
  // Not a generated still: no candidates, so the caller keeps a plain src.
  expect(roomStillSrcset("./assets/team-bali.jpg")).toBe("");
  expect(roomStillVariant("./assets/team-bali.jpg", 1024)).toBe(
    "./assets/team-bali.jpg",
  );
});

test("album thumbnails exist only for album photographs", () => {
  expect(roomPhotoThumb("./assets/team-china.jpg")).toBe(
    "./assets/team-china.thumb.webp",
  );
  expect(roomPhotoThumb("./assets/portfolio/photo-7.jpg")).toBe(
    "./assets/portfolio/photo-7.thumb.webp",
  );
  // The avatar is already small; the scene and the page share one file.
  expect(roomPhotoThumb("./assets/dimas.jpg")).toBe("./assets/dimas.jpg");
  expect(roomPhotoThumb("https://cdn.example/photo.jpg")).toBe(
    "https://cdn.example/photo.jpg",
  );
});

test("keeps originals for remote, JPEG and unrelated images", () => {
  expect(optimizedContentCover("/posts/room/cover.png")).toBe(
    "/posts/room/cover.png.preview.webp",
  );
  expect(optimizedContentCover("/portfolio/notes/a/cover.png")).toBe(
    "/portfolio/notes/a/cover.png.preview.webp",
  );
  for (const src of [
    "https://cdn.example/posts/a.png",
    "//cdn.example/posts/a.png",
    "/posts/a/cover.jpg",
    "/social/room-v1.jpg",
    "/placeholder.svg",
    "/posts/a/cover.png?version=1",
  ]) {
    expect(optimizedContentCover(src)).toBe(src);
  }
});
