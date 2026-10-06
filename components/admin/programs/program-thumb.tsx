"use client"

/* eslint-disable @next/next/no-img-element */

import { useState } from "react"

export function ProgramThumb({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <div aria-hidden className="h-10 w-16 shrink-0 rounded-md border bg-muted/60" />
  }

  return (
    <img
      src={src}
      alt={alt}
      width={64}
      height={40}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-10 w-16 shrink-0 rounded-md border bg-muted/40 object-cover"
    />
  )
}
