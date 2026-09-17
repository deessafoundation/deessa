"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Heart, ArrowRight, GraduationCap, MapPin, Stethoscope,
  BookOpen, ChevronRight, Phone, Clock, Mail, Shield, Home as HomeIcon,
  Target, Eye, Flag, Users, Leaf, ArrowUpRight, Star,
  Quote, Award, Building2, Globe, Megaphone, FileText, Scale
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ScrollReveal,
  CountUp,
  BackToTop,
} from "@/components/scroll-animations"
import { BrushStroke } from "@/components/ui/brush-stroke"
import type { HomepageStat, HomepageMarqueeSettings, HomepageTestimonialsSettings, HomepageTimelineSettings, HomepageStorySettings, HomepageWhatWeDoSettings } from "@/lib/types/homepage-settings"
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
              {stat.sublabel && (
                <p className="text-xs text-slate-500">{stat.sublabel}</p>
              )}
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
  const imageSrc = s.image || "/image_coming_soon.png"

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <ScrollReveal animation="fade-up" duration={700}>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <Image
                  src={imageSrc}
                  alt={s.imageAlt}
                  width={700}
                  height={500}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
              </div>
              <ScrollReveal animation="scale-in" delay={400}>
                <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-primary text-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-xl animate-badge-bounce">
                  <p className="text-2xl md:text-4xl font-black font-comic-num">
                    {s.founded}
                  </p>
                  <p className="text-xs md:text-sm font-bold opacity-90">{s.foundedLabel}</p>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={200}>
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">{s.eyebrow}</span>
              <div className="mx-auto w-fit max-w-[92vw] mb-5 md:mb-6">
                <BrushStroke
                  variant="calligraphy"
                  gradient="teal-blue"
                  tilt={-1.2}
                  width="fit-content"
                  padding="0.45rem 0.4rem"
                  opacity={0.85}
                  animate={true}
                  animationDuration={1.2}
                  className="w-fit mx-auto"
                >
                  <div className="py-0 px-1.5">
                    <h2 className="font-marissa text-2xl md:text-[34px] text-white text-center" style={{ lineHeight: 1.15 }}>
                      {s.badgeText}
                    </h2>
                  </div>
                </BrushStroke>
              </div>
              {s.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`text-lg text-foreground/70 leading-relaxed ${i === s.paragraphs.length - 1 ? "mb-8" : "mb-6"}`}
                >
                  {p}
                </p>
              ))}
              <Link
                href={s.linkUrl}
                className="group inline-flex items-center gap-2 font-bold text-primary hover:text-primary/80 transition-colors text-lg"
              >
                {s.linkText}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-2 duration-300" />
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
  const cards = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To empower marginalized communities in Nepal through education, healthcare, and sustainable development, ensuring every individual has the opportunity to live with dignity and purpose.",
      color: "border-l-4 border-l-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: "A Nepal where every community thrives — where children dream freely, families are healthy, and opportunities are within everyone's reach.",
      color: "border-l-4 border-l-blue-500",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    {
      icon: Flag,
      title: "Our Objectives",
      description: "Build 100+ schools, reach 50,000+ lives through healthcare, empower 10,000+ women through skill development, and create lasting change in every district we serve.",
      color: "border-l-4 border-l-green-500",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500"
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-muted relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Our Direction</span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              Mission, Vision <span className="font-normal">&</span> Objectives
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Guided by clear values and a bold vision for Nepal&apos;s future.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <ScrollReveal animation="scale-in">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/missionVisionObjectives.png"
                alt="Mission, Vision and Objectives"
                width={700}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
          </ScrollReveal>

          <div className="space-y-8 connecting-line">
            {cards.map((card, i) => {
              const IconComp = card.icon
              return (
                <ScrollReveal key={card.title} animation="fade-right" delay={i * 200}>
                  <div className={`group ${card.color} rounded-xl bg-background/50 p-4 hover:scale-[1.02] transition-transform duration-300`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors`}>
                        <IconComp className={`size-7 ${card.iconColor} group-hover:rotate-[15deg] transition-transform duration-300`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-foreground mb-2">{card.title}</h3>
                        <p className="text-foreground/70 leading-relaxed">{card.description}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────  PROGRAMS SECTION  ────────────────── */

const pillarIconMap: Record<string, any> = {
  Megaphone, BookOpen, FileText, Scale, GraduationCap, Stethoscope,
  Shield, HomeIcon, Heart, Globe, Users, Award, Building2, Star,
}

interface ProgramsSectionProps {
  whatWeDo?: HomepageWhatWeDoSettings
}

export function ProgramsSection({ whatWeDo }: ProgramsSectionProps) {
  const w = whatWeDo || DEFAULT_WHAT_WE_DO
  const corePillars = [...w.pillars]
    .filter((p) => p.visible)
    .sort((a, b) => a.order - b.order)

  return (
    <section id="what-we-do" className="py-20 md:py-28 bg-white text-slate-900 relative overflow-hidden scroll-mt-24">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(41,182,200,0.12) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">{w.eyebrow}</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-[#1a1a2e]">{w.title}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {w.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {corePillars.map((pillar, idx) => {
            const IconComp = pillarIconMap[pillar.icon] || Megaphone
            return (
              <ScrollReveal
                key={pillar.id}
                animation={idx % 2 === 0 ? "fade-right" : "fade-left"}
                delay={idx * 150}
                className="h-full"
              >
                <div className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                  <div className="p-8 text-center flex flex-col flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">{pillar.statLabel}</p>
                    <div className={`w-16 h-16 ${pillar.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComp className="size-8 text-white animate-icon-float" />
                    </div>
                    <h3 className="text-xl font-black mb-3 text-[#1a1a2e]">
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
                    <p className="text-slate-600 text-sm leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
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
    MapPin, GraduationCap, Stethoscope, Heart, Globe, BookOpen,
    Users, Star, Award, Building2, Leaf, Shield
  }

  // Helper function to parse color classes and convert to inline styles
  const parseColorToStyle = (colorClass: string, type: 'gradient' | 'solid') => {
    if (type === 'gradient') {
      // Parse gradient: extract all hex colors
      const colors = colorClass.match(/#[0-9A-Fa-f]{3,6}/g)
      
      if (colors && colors.length >= 2) {
        return {
          background: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`
        }
      } else if (colors && colors.length === 1) {
        // Single color gradient (fallback)
        return {
          background: colors[0]
        }
      }
    } else {
      // Parse solid: extract first hex color
      const match = colorClass.match(/#[0-9A-Fa-f]{3,6}/)
      if (match) {
        return {
          backgroundColor: match[0]
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
      description: "Our scholarship initiative opened classroom doors for 200+ students with limited access to learning.",
      icon: GraduationCap,
      badgeClass: "from-[rgb(var(--accent-education))] to-amber-500",
      yearClass: "bg-[rgb(var(--accent-education))]",
    },
    {
      year: "2018",
      milestone: "Health camps expanded",
      description: "Medical outreach scaled to 50+ remote villages, bringing care closer to families who needed it most.",
      icon: Stethoscope,
      badgeClass: "from-[rgb(var(--accent-empowerment))] to-pink-500",
      yearClass: "bg-[rgb(var(--accent-empowerment))]",
    },
    {
      year: "2020",
      milestone: "COVID-19 relief",
      description: "Emergency food, hygiene kits, and support reached 5,000+ families during Nepal's most urgent months.",
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
        .filter(m => m.visible)
        .sort((a, b) => a.order - b.order)
        .map(m => ({
          ...m,
          icon: iconMap[m.icon] || MapPin
        }))
    : defaultMilestones

  const title = timelineSettings?.title || "Our Impact through the Years"
  const subtitle = timelineSettings?.subtitle || "For over a decade and counting, we have been transforming lives, building stronger communities, and creating lasting change."

  return (
    <section className="py-20 md:py-24 relative overflow-hidden bg-[linear-gradient(180deg,#f6f3ed_0%,#fbfaf7_100%)]">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: "radial-gradient(circle, rgba(63,171,222,0.22) 2px, transparent 2px)", backgroundSize: "42px 42px" }} />
      <div className="absolute -left-28 top-8 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Our <span className="text-primary">Impact through the Years</span>
            </h2>
            <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
              {subtitle}
            </p>
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
                <ScrollReveal 
                  key={item.year} 
                  animation={isLeft ? "fade-right" : "fade-left"} 
                  delay={i * 100}
                >
                  <div className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-8`}>
                    {/* Card */}
                    <div className={`w-[calc(50%-2rem)] ${isLeft ? 'text-right' : 'text-left'}`}>
                      <article className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className={`flex items-center gap-3 mb-4 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div 
                            className="size-14 rounded-full text-white shadow-md flex items-center justify-center flex-shrink-0"
                            style={parseColorToStyle(item.badgeClass, 'gradient')}
                          >
                            <IconComp className="size-7" />
                          </div>
                          <span 
                            className="inline-flex items-center rounded-full text-white text-sm font-bold px-4 py-1.5 font-comic-num"
                            style={parseColorToStyle(item.yearClass, 'solid')}
                          >
                            {item.year}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">
                          {item.milestone}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </article>
                    </div>

                    {/* Center dot */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-10">
                      <div 
                        className="size-4 rounded-full ring-4 ring-white shadow-md"
                        style={parseColorToStyle(item.yearClass, 'solid')}
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
              <ScrollReveal key={item.year} animation="fade-left" delay={i * 100}>
                <div className="relative">
                  {/* Dot on the line */}
                  <div className="absolute -left-8 top-6">
                    <div 
                      className="size-4 rounded-full ring-4 ring-white shadow-md"
                      style={parseColorToStyle(item.yearClass, 'solid')}
                    />
                  </div>

                  {/* Card */}
                  <article className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="size-12 rounded-full text-white shadow-md flex items-center justify-center flex-shrink-0"
                        style={parseColorToStyle(item.badgeClass, 'gradient')}
                      >
                        <IconComp className="size-6" />
                      </div>
                      <span 
                        className="inline-flex items-center rounded-full text-white text-sm font-bold px-4 py-1.5 font-comic-num"
                        style={parseColorToStyle(item.yearClass, 'solid')}
                      >
                        {item.year}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                      {item.milestone}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
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
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="absolute -left-28 top-12 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-[#F7C52B]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <Link
            href="/podcasts"
            className="group block overflow-hidden rounded-3xl border border-primary/15 bg-slate-950 shadow-2xl transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="Explore the Living With Autism podcast"
          >
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-72 overflow-hidden sm:min-h-96 lg:min-h-full">
                <Image
                  src="/podcast_banner.png"
                  alt="Living With Autism podcast with Sarita and Merina"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-[72%_10%] transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
              </div>

              <div className="flex flex-col justify-center p-8 text-white sm:p-12 lg:p-14">
                <h2 className="mb-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Living With Autism
                </h2>
                <p className="mb-8 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                  Real voices and real stories. Listen to honest conversations about autism, inclusion, and the experiences that shape our communities.
                </p>

                {/* Hosts Section */}
                <div className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-4">Hosted By</p>
                  <div className="flex flex-wrap gap-4">
                    {/* Host 1: Merina Panthii */}
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full pl-1 pr-4 py-1 border border-white/10 hover:border-primary/40 transition-all duration-300">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30">
                        <Image
                          src="/Merina Panthii.jpg"
                          alt="Merina Panthii"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">Merina Panthii</span>
                        <span className="text-xs text-white/60">President & Host</span>
                      </div>
                    </div>

                    {/* Host 2: Sarita Sapkota */}
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full pl-1 pr-4 py-1 border border-white/10 hover:border-primary/40 transition-all duration-300">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30">
                        <Image
                          src="/Sarita Sapkota.jpg"
                          alt="Sarita Sapkota"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">Sarita Sapkota</span>
                        <span className="text-xs text-white/60">Parent & Host</span>
                      </div>
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 text-lg font-bold text-primary transition-colors group-hover:text-white">
                  Explore the podcast
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-2" />
                </span>
              </div>
            </div>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ──────────────────  TESTIMONIALS SECTION  ────────────────── */

import { CircularTestimonials } from "@/components/circular-testimonials"

interface TestimonialsSectionProps {
  testimonials?: HomepageTestimonialsSettings
}

export function TestimonialsSection({ testimonials: testimonialsSettings }: TestimonialsSectionProps) {
  // Use CMS testimonials if provided, otherwise use defaults
  const testimonials = testimonialsSettings?.testimonials
    ?.filter(t => t.visible)
    .sort((a, b) => a.order - b.order) || DEFAULT_TESTIMONIALS.testimonials

  // Transform testimonials to match CircularTestimonials format
  const circularTestimonials = testimonials.map(t => ({
    name: t.name,
    designation: `${t.role}, ${t.location}`,
    quote: t.quote,
    src: t.image || "",
    video: t.video,
    topic: t.topic,
    caption: t.caption,
  }))

  return (
    <section className="py-16 md:py-24 bg-muted relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Global Voices</span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4">
              Inclusion Begins with Acceptance
            </h2>

          </div>
        </ScrollReveal>

        <div className="flex justify-center">
          <CircularTestimonials
            testimonials={circularTestimonials}
            autoplay={false}
            videoAutoplay={true}
            colors={{
              name: "hsl(var(--foreground))",
              designation: "hsl(var(--muted-foreground))",
              testimony: "hsl(var(--foreground) / 0.8)",
              arrowBackground: "hsl(var(--primary))",
              arrowForeground: "hsl(var(--primary-foreground))",
              arrowHoverBackground: "hsl(var(--primary) / 0.8)",
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
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">World Vision</text>
  </svg>
)

const SaaltLogo = () => (
  <svg viewBox="0 0 80 50" className="h-12 md:h-14 w-auto" fill="currentColor">
    <text x="5" y="30" className="text-xl font-bold lowercase" fill="#2D5F3F">saalt</text>
  </svg>
)

const ActionAidLogo = () => (
  <svg viewBox="0 0 110 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="10" fill="#E63946" />
    <text x="30" y="30" className="text-xs font-bold" fill="currentColor">ActionAid</text>
  </svg>
)

const RealMedicineLogo = () => (
  <svg viewBox="0 0 180 50" className="h-12 md:h-14 w-auto">
    <rect x="5" y="15" width="18" height="18" rx="3" fill="#8B4513" />
    <text x="28" y="30" className="text-[10px] font-bold" fill="currentColor">Real Medicine Foundation</text>
  </svg>
)

const PedalHealthLogo = () => (
  <svg viewBox="0 0 120 50" className="h-12 md:h-14 w-auto">
    <path d="M15 25 L22 18 L22 32 Z" fill="#4CAF50" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">PedalHealth</text>
  </svg>
)

const WorldBicycleLogo = () => (
  <svg viewBox="0 0 160 50" className="h-12 md:h-14 w-auto">
    <circle cx="12" cy="30" r="7" stroke="#FF6B35" strokeWidth="2" fill="none" />
    <circle cx="28" cy="30" r="7" stroke="#FF6B35" strokeWidth="2" fill="none" />
    <text x="40" y="30" className="text-[10px] font-bold" fill="currentColor">World Bicycle Relief</text>
  </svg>
)

const UBCLogo = () => (
  <svg viewBox="0 0 80 50" className="h-14 md:h-16 w-auto">
    <rect x="10" y="10" width="35" height="30" rx="2" fill="#003366" />
    <text x="18" y="30" className="text-base font-bold" fill="white">UBC</text>
  </svg>
)

const BuildingEqualityLogo = () => (
  <svg viewBox="0 0 180 50" className="h-12 md:h-14 w-auto">
    <rect x="5" y="15" width="12" height="18" fill="#6A4C93" />
    <rect x="19" y="12" width="12" height="21" fill="#6A4C93" />
    <text x="36" y="30" className="text-[10px] font-bold" fill="currentColor">Building Equality</text>
  </svg>
)

const LSSLogo = () => (
  <svg viewBox="0 0 80 50" className="h-14 md:h-16 w-auto">
    <rect x="10" y="10" width="38" height="28" rx="3" fill="#2E7D32" />
    <text x="18" y="30" className="text-base font-bold" fill="white">LSS</text>
  </svg>
)

const RedCrossLogo = () => (
  <svg viewBox="0 0 100 50" className="h-12 md:h-14 w-auto">
    <rect x="15" y="15" width="7" height="18" fill="#E63946" />
    <rect x="11" y="19" width="15" height="7" fill="#E63946" />
    <text x="30" y="30" className="text-xs font-bold" fill="currentColor">Red Cross</text>
  </svg>
)

const UNICEFLogo = () => (
  <svg viewBox="0 0 90 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="20" r="9" fill="#00AEEF" />
    <path d="M11 25 L15 29 L19 25" stroke="white" strokeWidth="2" fill="none" />
    <text x="8" y="43" className="text-[10px] font-bold" fill="currentColor">UNICEF</text>
  </svg>
)

const WorldBankLogo = () => (
  <svg viewBox="0 0 110 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="10" fill="#009FDA" />
    <text x="30" y="30" className="text-xs font-bold" fill="currentColor">World Bank</text>
  </svg>
)

const SaveChildrenLogo = () => (
  <svg viewBox="0 0 140 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="9" fill="#E2231A" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">Save the Children</text>
  </svg>
)

const OxfamLogo = () => (
  <svg viewBox="0 0 90 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="9" fill="#61A534" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">Oxfam</text>
  </svg>
)

const RotaryLogo = () => (
  <svg viewBox="0 0 150 50" className="h-12 md:h-14 w-auto">
    <circle cx="15" cy="25" r="9" fill="#17458F" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">Rotary International</text>
  </svg>
)

const CareInternationalLogo = () => (
  <svg viewBox="0 0 140 50" className="h-12 md:h-14 w-auto">
    <rect x="5" y="15" width="18" height="18" rx="3" fill="#0066A6" />
    <text x="28" y="30" className="text-xs font-bold" fill="currentColor">Care International</text>
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
      <div className="absolute inset-0 pointer-events-none opacity-55" style={{ backgroundImage: "radial-gradient(circle, rgba(63,171,222,0.08) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
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
                We extend our heartfelt gratitude to our generous donors. Your support is transforming lives and creating lasting opportunities for communities in need. Thank you to our partners who believe in our mission and help us build a brighter future.
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
            <MarqueeContainer 
              partners={partners} 
              settings={marqueeSettings}
            />
          </div>
      </div>
    </section>
  )
}

  function MarqueeContainer({ 
    partners, 
    settings 
  }: { 
    partners: { name: string; Component: React.FC }[]
    settings: HomepageMarqueeSettings
  }) {
    const [isPaused, setIsPaused] = useState(false)
    const [repeatCount, setRepeatCount] = useState(3)
    const [duration, setDuration] = useState(settings.speed || 30)

    useEffect(() => {
      const calc = () => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1200
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
      window.addEventListener('resize', calc)
      return () => window.removeEventListener('resize', calc)
    }, [settings.speed, settings.repeatOnMobile])

    const marqueePartners = Array.from({ length: repeatCount }).flatMap(() => partners)

    // Get spacing based on CMS setting
    const spacing = settings.spacingPresets[settings.spacing] || settings.spacingPresets.comfortable

    const animationStyle: React.CSSProperties = {
      width: 'max-content',
      animationName: 'marquee',
      animationDuration: `${duration}s`,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
      animationPlayState: isPaused ? 'paused' : 'running',
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
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Find Us</span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              Visit Our Office
            </h2>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            {contactItems.map((item, i) => {
              const IconComp = item.icon
              return (
                <ScrollReveal key={item.title} animation="fade-right" delay={i * 120}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComp className="size-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-black text-foreground mb-1">{item.title}</h3>
                      <p className="text-foreground/70">{item.line1}</p>
                      {item.line2 && <p className="text-foreground/50 text-sm">{item.line2}</p>}
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
          <ScrollReveal animation="scale-in" delay={200}>
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-border h-[300px] md:h-[420px] lg:h-[520px]">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent("Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal")}&output=embed&z=16`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="deessa Foundation Office Location, Dhobighat Nayabato, Sanepa, Lalitpur 44600"
              />
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
