import { expect, test } from "bun:test";
import { prefetchDestination, shouldPrefetch } from "./navigation-prefetch";

test("only warms local page destinations, preserving queries and stripping anchors", () => {
  const current = "https://dimasc.tf/blog/";
  expect(prefetchDestination("/notes/#tips", current)).toBe("/notes/");
  expect(prefetchDestination("/search/?q=room#results", current)).toBe(
    "/search/?q=room",
  );
  for (const href of [
    "#main-content",
    "/blog",
    "https://other.example/notes/",
    "mailto:hello@dimasc.tf",
    "javascript:void(0)",
    "/notes-index.json",
    "/notes/a/post.json",
    "/social/room-v1.jpg",
  ]) {
    expect(prefetchDestination(href, current)).toBeNull();
  }
  expect(
    prefetchDestination(
      "/portfolio/notes/",
      "https://dimasc.tf/portfolio/",
      "/portfolio",
    ),
  ).toBe("/notes/");
  expect(
    prefetchDestination(
      "/notes/",
      "https://dimasc.tf/portfolio/",
      "/portfolio",
    ),
  ).toBeNull();
});

test("does not speculate on data-saving, very slow or hidden sessions", () => {
  expect(shouldPrefetch()).toBe(true);
  expect(shouldPrefetch({ effectiveType: "4g" })).toBe(true);
  expect(shouldPrefetch({ saveData: true })).toBe(false);
  expect(shouldPrefetch({ effectiveType: "2g" })).toBe(false);
  expect(shouldPrefetch({ effectiveType: "slow-2g" })).toBe(false);
  expect(shouldPrefetch(undefined, true)).toBe(false);
});
