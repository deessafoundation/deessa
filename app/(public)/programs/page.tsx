import type { Metadata } from "next"
import Link from "next/link"
import { ProgramsClient } from "./programs-client"

export const metadata: Metadata = {
  title: "Programs - Deessa Foundation",
  description: "From classrooms in Karnali to clinics in the Terai — our programs deliver sustainable education, healthcare, and empowerment across Nepal's most remote communities.",
}

// Hardcoded programs data
const programs = [
  {
    id: "education",
    category: "education",
    categoryLabel: "📚 EDUCATION",
    categoryColor: "bg-blue-500",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80",
    title: "Building Schools, Building Futures",
    description: "Constructing classrooms and training teachers to bring quality education to rural Nepal's children.",
    stat: "3,000+ Students Reached",
    slug: "education",
  },
  {
    id: "healthcare",
    category: "healthcare",
    categoryLabel: "🏥 HEALTHCARE",
    categoryColor: "bg-green-500",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    title: "Bringing Medicine to the Mountains",
    description: "Mobile health camps, medical supplies, and trained health workers reaching 50+ remote villages.",
    stat: "200+ Health Camps Held",
    slug: "healthcare",
  },
  {
    id: "autism",
    category: "autism",
    categoryLabel: "🧩 AUTISM SUPPORT",
    categoryColor: "bg-orange-500",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    title: "Every Mind Is a Gift",
    description: "Therapy, family counseling, and inclusive education programs for children with autism across Nepal.",
    stat: "847 Children Supported",
    slug: "autism-support",
  },
  {
    id: "empowerment",
    category: "empowerment",
    categoryLabel: "👩 EMPOWERMENT",
    categoryColor: "bg-purple-500",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
    title: "Women Who Lead, Communities That Thrive",
    description: "Skill development, microfinance access, and leadership training for women across 25 districts.",
    stat: "10,000+ Women Empowered",
    slug: "women-empowerment",
  },
  {
    id: "relief",
    category: "relief",
    categoryLabel: "🆘 RELIEF",
    categoryColor: "bg-red-500",
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80",
    title: "Rebuilding After the Storm",
    description: "Emergency response, safe shelter construction, and community rebuilding after natural disasters.",
    stat: "5,000+ Families Helped",
    slug: "disaster-relief",
  },
  {
    id: "training",
    category: "training",
    categoryLabel: "🎨 TRAINING",
    categoryColor: "bg-teal-500",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=80",
    title: "Creative Expression, Lasting Skills",
    description: "Art workshops and vocational training programs that equip youth with tools for sustainable livelihoods.",
    stat: "500+ Youth Trained",
    slug: "art-training",
  },
]

