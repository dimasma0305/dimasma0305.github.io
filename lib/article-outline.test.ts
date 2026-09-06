import { describe, expect, test } from "bun:test";
import { prepareArticle } from "./article-outline";

describe("article reading structure", () => {
  test("keeps legacy anchors and groups every subsection under its chapter", () => {
    const result = prepareArticle(
      "<h1>First chapter</h1><h2>Details</h2><h3>Nested</h3><h1>Second chapter</h1><h2>Details</h2>",
    );
    expect(result.headings.map((heading) => heading.id)).toEqual([
      "0-first-chapter",
      "1-details",
      "2-nested",
      "3-second-chapter",
      "4-details",
    ]);
    expect(result.sections.map((section) => section.children.length)).toEqual([
      2, 1,
    ]);
    expect(result.html).not.toContain("<h1");
    expect(result.html).toContain('data-article-chapter="02"');
    expect(result.html).toContain(
      '<h4 id="2-nested" tabindex="-1">Nested</h4>',
    );
  });
  test("preserves authored IDs, inline heading markup, paragraphs and code exactly", () => {
    const code =
      '<pre><code class="language-text">&lt;h1&gt;not a heading&lt;/h1&gt;\n  a &amp; b</code></pre>';
    const paragraph = "<p>A paragraph with <strong>formatting</strong>.</p>";
    const result = prepareArticle(
      `<h2 id="existing">A &amp; B <em>notes</em></h2>${paragraph}${code}`,
    );
    expect(result.headings).toEqual([
      { id: "existing", title: "A & B notes", level: 2 },
    ]);
    expect(result.html).toContain(paragraph + code);
    expect(result.html).toContain('id="existing"');
    expect(result.html).toContain("A &amp; B <em>notes</em>");
  });
  test("decodes text once without turning escaped text into markup", () => {
    const result = prepareArticle(
      "<h2>&lt;tag&gt; &quot;test&quot; &#39;x&#39; &#x1F4D6; &amp;lt;</h2>",
    );
    expect(result.headings[0].title).toBe("<tag> \"test\" 'x' 📖 &lt;");
    expect(result.html).not.toContain("<tag>");
  });
  test("handles an article without headings", () => {
    expect(prepareArticle("<p>Short note.</p>")).toEqual({
      html: "<p>Short note.</p>",
      headings: [],
      sections: [],
    });
  });
  test("normalizes sparse source headings beneath the page title", () => {
    const result = prepareArticle("<h3>Reference</h3><h5>Details</h5>");
    expect(result.html).toContain('<h2 id="0-reference"');
    expect(result.html).toContain('<h3 id="1-details"');
    expect(result.headings.map((heading) => heading.id)).toEqual([
      "0-reference",
      "1-details",
    ]);
  });
});
