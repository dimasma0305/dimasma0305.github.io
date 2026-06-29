"use client";

import { withBasePath } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { initializeLazyLoadingTimer, HEADER_OFFSET } from "@/lib/scroll-utils";

// Prism theme only (CSS is tiny — keep it eager so highlighted code is styled
// the moment it paints). Prism core + the 20 language grammars are heavy, so we
// load them LAZILY (off the initial post-route bundle) the first time a post
// needs highlighting. Cached so the import happens once per session.
import "prismjs/themes/prism-tomorrow.css";

let prismPromise: Promise<any> | null = null;
function loadPrism(): Promise<any> {
  if (!prismPromise) {
    prismPromise = (async () => {
      const mod: any = await import("prismjs");
      const Prism = mod.default ?? mod;
      // Grammars register onto the Prism singleton as a side effect of import,
      // and several require another grammar to already be present (e.g. js needs
      // clike, ts needs js). So load them in dependency TIERS — every grammar in
      // a tier fetches in parallel (Promise.all), and tiers run in order. This
      // turns the old 22-request waterfall (color appeared seconds late) into
      // three concurrent batches.
      await Promise.all([
        import("prismjs/components/prism-markup"),
        import("prismjs/components/prism-css"),
        import("prismjs/components/prism-clike"),
        import("prismjs/components/prism-python"),
        import("prismjs/components/prism-bash"),
        import("prismjs/components/prism-json"),
        import("prismjs/components/prism-yaml"),
        import("prismjs/components/prism-sql"),
        import("prismjs/components/prism-rust"),
        import("prismjs/components/prism-perl"),
        import("prismjs/components/prism-diff"),
        import("prismjs/components/prism-docker"),
      ]);
      // Tier 2 — depend on markup / clike from tier 1.
      await Promise.all([
        import("prismjs/components/prism-javascript"), // clike
        import("prismjs/components/prism-markdown"), // markup
        import("prismjs/components/prism-java"), // clike
        import("prismjs/components/prism-c"), // clike
        import("prismjs/components/prism-go"), // clike
        import("prismjs/components/prism-ruby"), // clike
        import("prismjs/components/prism-markup-templating"), // markup
      ]);
      // Tier 3 — depend on tier 2.
      await Promise.all([
        import("prismjs/components/prism-typescript"), // javascript
        import("prismjs/components/prism-cpp"), // c
        import("prismjs/components/prism-php"), // markup-templating + clike
      ]);
      return Prism;
    })();
  }
  return prismPromise;
}

interface MdxProps {
  content: string;
}

