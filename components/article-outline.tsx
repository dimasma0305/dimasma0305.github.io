"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowUp, ChevronDown } from "lucide-react";
import type { ArticleSection } from "@/lib/article-outline";
import { getHeaderOffset, smoothScrollToElement } from "@/lib/scroll-utils";

export function ArticleOutline({ sections }: { sections: ArticleSection[] }) {
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);
  const [interactive, setInteractive] = useState(false);
  const mobile = useRef<HTMLDetailsElement>(null);
  const sectionCount = `${sections.length} ${sections.length === 1 ? "section" : "sections"}`;

  useEffect(() => {
    setInteractive(true);
    const article = document.getElementById("article-body");
    if (!article) {
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = getHeaderOffset() + (innerWidth < 1024 ? 64 : 0);
      const headings = Array.from(
        article.querySelectorAll<HTMLElement>(
          "h2[id], h3[id], h4[id], h5[id], h6[id]",
        ),
      );
      let current = "";
      for (const heading of headings) {
        if (
          heading.getClientRects().length &&
          heading.getBoundingClientRect().top <= offset + 12
        ) {
          current = heading.id;
        }
      }
      setActive(current);
      const bounds = article.getBoundingClientRect();
      const distance = Math.max(1, bounds.height - innerHeight + offset);
      setProgress(
        Math.round(
          Math.max(0, Math.min(1, (offset - bounds.top) / distance)) * 100,
        ),
      );
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(article);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);

  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const target = document.getElementById(id);
    if (!target) {
      return;
    }
    event.preventDefault();
    if (mobile.current) {
      mobile.current.open = false;
    }
    // Reveal a heading inside a native article disclosure before measuring it.
    let ancestor = target.parentElement;
    while (ancestor) {
      if (ancestor instanceof HTMLDetailsElement) {
        ancestor.open = true;
      }
      ancestor = ancestor.parentElement;
    }
    history.pushState(history.state, "", `#${encodeURIComponent(id)}`);
    target.focus({ preventScroll: true });
    void smoothScrollToElement(id, {
      headerOffset: getHeaderOffset() + (innerWidth < 1024 ? 64 : 0),
    });
  };

  const links = () => (
    <ol className="article-outline-list">
      {sections.map((section, index) => {
        const current =
          active === section.id ||
          section.children.some((child) => child.id === active);
        return (
          <li key={section.id} data-current={current || undefined}>
            <a
              href={`#${section.id}`}
              onClick={(event) => jump(event, section.id)}
              aria-current={active === section.id ? "location" : undefined}
            >
              <span className="article-section-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{section.title}</span>
            </a>
            {section.children.length > 0 && (
              <details className="article-subsections">
                <summary>
                  {section.children.length} subsections{" "}
                  <ChevronDown size={13} aria-hidden="true" />
                </summary>
                <ol>
                  {section.children.map((child) => (
                    <li
                      key={child.id}
                      style={{
                        paddingLeft: `${Math.min(2, Math.max(0, child.level - section.level - 1)) * 10}px`,
                      }}
                    >
                      <a
                        href={`#${child.id}`}
                        onClick={(event) => jump(event, child.id)}
                        aria-current={
                          active === child.id ? "location" : undefined
                        }
                      >
                        {child.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </li>
        );
      })}
    </ol>
  );

  if (!sections.length) {
    return null;
  }
  return (
    <aside
      className="article-outline"
      aria-label="Article navigation"
      data-interactive={interactive || undefined}
    >
      <div className="article-outline-desktop">
        <div className="article-outline-heading">
          <h2>On this page</h2>
          <span>{sectionCount}</span>
        </div>
        <div className="article-reading-progress">
          <progress value={progress} max={100} aria-label="Reading progress" />
          <span>{progress}% read</span>
        </div>
        <nav aria-label="Article sections">{links()}</nav>
        <a
          className="article-back-top"
          href="#article-top"
          onClick={(event) => jump(event, "article-top")}
        >
          <ArrowUp size={14} aria-hidden="true" /> Back to top
        </a>
      </div>
      <details
        className="article-outline-mobile"
        ref={mobile}
        onKeyDown={(event) => {
          if (event.key === "Escape" && mobile.current?.open) {
            mobile.current.open = false;
            mobile.current.querySelector("summary")?.focus();
          }
        }}
      >
        <summary>
          <span>
            On this page <small>{sectionCount}</small>
          </span>
          <span>
            {progress}% <ChevronDown size={16} aria-hidden="true" />
          </span>
        </summary>
        <nav aria-label="Article sections">{links()}</nav>
      </details>
    </aside>
  );
}
