"use client"

import type React from "react"
import { Fragment, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import type { AboutPageSettings } from "@/lib/types/about-settings"
import { TeamCard, type AboutTeamMember } from "@/components/about/team-card"
import { useAccessibility } from "@/lib/hooks/use-accessibility"
import {
  ArrowRight,
  Globe,
  GraduationCap,
  Handshake,
  HeartPulse,
  Droplet,
  Trees,
  Eye,
  MessageCircle,
  Heart,
  Sprout,
  Quote,
} from "lucide-react"
import type { AboutIntroSettings, AboutHowWeDoItSettings, AboutJourneySettings } from "@/lib/types/about-settings"
import { DEFAULT_ABOUT_PAGE_SETTINGS } from "@/lib/types/about-settings"
import { TEAM_TIERS, TEAM_TIER_DETAILS, type TeamTier } from "@/lib/types/team-input"
import { OrgStructure } from "./OrgStructure"
import { homeUi } from "@/components/home/home-ui"
import { splitHeadingAccent } from "@/components/home/home-tone"
import { cn } from "@/lib/utils"
import introStyles from "./about-intro.module.css"
import aboutSectionStyles from "./about-sections.module.css"

const TEAL = "#29b6c8"
const DARK = "#1a1a2e"

/* Shared scroll-reveal props */
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
} as const

/** Navy heading with one highlighted phrase (ocean blue + yellow paint stroke), same as the homepage headings. */
function AccentHeading({ lead, accent }: { lead?: string; accent?: string }) {
  return (
    <>
      {lead}
      {accent ? (
        <>
          {lead ? " " : null}
          <span className={homeUi.accent}>{accent}</span>
        </>
      ) : null}
    </>
  )
}

function SectionHeader({
  label,
  title,
  accent,
  sub,
  level = 2,
}: {
  label: string
  title?: string
  accent?: string
  sub?: string
  level?: 2 | 3 | 4
}) {
  const systemReduced = useReducedMotion()
  const { preferences } = useAccessibility()
  const reduced = !!systemReduced || preferences.reduceMotion || preferences.sensoryFriendly
  const HeadingTag = `h${level}` as "h2" | "h3" | "h4"
  return (
    <motion.div {...reveal} initial={reduced ? false : reveal.initial} transition={{ duration: 0.5 }} className="mx-auto mb-14 max-w-[700px] text-center">
      <span className="font-comic mb-3 block text-xs font-bold uppercase tracking-widest about-teal-text">
        {label}
      </span>
      <HeadingTag className={`${homeUi.heading} text-3xl leading-[1.25] md:text-[40px] about-heading-dark`}>
        <AccentHeading lead={title} accent={accent} />
      </HeadingTag>
      {sub && <p className="font-comic mt-4 text-base leading-relaxed text-[#6b7280] sm:text-lg">{sub}</p>}
    </motion.div>
  )
}

interface AboutSectionsProps {
  teamMembers?: AboutTeamMember[]
  settings?: AboutPageSettings
  teamUnavailable?: boolean
  intro?: AboutIntroSettings
  howWeDoIt?: AboutHowWeDoItSettings
  journey?: AboutJourneySettings
}

