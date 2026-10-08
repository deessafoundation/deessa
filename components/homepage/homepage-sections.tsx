"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { HomepageImage } from "./homepage-image"
import styles from "./homepage-sections.module.css"
import pillarCard from "@/components/what-we-do/pillar-card.module.css"
import Link from "next/link"
import podcastBanner from "@/public/podcast_banner.jpeg"
import {
  Heart,
  ArrowRight,
  GraduationCap,
  MapPin,
  Stethoscope,
  BookOpen,
  ChevronRight,
  Phone,
  Clock,
  Mail,
  Shield,
  Home as HomeIcon,
  Target,
  Eye,
  Flag,
  Users,
  Leaf,
  ArrowUpRight,
  Star,
 
  Quote,
  Award,
  Building2,
  Globe,
  Megaphone,
  FileText,
  Scale,
  Mic2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollReveal, CountUp, BackToTop } from "@/components/homepage/scroll-animations"
import { cn } from "@/lib/utils"
import { PastelBlob } from "@/components/decor/pastel-blob"
import { HomeSectionHeading } from "@/components/home/home-section-heading"
import { HOME_TILE_TONES, HOME_TONES, homeUi } from "@/components/home/home-ui"
import { getHomeTone, splitHeadingAccent } from "@/components/home/home-tone"
import type {
  HomepageStat,
  HomepageMarqueeSettings,
  HomepageTestimonialsSettings,
  HomepageTimelineSettings,
  HomepageStorySettings,
  HomepageWhatWeDoSettings,
} from "@/lib/types/homepage-settings"
import { DEFAULT_HOMEPAGE_STORY, DEFAULT_TESTIMONIALS, DEFAULT_WHAT_WE_DO } from "@/lib/types/homepage-settings"

/* ──────────────────  IMPACT STATS BAR  ────────────────── */

interface ImpactStatsBarProps {
  stats?: HomepageStat[]
}

