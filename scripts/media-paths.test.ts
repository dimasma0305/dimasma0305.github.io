import { expect, test } from "bun:test";
import path from "node:path";
import { mediaFilePath } from "./media-paths.mjs";

test("media URLs become native absolute paths for Sharp", () => {
  const url = new URL("../public/room/assets/room-stills/about.jpg", import.meta.url);
  const result = mediaFilePath(url);
  expect(path.isAbsolute(result)).toBe(true);
  expect(result).toEndWith(path.join("room", "assets", "room-stills", "about.jpg"));
  if (process.platform === "win32") {
    expect(result).toMatch(/^[A-Za-z]:\\/);
    expect(result).not.toMatch(/^\/[A-Za-z]:\//);
  }
});
