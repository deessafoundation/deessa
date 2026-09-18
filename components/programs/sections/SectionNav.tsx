'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SectionItem {
  id: string
  label: string
}

interface SectionNavProps {
  sections: SectionItem[]
}

export function SectionNav({ sections }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [sections])

  if (!sections.length) return null

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 z-40" aria-label="Section navigation">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-3 max-w-[180px]">
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleClick(section.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-dm-sans transition-all duration-200 ${
                    activeId === section.id
                      ? 'bg-[#29b6c8] text-white font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#29b6c8] text-white shadow-lg flex items-center justify-center hover:bg-[#1a8fa0] transition-colors"
        aria-label="Section navigation"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="xl:hidden fixed bottom-20 right-6 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 max-w-[220px]"
          >
            <p className="text-[11px] font-comic font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Sections</p>
            <ul className="space-y-0.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => handleClick(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-dm-sans transition-all duration-200 ${
                      activeId === section.id
                        ? 'bg-[#29b6c8] text-white font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
