"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  Download,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  HeartPulse,
  Droplet,
  Megaphone,
  Scale,
  Trees,
} from "lucide-react"
import { timeline } from "@/data/timeline"
import { allResources } from "@/components/resource-downloads"

const TEAL = "#29b6c8"
const DARK = "#1a1a2e"

/* Shared scroll-reveal props */
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
} as const

const whatWeDo = [
  {
    icon: Megaphone,
    title: "Awareness & Community Engagement",
    body: "We break the silence. Through community campaigns, social media, podcasts, and public conversations, we challenge myths and replace stigma with understanding.",
    iconBg: "#e0f2fe",
    color: "#0284c7",
  },
  {
    icon: GraduationCap,
    title: "Training",
    body: "We equip parents, teachers, health workers, and caregivers with the skills to spot autism early and support every child, the right way.",
    iconBg: "#fce7f3",
    color: "#db2777",
  },
  {
    icon: BookOpen,
    title: "Resources",
    body: "No family should have to navigate this journey alone. We build simple, accessible guides and tools for parents, educators, and professionals.",
    iconBg: "#fef3c7",
    color: "#d97706",
  },
  {
    icon: Scale,
    title: "Advocacy",
    body: "We push for inclusive schools and stronger policies that protect every child's rights — so inclusion becomes a right, not a privilege.",
    iconBg: "#dcfce7",
    color: "#16a34a",
  },
]

const howWeDoIt = [
  {
    title: "We Listen First",
    body: "Every family's journey is different. We listen first — to their needs, their challenges, their hopes — before we design any solution.",
    color: TEAL,
  },
  {
    title: "We Train the People Who Show Up",
    body: "Children thrive when the people around them know how to help. We train parents, teachers, health workers, and local leaders to build places where every child can succeed.",
    color: "#d97706",
  },
  {
    title: "We Work Through Partnership",
    body: "Inclusion takes a village. We bring together families, schools, health workers, and government to build one network of support for every child.",
    color: "#db2777",
  },
  {
    title: "We Build Change That Lasts",
    body: "We focus on what outlasts us. By growing local leaders and shaping better policy, we help create change that improves children's lives across Nepal.",
    color: TEAL,
  },
]

const teamMembers = [
  {
    name: "Bikram Thapa",
    role: "Program Director",
    bio: "Leading education initiatives across rural Nepal.",
    image: "/deesa-resources/changeMaker1.jpeg",
  },
  {
    name: "Rejina Gharti Magar",
    role: "Community Lead",
    bio: "Building sustainable communities through grassroots engagement.",
    image: "/deesa-resources/changeMaker2.jpeg",
  },
  {
    name: "Deepak Bashyal",
    role: "Health Coordinator",
    bio: "Bringing healthcare access to remote villages.",
    image: "/deesa-resources/changeMaker3.jpeg",
  },
]

const partnerCategories = [
  { icon: Handshake, label: "Partnerships", bg: "bg-blue-50", iconColor: "text-blue-500" },
  { icon: Globe, label: "Global NGOs", bg: "bg-green-50", iconColor: "text-green-500" },
  { icon: GraduationCap, label: "Education", bg: "bg-purple-50", iconColor: "text-purple-500" },
  { icon: HeartPulse, label: "Healthcare", bg: "bg-rose-50", iconColor: "text-rose-500" },
  { icon: Droplet, label: "Water", bg: "bg-cyan-50", iconColor: "text-cyan-500" },
  { icon: Trees, label: "Environment", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
]

const reports = [
  { title: "Annual Report 2023", size: "2.4 MB" },
  { title: "Financial Statement 2023", size: "1.1 MB" },
  { title: "Impact Assessment Q4 2023", size: "890 KB" },
]

/* lucide dropped brand icons — minimal inline SVGs for the social row */
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.22-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.72 6.24 5.44-6.24zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
    </svg>
  )
}

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

