"use client"

import { Fragment, useRef, useState } from "react"
import Link from "next/link"
import { motion, useScroll } from "framer-motion"
import { useAccessibility } from "@/lib/hooks/use-accessibility"
import {
  ArrowRight,
  Download,
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
import { OrgStructure } from "./OrgStructure"
import introStyles from "./about-intro.module.css"

const TEAL = "#29b6c8"
const DARK = "#1a1a2e"

/* Shared scroll-reveal props */
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
} as const

interface TeamMember {
  name: string
  role: string
  bio: string | null
  image: string | null
  social_links?: {
    facebook?: string | null
    twitter?: string | null
    linkedin?: string | null
    instagram?: string | null
    tiktok?: string | null
    whatsapp?: string | null
  } | null
}

const partnerCategories = [
  { icon: Handshake, label: "Partnerships", bg: "bg-blue-50", iconColor: "text-blue-500" },
  { icon: Globe, label: "Global NGOs", bg: "bg-green-50", iconColor: "text-green-500" },
  { icon: GraduationCap, label: "Education", bg: "bg-purple-50", iconColor: "text-purple-500" },
  { icon: HeartPulse, label: "Healthcare", bg: "bg-rose-50", iconColor: "text-rose-500" },
  { icon: Droplet, label: "Water", bg: "bg-cyan-50", iconColor: "text-cyan-500" },
  { icon: Trees, label: "Environment", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
]

function SectionHeader({ label, title, sub, level = 2 }: { label: string; title: string; sub?: string; level?: 2 | 3 | 4 }) {
  const HeadingTag = `h${level}` as "h2" | "h3" | "h4"
  return (
    <motion.div {...reveal} transition={{ duration: 0.5 }} className="mx-auto mb-14 max-w-[700px] text-center">
      <span className="font-comic mb-3 block text-xs font-bold uppercase tracking-widest about-teal-text">
        {label}
      </span>
      <HeadingTag className="font-marissa text-3xl font-medium leading-[1.25] md:text-[40px] about-heading-dark">
        {title}
      </HeadingTag>
      {sub && <p className="font-dm-sans mt-4 text-base leading-relaxed text-[#6b7280] sm:text-lg">{sub}</p>}
    </motion.div>
  )
}

interface AboutSectionsProps {
  teamMembers?: TeamMember[]
  intro?: AboutIntroSettings
  howWeDoIt?: AboutHowWeDoItSettings
  journey?: AboutJourneySettings
}

export function AboutSections({ teamMembers = [], intro, howWeDoIt, journey }: AboutSectionsProps) {
  const introContent = intro || DEFAULT_ABOUT_PAGE_SETTINGS.intro
  const howWeDoItContent = howWeDoIt || DEFAULT_ABOUT_PAGE_SETTINGS.howWeDoIt
  const journeyContent = journey || DEFAULT_ABOUT_PAGE_SETTINGS.journey
  const timelineRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState<number | null>(null)
  const { preferences } = useAccessibility()
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 60%"],
  })

  return (
    <>
      {/* SECTION 2: WHO WE ARE */}
      <section className={introStyles.section} aria-labelledby="about-intro-title">
        <div className={introStyles.layout}>
          <div className={introStyles.media}>
            <video
              autoPlay
              controls
              muted
              playsInline
              preload="metadata"
              aria-label="Every child has potential"
              className={introStyles.video}
            >
              <source src="/every_child.mp4" type="video/mp4" />
              Your browser does not support embedded videos.
            </video>
          </div>
          <div className={introStyles.content}>
            <p className={introStyles.label}>{introContent.label}</p>
            <h2 id="about-intro-title" className={introStyles.title}>{introContent.headline}</h2>
            <div className={introStyles.paragraphs}>
              {introContent.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
            <blockquote className={introStyles.quote}>
              <Quote size={28} aria-hidden="true" />
              <p>{introContent.quote}</p>
            </blockquote>
            <ol className={introStyles.flow}>
              {introContent.flowSteps.map((step, index) => {
                const Icon = [Eye, MessageCircle, Heart, Sprout][index] || Heart
                return (
                  <Fragment key={step}>
                    <li className={introStyles.step}>
                      <div className={introStyles.stepContent}>
                        <span className={introStyles.icon}><Icon size={25} aria-hidden="true" /></span>
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
            </ol>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW WE DO IT */}
      <section className="bg-white py-10 sm:py-14 lg:py-16" aria-label="How We Do It">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeader
            label="How We Do It"
            title={howWeDoItContent.title}
            sub={howWeDoItContent.subtitle}
          />

          <div className="relative">
            {/* Connecting dashed line, draws left to right */}
            <motion.div
              initial={{ scaleX: 0 }}
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
                  initial={{ opacity: 0, scale: 0.8 }}
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
            transition={{ duration: 0.6 }}
            className="about-closing-text font-marissa mx-auto mt-8 max-w-[700px] text-center text-2xl italic leading-snug sm:mt-10"
            style={{ color: DARK }}
          >
            {howWeDoItContent.closingLine}
          </motion.p>
        </div>
      </section>

      {/* SECTION 5: OUR JOURNEY TIMELINE */}
      <section className="bg-white py-12 sm:py-20 lg:py-[90px]" id="journey" aria-label="Our Journey">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <SectionHeader
            label={journeyContent.label}
            title={journeyContent.title}
            sub={journeyContent.subtitle}
          />

          <div ref={timelineRef} className="relative">
            {/* Track + scroll-drawn line */}
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
                    {/* Circle marker */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: [0, 1.5, 1] }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.5 }}
                      className="about-timeline-marker absolute left-4 top-9 z-10 size-4 -translate-x-1/2 rounded-full border-2 border-white shadow md:left-1/2"
                      style={{ backgroundColor: TEAL }}
                      aria-hidden
                    />
                    {/* Horizontal connector to center line */}
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

      {/* SECTION 5.5: HOW THE FOUNDATION IS ORGANIZED (GOVERNANCE) */}
      <OrgStructure />

      {/* SECTION 6: MEET THE CHANGEMAKERS */}
      <section className="bg-white py-10 sm:py-14 lg:py-16" id="team" aria-label="Meet the Team">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeader
            label="Our People"
            title="Meet the Changemakers"
            sub="Our diverse team of passionate individuals working tirelessly on the ground and behind the scenes."
          />
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {teamMembers.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="font-dm-sans text-[#6b7280]">Team members coming soon.</p>
              </div>
            ) : (
              teamMembers.map((member, i) => {
                const isActive = activeCard === i
                return (
                <motion.article
                  key={member.name}
                  {...reveal}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="team-card group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black"
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${member.name}'s profile`}
                  aria-expanded={isActive}
                  onMouseEnter={() => setActiveCard(i)}
                  onMouseLeave={() => setActiveCard(null)}
                  onClick={() => setActiveCard(isActive ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setActiveCard(isActive ? null : i)
                    }
                  }}
                >
                  <div className="relative aspect-[4/5.5] overflow-hidden rounded-t-2xl">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className={`h-full w-full object-cover transition-all duration-700 ${isActive ? "scale-105 saturate-100" : "scale-100 saturate-0"}`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#29b6c8]/10 to-[#29b6c8]/5">
                        <span className="font-marissa text-6xl font-medium" style={{ color: TEAL }}>
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Bottom overlay, name & role + bio + social */}
                    <div
                      className={`absolute inset-x-0 bottom-0 transition-all duration-500 ease-out ${activeCard === i ? "translate-y-0" : "translate-y-full"} max-sm:translate-y-0`}
                      style={{ background: "linear-gradient(to top, rgba(10,15,35,0.92) 0%, rgba(10,15,35,0.7) 70%, transparent 100%)" }}
                    >
                      <div className="p-4 pt-6">
                        <h3 className="font-comic text-[17px] font-bold text-white">{member.name}</h3>
                        <p className="font-dm-sans text-[13px] text-white/80">
                          {member.role}
                        </p>
                        {member.bio && (
                          <p className="font-dm-sans mt-2 text-[13px] leading-relaxed text-white/70">
                            {member.bio}
                          </p>
                        )}
                        {member.social_links && Object.values(member.social_links).some((v) => v) && (
                          <div className="mt-2 flex gap-2">
                            {member.social_links.facebook && (
                              <a href={member.social_links.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Facebook`} className="text-white/70 transition-colors hover:text-[#1877f2]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              </a>
                            )}
                            {member.social_links.twitter && (
                              <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Twitter`} className="text-white/70 transition-colors hover:text-[#1da1f2]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.22-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.72 6.24 5.44-6.24zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>
                              </a>
                            )}
                            {member.social_links.linkedin && (
                              <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`} className="text-white/70 transition-colors hover:text-[#0a66c2]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
                              </a>
                            )}
                            {member.social_links.instagram && (
                              <a href={member.social_links.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Instagram`} className="text-white/70 transition-colors hover:text-[#e4405f]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                              </a>
                            )}
                            {member.social_links.tiktok && (
                              <a href={member.social_links.tiktok} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on TikTok`} className="text-white/70 transition-colors hover:text-white">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.18z"/></svg>
                              </a>
                            )}
                            {member.social_links.whatsapp && (
                              <a href={member.social_links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on WhatsApp`} className="text-white/70 transition-colors hover:text-[#25d366]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              )})
            )}
          </div>

        </div>
      </section>

      {/* SECTION 7: PARTNERS & SUPPORTERS */}
      <section className="bg-white py-12 sm:py-16 lg:py-20" id="partners" aria-label="Partners and Supporters">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-14 lg:px-[8%]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:text-left"
          >
            {/* Left: Heading block */}
            <div className="max-w-[38rem] lg:shrink-0">
              <span className="font-comic mb-1 block text-xs font-bold uppercase tracking-widest text-[#15151c]">
                Collaboration
              </span>
              <h2 className="font-marissa text-2xl font-medium text-[#0b76b7] md:text-3xl" style={{ WebkitTextStroke: "0.7px currentColor" }}>
                Our Partners <span className="font-comic-num">&</span> Supporters
              </h2>
              <p className="font-dm-sans mt-2 text-[15px] text-[#6b7280]">
                Working across sectors with organizations who share our vision.
              </p>
            </div>

            {/* Right: Horizontal icon row */}
            <div className="flex w-full flex-wrap items-stretch justify-center gap-3 sm:gap-4 lg:w-auto lg:flex-nowrap lg:justify-end">
              {partnerCategories.map((partner) => {
                const Icon = partner.icon
                return (
                  <div
                    key={partner.label}
                    role="article"
                    aria-label={partner.label}
                    className="group flex min-w-[86px] flex-1 basis-[28%] flex-col items-center justify-center gap-2 rounded-2xl border border-[#e2eef6] bg-[#f7fbfe] p-3 text-center shadow-[0_4px_18px_rgba(25,100,145,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#bfe1f4] hover:shadow-[0_10px_26px_rgba(25,100,145,0.1)] sm:basis-auto sm:px-4 sm:py-4 lg:min-w-[92px]"
                  >
                    <div
                      className={`about-partner-icon flex size-11 items-center justify-center rounded-xl ${partner.bg} ${partner.iconColor} transition-transform duration-300 group-hover:scale-110 sm:size-12`}
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
      </section>

      {/* SECTION 8: OFFICIAL DOCUMENTS & MATERIALS */}
      <section className="bg-[#f8f6f1] py-20 lg:py-[90px]" aria-label="Official Documents and Materials">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <SectionHeader
            label="Resources"
            title="Official Documents & Materials"
            sub="Access our organizational documents, brand guidelines, and registration certificates."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {allResources.map((resource, i) => {
              const Icon = resource.icon
              return (
                <motion.article
                  key={resource.title}
                  {...reveal}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="flex flex-col rounded-2xl bg-white p-7 shadow-sm"
                >
                  <div className="mb-4 flex items-start gap-4">
                    <div
                      className="about-resource-icon flex size-11 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(41,182,200,0.1)", color: TEAL }}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="about-heading-dark font-comic mb-1 text-base font-bold">
                        {resource.title}
                      </h3>
                      <p className="font-dm-sans text-sm leading-relaxed text-[#6b7280]">{resource.description}</p>
                    </div>
                  </div>
                  <a
                    href={resource.file}
                    download
                    aria-label={`Download ${resource.title} (${resource.type?.toUpperCase()})`}
                    className="about-download-btn font-comic group mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-[#eee] bg-[#f8f6f1] px-4 py-2.5 text-sm font-bold text-[#4a4a4a] transition-colors hover:border-[#29b6c8] hover:bg-[#29b6c8]/10 hover:text-[#1a8fa0]"
                  >
                    <Download className="size-4 transition-colors group-hover:text-[#29b6c8]" aria-hidden="true" />
                    Download {resource.type?.toUpperCase()}
                  </a>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 9: FINAL CTA */}
      <section className="relative isolate pt-5 sm:pt-7" style={{ background: "linear-gradient(to bottom, #fff 0 50%, var(--newsletter-bg) 50% 100%)" }} aria-labelledby="about-final-cta-heading">
        <div className="relative w-full">
          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
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
            className="pointer-events-none absolute inset-0 h-full w-full lg:hidden"
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
            transition={{ duration: 0.6 }}
            className="relative z-10 mx-auto flex max-w-[1500px] flex-col items-center justify-center gap-5 px-5 py-10 text-center sm:min-h-[290px] sm:px-14 sm:py-12 lg:min-h-[174px] lg:flex-row lg:justify-between lg:gap-10 lg:px-[8%] lg:py-7 lg:text-left"
          >
            <div className="max-w-[38rem]">
              <h2 id="about-final-cta-heading" className="font-brush text-[1.7rem] font-bold italic leading-tight text-white sm:text-[1.9rem]">
                Ready to Make a Difference?
              </h2>
              <p className="font-dm-sans mt-2 max-w-[34rem] text-sm leading-relaxed text-white/95 sm:text-[0.95rem]">
                Whether through volunteering, donating, or simply spreading the word, your involvement is crucial to our
                mission.
              </p>
            </div>

            <div className="flex w-full max-w-[21rem] flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center lg:w-auto lg:shrink-0">
              <Link
                href="/donate"
                className="font-comic inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-7 text-[0.95rem] font-bold text-cta-banner shadow-sm transition-colors duration-200 hover:bg-newsletter-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cta-banner"
              >
                Donate Now
                <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden="true" />
              </Link>
              <Link
                href="/get-involved"
                className="font-comic inline-flex min-h-11 items-center justify-center rounded-lg border-[1.5px] border-white bg-white/5 px-7 text-[0.95rem] font-bold text-white transition-colors duration-200 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cta-banner"
              >
                Join Our Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
