"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

/** Keep CMS URLs intact and show a local placeholder when an asset is missing. */
export function HomepageImage({ src, alt, onError, ...props }: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null)
  const normalized = typeof src === "string" && src && !/^(\/|https?:\/\/)/i.test(src)
    ? `/${src}`
    : src
  const fallback = "/image_coming_soon.png"

  return (
    <Image
      {...props}
      alt={alt}
      src={!normalized || failedSource === src ? fallback : normalized}
      onError={(event) => {
        setFailedSource(src)
        onError?.(event)
      }}
    />
  )
}
