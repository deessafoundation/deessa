import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { WhatWeDoCard, WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import { PILLAR_ICONS } from "./pillar-icons"
import styles from "./what-we-do-empty-state.module.css"

export function WhatWeDoEmptyState({ area, card }: {
  area: WhatWeDoSettings["areas"]["awareness"]
  card?: WhatWeDoCard
}) {
  const Icon = PILLAR_ICONS[card?.icon || "book-open"]
  const title = card?.title || area.label
  return (
    <div className={styles.page}>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:pb-24">
        <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-2 font-comic text-sm">
          <Link href="/" className={styles.textLink}>Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/whatwedo" className={styles.textLink}>What We Do</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        <header className="mx-auto max-w-3xl text-center">
          <p className={`${styles.eyebrow} mb-4 font-comic text-xs font-bold uppercase tracking-widest`}>Our areas of work</p>
          <h1 className="font-marissa text-4xl leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 font-comic text-lg leading-relaxed">{card?.description || area.subtitle}</p>
        </header>
        <section aria-labelledby="area-coming-soon" className={`${styles.panel} mx-auto mt-10 max-w-3xl rounded-3xl p-7 text-center sm:p-12`}>
          <div className={`${styles.icon} mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl`}>
            <Icon aria-hidden="true" className="size-9" strokeWidth={1.6} />
          </div>
          <span className={`${styles.badge} inline-block rounded-full px-4 py-2 font-comic text-xs font-bold uppercase tracking-widest`}>Coming soon</span>
          <h2 id="area-coming-soon" className="mt-5 font-marissa text-3xl leading-tight sm:text-4xl">This section is taking shape</h2>
          <p className="mx-auto mt-5 max-w-lg font-comic leading-7">We’re preparing stories, information, and practical guidance for this area of our work. Please check back for updates.</p>
          <p className="mx-auto mt-3 max-w-lg font-comic leading-7">In the meantime, explore our Advocacy page for videos and conversations about inclusion.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/whatwedo/advocacy" className={`${styles.primary} font-comic`}>Explore Advocacy<ArrowRight aria-hidden="true" className="size-4" /></Link>
            <Link href="/whatwedo" className={`${styles.secondary} font-comic`}><ArrowLeft aria-hidden="true" className="size-4" />Back to What We Do</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
