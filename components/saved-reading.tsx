"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getReadingList,
  putReadingList,
  READING_EVENT,
  type ReadingEntry,
} from "@/lib/reading-list";
import "@/lib/library.css";
export function SavedReading() {
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const refresh = () => setEntries(getReadingList());
    refresh();
    setReady(true);
    addEventListener(READING_EVENT, refresh);
    addEventListener("storage", refresh);
    return () => {
      removeEventListener(READING_EVENT, refresh);
      removeEventListener("storage", refresh);
    };
  }, []);
  const remove = (path: string) => {
    const item = entries.find((entry) => entry.path === path);
    setStatus(
      putReadingList(getReadingList().filter((entry) => entry.path !== path))
        ? `Removed ${item?.title || "article"}.`
        : "Your browser blocked changes to storage.",
    );
    requestAnimationFrame(() =>
      document.getElementById("saved-title")?.focus({ preventScroll: true }),
    );
  };
  const clear = () => {
    if (!putReadingList([])) {
      setStatus("Your browser blocked changes to storage.");
      return;
    }
    setStatus("All saved reading cleared on this device.");
    requestAnimationFrame(() =>
      document.getElementById("saved-title")?.focus({ preventScroll: true }),
    );
  };
  return (
    <div className="library-page container">
      <header className="library-heading">
        <p className="library-eyebrow">YOUR PLACE IN THE NOTEBOOK</p>
        <h1 id="saved-title" tabIndex={-1}>
          Saved reading.
        </h1>
        <p>
          Bookmarks and reading positions stay on this browser. No account,
          syncing, or automatic jumps.
        </p>
        <Link href="/search/" prefetch={false}>
          Find something to read ↗
        </Link>
      </header>
      <p role="status">{status}</p>
      {!ready ? (
        <p>Saved reading needs JavaScript and browser storage.</p>
      ) : entries.length ? (
        <ul className="library-results">
          {entries.map((entry) => (
            <li key={entry.path}>
              <article className="saved-entry">
                <span className="library-eyebrow">
                  {entry.kind === "post" ? "Blog post" : "Field note"} ·{" "}
                  {entry.progress}% read
                </span>
                <h2>
                  <Link href={entry.path} prefetch={false}>
                    {entry.title}
                  </Link>
                </h2>
                <p>{entry.sectionTitle || "Ready when you are."}</p>
                <Link
                  href={`${entry.path}${entry.section && entry.progress < 98 ? `#${encodeURIComponent(entry.section)}` : ""}`}
                  prefetch={false}
                >
                  {entry.progress > 1 && entry.progress < 98
                    ? "Continue reading"
                    : "Open article"}{" "}
                  ↗
                </Link>
                <div>
                  <button
                    type="button"
                    onClick={() => remove(entry.path)}
                    aria-label={`Remove ${entry.title} from saved reading`}
                  >
                    Remove
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="library-empty">
          <h2>A space for your next read.</h2>
          <p>
            Use “Save for later” on any post or note. It will appear here with
            your reading position.
          </p>
          <Link href="/search/" prefetch={false}>
            Browse the library ↗
          </Link>
        </div>
      )}
      <details className="library-settings">
        <summary>Manage local reading data</summary>
        <p>
          Up to 50 items are kept on this device. Clearing browser data removes
          them. Removing an entry also removes its saved position.
        </p>
        <button type="button" disabled={!entries.length} onClick={clear}>
          Clear all saved reading
        </button>
      </details>
    </div>
  );
}
