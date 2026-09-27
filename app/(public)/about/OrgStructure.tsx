"use client"

import { motion } from "framer-motion"
import { Cog, Lightbulb, Network, UsersRound, Wrench } from "lucide-react"
import type { LucideIcon } from "lucide-react"

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
      <h2 id="governance-heading" className="font-comic text-xs font-bold uppercase tracking-widest leading-[1.12] text-[#15151c]">
        {label}
      </h2>
      <p className="font-marissa mt-1 text-3xl leading-[1.25] text-[#0b76b7] md:text-[40px]" style={{ WebkitTextStroke: "0.7px currentColor" }}>
        {title}
      </p>
      {sub && <p className="font-dm-sans mt-2 max-w-4xl text-[15px] leading-relaxed text-[#495a70] sm:text-base">{sub}</p>}
    </motion.div>
  )
}

export function OrgStructure() {
  return (
    <section className="scroll-mt-24 bg-white py-14 sm:py-20 lg:py-[90px]" id="organization" aria-labelledby="governance-heading">
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
                <motion.article {...reveal} transition={{ duration: 0.4, delay: i * 0.06 }} className="flex h-full flex-col rounded-xl border border-[#e2eef6] bg-[#f7fbfe] p-5 shadow-[0_4px_18px_rgba(25,100,145,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#bfe1f4] hover:shadow-[0_10px_26px_rgba(25,100,145,0.1)] sm:p-6">
                  <div className="flex items-start gap-3.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12" style={{ color: style.color, backgroundColor: style.bg }} aria-hidden="true">
                      <Icon className="size-7" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-comic text-[17px] font-bold leading-tight text-[#134b76]">{tier.title}</h3>
                      <p className="font-comic mt-1 text-[15px] font-bold italic leading-snug text-[#276c9f]">{tier.subtitle}</p>
                    </div>
                  </div>
                  <p className="font-dm-sans mt-5 text-[15px] leading-[1.65] text-[#354b60]">{tier.description}</p>
                </motion.article>
              </li>
            )
          })}
        </ol>

        <motion.div {...reveal} transition={{ duration: 0.45 }} className="mt-5 rounded-xl border border-[#e2eef6] bg-[#f7fbfe] p-4 sm:p-5 lg:mt-6">
          <div className="mb-4 flex items-center gap-2.5 text-[#1889c7]">
            <Cog className="size-7" strokeWidth={2.5} aria-hidden="true" />
            <h3 className="font-comic text-lg font-bold text-[#134b76] sm:text-xl">Operational Level</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {operationalTeams.map((team, i) => {
              const Icon = team.icon
              return (
                <motion.article
                  key={team.title}
                  {...reveal}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-4 rounded-lg border border-[#eaf2f8] bg-white p-5 shadow-[0_3px_12px_rgba(25,100,145,0.04)] sm:items-center sm:p-6"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f5fc] text-[#168ac8]" aria-hidden="true">
                    <Icon className="size-7" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="font-comic text-[17px] font-bold text-[#134b76]">{team.title}</h4>
                    <p className="font-dm-sans mt-1 text-[15px] leading-relaxed text-[#354b60]">{team.description}</p>
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
