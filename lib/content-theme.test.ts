import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { siteBrand } from "./site-brand.mjs";
import { getHeaderOffset, HEADER_OFFSET } from "./scroll-utils";

const css = readFileSync(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);
function rgbFromToken(name: string) {
  const match = css.match(
    new RegExp(`--${name}: ([\\d.]+) ([\\d.]+)% ([\\d.]+)%`),
  );
  if (!match) throw new Error(`Missing theme token: ${name}`);
  const h = Number(match[1]) / 360,
    s = Number(match[2]) / 100,
    l = Number(match[3]) / 100;
  const a = s * Math.min(l, 1 - l);
  return [0, 8, 4].map((n) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  });
}
function luminance(rgb: number[]) {
  return rgb
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
      0,
    );
}
function contrast(first: string, second: string) {
  const a = luminance(rgbFromToken(first)),
    b = luminance(rgbFromToken(second));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test("content surfaces use the approved room/brand palette", () => {
  for (const [token, hex] of [
    ["background", siteBrand.colors.dark.background],
    ["foreground", siteBrand.colors.dark.ink],
    ["primary", siteBrand.colors.dark.accent],
  ]) {
    const actual = rgbFromToken(token).map((value) => Math.round(value * 255));
    const expected = hex
      .slice(1)
      .match(/../g)!
      .map((value: string) => parseInt(value, 16));
    expect(actual).toEqual(expected);
  }
});

test("reading text, subdued labels and copper links meet AA on every content surface", () => {
  for (const surface of ["background", "card", "popover", "muted"]) {
    for (const text of [
      "foreground",
      "muted-foreground",
      "primary",
      "primary-bright",
    ]) {
      expect(contrast(text, surface)).toBeGreaterThanOrEqual(4.5);
    }
  }
  expect(contrast("primary-foreground", "primary")).toBeGreaterThanOrEqual(4.5);
  expect(
    contrast("destructive-foreground", "destructive"),
  ).toBeGreaterThanOrEqual(4.5);
  for (const surface of ["background", "card", "popover"]) {
    expect(contrast("input", surface)).toBeGreaterThanOrEqual(3);
    expect(contrast("ring", surface)).toBeGreaterThanOrEqual(3);
  }
});

test("reading anchors clear both the desktop and two-row mobile header", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  try {
    for (const height of [73, 101]) {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          querySelector: () => ({ getBoundingClientRect: () => ({ height }) }),
        },
      });
      expect(getHeaderOffset()).toBe(height + 24);
    }
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { querySelector: () => null },
    });
    expect(getHeaderOffset()).toBe(HEADER_OFFSET);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "document", descriptor);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
