import type { Metadata } from "next"
import { getWhatWeDoSettings } from "@/lib/data/what-we-do-settings"
import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, HandHelping, Handshake, Heart, type LucideIcon } from "lucide-react"
import { WhatWeDoClient } from "./whatwedo-client"
import { ProgramCardsSkeleton } from "@/components/programs/program-loading"
import { getPublishedProgramCards } from "@/lib/programs/data"
import { cn } from "@/lib/utils"
import { WhatWeDoHero } from "@/components/what-we-do/whatwedo-hero"
import { WhatWeDoPillars } from "@/components/what-we-do/whatwedo-pillars"
import programsStyles from "./whatwedo-programs.module.css"

export const metadata: Metadata = {
  title: "What We Do - deessa Foundation",
  description: "From classrooms in Karnali to clinics in the Terai, our programs deliver sustainable education, healthcare, and empowerment across Nepal's most remote communities.",
}

const categoryMeta: Record<string, { label: string; color: string }> = {
  service: { label: "SERVICE", color: "bg-blue-500" },
  campaign: { label: "CAMPAIGN", color: "bg-purple-500" },
  outreach: { label: "OUTREACH", color: "bg-orange-500" },
  research: { label: "RESEARCH", color: "bg-teal-500" },
}

// "Want to Support a Specific Program?" action cards.
// Button colours use darker brand shades so white/accent text meets WCAG AA (4.5:1).
const supportActions: {
  id: string
  title: string
  description: string
  cta: string
  href: string
  icon: LucideIcon
  primary: boolean
  cardClass: string
  barClass: string
  iconClass: string
  buttonClass: string
}[] = [
  {
    id: "donate",
    title: "Make a Donation",
    description: "Fund education, healthcare, or autism support directly.",
    cta: "Donate Now",
    href: "/donate",
    icon: Heart,
    primary: true,
    cardClass: "bg-gradient-to-b from-[#eaf8fa] to-white border-[#29b6c8]/35",
    barClass: "from-[#29b6c8] to-[#0b76b7]",
    iconClass:
      "bg-[#29b6c8] text-white ring-[#29b6c8]/30 shadow-[0_8px_20px_-6px_rgba(41,182,200,0.6)]",
    buttonClass:
      "bg-[#0e7c8c] text-white hover:bg-[#0a6573] focus-visible:ring-[#29b6c8]/45 shadow-[0_8px_20px_-8px_rgba(14,124,140,0.7)]",
  },
  {
    id: "partner",
    title: "Become a Partner",
    description: "Organizations partnering with us multiply impact across Nepal.",
    cta: "Partner With Us",
    href: "/contact",
    icon: Handshake,
    primary: false,
    cardClass: "bg-white border-slate-200/80 hover:border-[#6F3E96]/35",
    barClass: "from-[#9b6cc2] to-[#6F3E96]",
    iconClass: "bg-[#6F3E96]/10 text-[#6F3E96] ring-[#6F3E96]/15 group-hover:bg-[#6F3E96] group-hover:text-white",
    buttonClass:
      "border-2 border-[#6F3E96] text-[#6F3E96] bg-white hover:bg-[#6F3E96] hover:text-white focus-visible:ring-[#6F3E96]/35",
  },
  {
    id: "volunteer",
    title: "Volunteer Your Skills",
    description: "Join our team on the ground or offer remote support to our programs.",
    cta: "Get Involved",
    href: "/get-involved",
    icon: HandHelping,
    primary: false,
    cardClass: "bg-white border-slate-200/80 hover:border-orange-300",
    barClass: "from-orange-400 to-orange-600",
    iconClass: "bg-orange-50 text-orange-600 ring-orange-200/70 group-hover:bg-orange-500 group-hover:text-white",
    buttonClass:
      "border-2 border-orange-700 text-orange-700 bg-white hover:bg-orange-700 hover:text-white focus-visible:ring-orange-300",
  },
]

