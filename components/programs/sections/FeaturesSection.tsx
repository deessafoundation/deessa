'use client'

import type { FeaturesContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { SectionHeading } from './SectionHeading'

interface FeaturesSectionProps {
  heading?: string
  content: FeaturesContent
  theme: ProgramTheme
}

export function FeaturesSection({ heading, content, theme }: FeaturesSectionProps) {
  const isGrid = content.layout === 'grid'

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="pink" size="sm" />}

        {isGrid ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50/50 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-100/50"
              >
                {feature.icon && (
                  <div className="text-5xl mb-6">{feature.icon}</div>
                )}
                <h3 className="text-2xl font-marissa text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-700 font-dm-sans leading-relaxed text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {content.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 items-start bg-gradient-to-r from-blue-50 to-transparent p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border-l-4 border-blue-400"
              >
                {feature.icon && (
                  <div className="flex-shrink-0 text-5xl">{feature.icon}</div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-marissa text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 font-dm-sans leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
