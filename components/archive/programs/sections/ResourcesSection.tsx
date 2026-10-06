'use client'

import type { ResourcesContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { SectionHeading } from '../../../programs/sections/SectionHeading'

interface ResourcesSectionProps {
  heading?: string
  subheading?: string
  content: ResourcesContent
  theme: ProgramTheme
}

export function ResourcesSection({ heading, subheading, content, theme }: ResourcesSectionProps) {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="green" align="left" size="sm" />}

        {subheading && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-lg text-gray-600 font-dm-sans"
          >
            {subheading}
          </motion.p>
        )}

        <div className="space-y-4">
          {content.resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <a
                href={resource.url}
                className="group flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L9 12M9 12L5 8M9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 9 9)" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-dm-sans font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {resource.label}
                  </h3>
                  {resource.description && (
                    <p className="text-sm text-gray-600 font-dm-sans leading-relaxed">
                      {resource.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors mt-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
