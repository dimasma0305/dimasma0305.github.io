import { expect, test } from "bun:test";
import { siteSocial, socialImage } from "./social-metadata";
import sharp from "sharp";

test("share image is an actual crawler-readable 1200 × 630 JPEG", async () => {
  const image = await sharp(`public${siteSocial.image}`).metadata();
  expect(image.format).toBe("jpeg");
  expect(image.width).toBe(siteSocial.width);
  expect(image.height).toBe(siteSocial.height);
  expect(siteSocial.description.length).toBeLessThan(160);
  expect(socialImage("https://dimasc.tf/").url).toBe(
    "https://dimasc.tf/social/room-v1.jpg",
  );
  expect(socialImage("https://example.com/portfolio/").url).toBe(
    "https://example.com/portfolio/social/room-v1.jpg",
  );
  expect(socialImage("https://dimasc.tf").alt).toContain("room");
});
