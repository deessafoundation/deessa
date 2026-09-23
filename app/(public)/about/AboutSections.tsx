"use client"

import { Fragment, useRef, useState } from "react"
import Link from "next/link"
import { motion, useScroll } from "framer-motion"
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

function SectionHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <motion.div {...reveal} transition={{ duration: 0.5 }} className="mx-auto mb-14 max-w-[700px] text-center">
      <span className="font-comic mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
        {label}
      </span>
      <h2 className="font-marissa text-3xl font-medium leading-[1.25] md:text-[40px]" style={{ color: DARK }}>
        {title}
      </h2>
      {sub && <p className="font-dm-sans mt-4 text-lg text-[#6b7280]">{sub}</p>}
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
      <section className="bg-[#f8f6f1] py-20 lg:py-[90px]">
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
              className="absolute left-0 right-0 top-7 hidden origin-left border-t-2 border-dashed md:block"
              style={{ borderColor: "rgba(41,182,200,0.4)" }}
              aria-hidden
            />
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
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
                  <p className="font-marissa mb-3 text-5xl leading-none" style={{ color: step.color }}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-comic mb-3 text-[17px] font-bold" style={{ color: DARK }}>
                    {step.title}
                  </h3>
                  <p className="font-dm-sans text-[15px] leading-relaxed text-[#6b7280]">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p
            {...reveal}
            transition={{ duration: 0.6 }}
            className="font-marissa mx-auto mt-16 max-w-[700px] text-center text-2xl italic leading-snug"
            style={{ color: DARK }}
          >
            {howWeDoItContent.closingLine}
          </motion.p>
        </div>
      </section>

      {/* SECTION 5: OUR JOURNEY TIMELINE */}
      <section className="bg-white py-20 lg:py-[90px]" id="journey">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <SectionHeader
            label={journeyContent.label}
            title={journeyContent.title}
            sub={journeyContent.subtitle}
          />

          <div ref={timelineRef} className="relative">
            {/* Track + scroll-drawn line */}
            <div
              className="absolute bottom-0 left-4 top-0 w-[2px] -translate-x-1/2 md:left-1/2"
              style={{ backgroundColor: "rgba(41,182,200,0.15)" }}
              aria-hidden
            />
            <motion.div
              className="absolute bottom-0 left-4 top-0 w-[2px] origin-top -translate-x-1/2 md:left-1/2"
              style={{
                scaleY: scrollYProgress,
                background: "linear-gradient(to bottom, #29b6c8, #1a8fa0)",
              }}
              aria-hidden
            />

            <div className="space-y-12 md:space-y-20">
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
                      className="absolute left-4 top-9 z-10 size-4 -translate-x-1/2 rounded-full border-2 border-white shadow md:left-1/2"
                      style={{ backgroundColor: TEAL }}
                      aria-hidden
                    />
                    {/* Horizontal connector to center line */}
                    <div
                      className={`absolute top-9 hidden h-[2px] w-10 md:block ${
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
                      className={`ml-12 min-h-[140px] overflow-hidden rounded-2xl border border-black/[0.04] bg-[#f8f6f1] shadow-sm md:ml-0 ${
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
                      <div className="px-7 py-6">
                        <p className="font-marissa text-[32px] leading-none" style={{ color: TEAL }}>
                          {item.year}
                        </p>
                        <h3 className="font-comic mt-2 text-lg font-bold" style={{ color: DARK }}>
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
      <section className="bg-[#f8f6f1] py-20 lg:py-[90px]" id="team">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeader
            label="Our People"
            title="Meet the Changemakers"
            sub="Our diverse team of passionate individuals working tirelessly on the ground and behind the scenes."
          />
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="team-card group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg cursor-pointer"
                  onMouseEnter={() => setActiveCard(i)}
                  onMouseLeave={() => setActiveCard(null)}
                  onClick={() => setActiveCard(isActive ? null : i)}
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
                      className={`absolute inset-x-0 bottom-0 transition-all duration-500 ease-out ${activeCard === i ? "translate-y-0" : "translate-y-full"}`}
                      style={{ background: "linear-gradient(to top, rgba(10,15,35,0.92) 0%, rgba(10,15,35,0.7) 70%, transparent 100%)" }}
                    >
                      <div className="p-4 pt-6">
                        <h3 className="font-comic text-[17px] font-bold text-white">{member.name}</h3>
                        <p className="font-dm-sans text-[13px]" style={{ color: TEAL }}>
                          {member.role}
                        </p>
                        {member.bio && (
                          <p className="font-dm-sans mt-2 text-[13px] leading-relaxed text-gray-300">
                            {member.bio}
                          </p>
                        )}
                        {member.social_links && Object.values(member.social_links).some((v) => v) && (
                          <div className="mt-2 flex gap-2">
                            {member.social_links.facebook && (
                              <a href={member.social_links.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Facebook`} className="text-gray-400 transition-colors hover:text-[#1877f2]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              </a>
                            )}
                            {member.social_links.twitter && (
                              <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Twitter`} className="text-gray-400 transition-colors hover:text-[#1da1f2]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.22-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.72 6.24 5.44-6.24zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>
                              </a>
                            )}
                            {member.social_links.linkedin && (
                              <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`} className="text-gray-400 transition-colors hover:text-[#0a66c2]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
                              </a>
                            )}
                            {member.social_links.instagram && (
                              <a href={member.social_links.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Instagram`} className="text-gray-400 transition-colors hover:text-[#e4405f]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                              </a>
                            )}
                            {member.social_links.tiktok && (
                              <a href={member.social_links.tiktok} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on TikTok`} className="text-gray-400 transition-colors hover:text-[#000000]">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.18z"/></svg>
                              </a>
                            )}
                            {member.social_links.whatsapp && (
                              <a href={member.social_links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on WhatsApp`} className="text-gray-400 transition-colors hover:text-[#25d366]">
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
      <section className="bg-white py-20 lg:py-[90px]" id="partners">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="font-comic mb-2 block text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
                Collaboration
              </span>
              <h2 className="font-marissa text-2xl font-medium md:text-3xl" style={{ color: DARK }}>
                Our Partners <span className="font-comic-num">&</span> Supporters
              </h2>
              <p className="font-dm-sans mt-3 text-[15px] text-[#6b7280]">
                Working across sectors with organizations who share our vision.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
              {partnerCategories.map((partner) => {
                const Icon = partner.icon
                return (
                  <div
                    key={partner.label}
                    className="group flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-[#eee] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#29b6c8] hover:shadow-lg"
                  >
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl ${partner.bg} ${partner.iconColor} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <span className="font-comic text-[13px] font-bold uppercase tracking-wide" style={{ color: DARK }}>
                      {partner.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 9: FINAL CTA */}
      <section className="relative isolate overflow-hidden">
        {/* A single flat-brush sweep: deep-blue through the body, thinning to pale
            sky-blue bristle spikes where the brush enters and leaves the stroke.
            Matches the Figma "Ready to Make a Difference" reference. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1440 150"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Pigment load across the sweep: thin and pale where the brush entered
                and left the stroke, saturated through the body. */}
            <linearGradient id="cta-band" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--cta-brush-pale)" />
              <stop offset="3%" stopColor="var(--cta-brush)" />
              <stop offset="13%" stopColor="var(--cta-banner)" />
              <stop offset="87%" stopColor="var(--cta-banner)" />
              <stop offset="96%" stopColor="var(--cta-brush)" />
              <stop offset="100%" stopColor="var(--cta-brush-pale)" />
            </linearGradient>

            {/* Broad, low-frequency wobble: keeps the long edges organic without
                shredding them into a torn-paper zigzag. */}
            <filter id="cta-sweep" x="-5%" y="-45%" width="110%" height="190%">
              <feTurbulence type="fractalNoise" baseFrequency="0.011 0.03" numOctaves="3" seed="9" result="noise" />
              {/* Flatten R to 0.5 so displacement is vertical only: 0.5 is the
                  neutral value, so the X channel contributes no shift. */}
              <feColorMatrix
                in="noise"
                type="matrix"
                values="0 0 0 0 0.5  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="vertical"
              />
              <feDisplacementMap in="SourceGraphic" in2="vertical" scale="8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            {/* Noise that changes fast vertically but slowly horizontally, displaced
                along X only — turns a blunt shape into horizontal bristle spikes. */}
            <filter id="cta-fringe" x="-25%" y="-40%" width="150%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.005 0.45" numOctaves="2" seed="5" result="noise" />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0  0 0 0 0 1"
                result="horizontal"
              />
              <feDisplacementMap in="SourceGraphic" in2="horizontal" scale="34" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            {/* Mirror of the above: fast horizontal noise displaced along Y only, so
                the top and bottom edges grow fine upright brush hairs. */}
            <filter id="cta-edge-hair" x="-8%" y="-100%" width="116%" height="300%">
              <feTurbulence type="fractalNoise" baseFrequency="0.35 0.01" numOctaves="2" seed="17" result="noise" />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="0 0 0 0 0.5  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="vertical"
              />
              <feDisplacementMap in="SourceGraphic" in2="vertical" scale="7" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* One continuous flat-brush sweep. Nested filters compose: the inner
              sweep gives the long edges a broad wobble, the outer one grows fine
              brush hairs off the top and bottom. */}
          <g filter="url(#cta-edge-hair)">
            <g filter="url(#cta-sweep)">
              <path
                fill="url(#cta-band)"
                d="M40,24
                   C 180,14 280,18 420,15
                   C 560,12 700,22 860,17
                   C 1020,12 1160,20 1290,14
                   C 1340,11 1372,12 1400,11
                   L 1400,139
                   C 1360,143 1330,136 1200,140
                   C 1060,144 940,134 800,139
                   C 660,144 520,134 380,139
                   C 240,143 140,136 40,141
                   Z"
              />
            </g>
          </g>

          {/* Dry-bristle streaking along the sweep. Uses the vertical wobble so the
              streaks undulate with the stroke; a horizontal displacement would
              leave a long horizontal bar looking unchanged. Kept faint and inside
              the band's vertical bounds so it never spills past the painted edges
              or erodes the contrast of the white text. */}
          <g filter="url(#cta-sweep)" opacity="0.13">
            <path fill="var(--cta-brush-pale)" d="M40 38 H1300 V43 H40 Z" />
            <path fill="var(--cta-brush-pale)" d="M120 74 H1240 V78 H120 Z" />
            <path fill="var(--cta-brush-pale)" d="M80 112 H1320 V117 H80 Z" />
          </g>

          {/* Stroke entry: pale, thinly loaded pigment shredded into horizontal
              bristle spikes. Overlaps the band so the two read as one stroke, and
              its outer edge sits far enough inside the viewport that the spikes
              break against white rather than being clipped. */}
          <g filter="url(#cta-fringe)">
            <path fill="var(--cta-brush-pale)" d="M34 22 H185 V138 H34 Z" />
            <path fill="var(--cta-brush)" opacity="0.7" d="M40 34 H150 V120 H40 Z" />
          </g>

          {/* Stroke exit, same treatment mirrored */}
          <g filter="url(#cta-fringe)">
            <path fill="var(--cta-brush-pale)" d="M1252 18 H1404 V136 H1252 Z" />
            <path fill="var(--cta-brush)" opacity="0.7" d="M1288 30 H1398 V118 H1288 Z" />
          </g>
        </svg>

        <motion.div
          {...reveal}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto flex max-w-[1500px] flex-col items-center gap-6 px-8 py-8 text-center sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-[11%] lg:text-left"
        >
          <div className="lg:max-w-[25rem]">
            <h2 className="font-brush text-[1.6rem] font-bold italic leading-tight text-white md:text-[1.75rem]">
              Ready to Make a Difference?
            </h2>
            <p className="font-dm-sans mt-1.5 text-[0.8rem] leading-snug text-white">
              Whether through volunteering, donating, or simply spreading the word, your involvement is crucial to our
              mission.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Link
              href="/donate"
              className="font-dm-sans inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-white px-7 text-[0.8rem] font-semibold text-cta-banner transition-colors duration-200 hover:bg-newsletter-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cta-banner"
            >
              Donate Now
              <ArrowRight className="size-3.5" strokeWidth={2.75} aria-hidden="true" />
            </Link>
            <Link
              href="/get-involved"
              className="font-dm-sans inline-flex h-10 items-center justify-center rounded-[7px] border-[1.5px] border-white px-7 text-[0.8rem] font-semibold text-white transition-colors duration-200 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cta-banner"
            >
              Join Our Team
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
