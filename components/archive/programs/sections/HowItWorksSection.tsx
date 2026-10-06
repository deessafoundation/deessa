'use client'

import type { HowItWorksContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { SectionHeading } from '../../../programs/sections/SectionHeading'

interface HowItWorksSectionProps {
  heading?: string
  content: HowItWorksContent
  theme: ProgramTheme
}

export function HowItWorksSection({ heading, content, theme }: HowItWorksSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-blue-50 via-white to-purple-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="green" />}

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-1/2 top-20 bottom-20 w-1 bg-gradient-to-b from-blue-300 via-purple-300 to-blue-300 -translate-x-1/2 rounded-full" />

          <div className="space-y-20">
            {content.steps.map((step, index) => {
              const isEven = index % 2 === 0
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  <div className={`flex flex-col md:flex-row gap-8 items-center ${!isEven ? 'md:flex-row-reverse' : ''}`}>
                    {/* Number circle */}
                    <div className="relative flex-shrink-0 z-10">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl flex items-center justify-center">
                        <span className="text-4xl font-marissa text-white">{step.number}</span>
                      </div>
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-full bg-blue-400 blur-2xl opacity-30 animate-pulse" />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 bg-white p-8 rounded-3xl shadow-lg ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                      <h3 className="text-2xl md:text-3xl font-marissa text-gray-900 mb-4">
                        {step.title}
                      </h3>
                      <p className="text-lg text-gray-700 font-dm-sans leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
