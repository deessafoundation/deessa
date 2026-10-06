'use client'

import type { FAQContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { SectionHeading } from '../../../programs/sections/SectionHeading'

interface FaqSectionProps {
  heading?: string
  content: FAQContent
  theme: ProgramTheme
}

export function FaqSection({ heading, content, theme }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="ocean" size="sm" />}

        <div className="space-y-3">
          {content.items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl border transition-colors duration-200 ${
                  isOpen
                    ? 'bg-blue-50/80 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-dm-sans font-semibold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
                      isOpen
                        ? 'bg-blue-500 text-white rotate-180'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 5L7 9L11 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-gray-700 font-dm-sans leading-relaxed text-base">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
