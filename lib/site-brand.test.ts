import { test, expect } from "bun:test";
import { readFile } from "node:fs/promises";
import {
  siteBrand,
  siteNavigation,
  brandMarkSVG,
  isSiteSectionActive,
} from "./site-brand.mjs";

test("primary navigation has four distinct site destinations in the requested order", () => {
  expect(siteNavigation.map((item) => item.name)).toEqual([
    "Blog",
    "Notes",
    "Tools",
    "Services",
  ]);
  expect(siteNavigation.map((item) => item.path)).toEqual([
    "/blog/",
    "/notes/",
    "/tools/",
    "/services/",
  ]);
});

test("nested articles, notes, tools and service routes retain the right active link", () => {
  for (const pathname of [
    "/blog",
    "/blog/",
    "/posts/example/",
    "/categories/research/",
    "/tags/ctf/",
  ]) {
    expect(isSiteSectionActive(pathname, "/blog/")).toBe(true);
  }
  expect(isSiteSectionActive("/notes/example/", "/notes/")).toBe(true);
  expect(isSiteSectionActive("/tools/ctf-calculator/", "/tools/")).toBe(true);
  expect(isSiteSectionActive("/services/", "/services/")).toBe(true);
  expect(isSiteSectionActive("/notes/example/", "/blog/")).toBe(false);
  expect(isSiteSectionActive("/tools-other/", "/tools/")).toBe(false);
  expect(isSiteSectionActive("/", "/blog/")).toBe(false);
});

test("favicon and installed app identity are generated from the same dimasc.tf brand", async () => {
  expect(siteBrand.name).toBe("dimasc.tf");
  const svg = await readFile(
    new URL("../public/favicon.svg", import.meta.url),
    "utf8",
  );
  expect(svg.trim()).toBe(brandMarkSVG({ tile: true }));
  expect(svg).not.toMatch(/<text|<image|<script/);
  const manifest = JSON.parse(
    await readFile(
      new URL("../public/manifest.webmanifest", import.meta.url),
      "utf8",
    ),
  );
  expect(manifest.short_name).toBe(siteBrand.name);
  expect(manifest.theme_color).toBe(siteBrand.colors.dark.background);
});
