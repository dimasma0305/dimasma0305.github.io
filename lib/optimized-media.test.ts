import { expect, test } from "bun:test";
import {
  optimizedRoomPath,
  optimizedContentCover,
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
    "./assets/team-bali.jpg",
  );
  expect(optimizedRoomPath("./assets/dimas.jpg")).toBe("./assets/dimas.jpg");
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
