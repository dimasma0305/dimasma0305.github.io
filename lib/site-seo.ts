import type { Metadata } from "next";
import { siteSocial } from "./social-metadata";

export const siteName = "dimasc.tf";
export const authorName = "Dimas Maulana";

/** Shared by canonicals, structured data, robots and the sitemap. */
export function createSiteUrls(origin = "https://dimasc.tf", basePath = "") {
  const base = new URL(origin);
  base.search = "";
  base.hash = "";
  const prefix = basePath.replace(/^\/+|\/+$/g, "");
  const root = base.href.replace(/\/+$/, "");
  const baseUrl =
    prefix && !root.endsWith(`/${prefix}`) ? `${root}/${prefix}` : root;
  return {
    baseUrl,
    page(path = "/") {
      const pathname = path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
      return `${baseUrl}/${pathname ? `${pathname}/` : ""}`;
    },
    asset(source?: string | null): string {
      const value = source?.trim() || siteSocial.image;
      if (/^https?:\/\//i.test(value)) {
        return new URL(value).href;
      }
      if (value.startsWith("//")) {
        return new URL(`https:${value}`).href;
      }
      if (/^[a-z][a-z\d+.-]*:/i.test(value)) {
        return `${baseUrl}${siteSocial.image}`;
      }
      const path = `/${value.replace(/^\/+/, "")}`;
      const configuredPath = new URL(baseUrl).pathname.replace(/\/$/, "");
      return configuredPath && path.startsWith(`${configuredPath}/`)
        ? `${new URL(baseUrl).origin}${path}`
        : `${baseUrl}${path}`;
    },
  };
}

export const siteUrls = createSiteUrls(
  process.env.NEXT_PUBLIC_BASE_URL || "https://dimasc.tf",
  process.env.NEXT_PUBLIC_BASE_PATH || "",
);

export function contentDate(value?: string | null): string | undefined {
  if (!value || !Number.isFinite(Date.parse(value))) {
    return undefined;
  }
  return new Date(value).toISOString();
}

/** Descriptions summarize existing text; URL/code dumps use a truthful fallback. */
export function searchDescription(
  text: string | undefined,
  fallback: string,
): string {
  const clean = (text || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_`]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&(?:nbsp|lt|gt|quot);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const result =
    clean.length >= 40 && !/^https?:\/\//i.test(text || "") ? clean : fallback;
  if (result.length <= 160) {
    return result;
  }
  const clipped = result.slice(0, 157);
  const boundary = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, boundary > 110 ? boundary : clipped.length).trimEnd()}…`;
}

export function metadataImage(source?: string | null, alt?: string) {
  const url = siteUrls.asset(source);
  return url === siteUrls.asset(siteSocial.image)
    ? {
        url,
        width: siteSocial.width,
        height: siteSocial.height,
        alt: siteSocial.imageAlt,
        type: "image/jpeg",
      }
    : { url, alt: alt || siteName };
}

type PageOptions = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
  article?: { published?: string; modified?: string; tags?: readonly string[] };
};

export function pageMetadata(options: PageOptions): Metadata {
  const { title, description, path, article, noIndex = false } = options;
  const url = siteUrls.page(path);
  const brandedTitle = `${title} | ${siteName}`;
  return {
    title,
    description,
    authors: [{ name: authorName, url: siteUrls.page() }],
    alternates: {
      canonical: url,
      types: { "application/rss+xml": siteUrls.asset("/rss.xml") },
    },
    openGraph: {
      type: article ? "article" : "website",
      siteName,
      locale: "en_US",
      title: brandedTitle,
      description,
      url,
      images: [metadataImage(options.image, title)],
      ...(article
        ? {
            publishedTime: contentDate(article.published),
            modifiedTime:
              contentDate(article.modified) || contentDate(article.published),
            authors: [siteUrls.page()],
            tags: [...(article.tags || [])],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      creator: "@dimasma__",
      title: brandedTitle,
      description,
      images: [metadataImage(options.image, title)],
    },
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
