"use client"

import { useState } from "react"
import { Facebook, Linkedin, Twitter, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { siteConfig } from "@/lib/site-config"
import { withBasePath } from "@/lib/utils"

interface ShareButtonsProps {
  title: string
  slug: string
  excerpt?: string
  categories?: readonly string[]
  type?: "posts" | "notes"
}

export function ShareButtons({ title, slug, excerpt, categories, type = "posts" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}${withBasePath(`/${type}/${slug}`)}` 
    : `${withBasePath(`/${type}/${slug}`)}`

  // Generate hashtags from categories
  const generateHashtags = () => {
    const baseHashtags = ["#blog", "#tech", "#programming"]
    
    if (categories && categories.length > 0) {
      // Convert categories to hashtags (max 3 additional ones)
      const categoryHashtags = categories
        .slice(0, 3)
        .map(category => 
          `#${category
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '') // Remove spaces
            .substring(0, 20) // Limit length
          }`
        )
        .filter(tag => tag.length > 1) // Only include valid hashtags
      
      return [...baseHashtags, ...categoryHashtags].join(" ")
    }
    
    return baseHashtags.join(" ")
  }

  // Create engaging captions with profile mentions
  const createTwitterCaption = () => {
    const baseText = `"${title}"`
    const mention = `by ${siteConfig.author.twitter}`
    const hashtags = generateHashtags()
    const maxLength = 280 - shareUrl.length - 10 // Leave some buffer
    
    let caption = `${baseText} ${mention}`
    
    if (excerpt && caption.length + excerpt.length + 20 < maxLength) {
      caption = `${baseText}\n\n${excerpt.substring(0, 100)}${excerpt.length > 100 ? '...' : ''}\n\n${mention}`
    }
    
    if (caption.length + hashtags.length + 5 < maxLength) {
      caption += `\n\n${hashtags}`
    }
    
    return caption
  }

  const createShareText = () => {
    let shareText = `"${title}"`
    
    if (excerpt) {
      shareText += `\n\n${excerpt}`
    }
    
    // Add categories section if available
    if (categories && categories.length > 0) {
      shareText += `\n\n📂 Categories: ${categories.join(", ")}`
    }
    
    shareText += `\n\n👨‍💻 By ${siteConfig.author.name}`
    shareText += `\n\n🔗 Read more: ${shareUrl}`
    shareText += `\n\n${generateHashtags()}`
    
    return shareText
  }

  const handleCopy = async () => {
    const copyText = createShareText()
    
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      toast({
        title: "Content copied!",
        description: "The post content with categories and caption has been copied. You can now paste it when sharing on social media.",
      })
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = copyText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      setCopied(true)
      toast({
        title: "Content copied!",
        description: "The post content with categories and caption has been copied. You can now paste it when sharing on social media.",
      })
    }

    setTimeout(() => setCopied(false), 3000)
  }

  const shareOnTwitter = () => {
    const caption = createTwitterCaption()
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    )
  }

  const shareOnFacebook = () => {
    // Facebook no longer supports custom text via URL parameters
    // We'll open the basic sharer and copy the content for manual pasting
    const shareText = createShareText()
    
    // Copy to clipboard first
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Caption copied!",
        description: "The post caption with categories has been copied to your clipboard. Paste it when Facebook opens.",
        duration: 5000,
      })
    }).catch(() => {
      toast({
        title: "Ready to share!",
        description: "Facebook will open. Copy the caption from the 'Copy' button to add your custom message.",
        duration: 5000,
      })
    })
    
    // Open Facebook sharer (only supports URL)
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank"
    )
  }

  const shareOnLinkedIn = () => {
    // LinkedIn no longer supports custom text via URL parameters for the basic share
    // We'll copy the content and open LinkedIn
    const shareText = createShareText()
    
    // Copy to clipboard first
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Caption copied!",
        description: "The post caption with categories has been copied to your clipboard. Paste it when LinkedIn opens.",
        duration: 5000,
      })
    }).catch(() => {
      toast({
        title: "Ready to share!",
        description: "LinkedIn will open. Copy the caption from the 'Copy' button to add your custom message.",
        duration: 5000,
      })
    })
    
    // Open LinkedIn share (only supports URL)
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Share:</span>
        <Button variant="outline" size="icon" onClick={shareOnTwitter} aria-label="Share on Twitter">
          <Twitter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={shareOnFacebook} aria-label="Share on Facebook">
          <Facebook className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={shareOnLinkedIn} aria-label="Share on LinkedIn">
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy share content">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
        💡 <strong>Tip:</strong> For Facebook and LinkedIn, click the Copy button first, then use the social media buttons. 
        Paste the copied content when the platform opens for a complete post with your profile mention and categories!
      </div>
    </div>
  )
}
