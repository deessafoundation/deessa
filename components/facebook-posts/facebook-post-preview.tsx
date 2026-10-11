"use client"

import { useEffect, useRef, useState } from "react"
import { facebookEmbedUrl } from "@/lib/facebook-posts/types"
import { Button } from "@/components/ui/button"

export function FacebookPostPreview({ url, title, automatic = false, mode = "admin" }: { url: string; title: string; automatic?: boolean; mode?: "admin" | "public" }) {
  const [open, setOpen] = useState(automatic)
  const [width, setWidth] = useState(500)
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(220, Math.min(500, Math.floor(entry.contentRect.width)))))
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  const source = facebookEmbedUrl(url)
  
  // Apply mode-specific settings
  const isPublicMode = mode === "public" || automatic
  const showText = !isPublicMode
  const height = isPublicMode ? 480 : 720
  
  const embed = source ? source
    .replace("width=500", `width=${width}`)
    .replace("show_text=true", `show_text=${showText}`) 
    : null
  
  if (!embed) return null
  return (
    <div ref={container} className="mt-3 space-y-3">
      {!automatic && <Button type="button" variant="outline" className="min-h-11 h-auto whitespace-normal" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Close Facebook preview" : "Preview Facebook post"}
      </Button>}
      {open && (
        <div>
          {!automatic && <p className="mb-2 text-sm">This preview connects to Facebook, which may use cookies. If it cannot load, use the post link. Share links may need the original post permalink to preview.</p>}
          <iframe src={embed} title={`Facebook post: ${title}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
            className={automatic ? "h-[480px] w-full rounded-xl border" : `h-[${height}px] w-full rounded-lg border`} 
            style={{ height: `${height}px` }}
          />
          {!automatic && <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">Open original post on Facebook<span className="sr-only"> (opens in a new tab)</span></a>}
        </div>
      )}
    </div>
  )
}
