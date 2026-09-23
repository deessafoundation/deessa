"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, FileText, ShieldCheck, Users } from "lucide-react"
import type { AboutHeroSettings } from "@/lib/types/about-settings"
import { DEFAULT_ABOUT_PAGE_SETTINGS } from "@/lib/types/about-settings"
import styles from "./about-hero.module.css"

interface AboutHeroProps {
  settings?: AboutHeroSettings
}

export function AboutHero({ settings }: AboutHeroProps) {
  const s = settings || DEFAULT_ABOUT_PAGE_SETTINGS.hero

  return (
    <section className={styles.hero} aria-labelledby="about-hero-title">
      <div className={styles.content}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Who We Are</span>
        </nav>
        <p className={styles.eyebrow}>{s.badge}</p>
        <h1 id="about-hero-title" className={styles.title}>
          {s.headlineLine1} {s.headlineLine2}
        </h1>
        <p className={styles.description}>{s.subtitle}</p>
        <div className={styles.actions}>
          <Link href={s.primaryCtaUrl} className={styles.primary}>
            {s.primaryCtaLabel}<ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link href={s.secondaryCtaUrl} className={styles.secondary}>
            <FileText size={16} aria-hidden="true" />{s.secondaryCtaLabel}
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
          alt="Unlocking Potential, Embracing Neurodiversity — colourful craft materials and a child's hand."
          width={752}
          height={450}
          priority
          sizes="(max-width: 900px) 100vw, 60vw"
        />
      </div>
    </section>
  )
}