export default function ProgramsPage() {
  return (
    <>
      {/* Hero Section - Immersive Photo Collage */}
      <section className="relative w-full overflow-hidden h-[100svh] md:h-[88vh]">
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
          className="absolute inset-0 z-[5]"
          style={{
            background:
              "linear-gradient(105deg, rgba(10, 15, 35, 0.92) 0%, rgba(10, 15, 35, 0.75) 38%, rgba(10, 15, 35, 0.30) 65%, rgba(10, 15, 35, 0.10) 100%)",
          }}
        />

        {/* Mobile darker overlay */}
        <div className="absolute inset-0 z-[5] bg-[rgba(10,15,35,0.88)] md:hidden" />

        {/* LAYER 3 - Content */}
        <div className="absolute left-[6%] top-1/2 -translate-y-1/2 z-10 max-w-[600px] px-4 md:px-0">
          {/* Breadcrumb */}
          <div className="mb-5 text-[13px] font-['DM_Sans'] text-white/45">Home › Programs</div>

          {/* Badge */}
          <div className="mb-[22px] text-[11px] font-['Comic_Neue'] tracking-widest text-[#29b6c8] border-l-[3px] border-[#29b6c8] pl-3">
            | MAKING A DIFFERENCE ACROSS NEPAL
          </div>

          {/* H1 */}
          <h1 className="mb-5 text-[48px] md:text-[64px] font-['Marissa'] leading-[1.08] text-white">
            <span className="block">Programs That</span>
            <span className="block">
              Change <span className="text-[#29b6c8]">Lives.</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-[17px] font-['DM_Sans'] text-white/76 max-w-[460px] leading-[1.7]">
            From classrooms in Karnali to clinics in Terai — sustainable education, healthcare, and empowerment
            reaching Nepal's most remote communities.
          </p>

          {/* Stats Row */}
          <div className="mb-8 flex flex-wrap gap-x-8 gap-y-4">
            {/* Stat 1 */}
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-['Marissa'] text-[#29b6c8] leading-none">6</span>
              <span className="text-[13px] font-['DM_Sans'] text-white/60">Programs</span>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] bg-white/20 self-stretch" />

            {/* Stat 2 */}
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-['Marissa'] text-[#29b6c8] leading-none">25+</span>
              <span className="text-[13px] font-['DM_Sans'] text-white/60">Districts</span>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] bg-white/20 self-stretch" />

            {/* Stat 3 */}
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-['Marissa'] text-[#29b6c8] leading-none">10K+</span>
              <span className="text-[13px] font-['DM_Sans'] text-white/60">Lives Changed</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col md:flex-row gap-3.5">
            <a
              href="#programs"
              className="inline-block text-center px-7 py-3.5 rounded-full bg-[#29b6c8] text-white font-['Comic_Neue'] font-bold text-[15px] hover:bg-[#1a8fa0] hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore Programs ↓
            </a>
            <Link
              href="/donate"
              className="inline-block text-center px-7 py-3.5 rounded-full border-[1.5px] border-white/55 text-white font-['Comic_Neue'] font-bold text-[15px] hover:border-white hover:bg-white/8 transition-all duration-300"
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

      {/* Programs Grid Section */}
      <section id="programs" className="bg-[#f8f6f1] py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Label */}
          <div className="mb-16 text-center">
            <div className="inline-block mb-3">
              <div className="text-[11px] font-['Comic_Neue'] tracking-widest text-[#29b6c8] border-l-[3px] border-[#29b6c8] pl-3 uppercase font-bold">
                ✦ OUR LIFE-CHANGING PROGRAMS
              </div>
            </div>
            <h2 className="text-[40px] md:text-[52px] font-['Marissa'] text-[#1a1a2e] leading-tight">
              Six Ways We <span className="text-[#29b6c8]">Make Impact</span>
            </h2>
            <p className="text-[16px] font-['DM_Sans'] text-[#1a1a2e]/70 max-w-2xl mx-auto mt-4">
              Each program is designed with input from communities themselves — ensuring sustainable change that lasts.
            </p>
          </div>
          
          <ProgramsClient programs={programs} />
        </div>
      </section>

      {/* Impact Stories Section - Why These Programs Matter */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-3">
              <div className="text-[11px] font-['Comic_Neue'] tracking-widest text-[#29b6c8] border-l-[3px] border-[#29b6c8] pl-3 uppercase font-bold">
                ★ REAL STORIES, REAL IMPACT
              </div>
            </div>
            <h2 className="text-[40px] md:text-[52px] font-['Marissa'] text-[#1a1a2e] leading-tight mb-4">
              Why These Programs <span className="text-[#29b6c8]">Matter</span>
            </h2>
            <p className="text-[16px] font-['DM_Sans'] text-[#1a1a2e]/70 max-w-2xl mx-auto">
              Numbers tell part of the story. Meet the people and communities transforming through our work.
            </p>
          </div>

          {/* Impact Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Story 1 */}
            <div className="group bg-gradient-to-br from-[#29b6c8]/8 to-[#29b6c8]/3 rounded-2xl p-8 border border-[#29b6c8]/20 hover:border-[#29b6c8]/50 hover:shadow-lg hover:shadow-[#29b6c8]/10 transition-all duration-300">
              <div className="mb-4 text-5xl">📚</div>
              <h3 className="text-[22px] font-['Marissa'] text-[#1a1a2e] mb-3 group-hover:text-[#29b6c8] transition-colors">
                Prakash's Second Chance
              </h3>
              <p className="text-[14px] font-['DM_Sans'] text-[#1a1a2e]/70 mb-4 leading-relaxed">
                "Before the school was built, I walked 3 hours daily. Now I'm top of my class and want to be a teacher."
              </p>
              <div className="flex items-center gap-2 text-[12px] font-['Comic_Neue'] text-[#29b6c8] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#29b6c8]" />
                Education Program • Humla District
              </div>
            </div>

            {/* Story 2 */}
            <div className="group bg-gradient-to-br from-[#29b6c8]/8 to-[#29b6c8]/3 rounded-2xl p-8 border border-[#29b6c8]/20 hover:border-[#29b6c8]/50 hover:shadow-lg hover:shadow-[#29b6c8]/10 transition-all duration-300">
              <div className="mb-4 text-5xl">🏥</div>
              <h3 className="text-[22px] font-['Marissa'] text-[#1a1a2e] mb-3 group-hover:text-[#29b6c8] transition-colors">
                Amrita's New Hope
              </h3>
              <p className="text-[14px] font-['DM_Sans'] text-[#1a1a2e]/70 mb-4 leading-relaxed">
                "The health camp diagnosed my daughter's condition early. Today she's thriving and going to school."
              </p>
              <div className="flex items-center gap-2 text-[12px] font-['Comic_Neue'] text-[#29b6c8] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#29b6c8]" />
                Healthcare Program • Rautahat
              </div>
            </div>

            {/* Story 3 */}
            <div className="group bg-gradient-to-br from-[#29b6c8]/8 to-[#29b6c8]/3 rounded-2xl p-8 border border-[#29b6c8]/20 hover:border-[#29b6c8]/50 hover:shadow-lg hover:shadow-[#29b6c8]/10 transition-all duration-300">
              <div className="mb-4 text-5xl">👩</div>
              <h3 className="text-[22px] font-['Marissa'] text-[#1a1a2e] mb-3 group-hover:text-[#29b6c8] transition-colors">
                Sunita's Independence
              </h3>
              <p className="text-[14px] font-['DM_Sans'] text-[#1a1a2e]/70 mb-4 leading-relaxed">
                "Skills training gave me confidence. Now I run a successful business and support my entire family."
              </p>
              <div className="flex items-center gap-2 text-[12px] font-['Comic_Neue'] text-[#29b6c8] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#29b6c8]" />
                Empowerment Program • Kaski
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intermediate CTA - Featured Program Focus */}
      <section className="bg-gradient-to-r from-[#29b6c8]/10 to-[#29b6c8]/5 py-12 md:py-16 border-y border-[#29b6c8]/20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left - Featured Program Image */}
            <div className="rounded-2xl overflow-hidden h-[300px] md:h-[350px] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80"
                alt="Supporting children with autism"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Right - CTA Content */}
            <div className="space-y-6">
              <div>
                <div className="inline-block mb-3 text-[11px] font-['Comic_Neue'] tracking-widest text-[#29b6c8] border-l-[3px] border-[#29b6c8] pl-3 uppercase font-bold">
                  🧩 FEATURED PROGRAM
                </div>
                <h3 className="text-[32px] md:text-[40px] font-['Marissa'] text-[#1a1a2e] leading-tight mb-3">
                  Support Autism Programs
                </h3>
              </div>
              
              <p className="text-[16px] font-['DM_Sans'] text-[#1a1a2e]/75 leading-relaxed">
                Our autism support initiative reaches 847+ children across Nepal, providing therapy, inclusive education, and family counseling. Your donation directly supports life-changing interventions.
              </p>

              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-[14px] font-['DM_Sans'] text-[#1a1a2e]/70">
                  <span className="w-2 h-2 rounded-full bg-[#29b6c8]" />
                  Therapy & counseling services
                </li>
                <li className="flex items-center gap-3 text-[14px] font-['DM_Sans'] text-[#1a1a2e]/70">
                  <span className="w-2 h-2 rounded-full bg-[#29b6c8]" />
                  Family support programs
                </li>
                <li className="flex items-center gap-3 text-[14px] font-['DM_Sans'] text-[#1a1a2e]/70">
                  <span className="w-2 h-2 rounded-full bg-[#29b6c8]" />
                  Inclusive education training
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link
                  href="/donate?program=autism"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#3FABDE] text-white font-['Comic_Neue'] font-semibold text-[15px] shadow-sm transition-all duration-300 hover:bg-[#3FABDE] hover:shadow-md"
                >
                  💜 Donate to Autism Support
                </Link>
                <Link
                  href="/programs/autism-support"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-[#3FABDE]/50 text-[#0B5F8A] font-['Comic_Neue'] font-semibold text-[15px] transition-all duration-300 hover:bg-[#3FABDE]/20 hover:border-[#3FABDE] hover:shadow-md"
                >
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
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

        <div className="relative z-20 py-16 md:py-24 px-4 text-center">
          <div className="mb-12">
            <div className="inline-block mb-3">
              <div className="text-[11px] font-['Comic_Neue'] tracking-widest text-[#29b6c8] border-l-[3px] border-[#29b6c8] pl-3 uppercase font-bold">
                ✨ READY TO MAKE A DIFFERENCE?
              </div>
            </div>
            <h2 className="text-[36px] sm:text-[44px] md:text-[56px] font-['Marissa'] text-white mb-4 leading-tight px-4">
              Support the Program That Calls to You
            </h2>
            <p className="text-[16px] md:text-[18px] font-['DM_Sans'] text-white/75 max-w-2xl mx-auto px-4">
              Every contribution creates ripples of positive change. Whether it's education, healthcare, or empowerment — your impact is direct and measurable.
            </p>
          </div>

          {/* 3 CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="group bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-2xl p-6 md:p-8 hover:border-[#29b6c8]/60 hover:shadow-[0_20px_40px_rgba(41,182,200,0.2)] hover:-translate-y-2 transition-all duration-300">
              <div className="text-5xl mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300">❤️</div>
              <h3 className="text-[22px] md:text-[24px] font-['Marissa'] text-white mb-3 md:mb-4 group-hover:text-[#29b6c8] transition-colors">Make a Donation</h3>
              <p className="text-[13px] md:text-[14px] font-['DM_Sans'] text-white/65 mb-6 md:mb-8 leading-relaxed">
                Support any program or create your custom impact by splitting your donation across multiple initiatives.
              </p>
              <Link
                href="/donate"
                className="inline-block px-6 md:px-7 py-3 md:py-3.5 rounded-xl bg-[#3FABDE] text-white font-['Comic_Neue'] font-semibold text-[13px] md:text-[14px] shadow-sm transition-all duration-300 hover:bg-[#3FABDE] hover:shadow-md group-hover:scale-105"
              >
                Donate Now
              </Link>
            </div>

            {/* Card 2 */}
            <div className="group bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-2xl p-6 md:p-8 hover:border-[#29b6c8]/60 hover:shadow-[0_20px_40px_rgba(41,182,200,0.2)] hover:-translate-y-2 transition-all duration-300">
              <div className="text-5xl mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300">🤝</div>
              <h3 className="text-[22px] md:text-[24px] font-['Marissa'] text-white mb-3 md:mb-4 group-hover:text-[#29b6c8] transition-colors">Become a Partner</h3>
              <p className="text-[13px] md:text-[14px] font-['DM_Sans'] text-white/65 mb-6 md:mb-8 leading-relaxed">
                Corporations, NGOs, and organizations can partner for deeper impact and shared mission alignment.
              </p>
              <Link
                href="/contact"
                className="inline-block px-6 md:px-7 py-3 md:py-3.5 rounded-xl border border-white/50 text-white font-['Comic_Neue'] font-semibold text-[13px] md:text-[14px] transition-all duration-300 hover:border-[#3FABDE] hover:bg-[#3FABDE]/15 hover:shadow-md group-hover:scale-105"
              >
                Partner With Us
              </Link>
            </div>

            {/* Card 3 */}
            <div className="group bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-2xl p-6 md:p-8 hover:border-[#29b6c8]/60 hover:shadow-[0_20px_40px_rgba(41,182,200,0.2)] hover:-translate-y-2 transition-all duration-300">
              <div className="text-5xl mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300">🙌</div>
              <h3 className="text-[22px] md:text-[24px] font-['Marissa'] text-white mb-3 md:mb-4 group-hover:text-[#29b6c8] transition-colors">Volunteer Your Skills</h3>
              <p className="text-[13px] md:text-[14px] font-['DM_Sans'] text-white/65 mb-6 md:mb-8 leading-relaxed">
                Contribute your expertise on the ground in Nepal or offer remote support from anywhere in the world.
              </p>
              <Link
                href="/get-involved"
                className="inline-block px-6 md:px-7 py-3 md:py-3.5 rounded-xl border border-white/50 text-white font-['Comic_Neue'] font-semibold text-[13px] md:text-[14px] transition-all duration-300 hover:border-[#3FABDE] hover:bg-[#3FABDE]/15 hover:shadow-md group-hover:scale-105"
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
