"use client";
import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
const reviewBrief =
  "Hi Dimas, I'd like a source code security review.\nProject / stack:\nApproximate codebase size:\nMain concerns:\nPreferred timeline:";
export function ServiceBrief() {
  const field = useRef<HTMLTextAreaElement>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  useEffect(() => {
    setReady(true);
  }, []);
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(reviewBrief);
      setCopied(true);
      setStatus(
        "Brief copied. Paste it into your message and fill in the details.",
      );
    } catch {
      field.current?.focus();
      field.current?.select();
      setCopied(false);
      setStatus(
        "Template selected. Use your device’s copy action, then paste it into your message.",
      );
    }
  };
  return (
    <div className="service-brief">
      <div className="service-brief-heading">
        <label htmlFor="review-brief">A useful first message</label>
        <button type="button" onClick={copy} disabled={!ready}>
          {copied ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy brief"}
        </button>
      </div>
      <textarea
        id="review-brief"
        ref={field}
        value={reviewBrief}
        readOnly
        rows={7}
        spellCheck={false}
      />
      <p role="status" aria-live="polite">
        {status ||
          "No form to submit. Send only a project overview to start—not credentials or secrets."}
      </p>
    </div>
  );
}