export function ImpactStatsBar({ stats }: ImpactStatsBarProps) {
  // Fallback to default stats if not provided
  const defaultStats: HomepageStat[] = [
    { value: 10000, suffix: "+", label: "Children Supported", sublabel: "Since 2022", order: 1 },
    { value: 50, suffix: "+", label: "Schools Built", sublabel: "& Renovated", order: 2 },
    { value: 25, suffix: "+", label: "Districts Reached", sublabel: "Out of 77", order: 3 },
    { value: 500, suffix: "+", label: "Trained Teachers", sublabel: "In 10 Years", order: 4 },
  ]

  const displayStats = stats || defaultStats

  // Sort by order and take first 4 for homepage display
  const sortedStats = [...displayStats].sort((a, b) => a.order - b.order).slice(0, 4)

  return (
    <section className="bg-primary/5 border-y border-primary/10 py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {sortedStats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-2xl md:text-3xl font-bold text-primary font-comic-num">
                <CountUp end={stat.value} suffix={stat.suffix || ""} />
              </p>
              <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
              {stat.sublabel && <p className="text-xs text-slate-500">{stat.sublabel}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────  OUR STORY SECTION  ────────────────── */

interface OurStorySectionProps {
  story?: HomepageStorySettings
}

export function OurStorySection({ story }: OurStorySectionProps) {
  const s = story || DEFAULT_HOMEPAGE_STORY
  const storyIllustration = "/home/story/two-paths-one-purpose.png"
  const useStoryIllustration = !s.image || [
    "/ourStory.png",
    "/home/story/deessa-foundation-origin-story.jpg",
    storyIllustration,
  ].includes(s.image)
  const imageSrc = useStoryIllustration ? storyIllustration : s.image
  const imageAlt = useStoryIllustration
    ? "Illustration of two sisters following paths toward a welcoming school in Nepal"
    : s.imageAlt
  const storyHeading = splitHeadingAccent(s.badgeText)

  return (
    <section className={cn(homeUi.surface, homeUi.sectionY)}>
      <div className={cn(homeUi.container, "z-10")}>
        <div className="grid grid-cols-1 items-center gap-y-8 md:grid-cols-2 md:gap-x-12 lg:gap-x-16">
          <ScrollReveal animation="fade-left" delay={200} className="md:col-start-2 md:row-start-1 md:self-end">
            <HomeSectionHeading
              align="responsive"
              eyebrow={s.eyebrow}
              title={storyHeading.lead}
              accent={storyHeading.accent}
            />
          </ScrollReveal>

          <ScrollReveal animation="fade-up" duration={700} className="md:col-start-1 md:row-start-1 md:row-span-2">
            <div className="relative mx-auto w-full max-w-[36rem]">
              <PastelBlob className="-left-[6%] -top-[5%] w-[112%] aspect-[5/4]" />
              <div className={cn(homeUi.frame, homeUi.organicRadius, "aspect-[5/4] sm:aspect-[4/3] md:aspect-[5/4]")}>
                <div className={cn("relative h-full w-full overflow-hidden bg-[#E8F6FC]", homeUi.organicRadius)}>
                  <HomepageImage
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 45vw, 560px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
              <ScrollReveal animation="scale-in" delay={400}>
                <div className="relative z-10 -mt-8 mr-3 flex justify-end md:absolute md:-bottom-6 md:-right-6 md:m-0 md:max-w-[60%]">
                  <div className={cn(homeUi.floatCard, "flex items-center gap-3 p-3 sm:p-4")}>
                    <span className={cn(homeUi.iconCircle, HOME_TONES.sunny, "size-10 sm:size-12")}>
                      <Leaf aria-hidden="true" className="size-5 sm:size-6" strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="font-comic-num text-2xl leading-none text-[#063F5B] md:text-3xl">{s.founded}</p>
                      <p className={cn(homeUi.muted, "mt-1 text-sm font-bold")}>{s.foundedLabel}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={200} className="md:col-start-2 md:row-start-2 md:self-start">
            <div>
              {s.paragraphs.map((p, i) => (
                <p key={i} className={cn(homeUi.body, i === s.paragraphs.length - 1 ? "mb-7" : "mb-4 sm:mb-5")}>
                  {p}
                </p>
              ))}
              <Link href={s.linkUrl} className={cn(homeUi.secondaryButton, "w-full sm:w-auto")}>
                {s.linkText}
                <ArrowRight aria-hidden="true" className={homeUi.buttonArrow} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────  MISSION, VISION & OBJECTIVES  ────────────────── */

export function MissionVisionSection() {
  // Shared hero-style card chrome so the three panels read as one family with the
  // pillar cards in ProgramsSection. No hover lift: these articles are not interactive.
  const cardShell = cn(homeUi.card, "relative flex h-full flex-col overflow-hidden")

  // Targets, not achievements — the numbers come straight from the objectives
  // statement, so they stay labelled as goals to avoid reading as impact data.
  const targets = [
    { value: 100, suffix: "+", label: "Schools to build" },
    { value: 50000, suffix: "+", label: "Lives to reach through healthcare" },
    { value: 10000, suffix: "+", label: "Women to empower with new skills" },
  ]

  return (
    <section data-mission-section className={cn(homeUi.surface, homeUi.sectionY)}>
      <div className={cn(homeUi.container, "z-10")}>
        <ScrollReveal animation="fade-up">
          <HomeSectionHeading
            className="mb-10 sm:mb-14"
            eyebrow="Our Direction"
            title={
              <>
                Mission, Vision <span className="font-normal">&</span>
              </>
            }
            accent="Objectives"
            // One navy line on phones too; it still wraps at large text sizes instead of overflowing.
            titleClassName="text-2xl leading-[1.15] sm:text-[2.5rem] lg:text-[3.25rem]"
            intro={<>Guided by clear values and a bold vision for Nepal&apos;s future.</>}
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
          {/* MISSION — the anchor statement, set apart by a soft sky tint
              rather than a dark panel, so it stays in the hero's light language */}
          <ScrollReveal animation="fade-right" className="h-full lg:col-span-7">
            <article data-mission-card className={cn(cardShell, "border-[#D7EEF9] bg-[#F2FAFE]")}>
              <div className="relative flex flex-1 flex-col p-5 sm:p-8 md:p-11">
                <div
                  data-mission-icon
                  className={cn(homeUi.iconCircle, HOME_TONES.sky, "mb-5 size-14 sm:mb-7 sm:size-16")}
                >
                  <Target aria-hidden="true" className="size-7 sm:size-8" strokeWidth={1.8} />
                </div>
                <h3 className={cn(homeUi.heading, "mb-4 text-xl md:text-[1.875rem]")}>Our Mission</h3>
                <p className={cn(homeUi.body, "md:text-xl")}>
                  To empower marginalized communities in Nepal through education, healthcare, and sustainable
                  development, ensuring every individual has the opportunity to live with dignity and purpose.
                </p>
              </div>
            </article>
          </ScrollReveal>

          {/* VISION */}
          <ScrollReveal animation="fade-left" delay={150} className="h-full lg:col-span-5">
            <article className={cardShell}>
              <div className="flex flex-1 flex-col p-5 sm:p-8 md:p-10">
                <div className={cn(homeUi.iconCircle, HOME_TONES.lavender, "mb-5 size-14 sm:mb-7 sm:size-16")}>
                  <Eye aria-hidden="true" className="size-7 sm:size-8" strokeWidth={1.8} />
                </div>
                <h3 className={cn(homeUi.heading, "mb-4 text-xl md:text-[1.875rem]")}>Our Vision</h3>
                <p className={homeUi.body}>
                  A Nepal where every community thrives. Children dream freely, families are healthy, and
                  opportunities are within everyone&apos;s reach.
                </p>
              </div>
            </article>
          </ScrollReveal>

          {/* OBJECTIVES — full width base, with the goals broken out as figures */}
          <ScrollReveal animation="fade-up" delay={300} className="lg:col-span-12">
            <article className={cardShell}>
              <div className="grid grid-cols-1 items-center gap-6 p-5 sm:gap-8 sm:p-8 md:p-10 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-5">
                  <div className={cn(homeUi.iconCircle, HOME_TONES.sunny, "mb-5 size-14 sm:mb-7 sm:size-16")}>
                    <Flag aria-hidden="true" className="size-7 sm:size-8" strokeWidth={1.8} />
                  </div>
                  <h3 className={cn(homeUi.heading, "mb-4 text-xl md:text-[1.875rem]")}>Our Objectives</h3>
                  <p className={homeUi.body}>
                    Concrete goals that turn our mission into measurable change, district by district, until every
                    community we serve feels the difference.
                  </p>
                </div>

                <div className="lg:col-span-7">
                  <p className={cn(homeUi.muted, "mb-5 text-sm font-bold uppercase tracking-widest text-[#006E9E]")}>
                    What we are working toward
                  </p>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    {targets.map((target, i) => (
                      <li
                        key={target.label}
                        className={cn(
                          homeUi.tile,
                          HOME_TILE_TONES[(["sky", "sunny", "lavender"] as const)[i % 3]],
                          "p-4 sm:p-5",
                        )}
                      >
                        <p className="font-comic-num mb-1.5 text-3xl text-[#006E9E] md:text-[2.125rem]">
                          <CountUp end={target.value} suffix={target.suffix} />
                        </p>
                        <p className={cn(homeUi.muted, "text-sm font-bold leading-snug")}>{target.label}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────  PROGRAMS SECTION  ────────────────── */

const pillarIconMap: Record<string, any> = {
  Megaphone,
  BookOpen,
  FileText,
  Scale,
  GraduationCap,
  Stethoscope,
  Shield,
  HomeIcon,
  Heart,
  Globe,
  Users,
  Award,
  Building2,
  Star,
}

interface ProgramsSectionProps {
  whatWeDo?: HomepageWhatWeDoSettings
}

export function ProgramsSection({ whatWeDo }: ProgramsSectionProps) {
  const w = whatWeDo || DEFAULT_WHAT_WE_DO
  const corePillars = [...w.pillars].filter((p) => p.visible).sort((a, b) => a.order - b.order)

  // Split the (CMS-editable) title into a black lead-in line and a blue
  // emphasis line, matching the /whatwedo hero treatment. Falls back to a
  // single blue line if an admin has edited the title to something else.
  const titleLeadIn = "We turn understanding into action for"
  const titleEmphasis = w.title.startsWith(titleLeadIn) ? w.title.slice(titleLeadIn.length).trim() : null
  // Empty or missing emphasis falls back to highlighting the title's last word, so no word is lost.
  const heading = titleEmphasis ? { lead: titleLeadIn, accent: titleEmphasis } : splitHeadingAccent(w.title)

  return (
    <section id="what-we-do" className={cn(homeUi.surface, homeUi.sectionY, "scroll-mt-24")}>
      <div className={cn(homeUi.container, "z-10")}>
        <ScrollReveal animation="fade-up">
          <HomeSectionHeading
            className="mb-10 sm:mb-16"
            eyebrow={w.eyebrow}
            title={heading.lead}
            accent={heading.accent}
            intro={w.subtitle}
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {corePillars.map((pillar, idx) => {
            const IconComp = pillarIconMap[pillar.icon] || Megaphone
            return (
              <ScrollReveal
                key={pillar.id}
                animation={idx % 2 === 0 ? "fade-right" : "fade-left"}
                delay={idx * 150}
                className="h-full"
              >
                <Link
                  href={`/whatwedo/${pillar.id}`}
                  aria-label={`Explore ${pillar.title}`}
                  data-tone={getHomeTone(pillar.color, idx)}
                  className={cn(
                    pillarCard.card,
                    "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] focus-visible:outline-none",
                  )}
                >
                  <span aria-hidden="true" className={pillarCard.blob} />
                  <span aria-hidden="true" data-pillar-icon className={pillarCard.icon}>
                    <IconComp className="size-6" strokeWidth={1.9} />
                  </span>
                  <div className="flex flex-1 flex-col p-6 text-left sm:p-7">
                    {pillar.statLabel ? (
                      <p className={cn(pillarCard.tag, "font-comic")}>
                        <span aria-hidden="true" className={pillarCard.tagDot} />
                        {pillar.statLabel}
                      </p>
                    ) : null}
                    <h3 className={cn(homeUi.heading, pillarCard.title, "mb-3 mt-12 text-[1.3rem] leading-snug")}>
                      {pillar.title.split("&").map((part, i, arr) =>
                        i === arr.length - 1 ? (
                          <span key={i}>{part}</span>
                        ) : (
                          <span key={i}>
                            {part}
                            <span className="font-normal">&</span>
                          </span>
                        )
                      )}
                    </h3>
                    <p className={cn(pillarCard.desc, "font-comic text-[0.95rem] leading-relaxed")}>
                      {pillar.description}
                    </p>
                    <span
                      className={cn(
                        pillarCard.cta,
                        "mt-auto flex items-center justify-between gap-3 pt-7 font-comic text-[0.95rem] font-bold",
                      )}
                    >
                      <span className={pillarCard.ctaLabel}>Explore this area</span>
                      <span aria-hidden="true" className={pillarCard.ctaArrow}>
                        <ArrowRight className="size-4" />
                      </span>
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────  TIMELINE SECTION  ────────────────── */

interface TimelineSectionProps {
  timeline?: HomepageTimelineSettings
}

export function TimelineSection({ timeline: timelineSettings }: TimelineSectionProps) {
  // Icon mapping
  const iconMap: Record<string, any> = {
    MapPin,
    GraduationCap,
    Stethoscope,
    Heart,
    Globe,
    BookOpen,
    Users,
    Star,
    Award,
    Building2,
    Leaf,
    Shield,
  }

  // Helper function to parse color classes and convert to inline styles
  const parseColorToStyle = (colorClass: string, type: "gradient" | "solid") => {
    if (type === "gradient") {
      // Parse gradient: extract all hex colors
      const colors = colorClass.match(/#[0-9A-Fa-f]{3,6}/g)

      if (colors && colors.length >= 2) {
        return {
          background: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`,
        }
      } else if (colors && colors.length === 1) {
        // Single color gradient (fallback)
        return {
          background: colors[0],
        }
      }
    } else {
      // Parse solid: extract first hex color
      const match = colorClass.match(/#[0-9A-Fa-f]{3,6}/)
      if (match) {
        return {
          backgroundColor: match[0],
        }
      }
    }

    // Fallback: return empty object (will use Tailwind classes)
    return {}
  }

  // Default milestones if not provided from CMS
  const defaultMilestones = [
    {
      year: "2022",
      milestone: "Founded in Kathmandu",
      description: "deessa Foundation began with a simple commitment: serve communities that are often left behind.",
      icon: MapPin,
      badgeClass: "from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-primary-dark))]",
      yearClass: "bg-[rgb(var(--brand-primary))]",
    },
    {
      year: "2016",
      milestone: "First education program",
      description:
        "Our scholarship initiative opened classroom doors for 200+ students with limited access to learning.",
      icon: GraduationCap,
      badgeClass: "from-[rgb(var(--accent-education))] to-amber-500",
      yearClass: "bg-[rgb(var(--accent-education))]",
    },
    {
      year: "2018",
      milestone: "Health camps expanded",
      description:
        "Medical outreach scaled to 50+ remote villages, bringing care closer to families who needed it most.",
      icon: Stethoscope,
      badgeClass: "from-[rgb(var(--accent-empowerment))] to-pink-500",
      yearClass: "bg-[rgb(var(--accent-empowerment))]",
    },
    {
      year: "2020",
      milestone: "COVID-19 relief",
      description:
        "Emergency food, hygiene kits, and support reached 5,000+ families during Nepal's most urgent months.",
      icon: Heart,
      badgeClass: "from-[rgb(var(--accent-environment))] to-lime-500",
      yearClass: "bg-[rgb(var(--accent-environment))]",
    },
    {
      year: "2022",
      milestone: "10,000 lives impacted",
      description: "A decade of trust, partnerships, and consistent fieldwork transformed lives across communities.",
      icon: Globe,
      badgeClass: "from-[#6F3E96] to-[#6F3E96]",
      yearClass: "bg-[#6F3E96]",
    },
    {
      year: "2024",
      milestone: "New horizons",
      description: "We are now expanding into art, podcasting, and digital literacy to shape future-ready communities.",
      icon: BookOpen,
      badgeClass: "from-[#F7C52B] to-[#F7C52B]",
      yearClass: "bg-[#F7C52B]",
    },
  ]

  // Use CMS milestones if provided, otherwise use defaults
  const milestones = timelineSettings?.milestones
    ? timelineSettings.milestones
        .filter((m) => m.visible)
        .sort((a, b) => a.order - b.order)
        .map((m) => ({
          ...m,
          icon: iconMap[m.icon] || MapPin,
        }))
    : defaultMilestones

  const title = timelineSettings?.title || "Our Impact through the Years"
  const subtitle =
    timelineSettings?.subtitle ||
    "For over a decade and counting, we have been transforming lives, building stronger communities, and creating lasting change."

  return (
    <section className="py-20 md:py-24 relative overflow-hidden bg-[linear-gradient(180deg,#f6f3ed_0%,#fbfaf7_100%)]">
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(63,171,222,0.22) 2px, transparent 2px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div className="absolute -left-28 top-8 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Our <span className="text-primary">Impact through the Years</span>
            </h2>
            <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">{subtitle}</p>
          </div>
        </ScrollReveal>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative max-w-5xl mx-auto">
          {/* Center vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 -translate-x-1/2" />

          {/* Timeline items */}
          <div className="space-y-16">
            {milestones.map((item, i) => {
              const IconComp = item.icon
              const isLeft = i % 2 === 0

              return (
                <ScrollReveal key={`${item.year}-${i}`} animation={isLeft ? "fade-right" : "fade-left"} delay={i * 100}>
                  <div className={`relative flex items-center ${isLeft ? "flex-row" : "flex-row-reverse"} gap-8`}>
                    {/* Card */}
                    <div className={`w-[calc(50%-2rem)] ${isLeft ? "text-right" : "text-left"}`}>
                      <article className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className={`flex items-center gap-3 mb-4 ${isLeft ? "flex-row-reverse" : "flex-row"}`}>
                          <div
                            className="size-14 rounded-full text-white shadow-md flex items-center justify-center flex-shrink-0"
                            style={parseColorToStyle(item.badgeClass, "gradient")}
                          >
                            <IconComp className="size-7" />
                          </div>
                          <span
                            className="inline-flex items-center rounded-full text-white text-sm font-bold px-4 py-1.5 font-comic-num"
                            style={parseColorToStyle(item.yearClass, "solid")}
                          >
                            {item.year}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">{item.milestone}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                      </article>
                    </div>

                    {/* Center dot */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-10">
                      <div
                        className="size-4 rounded-full ring-4 ring-white shadow-md"
                        style={parseColorToStyle(item.yearClass, "solid")}
                      />
                    </div>

                    {/* Empty space on other side */}
                    <div className="w-[calc(50%-2rem)]" />
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden relative pl-8 space-y-8">
          {/* Left vertical line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20" />

          {milestones.map((item, i) => {
            const IconComp = item.icon

            return (
              <ScrollReveal key={`${item.year}-${i}`} animation="fade-left" delay={i * 100}>
                <div className="relative">
                  {/* Dot on the line */}
                  <div className="absolute -left-8 top-6">
                    <div
                      className="size-4 rounded-full ring-4 ring-white shadow-md"
                      style={parseColorToStyle(item.yearClass, "solid")}
                    />
                  </div>

                  {/* Card */}
                  <article className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="size-12 rounded-full text-white shadow-md flex items-center justify-center flex-shrink-0"
                        style={parseColorToStyle(item.badgeClass, "gradient")}
                      >
                        <IconComp className="size-6" />
                      </div>
                      <span
                        className="inline-flex items-center rounded-full text-white text-sm font-bold px-4 py-1.5 font-comic-num"
                        style={parseColorToStyle(item.yearClass, "solid")}
                      >
                        {item.year}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{item.milestone}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </article>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────  PODCAST FEATURE  ────────────────── */

export function PodcastSection() {
  const hosts = [
    { name: "Merina Panthii", role: "President & Host", image: "/Merina Panthii.jpg" },
    { name: "Sarita Sapkota", role: "Parent & Host", image: "/Sarita Sapkota.jpg" },
  ]

  return (
    <section
      aria-labelledby="home-podcast-title"
      data-podcast-section
      className="relative overflow-hidden bg-[#005581]"
      data-tts-section=""
      data-tts-priority="heading"
      data-tts-text="The deessa Podcast. Living With Autism. Real voices. Real stories. Honest conversations about autism, inclusion, and the experiences that shape our communities. Hosted by Merina Panthii, President and Host, and Sarita Sapkota, Parent and Host. Explore the podcast."
    >
      {/* Keep the backdrop on the full-width section so it has no container seams. */}
      <svg aria-hidden="true" data-podcast-feather className="pointer-events-none absolute bottom-0 right-0 h-[32%] w-full xl:w-[45%]" viewBox="0 0 640 240" preserveAspectRatio="none">
        <path d="M640 0 C545 160 400 238 190 240 H640 Z" fill="#3FABDE" opacity="0.36" />
      </svg>
      {/* Full-bleed grid: the banner touches the section edges, so no blue frames it. */}
      <div className="relative">
        <ScrollReveal animation="fade-up">
          <div className="isolate overflow-hidden">
            <div className="grid xl:min-h-[min(31vw,560px)] xl:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]">
              {/* Stacked: intrinsic 16:9, no crop. xl: stretches to the text column's height. */}
              <Link
                href="/podcasts"
                aria-label="Explore Living With Autism episodes"
                className="relative block aspect-video overflow-hidden xl:aspect-auto xl:h-full focus-visible:z-10 focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-white"
              >
                <Image
                  src={podcastBanner}
                  alt="Living With Autism: Real Voices, Real Stories. Sarita and Merina seated at microphones in the podcast studio, with deessa Foundation and SDG Studio branding."
                  fill
                  sizes="(min-width: 1280px) 55vw, 100vw"
                  className="object-cover object-[50%_40%]"
                />
              </Link>

              <div className="relative isolate flex min-w-0 flex-col justify-center overflow-hidden px-6 py-8 font-comic text-white sm:px-10 sm:py-10 xl:py-8 xl:pl-12 xl:pr-[max(2.5rem,calc((100vw-1320px)/2))]">
                <div data-podcast-badge className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#3FABDE]/65 px-3 py-1.5 text-[11px] font-bold tracking-[0.08em]">
                  <Mic2 className="size-4 shrink-0" aria-hidden="true" />
                  THE deessa PODCAST
                </div>

                <h2 id="home-podcast-title" className="font-marissa text-[30px] font-normal leading-[1.2] text-white sm:text-[34px]">Living With Autism</h2>
                <p className="mt-2 text-xl leading-snug text-white sm:text-[22px]">
                  Real voices. Real stories.
                </p>
                <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-white/85">
                  Honest conversations about autism, inclusion, and the
                  experiences that shape our communities.
                </p>

                <div className="mt-4">
                  <p data-podcast-hosted-label className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#72d4f5]">Hosted by</p>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 185px), 1fr))" }}>
                    {hosts.map((host) => (
                      <div key={host.name} data-podcast-host-card className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/30 bg-white/[0.04] p-2.5">
                        <Image
                          src={host.image}
                          alt=""
                          width={40}
                          height={40}
                          sizes="40px"
                          className="size-10 shrink-0 rounded-full object-cover ring-2 ring-white/30"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold leading-snug text-white">{host.name}</p>
                          <p className="mt-0.5 text-xs leading-snug text-white/80">{host.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/podcasts"
                  data-podcast-cta
                  className="group mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 self-start rounded-xl bg-white px-6 py-3 text-base font-bold text-brand-primary-dark shadow-sm transition-colors hover:bg-[#E8F6FC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
                >
                  Explore the podcast
                  <ArrowRight className="size-5 shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
/* ──────────────────  TESTIMONIALS SECTION  ────────────────── */

import { CircularTestimonials } from "@/components/shared/testimonials/circular-testimonials"

interface TestimonialsSectionProps {
  testimonials?: HomepageTestimonialsSettings
}

export function TestimonialsSection({ testimonials: testimonialsSettings }: TestimonialsSectionProps) {
  // Use CMS testimonials if provided, otherwise use defaults
  const testimonials =
    testimonialsSettings?.testimonials?.filter((t) => t.visible).sort((a, b) => a.order - b.order) ||
    DEFAULT_TESTIMONIALS.testimonials

  // Transform testimonials to match CircularTestimonials format
  const circularTestimonials = testimonials.map((t) => ({
    name: t.name,
    designation: `${t.role}, ${t.location}`,
    quote: t.quote,
    src: t.image || "",
    video: t.video,
    topic: t.topic,
    caption: t.caption,
  }))

  // The circular carousel only ever shows one active card in the accessibility
  // tree (the rest sit at opacity 0 as decorative side previews), so reading
  // the live DOM would speak just one testimonial and call it done. Read a
  // spoken digest of every visible testimonial instead, in display order.
  const testimonialsSpokenText = [
    "Global Voices. Inclusion Begins with Acceptance.",
    ...testimonials.map((t) => {
      const role = [t.role, t.location].filter(Boolean).join(", ")
      const message = t.caption || t.quote
      return `${t.name}${role ? `, ${role}` : ""}. ${message}`
    }),
  ].join(" ")

  return (
    <section
      className={cn(homeUi.surface, "py-14 sm:py-16 lg:py-20")}
      data-tts-section=""
      data-tts-priority="heading"
      data-tts-text={testimonialsSpokenText}
    >
      <div className={cn(homeUi.container, "z-10")}>
        <ScrollReveal animation="fade-up">
          <HomeSectionHeading
            className="mb-8"
            eyebrow="Global Voices"
            title="Inclusion Begins with"
            accent="Acceptance"
          />
        </ScrollReveal>

        <div className={cn(styles.testimonials, homeUi.inkVars, "flex justify-center")}>
          <CircularTestimonials
            testimonials={circularTestimonials}
            nameTextStroke="0.55px currentColor"
            autoplay={false}
            videoAutoplay={true}
            colors={{
              name: "var(--home-ink)",
              designation: "var(--home-muted)",
              testimony: "var(--home-body)",
              arrowBackground: "#FFFFFF",
              arrowForeground: "#0B5F8A",
              arrowHoverBackground: "#E8F6FC",
            }}
            fontSizes={{
              name: "1.75rem",
              designation: "1rem",
              quote: "1.125rem",
            }}
          />
        </div>
      </div>
    </section>
  )
}

/* ──────────────────  PARTNERS SECTION  ────────────────── */

// Partner Logo Components as SVGs
const WorldVisionLogo = () => (
  <svg viewBox="0 0 120 50" className="h-12 md:h-14 w-auto" fill="currentColor">
    <circle cx="15" cy="25" r="8" className="text-blue-600" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">
      World Vision
    </text>
  </svg>
)

const SaaltLogo = () => (
  <svg viewBox="0 0 80 50" className="h-12 md:h-14 w-auto" fill="currentColor">
    <text x="5" y="30" className="text-xl font-bold lowercase" fill="#2D5F3F">
      saalt
    </text>
  </svg>
)

const ActionAidLogo = () => (
  <svg viewBox="0 0 110 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="10" fill="#E63946" />
    <text x="30" y="30" className="text-xs font-bold" fill="currentColor">
      ActionAid
    </text>
  </svg>
)

const RealMedicineLogo = () => (
  <svg viewBox="0 0 180 50" className="h-12 md:h-14 w-auto">
    <rect x="5" y="15" width="18" height="18" rx="3" fill="#8B4513" />
    <text x="28" y="30" className="text-[10px] font-bold" fill="currentColor">
      Real Medicine Foundation
    </text>
  </svg>
)

const PedalHealthLogo = () => (
  <svg viewBox="0 0 120 50" className="h-12 md:h-14 w-auto">
    <path d="M15 25 L22 18 L22 32 Z" fill="#4CAF50" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">
      PedalHealth
    </text>
  </svg>
)

const WorldBicycleLogo = () => (
  <svg viewBox="0 0 160 50" className="h-12 md:h-14 w-auto">
    <circle cx="12" cy="30" r="7" stroke="#FF6B35" strokeWidth="2" fill="none" />
    <circle cx="28" cy="30" r="7" stroke="#FF6B35" strokeWidth="2" fill="none" />
    <text x="40" y="30" className="text-[10px] font-bold" fill="currentColor">
      World Bicycle Relief
    </text>
  </svg>
)

const UBCLogo = () => (
  <svg viewBox="0 0 80 50" className="h-14 md:h-16 w-auto">
    <rect x="10" y="10" width="35" height="30" rx="2" fill="#003366" />
    <text x="18" y="30" className="text-base font-bold" fill="white">
      UBC
    </text>
  </svg>
)

const BuildingEqualityLogo = () => (
  <svg viewBox="0 0 180 50" className="h-12 md:h-14 w-auto">
    <rect x="5" y="15" width="12" height="18" fill="#6A4C93" />
    <rect x="19" y="12" width="12" height="21" fill="#6A4C93" />
    <text x="36" y="30" className="text-[10px] font-bold" fill="currentColor">
      Building Equality
    </text>
  </svg>
)

const LSSLogo = () => (
  <svg viewBox="0 0 80 50" className="h-14 md:h-16 w-auto">
    <rect x="10" y="10" width="38" height="28" rx="3" fill="#2E7D32" />
    <text x="18" y="30" className="text-base font-bold" fill="white">
      LSS
    </text>
  </svg>
)

const RedCrossLogo = () => (
  <svg viewBox="0 0 100 50" className="h-12 md:h-14 w-auto">
    <rect x="15" y="15" width="7" height="18" fill="#E63946" />
    <rect x="11" y="19" width="15" height="7" fill="#E63946" />
    <text x="30" y="30" className="text-xs font-bold" fill="currentColor">
      Red Cross
    </text>
  </svg>
)

const UNICEFLogo = () => (
  <svg viewBox="0 0 90 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="20" r="9" fill="#00AEEF" />
    <path d="M11 25 L15 29 L19 25" stroke="white" strokeWidth="2" fill="none" />
    <text x="8" y="43" className="text-[10px] font-bold" fill="currentColor">
      UNICEF
    </text>
  </svg>
)

const WorldBankLogo = () => (
  <svg viewBox="0 0 110 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="10" fill="#009FDA" />
    <text x="30" y="30" className="text-xs font-bold" fill="currentColor">
      World Bank
    </text>
  </svg>
)

const SaveChildrenLogo = () => (
  <svg viewBox="0 0 140 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="9" fill="#E2231A" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">
      Save the Children
    </text>
  </svg>
)

const OxfamLogo = () => (
  <svg viewBox="0 0 90 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="9" fill="#61A534" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">
      Oxfam
    </text>
  </svg>
)

const RotaryLogo = () => (
  <svg viewBox="0 0 150 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="9" fill="#17458F" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">
      Rotary International
    </text>
  </svg>
)

const CareInternationalLogo = () => (
  <svg viewBox="0 0 140 50" className="h-12 md:h-14 w-auto">
    <rect x="5" y="15" width="18" height="18" rx="3" fill="#0066A6" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">
      Care International
    </text>
  </svg>
)

interface PartnersSectionProps {
  settings?: HomepageMarqueeSettings
}

export function PartnersSection({ settings }: PartnersSectionProps) {
  // Default settings if not provided from CMS
  const defaultSettings: HomepageMarqueeSettings = {
    enabled: true,
    speed: 50,
    pauseOnHover: true,
    repeatOnMobile: true,
    maxLogoHeight: 60,
    spacing: "comfortable",
    grouping: {
      enabled: false,
      groups: [],
    },
    spacingPresets: {
      compact: 16,
      comfortable: 32,
      spacious: 48,
    },
  }

  const marqueeSettings = settings || defaultSettings

  const partners = [
    { name: "World Vision", Component: WorldVisionLogo },
    { name: "saalt", Component: SaaltLogo },
    { name: "ActionAid", Component: ActionAidLogo },
    { name: "Real Medicine Foundation", Component: RealMedicineLogo },
    { name: "PedalHealth", Component: PedalHealthLogo },
    { name: "World Bicycle Relief", Component: WorldBicycleLogo },
    { name: "UBC", Component: UBCLogo },
    { name: "Building Equality", Component: BuildingEqualityLogo },
    { name: "LSS", Component: LSSLogo },
    { name: "Red Cross", Component: RedCrossLogo },
    { name: "UNICEF", Component: UNICEFLogo },
    { name: "World Bank", Component: WorldBankLogo },
    { name: "Save the Children", Component: SaveChildrenLogo },
    { name: "Oxfam", Component: OxfamLogo },
    { name: "Rotary International", Component: RotaryLogo },
    { name: "Care International", Component: CareInternationalLogo },
  ]

  // Don't render if marquee is disabled in CMS
  if (!marqueeSettings.enabled) {
    return null
  }

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-[linear-gradient(180deg,#fffaf4_0%,#f7fbff_100%)]">
      <div
        className="absolute inset-0 pointer-events-none opacity-55"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(63,171,222,0.08) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#F7C52B]/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Our Network</span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-6">
              Partners <span className="font-normal">&</span> Sponsors
            </h2>
            <div className="max-w-3xl mx-auto mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">Making the Impossible Possible</h3>
              <p className="text-foreground/70 leading-relaxed">
                We extend our heartfelt gratitude to our generous donors. Your support is transforming lives and
                creating lasting opportunities for communities in need. Thank you to our partners who believe in our
                mission and help us build a brighter future.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-0 sm:px-0 lg:px-0">
        <div className="relative overflow-hidden py-6 md:py-8">
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#fffaf4] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#f7fbff] to-transparent pointer-events-none z-10" />

          {/* Responsive marquee: CMS-controlled settings */}
          <MarqueeContainer partners={partners} settings={marqueeSettings} />
        </div>
      </div>
    </section>
  )
}

function MarqueeContainer({
  partners,
  settings,
}: {
  partners: { name: string; Component: React.FC }[]
  settings: HomepageMarqueeSettings
}) {
  const [isPaused, setIsPaused] = useState(false)
  const [repeatCount, setRepeatCount] = useState(3)
  const [duration, setDuration] = useState(settings.speed || 30)

  useEffect(() => {
    const calc = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200
      if (w < 640) {
        setRepeatCount(settings.repeatOnMobile ? 2 : 1)
        setDuration((settings.speed || 30) * 0.6)
      } else if (w < 1024) {
        setRepeatCount(3)
        setDuration((settings.speed || 30) * 0.9)
      } else if (w < 1280) {
        setRepeatCount(4)
        setDuration((settings.speed || 30) * 1.1)
      } else {
        setRepeatCount(6)
        setDuration((settings.speed || 30) * 1.4)
      }
    }
    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
  }, [settings.speed, settings.repeatOnMobile])

  const marqueePartners = Array.from({ length: repeatCount }).flatMap(() => partners)

  // Get spacing based on CMS setting
  const spacing = settings.spacingPresets[settings.spacing] || settings.spacingPresets.comfortable

  const animationStyle: React.CSSProperties = {
    width: "max-content",
    animationName: "marquee",
    animationDuration: `${duration}s`,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationPlayState: isPaused ? "paused" : "running",
  }

  return (
    <div className="relative">
      <div
        className="flex items-center py-3 animate-marquee"
        style={{
          ...animationStyle,
          gap: `${spacing}px`,
        }}
        onMouseEnter={() => settings.pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-hidden="true"
      >
        {marqueePartners.map((partner, i) => {
          const LogoComponent = partner.Component
          return (
            <div
              key={`partner-${i}`}
              className="group flex-none flex items-center justify-center px-2 py-1 md:px-3 md:py-2 transition-transform duration-300 hover:scale-105"
              title={partner.name}
              style={{ maxHeight: `${settings.maxLogoHeight}px` }}
            >
              <div className="flex items-center justify-center text-slate-800/95 transition-opacity duration-300 group-hover:opacity-100 opacity-90">
                <LogoComponent />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────  CONTACT SECTION (RESTORED)  ────────────────── */

export function ContactSection() {
  const contactItems = [
    { icon: MapPin, title: "Address", line1: "Dhobighat Nayabato, Sanepa, Lalitpur 44600", line2: "Nepal" },
    { icon: Phone, title: "Phone", line1: "+977-1-XXXXXXX", line2: null },
    { icon: Mail, title: "Email", line1: "deessa.social@gmail.com", line2: null },
    { icon: Clock, title: "Office Hours", line1: "Sun - Fri: 10:00 AM - 5:00 PM", line2: "Saturday: Closed" },
  ]

  return (
    <section className={cn(homeUi.surface, homeUi.sectionY)} data-tts-section="">
      <div className={cn(homeUi.container, "z-10")}>
        <ScrollReveal animation="fade-up">
          <HomeSectionHeading className="mb-10 sm:mb-16" eyebrow="Find Us" title="Visit Our" accent="Office" />
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-2">
          <div className={cn(homeUi.card, "divide-y divide-[#E3F1F8] px-5 py-2 sm:px-8 sm:py-3")}>
            {contactItems.map((item, i) => {
              const IconComp = item.icon
              return (
                <ScrollReveal key={item.title} animation="fade-right" delay={i * 120} className="py-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        homeUi.iconCircle,
                        HOME_TONES[(["sky", "sunny", "lavender", "mint"] as const)[i % 4]],
                        "size-12",
                      )}
                    >
                      <IconComp aria-hidden="true" className="size-6" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="font-comic text-lg font-bold text-[#063F5B]">{item.title}</h3>
                      <p className={cn(homeUi.body, "sm:text-base")}>{item.line1}</p>
                      {item.line2 && <p className={cn(homeUi.muted, "text-sm")}>{item.line2}</p>}
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
          <ScrollReveal animation="scale-in" delay={200}>
            <div
              className={`${styles.mapCard} h-[300px] md:h-[420px] lg:h-[520px]`}
              role="region"
              aria-label="Interactive map showing deessa Foundation office location"
              data-tts-ignore=""
            >
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent("Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal")}&output=embed&z=16`}
                className={styles.mapIframe}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="deessa Foundation Office Location, Dhobighat Nayabato, Sanepa, Lalitpur 44600"
              />

              {/* Floating info badge */}
              <div className={styles.mapOverlay}>
                <div className={styles.mapOverlayContent}>
                  <span className={styles.mapPill}>
                    <MapPin className="size-2.5 shrink-0" aria-hidden="true" />
                    Lalitpur, Nepal
                  </span>
                  <p className={styles.mapName}>deessa Foundation HQ</p>
                  <p className={styles.mapAddr}>Dhobighat Nayabato, Sanepa, Lalitpur 44600</p>
                </div>
                <a
                  href="https://maps.google.com/?q=Sanepa,Lalitpur,Nepal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapBtn}
                  aria-label="Open deessa Foundation office location in Google Maps (opens in new tab)"
                >
                  <span>Open in Maps</span>
                  <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────  GLOBAL ENHANCEMENTS  ────────────────── */

export function GlobalEnhancements() {
  return (
    <>
      <BackToTop />
    </>
  )
}
