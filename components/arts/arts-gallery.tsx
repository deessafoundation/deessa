"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { artworkAnchor, type Artwork } from "@/lib/arts/types"
import styles from "./arts.module.css"

const pad = (n: number) => String(n).padStart(2, "0")

const iconButton = cn(
  styles.iconBtn,
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0B5F8A]",
  "transition-colors duration-200 hover:border-[#3FABDE] hover:bg-[#E8F6FC] disabled:cursor-not-allowed disabled:opacity-40",
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/45",
)

export function ArtsGallery({ artworks }: { artworks: Artwork[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const touchStart = useRef<number | null>(null)
  const total = artworks.length
  const current = openIndex !== null ? artworks[openIndex] : null

  const setHash = useCallback((id: string | null) => {
    const url = new URL(window.location.href)
    url.hash = id ? artworkAnchor(id) : ""
    window.history.replaceState(window.history.state, "", url.toString())
  }, [])

  const open = useCallback(
    (index: number) => {
      setOpenIndex(index)
      setHash(artworks[index].id)
    },
    [artworks, setHash],
  )

  const close = useCallback(() => {
    setOpenIndex(null)
    setHash(null)
  }, [setHash])

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((i) => {
        if (i === null) return i
        const next = (i + delta + total) % total
        setHash(artworks[next].id)
        return next
      })
    },
    [artworks, setHash, total],
  )

  // Deep links: /arts#artwork-{id} opens that piece (homepage cards use this).
  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.replace(/^#artwork-/, "")
      const index = artworks.findIndex((a) => a.id === id)
      if (index >= 0) setOpenIndex(index)
    }
    syncFromHash()
    window.addEventListener("hashchange", syncFromHash)
    return () => window.removeEventListener("hashchange", syncFromHash)
  }, [artworks])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (total < 2) return
    if (e.key === "ArrowRight") {
      e.preventDefault()
      step(1)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      step(-1)
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null || total < 2) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    touchStart.current = null
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
  }

  return (
    <>
      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {artworks.map((artwork, index) => (
          <li key={artwork.id} id={artworkAnchor(artwork.id)} className="scroll-mt-28">
            <button
              type="button"
              onClick={() => open(index)}
              aria-haspopup="dialog"
              aria-label={`Open “${artwork.title}” by ${artwork.credit}`}
              className={cn(
                styles.card,
                "group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-2.5 text-left",
                "shadow-[0_2px_16px_rgba(26,26,46,0.06)] transition-[translate,box-shadow] duration-300 ease-out",
                "hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-14px_rgba(11,95,138,0.28)]",
                "focus-visible:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/50",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0",
              )}
            >
              {/* Gallery mat: fixed frame, painting contained — never cropped. */}
              <span className={cn(styles.mat, "relative block aspect-[4/3] overflow-hidden rounded-[18px] bg-[#f6f2ec]")}>
                <Image
                  src={artwork.src}
                  alt={artwork.alt}
                  fill
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                  className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </span>
              <span className="flex flex-1 items-center justify-between gap-3 px-3 pb-2 pt-4">
                <span className="min-w-0">
                  <span
                    className={cn(
                      styles.heading,
                      "block truncate font-marissa text-[1.375rem] leading-tight text-[#0B5F8A] [-webkit-text-stroke:0.35px_currentColor]",
                    )}
                  >
                    {artwork.title}
                  </span>
                  <span className={cn(styles.muted, "mt-1 block font-comic text-xs uppercase tracking-[0.14em] text-slate-500")}>
                    {artwork.credit} · No. {pad(index + 1)}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    styles.iconBtn,
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F6FC] text-[#0B5F8A]",
                    "transition-colors duration-200 group-hover:bg-[#0B5F8A] group-hover:text-white",
                  )}
                >
                  <Maximize2 className="h-4 w-4" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <DialogPrimitive.Root open={current !== null} onOpenChange={(value) => !value && close()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-[#f7f3ec]/95 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none" />
          {current && openIndex !== null && (
            <DialogPrimitive.Content
              onKeyDown={onKeyDown}
              onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
              onTouchEnd={onTouchEnd}
              className={cn(
                styles.lightbox,
                "fixed inset-0 z-[61] flex flex-col overflow-y-auto focus:outline-none",
                "lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:overflow-hidden",
              )}
            >
              {/* Artwork */}
              <div className="relative flex min-h-[55vh] flex-1 items-center justify-center p-4 pt-16 sm:p-8 sm:pt-20 lg:min-h-0 lg:p-12">
                <div
                  key={current.id}
                  className={cn(styles.lightboxImage, "relative w-full")}
                  style={{
                    aspectRatio: `${current.width} / ${current.height}`,
                    // Fit inside the stage at the artwork's own proportions.
                    maxWidth: `min(100%, calc(72vh * ${current.width / current.height}))`,
                  }}
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="(min-width: 1024px) 65vw, 100vw"
                    className="rounded-2xl object-contain shadow-[0_30px_60px_-30px_rgba(26,26,46,0.45)]"
                  />
                </div>
              </div>

              {/* Details */}
              <aside className="border-t border-slate-200/80 bg-white px-5 py-6 sm:px-8 lg:flex lg:flex-col lg:border-l lg:border-t-0 lg:py-10">
                <p className={cn(styles.eyebrow, "font-comic text-xs font-bold uppercase tracking-[0.2em] text-slate-500")}>
                  No. {pad(openIndex + 1)} of {pad(total)}
                </p>
                <DialogPrimitive.Title
                  className={cn(
                    styles.heading,
                    "mt-2 font-marissa text-3xl leading-tight text-[#0B5F8A] [-webkit-text-stroke:0.5px_currentColor] lg:text-4xl",
                  )}
                >
                  {current.title}
                </DialogPrimitive.Title>
                <p className="mt-2 font-comic text-base font-bold text-[#1a1a2e]">{current.credit}</p>
                {current.description ? (
                  <DialogPrimitive.Description className={cn(styles.muted, "mt-5 whitespace-pre-line font-comic text-base leading-relaxed text-slate-600")}>
                    {current.description}
                  </DialogPrimitive.Description>
                ) : (
                  <DialogPrimitive.Description className="sr-only">
                    {current.alt}
                  </DialogPrimitive.Description>
                )}

                {total > 1 && (
                  <div className="mt-8 flex items-center gap-3 lg:mt-auto">
                    <button type="button" onClick={() => step(-1)} className={iconButton} aria-label="Previous artwork">
                      <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => step(1)} className={iconButton} aria-label="Next artwork">
                      <ChevronRight aria-hidden="true" className="h-5 w-5" />
                    </button>
                    <p className={cn(styles.muted, "ml-1 hidden font-comic text-sm text-slate-500 sm:block")}>
                      Use ← → keys{" "}
                      <span className="lg:hidden">or swipe</span>
                    </p>
                  </div>
                )}
              </aside>

              <DialogPrimitive.Close className={cn(iconButton, "fixed right-4 top-4 z-10 shadow-sm sm:right-6 sm:top-6")} aria-label="Close artwork">
                <X aria-hidden="true" className="h-5 w-5" />
              </DialogPrimitive.Close>

              <p aria-live="polite" className="sr-only">
                {`Showing ${current.title}, ${openIndex + 1} of ${total}`}
              </p>
            </DialogPrimitive.Content>
          )}
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