export function AboutSections() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 60%"],
  })

  return (
    <>
      {/* ─── SECTION 2 — WHO WE ARE ─── */}
      <section className="bg-[#f8f6f1] py-20 lg:py-[90px]">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 md:px-8 lg:grid-cols-[35fr_65fr] lg:gap-16">
          {/* Left — sticky visual anchor */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-28"
          >
            <div className="relative -rotate-2">
              <img
                src="/StoriesSectionImage.png"
                alt="A family and caregivers gathered in warm conversation, supporting a child"
                className="aspect-[4/5] w-full rounded-2xl object-cover shadow-[0_20px_40px_rgba(26,26,46,0.14)]"
                style={{ objectPosition: "78% 45%" }}
              />
              <span
                className="font-comic absolute bottom-4 left-4 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md"
                style={{ backgroundColor: TEAL }}
              >
                ✦ Since 2015
              </span>
            </div>
          </motion.div>

          {/* Right — text content, left-aligned */}
          <div>
            <motion.div {...reveal} transition={{ duration: 0.5 }}>
              <span className="font-comic mb-3 block text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
                Who We Are
              </span>
              <h2
                className="font-marissa mb-8 text-3xl font-medium leading-[1.25] md:text-[44px]"
                style={{ color: DARK }}
              >
                Every child deserves to be understood, accepted, and valued — just as they are.
              </h2>
            </motion.div>

            <motion.div
              {...reveal}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-dm-sans space-y-5 text-[17px] leading-[1.8] text-[#4a4a4a]"
            >
              <p>
                deessa Foundation is a non-profit working for and with children with disabilities, with a special focus
                on autism. Born from one family&apos;s story, we&apos;ve grown into a community of parents, educators,
                professionals, advocates, and changemakers who share one purpose: to build a society where every child
                belongs.
              </p>
              <p>
                We believe lasting inclusion begins with understanding. When children are understood, they are
                accepted. When they are accepted, they are valued. And when they are valued, they are given the chance
                to learn, grow, and thrive.
              </p>
              <p>
                Our vision is a Nepal where disability is never seen as a limit — where every child is known for their
                strengths, abilities, and potential. Where being different is never seen as being less.
              </p>
              <p
                className="rounded-r-xl py-4 pl-5 pr-6 font-semibold"
                style={{
                  backgroundColor: "rgba(41,182,200,0.08)",
                  borderLeft: `3px solid ${TEAL}`,
                  color: DARK,
                }}
              >
                At deessa Foundation, we stand for a world where every child is seen, heard, and included.
              </p>
            </motion.div>

            {/* Understood → Accepted → Valued → Thrive flow */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {["Understood", "Accepted", "Valued", "Thrive"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="font-comic rounded-full border bg-white px-4 py-1.5 text-sm font-bold"
                    style={{ borderColor: "rgba(41,182,200,0.3)", color: TEAL }}
                  >
                    {step}
                  </motion.span>
                  {i < 3 && (
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      aria-hidden
                    >
                      <ArrowRight className="size-4" style={{ color: TEAL }} />
                    </motion.span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 — WHAT WE DO ─── */}
      <section className="bg-white py-20 lg:py-[90px]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeader
            label="What We Do"
            title="We turn understanding into action — for children, families, and communities."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whatWeDo.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.article
                  key={card.title}
                  {...reveal}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group rounded-2xl bg-[#f8f6f1] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
                  style={{ borderTop: `3px solid ${card.color}` }}
                >
                  <div
                    className="mb-6 flex size-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: card.iconBg, color: card.color }}
                  >
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-marissa mb-3 text-[22px] font-medium" style={{ color: DARK }}>
                    {card.title}
                  </h3>
                  <p className="font-dm-sans text-[15px] leading-relaxed text-[#6b7280]">{card.body}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4 — HOW WE DO IT ─── */}
      <section className="bg-[#f8f6f1] py-20 lg:py-[90px]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeader
            label="How We Do It"
            title="Change doesn't start with programmes. It starts with people."
            sub="Every child, every family, and every community has a different journey. Our role is to walk alongside them, with understanding and hope."
          />

          <div className="relative">
            {/* Connecting dashed line — draws left to right */}
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
              {howWeDoIt.map((step, i) => (
                <motion.div
                  key={step.title}
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
            Because lasting inclusion isn&apos;t built by one organization. It&apos;s built by people, together, one
            step at a time.
          </motion.p>
        </div>
      </section>

      {/* ─── SECTION 5 — OUR JOURNEY TIMELINE ─── */}
      <section className="bg-white py-20 lg:py-[90px]" id="journey">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <SectionHeader label="Our Journey" title="Milestones that defined our path." />

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
              {timeline.map((item, index) => {
                const onLeft = index % 2 === 0
                return (
                  <div key={item.year} className="relative md:grid md:grid-cols-2 md:items-center md:gap-x-16">
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
                      className={`ml-12 min-h-[140px] rounded-2xl border border-black/[0.04] bg-[#f8f6f1] px-7 py-6 shadow-sm md:ml-0 ${
                        onLeft ? "md:col-start-1 md:mr-6" : "md:col-start-2 md:ml-6"
                      }`}
                    >
                      <p className="font-marissa text-[32px] leading-none" style={{ color: TEAL }}>
                        {item.year}
                      </p>
                      <h3 className="font-comic mt-2 text-lg font-bold" style={{ color: DARK }}>
                        {item.title}
                      </h3>
                      <p className="font-dm-sans mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                        {item.description}
                      </p>
                    </motion.article>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6 — MEET THE CHANGEMAKERS ─── */}
      <section className="bg-[#f8f6f1] py-20 lg:py-[90px]" id="team">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeader
            label="Our People"
            title="Meet the Changemakers"
            sub="Our diverse team of passionate individuals working tirelessly on the ground and behind the scenes."
          />
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, i) => (
              <motion.article
                key={member.name}
                {...reveal}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ filter: "saturate(1.05) contrast(1.05)" }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 p-4 pt-16"
                    style={{ background: "linear-gradient(to top, rgba(10,15,35,0.85) 0%, transparent 100%)" }}
                  >
                    <h3 className="font-comic text-[17px] font-bold text-white">{member.name}</h3>
                    <p className="font-dm-sans text-[13px]" style={{ color: TEAL }}>
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="font-dm-sans text-sm text-[#6b7280]">{member.bio}</p>
                  <div className="mt-4 flex gap-3">
                    <a
                      href="#"
                      aria-label={`${member.name} on LinkedIn`}
                      className="text-[#9ca3af] transition-colors hover:text-[#29b6c8]"
                    >
                      <LinkedinIcon className="size-4" />
                    </a>
                    <a
                      href="#"
                      aria-label={`${member.name} on Twitter`}
                      className="text-[#9ca3af] transition-colors hover:text-[#29b6c8]"
                    >
                      <TwitterIcon className="size-4" />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/get-involved"
              className="font-comic inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-75"
              style={{ color: TEAL }}
            >
              Meet the Full Team
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7 — PARTNERS & TRANSPARENCY ─── */}
      <section className="bg-white py-20 lg:py-[90px]" id="partners">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 md:px-8 lg:flex-row lg:gap-16">
          {/* Partners / focus areas */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <div className="mb-8">
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {partnerCategories.map((partner) => {
                const Icon = partner.icon
                return (
                  <div
                    key={partner.label}
                    className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#eee] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#29b6c8] hover:shadow-lg"
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

          {/* Transparency & Reports */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
            id="reports"
          >
            <div className="mb-8">
              <span className="font-comic mb-2 block text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
                Transparency
              </span>
              <h2 className="font-marissa text-2xl font-medium md:text-3xl" style={{ color: DARK }}>
                Transparency <span className="font-comic-num">&</span> Reports
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {reports.map((report) => (
                <div
                  key={report.title}
                  className="group flex items-center justify-between rounded-xl border border-[#eee] bg-white px-5 py-4 transition-all duration-300 hover:border-[#29b6c8]/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "rgba(41,182,200,0.1)", color: TEAL }}
                    >
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-comic text-sm font-bold" style={{ color: DARK }}>
                        {report.title}
                      </h3>
                      <p className="font-dm-sans text-xs text-[#6b7280]">PDF • {report.size}</p>
                    </div>
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#f8f6f1] text-[#6b7280] transition-colors group-hover:bg-[#29b6c8] group-hover:text-white">
                    <Download className="size-4 group-hover:animate-bounce" />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 8 — OFFICIAL DOCUMENTS & MATERIALS ─── */}
      <section className="bg-[#f8f6f1] py-20 lg:py-[90px]">
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
                      className="flex size-11 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(41,182,200,0.1)", color: TEAL }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-comic mb-1 text-base font-bold" style={{ color: DARK }}>
                        {resource.title}
                      </h3>
                      <p className="font-dm-sans text-sm leading-relaxed text-[#6b7280]">{resource.description}</p>
                    </div>
                  </div>
                  <a
                    href={resource.file}
                    download
                    className="font-comic group mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-[#eee] bg-[#f8f6f1] px-4 py-2.5 text-sm font-bold text-[#4a4a4a] transition-colors hover:border-[#29b6c8] hover:bg-[#29b6c8]/10 hover:text-[#1a8fa0]"
                  >
                    <Download className="size-4 transition-colors group-hover:text-[#29b6c8]" />
                    Download {resource.type?.toUpperCase()}
                  </a>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 9 — FINAL CTA ─── */}
      <section className="relative overflow-hidden pb-20 pt-32" style={{ backgroundColor: DARK }}>
        {/* Brush stroke transition from previous section */}
        <div className="pointer-events-none absolute left-0 top-0 w-full rotate-180" style={{ lineHeight: 0 }} aria-hidden>
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "100%", height: "clamp(50px, 6vw, 90px)" }}
          >
            <path
              d="M0,38 C120,72 240,18 380,52 C500,80 620,12 760,44 C880,70 1000,8 1140,38 C1260,62 1360,22 1440,42 L1440,100 L0,100 Z"
              fill="#f8f6f1"
            />
            <path
              d="M0,55 C150,28 300,68 440,38 C570,10 700,62 840,35 C970,10 1100,58 1240,30 C1330,12 1400,48 1440,32 L1440,100 L0,100 Z"
              fill="#f8f6f1"
              opacity="0.55"
            />
          </svg>
        </div>

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />
        {/* Radial teal glow */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at center, rgba(41,182,200,0.12) 0%, transparent 60%)" }}
          aria-hidden
        />

        <motion.div
          {...reveal}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-3xl px-4 text-center md:px-8"
        >
          <h2 className="font-marissa mb-4 text-3xl font-medium text-white md:text-4xl">
            Ready to Make a Difference?
          </h2>
          <p className="font-dm-sans mx-auto mb-8 max-w-2xl text-gray-400">
            Whether through volunteering, donating, or simply spreading the word, your involvement is crucial to our
            mission.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.045, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Link
                href="/donate"
                className="font-comic inline-flex h-12 items-center gap-2 rounded-full px-8 font-bold text-white shadow-lg transition-colors hover:bg-[#1a8fa0]"
                style={{ backgroundColor: TEAL }}
              >
                <Heart className="size-4 fill-current" />
                Donate Now
              </Link>
            </motion.div>
            <Link
              href="/get-involved"
              className="font-comic inline-flex h-12 items-center rounded-full border border-gray-600 bg-transparent px-8 font-bold text-white transition-colors hover:bg-white/10"
            >
              Join Our Team
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
