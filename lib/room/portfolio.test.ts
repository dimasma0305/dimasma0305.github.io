import { expect, test } from "bun:test";
import records from "../portfolio-data.json";
import { assembleRoomPortfolio, writingFromIndex } from "./portfolio";
import { createSceneSummary } from "./content.js";
import { cornerTour } from "./tour.js";
import { roomAsset } from "./assets.js";
import { faqs } from "../services-data";

test("room writing uses the build's published metadata and same-origin subpath links", () => {
  const posts = writingFromIndex(
    {
      posts: {
        all: [
          {
            title: "New post",
            slug: "new post",
            created_time: "2026-09-06",
            properties: { published: true },
          },
          { title: "Draft", slug: "draft", properties: { published: false } },
          {
            title: "Archived",
            slug: "archived",
            archived: true,
            properties: { published: true },
          },
          {
            title: "Old post",
            slug: "old",
            created_time: "2025-01-01",
            properties: { published: true },
          },
        ],
      },
    },
    "posts",
    "/portfolio",
  );
  expect(posts.map((p) => p.title)).toEqual(["New post", "Old post"]);
  expect(posts[0].href).toBe("/portfolio/posts/new%20post/");
  expect(writingFromIndex({}, "notes")).toEqual([]);
});

test("static homepage has all collections, landmarks, local routes and original fragments", () => {
  const p = assembleRoomPortfolio([], [], "/portfolio/room/");
  const html = cornerTour({
    portfolio: p,
    email: p.email,
    site: "/portfolio",
    assetBase: "/portfolio/room/",
    production: true,
  });
  expect((html.match(/<main\b/g) || []).length).toBe(1);
  expect((html.match(/<h1\b/g) || []).length).toBe(1);
  expect((html.match(/data-portfolio-project/g) || []).length).toBe(
    records.projects.length,
  );
  expect((html.match(/data-portfolio-achievement/g) || []).length).toBe(
    records.achievements.length,
  );
  expect((html.match(/data-portfolio-photo /g) || []).length).toBe(
    records.photos.length,
  );
  for (const id of [
    "home",
    "projects",
    "blog",
    "ctf",
    "moments",
    "skills",
    "experience",
    "services",
    "contact",
  ])
    expect(html).toContain(`id="${id}"`);
  for (const route of ["blog", "notes", "tools", "search", "services"])
    expect(html).toContain(`href="/portfolio/${route}/"`);
  expect(html).toContain("/portfolio/room/assets/dimas.jpg");
  expect(html).not.toMatch(
    /<iframe|1pc\.tf|\?concept=|Original room|All concepts/,
  );
  expect(p.services.faqs).toBe(faqs);
  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] || "";
  const primary =
    header.match(/<nav class="tour-site-nav[\s\S]*?<\/nav>/)?.[0] || "";
  expect(header).toContain('aria-label="dimasc.tf — home"');
  expect(header).not.toContain("dimas’ corner");
  expect(header).toContain('aria-label="Room chapters"');
  for (const route of ["blog", "notes", "tools", "services"])
    expect(primary).toContain(`href="/portfolio/${route}/"`);
  expect(primary).not.toContain('href="#');
  expect(header).toContain('href="#services">Review desk</a>');
  const summary = createSceneSummary(p);
  expect(summary.projectCount).toBe(records.projects.length);
  expect(summary.results.items.length).toBe(records.achievements.length);
});

test("portfolio strings are escaped before entering server-rendered markup", () => {
  const p = assembleRoomPortfolio([], [], "/room/");
  p.projects = [{ ...p.projects[0], title: '<b>quoted & "safe"</b>' }];
  const html = cornerTour({
    portfolio: p,
    email: p.email,
    site: "",
    assetBase: "/room/",
    production: true,
  });
  expect(html).toContain("&lt;b&gt;quoted &amp; &quot;safe&quot;&lt;/b&gt;");
  expect(html).not.toContain("<b>quoted");
});

test("HackTheBox is clearly identified as outsourced work in the room and experience entry", () => {
  const p = assembleRoomPortfolio([], [], "/room/");
  const role = p.experience.find((item) => item.company === "HackTheBox");
  expect(role?.title).toBe("Content Creator (Outsourced)");
  expect(role?.type).toBe("Outsourced");
  expect(role?.description).toContain("as an outsourced contributor");
  const sceneRole = createSceneSummary(p).experience.find(
    (item) => item.company === "HackTheBox",
  );
  expect(sceneRole?.title).toBe(role?.title);
  const html = cornerTour({
    portfolio: p,
    email: p.email,
    site: "",
    assetBase: "/room/",
    production: true,
  });
  expect(html).toContain("2025 - Present · Content Creator (Outsourced)");
});

test("room asset joins retain an optional Pages prefix", () => {
  expect(roomAsset("/portfolio/room/", "./assets/test.jpg")).toBe(
    "/portfolio/room/assets/test.jpg",
  );
  expect(roomAsset("./", "assets/test.jpg")).toBe("./assets/test.jpg");
});
