import { test, expect } from "bun:test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
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
  expect(svg.trim()).toBe(brandMarkSVG({ tile: true, small: true }));
  expect(svg).not.toMatch(/<text|<image|<script/);
  const manifest = JSON.parse(
    await readFile(
      new URL("../public/manifest.webmanifest", import.meta.url),
      "utf8",
    ),
  );
  expect(manifest.short_name).toBe(siteBrand.name);
  expect(manifest.theme_color).toBe(siteBrand.colors.dark.background);
  expect(
    manifest.icons.find(
      (icon: { type: string }) => icon.type === "image/svg+xml",
    ).src,
  ).toBe("/icon.svg?v=dm2");
  expect(
    manifest.icons.every((icon: { src: string }) =>
      icon.src.endsWith("?v=dm2"),
    ),
  ).toBe(true);
  const appIcon = await readFile(
    new URL("../public/icon.svg", import.meta.url),
    "utf8",
  );
  expect(appIcon.trim()).toBe(brandMarkSVG({ tile: true }));
});

test("the DM monogram uses one scalable silhouette without raster or font dependencies", () => {
  const svg = brandMarkSVG();
  expect(svg.match(/<path\b/g)).toHaveLength(1);
  expect(svg).toContain(`d="${siteBrand.mark}"`);
  expect(svg).toContain('fill-rule="evenodd"');
  expect(svg).toContain('viewBox="0 0 48 48"');
  expect(svg).toContain('aria-hidden="true"');
  expect(svg).toContain('focusable="false"');
  expect(svg).not.toMatch(/<rect|<image|<text|<filter|<animate|<script/);
});

test("transparent dark and light logo downloads match the shared header geometry", async () => {
  for (const [name, variant] of [
    ["logo-mark.svg", "dark"],
    ["logo-mark-light.svg", "light"],
  ] as const) {
    const svg = await readFile(
      new URL(`../public/${name}`, import.meta.url),
      "utf8",
    );
    expect(svg.trim()).toBe(brandMarkSVG({ variant }));
    expect(svg).toContain(`fill="${siteBrand.colors[variant].accent}"`);
    expect(svg).not.toContain("<rect");
  }
});

test("small icons have their own optical master while the header keeps its refined curves", async () => {
  expect(siteBrand.smallMark).not.toBe(siteBrand.mark);
  const svg = await readFile(
    new URL("../public/logo-mark-small.svg", import.meta.url),
    "utf8",
  );
  expect(svg.trim()).toBe(brandMarkSVG({ small: true }));
  expect(svg).toContain(`d="${siteBrand.smallMark}"`);
  expect(brandMarkSVG()).toContain(`d="${siteBrand.mark}"`);
});

test("monochrome artwork uses the same geometry without CSS filters", async () => {
  const svg = await readFile(
    new URL("../public/logo-mark-mono.svg", import.meta.url),
    "utf8",
  );
  expect(svg.trim()).toBe(brandMarkSVG({ monochrome: true }));
  expect(svg).toContain(`fill="${siteBrand.colors.dark.ink}"`);
  expect(svg).toContain(`d="${siteBrand.mark}"`);
  expect(svg).not.toContain("filter");
});

test("exports include native-sized tiny icons and a high-resolution transparent master", async () => {
  for (const [name, size] of [
    ["favicon-16.png", 16],
    ["favicon-32.png", 32],
    ["icon-512.png", 512],
    ["logo-transparent.png", 1024],
  ] as const) {
    const buffer = await readFile(
      new URL(`../public/${name}`, import.meta.url),
    );
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toBe(size);
    expect(metadata.height).toBe(size);
    expect(metadata.hasAlpha).toBe(true);
  }
  const png = await readFile(
    new URL("../public/logo-transparent.png", import.meta.url),
  );
  const { data, info } = await sharp(png)
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect(data[3]).toBe(0);
  const centerOfM =
    (Math.floor(info.height / 2) * info.width + Math.floor(info.width / 2)) *
    info.channels;
  expect(data[centerOfM + 3]).toBe(0);
});
