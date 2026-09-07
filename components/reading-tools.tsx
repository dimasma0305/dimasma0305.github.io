"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getReadingList,
  putReadingList,
  READING_EVENT,
  READING_KEY,
  type ReadingEntry,
} from "@/lib/reading-list";
import { getHeaderOffset, smoothScrollToElement } from "@/lib/scroll-utils";
import "@/lib/library.css";

export function ReadingTools({
  kind,
  slug,
  title,
  revision = "",
}: {
  kind: "post" | "note";
  slug: string;
  title: string;
  revision?: string;
}) {
  const path = `/${kind === "post" ? "posts" : "notes"}/${encodeURIComponent(slug)}/`;
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resume, setResume] = useState<ReadingEntry | null>(null);
  const [status, setStatus] = useState("");
  const latest = useRef({ progress: 0, section: "", sectionTitle: "" });
  useEffect(() => {
    latest.current = { progress: 0, section: "", sectionTitle: "" };
    const existing = getReadingList().find((item) => item.path === path);
    setSaved(!!existing);
    setResume(
      !location.hash &&
        existing &&
        existing.progress > 1 &&
        existing.progress < 98
        ? existing
        : null,
    );
    setReady(true);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const flush = () => {
      clearTimeout(timer);
      const list = getReadingList();
      const previous = list.find((item) => item.path === path);
      // Removing an entry in another tab must never resurrect it on unload.
      if (!previous || latest.current.progress < 1) {
        return;
      }
      putReadingList(
        list.map((item) =>
          item.path === path
            ? {
                ...item,
                ...latest.current,
                title,
                revision,
                updated: Date.now(),
              }
            : item,
        ),
      );
    };
    const progress = (event: Event) => {
      const detail = (event as CustomEvent<typeof latest.current>).detail;
      latest.current = detail;
      clearTimeout(timer);
      timer = setTimeout(flush, 800);
    };
    const sync = () =>
      setSaved(getReadingList().some((item) => item.path === path));
    const storage = (event: StorageEvent) => {
      if (!event.key || event.key === READING_KEY) {
        sync();
      }
    };
    const visibility = () => {
      if (document.hidden) {
        flush();
      }
    };
    document.addEventListener("dimasc:reading-progress", progress);
    document.addEventListener("visibilitychange", visibility);
    addEventListener("pagehide", flush);
    addEventListener(READING_EVENT, sync);
    addEventListener("storage", storage);
    return () => {
      flush();
      document.removeEventListener("dimasc:reading-progress", progress);
      document.removeEventListener("visibilitychange", visibility);
      removeEventListener("pagehide", flush);
      removeEventListener(READING_EVENT, sync);
      removeEventListener("storage", storage);
    };
  }, [path, title, revision]);
  const toggle = () => {
    const list = getReadingList();
    const next = saved
      ? list.filter((item) => item.path !== path)
      : [
          {
            path,
            title,
            kind,
            revision,
            updated: Date.now(),
            ...latest.current,
          },
          ...list,
        ];
    if (!putReadingList(next)) {
      setStatus(
        "Your browser blocked storage. Nothing was saved; you can still bookmark this page in your browser.",
      );
      return;
    }
    setStatus(
      saved
        ? "Removed from this device’s reading list."
        : "Saved on this device. Your reading position will be remembered.",
    );
    if (saved) {
      setResume(null);
    }
    setSaved(!saved);
  };
  const continueReading = async () => {
    const target = resume?.section && document.getElementById(resume.section);
    const id = target ? target.id : "article-body";
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    let ancestor = element.parentElement;
    while (ancestor) {
      if (ancestor instanceof HTMLDetailsElement) {
        ancestor.open = true;
      }
      ancestor = ancestor.parentElement;
    }
    // Removing the resume prompt changes the article's position. Commit that
    // layout change before landing, so the target does not jump under the bar.
    setResume(null);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    history.replaceState(history.state, "", `#${encodeURIComponent(id)}`);
    element.focus({ preventScroll: true });
    await smoothScrollToElement(id, {
      headerOffset: getHeaderOffset() + (innerWidth < 1024 ? 64 : 0),
    });
  };
  return (
    <div className="reading-tools">
      <button
        type="button"
        disabled={!ready}
        aria-pressed={saved}
        onClick={toggle}
      >
        {saved ? "Saved on this device ✓" : "Save for later"}
      </button>
      <Link href="/reading-list/" prefetch={false}>
        Saved reading ↗
      </Link>
      <p role="status">{status}</p>
      {resume && (
        <div className="reading-resume">
          <p>
            You left off at {resume.progress}%
            {resume.sectionTitle ? ` · ${resume.sectionTitle}` : ""}.
            {resume.revision && revision && resume.revision !== revision
              ? " This page has been edited since your last visit."
              : ""}
          </p>
          <button type="button" onClick={() => void continueReading()}>
            Continue reading
          </button>
        </div>
      )}
    </div>
  );
}
