import type { Metadata } from "next";
import type { Post } from "@/lib/posts-client";
import { faqs } from "@/lib/services-data";
import { siteSocial } from "@/lib/social-metadata";
import { readPublicIndex } from "@/lib/content-index.server";
import {
  authorName,
  siteName,
  siteUrls,
  pageMetadata,
  searchDescription,
  contentDate,
  metadataImage,
  serializeJsonLd,
} from "@/lib/site-seo";

const person = {
  "@type": "Person",
  "@id": `${siteUrls.page()}#person`,
  name: authorName,
  url: siteUrls.page(),
  image: "https://avatars.githubusercontent.com/u/92920739",
  jobTitle: "Security Researcher",
  sameAs: [
    "https://github.com/dimasma0305",
    "https://twitter.com/dimasma__",
    "https://linkedin.com/in/solderet",
  ],
};
const website = {
  "@type": "WebSite",
  "@id": `${siteUrls.page()}#website`,
  url: siteUrls.page(),
  name: siteName,
  alternateName: authorName,
  description: siteSocial.description,
  publisher: person,
};

export function StructuredData({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Home", path: "/" }, ...items].map(
          (item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: siteUrls.page(item.path),
          }),
        ),
      }}
    />
  );
}

function postDescription(post: Post) {
  return searchDescription(
    post.excerpt,
    `${post.title}: a cybersecurity write-up by ${authorName}. Read the research, analysis, and lessons learned on ${siteName}.`,
  );
}
function noteDescription(note: { title: string; excerpt?: string }) {
  return searchDescription(
    note.excerpt,
    `${note.title}: technical reference notes from ${authorName}’s notebook. Explore the examples, references, and research context on ${siteName}.`,
  );
}

export function generatePostMetadata({ post }: { post: Post }): Metadata {
  return pageMetadata({
    title: post.title,
    description: postDescription(post),
    path: `/posts/${post.slug}/`,
    image: post.coverImage,
    article: {
      published: post.createdAt,
      modified: post.updatedAt,
      tags: post.categories,
    },
  });
}

export function generateBlogMetadata(): Metadata {
  return pageMetadata({
    title: "Security Research & CTF Writeups",
    path: "/blog/",
    description:
      "Cybersecurity research, CTF writeups, web security analysis, and lessons learned by Dimas Maulana. Browse the latest articles on dimasc.tf.",
  });
}

export function generateNotesMetadata(): Metadata {
  return pageMetadata({
    title: "Technical Notes & Security References",
    path: "/notes/",
    description:
      "Dimas Maulana’s technical notebook: cybersecurity references, programming notes, CTF lessons, and practical research notes, organized by topic.",
  });
}

export async function generateNoteMetadata(slug: string): Promise<Metadata> {
  const note = readPublicIndex("notes").find((entry) => entry.slug === slug);
  if (!note) {
    return pageMetadata({
      title: "Note not found",
      description: "The requested technical note could not be found.",
      path: `/notes/${slug}/`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: note.title,
    description: noteDescription(note),
    path: `/notes/${note.slug}/`,
    image: note.og_image || note.featured_image,
    article: {
      published: note.created_time,
      modified: note.last_edited_time,
      tags: [...new Set([...note.categories, ...note.tags])],
    },
  });
}

export function HomepageStructuredData() {
  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", ...website }} />
      <StructuredData data={{ "@context": "https://schema.org", ...person }} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "@id": `${siteUrls.page()}#profile`,
          url: siteUrls.page(),
          name: `${authorName} — Security Researcher`,
          description: siteSocial.description,
          mainEntity: { "@id": person["@id"] },
          isPartOf: { "@id": website["@id"] },
        }}
      />
    </>
  );
}

