export interface ArticleHeading {
  id: string;
  title: string;
  level: number;
}

export interface ArticleSection extends ArticleHeading {
  children: ArticleHeading[];
}

// These are the entities emitted by our Notion renderer, not an HTML sanitizer.
function plainText(html: string): string {
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };
  return html
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
      (match, entity: string) => {
        if (!entity.startsWith("#")) {
          return entities[entity.toLowerCase()] || match;
        }
        const number =
          entity[1].toLowerCase() === "x"
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        return number > 0 && number <= 0x10ffff
          ? String.fromCodePoint(number)
          : match;
      },
    );
}

function attribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Decorate renderer-owned HTML without changing prose, code, or legacy anchors. */
export function prepareArticle(content: string) {
  const headings: ArticleHeading[] = [];
  const pattern = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
  for (const match of content.matchAll(pattern)) {
    const title = plainText(match[3]);
    const existing = match[2].match(/\bid="([^"]*)"/i)?.[1];
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    headings.push({
      id: existing ? plainText(existing) : `${headings.length}-${slug}`,
      title,
      level: Number(match[1]),
    });
  }
  const rootLevel = headings.length
    ? Math.min(...headings.map((h) => h.level))
    : 2;
  const sections: ArticleSection[] = [];
  for (const heading of headings) {
    if (heading.level === rootLevel || !sections.length) {
      sections.push({ ...heading, children: [] });
    } else {
      sections[sections.length - 1].children.push(heading);
    }
  }
  let index = 0;
  let chapter = 0;
  const levels = [...new Set(headings.map((heading) => heading.level))].sort(
    (a, b) => a - b,
  );
  const html = content.replace(pattern, (_match, level, attrs, body) => {
    const heading = headings[index++];
    // One page h1; preserve all relative levels in the article body.
    const tag = Math.min(6, 2 + levels.indexOf(Number(level)));
    const isChapter = heading.level === rootLevel;
    if (isChapter) {
      chapter++;
    }
    const attributes = attrs.replace(/\s+id="[^"]*"/i, "");
    return `<h${tag}${attributes} id="${attribute(heading.id)}" tabindex="-1"${isChapter ? ` data-article-chapter="${String(chapter).padStart(2, "0")}"` : ""}>${body}</h${tag}>`;
  });
  return { html, headings, sections };
}