async function getPrograms() {
  try {
    const cards = await getPublishedProgramCards()
    const programs = cards.map((card) => {
      const meta = categoryMeta[card.category] || { label: card.category.toUpperCase(), color: "bg-gray-500" }
      const cardData = card.card as Record<string, unknown> | null
      return {
        id: card.id,
        category: card.category,
        categoryLabel: meta.label,
        categoryColor: meta.color,
        image: (cardData?.image as string) || null,
        title: card.title,
        description: card.short_description,
        slug: card.slug,
      }
    })
    return { programs, unavailable: false, error: null }
  } catch (error) {
    // Log detailed error for debugging production issues
    console.error("[getPrograms] Failed to fetch programs:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { programs: [], unavailable: true, error: errorMessage }
  }
}

async function ProgramsGrid() {
  const { programs, unavailable, error } = await getPrograms()
  return <WhatWeDoClient programs={programs} unavailable={unavailable} errorMessage={error} />
}

export default async function ProgramsPage() {
  const content = await getWhatWeDoSettings()
  return (
    <>
      {/* Hero Section - editorial intro + photo strip */}
      <WhatWeDoHero content={content.hero} />

      {/* What We Do Section */}
      <section className="bg-white py-16 md:py-24 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#29b6c8]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6F3E96]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-14 md:mb-20">
            <div className="mb-4 text-[11px] font-comic tracking-widest text-[#15151c] uppercase">
              {content.introduction.label}
            </div>
            <h2 className="text-[32px] sm:text-[40px] md:text-[52px] font-marissa leading-[1.15] mb-5 px-4">
              <span className="block text-[#1a1a2e]" style={{ WebkitTextStroke: "0.7px currentColor" }}>
                {content.introduction.title}
              </span>
              <span className="block" style={{ WebkitTextStroke: "0.7px currentColor" }}>
                <span className={programsStyles.ctaHeadingAccent}>{content.introduction.titleAccent}</span>
              </span>
            </h2>
            <p className="text-[16px] md:text-[18px] font-dm-sans text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
              {content.introduction.description}
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <WhatWeDoPillars cards={content.cards} />

        </div>
      </section>

      {/* Transition Brush Stroke */}
      <div className="relative w-full overflow-hidden leading-none bg-white" style={{ height: 90, marginBottom: -1 }}>
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          <path
            d="M0,32 C180,70 360,8 540,42 C720,72 900,10 1080,40 C1240,65 1360,18 1440,38 L1440,90 L0,90 Z"
            fill="#f8f6f1"
          />
          <path
            d="M0,48 C200,22 400,68 600,36 C800,8 1020,58 1200,28 C1320,10 1400,44 1440,26 L1440,90 L0,90 Z"
            fill="#f8f6f1"
            opacity="0.55"
          />
        </svg>
      </div>

      {/* Programs Grid Section */}
      <section
        id="programs"
        aria-labelledby="programs-heading"
        className={cn(programsStyles.section, "relative overflow-hidden scroll-mt-24")}
      >
        {/* Soft brand-tinted background decorations (mirrors the support section) */}
        <div
          aria-hidden="true"
          className={cn(
            programsStyles.ctaDecor,
            "absolute top-24 -right-24 w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full bg-[#29b6c8]/10 blur-3xl",
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            programsStyles.ctaDecor,
            "absolute bottom-10 -left-24 w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#6F3E96]/[0.07] blur-3xl",
          )}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
          {/* Section Title */}
          <div className="text-center mb-8 md:mb-10">
            <h2 id="programs-heading" className={programsStyles.sectionTitle}>
              Our Programs <span className={programsStyles.ctaHeadingAccent}>in Action</span>
            </h2>
            <p className={programsStyles.sectionDesc}>
              From autism support to women&apos;s empowerment and creative training, explore the programs bringing inclusion and opportunity to life.
            </p>
          </div>
          
          <Suspense fallback={<ProgramCardsSkeleton />}>
            <ProgramsGrid />
          </Suspense>
        </div>
      </section>

      {/* Support CTA Section — light, card-based */}
      <section
        aria-labelledby="support-program-heading"
        className={cn(programsStyles.ctaSection, "relative overflow-hidden")}
      >
        {/* Top brush stroke: continues the cream programs section above */}
        <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-16 md:h-20 z-10 pointer-events-none">
          <svg
            viewBox="0 0 1200 80"
            preserveAspectRatio="none"
            className="w-full h-full rotate-180"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,40 Q150,10 300,35 T600,40 T900,30 T1200,45 L1200,80 L0,80 Z"
              className={programsStyles.ctaBrushPath}
            />
          </svg>
        </div>

        {/* Soft brand-tinted background decorations */}
        <div
          aria-hidden="true"
          className={cn(
            programsStyles.ctaDecor,
            "absolute -top-10 -left-24 w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full bg-[#29b6c8]/10 blur-3xl",
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            programsStyles.ctaDecor,
            "absolute -bottom-24 -right-24 w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full bg-[#6F3E96]/10 blur-3xl",
          )}
        />

        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-14">
            <p
              className={cn(
                programsStyles.ctaEyebrow,
                "inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#29b6c8]/10 text-[#0e6f7d] text-[11px] font-comic font-bold tracking-widest uppercase",
              )}
            >
              <Heart aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={2.5} />
              {content.support.label}
            </p>
            <h2 id="support-program-heading" className={programsStyles.ctaHeading}>
              {content.support.title} <span className={programsStyles.ctaHeadingAccent}>{content.support.titleAccent}</span>
            </h2>
            <p className={programsStyles.ctaSubheading}>
              {content.support.description}
            </p>
          </div>

          {/* 3 Action Cards */}
          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {supportActions.map((layout, index) => {
              const action = { ...layout, ...content.support.actions[index] }
              const Icon = action.icon
              return (
                <li key={action.href} className="h-full">
                  <article
                    aria-labelledby={`support-${action.id}-title`}
                    className={cn(
                      programsStyles.ctaCard,
                      "group relative flex flex-col h-full overflow-hidden rounded-3xl border p-6 sm:p-7 lg:p-8 text-left",
                      "shadow-[0_2px_16px_rgba(26,26,46,0.06)] transition-all duration-300 ease-out",
                      "hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-12px_rgba(26,26,46,0.18)] focus-within:-translate-y-1.5",
                      "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0",
                      action.cardClass,
                    )}
                  >
                    {/* Accent bar */}
                    <span
                      aria-hidden="true"
                      className={cn(programsStyles.ctaCardBar, "absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", action.barClass)}
                    />

                    {/* Icon */}
                    <span
                      aria-hidden="true"
                      data-cta-icon
                      data-action={action.id}
                      className={cn(
                        programsStyles.ctaCardIcon,
                        "mb-5 inline-flex w-14 h-14 items-center justify-center rounded-2xl ring-1 transition-all duration-300",
                        "group-hover:scale-105 group-hover:-rotate-3 motion-reduce:transition-none motion-reduce:group-hover:transform-none",
                      )}
                    >
                      <Icon className="w-7 h-7" strokeWidth={2} />
                    </span>

                    <h3 id={`support-${action.id}-title`} className={programsStyles.ctaCardTitle}>
                      {action.title}
                    </h3>
                    <p className={programsStyles.ctaCardDesc}>{action.description}</p>

                    <Link
                      href={action.href}
                      data-slot="button"
                      data-variant={action.primary ? "default" : "outline"}
                      data-action={action.id}
                      className={cn(
                        action.primary ? programsStyles.ctaPrimaryBtn : programsStyles.ctaSecondaryBtn,
                        "mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 min-h-[48px]",
                        "font-comic font-bold text-[15px] transition-colors duration-200",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
                      )}
                    >
                      {action.cta}
                      <ArrowRight
                        aria-hidden="true"
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      />
                    </Link>
                  </article>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}