export function Mdx({ content }: MdxProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    // Initialize the lazy loading timer for scroll utilities
    initializeLazyLoadingTimer(250);

    // React owns this element's children via dangerouslySetInnerHTML and re-applies
    // the (identical) innerHTML on some re-renders — observed ~0.7-0.85s after mount
    // — which wipes every decoration and syntax-highlight token span we add. A fixed
    // delay can't win that race reliably (that was the "color sometimes doesn't load"
    // bug). So we decorate now AND re-decorate whenever React replaces the content.
    // decorate() is idempotent — every mutation is guarded by an `.enhanced` class or
    // an existing id — so re-running only does work after a real reset and never
    // loops on our own descendant edits.
    let cancelled = false;
    let rescheduling = false;

    const decorate = () => {
      if (cancelled) return;
      // Code blocks to syntax-highlight — collected here, highlighted in idle slices below.
      const pendingHighlights: { code: Element; lang: string }[] = [];

      // Enhanced image handling with staged lazy loading (viewport first, then the rest)
      const images = root.querySelectorAll("img");
      type LazyEntry = {
        wrapper: HTMLDivElement;
        newImg: HTMLImageElement;
        placeholder: HTMLDivElement;
        originalSrc: string;
        loaded: boolean;
      };
      const lazyEntries: LazyEntry[] = [];

      images.forEach((img) => {
        if (img.hasAttribute("data-lazy-processed")) return;
        img.setAttribute("data-lazy-processed", "true");

        const originalSrc = img.src;
        const originalAlt = img.alt || "Image";

        const wrapper = document.createElement("div") as HTMLDivElement;
        wrapper.className = "lazy-image-wrapper relative overflow-hidden";
        wrapper.style.minHeight = "200px";

        const placeholder = document.createElement("div") as HTMLDivElement;
        placeholder.className = "absolute inset-0 bg-muted animate-pulse";
        placeholder.setAttribute("aria-hidden", "true");

        const newImg = document.createElement("img") as HTMLImageElement;
        newImg.alt = originalAlt;
        newImg.className =
          img.className + " transition-opacity duration-300 opacity-0";

        if (!newImg.classList.contains("enhanced")) {
          newImg.classList.add(
            "enhanced",
            "rounded-xl",
            "shadow-lg",
            "my-8",
            "border",
            "transition-transform",
            "hover:scale-[1.02]",
            "cursor-zoom-in",
          );
        }

        const entry: LazyEntry = {
          wrapper,
          newImg,
          placeholder,
          originalSrc,
          loaded: false,
        };

        newImg.onload = () => {
          newImg.classList.remove("opacity-0");
          newImg.classList.add("opacity-100");
          placeholder.remove();
          entry.loaded = true;
        };
        newImg.onerror = () => {
          newImg.src = withBasePath(
            "/placeholder.svg?height=400&width=600&text=Image%20Not%20Found",
          );
        };

        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(placeholder);
        wrapper.appendChild(newImg);
        img.remove();

        lazyEntries.push(entry);
      });

      const loadImage = (entry: LazyEntry) => {
        if (!entry.newImg.src) {
          entry.newImg.src = entry.originalSrc;
        }
      };

      const waitForLoad = (entry: LazyEntry) =>
        new Promise<void>((resolve) => {
          if (entry.loaded) return resolve();
          const done = () => {
            entry.newImg.removeEventListener("load", done);
            entry.newImg.removeEventListener("error", done);
            resolve();
          };
          entry.newImg.addEventListener("load", done, { once: true });
          entry.newImg.addEventListener("error", done, { once: true });
        });

      if (lazyEntries.length > 0) {
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight;
        let visible = lazyEntries.filter((e) => {
          const rect = e.wrapper.getBoundingClientRect();
          return rect.top < viewportHeight && rect.bottom > 0;
        });

        if (visible.length === 0) {
          visible = [lazyEntries[0]];
        }

        // Start loading visible images first
        const visiblePromises = visible.map((e) => {
          loadImage(e);
          return waitForLoad(e);
        });

        const timeout = new Promise<void>((resolve) =>
          setTimeout(resolve, 1200),
        );
        Promise.race([
          Promise.allSettled(visiblePromises).then(() => undefined),
          timeout,
        ]).then(() => {
          // Then load all remaining images in the background
          lazyEntries.forEach((e) => {
            if (!visible.includes(e)) {
              loadImage(e);
            }
          });
        });
      }

      // Enhanced heading styling and ID generation
      const headings = root.querySelectorAll(
        "h1, h2, h3, h4, h5, h6",
      );
      headings.forEach((heading, index) => {
        // Type guard to ensure heading is HTMLElement
        if (!(heading instanceof HTMLElement)) return;

        if (!heading.id) {
          const text = heading.textContent || "";
          const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();

          heading.id = `${index}-${slug}`;
        }

        // Enhanced heading styling. scroll-margin-top matches HEADER_OFFSET so
        // native anchor jumps land at the same spot as our JS scroll.
        heading.style.scrollMarginTop = `${HEADER_OFFSET}px`;
        heading.classList.add("group", "relative");

        // Add anchor link
        if (!heading.querySelector(".anchor-link")) {
          const anchor = document.createElement("a");
          anchor.href = `#${heading.id}`;
          anchor.className =
            "anchor-link absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary";
          anchor.innerHTML = "#";
          anchor.setAttribute("aria-label", "Link to this section");
          heading.appendChild(anchor);
        }
      });

      // Enhanced code block styling
      const codeBlocks = root.querySelectorAll("pre");
      codeBlocks.forEach((pre) => {
        if (!pre.classList.contains("enhanced")) {
          pre.classList.add(
            "enhanced",
            "relative",
            "rounded-xl",
            "border",
            "shadow-sm",
            "bg-muted/50",
            "my-6",
            "overflow-x-auto",
          );

          // Create a sticky header container for buttons
          const headerContainer = document.createElement("div");
          headerContainer.className =
            "sticky top-0 left-0 right-0 flex justify-between items-start p-2 bg-transparent pointer-events-none z-10";

          // Add language label if available and apply syntax highlighting
          const code = pre.querySelector("code");
          if (code) {
            const className = code.className;
            const languageMatch = className.match(/language-(\w+)/);

            if (languageMatch) {
              const language = languageMatch[1].toLowerCase();

              // Language aliases for better compatibility
              const languageAliases: { [key: string]: string } = {
                py: "python",
                js: "javascript",
                ts: "typescript",
                sh: "bash",
                shell: "bash",
                yml: "yaml",
                md: "markdown",
                cs: "csharp",
                cpp: "cpp",
                "c++": "cpp",
                rb: "ruby",
                rs: "rust",
                dockerfile: "docker",
              };

              const actualLanguage = languageAliases[language] || language;

              // Defer the expensive Prism highlight to the idle, chunked pass
              // below (avoids a long blocking task on posts with many blocks).
              code.classList.add(`language-${actualLanguage}`);
              pendingHighlights.push({ code, lang: actualLanguage });

              // Add language label
              const label = document.createElement("div");
              label.className =
                "language-label px-2 py-1 text-xs font-bold tracking-widest uppercase bg-background/90 rounded border border-white/10 text-muted-foreground pointer-events-auto shadow-sm";
              label.textContent = languageAliases[language] || language;
              headerContainer.appendChild(label);
            }
          }

          // Enhanced copy button with SVG icon
          const copyButton = document.createElement("button");
          copyButton.className =
            "copy-button flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-background/90 backdrop-blur-sm border border-white/10 rounded hover:bg-muted hover:text-foreground transition-all pointer-events-auto shadow-sm text-muted-foreground";

          const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
          const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

          copyButton.innerHTML = `${copyIcon} <span>Copy</span>`;

          copyButton.onclick = () => {
            const code = pre.querySelector("code")?.textContent || "";
            // Insecure contexts / old browsers: navigator.clipboard is undefined
            if (!navigator.clipboard?.writeText) {
              copyButton.innerHTML = `${copyIcon} <span>Press Ctrl+C</span>`;
              setTimeout(() => {
                copyButton.innerHTML = `${copyIcon} <span>Copy</span>`;
              }, 2000);
              return;
            }
            navigator.clipboard.writeText(code).then(() => {
              copyButton.innerHTML = `${checkIcon} <span>Copied!</span>`;
              copyButton.classList.add("text-green-500", "border-green-500/30");
              copyButton.classList.remove(
                "text-muted-foreground",
                "border-white/10",
              );
              setTimeout(() => {
                copyButton.innerHTML = `${copyIcon} <span>Copy</span>`;
                copyButton.classList.remove(
                  "text-green-500",
                  "border-green-500/30",
                );
                copyButton.classList.add(
                  "text-muted-foreground",
                  "border-white/10",
                );
              }, 2000);
            }).catch(() => {
              // Clipboard can reject (insecure context, permissions) — give feedback
              copyButton.innerHTML = `${copyIcon} <span>Press Ctrl+C</span>`;
              setTimeout(() => {
                copyButton.innerHTML = `${copyIcon} <span>Copy</span>`;
              }, 2000);
            });
          };

          // Add copy button to the left side of header
          const leftContainer = document.createElement("div");
          leftContainer.appendChild(copyButton);
          headerContainer.insertBefore(
            leftContainer,
            headerContainer.firstChild,
          );

          // Insert header container at the beginning of pre
          pre.insertBefore(headerContainer, pre.firstChild);
        }
      });

      // Highlight every code block, but spread the work across idle frames so it
      // never runs as one long task. Syntax highlighting injects a <span> per
      // token; doing every block in a single synchronous pass is what made the
      // page (and the machine) stutter. An idle-time pass keeps the main thread
      // responsive, and — unlike viewport-gated highlighting — it can't silently
      // skip blocks when layout is deferred (the IntersectionObserver approach
      // missed blocks on client-side navigation, where the post HTML is injected
      // after layout settles and `content-visibility` blocks have no geometry
      // yet). content-visibility on <pre> (globals.css) still defers the *paint*
      // of off-screen blocks until they scroll into view, so highlighting them
      // up front only builds DOM — it doesn't force layout/paint.
      if (pendingHighlights.length > 0) {
        const MAX_HIGHLIGHT_CHARS = 20000;
        // Max code blocks highlighted per slice. Caps the longest single task so
        // highlighting never freezes the main thread — important on the timeout
        // (didTimeout) path, which would otherwise drain every remaining block in
        // one synchronous burst and make the page (and navbar) briefly unclickable.
        const SLICE_CAP = 5;

        const highlightOne = (prism: any, code: Element, lang: string) => {
          // A re-decorate (React reset the content) can detach the nodes a prior
          // pump still holds; skip stale nodes so we only touch the live DOM.
          if (!root.contains(code)) return;
          const text = code.textContent || "";
          if (!text.trim() || text.length > MAX_HIGHLIGHT_CHARS) return;
          const grammar = prism.languages?.[lang];
          if (!grammar) return;
          try {
            code.innerHTML = prism.highlight(text, grammar, lang);
          } catch {
            /* leave as plain text if highlighting fails */
          }
        };

        loadPrism().then((prism) => {
          if (cancelled) return;
          let idx = 0;

          const pump = (deadline?: IdleDeadline) => {
            if (cancelled) return;
            let done = 0;
            while (
              idx < pendingHighlights.length &&
              done < SLICE_CAP &&
              (!deadline || deadline.timeRemaining() > 4 || deadline.didTimeout)
            ) {
              const item = pendingHighlights[idx++];
              highlightOne(prism, item.code, item.lang);
              done++;
            }
            if (idx < pendingHighlights.length) schedule();
          };

          // Pace the remaining slices on animation frames, NOT requestIdleCallback.
          // rAF fires every frame (~16ms) regardless of whether the main thread is
          // "idle", so every block colours within a few frames. The old idle path
          // got starved during a busy post load (lazy images, the scroll sky), so
          // only the first slice coloured and the rest stayed plain until the thread
          // happened to go idle seconds later — the "first quarter has color, the
          // rest appears much later" bug. Still 5-at-a-time so no long task.
          const schedule = () => {
            if (typeof window.requestAnimationFrame === "function") {
              window.requestAnimationFrame(() => pump());
            } else {
              setTimeout(() => pump(), 16);
            }
          };

          // Colour the first slice immediately; pump() self-schedules the rest.
          pump();
        });
      }

      // Enhanced blockquote styling
      const blockquotes = root.querySelectorAll("blockquote");
      blockquotes.forEach((blockquote) => {
        if (!blockquote.classList.contains("enhanced")) {
          blockquote.classList.add(
            "enhanced",
            "border-l-4",
            "border-primary",
            "bg-muted/30",
            "rounded-r-lg",
            "my-6",
          );
        }
      });

      // Enhanced table styling
      const tables = root.querySelectorAll("table");
      tables.forEach((table) => {
        if (!table.classList.contains("enhanced")) {
          table.classList.add("enhanced");

          // Wrap table in a container for better responsive handling
          if (!table.parentElement?.classList.contains("table-container")) {
            const wrapper = document.createElement("div");
            wrapper.className =
              "table-container overflow-x-auto rounded-lg border my-6";
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
          }
        }
      });

    };

    decorate();

    // Re-decorate whenever React replaces the content (see note above). We watch
    // only direct childList changes on the root: React's innerHTML reset swaps all
    // direct children, while our own token/copy-button edits are deeper descendants
    // and don't trigger this. The `pre:not(.enhanced)` check ignores the harmless
    // direct-child mutations decorate() itself makes (wrapping tables/images).
    const observer = new MutationObserver(() => {
      if (cancelled || rescheduling) return;
      if (!root.querySelector("pre:not(.enhanced)")) return;
      rescheduling = true;
      requestAnimationFrame(() => {
        rescheduling = false;
        decorate();
      });
    });
    observer.observe(root, { childList: true });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [content]);

  // Modify content to support Notion-style tables
  const processedContent = content.replace(
    /\[notion-table\]([\s\S]*?)\[\/notion-table\]/g,
    (match, tableJson) => {
      try {
        const tableBlock = JSON.parse(tableJson);
        return renderNotionTable(tableBlock);
      } catch (error) {
        console.error("Error parsing Notion table:", error);
        return match;
      }
    },
  );

  return (
    <div
      ref={contentRef}
      className="mdx prose prose-lg dark:prose-invert max-w-none break-words
        prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:break-words
        prose-h2:mt-12 prose-h2:mb-5 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/70
        prose-h3:mt-9 prose-h3:mb-3
        prose-p:leading-[1.8] prose-p:text-foreground/90 prose-p:break-words
        prose-li:leading-[1.75] prose-li:my-1.5 prose-li:marker:text-primary/70
        prose-ul:my-5 prose-ol:my-5
        prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:decoration-primary/40 prose-a:underline-offset-2 prose-a:break-words hover:prose-a:decoration-primary
        prose-strong:text-foreground prose-strong:font-semibold
        prose-code:bg-primary/10 prose-code:text-primary prose-code:font-medium prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.85em] prose-code:break-words prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-transparent prose-pre:p-0 prose-pre:my-6 prose-pre:overflow-x-auto
        prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-border
        prose-blockquote:border-l-2 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-muted-foreground prose-blockquote:font-normal
        prose-hr:border-border
        prose-table:text-sm
        prose-th:bg-muted prose-th:font-semibold prose-th:text-foreground prose-th:border-border
        prose-td:border-border"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

