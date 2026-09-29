"use client"

import { motion } from "framer-motion"
import { Cog, Lightbulb, Network, UsersRound, Wrench } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import styles from "./org-structure.module.css"

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
} as const

type Accent = "vision" | "board" | "advisory" | "assembly"

interface Tier {
  title: string
  subtitle: string
  description: string
  accent: Accent
}

const tiers: Tier[] = [
  {
    title: "Founding Vision",
    subtitle: "Concept Designer & Co-Founders",
    description:
      "The minds behind the Foundation shape its idea, mission, and direction from the start.",
    accent: "vision",
  },
  {
    title: "Governing Board",
    subtitle: "Executive Board",
    description:
      "The Executive Board leads the Foundation's strategic direction, legal oversight, governance, accountability, and management.",
    accent: "board",
  },
  {
    title: "Advisory Circle",
    subtitle: "Advisory Board & Thematic Advisors",
    description:
      "Senior advisors and thematic experts guide the Foundation's strategy, credibility, and direction through institutional oversight and program expertise.",
    accent: "advisory",
  },
  {
    title: "General Assembly",
    subtitle: "General Members",
    description:
      "The General Assembly is the Foundation's highest authority. Its members elect the Executive Board and hold it accountable.",
    accent: "assembly",
  },
]

const operationalTeams = [
  {
    icon: UsersRound,
    title: "Working Team",
    description: "Handles the Foundation's day-to-day operations and management.",
  },
  {
    icon: Wrench,
    title: "Technical Team",
    description: "Experts who serve the Foundation, each in their own area of expertise.",
  },
]

const accentStyles: Record<Accent, { icon: LucideIcon; color: string; bg: string }> = {
  vision: { icon: Lightbulb, color: "#7848a2", bg: "#f3ebfa" },
  board: { icon: Network, color: "#228cc4", bg: "#e9f5fc" },
  advisory: { icon: UsersRound, color: "#55a748", bg: "#edf8e9" },
  assembly: { icon: UsersRound, color: "#e88b23", bg: "#fff2e5" },
}

function SectionHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <motion.div {...reveal} transition={{ duration: 0.45 }} className="mb-8 max-w-4xl md:mb-10">
      <h2 id="governance-heading" className={styles.headerLabel}>
        {label}
      </h2>
      <p className={styles.headerTitle}>
        {title}
      </p>
      {sub && <p className={styles.headerSub}>{sub}</p>}
    </motion.div>
  )
}

export function OrgStructure() {
  return (
    <section className={styles.section} id="organization" aria-labelledby="governance-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Governance"
          title="How the Foundation Is Organized"
          sub="Born from experience. United by purpose. The Foundation brings like-minded people together to build an inclusive society through strong governance."
        />

        <ol className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {tiers.map((tier, i) => {
            const style = accentStyles[tier.accent]
            const Icon = style.icon
            return (
              <li key={tier.title} className="min-w-0">
                <motion.article {...reveal} transition={{ duration: 0.4, delay: i * 0.06 }} className={styles.tierCard}>
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

        <motion.div {...reveal} transition={{ duration: 0.45 }} className={styles.opContainer}>
          <div className={styles.opHeader}>
            <Cog className="size-7" strokeWidth={2.5} aria-hidden="true" />
            <h3 className={styles.opHeaderText}>Operational Level</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {operationalTeams.map((team, i) => {
              const Icon = team.icon
              return (
                <motion.article
                  key={team.title}
                  {...reveal}
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
