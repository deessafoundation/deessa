import Link from "next/link"
import type { WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import { ArrowRight, BookOpen, FileText, Megaphone, Scale, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import styles from "./whatwedo-pillars.module.css"

type PillarAccent = "sky" | "mint" | "sunny" | "lavender"

const PILLARS: {
  slug: string
  title: string
  ariaTitle: string
  description: string
  icon: LucideIcon
  accent: PillarAccent
}[] = [
  {
    slug: "awareness",
    title: "Awareness & Community Engagement",
    ariaTitle: "Awareness and Community Engagement",
    description:
      "We break the silence. Through community campaigns, social media, podcasts, and public conversations, we challenge myths and replace stigma with understanding.",
    icon: Megaphone,
    accent: "sky",
  },
  {
    slug: "training",
    title: "Training",
    ariaTitle: "Training",
    description:
      "We equip parents, teachers, health workers, and caregivers with the skills to spot autism early and support every child, the right way.",
    icon: BookOpen,
    accent: "mint",
  },
  {
    slug: "resources",
    title: "Resources",
    ariaTitle: "Resources",
    description:
      "No family should have to navigate this journey alone. We build simple, accessible guides and tools for parents, educators, and professionals.",
    icon: FileText,
    accent: "sunny",
  },
  {
    slug: "advocacy",
    title: "Advocacy",
    ariaTitle: "Advocacy",
    description:
      "We push for inclusive schools and stronger policies that protect every child's rights, so inclusion becomes a right, not a privilege.",
    icon: Scale,
    accent: "lavender",
  },
]

/** The four core-area cards on /whatwedo. Colours live in whatwedo-pillars.module.css (data-accent). */
export function WhatWeDoPillars({ cards }: { cards: WhatWeDoSettings["cards"] }) {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {PILLARS.map((layout, index) => {
        const pillar = { ...layout, ...cards[index] }
        const Icon = pillar.icon
        return (
          <li key={pillar.slug} className="h-full">
            <Link
              href={pillar.href}
              aria-label={`${pillar.buttonLabel}: ${pillar.title}`}
              data-accent={pillar.accent}
              className={cn(
                styles.card,
                "group relative flex h-full flex-col overflow-hidden rounded-3xl focus-visible:outline-none",
                "motion-reduce:transition-none",
              )}
            >
              <span aria-hidden="true" className={styles.bar} />

              <div className={styles.head}>
                <span className={styles.iconTile}>
                  <Icon aria-hidden="true" className="size-7" strokeWidth={1.8} />
                </span>
                <span aria-hidden="true" className={cn(styles.index, "font-comic text-4xl font-bold")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex flex-1 flex-col px-6 pb-6 pt-5 text-left sm:px-7">
                <h3 className="mb-3 font-marissa text-[1.375rem] leading-tight text-black [-webkit-text-stroke:0.6px_currentColor]">
                  {pillar.title}
                </h3>
                <p className="mb-6 font-comic text-[0.95rem] leading-relaxed text-black [-webkit-text-stroke:0.25px_currentColor]">
                  {pillar.description}
                </p>

                <span
                  className={cn(
                    styles.footer,
                    "mt-auto flex items-center justify-between gap-3 pt-4 font-comic text-[0.95rem] font-bold text-black",
                  )}
                >
                  {pillar.buttonLabel}
                  <span aria-hidden="true" className={styles.chip}>
                    <ArrowRight className={cn(styles.chipIcon, "size-4")} />
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
