"use client"

import { useState, useCallback, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SafeImage } from "@/components/programs/SafeImage"
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
      <div className="flex flex-wrap justify-center gap-3 mb-12" role="group" aria-label="Program categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            aria-pressed={activeCategory === cat.id}
            onClick={() => setCategory(cat.id)}
            disabled={isPending}
            className={`${activeCategory === cat.id ? styles.tabActive : styles.tabInactive} disabled:opacity-60`}
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
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    {program.image ? (
                      <SafeImage
                        src={program.image}
                        alt={program.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className={styles.cardImagePlaceholder} aria-hidden="true">
                        <span className={styles.cardImagePlaceholderIcon}>📷</span>
                      </div>
                    )}
                    <div
                      className={`${styles.cardBadge} ${program.categoryColor}`}
                    >
                      {program.categoryLabel}
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>
                      {program.title}
                    </h3>
                    <p className={styles.cardDesc}>
                      {program.description}
                    </p>
                    <Link
                      href={`/whatwedo/${program.slug}`}
                      className={styles.cardLink}
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
                  className={styles.paginationBtn}
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    disabled={isPending}
                    className={`${styles.paginationPage} ${page === safePage ? styles.paginationPageActive : ""}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages || isPending}
                  className={styles.paginationBtn}
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
            className={styles.emptyState}
          >
            <div className="text-6xl mb-6">🔍</div>
            <h3 className={styles.emptyTitle}>
              No programs in this category yet.
            </h3>
            <p className={styles.emptyDesc}>
              Check back soon or explore all programs.
            </p>
            <button
              onClick={() => setCategory("all")}
              className={styles.emptyBtn}
            >
              View All Programs
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
