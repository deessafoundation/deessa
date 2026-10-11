"use client"

import Image from "next/image"
import { useState } from "react"

export function CommunityCover({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="flex h-full items-center justify-center p-6 text-center">Cover photo unavailable. View the original post on Facebook.</span>
  return <Image src={src} alt={alt} fill unoptimized sizes="(max-width: 767px) 90vw, 33vw" className="object-cover" onError={() => setFailed(true)} />
}
