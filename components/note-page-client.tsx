"use client";

import "@/app/content.css";
import "@/lib/blog.css";
import "@/lib/article.css";
import "@/lib/notes-reading.css";
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUpRight,
  Clock,
  NotebookPen,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { withBasePath } from "@/lib/utils";
import { getHeaderOffset, handleHashOnPageLoad } from "@/lib/scroll-utils";
import {
  convertNotionContentToHtml,
  type NotionBlock,
} from "@/lib/notion-content-utils";
import { fetchNoteBySlug, type Note as NoteMetadata } from "@/lib/notes-client";
import { formatBlogDate } from "@/lib/blog-archive";
import { prepareArticle } from "@/lib/article-outline";
import { ArticleOutline } from "@/components/article-outline";
import { ArticleImageViewer } from "@/components/article-image-viewer";
import { ReadingTools } from "@/components/reading-tools";
import { NoteReview } from "@/components/note-review";
import { LoadingSpinner } from "@/components/loading-spinner";

const Mdx = dynamic(() => import("@/components/mdx").then((m) => m.Mdx));
const ShareButtons = lazy(() =>
  import("@/components/share-buttons").then((m) => ({
    default: m.ShareButtons,
  })),
);
const NoteNavigation = lazy(() =>
  import("@/components/note-navigation").then((m) => ({
    default: m.NoteNavigation,
  })),
);
type Note = Omit<NoteMetadata, "content"> & { content?: string };
type NoteFile = {
  post: Pick<
    Note,
    "title" | "created_time" | "last_edited_time" | "url" | "public_url"
  > & { content: NotionBlock[] };
};

export default function NotePageClient({
  slug,
  initialNote,
}: {
  slug: string;
  initialNote?: Note;
}) {
  const [note, setNote] = useState<Note | null>(initialNote ?? null);
  const [loading, setLoading] = useState(!initialNote);
  const [error, setError] = useState("");
  const [coverError, setCoverError] = useState(false);
  const article = useMemo(
    () => prepareArticle(note?.content || ""),
    [note?.content],
  );

  useEffect(() => {
    if (initialNote) {
      return;
    }
    const controller = new AbortController();
    async function load() {
      try {
        const info = await fetchNoteBySlug(slug);
        if (!info) {
          throw new Error("The requested note could not be found.");
        }
        const response = await fetch(
          withBasePath(`/notes/${info.folder}/post.json`),
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("The note could not be loaded. Please try again.");
        }
        const data: NoteFile = await response.json();
        const content = await convertNotionContentToHtml(data.post.content);
        if (!controller.signal.aborted) {
          setNote({
            ...info,
            title: data.post.title || info.title,
            created_time: data.post.created_time || info.created_time,
            last_edited_time:
              data.post.last_edited_time || info.last_edited_time,
            url: data.post.url || info.url,
            public_url: data.post.public_url || info.public_url,
            content,
          });
        }
      } catch (failure) {
        if (!controller.signal.aborted) {
          setError(
            failure instanceof Error
              ? failure.message
              : "The note could not be loaded.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [slug, initialNote]);

  useEffect(() => {
    if (!loading && note) {
      handleHashOnPageLoad({
        behavior: "smooth",
        lazyLoadDelay: 250,
        headerOffset: getHeaderOffset() + (window.innerWidth < 1024 ? 64 : 0),
      });
    }
  }, [loading, note]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (error || !note) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl">Note not found</h1>
        <p className="mt-4">
          {error || "The requested note could not be found."}
        </p>
        <Link className="blog-return-link" href="/notes/" prefetch={false}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to all notes
        </Link>
      </div>
    );
  }
  const minutes =
    note.reading_time ||
    Math.max(
      1,
      Math.ceil(
        (note.content || "").replace(/<[^>]*>/g, "").split(/\s+/).length / 200,
      ),
    );
  const topics = [...new Set(note.categories || [])];

  return (
    <div className="reading-page blog-reading notes-reading">
      <header id="article-top" tabIndex={-1} className="reading-hero">
        <div className="container">
          <Link className="blog-return-link" href="/notes/" prefetch={false}>
            <ArrowLeft size={15} aria-hidden="true" />
            Back to all notes
          </Link>
          <div
            className={
              note.featured_image && !coverError
                ? "blog-reading-intro"
                : "blog-reading-intro blog-reading-intro-text"
            }
          >
            <div>
              <p className="note-kind">
                <NotebookPen size={15} aria-hidden="true" />
                From the notebook
              </p>
              <h1>{note.title}</h1>
              <ReadingTools
                kind="note"
                slug={note.slug}
                title={note.title}
                revision={note.last_edited_time}
              />
              <NoteReview slug={note.slug} />
              <div className="blog-reading-meta">
                <span>
                  <Clock size={14} aria-hidden="true" />
                  {minutes} min read
                </span>
                <time dateTime={note.created_time}>
                  Created {formatBlogDate(note.created_time)}
                </time>
                {note.last_edited_time &&
                  formatBlogDate(note.last_edited_time) !==
                    formatBlogDate(note.created_time) && (
                    <time dateTime={note.last_edited_time}>
                      Updated {formatBlogDate(note.last_edited_time)}
                    </time>
                  )}
              </div>
              {topics.length > 0 && (
                <div className="blog-reading-topics note-topics">
                  {topics.map((topic) => (
                    <Link
                      key={topic}
                      href={`/notes/?topic=${encodeURIComponent(topic)}`}
                      prefetch={false}
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              )}
              <div className="blog-reading-actions">
                <a href="#article-body">
                  Read the note <ArrowDown size={15} aria-hidden="true" />
                </a>
                {note.public_url && (
                  <a
                    href={note.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Original on Notion{" "}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
            {note.featured_image && !coverError && (
              <div className="blog-reading-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={note.featured_image}
                  alt=""
                  loading="lazy"
                  onError={() => setCoverError(true)}
                />
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="container blog-reading-content">
        <div className="reading-layout">
          <ArticleOutline sections={article.sections} />
          <div className="reading-column">
            <article
              id="article-body"
              tabIndex={-1}
              className="reading-body"
              aria-label={note.title}
            >
              {note.content ? (
                <Mdx content={article.html} readingTools />
              ) : (
                <p>No content is available for this note yet.</p>
              )}
            </article>
            <ArticleImageViewer />
            <footer className="blog-article-footer note-footer">
              <div className="blog-article-share">
                <h2>Share this note</h2>
                <Suspense fallback={null}>
                  <ShareButtons
                    title={note.title}
                    slug={note.slug}
                    excerpt={note.excerpt}
                    categories={topics}
                    type="notes"
                  />
                </Suspense>
              </div>
              {note.tags?.length > 0 && (
                <nav className="note-tags" aria-label="Related note tags">
                  {[...new Set(note.tags)].map((tag) => (
                    <Link
                      key={tag}
                      href={`/notes/?q=${encodeURIComponent(tag)}`}
                      prefetch={false}
                    >
                      #{tag}
                    </Link>
                  ))}
                </nav>
              )}
              <Suspense fallback={null}>
                <NoteNavigation currentSlug={slug} />
              </Suspense>
              <Link
                className="blog-return-link"
                href="/notes/"
                prefetch={false}
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Back to all notes
              </Link>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
