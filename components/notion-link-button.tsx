"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NotionLinkButtonProps {
  notionUrl: string
  variant?: "default" | "badge" | "inline"
  className?: string
}

export function NotionLinkButton({
  notionUrl,
  variant = "default",
  className = ""
}: NotionLinkButtonProps) {
  const handleClick = () => {
    window.open(notionUrl, '_blank', 'noopener,noreferrer')
  }

  if (variant === "badge") {
    // A real, keyboard-focusable link. stopPropagation keeps it independent of
    // any surrounding card link.
    return (
      <a
        href={notionUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View on Notion"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center rounded-full border border-border bg-secondary/80 backdrop-blur px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary/20 ${className}`}
      >
        <ExternalLink className="w-3 h-3 mr-1" />
        Notion
      </a>
    )
  }

  if (variant === "inline") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors ${className}`}
      >
        <ExternalLink className="w-3 h-3" />
        View on Notion
      </button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <ExternalLink className="w-4 h-4" />
      View on Notion
    </Button>
  )
}
