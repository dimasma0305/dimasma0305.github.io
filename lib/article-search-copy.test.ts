import { expect, test } from "bun:test";
import { getArticleSearchCopy } from "./article-search-copy";

test("curated article copy is specific, concise, and keyed to existing slugs", () => {
  const cases = [
    ["wiki-world", "DOM Clobbering"],
    ["x-et-et", "Electron RCE"],
    ["spurdo-enbinling", "WebSocket Game"],
    ["read-the-file-with-lxml-etree-that-vulnerable-to-x", "lxml XXE"],
    ["patchstack-alliance-ctf-s02e01-wordcamp-asia", "WordCamp Asia"],
  ] as const;
  for (const [slug, topic] of cases) {
    const copy = getArticleSearchCopy(slug);
    expect(copy?.title).toContain(topic);
    expect(copy?.description.length).toBeGreaterThan(40);
    expect(copy?.description.length).toBeLessThanOrEqual(160);
  }
  expect(getArticleSearchCopy("another-post")).toBeUndefined();
});
