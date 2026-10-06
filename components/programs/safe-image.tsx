"use client"

/* eslint-disable @next/next/no-img-element */

import Image from "next/image"
import { useCallback, useState, type CSSProperties, type ReactEventHandler } from "react"

// Hosts that next/image is allowed to optimize (keep in sync with
// images.remotePatterns in next.config.mjs). Any other remote host is
// rendered with a plain <img>: next/image throws a runtime error during
// render for unconfigured hosts, which crashes the whole page.
const ALLOWED_HOSTS = [
  "images.unsplash.com",
  "plus.unsplash.com",
  "lh3.googleusercontent.com",
  "*.supabase.co",
  "img.youtube.com",
  "*.gstatic.com",
]

function isOptimizable(src: string): boolean {
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return true // relative/local path — always fine for next/image
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false
  return ALLOWED_HOSTS.some((pattern) =>
    pattern.startsWith("*.")
      ? url.hostname === pattern.slice(2) || url.hostname.endsWith(pattern.slice(1))
      : url.hostname === pattern
  )
}

/**
 * For external URLs that aren't on the next/image allowlist, route them
 * through our server-side proxy so hotlink-blocking headers are bypassed.
 * Allow-listed hosts (Supabase, Unsplash, etc.) go through next/image directly.
 */
function getProxiedSrc(src: string): string {
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return src // relative path — leave as-is
  }
  if (
    (url.protocol === "http:" || url.protocol === "https:") &&
    !isOptimizable(src)
  ) {
    return `/api/img-proxy?url=${encodeURIComponent(src)}`
  }
  return src
}

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  style?: CSSProperties
  onLoad?: ReactEventHandler<HTMLImageElement>
  onError?: ReactEventHandler<HTMLImageElement>
}

/**
 * Renders nothing if the image is missing or fails to load, instead of
 * crashing the page. Uses next/image for allowlisted hosts, plain <img>
 * (via server-side proxy) for any other remote host — so any URL the admin
 * pastes will work regardless of hotlink protection on the source server.
 */
export function SafeImage({ src, alt, fill, sizes, priority, className, style, onLoad, onError }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  // Images can fail BEFORE React hydrates, so onError never fires for them.
  // The ref callback runs after hydration and catches those.
  const ref = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) setFailed(true)
  }, [])

  function handleError(e: React.SyntheticEvent<HTMLImageElement>) {
    setFailed(true)
    onError?.(e)
  }

  if (!src || failed) return null

  // Allow-listed hosts → next/image (optimized, cached by Next.js)
  if (isOptimizable(src)) {
    return (
      <Image
        ref={ref}
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
        onLoad={onLoad}
        onError={handleError}
      />
    )
  }

  // All other external URLs → proxy through /api/img-proxy
  const proxied = getProxiedSrc(src)

  if (fill) {
    return (
      <img
        ref={ref}
        src={proxied}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }}
        onLoad={onLoad}
        onError={handleError}
      />
    )
  }

  return (
    <img
      ref={ref}
      src={proxied}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      style={style}
      onLoad={onLoad}
      onError={handleError}
    />
  )
}
