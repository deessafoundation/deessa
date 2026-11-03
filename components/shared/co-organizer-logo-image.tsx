"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export type LogoFitOverride =
  | "auto"
  | "wide"
  | "square"
  | "boost"
  | "boost-large"
  | "boost-xl"
  | "boost-2x"
  | "boost-75"
  | "boost-100"

interface CoOrganizerLogoImageProps {
  src: string
  alt: string
  className?: string
  partnerName?: string
  fitOverride?: LogoFitOverride
  eager?: boolean
}

/**
 * Intelligent client-side logo renderer:
 * 1. Honors explicit Admin `fitOverride` setting if provided ("wide", "square", "boost", "boost-large", "boost-xl", "boost-2x").
 * 2. If set to "auto" (default), automatically detects the natural aspect ratio
 *    from `naturalWidth / naturalHeight` to apply optical equalization.
 * 3. Shows an elegant branded shimmer skeleton while image is loading, eliminating blank white space.
 * 4. Fades in smoothly once loaded with zero CLS (cumulative layout shift).
 * 5. Falls back to a clean text badge if image fails to load.
 */
export function CoOrganizerLogoImage({
  src,
  alt,
  className,
  partnerName,
  fitOverride = "auto",
  eager = true,
}: CoOrganizerLogoImageProps) {
  const [shape, setShape] = useState<"wide" | "square" | "normal">("normal")
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const checkRatio = (img: HTMLImageElement) => {
    // If admin explicitly chose wide or square, honor that override
    if (fitOverride === "wide") {
      setShape("wide")
      return
    }
    if (fitOverride === "square") {
      setShape("square")
      return
    }

    if (!img.naturalWidth || !img.naturalHeight) return
    const ratio = img.naturalWidth / img.naturalHeight

    if (ratio > 2.5) {
      setShape("wide")
    } else if (ratio < 1.25) {
      setShape("square")
    } else {
      setShape("normal")
    }
  }

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        checkRatio(imgRef.current)
        setIsLoaded(true)
      } else {
        setHasError(true)
      }
    }
  }, [src, fitOverride])

  const isByan = partnerName?.toLowerCase().includes("byan")
  const scaleAttr =
    fitOverride === "boost"
      ? "boost"
      : fitOverride === "boost-large"
      ? "boost-large"
      : fitOverride === "boost-xl" || fitOverride === "boost-75"
      ? "boost-xl"
      : fitOverride === "boost-2x" || fitOverride === "boost-100"
      ? "boost-2x"
      : undefined

  if (hasError) {
    return (
      <span className="inline-flex items-center justify-center h-8 px-2 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-md text-center max-w-[140px] truncate">
        {partnerName || alt}
      </span>
    )
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[36px]">
      {!isLoaded && (
        <div
          className="absolute inset-x-2 inset-y-1 rounded-md bg-gradient-to-r from-sky-100/60 via-sky-200/50 to-sky-100/60 animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        data-shape={shape}
        data-scale={scaleAttr}
        data-partner={isByan ? "byan" : undefined}
        className={cn(
          "transition-opacity duration-300 ease-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={(e) => {
          checkRatio(e.currentTarget)
          setIsLoaded(true)
        }}
        onError={() => setHasError(true)}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  )
}

/**
 * Reusable single category card partner logo with built-in skeleton and smooth transition.
 */
export function PartnerCategoryLogo({
  src,
  alt,
  className,
  partnerName,
}: {
  src: string
  alt: string
  className?: string
  partnerName?: string
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true)
      } else {
        setHasError(true)
      }
    }
  }, [src])

  if (hasError) {
    return (
      <div className="inline-flex items-center justify-center h-12 px-4 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg text-center max-w-[180px]">
        {partnerName || alt}
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[44px]">
      {!isLoaded && (
        <div
          className="absolute inset-x-4 inset-y-2 rounded-lg bg-gradient-to-r from-sky-100/60 via-sky-200/50 to-sky-100/60 animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300 ease-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
