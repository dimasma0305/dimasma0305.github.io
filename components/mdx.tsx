"use client";

import { withBasePath } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useLazyLoading } from "@/hooks/use-lazy-loading";
import { initializeLazyLoadingTimer } from "@/lib/scroll-utils";

// Import Prism.js for syntax highlighting
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // Dark theme

// Load core components first
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";

// Load language components in dependency order
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-shell-session";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-nginx";

// Load PHP last as it has complex dependencies
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-php";

interface MdxProps {
  content: string;
}

export function Mdx({ content }: MdxProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { isDOMReady } = useLazyLoading({
    delayAfterDOMLoaded: 250,
  });

  useEffect(() => {
    // Initialize the lazy loading timer for scroll utilities
    initializeLazyLoadingTimer(250);

    if (contentRef.current && isDOMReady) {
      // Enhanced image handling with staged lazy loading (viewport first, then the rest)
      const images = contentRef.current.querySelectorAll("img");
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
        placeholder.className =
          "absolute inset-0 bg-muted animate-pulse flex items-center justify-center";
        placeholder.innerHTML =
          '<div class="text-muted-foreground text-sm">Loading image...</div>';

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
      const headings = contentRef.current.querySelectorAll(
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

        // Enhanced heading styling
        heading.style.scrollMarginTop = "120px";
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
      const codeBlocks = contentRef.current.querySelectorAll("pre");
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

              // Apply Prism.js syntax highlighting
              try {
                // Check if Prism is available and properly loaded
                if (typeof Prism === "undefined" || !Prism.languages) {
                  console.warn("Prism.js not properly loaded");
                  code.classList.add(`language-${actualLanguage}`);
                  return;
                }

                // Ensure the language is supported by Prism
                if (Prism.languages[actualLanguage]) {
                  const codeText = code.textContent || "";
                  if (codeText.trim()) {
                    const highlightedCode = Prism.highlight(
                      codeText,
                      Prism.languages[actualLanguage],
                      actualLanguage,
                    );
                    code.innerHTML = highlightedCode;
                  }
                } else {
                  // Fallback for unsupported languages - just add the language class
                  console.warn(
                    `Language '${actualLanguage}' not supported by Prism.js`,
                  );
                  code.classList.add(`language-${actualLanguage}`);
                }
              } catch (error) {
                console.error(
                  `Error highlighting code for language '${actualLanguage}':`,
                  error,
                );
                // Fallback: just add the language class without highlighting
                code.classList.add(`language-${actualLanguage}`);
              }

              // Add language label
              const label = document.createElement("div");
              label.className =
                "language-label px-2 py-1 text-[10px] font-bold tracking-widest uppercase bg-background/90 backdrop-blur-sm rounded border border-white/10 text-muted-foreground pointer-events-auto shadow-sm";
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

      // Run Prism highlighting on any remaining code blocks that weren't manually processed
      try {
        // Only highlight code blocks that don't have the 'enhanced' class
        const unprocessedCodeBlocks = contentRef.current.querySelectorAll(
          "pre:not(.enhanced) code[class*='language-']",
        );
        unprocessedCodeBlocks.forEach((code) => {
          const pre = code.closest("pre");
          if (pre && !pre.classList.contains("enhanced")) {
            try {
              Prism.highlightElement(code as HTMLElement);
            } catch (error) {
              console.error("Error highlighting individual code block:", error);
            }
          }
        });
      } catch (error) {
        console.error("Error running Prism highlighting:", error);
      }

      // Enhanced blockquote styling
      const blockquotes = contentRef.current.querySelectorAll("blockquote");
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
      const tables = contentRef.current.querySelectorAll("table");
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
    }
  }, [content, isDOMReady]);

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
      className="mdx prose prose-lg dark:prose-invert max-w-none 
        prose-headings:scroll-mt-24
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-transparent prose-pre:p-0
        prose-img:rounded-xl prose-img:shadow-lg
        prose-blockquote:border-l-primary prose-blockquote:bg-muted/30
        prose-th:bg-muted prose-th:font-semibold
        prose-td:border-border prose-th:border-border"
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
