import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { WhatWeDoClient } from "./whatwedo-client"
import { getPublishedProgramCards } from "@/lib/programs/data"
import styles from "@/components/page-hero-contrast.module.css"

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

async function getPrograms() {
  try {
    const cards = await getPublishedProgramCards()
    return cards.map((card) => {
      const meta = categoryMeta[card.category] || { label: card.category.toUpperCase(), color: "bg-gray-500" }
      const cardData = card.card as Record<string, unknown> | null
      return {
        id: card.id,
        category: card.category,
        categoryLabel: meta.label,
        categoryColor: meta.color,
        image: (cardData?.image as string) || "",
        title: card.title,
        description: card.short_description,
        slug: card.slug,
      }
    })
  } catch {
    return []
  }
}

export default async function ProgramsPage() {
  const programs = await getPrograms()
  return (
    <>
      {/* Hero Section - Immersive Photo Collage */}
      <section id="whatwedo-hero" className={`${styles.hero} relative w-full overflow-hidden h-[100svh] md:h-[88vh]`}>
        {/* LAYER 1 - Photo Mosaic Background */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-[2px] bg-[#1a1a2e]">
          {/* Photo 1 - Large classroom (spans col 1-2, row 1) */}
          <div className="col-span-2 row-span-1 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=900&q=80"
              alt="Children learning in classroom"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.55) saturate(0.85)" }}
            />
          </div>

          {/* Photo 2 - Healthcare (col 3, row 1) */}
          <div className="col-span-1 row-span-1 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&q=80"
              alt="Doctor with patient"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.55) saturate(0.85)" }}
            />
          </div>

          {/* Photo 3 - Women empowerment (col 1, row 2) */}
          <div className="col-span-1 row-span-1 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80"
              alt="Women group empowerment"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.55) saturate(0.85)" }}
            />
          </div>

          {/* Photo 4 - Child learning (spans col 2-3, row 2) */}
          <div className="col-span-2 row-span-1 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&q=80"
              alt="Child learning"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.55) saturate(0.85)" }}
            />
          </div>
        </div>

        {/* LAYER 2 - Gradient Scrim */}
        <div
          data-hero-shade
          className="absolute inset-0 z-[5]"
          style={{
            background:
              "linear-gradient(105deg, rgba(10, 15, 35, 0.92) 0%, rgba(10, 15, 35, 0.75) 38%, rgba(10, 15, 35, 0.30) 65%, rgba(10, 15, 35, 0.10) 100%)",
          }}
        />

        {/* Mobile darker overlay */}
        <div data-mobile-shade className="absolute inset-0 z-[5] bg-[rgba(10,15,35,0.88)] md:hidden" />

        {/* LAYER 3 - Content */}
        <div data-hero-copy className="absolute left-[6%] top-1/2 -translate-y-1/2 z-10 max-w-[600px] px-4 md:px-0">
          {/* Breadcrumb */}
          <div className="mb-5 text-[13px] font-dm-sans text-white/45">Home › Programs</div>

          {/* Badge */}
          <div className="mb-[22px] text-[11px] font-comic tracking-widest text-[#29b6c8] border-l-[3px] border-[#29b6c8] pl-3">
            MAKING A DIFFERENCE ACROSS NEPAL
          </div>

          {/* H1 */}
          <h1 className="mb-5 text-[48px] md:text-[64px] font-marissa leading-[1.08] text-white">
            <span className="block">Programs That</span>
            <span className="block">
              Change <span className="text-[#29b6c8]">Lives.</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-[17px] font-dm-sans text-white/76 max-w-[460px] leading-[1.7]">
            From classrooms in Karnali to clinics in the Terai, our work brings sustainable education, healthcare, and empowerment
            reaching Nepal&apos;s most remote communities.
          </p>

          {/* CTAs */}
          <div className="flex flex-col md:flex-row gap-3.5">
            <a
              href="#programs"
              className="inline-block text-center px-7 py-3.5 rounded-full bg-[#29b6c8] text-white font-comic font-bold text-[15px] hover:bg-[#1a8fa0] hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore Programs ↓
            </a>
            <Link
              href="/donate"
              className="inline-block text-center px-7 py-3.5 rounded-full border-[1.5px] border-white/55 text-white font-comic font-bold text-[15px] hover:border-white hover:bg-white/8 transition-all duration-300"
            >
              Donate to a Program →
            </Link>
          </div>
        </div>

        {/* LAYER 4 - Brush Stroke Bottom Transition */}
        <div className="absolute bottom-[-2px] left-0 w-full z-20 pointer-events-none">
          <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            className="block w-full h-[80px]"
            xmlns="http://www.w3.org/2000/svg"
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
      </section>

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
            <h2 className="text-[32px] sm:text-[40px] md:text-[52px] font-marissa leading-[1.15] text-[#0b76b7] mb-5 px-4" style={{ WebkitTextStroke: "0.7px currentColor" }}>
              We turn understanding into action for children, families, and communities.
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
      <section id="programs" className="bg-[#f8f6f1] py-12 md:py-18">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-marissa leading-[1.15] text-[#1a1a2e] mb-4 px-4">
              Our Programs in Action
            </h2>
            <p className="text-[15px] md:text-[17px] font-dm-sans text-slate-600 max-w-2xl mx-auto px-4">
              From autism support to women&apos;s empowerment and creative training, explore the programs bringing inclusion and opportunity to life.
            </p>
          </div>
          
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-[380px] animate-pulse" />)}</div>}>
            <WhatWeDoClient programs={programs} />
          </Suspense>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="relative bg-[#1a1a2e] overflow-hidden">
        {/* Top Brush Stroke Transition */}
        <div className="absolute top-0 left-0 right-0 h-20 z-10">
          <svg
            viewBox="0 0 1200 80"
            preserveAspectRatio="none"
            className="w-full h-full rotate-180"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,40 Q150,10 300,35 T600,40 T900,30 T1200,45 L1200,80 L0,80 Z"
              fill="#f8f6f1"
            />
          </svg>
        </div>

        <div className="relative z-20 py-16 md:py-20 px-4 text-center">
          <h2 className="text-[36px] sm:text-[44px] md:text-[52px] font-marissa text-white mb-3 md:mb-4 leading-tight px-4">
            Want to Support a Specific Program?
          </h2>
          <p className="text-[16px] md:text-[18px] font-dm-sans text-white/72 max-w-2xl mx-auto mb-10 md:mb-12 px-4">
            Your targeted donation ensures maximum impact in the area you care about most.
          </p>

          {/* 3 CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white/6 border border-white/12 rounded-2xl p-6 md:p-8 hover:border-[#29b6c8] hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-3 md:mb-4">❤️</div>
              <h3 className="text-[22px] md:text-[24px] font-marissa text-white mb-2 md:mb-3">Make a Donation</h3>
              <p className="text-[13px] md:text-[14px] font-dm-sans text-white/60 mb-5 md:mb-6 leading-relaxed">
                Fund education, healthcare, or autism support directly.
              </p>
              <Link
                href="/donate"
                className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-[#29b6c8] text-white font-comic font-bold text-[13px] md:text-[14px] hover:bg-[#1a8fa0] transition-colors"
              >
                Donate Now
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-white/6 border border-white/12 rounded-2xl p-6 md:p-8 hover:border-[#29b6c8] hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-3 md:mb-4">🤝</div>
              <h3 className="text-[22px] md:text-[24px] font-marissa text-white mb-2 md:mb-3">Become a Partner</h3>
              <p className="text-[13px] md:text-[14px] font-dm-sans text-white/60 mb-5 md:mb-6 leading-relaxed">
                Organizations partnering with us multiply impact across Nepal.
              </p>
              <Link
                href="/contact"
                className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-full border-2 border-white text-white font-comic font-bold text-[13px] md:text-[14px] hover:bg-white/10 transition-colors"
              >
                Partner With Us
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white/6 border border-white/12 rounded-2xl p-6 md:p-8 hover:border-[#29b6c8] hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-3 md:mb-4">🙌</div>
              <h3 className="text-[22px] md:text-[24px] font-marissa text-white mb-2 md:mb-3">Volunteer Your Skills</h3>
              <p className="text-[13px] md:text-[14px] font-dm-sans text-white/60 mb-5 md:mb-6 leading-relaxed">
                Join our team on the ground or offer remote support to our programs.
              </p>
              <Link
                href="/get-involved"
                className="inline-block px-5 md:px-6 py-2.5 md:py-3 rounded-full border-2 border-white text-white font-comic font-bold text-[13px] md:text-[14px] hover:bg-white/10 transition-colors"
              >
                Get Involved
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
