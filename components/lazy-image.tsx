"use client"

import { useState, useEffect } from 'react'
import { useLazyLoading } from '@/hooks/use-lazy-loading'
import { withBasePath } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
  [key: string]: any
}

export function LazyImage({
  src,
  alt,
  className = '',
  fallbackSrc,
  placeholder,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const { elementRef, shouldLoad, isDOMReady } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '50px',
    delayAfterDOMLoaded: 250
  })

  useEffect(() => {
    if (shouldLoad && !imageSrc) {
      setImageSrc(src)
    }
  }, [shouldLoad, src, imageSrc])

  const handleImageLoad = () => {
    setImageLoaded(true)
    onLoad?.()
  }

  const handleImageError = () => {
    setImageError(true)
    if (fallbackSrc) {
      setImageSrc(fallbackSrc)
    } else {
      setImageSrc(withBasePath("/placeholder.svg?height=400&width=600&text=Image%20Not%20Found"))
    }
    onError?.()
  }

  const defaultPlaceholder = withBasePath("/placeholder.svg?height=400&width=600&text=Loading...")

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Placeholder/Loading state */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img
              src={placeholder}
              alt="Loading..."
              className="opacity-50"
            />
          ) : (
            <div className="text-muted-foreground text-sm">Loading image...</div>
          )}
        </div>
      )}
      
      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  )
} 