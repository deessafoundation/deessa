'use client'

import type { ActivitiesContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { SectionHeading } from './SectionHeading'

interface ActivitiesSectionProps {
  heading?: string
  subheading?: string
  content: ActivitiesContent
  theme: ProgramTheme
}

export function ActivitiesSection({ heading, subheading, content, theme }: ActivitiesSectionProps) {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="amber" size="sm" />}

        {subheading && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-lg text-gray-600 font-dm-sans text-center max-w-2xl mx-auto"
          >
            {subheading}
          </motion.p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.activities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Postcard stamp */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-lg border border-blue-200/50">
                {activity.icon || '📍'}
              </div>

              <div className="pr-14">
                {activity.time && (
                  <div className="text-sm text-blue-600 font-dm-sans font-medium mb-2">
                    {activity.time}
                  </div>
                )}
                <h3 className="text-xl font-marissa text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {activity.title}
                </h3>
                <p className="text-gray-600 font-dm-sans leading-relaxed text-sm">
                  {activity.description}
                </p>
              </div>

              {/* Corner decoration */}
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-50 to-transparent rounded-bl-2xl rounded-tr-3xl -z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