export function CollectionStructuredData({
  title,
  path,
  items,
  kind = "CollectionPage",
}: {
  title: string;
  path: string;
  items: { title: string; path: string }[];
  kind?: "CollectionPage" | "Blog";
}) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": kind,
        "@id": `${siteUrls.page(path)}#collection`,
        url: siteUrls.page(path),
        name: title,
        isPartOf: {
          "@type": "WebSite",
          "@id": website["@id"],
          name: siteName,
          url: siteUrls.page(),
        },
        author: person,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.title,
            url: siteUrls.page(item.path),
          })),
        },
      }}
    />
  );
}

export function BlogStructuredData() {
  return (
    <>
      <CollectionStructuredData
        title={`Security Research & CTF Writeups | ${siteName}`}
        path="/blog/"
        kind="Blog"
        items={readPublicIndex("blog").map((post) => ({
          title: post.title,
          path: `/posts/${post.slug}/`,
        }))}
      />
      <BreadcrumbStructuredData items={[{ name: "Blog", path: "/blog/" }]} />
    </>
  );
}

export function NotesStructuredData() {
  return (
    <>
      <CollectionStructuredData
        title={`Technical Notes | ${siteName}`}
        path="/notes/"
        items={readPublicIndex("notes").map((note) => ({
          title: note.title,
          path: `/notes/${note.slug}/`,
        }))}
      />
      <BreadcrumbStructuredData items={[{ name: "Notes", path: "/notes/" }]} />
    </>
  );
}

function ArticleStructuredData({
  title,
  description,
  path,
  image,
  published,
  modified,
  categories,
  blog,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  published: string;
  modified?: string;
  categories: readonly string[];
  blog: boolean;
}) {
  const url = siteUrls.page(path);
  const collection = blog ? "/blog/" : "/notes/";
  const label = blog ? "Blog" : "Notes";
  const cover = metadataImage(image, title);
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": blog ? "BlogPosting" : "Article",
          "@id": `${url}#article`,
          url,
          headline: title,
          description,
          image: {
            "@type": "ImageObject",
            url: cover.url,
            width: cover.width,
            height: cover.height,
            caption: cover.alt,
          },
          datePublished: contentDate(published),
          dateModified: contentDate(modified) || contentDate(published),
          author: person,
          publisher: person,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          isPartOf: { "@id": `${siteUrls.page(collection)}#collection` },
          articleSection: categories[0],
          keywords: categories.join(", "),
          isAccessibleForFree: true,
          // No invented word counts, mixed-language claims, or truncated articleBody.
        }}
      />
      <BreadcrumbStructuredData
        items={[
          { name: label, path: collection },
          { name: title, path },
        ]}
      />
    </>
  );
}

export function PostStructuredData({ post }: { post: Post }) {
  return (
    <ArticleStructuredData
      title={post.title}
      description={postDescription(post)}
      path={`/posts/${post.slug}/`}
      image={post.coverImage}
      published={post.createdAt}
      modified={post.updatedAt}
      categories={post.categories}
      blog
    />
  );
}

export function NoteStructuredData({ slug }: { slug: string }) {
  const note = readPublicIndex("notes").find((entry) => entry.slug === slug);
  if (!note) {
    return null;
  }
  return (
    <ArticleStructuredData
      title={note.title}
      description={noteDescription(note)}
      path={`/notes/${note.slug}/`}
      image={note.og_image || note.featured_image}
      published={note.created_time}
      modified={note.last_edited_time}
      categories={note.categories}
      blog={false}
    />
  );
}

export function ServicesStructuredData() {
  const url = siteUrls.page("/services/");
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": `${url}#service`,
          name: "Source Code Security Review",
          serviceType: "Source code security review",
          url,
          description:
            "AI-assisted source code review with personal triage, program checks, suggested fixes, a PDF and Markdown report, and one free re-test. Scope and price agreed before work begins.",
          provider: person,
          // A starting price, not a fixed-price product or a claim of availability.
          offers: {
            "@type": "Offer",
            url,
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: "99",
              priceCurrency: "USD",
            },
          },
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }}
      />
      <BreadcrumbStructuredData
        items={[{ name: "Services", path: "/services/" }]}
      />
    </>
  );
}
