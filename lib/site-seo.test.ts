import { expect, test } from "bun:test";
import {
  createSiteUrls,
  contentDate,
  searchDescription,
  metadataImage,
  pageMetadata,
  serializeJsonLd,
} from "./site-seo";

test("canonical URLs use the custom domain, trailing slashes, and no filter or fragment", () => {
  const urls = createSiteUrls();
  expect(urls.page()).toBe("https://dimasc.tf/");
  expect(urls.page("/notes/path-traversal#example")).toBe(
    "https://dimasc.tf/notes/path-traversal/",
  );
  expect(urls.page("/blog/?q=hello")).toBe("https://dimasc.tf/blog/");
  expect(urls.page("/categories/css%20leak/")).toBe(
    "https://dimasc.tf/categories/css%20leak/",
  );
});

test("optional base paths and absolute image URLs are not doubled", () => {
  const urls = createSiteUrls("https://example.com/", "/portfolio/");
  expect(urls.page("/notes/")).toBe("https://example.com/portfolio/notes/");
  expect(urls.asset("/cover.jpg")).toBe(
    "https://example.com/portfolio/cover.jpg",
  );
  expect(urls.asset("/portfolio/cover.jpg")).toBe(
    "https://example.com/portfolio/cover.jpg",
  );
  expect(urls.asset("https://images.example.org/cover.jpg")).toBe(
    "https://images.example.org/cover.jpg",
  );
  expect(urls.asset("//images.example.org/cover.jpg")).toBe(
    "https://images.example.org/cover.jpg",
  );
  expect(
    createSiteUrls("https://example.com/portfolio/", "/portfolio").page(),
  ).toBe("https://example.com/portfolio/");
  expect(urls.asset("data:image/png;base64,invalid")).toBe(
    "https://example.com/portfolio/social/room-v1.jpg",
  );
});

test("unknown timestamps are omitted rather than presented as newly updated", () => {
  expect(contentDate()).toBeUndefined();
  expect(contentDate("not a date")).toBeUndefined();
  expect(contentDate("2025-03-05T07:00:00+07:00")).toBe(
    "2025-03-05T00:00:00.000Z",
  );
});

test("descriptions clean markup and use a useful fallback for generated URL dumps", () => {
  const fallback =
    "Programming notes by Dimas Maulana, with references and examples.";
  expect(
    searchDescription("https://example.com/long-reference", fallback),
  ).toBe(fallback);
  expect(
    searchDescription(
      "<p>A **detailed** reference for [programming](https://example.com) and everyday development.</p>",
      fallback,
    ),
  ).toBe("A detailed reference for programming and everyday development.");
  const description = searchDescription(
    "Useful technical reference. ".repeat(20),
    fallback,
  );
  expect(description.length).toBeLessThanOrEqual(160);
  expect(description.endsWith("…")).toBe(true);
});

test("search noindex explicitly overrides both generic and Googlebot directives", () => {
  const metadata = pageMetadata({
    title: "Search",
    description: "Search this website.",
    path: "/search/",
    noIndex: true,
  });
  expect(metadata.robots).toMatchObject({
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  });
  expect(metadata.alternates?.canonical).toBe("https://dimasc.tf/search/");
});

test("article metadata contains no duplicate manually added Open Graph properties", () => {
  const metadata = pageMetadata({
    title: "Example",
    description: "Example description",
    path: "/posts/example/",
    article: { published: "2025-01-01", tags: ["Programming"] },
  });
  expect(metadata.openGraph).toMatchObject({
    type: "article",
    siteName: "dimasc.tf",
    title: "Example | dimasc.tf",
    publishedTime: "2025-01-01T00:00:00.000Z",
  });
  expect(metadata.other).toBeUndefined();
  expect(metadataImage("https://example.com/cover.jpg")).not.toHaveProperty(
    "width",
  );
  expect(metadataImage()).toMatchObject({ width: 1200, height: 630 });
});

test("JSON-LD is parseable and safe to embed as HTML", () => {
  const input = { title: "A <sample> & a closing </script> marker\u2028" };
  const json = serializeJsonLd(input);
  expect(json).not.toContain("<");
  expect(json).not.toContain("&");
  expect(JSON.parse(json)).toEqual(input);
});
