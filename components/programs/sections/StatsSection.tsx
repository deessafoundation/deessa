'use client'

import type { StatsContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { SectionHeading } from './SectionHeading'

interface StatsSectionProps {
  heading?: string
  content: StatsContent
  theme: ProgramTheme
}

export function StatsSection({ heading, content, theme }: StatsSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {heading && <SectionHeading heading={heading} accent="amber" light />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {content.stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="text-center"
            >
              {stat.icon && (
                <div className="text-6xl mb-6">{stat.icon}</div>
              )}
              
              <div className="text-5xl md:text-6xl font-marissa text-yellow-300 mb-3">
                {stat.value}
              </div>
              
              <div className="text-2xl font-dm-sans text-white font-semibold mb-2">
                {stat.label}
              </div>
              
              {stat.sublabel && (
                <div className="text-lg text-white/80 font-dm-sans">
                  {stat.sublabel}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
