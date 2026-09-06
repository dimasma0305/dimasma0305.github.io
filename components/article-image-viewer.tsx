"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function ArticleImageViewer() {
  const [image, setImage] = useState<{
    src: string;
    alt: string;
    width: number;
  } | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const article = document.getElementById("article-body");
    const open = (event: MouseEvent) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>(".article-image-trigger")
          : null;
      const img = button?.querySelector("img");
      if (!img?.complete || !img.naturalWidth) {
        return;
      }
      trigger.current = button;
      setImage({
        src: img.currentSrc || img.src,
        alt: img.alt,
        width: img.naturalWidth,
      });
    };
    article?.addEventListener("click", open);
    return () => article?.removeEventListener("click", open);
  }, []);

  return (
    <Dialog
      open={!!image}
      onOpenChange={(open) => {
        if (!open) {
          setImage(null);
        }
      }}
    >
      <DialogContent
        className="article-image-dialog"
        style={{
          maxWidth: image
            ? Math.min(1280, Math.max(560, image.width + 48))
            : 1280,
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (trigger.current?.isConnected) {
            trigger.current.focus({ preventScroll: true });
          }
        }}
      >
        <DialogTitle>Image detail</DialogTitle>
        <DialogDescription>
          View the image below, or open the original for its full resolution.
        </DialogDescription>
        {image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} />
            <a href={image.src} target="_blank" rel="noopener noreferrer">
              Open original image ↗
            </a>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
