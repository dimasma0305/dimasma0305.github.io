"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useLazyLoading } from "@/hooks/use-lazy-loading"

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
  const [imgSrc, setImgSrc] = useState<string | undefined>(priority ? src : undefined)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const { elementRef, shouldLoad, isDOMReady } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '50px',
    delayAfterDOMLoaded: 250
  })

  // For priority images, load immediately. For others, wait for lazy loading trigger
  useEffect(() => {
    if (priority) {
      setImgSrc(src)
    } else if (shouldLoad && !imgSrc) {
      setImgSrc(src)
    }
  }, [shouldLoad, src, imgSrc, priority])

  // Handle image load error
  const handleError = () => {
    // Use provided fallback or generate a placeholder
    const defaultFallback = `/placeholder.svg?height=${height || 400}&width=${width || 600}&text=${encodeURIComponent(alt)}`
    setImgSrc(fallbackSrc || defaultFallback)
  }

  const handleLoad = () => {
    setImageLoaded(true)
  }

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}
    >
      {/* Loading placeholder for non-priority images */}
      {!priority && !imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading image...</div>
        </div>
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
