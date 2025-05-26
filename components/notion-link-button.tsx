"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
    return (
      <Badge 
        variant="secondary" 
        className={`cursor-pointer hover:bg-primary/20 transition-colors ${className}`}
        onClick={handleClick}
      >
        <ExternalLink className="w-3 h-3 mr-1" />
        Notion
      </Badge>
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
