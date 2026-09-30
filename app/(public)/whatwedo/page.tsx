import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, HandHelping, Handshake, Heart, type LucideIcon } from "lucide-react"
import { WhatWeDoClient } from "./whatwedo-client"
import { getPublishedProgramCards } from "@/lib/programs/data"
import { cn } from "@/lib/utils"
import { WhatWeDoHero } from "@/components/whatwedo/whatwedo-hero"
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
    return { programs, unavailable: false }
  } catch {
    return { programs: [], unavailable: true }
  }
}

export default async function ProgramsPage() {
  const { programs, unavailable } = await getPrograms()
  return (
    <>
      {/* Hero Section - editorial intro + photo strip */}
      <WhatWeDoHero />

      {/* What We Do Section */}
      <section className="bg-white py-16 md:py-24 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#29b6c8]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6F3E96]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-14 md:mb-20">
            <div className="mb-4 text-[11px] font-comic tracking-widest text-[#15151c] uppercase">
              What We Do
            </div>
            <h2 className="text-[32px] sm:text-[40px] md:text-[52px] font-marissa leading-[1.15] mb-5 px-4">
              <span className="block text-[#1a1a2e]" style={{ WebkitTextStroke: "0.7px currentColor" }}>
                We turn understanding into action for
              </span>
              <span className="block text-[#0b76b7]" style={{ WebkitTextStroke: "0.7px currentColor" }}>
                children, families, and communities.
              </span>
            </h2>
            <p className="text-[16px] md:text-[18px] font-dm-sans text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
              Our work supports children with disabilities, their families, educators, and communities through four core areas.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Pillar 1: Awareness */}
            <Link href="/whatwedo/awareness" aria-label="Explore Awareness and Community Engagement" className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">
            <div className="relative h-full rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 p-6 md:p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-2xl" />
              
              <div className="flex flex-col items-center text-center h-full">
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-[20px] md:text-[22px] font-marissa text-[#1a1a2e] mb-3" style={{ WebkitTextStroke: "0.45px currentColor" }}>
                  Awareness & Community Engagement
                </h3>

                {/* Description */}
                <p className="text-[14px] font-dm-sans text-slate-600 leading-relaxed">
                  We break the silence. Through community campaigns, social media, podcasts, and public conversations, we challenge myths and replace stigma with understanding.
                </p>
                <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600">Explore this area →</span>
              </div>
            </div>
            </Link>

            {/* Pillar 2: Training */}
            <Link href="/whatwedo/training" aria-label="Explore Training" className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-200">
            <div className="relative h-full rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 p-6 md:p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-t-2xl" />
              
              <div className="flex flex-col items-center text-center h-full">
                {/* Icon */}
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-[20px] md:text-[22px] font-marissa text-[#1a1a2e] mb-3" style={{ WebkitTextStroke: "0.45px currentColor" }}>
                  Training
                </h3>

                {/* Description */}
                <p className="text-[14px] font-dm-sans text-slate-600 leading-relaxed">
                  We equip parents, teachers, health workers, and caregivers with the skills to spot autism early and support every child, the right way.
                </p>
                <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-bold text-green-700">Explore this area →</span>
              </div>
            </div>
            </Link>

            {/* Pillar 3: Resources */}
            <Link href="/whatwedo/resources" aria-label="Explore Resources" className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">
            <div className="relative h-full rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 p-6 md:p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-2xl" />
              
              <div className="flex flex-col items-center text-center h-full">
                {/* Icon */}
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-[20px] md:text-[22px] font-marissa text-[#1a1a2e] mb-3" style={{ WebkitTextStroke: "0.45px currentColor" }}>
                  Resources
                </h3>

                {/* Description */}
                <p className="text-[14px] font-dm-sans text-slate-600 leading-relaxed">
                  No family should have to navigate this journey alone. We build simple, accessible guides and tools for parents, educators, and professionals.
                </p>
                <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-700">Explore this area →</span>
              </div>
            </div>
            </Link>

            {/* Pillar 4: Advocacy */}
            <Link href="/whatwedo/advocacy" aria-label="Explore Advocacy" className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200">
            <div className="relative h-full rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 p-6 md:p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-t-2xl" />
              
              <div className="flex flex-col items-center text-center h-full">
                {/* Icon */}
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-[20px] md:text-[22px] font-marissa text-[#1a1a2e] mb-3" style={{ WebkitTextStroke: "0.45px currentColor" }}>
                  Advocacy
                </h3>

                {/* Description */}
                <p className="text-[14px] font-dm-sans text-slate-600 leading-relaxed">
                  We push for inclusive schools and stronger policies that protect every child&apos;s rights, so inclusion becomes a right, not a privilege.
                </p>
                <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-bold text-purple-700">Explore this area →</span>
              </div>
            </div>
            </Link>
          </div>

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
          
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[380px] rounded-3xl border border-slate-200/80 bg-white animate-pulse motion-reduce:animate-none"
                  />
                ))}
              </div>
            }
          >
            <WhatWeDoClient programs={programs} unavailable={unavailable} />
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
              Ways to Help
            </p>
            <h2 id="support-program-heading" className={programsStyles.ctaHeading}>
              Want to Support a <span className={programsStyles.ctaHeadingAccent}>Specific Program?</span>
            </h2>
            <p className={programsStyles.ctaSubheading}>
              Your targeted donation ensures maximum impact in the area you care about most.
            </p>
          </div>

          {/* 3 Action Cards */}
          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {supportActions.map((action) => {
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
