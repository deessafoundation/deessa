import Link from "next/link"
import { existsSync } from "node:fs"
import { resolve, sep } from "node:path"
import { ArrowDown, ArrowRight, Check, Scale } from "lucide-react"
import type { WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import { WhatWeDoVideoPlayer } from "./what-we-do-video-player"
import { InclusiveSchool } from "./inclusive-school"
import { AwarenessAnimatedStory } from "@/components/whatwedo/awareness-animated-story"
import styles from "./advocacy-detail.module.css"

export function AdvocacyDetail({ content }: { content: WhatWeDoSettings }) {
  const area = content.areas.advocacy
  // All existing area videos belong to Advocacy during this rollout.
  // Keep reading their existing admin fields so saved media is not duplicated or lost.
  const seen = new Set([area.videoSrc])
  const videos = Object.values(content.areas).filter(entry => {
    if (seen.has(entry.videoSrc)) return false
    seen.add(entry.videoSrc)
    return true
  })
  const storySource = content.animatedStory.videoSrc
  const publicRoot = resolve(process.cwd(), "public")
  const storyPath = resolve(publicRoot, `.${storySource}`)
  // The default animated-story MP4 is not supplied yet. Keep its saved content,
  // but do not offer a broken player; uploaded HTTPS media remains supported.
  const storyAvailable = storySource.startsWith("https://") ||
    (storyPath.startsWith(`${publicRoot}${sep}`) && existsSync(storyPath))
  const showStory = content.animatedStory.enabled && storyAvailable && !seen.has(storySource)

  return (
    <div className={styles.page}>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:pb-24">
        <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-2 font-comic text-sm">
          <Link href="/" className={styles.textLink}>Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/whatwedo" className={styles.textLink}>What We Do</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{area.label}</span>
        </nav>

        <header className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <p className={`${styles.eyebrow} mb-5 flex items-center gap-2 font-comic text-xs font-bold uppercase tracking-widest`}>
              <Scale aria-hidden="true" className="size-4" />{area.label}
            </p>
            <h1 className="max-w-xl font-marissa text-4xl leading-tight sm:text-5xl lg:text-6xl">{area.headline}</h1>
            <p className="mt-6 max-w-xl font-comic text-lg leading-relaxed">{area.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#advocacy-videos" className={styles.primary}>Watch our stories<ArrowDown aria-hidden="true" className="size-4" /></Link>
              <Link href={area.ctaHref} className={styles.secondary}>{area.ctaLabel}<ArrowRight aria-hidden="true" className="size-4" /></Link>
            </div>
          </div>
          <WhatWeDoVideoPlayer src={area.videoSrc} label={area.videoLabel} areaLabel={area.label}
            posterSrc={area.posterSrc} playButtonLabel={area.playButtonLabel} />
        </header>

        <section aria-labelledby="advocacy-purpose" className={`${styles.panel} mt-12 grid gap-8 rounded-3xl p-6 sm:p-8 lg:grid-cols-2`}>
          <div>
            <h2 id="advocacy-purpose" className="font-marissa text-3xl leading-tight">{area.panelTitle}</h2>
            <p className="mt-4 font-comic leading-7">{area.description}</p>
          </div>
          <ul className="space-y-4 self-center">
            {area.highlights.map(highlight => (
              <li key={highlight} className="flex items-start gap-3 font-comic">
                <Check aria-hidden="true" className={`${styles.eyebrow} mt-1 size-5 shrink-0`} />{highlight}
              </li>
            ))}
          </ul>
        </section>

        <section id="advocacy-videos" aria-labelledby="advocacy-videos-title" className="scroll-mt-28 pt-16">
          <div className="mb-8 max-w-2xl">
            <p className={`${styles.eyebrow} mb-3 font-comic text-xs font-bold uppercase tracking-widest`}>Watch · Understand · Include</p>
            <h2 id="advocacy-videos-title" className="font-marissa text-3xl sm:text-4xl">Stories that make inclusion real</h2>
            <p className="mt-4 font-comic leading-7">Explore the conversations, practical support, and shared understanding behind our advocacy.</p>
          </div>
          <div className="grid items-start gap-x-8 gap-y-10 md:grid-cols-2">
            {videos.map(video => (
              <article key={video.id} className="min-w-0">
                <WhatWeDoVideoPlayer src={video.videoSrc} posterSrc={video.posterSrc} label={video.videoLabel}
                  areaLabel={area.label} playButtonLabel={video.playButtonLabel} />
                <h3 className="mt-5 font-marissa text-2xl leading-snug">{video.videoLabel}</h3>
                <p className="mt-2 font-comic text-sm leading-7">{video.subtitle}</p>
              </article>
            ))}
          </div>
          {showStory && <AwarenessAnimatedStory content={content.animatedStory} />}
        </section>

        {content.inclusiveSchool.enabled && <InclusiveSchool content={content.inclusiveSchool} />}

        <section aria-labelledby="advocacy-action-title" className="pt-16">
          <h2 id="advocacy-action-title" className="mb-7 font-marissa text-3xl sm:text-4xl">{area.learningTitle}</h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {area.learningItems.map((item, index) => (
              <li key={item.title} className={`${styles.panel} rounded-2xl p-6 sm:p-8`}>
                <span aria-hidden="true" className={`${styles.eyebrow} font-marissa text-3xl`}>0{index + 1}</span>
                <h3 className="mt-4 font-marissa text-2xl">{item.title}</h3>
                <p className="mt-3 font-comic text-sm leading-7">{item.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="advocacy-audience-title" className="grid gap-6 border-y py-8 mt-12 lg:grid-cols-2">
          <div><h2 id="advocacy-audience-title" className="font-marissa text-3xl">{area.audienceTitle}</h2><p className="mt-3 font-comic leading-7">{area.audienceDescription}</p></div>
          <ul className="flex flex-wrap items-center gap-3">
            {area.audiences.map(audience => <li key={audience} className={`${styles.panel} rounded-full px-5 py-3 font-comic text-sm`}>{audience}</li>)}
          </ul>
        </section>

        <section aria-labelledby="advocacy-closing-title" className={`${styles.closing} mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl p-7 sm:p-10 lg:flex-row lg:items-center`}>
          <div><h2 id="advocacy-closing-title" className="font-marissa text-3xl sm:text-4xl">{area.closingTitle}</h2><p className="mt-3 max-w-2xl font-comic leading-7">{area.closingDescription}</p></div>
          <Link href={area.closingButtonHref} className={styles.secondary}>{area.closingButtonLabel}<ArrowRight aria-hidden="true" className="size-4" /></Link>
        </section>
      </div>
    </div>
  )
}
