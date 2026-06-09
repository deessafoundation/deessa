"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Camera, Clock, Tag } from "lucide-react"
import { motion } from "framer-motion"

interface Story {
  id: string
  title: string
  slug: string
  excerpt: string
  image: string | null
  category: string | null
  is_featured: boolean
  published_at: string | null
  created_at: string | null
  read_time: string | null
  formattedDate?: string
}

interface StoriesSectionsProps {
  primaryStory: Story | null
  activeFilter: string
  spotlightMainStory: Story | null
  spotlightSideStories: Story[]
  remainingStories: Story[]
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -36 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const fadeRight = {
  hidden: { opacity: 0, x: 36 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

// Category → accent colour map
const CATEGORY_COLORS: Record<string, string> = {
  "Speech Therapy":       "bg-violet-600",
  "Inclusive Education":  "bg-emerald-600",
  "Family Support":       "bg-rose-600",
  "Early Intervention":   "bg-amber-600",
  "Transition Support":   "bg-sky-600",
  "Therapy":              "bg-teal-600",
  "Education":            "bg-emerald-600",
  "Health":               "bg-rose-600",
  "Relief":               "bg-amber-600",
  "Empowerment":          "bg-violet-600",
  "Infrastructure":       "bg-sky-600",
  "Events":               "bg-indigo-600",
}

function getCategoryColor(cat: string | null): string {
  if (!cat) return "bg-primary"
  return CATEGORY_COLORS[cat] ?? "bg-primary"
}

function PlaceholderImage({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${className}`}>
      <Camera className="size-10 text-slate-300" />
    </div>
  )
}

export function StoriesSections({
  primaryStory,
  activeFilter,
  spotlightMainStory,
  spotlightSideStories,
  remainingStories,
}: StoriesSectionsProps) {
  return (
    <>
      {/* ═══════════════════════════════════════════
          SECTION 2 — FEATURED STORY  (premium editorial)
      ═══════════════════════════════════════════ */}
      <section
        id="featured"
        className="relative overflow-hidden bg-[#faf9f6] py-24"
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-violet-100/40 blur-[100px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-100/40 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-6">
          {primaryStory ? (
            <div className="grid gap-14 lg:grid-cols-[48%_52%] lg:items-center">

              {/* ── IMAGE SIDE ── */}
              <motion.div
                variants={fadeLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="relative"
              >
                {/* Layered shadow card */}
                <div className="absolute -bottom-4 -right-4 h-full w-full rounded-[2rem] bg-teal/15 blur-sm" />
                <div className="absolute -bottom-2 -right-2 h-full w-full rounded-[2rem] border border-teal/20 bg-white" />

                <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.22)]">
                  {primaryStory.image ? (
                    <Image
                      src={primaryStory.image}
                      alt={primaryStory.title}
                      fill
                      sizes="(min-width: 1024px) 44vw, 100vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <PlaceholderImage className="h-full w-full" />
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Bottom badge */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg ${getCategoryColor(primaryStory.category)}`}>
                      <span className="size-1.5 rounded-full bg-white/70" />
                      {primaryStory.category || "Featured"}
                    </span>
                    {primaryStory.read_time && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur">
                        <Clock className="size-3" />
                        {primaryStory.read_time}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ── TEXT SIDE ── */}
              <motion.div
                variants={fadeRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="lg:pl-10"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-teal">
                  ★ Featured Story
                </span>

                <h2 className="font-marissa mt-5 text-[2.6rem] leading-[1.15] text-[#1a1a2e] lg:text-[3rem]">
                  {primaryStory.title}
                </h2>

                {/* Accent rule */}
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-[3px] w-10 rounded-full bg-teal" />
                  <span className="font-dm text-xs text-slate-400">{primaryStory.formattedDate}</span>
                </div>

                <p className="font-dm mt-6 text-[1.05rem] leading-[1.85] text-slate-600">
                  {primaryStory.excerpt}
                </p>

                {/* Pull quote */}
                <blockquote className="relative mt-7 overflow-hidden rounded-2xl bg-gradient-to-br from-teal/10 to-violet-50 p-6">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-teal" />
                  <p className="font-marissa text-xl italic leading-relaxed text-[#1a1a2e]">
                    "Every child deserves a path that celebrates their potential, not their limitations."
                  </p>
                </blockquote>

                {/* Tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Education Access", "Family Support", "Community Change"].map((tag) => (
                    <span
                      key={tag}
                      className="font-dm inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
                    >
                      <Tag className="size-3 text-teal" />
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/stories/${primaryStory.slug || primaryStory.id}`}
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#1a1a2e] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(26,26,46,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(26,26,46,0.5)]"
                >
                  Read Full Story
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-14 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-teal">No Featured Story</p>
              <h3 className="font-marissa mt-4 text-3xl text-[#1a1a2e]">
                This section is ready for the next published story.
              </h3>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — WRITTEN STORIES GRID
      ═══════════════════════════════════════════ */}
      <section id="stories" className="relative bg-white py-24">
        {/* Thin top rule */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="mx-auto max-w-6xl px-6">
          {/* ── Section header ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <motion.div variants={fadeUp} className="max-w-2xl">
              <p className="font-comic text-xs font-bold uppercase tracking-[0.22em] text-teal">
                Written Stories
              </p>
              <h2 className="font-marissa mt-3 text-[2.5rem] leading-[1.2] text-[#1a1a2e]">
                Narratives of Unfolding Potential
              </h2>
              <p className="font-dm mt-3 text-[1rem] leading-relaxed text-slate-500">
                The strongest stories here combine quiet confidence, family support, and visible progress.
              </p>
            </motion.div>

            {/* Filter tabs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5">
              {[
                { key: "all", label: "All Stories" },
                { key: "latest", label: "Latest" },
                { key: "featured", label: "Featured" },
              ].map((option) => {
                const isActive = activeFilter === option.key
                return (
                  <Link
                    key={option.key}
                    href={option.key === "all" ? "/stories#stories" : `/stories?filter=${option.key}#stories`}
                    className={
                      isActive
                        ? "rounded-full bg-[#1a1a2e] px-5 py-2.5 text-xs font-bold tracking-wide text-white shadow-md transition-all"
                        : "rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold tracking-wide text-slate-500 transition-all hover:border-teal hover:text-teal"
                    }
                  >
                    {option.label}
                  </Link>
                )
              })}
            </motion.div>
          </motion.div>

          {/* ── Spotlight grid: large left + two small right ── */}
          {spotlightMainStory ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid gap-5 lg:grid-cols-[58%_42%]"
            >
              {/* LARGE CARD */}
              <motion.div variants={fadeUp} custom={0}>
                <Link href={`/stories/${spotlightMainStory.slug}`} className="group block h-full">
                  <article className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] ring-1 ring-slate-100 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] hover:ring-teal/40">
                    {/* Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {spotlightMainStory.image ? (
                        <Image
                          src={spotlightMainStory.image}
                          alt={spotlightMainStory.title}
                          fill
                          sizes="(min-width: 1024px) 55vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <PlaceholderImage className="h-full w-full" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                      {/* Category badge */}
                      <div className="absolute left-4 top-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow ${getCategoryColor(spotlightMainStory.category)}`}>
                          {spotlightMainStory.category || "Story"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-7">
                      <h3 className="font-marissa text-[1.65rem] leading-[1.25] text-[#1a1a2e] transition-colors duration-300 group-hover:text-teal">
                        {spotlightMainStory.title}
                      </h3>
                      <p className="font-dm mt-3 line-clamp-2 text-[0.95rem] leading-relaxed text-slate-500">
                        {spotlightMainStory.excerpt}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-5">
                        <div className="flex items-center gap-3">
                          <span className="font-dm text-[11px] font-medium text-slate-400">
                            {spotlightMainStory.formattedDate}
                          </span>
                          {spotlightMainStory.read_time && (
                            <>
                              <span className="size-1 rounded-full bg-slate-300" />
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                <Clock className="size-3" />
                                {spotlightMainStory.read_time}
                              </span>
                            </>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-teal transition-all duration-300 group-hover:gap-2.5">
                          Read story
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>

                    {/* Bottom accent bar */}
                    <div className="absolute bottom-0 inset-x-0 h-[3px] origin-left scale-x-0 rounded-b-3xl bg-teal transition-transform duration-500 group-hover:scale-x-100" />
                  </article>
                </Link>
              </motion.div>

              {/* SMALL CARDS — right column */}
              <motion.div variants={fadeUp} custom={1} className="flex flex-col gap-4">
                {spotlightSideStories.map((story, i) => (
                  <Link key={story.id} href={`/stories/${story.slug}`} className="group flex-1">
                    <article className="flex h-full gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.12)] hover:ring-teal/30">
                      {/* Thumbnail */}
                      <div className="relative h-[110px] w-[110px] flex-shrink-0 overflow-hidden rounded-xl">
                        {story.image ? (
                          <Image
                            src={story.image}
                            alt={story.title}
                            fill
                            sizes="110px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <PlaceholderImage className="h-full w-full" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
                      </div>

                      {/* Text */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                        <div>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white ${getCategoryColor(story.category)}`}>
                            {story.category || "Story"}
                          </span>
                          <h3 className="font-marissa mt-2 line-clamp-1 text-[1.1rem] leading-[1.3] text-[#1a1a2e] transition-colors group-hover:text-teal">
                            {story.title}
                          </h3>
                          <p className="font-dm mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {story.excerpt}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-dm text-[11px] text-slate-400">{story.formattedDate}</span>
                            {story.read_time && (
                              <>
                                <span className="size-1 rounded-full bg-slate-200" />
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                  <Clock className="size-3" />
                                  {story.read_time}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-teal opacity-0 transition-all duration-300 group-hover:opacity-100">
                            READ ↗
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <div className="rounded-3xl bg-slate-50 p-14 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-teal">No stories yet</p>
              <h3 className="font-marissa mt-4 text-2xl text-[#1a1a2e]">
                This section is ready for the next published story.
              </h3>
            </div>
          )}

          {/* ── Remaining stories — 2-col grid ── */}
          {remainingStories.length > 0 && (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="mt-5 grid gap-5 md:grid-cols-2"
            >
              {remainingStories.slice(0, 2).map((story, i) => (
                <motion.div key={story.id} variants={fadeUp} custom={i}>
                  <Link href={`/stories/${story.slug}`} className="group block h-full">
                    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] ring-1 ring-slate-100 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)] hover:ring-teal/40">
                      <div className="relative aspect-[3/2] overflow-hidden">
                        {story.image ? (
                          <Image
                            src={story.image}
                            alt={story.title}
                            fill
                            sizes="(min-width: 768px) 45vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <PlaceholderImage className="h-full w-full" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <div className="absolute left-4 top-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow ${getCategoryColor(story.category)}`}>
                            {story.category || "Story"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-marissa text-[1.35rem] leading-[1.3] text-[#1a1a2e] transition-colors duration-300 group-hover:text-teal">
                          {story.title}
                        </h3>
                        <p className="font-dm mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {story.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-5">
                          <div className="flex items-center gap-2">
                            <span className="font-dm text-[11px] text-slate-400">{story.formattedDate}</span>
                            {story.read_time && (
                              <>
                                <span className="size-1 rounded-full bg-slate-300" />
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                  <Clock className="size-3" />
                                  {story.read_time}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-teal transition-all duration-300 group-hover:gap-2.5">
                            Read story
                            <ArrowRight className="size-4" />
                          </span>
                        </div>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 h-[3px] origin-left scale-x-0 rounded-b-3xl bg-teal transition-transform duration-500 group-hover:scale-x-100" />
                    </article>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Extra stories — 3-col grid ── */}
          {remainingStories.length > 2 && (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {remainingStories.slice(2).map((story, i) => (
                <motion.div key={story.id} variants={fadeUp} custom={i}>
                  <Link href={`/stories/${story.slug}`} className="group block h-full">
                    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] ring-1 ring-slate-100 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)] hover:ring-teal/40">
                      <div className="relative aspect-[3/2] overflow-hidden">
                        {story.image ? (
                          <Image
                            src={story.image}
                            alt={story.title}
                            fill
                            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <PlaceholderImage className="h-full w-full" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <div className="absolute left-4 top-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow ${getCategoryColor(story.category)}`}>
                            {story.category || "Story"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-marissa text-[1.15rem] leading-[1.3] text-[#1a1a2e] transition-colors duration-300 group-hover:text-teal">
                          {story.title}
                        </h3>
                        <p className="font-dm mt-2 line-clamp-2 text-[0.85rem] leading-relaxed text-slate-500">
                          {story.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <span className="font-dm text-[11px] text-slate-400">{story.formattedDate}</span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal transition-all duration-300 group-hover:gap-2">
                            Read story
                            <ArrowRight className="size-3.5" />
                          </span>
                        </div>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 h-[3px] origin-left scale-x-0 rounded-b-3xl bg-teal transition-transform duration-500 group-hover:scale-x-100" />
                    </article>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
