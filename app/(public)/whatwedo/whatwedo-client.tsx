"use client"

import { useCallback, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, ImageIcon, Search } from "lucide-react"
import { SafeImage } from "@/components/programs/safe-image"
import { cn } from "@/lib/utils"
import styles from "./whatwedo-programs.module.css"

interface Program {
  id: string
  category: string
  categoryLabel: string
  categoryColor: string
  image: string | null
  title: string
  description: string
  slug: string
}

interface WhatWeDoClientProps {
  programs: Program[]
  unavailable: boolean
  errorMessage: string | null
}

const categories = [
  { id: "all", label: "All Programs" },
  { id: "service", label: "Services" },
  { id: "outreach", label: "Outreach" },
  { id: "research", label: "Research" },
  { id: "campaign", label: "Campaigns" },
]

// Per-category accents, matching the "Support a Specific Program" cards below.
// Text colours are the darker shades so they meet WCAG AA (4.5:1) on white.
type Accent = { bar: string; dot: string; text: string; chip: string; border: string }

const categoryAccents: Record<string, Accent> = {
  service: {
    bar: "from-sky-400 to-[#0b76b7]",
    dot: "bg-[#0b76b7]",
    text: "text-[#0b76b7]",
    chip: "bg-[#0b76b7]/10 text-[#0b76b7] group-hover:bg-[#0b76b7] group-hover:text-white",
    border: "hover:border-[#0b76b7]/35",
  },
  campaign: {
    bar: "from-[#9b6cc2] to-[#6F3E96]",
    dot: "bg-[#6F3E96]",
    text: "text-[#6F3E96]",
    chip: "bg-[#6F3E96]/10 text-[#6F3E96] group-hover:bg-[#6F3E96] group-hover:text-white",
    border: "hover:border-[#6F3E96]/35",
  },
  outreach: {
    bar: "from-orange-400 to-orange-600",
    dot: "bg-orange-500",
    text: "text-orange-700",
    chip: "bg-orange-50 text-orange-700 group-hover:bg-orange-700 group-hover:text-white",
    border: "hover:border-orange-300",
  },
  research: {
    bar: "from-[#29b6c8] to-[#0e7c8c]",
    dot: "bg-[#29b6c8]",
    text: "text-[#0e7c8c]",
    chip: "bg-[#29b6c8]/10 text-[#0e7c8c] group-hover:bg-[#0e7c8c] group-hover:text-white",
    border: "hover:border-[#29b6c8]/40",
  },
}

const fallbackAccent: Accent = {
  bar: "from-slate-300 to-slate-500",
  dot: "bg-slate-500",
  text: "text-slate-700",
  chip: "bg-slate-100 text-slate-700 group-hover:bg-slate-700 group-hover:text-white",
  border: "hover:border-slate-300",
}

const PAGE_SIZE = 9

// Shared pill styles (tabs, pagination, empty-state button)
const focusRing = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#29b6c8]/40"

