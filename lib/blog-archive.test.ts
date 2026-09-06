import { expect, test } from "bun:test";
import {
  blogEntries,
  blogTopics,
  blogFilterQuery,
  defaultBlogFilters,
  filterBlogEntries,
  formatBlogDate,
  readBlogFilters,
  validBlogReturn,
} from "./blog-archive";

const entries = blogEntries([
  {
    slug: "older",
    title: "A short PHP note",
    created_time: "2024-01-01T00:00:00Z",
    categories: ["Web", "Web"],
    tags: ["PHP"],
    reading_time: 3,
  },
  {
    slug: "newer",
    title: "A longer research article",
    excerpt: "Learning about PHP",
    created_time: "2025-01-01T00:00:00Z",
    categories: ["Web", "Research"],
    reading_time: 20,
  },
  {
    slug: "untimed",
    title: "A notebook entry",
    created_time: "2026-01-01T00:00:00Z",
    reading_time: 0,
  },
]);

test("only published metadata is serialized; topics and reading estimates are normalized", () => {
  expect(
    blogEntries([
      { slug: "draft", title: "Draft", properties: { published: false } },
      { slug: "archived", title: "Archived", archived: true },
      { title: "Missing slug" },
    ]),
  ).toEqual([]);
  expect(entries[0].topics).toEqual(["Web"]);
  expect(entries[2].minutes).toBeNull();
  expect(blogTopics(entries)).toEqual([
    { name: "Web", count: 2 },
    { name: "Research", count: 1 },
  ]);
});

test("archive order is chronological, stable, and does not mutate input", () => {
  expect(
    filterBlogEntries(entries, defaultBlogFilters).map((p) => p.slug),
  ).toEqual(["untimed", "newer", "older"]);
  expect(
    filterBlogEntries(entries, { ...defaultBlogFilters, sort: "oldest" }).map(
      (p) => p.slug,
    ),
  ).toEqual(["older", "newer", "untimed"]);
  expect(
    filterBlogEntries(entries, { ...defaultBlogFilters, sort: "shortest" }).map(
      (p) => p.slug,
    ),
  ).toEqual(["older", "newer", "untimed"]);
  expect(entries[0].slug).toBe("older");
});

test("query words and topic combine, including tags and case-insensitive matches", () => {
  expect(
    filterBlogEntries(entries, {
      ...defaultBlogFilters,
      query: "  PHP   short ",
      topic: "Web",
    }).map((p) => p.slug),
  ).toEqual(["older"]);
  expect(
    filterBlogEntries(entries, {
      ...defaultBlogFilters,
      query: "PHP",
      topic: "Research",
    }).map((p) => p.slug),
  ).toEqual(["newer"]);
  expect(
    filterBlogEntries(entries, { ...defaultBlogFilters, topic: "Missing" }),
  ).toEqual([]);
});

test("filter URLs round trip safely and restore only the blog destination", () => {
  const state = {
    query: "a + b & c",
    topic: "Web / JS",
    sort: "shortest" as const,
  };
  expect(readBlogFilters(blogFilterQuery(state))).toEqual(state);
  expect(blogFilterQuery(defaultBlogFilters)).toBe("");
  expect(readBlogFilters("?sort=wrong").sort).toBe("newest");
  expect(readBlogFilters(`?q=${"x".repeat(400)}`).query.length).toBe(200);
  expect(validBlogReturn("?q=PHP&redirect=https://example.com")).toBe(
    "/blog/?q=PHP",
  );
  expect(validBlogReturn("https://example.com")).toBe("/blog/");
});

test("dates are stable across timezones and missing dates stay readable", () => {
  expect(formatBlogDate("2025-01-01T00:00:00Z")).toBe("Jan 1, 2025");
  expect(formatBlogDate("")).toBe("Undated");
});
