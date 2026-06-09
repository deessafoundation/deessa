"use client"

import { useState } from "react"
import Image from "next/image"

type Panel = {
  src: string
  alt?: string
  label?: string
  title?: string
  caption?: string
  tint?: string
  height?: string
  objectPosition?: string
  focalX?: number
  focalY?: number
}

export default function PhotoWall({
  panels = [],
  className = "",
  editable = false,
  onPickFocal,
  showFocal = false,
  size = "default",
  eyebrow,
  headline,
  description,
  badges = [],
}: {
  panels: Panel[]
  className?: string
  editable?: boolean
  showFocal?: boolean
  onPickFocal?: (index: number, xPercent: number, yPercent: number) => void
  size?: "default" | "compact"
  eyebrow?: string
  headline?: string
  description?: string
  badges?: string[]
}) {
  const [activeMobilePanel, setActiveMobilePanel] = useState<number | null>(null)
  const barHeights = ["55%", "66%", "78%", "90%", "100%", "90%", "78%", "66%", "55%"]
  const wallHeightClass = size === "compact" ? "h-[432px] sm:h-[495px] lg:h-[540px]" : "h-[882px]"
  const wallCardClass = size === "compact" ? "rounded-[24px] p-2 sm:p-3" : "rounded-[38px] p-4 sm:p-5"
  const stripWidthClass = size === "compact" ? "w-[120px] sm:w-[135px] lg:w-[150px]" : "w-[150px] sm:w-[164px] lg:w-[176px]"
  const hasHeroCopy = Boolean(eyebrow || headline || description || (badges && badges.length > 0))
  const shellClassName = hasHeroCopy ? "relative min-h-[581px] sm:min-h-[658px] lg:min-h-[704px]" : "relative"

  return (
    <div className={className}>
      <div className={`${shellClassName} overflow-hidden bg-transparent shadow-none p-0 ${hasHeroCopy ? "rounded-none" : wallCardClass}`}>
        {hasHeroCopy && (
          <div className="pointer-events-none absolute inset-0 z-20 hidden sm:block">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,20,33,0.82)_0%,rgba(12,20,33,0.72)_18%,rgba(12,20,33,0.44)_40%,rgba(12,20,33,0.18)_62%,rgba(12,20,33,0.08)_78%,rgba(12,20,33,0.03)_90%,rgba(12,20,33,0)_100%)]" />
            <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#29b6c8]/22 blur-3xl" />
            <div className="absolute right-[-4rem] top-24 h-80 w-80 rounded-full bg-white/18 blur-3xl" />
            <div className="absolute inset-y-0 right-0 w-[50%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),rgba(255,255,255,0.1)_42%,transparent_74%)] opacity-80" />
            <div className="absolute inset-0 flex items-center">
              <div className="w-full px-5 sm:px-7 lg:px-10">
                <div className="max-w-2xl text-white">
                  {eyebrow && (
                    <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/80 backdrop-blur-sm">
                      {eyebrow}
                    </div>
                  )}
                  {headline && (
                    <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-[5.2rem]">
                      {headline}
                    </h1>
                  )}
                  {description && (
                    <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
                      {description}
                    </p>
                  )}
                  {badges.length > 0 && (
                    <div className="mt-7 flex flex-wrap gap-3">
                      {badges.map((badge) => (
                        <span key={badge} className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={`relative z-10 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${hasHeroCopy ? "pt-8 sm:pt-[85px]" : ""}`}>
          <div className={`flex min-w-max items-center justify-center gap-3 sm:gap-4 ${hasHeroCopy ? "justify-end pr-3 sm:pr-8 lg:pr-12" : ""}`}>
            {panels.map((panel, index) => (
              <div
                key={`${panel?.alt || panel?.src || 'panel'}-${index}`}
                className={`flex ${wallHeightClass} ${stripWidthClass} shrink-0 items-center justify-center`}
                onClick={() => {
                  if (typeof window === "undefined" || window.innerWidth >= 640) return
                  setActiveMobilePanel((current) => (current === index ? null : index))
                }}
              >
                <article
                  className={`group relative w-full overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_18px_40px_rgba(31,41,55,0.15)] transition-transform duration-500 ${editable ? 'cursor-crosshair' : 'hover:-translate-y-2'}`}
                  style={{ height: barHeights[index] }}
                  onPointerDown={(e: any) => {
                    if (!editable || !onPickFocal) return
                    const el = e.currentTarget as HTMLElement
                    try {
                      el.setPointerCapture?.(e.pointerId)
                    } catch (err) {
                      // ignore
                    }
                    const rect = el.getBoundingClientRect()
                    const x = ((e as any).clientX - rect.left) / rect.width
                    const y = ((e as any).clientY - rect.top) / rect.height
                    const xPct = Math.round(x * 100)
                    const yPct = Math.round(y * 100)
                    onPickFocal(index, xPct, yPct)
                    ;(e.currentTarget as any).__isDragging = true
                  }
                  }
                  onPointerMove={(e: any) => {
                    if (!editable || !onPickFocal) return
                    const dragging = (e.currentTarget as any).__isDragging
                    if (!dragging) return
                    const el = e.currentTarget as HTMLElement
                    const rect = el.getBoundingClientRect()
                    const x = ((e as any).clientX - rect.left) / rect.width
                    const y = ((e as any).clientY - rect.top) / rect.height
                    const xPct = Math.round(Math.max(0, Math.min(100, x * 100)))
                    const yPct = Math.round(Math.max(0, Math.min(100, y * 100)))
                    onPickFocal(index, xPct, yPct)
                  }
                  }
                  onPointerUp={(e: any) => {
                    if (!editable) return
                    try {
                      e.currentTarget.releasePointerCapture?.(e.pointerId)
                    } catch (err) {
                      // ignore
                    }
                    ;(e.currentTarget as any).__isDragging = false
                  }}
                >
                  {panel?.src ? (
                    <Image
                      src={panel.src}
                      alt={panel.alt || panel.title || `Photo ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 176px, (min-width: 640px) 164px, 150px"
                      className="object-cover"
                      style={{
                        objectPosition: panel?.objectPosition
                          ? panel.objectPosition
                          : panel?.focalX !== undefined && panel?.focalY !== undefined
                          ? `${panel.focalX}% ${panel.focalY}%`
                          : index === 4
                          ? '50% 28%'
                          : index < 4
                          ? '50% 40%'
                          : '50% 28%',
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">No image</div>
                  )}

                  {showFocal && (panel?.focalX !== undefined || panel?.focalY !== undefined || panel?.objectPosition) && (
                    (() => {
                      let left = '50%'
                      let top = '50%'
                      if (panel?.objectPosition) {
                        left = panel.objectPosition.split(' ')[0] || left
                        top = panel.objectPosition.split(' ')[1] || top
                      } else if (panel?.focalX !== undefined && panel?.focalY !== undefined) {
                        left = `${panel.focalX}%`
                        top = `${panel.focalY}%`
                      }
                      return (
                        <div style={{ left, top }} className="absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 ring-2 ring-primary pointer-events-none" />
                      )
                    })()
                  )}

                  {(panel?.label || panel?.title || panel?.caption) && (
                    <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pb-4 pt-12 text-white transition-all duration-300 ease-out ${activeMobilePanel === index ? "opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"}`}>
                      {panel?.label && <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">{panel.label}</div>}
                      {panel?.title && <div className="mt-1 text-sm font-semibold leading-tight sm:text-base">{panel.title}</div>}
                      {panel?.caption && <div className="mt-1 text-[11px] leading-relaxed text-white/80 sm:text-xs">{panel.caption}</div>}
                    </div>
                  )}
                </article>
              </div>
            ))}
          </div>
        </div>
        {hasHeroCopy && (
          <div className="relative z-20 mt-4 px-5 pb-1 sm:hidden">
            <div className="max-w-[92vw] text-left text-[#1f2a37]">
              {eyebrow && (
                <div className="inline-flex rounded-full border border-[#29b6c8]/20 bg-white/70 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#1a8fa0] shadow-sm backdrop-blur-sm">
                  {eyebrow}
                </div>
              )}
              {headline && (
                <h1 className="mt-4 max-w-[18ch] text-[2.2rem] font-semibold leading-[0.95] tracking-[-0.04em] text-[#182433]">
                  {headline}
                </h1>
              )}
              {description && (
                <p className="mt-4 max-w-[36ch] whitespace-pre-line text-[0.95rem] leading-6 text-[#405164]">
                  {description}
                </p>
              )}
              {badges.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {badges.map((badge) => (
                    <span key={badge} className="inline-flex items-center rounded-full border border-[#29b6c8]/20 bg-white/80 px-3 py-1.5 text-[0.72rem] font-medium text-[#314353] shadow-sm backdrop-blur-sm">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
