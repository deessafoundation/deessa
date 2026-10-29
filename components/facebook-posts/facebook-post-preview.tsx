"use client"

import { useEffect, useRef, useState } from "react"
import { facebookEmbedUrl } from "@/lib/facebook-posts/types"
import { Button } from "@/components/ui/button"

export function FacebookPostPreview({ url, title, automatic = false, mode = "admin", postType = "full" }: { url: string; title: string; automatic?: boolean; mode?: "admin" | "public"; postType?: "photo" | "full" }) {
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
  // For photo type, always hide text. For full type, show text in admin, hide in public
  const showText = postType === "photo" ? false : (isPublicMode ? false : true)
  // Reduced height for public mode to minimize empty space
  const height = isPublicMode ? 380 : 720
  
  // Rebuild the embed URL with correct show_text parameter
  const embed = source ? source.replace(/show_text=(true|false)/, `show_text=${showText}`)
    .replace("width=500", `width=${width}`)
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
            className={automatic ? `w-full rounded-xl border overflow-hidden` : `h-[${height}px] w-full rounded-lg border`} 
            style={{ height: `${height}px` }}
          />
          {!automatic && <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">Open original post on Facebook<span className="sr-only"> (opens in a new tab)</span></a>}
        </div>
      )}
    </div>
  )
}
