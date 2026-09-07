"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  findEntries,
  searchFilter,
  searchKinds,
  type SearchEntry,
  type SearchFilter,
} from "@/lib/site-search";
import "@/lib/library.css";
const labels = {
  all: "Everything",
  project: "Projects",
  post: "Blog posts",
  note: "Notes",
};
export function SiteSearch({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchFilter>("all");
  const [limit, setLimit] = useState(18);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(location.search);
      setQuery((params.get("q") || "").slice(0, 200));
      setKind(searchFilter(params.get("type")));
      setLimit(18);
    };
    restore();
    setReady(true);
    addEventListener("popstate", restore);
    return () => removeEventListener("popstate", restore);
  }, []);
  const results = useMemo(
    () => findEntries(entries, query, kind),
    [entries, query, kind],
  );
  const change = (q: string, filter: SearchFilter) => {
    setQuery(q);
    setKind(filter);
    setLimit(18);
    const url = new URL(location.href);
    q ? url.searchParams.set("q", q) : url.searchParams.delete("q");
    filter !== "all"
      ? url.searchParams.set("type", filter)
      : url.searchParams.delete("type");
    history.replaceState(history.state, "", url);
  };
  return (
    <div className="library-page container">
      <header className="library-heading">
        <p className="library-eyebrow">ONE LIBRARY / MANY THREADS</p>
        <h1>Find your next rabbit hole.</h1>
        <p>
          Projects, research writeups, and field notes. Search titles,
          summaries, and topics.
        </p>
        <Link href="/reading-list/" prefetch={false}>
          Your saved reading ↗
        </Link>
      </header>
      <form
        className="library-search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="site-query">Search the whole site</label>
        <div>
          <input
            id="site-query"
            type="search"
            value={query}
            maxLength={200}
            onChange={(event) => change(event.target.value, kind)}
            placeholder="Try WordPress, CTFify, or forensics…"
            disabled={!ready}
            autoComplete="off"
            aria-describedby="site-search-count"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                change("", kind);
                document.getElementById("site-query")?.focus();
              }}
            >
              Clear search
            </button>
          )}
        </div>
        <fieldset>
          <legend>Content type</legend>
          <div className="library-filters">
            {searchKinds.map((type) => (
              <button
                type="button"
                key={type}
                disabled={!ready}
                aria-pressed={kind === type}
                onClick={() => change(query, type)}
              >
                {labels[type]}{" "}
                <span>
                  {type === "all"
                    ? entries.length
                    : entries.filter((entry) => entry.kind === type).length}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </form>
      <noscript>
        <p>
          Filtering needs JavaScript. You can still browse these links or visit
          the <Link href="/blog/">Blog</Link>, <Link href="/notes/">Notes</Link>
          , and <Link href="/#work">Projects</Link> directories.
        </p>
      </noscript>
      <p id="site-search-count" className="library-count" role="status">
        {results.length} {results.length === 1 ? "result" : "results"}
        {query ? ` for “${query}”` : " to explore"}
      </p>
      {results.length ? (
        <ul className="library-results">
          {results.slice(0, limit).map((entry) => (
            <li key={entry.id}>
              <Link href={entry.href} prefetch={false}>
                <span className="library-eyebrow">{labels[entry.kind]}</span>
                <h2>{entry.title}</h2>
                <p>{entry.description}</p>
                <span className="library-result-action">
                  {entry.kind === "project"
                    ? "Explore the project"
                    : "Start reading"}{" "}
                  ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="library-empty">
          <h2>No matches yet.</h2>
          <p>Try fewer words or switch to Everything.</p>
          <button type="button" onClick={() => change("", "all")}>
            Reset search
          </button>
        </div>
      )}
      {results.length > limit && (
        <button
          className="library-more"
          type="button"
          disabled={!ready}
          onClick={() => setLimit((value) => value + 18)}
        >
          Show more results ({results.length - limit} remaining)
        </button>
      )}
    </div>
  );
}