// Function to render Notion-style tables
function renderNotionTable(tableBlock: any): string {
  if (
    !tableBlock ||
    !tableBlock.children ||
    !Array.isArray(tableBlock.children)
  ) {
    return "";
  }

  const hasColumnHeader = tableBlock.content?.has_column_header || false;
  const hasRowHeader = tableBlock.content?.has_row_header || false;
  const tableWidth = tableBlock.content?.table_width || 2;

  // Create table HTML
  let tableHtml =
    '<div class="table-container overflow-x-auto rounded-lg border my-6">';
  tableHtml += '<table class="w-full border-collapse">';

  // Render rows
  tableBlock.children.forEach((row: any, rowIndex: number) => {
    if (row.type !== "table_row" || !row.content?.cells) return;

    // Ensure cells match table width
    const cells = row.content.cells.slice(0, tableWidth);
    while (cells.length < tableWidth) {
      cells.push([{ content: "", annotations: {} }]);
    }

    const rowHtml = cells
      .map((cell: any[], cellIndex: number) => {
        const isHeaderCell =
          (hasColumnHeader && rowIndex === 0) ||
          (hasRowHeader && cellIndex === 0);

        const cellContent = cell
          .map((richText) => {
            // Handle rich text formatting
            let content = richText.content || "";
            const annotations = richText.annotations || {};

            // Apply text formatting
            if (annotations.bold) content = `<strong>${content}</strong>`;
            if (annotations.italic) content = `<em>${content}</em>`;
            if (annotations.strikethrough) content = `<del>${content}</del>`;
            if (annotations.underline) content = `<u>${content}</u>`;
            if (annotations.code) content = `<code>${content}</code>`;

            // Handle links
            if (richText.href) {
              content = `<a href="${richText.href}" class="text-primary hover:underline">${content}</a>`;
            }

            return content;
          })
          .join("");

        const cellTag = isHeaderCell ? "th" : "td";
        const cellClasses = [
          "border",
          "border-border",
          "p-2",
          "text-left",
          isHeaderCell ? "bg-muted font-semibold" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return `<${cellTag} class="${cellClasses}">${cellContent}</${cellTag}>`;
      })
      .join("");

    tableHtml += `<tr class="border-b border-border">${rowHtml}</tr>`;
  });

  tableHtml += "</table></div>";

  return tableHtml;
}
