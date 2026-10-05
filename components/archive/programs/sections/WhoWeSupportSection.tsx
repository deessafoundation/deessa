'use client'

import type { WhoWeSupportContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { SectionHeading } from '../../../programs/sections/SectionHeading'

interface WhoWeSupportSectionProps {
  heading?: string
  content: WhoWeSupportContent
  theme: ProgramTheme
}

export function WhoWeSupportSection({ heading, content, theme }: WhoWeSupportSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="pink" />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {content.targetGroups.map((group, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center border border-purple-100/50"
            >
              {group.icon && (
                <div className="text-6xl mb-6">{group.icon}</div>
              )}
              
              <h3 className="text-2xl font-marissa text-gray-900 mb-3">
                {group.title}
              </h3>
              
              {group.ageRange && (
                <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-dm-sans font-semibold mb-4">
                  {group.ageRange}
                </div>
              )}
              
              <p className="text-gray-700 font-dm-sans leading-relaxed text-lg">
                {group.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
