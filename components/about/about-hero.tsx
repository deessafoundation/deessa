"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, FileText, ShieldCheck, Users } from "lucide-react"
import type { AboutHeroSettings } from "@/lib/types/about-settings"
import { DEFAULT_ABOUT_PAGE_SETTINGS } from "@/lib/types/about-settings"
import { homeUi } from "@/components/home/home-ui"
import styles from "./about-hero.module.css"

interface AboutHeroProps {
  settings?: AboutHeroSettings
}

export function AboutHero({ settings }: AboutHeroProps) {
  const s = settings || DEFAULT_ABOUT_PAGE_SETTINGS.hero
  // Highlight the last two words of line 2 ("Nepal's Change.") in ocean blue with the yellow stroke.
  const line2Words = (s.headlineLine2 || "").trim().split(/\s+/).filter(Boolean)
  const accentCount = line2Words.length > 2 ? 2 : line2Words.length
  const heroAccent = {
    lead: line2Words.slice(0, line2Words.length - accentCount).join(" "),
    accent: line2Words.slice(line2Words.length - accentCount).join(" "),
  }

  return (
    <section data-about-hero className={styles.hero} aria-labelledby="about-hero-title">
      <div className={styles.content}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Who We Are</span>
        </nav>
        <p className={styles.eyebrow}>{s.badge}</p>
        <h1 id="about-hero-title" className={styles.title}>
          {s.headlineLine1} {heroAccent.lead}
          {heroAccent.lead && heroAccent.accent ? " " : null}
          {heroAccent.accent ? <span className={homeUi.accent}>{heroAccent.accent}</span> : null}
        </h1>
        <p className={styles.description}>{s.subtitle}</p>
        <div className={styles.actions}>
          <Link
            href={s.primaryCtaUrl}
            className={styles.primary}
            data-a11y-control
          >
            {s.primaryCtaLabel}<ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link
            href={s.secondaryCtaUrl}
            className={styles.secondary}
            data-slot="button"
            data-variant="outline"
          >
            {s.secondaryCtaLabel}
          </Link>
        </div>
        <div className={styles.trust}>
          {s.trustBadges.map((badge, index) => {
            const Icon = index === 0 ? ShieldCheck : Users
            return (
              <div key={badge} className={styles.trustItem}>
                <Icon size={30} aria-hidden="true" />
                <span>{badge}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className={styles.artwork}>
        <Image
          src="/about/hero/about_hero_img.png"
          alt="Unlocking Potential, Embracing Neurodiversity with colourful craft materials and a child's hand."
          width={752}
          height={450}
          priority
          sizes="(max-width: 900px) 100vw, 60vw"
        />
      </div>
    </section>
  )
}
