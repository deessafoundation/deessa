"use client"

import { useState, useCallback, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface Program {
  id: string
  category: string
  categoryLabel: string
  categoryColor: string
  image: string
  title: string
  description: string
  slug: string
}

interface WhatWeDoClientProps {
  programs: Program[]
}

const categories = [
  { id: "all", label: "All Programs" },
  { id: "service", label: "Services" },
  { id: "outreach", label: "Outreach" },
  { id: "research", label: "Research" },
  { id: "campaign", label: "Campaigns" },
]

const PAGE_SIZE = 9

export function WhatWeDoClient({ programs }: WhatWeDoClientProps) {
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
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-12" role="tablist" aria-label="Program categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-pressed={activeCategory === cat.id}
            onClick={() => setCategory(cat.id)}
            disabled={isPending}
            className={`px-5 py-2.5 rounded-full font-comic font-bold text-[14px] transition-all duration-300 disabled:opacity-60 ${
              activeCategory === cat.id
                ? "bg-[#29b6c8] text-white shadow-lg"
                : "bg-white text-[#1a1a2e] border-[1.5px] border-[#1a1a2e] hover:border-[#29b6c8]"
            }`}
          >
            {cat.label}
          </button>
        ))}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="relative h-[200px] overflow-hidden">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-full ${program.categoryColor} text-white text-[11px] font-comic font-bold tracking-wide shadow-lg`}
                    >
                      {program.categoryLabel}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-[22px] font-marissa text-[#1a1a2e] mb-3 leading-tight">
                      {program.title}
                    </h3>
                    <p className="text-[15px] font-dm-sans text-[#1a1a2e]/70 mb-4 leading-relaxed line-clamp-2">
                      {program.description}
                    </p>
                    <Link
                      href={`/whatwedo/${program.slug}`}
                      className="inline-flex items-center text-[14px] font-comic font-bold text-[#29b6c8] hover:text-[#1a8fa0] transition-colors"
                    >
                      Learn More →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage <= 1 || isPending}
                  className="px-4 py-2 rounded-full font-comic font-bold text-sm border border-[#1a1a2e]/20 hover:border-[#29b6c8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    disabled={isPending}
                    className={`w-10 h-10 rounded-full font-comic font-bold text-sm transition-all duration-200 ${
                      page === safePage
                        ? "bg-[#29b6c8] text-white shadow-md"
                        : "border border-[#1a1a2e]/20 hover:border-[#29b6c8]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages || isPending}
                  className="px-4 py-2 rounded-full font-comic font-bold text-sm border border-[#1a1a2e]/20 hover:border-[#29b6c8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-[28px] font-marissa text-[#1a1a2e] mb-3">
              No programs in this category yet.
            </h3>
            <p className="text-[16px] font-dm-sans text-[#1a1a2e]/60 mb-6">
              Check back soon or explore all programs.
            </p>
            <button
              onClick={() => setCategory("all")}
              className="px-6 py-3 rounded-full bg-[#29b6c8] text-white font-comic font-bold text-[14px] hover:bg-[#1a8fa0] transition-colors"
            >
              View All Programs
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
