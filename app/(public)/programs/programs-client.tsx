"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface Program {
  id: string
  category: string
  categoryLabel: string
  categoryColor: string
  image: string
  title: string
  description: string
  stat: string
  slug: string
}

interface ProgramsClientProps {
  programs: Program[]
}

const categories = [
  { id: "all", label: "All Programs" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
  { id: "empowerment", label: "Empowerment" },
  { id: "relief", label: "Relief" },
  { id: "autism", label: "Autism Support" },
  { id: "training", label: "Training" },
]

export function ProgramsClient({ programs }: ProgramsClientProps) {
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredPrograms =
    activeCategory === "all"
      ? programs
      : programs.filter((program) => program.category === activeCategory)

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`min-w-[138px] px-6 py-3 rounded-full font-['Comic_Neue'] font-semibold text-[14px] tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary))]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f6f1] ${
              activeCategory === cat.id
                ? "bg-[#3FABDE] text-white border border-[#3FABDE] shadow-[0_12px_24px_rgba(63,171,222,0.28)] hover:bg-[#3FABDE] hover:shadow-[0_14px_28px_rgba(63,171,222,0.32)]"
                : "bg-white text-[#0B5F8A] border border-[#3FABDE]/35 shadow-[0_1px_0_rgba(255,255,255,0.7)] hover:bg-[#3FABDE]/12 hover:text-[#0B5F8A] hover:border-[#3FABDE] hover:shadow-[0_10px_24px_rgba(63,171,222,0.14)]"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {cat.id === "autism" && <span aria-hidden="true">🧩</span>}
              <span>{cat.label}</span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* Programs Grid */}
      <AnimatePresence mode="wait">
        {filteredPrograms.length > 0 ? (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-2xl overflow-hidden border border-white transition-all duration-300 hover:border-[#29b6c8]/40 hover:shadow-[0_20px_40px_rgba(41,182,200,0.15)] hover:shadow-2xl"
              >
                {/* Image with Category Badge */}
                <div className="relative h-[220px] overflow-hidden bg-gradient-to-br from-[#29b6c8]/5 to-transparent">
                  <motion.img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                    whileHover={{ scale: 1.08 }}
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  <div
                    className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-full ${program.categoryColor} text-white text-[11px] font-['Comic_Neue'] font-bold tracking-wide shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-300`}
                  >
                    {program.categoryLabel}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-[22px] font-['Marissa'] text-[#1a1a2e] mb-2 leading-tight group-hover:text-[#29b6c8] transition-colors duration-300">
                      {program.title}
                    </h3>
                    <div className="h-0.5 w-8 bg-gradient-to-r from-[#29b6c8] to-[#29b6c8]/30 group-hover:w-12 transition-all duration-300" />
                  </div>
                  
                  <p className="text-[15px] font-['DM_Sans'] text-[#1a1a2e]/70 leading-relaxed line-clamp-2">
                    {program.description}
                  </p>
                  
                  {/* Stat with Icon */}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#29b6c8]" />
                    <span className="text-[13px] font-['DM_Sans'] font-semibold text-[#29b6c8]">
                      {program.stat}
                    </span>
                  </div>

                  {/* Learn More Link with Arrow animation */}
                  <Link
                    href={`/programs/${program.slug}`}
                    className="inline-flex items-center gap-2 text-[14px] font-['Comic_Neue'] font-bold text-[#29b6c8] hover:text-[#1a8fa0] transition-all duration-300 group/link"
                  >
                    <span>Learn More</span>
                    <motion.span
                      className="inline-block"
                      whileHover={{ x: 4 }}
                    >
                      →
                    </motion.span>
                  </Link>
                </div>
              </motion.div>
            ))}
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
            <h3 className="text-[28px] font-['Marissa'] text-[#1a1a2e] mb-3">
              No programs in this category yet.
            </h3>
            <p className="text-[16px] font-['DM_Sans'] text-[#1a1a2e]/60 mb-6">
              Check back soon or explore all programs.
            </p>
            <button
              onClick={() => setActiveCategory("all")}
              className="px-6 py-3 rounded-xl bg-[#3FABDE] text-white font-['Comic_Neue'] font-semibold text-[14px] shadow-sm hover:bg-[#3FABDE] hover:shadow-md transition-all duration-300"
            >
              View All Programs
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