export function AboutSections({ teamMembers = [], intro, howWeDoIt, settings = DEFAULT_ABOUT_PAGE_SETTINGS, teamUnavailable = false }: AboutSectionsProps) {
  const introContent = intro || settings.intro
  const howWeDoItContent = howWeDoIt || settings.howWeDoIt
  // TODO: Restore journey data and scroll animation when the Our Journey section returns.
  // const journeyContent = journey || DEFAULT_ABOUT_PAGE_SETTINGS.journey
  // "...just as they are." reads better highlighted as a phrase than as the single word "are."
  const introHeading = /just as they are\.?$/i.test(introContent.headline.trim())
    ? (() => {
        const words = introContent.headline.trim().split(/\s+/)
        return { lead: words.slice(0, -4).join(" "), accent: words.slice(-4).join(" ") }
      })()
    : splitHeadingAccent(introContent.headline)
  const howWeDoItHeading = splitHeadingAccent(howWeDoItContent.title)
  // const journeyHeading = splitHeadingAccent(journeyContent.title)
  // const timelineRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState<number | string | null>(null)
  const systemReduced = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const { preferences } = useAccessibility()
  const reduced = !!systemReduced || preferences.reduceMotion || preferences.sensoryFriendly
  useEffect(() => { if (reduced) videoRef.current?.pause() }, [reduced])
  const media = introContent.media
  const partnerCategories = settings.partnerSection.categories
  const categoryIcons = { handshake: Handshake, globe: Globe, "graduation-cap": GraduationCap, "heart-pulse": HeartPulse, droplet: Droplet, trees: Trees }
  const categoryTones = { blue: "bg-blue-50 text-blue-500", green: "bg-green-50 text-green-500", purple: "bg-purple-50 text-purple-500", rose: "bg-rose-50 text-rose-500", cyan: "bg-cyan-50 text-cyan-500", emerald: "bg-emerald-50 text-emerald-500" }
  const flowIcons = { eye: Eye, "message-circle": MessageCircle, heart: Heart, sprout: Sprout }
  // Restore useScroll from framer-motion alongside the timeline.
  // const { scrollYProgress } = useScroll({
  //   target: timelineRef,
  //   offset: ["start 75%", "end 60%"],
  // })

  return (
    <>
      {/* SECTION 2: WHO WE ARE */}
      {settings.visibility.intro && <section className={introStyles.section} aria-labelledby="about-intro-title">
        <div className={introStyles.layout} data-has-media={!!media.src}>
          {media.src && <div className={introStyles.media}>
            <video
              ref={videoRef}
              key={media.src}
              autoPlay={media.autoPlay && !reduced}
              poster={media.poster || undefined}
              crossOrigin={media.captionsSrc.startsWith("https://") ? "anonymous" : undefined}
              onError={() => setVideoError(true)}
              onLoadedMetadata={() => setVideoError(false)}
              controls
              muted
              playsInline
              preload="metadata"
              aria-label={media.title}
              className={introStyles.video}
            >
              <source src={media.src} />
              <track kind="captions" src={media.captionsSrc || "/captions/empty.vtt"} srcLang={media.captionsLanguage || "en"} label={media.captionsLabel || "English"} default />
              Your browser does not support embedded videos.
            </video>
            {videoError && <p role="status" className="p-4 text-sm">The video could not be loaded.</p>}
            {media.transcript && <details className="p-4"><summary className="min-h-11 cursor-pointer">Video transcript</summary><p className="whitespace-pre-wrap">{media.transcript}</p></details>}
          </div>}
          <div className={introStyles.content}>
            <p className={introStyles.label}>{introContent.label}</p>
            <h2 id="about-intro-title" className={introStyles.title}>
              <AccentHeading lead={introHeading.lead} accent={introHeading.accent} />
            </h2>
            <div className={introStyles.paragraphs}>
              {introContent.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
            {introContent.quote && <blockquote className={introStyles.quote}>
              <Quote size={28} aria-hidden="true" />
              <p>{introContent.quote}</p>
            </blockquote>}
            {introContent.flowSteps.length > 0 && <ol className={introStyles.flow} style={{ "--flow-columns": introContent.flowSteps.flatMap((_, index) => index < introContent.flowSteps.length - 1 ? ["minmax(44px, 1fr)", "auto"] : ["minmax(44px, 1fr)"]).join(" ") } as React.CSSProperties}>
              {introContent.flowSteps.map((step, index) => {
                const appearance = introContent.flowAppearance[index] || { icon: "heart" as const, tone: "blue" as const }
                const Icon = flowIcons[appearance.icon]
                return (
                  <Fragment key={index}>
                    <li className={introStyles.step}>
                      <div className={introStyles.stepContent}>
                        <span className={introStyles.icon} data-tone={appearance.tone}><Icon size={25} aria-hidden="true" /></span>
                        <span>{step}</span>
                      </div>
                    </li>
                    {index < introContent.flowSteps.length - 1 && (
                      <li className={introStyles.arrowItem} aria-hidden="true">
                        <ArrowRight size={17} className={introStyles.arrow} />
                      </li>
                    )}
                  </Fragment>
                )
              })}
            </ol>}
          </div>
        </div>
      </section>}

      {/* SECTION 4: HOW WE DO IT */}
      {settings.visibility.process && <section className="bg-white py-10 sm:py-14 lg:py-16" aria-label={howWeDoItContent.label || "How We Do It"}>
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeader
            label={howWeDoItContent.label}
            title={howWeDoItHeading.lead}
            accent={howWeDoItHeading.accent}
            sub={howWeDoItContent.subtitle}
          />

          <div className="relative">
            {/* Connecting dashed line, draws left to right */}
            <motion.div
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="about-dashed-line absolute left-0 right-0 top-7 hidden origin-left border-t-2 border-dashed md:block"
              style={{ borderColor: "rgba(41,182,200,0.4)" }}
              aria-hidden
            />
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-10 md:grid-cols-4 md:gap-6">
              {howWeDoItContent.steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.15 }}
                  className="relative md:pt-14"
                >
                  {/* Circle marker on the line */}
                  <div
                    className="absolute left-1/2 top-7 z-10 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white md:block"
                    style={{ borderColor: step.color }}
                    aria-hidden
                  />
                  <p data-tts-ignore="" className="about-step-number font-marissa mb-3 text-5xl leading-none" style={{ color: step.color }}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="about-step-title font-comic mb-3 text-[17px] font-bold" style={{ color: DARK }}>
                    {step.title}
                  </h3>
                  <p className="about-step-body font-dm-sans text-[15px] leading-relaxed text-[#6b7280]">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p
            {...reveal}
            initial={reduced ? false : reveal.initial}
            transition={{ duration: 0.6 }}
            className="about-closing-text font-marissa mx-auto mt-8 max-w-[700px] text-center text-2xl italic leading-snug sm:mt-10"
            style={{ color: DARK }}
          >
            {howWeDoItContent.closingLine}
          </motion.p>
        </div>
      </section>}

      {/* TODO: Restore Our Journey ("Milestones that define our path.") when ready.
      <section className="bg-white py-12 sm:py-20 lg:py-[90px]" id="journey" aria-label="Our Journey">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <SectionHeader
            label={journeyContent.label}
            title={journeyHeading.lead}
            accent={journeyHeading.accent}
            sub={journeyContent.subtitle}
          />

          <div ref={timelineRef} className="relative">
            Track + scroll-drawn line
            <div
              className="about-timeline-track absolute bottom-0 left-4 top-0 w-[2px] -translate-x-1/2 md:left-1/2"
              style={{ backgroundColor: "rgba(41,182,200,0.15)" }}
              aria-hidden
            />
            <motion.div
              className="about-timeline-progress absolute bottom-0 left-4 top-0 w-[2px] origin-top -translate-x-1/2 md:left-1/2"
              style={{
                scaleY: scrollYProgress,
                background: "linear-gradient(to bottom, #29b6c8, #1a8fa0)",
              }}
              aria-hidden
            />

            <div className="space-y-8 sm:space-y-12 md:space-y-20">
              {journeyContent.milestones.map((item, index) => {
                const onLeft = index % 2 === 0
                return (
                  <div key={item.id} className="relative md:grid md:grid-cols-2 md:items-center md:gap-x-16">
                    Circle marker
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: [0, 1.5, 1] }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.5 }}
                      className="about-timeline-marker absolute left-4 top-9 z-10 size-4 -translate-x-1/2 rounded-full border-2 border-white shadow md:left-1/2"
                      style={{ backgroundColor: TEAL }}
                      aria-hidden
                    />
                    Horizontal connector to center line
                    <div
                      className={`about-connector absolute top-9 hidden h-[2px] w-10 md:block ${
                        onLeft ? "right-1/2 mr-[7px]" : "left-1/2 ml-[7px]"
                      }`}
                      style={{ backgroundColor: "rgba(41,182,200,0.3)" }}
                      aria-hidden
                    />

                    <motion.article
                      initial={{ opacity: 0, x: onLeft ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.5 }}
                      aria-label={`${item.year} - ${item.title}`}
                      className={`ml-10 min-h-[140px] overflow-hidden rounded-2xl border border-black/[0.04] bg-[#f8f6f1] shadow-sm sm:ml-12 md:ml-0 ${
                        onLeft ? "md:col-start-1 md:mr-6" : "md:col-start-2 md:ml-6"
                      }`}
                    >
                      {item.image && (
                        <div className="relative aspect-[16/9] overflow-hidden bg-[#eaf5f6]">
                          <img
                            src={item.image}
                            alt={item.imageAlt || item.title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="px-5 py-5 sm:px-7 sm:py-6">
                        <p className="about-timeline-year font-marissa text-[32px] leading-none" style={{ color: TEAL }}>
                          {item.year}
                        </p>
                        <h3 className="about-heading-dark font-comic mt-2 text-lg font-bold" style={{ color: DARK }}>
                          {item.title}
                        </h3>
                        <p className="font-dm-sans mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                          {item.description}
                        </p>
                      </div>
                    </motion.article>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      */}

      {/* SECTION 5.5: HOW THE FOUNDATION IS ORGANIZED (GOVERNANCE) */}
      {settings.visibility.governance && <OrgStructure settings={settings.governance} />}

      {/* SECTION 6: MEET THE CHANGEMAKERS */}
      {settings.visibility.people && <section className="bg-white py-10 sm:py-14 lg:py-16" id="team" aria-label={settings.people.title}>
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeader
            label={settings.people.label}
            title={settings.people.title}
            accent={settings.people.accent}

            sub={settings.people.description}
          />
          {teamMembers.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="font-dm-sans text-[#6b7280]">{teamUnavailable ? settings.people.unavailableMessage : settings.people.emptyMessage}</p>
            </div>
          ) : (
            <div>
              {(() => {
                const grouped = TEAM_TIERS.map(tierKey => {
                  const meta = TEAM_TIER_DETAILS[tierKey]
                  const members = teamMembers.filter(m => (m.tier || "vision") === tierKey)
                  return { tierKey, meta, members }
                }).filter(group => group.members.length > 0)

                return grouped.map((group, gIndex) => (
                  <div key={group.tierKey} className={cn(aboutSectionStyles.tierGroup, gIndex > 0 && aboutSectionStyles.tierDivider)}>
                    <div className={aboutSectionStyles.tierHeader}>
                      <div>
                        <span className={aboutSectionStyles.tierEyebrow}>
                          {group.meta.subtitle}
                        </span>
                        <h3 className={aboutSectionStyles.tierTitle}>
                          {group.meta.label}
                        </h3>
                      </div>
                      <p className={aboutSectionStyles.tierDesc}>
                        {group.meta.description}
                      </p>
                    </div>

                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                      {group.members.map((member, mIndex) => {
                        const cardId = member.id || `${group.tierKey}-${member.name}-${mIndex}`
                        return (
                          <TeamCard
                            key={cardId}
                            member={member}
                            index={mIndex}
                            active={activeCard === cardId}
                            onActivate={(active) => setActiveCard(active ? cardId : null)}
                            reduced={reduced}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))
              })()}
            </div>
          )}

        </div>
      </section>}

      {/* SECTION 7: PARTNERS & SUPPORTERS */}
      {settings.visibility.partners && <section className="bg-white py-12 sm:py-16 lg:py-20" id="partners" aria-label={settings.partnerSection.title}>
        <div className="mx-auto max-w-[1500px] px-5 sm:px-14 lg:px-[8%]">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:text-left"
          >
            {/* Left: Heading block */}
            <div className="max-w-[38rem] lg:shrink-0">
              <span className="font-comic mb-1 block text-xs font-bold uppercase tracking-widest text-[#15151c]">
                {settings.partnerSection.label}
              </span>
              <h2 className={`${homeUi.heading} text-2xl md:text-3xl`}>
                <AccentHeading lead={settings.partnerSection.title} accent={settings.partnerSection.accent} />
              </h2>
              <p className="font-dm-sans mt-2 text-[15px] text-[#6b7280]">
                {settings.partnerSection.description}
              </p>
            </div>

            {/* Right: Horizontal icon row */}
            <div className="flex w-full flex-wrap items-stretch justify-center gap-3 sm:gap-4 lg:w-auto lg:flex-nowrap lg:justify-end">
              {partnerCategories.map((partner) => {
                const Icon = categoryIcons[partner.icon]
                return (
                  <div
                    key={partner.id}
                    role="article"
                    aria-label={partner.label}
                    className="group flex min-w-[86px] flex-1 basis-[28%] flex-col items-center justify-center gap-2 rounded-2xl border border-[#e2eef6] bg-[#f7fbfe] p-3 text-center shadow-[0_4px_18px_rgba(25,100,145,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#bfe1f4] hover:shadow-[0_10px_26px_rgba(25,100,145,0.1)] sm:basis-auto sm:px-4 sm:py-4 lg:min-w-[92px]"
                  >
                    <div
                      className={`about-partner-icon flex size-11 items-center justify-center rounded-xl ${categoryTones[partner.tone]} transition-transform duration-300 group-hover:scale-110 sm:size-12`}
                    >
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <span className="about-heading-dark font-comic text-[12px] font-bold uppercase tracking-wide sm:text-[13px]">
                      {partner.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>}

      {/* SECTION 8: FINAL CTA */}
      {settings.visibility.getInvolved && <section data-about-cta className={aboutSectionStyles.ctaSection} aria-labelledby="about-final-cta-heading">
        <div className="relative w-full">
          <svg
            className={`${aboutSectionStyles.ctaWave} hidden lg:block`}
            viewBox="0 0 1440 190"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="about-cta-paint" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#329bd0" />
                <stop offset="13%" stopColor="#1a6a9e" />
                <stop offset="82%" stopColor="#155f91" />
                <stop offset="100%" stopColor="#2e9bce" />
              </linearGradient>
            </defs>
            <path
              fill="#59afe0"
              opacity="0.82"
              d="M0 76 C72 52 163 38 295 36 C482 32 628 39 806 36 C1015 32 1260 27 1440 22 L1440 190 C1274 188 1110 190 918 190 C702 190 501 187 319 190 C192 190 85 187 0 190 Z"
            />
            <path
              fill="url(#about-cta-paint)"
              d="M0 91 C68 61 150 37 281 29 C398 22 508 26 634 25 C775 24 885 31 1013 25 C1190 17 1338 24 1440 28 L1440 183 C1368 187 1269 185 1149 188 C982 190 855 186 717 188 C544 190 436 185 299 188 C178 190 74 186 0 188 Z"
            />
            <g fill="none" strokeLinecap="round" opacity="0.32">
              <path d="M0 66 C68 52 129 48 216 46" stroke="#75c3e7" strokeWidth="3" />
              <path d="M0 75 C46 68 105 62 178 58" stroke="#75c3e7" strokeWidth="2" />
              <path d="M0 150 C76 155 119 153 210 151" stroke="#70bee5" strokeWidth="2" />
              <path d="M1260 37 C1328 39 1381 39 1440 43" stroke="#82c9e9" strokeWidth="2" />
              <path d="M1305 146 C1362 148 1409 150 1440 149" stroke="#82c9e9" strokeWidth="3" />
            </g>
            <g fill="none" stroke="#9bd3ed" strokeLinecap="round" opacity="0.12">
              <path d="M150 60 C381 48 653 56 890 51 C1074 47 1241 49 1375 47" strokeWidth="3" />
              <path d="M200 118 C438 112 638 118 842 115 C1066 111 1202 116 1350 112" strokeWidth="2" />
              <path d="M62 137 C299 133 539 137 731 134 C910 132 1142 137 1380 131" strokeWidth="2" />
            </g>
          </svg>
          <svg
            className={`${aboutSectionStyles.ctaWave} lg:hidden`}
            viewBox="0 0 390 360"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="about-cta-mobile-paint" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#329bd0" />
                <stop offset="20%" stopColor="#1a6a9e" />
                <stop offset="85%" stopColor="#155f91" />
                <stop offset="100%" stopColor="#329bd0" />
              </linearGradient>
            </defs>
            <path fill="#6ab9e1" opacity="0.7" d="M0 34 C64 20 144 18 218 19 C289 20 341 17 390 30 L390 360 C328 358 260 360 191 360 C117 360 50 358 0 360 Z" />
            <path fill="url(#about-cta-mobile-paint)" d="M0 45 C52 27 113 30 178 24 C244 20 322 26 390 36 L390 350 C325 356 258 350 190 354 C118 357 49 351 0 352 Z" />
            <g fill="none" stroke="#a0d5ee" strokeLinecap="round" opacity="0.13">
              <path d="M20 49 C118 39 247 44 366 43" strokeWidth="2" />
              <path d="M16 308 C104 303 255 309 370 304" strokeWidth="3" />
            </g>
          </svg>

          <motion.div
            {...reveal}
            initial={reduced ? false : reveal.initial}
            transition={{ duration: 0.6 }}
            className="relative z-10 mx-auto flex max-w-[1500px] flex-col items-center justify-center gap-5 px-5 py-10 text-center sm:min-h-[290px] sm:px-14 sm:py-12 lg:min-h-[174px] lg:flex-row lg:justify-between lg:gap-10 lg:px-[8%] lg:py-7 lg:text-left"
          >
            <div className="max-w-[38rem]">
              <h2 id="about-final-cta-heading" className={aboutSectionStyles.ctaHeading}>
                {settings.getInvolved.title}
              </h2>
              <p className={aboutSectionStyles.ctaSub}>
                {settings.getInvolved.description}
              </p>
            </div>

            <div className="flex w-full max-w-[21rem] flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center lg:w-auto lg:shrink-0">
              <Link
                href={settings.getInvolved.primaryHref}
                className={aboutSectionStyles.ctaPrimaryBtn}
              >
                {settings.getInvolved.primaryLabel}
                <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden="true" />
              </Link>
              <Link
                href={settings.getInvolved.secondaryHref}
                className={aboutSectionStyles.ctaSecondaryBtn}
              >
                {settings.getInvolved.secondaryLabel}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>}
    </>
  )
}
