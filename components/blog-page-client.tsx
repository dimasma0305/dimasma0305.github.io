"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Rss,
  Search,
  X,
} from "lucide-react";
import { FallbackImage } from "@/components/fallback-image";
import { withBasePath } from "@/lib/utils";
import {
  blogFilterQuery,
  blogTopics,
  defaultBlogFilters,
  filterBlogEntries,
  formatBlogDate,
  readBlogFilters,
  type BlogEntry,
  type BlogFilters,
} from "@/lib/blog-archive";
import "@/lib/blog.css";

function EntryMeta({ entry }: { entry: BlogEntry }) {
  return (
    <div className="blog-entry-meta">
      <time dateTime={entry.date || undefined}>
        {formatBlogDate(entry.date)}
      </time>
      {entry.minutes && (
        <span>
          <Clock3 size={13} aria-hidden="true" />
          {entry.minutes} min read
        </span>
      )}
    </div>
  );
}

function EntryCover({
  entry,
  priority = false,
}: {
  entry: BlogEntry;
  priority?: boolean;
}) {
  return (
    <div className="post-cover blog-entry-cover" aria-hidden="true">
      {entry.cover ? (
        <FallbackImage
          src={withBasePath(entry.cover)}
          alt=""
          fill
          priority={priority}
          className="object-contain"
        />
      ) : (
        <BookOpen size={36} strokeWidth={1} />
      )}
    </div>
  );
}

