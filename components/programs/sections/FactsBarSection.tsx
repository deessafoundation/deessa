'use client'

import type { FactsBarContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { SectionHeading } from './SectionHeading'

interface FactsBarSectionProps {
  heading?: string
  content: FactsBarContent
  theme: ProgramTheme
}

export function FactsBarSection({ heading, content, theme }: FactsBarSectionProps) {
  return (
    <section data-a11y-region="neutral" className="py-12 md:py-16 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {heading && <SectionHeading heading={heading} accent="white" light size="sm" />}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {content.facts.map((fact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-marissa text-yellow-300 mb-1">
                {fact.value}
              </div>
              <div className="text-sm md:text-base text-white/90 font-dm-sans">
                {fact.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
