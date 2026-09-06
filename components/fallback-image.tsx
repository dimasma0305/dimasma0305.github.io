"use client"

import Image from "next/image"
import { useState } from "react"
import { useLazyLoading } from "@/hooks/use-lazy-loading"
import { optimizedContentCover } from "@/lib/optimized-media.mjs"
import { withBasePath } from "@/lib/utils"

interface FallbackImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  fallbackSrc?: string
}

export function FallbackImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  fallbackSrc,
}: FallbackImageProps) {
  const [failure, setFailure] = useState({ source: src, index: 0 })
  const [loadedSource, setLoadedSource] = useState<string>()
  
  const { elementRef, shouldLoad } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '200px',
  })

  // Retain the full-resolution original as a fallback if a generated companion
  // is unavailable (for example, content was refreshed during development).
  const placeholder = fallbackSrc || withBasePath(`/placeholder.svg?height=${height || 400}&width=${width || 600}&text=${encodeURIComponent(alt)}`)
  const candidates = [...new Set([optimizedContentCover(src), src, placeholder])]
  const candidateIndex = failure.source === src ? Math.min(failure.index, candidates.length - 1) : 0
  const imgSrc = priority || shouldLoad ? candidates[candidateIndex] : undefined
  const imageLoaded = Boolean(imgSrc && loadedSource === imgSrc)

  // Handle image load error
  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setFailure({ source: src, index: candidateIndex + 1 })
    } else {
      setLoadedSource(imgSrc) // Keep the accessible alt visible; never retry in a loop.
    }
  }

  const handleLoad = () => {
    setLoadedSource(imgSrc)
  }

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}
    >
      {/* Silent skeleton while the image decodes (no developer-facing text). */}
      {!priority && !imageLoaded && (
        <div aria-hidden className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {imgSrc && (
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={alt}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          fill={fill}
          className={`${className} ${!priority ? 'transition-opacity duration-300' : ''} ${
            !priority && !imageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          priority={priority}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </div>
  )
}
