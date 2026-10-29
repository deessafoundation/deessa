"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useAccessibility } from "@/lib/hooks/use-accessibility"
import type { AboutPageSettings } from "@/lib/types/about-settings"
import { DEFAULT_ADDITIONAL_ABOUT_SETTINGS } from "@/lib/types/about-sections"
import { Cog, Lightbulb, Network, UsersRound, Wrench } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { homeUi } from "@/components/home/home-ui"
import styles from "./org-structure.module.css"

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
} as const

type Accent = "vision" | "board" | "advisory" | "assembly"

const accentStyles: Record<Accent, { icon: LucideIcon; color: string; bg: string }> = {
  vision: { icon: Lightbulb, color: "#7848a2", bg: "#f3ebfa" },
  board: { icon: Network, color: "#228cc4", bg: "#e9f5fc" },
  advisory: { icon: UsersRound, color: "#55a748", bg: "#edf8e9" },
  assembly: { icon: UsersRound, color: "#e88b23", bg: "#fff2e5" },
}

function SectionHeader({ label, title, accent, sub, reduced }: { label: string; title: string; accent?: string; sub?: string; reduced: boolean }) {
  return (
    <motion.div {...reveal} initial={reduced ? false : reveal.initial} transition={{ duration: 0.45 }} className="mb-8 max-w-4xl md:mb-10">
      <h2 id="governance-heading" className={styles.headerLabel}>
        {label}
      </h2>
      <p className={styles.headerTitle}>
        {title}
        {accent ? (
          <>
            {" "}
            <span className={homeUi.accent}>{accent}</span>
          </>
        ) : null}
      </p>
      {sub && <p className={styles.headerSub}>{sub}</p>}
    </motion.div>
  )
}

export function OrgStructure({ settings = DEFAULT_ADDITIONAL_ABOUT_SETTINGS.governance }: { settings?: AboutPageSettings["governance"] }) {
  const systemReduced = useReducedMotion()
  const { preferences } = useAccessibility()
  const reduced = !!systemReduced || preferences.reduceMotion || preferences.sensoryFriendly
  const tiers = settings.tiers
  const operationalTeams = settings.teams
  return (
    <section className={styles.section} id="organization" aria-labelledby="governance-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={settings.label}
          title={settings.title}
          accent={settings.accent}
          sub={settings.description}
          reduced={reduced}
        />

        <ol className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {tiers.map((tier, i) => {
            const style = accentStyles[tier.accent]
            const Icon = style.icon
            return (
              <li key={tier.id} className="min-w-0">
                <motion.article {...reveal} initial={reduced ? false : reveal.initial} transition={{ duration: 0.4, delay: i * 0.06 }} className={styles.tierCard}>
                  <div className="flex items-start gap-3.5">
                    <div className={styles.tierIcon} style={{ color: style.color, backgroundColor: style.bg }} aria-hidden="true">
                      <Icon className="size-7" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className={styles.tierTitle}>{tier.title}</h3>
                      <p className={styles.tierSubtitle}>{tier.subtitle}</p>
                    </div>
                  </div>
                  <p className={styles.tierDesc}>{tier.description}</p>
                </motion.article>
              </li>
            )
          })}
        </ol>

        <motion.div {...reveal} initial={reduced ? false : reveal.initial} transition={{ duration: 0.45 }} className={styles.opContainer}>
          <div className={styles.opHeader}>
            <Cog className="size-7" strokeWidth={2.5} aria-hidden="true" />
            <h3 className={styles.opHeaderText}>{settings.operationalTitle}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {operationalTeams.map((team, i) => {
              const Icon = team.id === "working" ? UsersRound : Wrench
              return (
                <motion.article
                  key={team.id}
                  {...reveal}
                  initial={reduced ? false : reveal.initial}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={styles.opCard}
                >
                  <div className={styles.opIcon} aria-hidden="true">
                    <Icon className="size-7" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className={styles.opTitle}>{team.title}</h4>
                    <p className={styles.opDesc}>{team.description}</p>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
