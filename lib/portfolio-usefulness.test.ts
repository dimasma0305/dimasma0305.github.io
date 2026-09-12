import { expect, test } from "bun:test";
import { findEntries, searchFilter, type SearchEntry } from "./site-search";
import { buildSearchDirectory } from "./site-search.server";
import { parseReadingList, validReadingPath } from "./reading-list";
import { metricsEndpoint, pageBucket, parseMetrics } from "./site-metrics";
import { projectStories, resultEvidence } from "./portfolio-stories";
import { assembleRoomPortfolio } from "./room/portfolio";
import { cornerTour, tourChapterAtPosition } from "./room/tour.js";
import { existsSync } from "node:fs";

test("fractional chapter arrivals survive native scroll rounding and control focus", () => {
  expect(tourChapterAtPosition([0, 900, 1213.6], 1213)).toBe(2);
  expect(tourChapterAtPosition([0, 900, 1213.6], 1211)).toBe(1);
  expect(tourChapterAtPosition([0, 900, 1213.6], 0)).toBe(0);
});

test("unified search filters types and matches words across public metadata", () => {
  const entries: SearchEntry[] = [
    {
      id: "1",
      kind: "project",
      title: "CTFIFY",
      description: "Challenge organization",
      href: "/#project-4",
      topics: ["Go", "CLI"],
    },
    {
      id: "2",
      kind: "post",
      title: "A writeup",
      description: "Using CTFify",
      href: "/posts/writeup/",
      topics: ["CTF"],
    },
  ];
  expect(findEntries(entries, "ctfify").map((item) => item.id)).toEqual([
    "1",
    "2",
  ]);
  expect(
    findEntries(entries, " ＣＴＦＩＦＹ  go ").map((item) => item.id),
  ).toEqual(["1"]);
  expect(findEntries(entries, "ctfify", "post").map((item) => item.id)).toEqual(
    ["2"],
  );
  expect(findEntries(entries, "missing")).toEqual([]);
  expect(searchFilter("unknown")).toBe("all");
});

test("public search directory is unique, has all projects and has no article bodies", () => {
  const entries = buildSearchDirectory({
    blog: [
      {
        slug: "example-post",
        title: "Example post",
        created_time: "2026-01-02T00:00:00.000Z",
        excerpt: "A public post summary",
        categories: ["Research"],
        tags: ["Web"],
      },
    ],
    notes: [
      {
        slug: "example-note",
        title: "Example note",
        created_time: "2026-01-01T00:00:00.000Z",
        excerpt: "A public note summary",
        categories: ["Notes"],
        tags: ["Security"],
      },
    ],
  });
  expect(new Set(entries.map((item) => item.id)).size).toBe(entries.length);
  expect(entries.filter((item) => item.kind === "project")).toHaveLength(9);
  expect(entries.some((item) => item.kind === "post")).toBe(true);
  expect(entries.some((item) => item.kind === "note")).toBe(true);
  expect(entries.every((item) => !("content" in item))).toBe(true);
});

test("saved reading tolerates invalid storage and accepts only local article destinations", () => {
  expect(parseReadingList("broken")).toEqual([]);
  expect(parseReadingList("{}")).toEqual([]);
  for (const path of [
    "https://example.com/",
    "//example.com/",
    "/services/",
    "/posts/../",
    "/posts/%2e%2e/",
    "/notes/test/?q=1",
  ]) {
    expect(validReadingPath(path)).toBe(false);
  }
  expect(validReadingPath("/posts/a%20title/")).toBe(true);
  const item = {
    path: "/posts/example/",
    title: "Example",
    kind: "post",
    progress: 200,
    updated: 2,
  };
  const list = parseReadingList(
    JSON.stringify([item, { ...item, updated: 1, progress: 10 }]),
  );
  expect(list).toHaveLength(1);
  expect(list[0].progress).toBe(100);
  expect(list[0].section).toBe("");
  expect(parseReadingList(JSON.stringify([{ ...item, kind: "note" }]))).toEqual(
    [],
  );
  expect(
    parseReadingList(
      JSON.stringify(
        Array.from({ length: 90 }, (_, i) => ({
          ...item,
          path: `/posts/p-${i}/`,
        })),
      ),
    ),
  ).toHaveLength(50);
});

test("metrics discard private URLs and only permit a deliberate HTTPS collector", () => {
  expect(pageBucket("/search/?q=private#section")).toBe("search");
  expect(pageBucket("/posts/a-personal-slug/")).toBe("posts");
  expect(pageBucket("/unknown/private")).toBe("other");
  for (const value of [
    "",
    "/api/metrics",
    "http://metrics.example",
    "https://user:pass@metrics.example/",
    "https://metrics.example/?token=secret",
    "https://metrics.example/#x",
  ]) {
    expect(metricsEndpoint(value)).toBe(null);
  }
  expect(metricsEndpoint("https://metrics.example/collect")).toBe(
    "https://metrics.example/collect",
  );
  const entry = {
    sample: "sample-1",
    name: "LCP",
    value: 1200,
    page: "home",
    viewport: "small",
    motion: "reduced",
    room: "stills",
    query: "never retain",
  };
  const clean = parseMetrics(JSON.stringify([entry]));
  expect(clean).toHaveLength(1);
  expect(clean[0]).not.toHaveProperty("query");
  expect(
    parseMetrics(JSON.stringify([{ ...entry, page: "posts/private/" }])),
  ).toEqual([]);
  expect(
    parseMetrics(JSON.stringify([{ ...entry, name: "typed_search" }])),
  ).toEqual([]);
  expect(parseMetrics(JSON.stringify([{ ...entry, value: -1 }]))).toEqual([]);
});

test("case studies use actual local previews, retain all projects and make evidence explicit", () => {
  const portfolio = assembleRoomPortfolio([], [], "/room/");
  const html = cornerTour({
    portfolio,
    email: portfolio.email,
    site: "",
    assetBase: "/room/",
    production: true,
  });
  expect(Object.keys(projectStories)).toHaveLength(3);
  for (const story of Object.values(projectStories)) {
    expect(existsSync(`public${story.image}`)).toBe(true);
    expect(story.problem && story.contribution && story.outcome).toBeTruthy();
  }
  for (let index = 0; index < portfolio.projects.length; index++) {
    expect(html).toContain(`id="project-${index}"`);
  }
  for (const event of Object.keys(resultEvidence)) {
    expect(portfolio.achievements.some((item) => item.event === event)).toBe(
      true,
    );
  }
  expect(html).not.toMatch(/\d+ XP|Legendary|Level \d/);
  expect(html).toContain("public source not yet linked");
  expect(html).toContain("not a live availability update");
  expect(html).toContain("CVE-2025-26909");
  expect(
    portfolio.teams.find((item) => item.name === "Project Sekai")?.link,
  ).toBe("https://ctftime.org/team/169557/");
});
