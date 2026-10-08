import Link from "next/link"
import type { WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import { ArrowRight, BookOpen, FileText, Megaphone, Scale, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import styles from "./pillar-card.module.css"

type PillarAccent = "sky" | "mint" | "sunny" | "lavender"

const PILLARS: {
  slug: string
  title: string
  tag: string
  description: string
  icon: LucideIcon
  accent: PillarAccent
}[] = [
  {
    slug: "awareness",
    title: "Awareness & Community Engagement",
    tag: "Communities",
    description:
      "We break the silence. Through community campaigns, social media, podcasts, and public conversations, we challenge myths and replace stigma with understanding.",
    icon: Megaphone,
    accent: "sky",
  },
  {
    slug: "training",
    title: "Training",
    tag: "Trained",
    description:
      "We equip parents, teachers, health workers, and caregivers with the skills to spot autism early and support every child, the right way.",
    icon: BookOpen,
    accent: "mint",
  },
  {
    slug: "resources",
    title: "Resources",
    tag: "Resources",
    description:
      "No family should have to navigate this journey alone. We build simple, accessible guides and tools for parents, educators, and professionals.",
    icon: FileText,
    accent: "sunny",
  },
  {
    slug: "advocacy",
    title: "Advocacy",
    tag: "Policies",
    description:
      "We push for inclusive schools and stronger policies that protect every child's rights, so inclusion becomes a right, not a privilege.",
    icon: Scale,
    accent: "lavender",
  },
]

/** The four core areas, using the same card styles as the homepage. */
export function WhatWeDoPillars({ cards }: { cards: WhatWeDoSettings["cards"] }) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      {PILLARS.map((layout, index) => {
        const pillar = { ...layout, ...cards[index] }
        const Icon = pillar.icon
        return (
          <li key={pillar.slug} className="h-full">
            <Link
              href={pillar.href}
              aria-label={`${pillar.buttonLabel}: ${pillar.title}`}
              data-tone={pillar.accent}
              className={cn(
                styles.card,
                "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] focus-visible:outline-none",
                "motion-reduce:transition-none",
              )}
            >
              <span aria-hidden="true" className={styles.blob} />
              <span aria-hidden="true" data-pillar-icon className={styles.icon}>
                <Icon className="size-6" strokeWidth={1.9} />
              </span>
              <div className="flex flex-1 flex-col p-6 text-left sm:p-7">
                <p className={cn(styles.tag, "font-comic")}>
                  <span aria-hidden="true" className={styles.tagDot} />
                  {pillar.tag}
                </p>
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
                  <span aria-hidden="true" className={styles.ctaArrow}>
                    <ArrowRight className="size-4" />
                  </span>
                </span>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
