/** Optional reading chrome for post routes. The original code/text stays intact. */
export function enhanceArticle(root: HTMLElement) {
  root
    .querySelectorAll<HTMLPreElement>("pre.enhanced")
    .forEach((pre, index) => {
      if (pre.parentElement?.classList.contains("article-code-block")) {
        return;
      }
      const code = pre.querySelector("code");
      if (!code) {
        return;
      }
      const wrapper = document.createElement("div");
      wrapper.className = "article-code-block";
      // The legacy Notion class uses !important spacing/background rules. The
      // reading wrapper now owns this chrome when reading tools are enabled.
      pre.classList.remove("notion-code-block");
      pre.before(wrapper);
      wrapper.append(pre);
      const toolbar = pre.querySelector<HTMLDivElement>(":scope > div");
      if (!toolbar) {
        return;
      }
      toolbar.className = "article-code-toolbar";
      wrapper.prepend(toolbar);
      const label = toolbar.querySelector(".language-label");
      if (label) {
        toolbar.prepend(label);
      }
      const lines = (code.textContent || "").trimEnd().split("\n").length;
      const count = document.createElement("span");
      count.className = "article-code-lines";
      count.textContent = `${lines} ${lines === 1 ? "line" : "lines"}`;
      if (label) {
        label.after(count);
      } else {
        toolbar.prepend(count);
      }
      const wrap = document.createElement("button");
      wrap.type = "button";
      wrap.className = "article-code-wrap";
      wrap.textContent = "Wrap";
      wrap.setAttribute("aria-label", "Wrap code lines");
      wrap.setAttribute("aria-pressed", "false");
      wrap.onclick = () => {
        const wrapped = wrapper.classList.toggle("is-wrapped");
        wrap.setAttribute("aria-pressed", String(wrapped));
      };
      toolbar.insertBefore(wrap, toolbar.lastElementChild);
      pre.tabIndex = 0;
      pre.setAttribute("role", "region");
      pre.setAttribute(
        "aria-label",
        `${label?.textContent || "Text"} code block ${index + 1}, scroll horizontally or use Wrap`,
      );
      const copy = toolbar.querySelector<HTMLButtonElement>(".copy-button");
      if (copy) {
        copy.type = "button";
        copy.setAttribute("aria-live", "polite");
        copy.setAttribute("aria-atomic", "true");
        // Selection fallback is useful on the HTTP preview, where Clipboard API
        // is unavailable. Never report a successful copy unless it succeeded.
        const fallback = () => {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(code);
          selection?.removeAllRanges();
          selection?.addRange(range);
          copy.textContent = "Selected — copy manually";
        };
        copy.onclick = async () => {
          if (!navigator.clipboard?.writeText) {
            fallback();
            return;
          }
          try {
            await navigator.clipboard.writeText(code.textContent || "");
            copy.textContent = "Copied!";
            setTimeout(() => {
              if (copy.isConnected) {
                copy.textContent = "Copy";
              }
            }, 2000);
          } catch {
            fallback();
          }
        };
      }
    });

  root
    .querySelectorAll<HTMLImageElement>(".lazy-image-wrapper img")
    .forEach((img, index) => {
      if (img.closest("button, a")) {
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "article-image-trigger";
      button.setAttribute(
        "aria-label",
        `Enlarge image ${index + 1}${img.alt && img.alt !== "Image" ? `: ${img.alt}` : ""}`,
      );
      button.setAttribute("aria-haspopup", "dialog");
      img.before(button);
      button.append(img);
      const hint = document.createElement("span");
      hint.className = "article-image-hint";
      hint.textContent = "View full size ↗";
      hint.setAttribute("aria-hidden", "true");
      button.append(hint);
    });
}
