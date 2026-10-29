"use client"

import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, ShieldCheck, Users } from "lucide-react"
import type { AboutHeroSettings } from "@/lib/types/about-settings"
import { DEFAULT_ABOUT_PAGE_SETTINGS } from "@/lib/types/about-settings"
import { isSafeMediaUrl } from "@/lib/media-validation"
import { cn } from "@/lib/utils"
import styles from "./about-hero.module.css"

interface AboutHeroProps {
  settings?: AboutHeroSettings
  teamMembers?: { id?: string; name: string; image: string | null }[]
}

export function AboutHero({ settings, teamMembers = [] }: AboutHeroProps) {
  const s = settings || DEFAULT_ABOUT_PAGE_SETTINGS.hero
  const portraits = teamMembers.slice(0, 3)
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({})
  // The journey section is retired; keep its legacy CTA connected to the story.
  const primaryCtaUrl = s.primaryCtaUrl === "#journey" ? "/our-story" : s.primaryCtaUrl
  // Keep the emphasis compatible with edited CMS headlines.
  const line2Words = (s.headlineLine2 || "").trim().split(/\s+/).filter(Boolean)
  const accentCount = line2Words.length > 2 ? 2 : line2Words.length
  const heroAccent = {
    lead: line2Words.slice(0, line2Words.length - accentCount).join(" "),
    accent: line2Words.slice(line2Words.length - accentCount).join(" "),
  }
  const buttonBase = "inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full border px-6 py-3 text-base font-bold"

  return (
    <section data-about-hero className={cn(styles.hero, "relative isolate")} aria-labelledby="about-hero-title">
      <div className="mx-auto max-w-[1288px] px-5 pb-12 pt-4 sm:px-6 sm:pb-16 lg:pt-6">
        <nav className={cn(styles.breadcrumb, "mb-3 sm:mb-4")} aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li><Link href="/" className="inline-flex min-h-11 items-center rounded-sm">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{s.breadcrumbLabel}</li>
          </ol>
        </nav>
        <div data-has-portraits={portraits.length > 0} className={cn(styles.layout, "grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12")}>
          <div className="min-w-0 max-lg:max-w-2xl">
            <h1 id="about-hero-title" className={cn(styles.title, "leading-[1.08] break-words")}>
              <span className="block">{s.headlineLine1}</span>{" "}
              {heroAccent.lead && <span className="block">{heroAccent.lead}</span>}
              {heroAccent.lead && heroAccent.accent ? " " : null}
              {heroAccent.accent ? <span className={cn(styles.accent, "relative inline-block pb-3")}>
                {heroAccent.accent}
                <svg viewBox="0 0 400 18" preserveAspectRatio="none" aria-hidden="true" focusable="false"
                  className={cn(styles.underline, "pointer-events-none absolute bottom-0 left-0 h-3 w-full")}>
                  <path d="M4 12Q160 2 395 9" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span> : null}
            </h1>
            <p className={cn(styles.description, "mt-6 max-w-lg text-base leading-[1.75] sm:text-lg")}>{s.subtitle}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={primaryCtaUrl} className={cn(styles.primary, buttonBase)}
                data-a11y-control data-slot="button" data-variant="default">
                {s.primaryCtaLabel}<ArrowRight size={17} className="shrink-0" aria-hidden="true" />
              </Link>
              <Link href={s.secondaryCtaUrl} className={cn(styles.secondary, buttonBase)}
                data-slot="button" data-variant="outline">
                {s.secondaryCtaLabel}<ArrowUpRight size={17} className="shrink-0" aria-hidden="true" />
              </Link>
            </div>
            {s.trustBadges.length > 0 && <ul className={cn(styles.trust, "mt-7 flex flex-wrap gap-x-7 gap-y-3 pt-5")}>
              {s.trustBadges.map((badge, index) => {
                const Icon = index === 0 ? ShieldCheck : Users
                return <li key={index} className={cn(styles.trustItem, "flex items-center gap-2 text-sm")}>
                  <Icon size={20} className="shrink-0" aria-hidden="true" /><span>{badge}</span>
                </li>
              })}
            </ul>}
          </div>
          {portraits.length > 0 && <figure className="m-0 min-w-0 w-full max-lg:max-w-2xl lg:pt-3">
            <div className={cn("grid gap-3 sm:gap-4", portraits.length === 3
              ? "aspect-[1.1] grid-cols-[1.15fr_1fr] sm:aspect-[1.4] lg:aspect-[1.17]"
              : portraits.length === 2 ? "aspect-[1.1] grid-cols-2" : "aspect-square grid-cols-1")}>
              {portraits.map((member, index) => (
                <div key={member.id || `${member.name}-${index}`} className={cn(styles.photo, "relative overflow-hidden rounded-xl",
                  index === 0 && portraits.length === 3 && "row-span-2 mt-[18px] sm:mt-[26px]")}>
                  <Image src={member.image && isSafeMediaUrl(member.image) && !failedPhotos[member.image] ? member.image : "/image_coming_soon.png"} alt={member.image && isSafeMediaUrl(member.image) && !failedPhotos[member.image] ? `Portrait of ${member.name}` : `Placeholder photo for ${member.name}`}
                    onError={() => { if (member.image && !failedPhotos[member.image]) setFailedPhotos(previous => ({ ...previous, [member.image!]: true })) }}
                    fill loading="eager" fetchPriority={index === 0 ? "high" : "auto"}
                    unoptimized={!!member.image?.startsWith("http")}
                    sizes={index === 0
                      ? "(min-width: 1288px) 312px, (min-width: 1024px) 26vw, (min-width: 640px) 48vw, 50vw"
                      : "(min-width: 1288px) 272px, (min-width: 1024px) 23vw, 43vw"}
                    className="object-cover object-[50%_30%]" />
                </div>
              ))}
            </div>
            {s.badge && <figcaption className={cn(styles.eyebrow, "mt-4 flex items-center gap-3 text-sm font-bold")}>
              <span aria-hidden="true" className={cn(styles.captionLine, "h-px w-8 shrink-0")} />
              {s.badge}
            </figcaption>}
          </figure>}
        </div>
      </div>
    </section>
  )
}
