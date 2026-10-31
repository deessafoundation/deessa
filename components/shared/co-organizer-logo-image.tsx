"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export type LogoFitOverride = "auto" | "wide" | "square" | "boost" | "boost-large"

interface CoOrganizerLogoImageProps {
  src: string
  alt: string
  className?: string
  partnerName?: string
  fitOverride?: LogoFitOverride
}

/**
 * Intelligent client-side logo renderer:
 * 1. Honors explicit Admin `fitOverride` setting if provided ("wide", "square", "boost", "boost-large").
 * 2. If set to "auto" (default), automatically detects the natural aspect ratio
 *    from `naturalWidth / naturalHeight` to apply optical equalization.
 */
export function CoOrganizerLogoImage({
  src,
  alt,
  className,
  partnerName,
  fitOverride = "auto",
}: CoOrganizerLogoImageProps) {
  const [shape, setShape] = useState<"wide" | "square" | "normal">("normal")
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
      checkRatio(imgRef.current)
    }
  }, [src, fitOverride])

  const isByan = partnerName?.toLowerCase().includes("byan")
  const scaleAttr =
    fitOverride === "boost"
      ? "boost"
      : fitOverride === "boost-large"
      ? "boost-large"
      : undefined

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      data-shape={shape}
      data-scale={scaleAttr}
      data-partner={isByan ? "byan" : undefined}
      className={cn(className)}
      onLoad={(e) => checkRatio(e.currentTarget)}
      loading="lazy"
    />
  )
}
