"use client"

import { motion } from "framer-motion"
import { ChevronDown, Users, Wrench } from "lucide-react"

const TEAL = "#29b6c8"
const DARK = "#1a1a2e"

/* Shared scroll-reveal props (matches AboutSections) */
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
} as const

type Accent = "vision" | "board" | "advisory" | "assembly"

interface Tier {
  title: string
  subtitle: string
  description: string
  accent: Accent
}

/**
 * Governance hierarchy, top → bottom. Content provided by the Foundation.
 * The four vertical tiers form the governance chain; the operational level
 * (Working + Technical teams) branches into two parallel columns below.
 */
const tiers: Tier[] = [
  {
    title: "Founding Vision",
    subtitle: "Concept Designer & Co-Founders",
    description:
      "The minds behind the Foundation — shaping its idea, mission, and direction from the start.",
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
      "Senior advisors and thematic experts guiding the Foundation's strategy, credibility, and direction — from institutional oversight to focused expertise in programs.",
    accent: "advisory",
  },
  {
    title: "General Assembly",
    subtitle: "General Members",
    description:
      "The Foundation's highest authority — every member has a right, and together they elect and hold the Executive Board accountable.",
    accent: "assembly",
  },
]

const operationalTeams = [
  {
    icon: Users,
    title: "Working Team",
    description: "Handles the Foundation's day-to-day operations and management.",
  },
  {
    icon: Wrench,
    title: "Technical Team",
    description: "Experts who serve the Foundation, each in their own area of expertise.",
  },
]

/* Accent styling per tier — 'vision' and 'assembly' are highlighted like the
   reference (warm cream border + teal border), the middle tiers are neutral. */
const accentStyles: Record<Accent, { border: string; bg: string; bar: string }> = {
  vision: { border: "rgba(212,163,71,0.55)", bg: "rgba(212,163,71,0.07)", bar: "#d4a347" },
  board: { border: "rgba(26,26,46,0.10)", bg: "#ffffff", bar: "rgba(26,26,46,0.25)" },
  advisory: { border: "rgba(26,26,46,0.10)", bg: "#ffffff", bar: "rgba(26,26,46,0.25)" },
  assembly: { border: "rgba(41,182,200,0.55)", bg: "rgba(41,182,200,0.07)", bar: TEAL },
}

function SectionHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <motion.div {...reveal} transition={{ duration: 0.5 }} className="mx-auto mb-10 max-w-[720px] text-center md:mb-14">
      <span className="font-comic mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
        {label}
      </span>
      <h2 className="font-marissa text-[26px] font-medium leading-[1.25] sm:text-3xl md:text-[40px]" style={{ color: DARK }}>
        {title}
      </h2>
      {sub && <p className="font-dm-sans mx-auto mt-3 max-w-[46ch] text-[15px] italic leading-relaxed text-[#6b7280] sm:text-base md:mt-4 md:text-lg">{sub}</p>}
    </motion.div>
  )
}

function Connector() {
  return (
    <div className="flex justify-center py-1.5" aria-hidden>
      <ChevronDown className="size-5" style={{ color: "rgba(41,182,200,0.55)" }} />
    </div>
  )
}

export function OrgStructure() {
  return (
    <section className="scroll-mt-24 bg-[#f8f6f1] py-14 sm:py-20 lg:py-[90px]" id="organization">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <SectionHeader
          label="Governance"
          title="How the Foundation Is Organized"
          sub="Born from experience. United by purpose. The Foundation brings like-minded people together for one mission — an inclusive society, guided by strong governance."
        />

        {/* Governance chain: four stacked tiers */}
        <ol className="list-none">
          {tiers.map((tier, i) => {
            const style = accentStyles[tier.accent]
            return (
              <li key={tier.title}>
                <motion.div
                  {...reveal}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative overflow-hidden rounded-2xl border shadow-sm"
                  style={{ borderColor: style.border, backgroundColor: style.bg }}
                >
                  {/* Left accent bar */}
                  <span
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ backgroundColor: style.bar }}
                    aria-hidden
                  />
                  <div className="px-5 py-5 pl-6 text-center sm:px-6 sm:pl-7 md:px-8 md:py-6">
                    <h3 className="font-comic text-[17px] font-bold sm:text-lg md:text-xl" style={{ color: DARK }}>
                      {tier.title}
                    </h3>
                    <p className="font-dm-sans mt-1 text-[13px] italic sm:text-sm" style={{ color: TEAL }}>
                      {tier.subtitle}
                    </p>
                    <p className="font-dm-sans mx-auto mt-2.5 max-w-2xl text-[14px] leading-relaxed text-[#4a4a4a] sm:text-[15px] md:mt-3">
                      {tier.description}
                    </p>
                  </div>
                </motion.div>
                {i < tiers.length - 1 && <Connector />}
              </li>
            )
          })}
        </ol>

        {/* Branch connector into the operational level */}
        <Connector />

        {/* Operational level — two parallel teams */}
        <motion.div {...reveal} transition={{ duration: 0.5 }} className="mt-2">
          <div className="mb-5 flex items-center gap-3 sm:gap-4">
            <span className="h-px flex-1" style={{ backgroundColor: "rgba(26,26,46,0.12)" }} aria-hidden />
            <span className="font-comic shrink-0 text-[11px] font-bold uppercase tracking-[0.15em] sm:text-xs sm:tracking-[0.2em]" style={{ color: "#9aa0aa" }}>
              Operational Level
            </span>
            <span className="h-px flex-1" style={{ backgroundColor: "rgba(26,26,46,0.12)" }} aria-hidden />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {operationalTeams.map((team, i) => {
              const Icon = team.icon
              return (
                <motion.div
                  key={team.title}
                  {...reveal}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="group flex flex-col items-center rounded-2xl border border-[#eee] bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#29b6c8] hover:shadow-lg sm:p-7"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[rgba(41,182,200,0.1)] text-[#29b6c8] transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-comic text-[17px] font-bold" style={{ color: DARK }}>
                    {team.title}
                  </h3>
                  <p className="font-dm-sans mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                    {team.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