export function WhatWeDoClient({ programs, unavailable, errorMessage }: WhatWeDoClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeCategory = searchParams.get("category") || "all"
  const currentPage = Number(searchParams.get("page") || "1")

  const setCategory = useCallback((cat: string) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (cat === "all") {
      sp.delete("category")
    } else {
      sp.set("category", cat)
    }
    sp.delete("page")
    startTransition(() => {
      router.push(`?${sp.toString()}`, { scroll: false })
    })
  }, [router, searchParams, startTransition])

  const setPage = useCallback((page: number) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      sp.delete("page")
    } else {
      sp.set("page", String(page))
    }
    startTransition(() => {
      router.push(`?${sp.toString()}`, { scroll: false })
    })
  }, [router, searchParams, startTransition])

  const filteredPrograms =
    activeCategory === "all"
      ? programs
      : programs.filter((program) => program.category === activeCategory)

  const totalPages = Math.ceil(filteredPrograms.length / PAGE_SIZE)
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1))
  const pagedPrograms = filteredPrograms.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  return (
    <>
      {/* Filter Tabs — segmented pill bar; scrolls horizontally on small screens */}
      <div className="-mx-4 mb-10 md:mb-12 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          role="group"
          aria-label="Program categories"
          className={cn(
            styles.tabList,
            "mx-auto flex w-max gap-1.5 rounded-full border border-slate-200/80 bg-white p-1.5",
            "shadow-[0_2px_16px_rgba(26,26,46,0.06)]",
          )}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                data-slot="button"
                data-variant={isActive ? "default" : "outline"}
                aria-pressed={isActive}
                onClick={() => setCategory(cat.id)}
                disabled={isPending}
                className={cn(
                  isActive ? styles.tabActive : styles.tabInactive,
                  "shrink-0 whitespace-nowrap rounded-full px-4 sm:px-5 py-2.5 min-h-[44px]",
                  "font-comic font-bold text-[14px] transition-colors duration-200 disabled:cursor-wait disabled:opacity-60",
                  focusRing,
                )}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Programs Grid */}
      <AnimatePresence mode="wait">
        {pagedPrograms.length > 0 ? (
          <motion.div
            key={`${activeCategory}-${safePage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
              {pagedPrograms.map((program, index) => {
                const accent = categoryAccents[program.category] ?? {
                  ...fallbackAccent,
                  dot: program.categoryColor || fallbackAccent.dot,
                }
                return (
                  <motion.li
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className={cn(
                      styles.card,
                      "group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white",
                      "shadow-[0_2px_16px_rgba(26,26,46,0.06)] transition-[translate,box-shadow,border-color] duration-300 ease-out",
                      "hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-12px_rgba(26,26,46,0.18)]",
                      "has-[a:focus-visible]:-translate-y-1.5 has-[a:focus-visible]:ring-4 has-[a:focus-visible]:ring-[#29b6c8]/45",
                      "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      accent.border,
                    )}
                  >
                    {/* Accent bar */}
                    <span
                      aria-hidden="true"
                      className={cn(styles.cardBar, "absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r", accent.bar)}
                    />

                    <Link
                      href={`/whatwedo/${program.slug}`}
                      aria-label={`Explore ${program.title}`}
                      className="flex h-full flex-col focus-visible:outline-none"
                    >
                      <div className={cn(styles.cardImage, "relative aspect-[16/10] overflow-hidden")}>
                        {/* Placeholder sits underneath so it also shows if the image fails to load */}
                        <div className={styles.cardImagePlaceholder} aria-hidden="true">
                          <ImageIcon className="h-10 w-10 text-[#0e7c8c]/40" strokeWidth={1.5} />
                        </div>
                        {program.image && (
                          <SafeImage
                            src={program.image}
                            alt={program.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        )}
                        <span
                          className={cn(
                            styles.cardBadge,
                            "absolute left-3 top-4 z-[1] inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                            "font-comic text-[11px] font-bold tracking-wider shadow-[0_4px_12px_rgba(26,26,46,0.15)]",
                          )}
                        >
                          <span aria-hidden="true" className={cn(styles.cardBadgeDot, "h-2 w-2 rounded-full", accent.dot)} />
                          {program.categoryLabel}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-6 sm:p-7">
                        <h3 className={styles.cardTitle}>{program.title}</h3>
                        <p className={styles.cardDesc}>{program.description}</p>

                        <span
                          className={cn(
                            styles.cardLink,
                            "mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4",
                            "font-comic text-[15px] font-bold",
                          )}
                          data-accent={program.category}
                        >
                          Learn More
                          <span
                            aria-hidden="true"
                            className={cn(
                              styles.cardLinkChip,
                              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                            )}
                            data-accent={program.category}
                          >
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                          </span>
                        </span>
                      </div>
                    </Link>
                  </motion.li>
                )
              })}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Program pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  data-slot="button"
                  data-variant="outline"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage <= 1 || isPending}
                  className={cn(
                    styles.paginationBtn,
                    "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4",
                    "font-comic text-sm font-bold transition-colors duration-200",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    focusRing,
                  )}
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isCurrent = page === safePage
                  return (
                    <button
                      key={page}
                      type="button"
                      data-slot="button"
                      data-variant={isCurrent ? "default" : "outline"}
                      onClick={() => setPage(page)}
                      disabled={isPending}
                      aria-label={`Page ${page}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={cn(
                        styles.paginationPage,
                        isCurrent && styles.paginationPageActive,
                        "inline-flex h-11 w-11 items-center justify-center rounded-full font-comic text-sm font-bold transition-colors duration-200",
                        focusRing,
                      )}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  type="button"
                  data-slot="button"
                  data-variant="outline"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages || isPending}
                  className={cn(
                    styles.paginationBtn,
                    "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4",
                    "font-comic text-sm font-bold transition-colors duration-200",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    focusRing,
                  )}
                >
                  Next
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </nav>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={cn(
              styles.emptyState,
              "mx-auto max-w-xl rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center sm:px-10 md:py-14",
              "shadow-[0_2px_16px_rgba(26,26,46,0.06)]",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                styles.emptyIcon,
                "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1",
              )}
            >
              <Search className="h-7 w-7" strokeWidth={2} />
            </span>
            <h3 className={styles.emptyTitle}>
              {unavailable
                ? "Programs are temporarily unavailable."
                : programs.length === 0
                  ? "No published programs yet."
                  : "No programs in this category yet."}
            </h3>
            <p className={styles.emptyDesc}>
              {unavailable 
                ? `Please try again shortly.${errorMessage && process.env.NODE_ENV === "development" ? ` (${errorMessage})` : ""}` 
                : "Explore another category or check back soon."}
            </p>
            {unavailable ? (
              <button
                type="button"
                onClick={() => router.refresh()}
                className={cn(styles.emptyBtn, "inline-flex min-h-[48px] items-center rounded-full px-6 font-comic text-[15px] font-bold transition-colors duration-200", focusRing)}
              >
                Try Again
              </button>
            ) : activeCategory !== "all" ? (
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={cn(styles.emptyBtn, "inline-flex min-h-[48px] items-center rounded-full px-6 font-comic text-[15px] font-bold transition-colors duration-200", focusRing)}
              >
                View All Programs
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