export default function BlogPageClient({ entries }: { entries: BlogEntry[] }) {
  const [filters, setFilters] = useState<BlogFilters>(defaultBlogFilters);
  const [interactive, setInteractive] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const topics = useMemo(() => blogTopics(entries), [entries]);
  const results = useMemo(
    () => filterBlogEntries(entries, filters),
    [entries, filters],
  );
  const filtering = Boolean(
    filters.query.trim() || filters.topic || filters.sort !== "newest",
  );
  const featured = !filtering ? results[0] : undefined;
  const archive = featured ? results.slice(1) : results;

  useEffect(() => {
    const restore = () => {
      setFilters(readBlogFilters(location.search));
      try {
        sessionStorage.setItem("blog:filters", location.search);
      } catch {
        /* Optional. */
      }
    };
    restore();
    setInteractive(true);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const update = (next: BlogFilters) => {
    setFilters(next);
    const query = blogFilterQuery(next);
    // Replacing the current entry avoids one Back press per typed character.
    window.history.replaceState(
      window.history.state,
      "",
      `${location.pathname}${query}${location.hash}`,
    );
    try {
      sessionStorage.setItem("blog:filters", query);
    } catch {
      /* Optional. */
    }
  };

  const clear = () => {
    update(defaultBlogFilters);
    searchRef.current?.focus();
  };

  return (
    <div className="blog-page container">
      <header className="blog-heading">
        <div>
          <p className="blog-eyebrow">01 / The reading desk</p>
          <h1>
            Blog<span>.</span>
          </h1>
          <p>
            Security research, CTF writeups, and things I’ve learned along the
            way.
          </p>
        </div>
        <div className="blog-heading-links">
          <Link href="/notes/" prefetch={false}>
            Quick notes <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <a href={withBasePath("/rss.xml")}>
            <Rss size={14} aria-hidden="true" /> RSS feed
          </a>
        </div>
      </header>

      <section className="blog-browser" aria-label="Find an article">
        <div className="blog-toolbar">
          <div className="blog-search-field">
            <label htmlFor="blog-search">Search the archive</label>
            <div className="blog-search-input">
              <Search size={18} aria-hidden="true" />
              <input
                id="blog-search"
                ref={searchRef}
                type="search"
                placeholder="Search posts..."
                maxLength={200}
                value={filters.query}
                disabled={!interactive}
                onChange={(event) =>
                  update({ ...filters, query: event.target.value })
                }
                onKeyDown={(event) => {
                  if (event.key === "Escape" && filters.query) {
                    event.preventDefault();
                    update({ ...filters, query: "" });
                  }
                }}
              />
              {filters.query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    update({ ...filters, query: "" });
                    searchRef.current?.focus();
                  }}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="blog-topic">Topic</label>
            <select
              id="blog-topic"
              value={filters.topic}
              disabled={!interactive}
              onChange={(event) =>
                update({ ...filters, topic: event.target.value })
              }
            >
              <option value="">All topics</option>
              {filters.topic &&
                !topics.some((topic) => topic.name === filters.topic) && (
                  <option value={filters.topic}>{filters.topic}</option>
                )}
              {topics.map((topic) => (
                <option key={topic.name} value={topic.name}>
                  {topic.name} ({topic.count})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="blog-sort">Sort by</label>
            <select
              id="blog-sort"
              value={filters.sort}
              disabled={!interactive}
              onChange={(event) =>
                update({
                  ...filters,
                  sort: event.target.value as BlogFilters["sort"],
                })
              }
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="shortest">Shortest read</option>
            </select>
          </div>
        </div>
        <div className="blog-results-summary">
          <p role="status" aria-live="polite" aria-atomic="true">
            <strong>{results.length}</strong>{" "}
            {filtering ? "matching" : "published"}{" "}
            {results.length === 1 ? "article" : "articles"}
            {filters.topic ? ` in ${filters.topic}` : ""}
            {filters.query.trim() ? ` for “${filters.query.trim()}”` : ""}
          </p>
          {filtering ? (
            <button type="button" onClick={clear}>
              Reset filters <X size={13} aria-hidden="true" />
            </button>
          ) : (
            <a href="#writing">
              Browse the archive <ArrowDown size={13} aria-hidden="true" />
            </a>
          )}
        </div>
        <noscript>
          <p className="blog-no-js">
            All articles are listed below. Enable JavaScript to search or filter
            them.
          </p>
        </noscript>
      </section>

      {featured && (
        <article className="blog-feature post-card">
          <div className="blog-feature-copy">
            <p className="blog-eyebrow">Latest from the desk</p>
            <h2 className="post-card-title">
              <Link href={`/posts/${featured.slug}/`} prefetch={false}>
                {featured.title}
              </Link>
            </h2>
            <p className="blog-feature-excerpt">{featured.excerpt}</p>
            <EntryMeta entry={featured} />
            <span className="blog-feature-cta" aria-hidden="true">
              Read the story <ArrowUpRight size={19} />
            </span>
          </div>
          <EntryCover entry={featured} priority />
        </article>
      )}

      <section
        id="writing"
        className="blog-archive"
        aria-labelledby="blog-archive-title"
      >
        <div className="blog-archive-heading">
          <h2 id="blog-archive-title">
            {filtering
              ? "Search the shelves"
              : featured
                ? "More from the archive"
                : "The archive"}
          </h2>
          <span>
            {archive.length} {archive.length === 1 ? "article" : "articles"}
          </span>
        </div>
        {archive.length ? (
          <div className="blog-entry-list">
            {archive.map((entry) => (
              <article key={entry.id} className="blog-entry post-card">
                <div className="blog-entry-copy">
                  <EntryMeta entry={entry} />
                  <h3 className="post-card-title">
                    <Link href={`/posts/${entry.slug}/`} prefetch={false}>
                      {entry.title}
                    </Link>
                  </h3>
                  <p className="blog-entry-excerpt">{entry.excerpt}</p>
                  <div className="blog-entry-topics">
                    {entry.topics.map((topic) => (
                      <Link
                        key={topic}
                        href={`/blog/?topic=${encodeURIComponent(topic)}`}
                        prefetch={false}
                        onClick={(event) => {
                          if (
                            !event.metaKey &&
                            !event.ctrlKey &&
                            !event.shiftKey &&
                            !event.altKey &&
                            event.button === 0
                          ) {
                            event.preventDefault();
                        update({ ...filters, topic });
                        searchRef.current?.focus();
                          }
                        }}
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>
                <EntryCover entry={entry} />
              </article>
            ))}
          </div>
        ) : filtering ? (
          <div className="blog-empty">
            <Search size={28} aria-hidden="true" />
            <h3>No articles on this shelf yet.</h3>
            <p>Try a broader search or a different topic.</p>
            <button type="button" onClick={clear}>
              Clear filters and browse all articles
            </button>
          </div>
        ) : !featured ? (
          <p className="blog-empty">
            New writing will appear here as it’s published.
          </p>
        ) : (
          <p className="blog-empty">You’re all caught up. More writing soon.</p>
        )}
      </section>

      <div className="blog-endnote">
        <BookOpen size={22} strokeWidth={1.4} aria-hidden="true" />
        <div>
          <h2>Looking for something shorter?</h2>
          <p>
            My notebook is where quick references and works in progress live.
          </p>
        </div>
        <Link href="/notes/" prefetch={false}>
          Open the notebook <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
