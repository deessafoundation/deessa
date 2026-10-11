import Link from "next/link"
import type { ReactNode } from "react"
import type { WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import { DEFAULT_PILLAR_LAYOUT } from "@/lib/types/what-we-do-settings"
import { PILLAR_ICONS, PILLAR_ARROWS } from "./pillar-icons"
import { cn } from "@/lib/utils"
import styles from "./pillar-card.module.css"

/** Content and presentation come from the validated admin settings. */
const columnClasses = {
  "1": "grid-cols-1",
  "2": "grid-cols-1 sm:grid-cols-2",
  "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}

function PillarSurface({ pillar, preview, children }: { pillar: WhatWeDoSettings["cards"][number]; preview: boolean; children: ReactNode }) {
  const className = cn(styles.card, "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] focus-visible:outline-none motion-reduce:transition-none")
  // Only the admin preview is non-interactive; public cards open their area pages.
  if (preview) {
    return <article data-tone={pillar.accent} data-paused="true" className={className}>{children}</article>
  }
  return <Link href={pillar.href} aria-label={`${pillar.buttonLabel}: ${pillar.title}`} data-tone={pillar.accent} className={className}>{children}</Link>
}

export function WhatWeDoPillars({ cards, layout = DEFAULT_PILLAR_LAYOUT, preview = false }: { cards: WhatWeDoSettings["cards"]; layout?: WhatWeDoSettings["cardsLayout"]; preview?: boolean }) {
  return (
    <ul role="list" className={cn("grid", layout.spacing === "compact" ? "gap-3" : "gap-4 sm:gap-6", preview ? "grid-cols-1" : columnClasses[layout.columns])}>
      {/* Temporary Advocacy-first rollout; retain saved ordering for the other cards. */}
      {cards.filter(card => preview || card.enabled).sort((a, b) => Number(b.slug === "advocacy") - Number(a.slug === "advocacy")).map(pillar => {
        const Arrow = PILLAR_ARROWS[pillar.arrow]
        const Icon = PILLAR_ICONS[pillar.icon]
        return (
          <li key={pillar.slug} className="h-full">
            <PillarSurface pillar={pillar} preview={preview}>
              {pillar.showDecoration && <span aria-hidden="true" className={styles.blob} />}
              {pillar.showIcon && <span aria-hidden="true" data-pillar-icon className={styles.icon}>
                <Icon className="size-6" strokeWidth={1.9} />
              </span>}
              <div className="flex flex-1 flex-col p-6 text-left sm:p-7">
                {pillar.tag && <p className={cn(styles.tag, "font-comic")}>
                  <span aria-hidden="true" className={styles.tagDot} />
                  {pillar.tag}
                </p>}
                <h3 className={cn(styles.title, "mb-3 mt-12 font-marissa text-[1.3rem] leading-snug break-words")}>
                  {pillar.title.split("&").map((part, i, arr) =>
                    i === arr.length - 1 ? (
                      <span key={i}>{part}</span>
                    ) : (
                      <span key={i}>
                        {part}
                        <span className="font-normal">&</span>
                      </span>
                    ),
                  )}
                </h3>
                <p className={cn(styles.desc, "font-comic text-[0.95rem] leading-relaxed")}>
                  {pillar.description}
                </p>

                <span
                  className={cn(
                    styles.cta,
                    "mt-auto flex items-center justify-between gap-3 pt-7 font-comic text-[0.95rem] font-bold",
                  )}
                >
                  <span className={styles.ctaLabel}>{pillar.buttonLabel}</span>
                  {pillar.showArrow && <span aria-hidden="true" className={styles.ctaArrow}>
                    <Arrow className="size-4" />
                  </span>}
                </span>
              </div>
            </PillarSurface>
          </li>
        )
      })}
    </ul>
  )
}

