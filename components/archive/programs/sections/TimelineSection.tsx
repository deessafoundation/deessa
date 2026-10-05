'use client'

import type { TimelineContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { CheckCircle, Circle } from 'lucide-react'
import { SectionHeading } from '../../../programs/sections/SectionHeading'

interface TimelineSectionProps {
  heading?: string
  content: TimelineContent
  theme: ProgramTheme
}

export function TimelineSection({ heading, content, theme }: TimelineSectionProps) {
  const timelineItems = content.items || []
  
  if (!timelineItems || timelineItems.length === 0) {
    return null
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="dark" />}

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-blue-300 via-purple-400 to-blue-300 rounded-full" />

          <div className="space-y-12">
            {timelineItems.map((milestone: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-8 items-start"
              >
                {/* Icon */}
                <div className="flex-shrink-0 z-10">
                  {(milestone.completed || milestone.status === 'completed') ? (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  ) : milestone.status === 'active' ? (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg flex items-center justify-center animate-pulse">
                      <Circle className="w-8 h-8 text-white fill-white" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg flex items-center justify-center">
                      <Circle className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 p-8 rounded-3xl shadow-lg ${
                  (milestone.completed || milestone.status === 'completed')
                    ? 'bg-gradient-to-br from-green-50 to-white border-2 border-green-200' 
                    : milestone.status === 'active'
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300'
                    : 'bg-white border-2 border-gray-200'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h3 className="text-2xl font-marissa text-gray-900">
                      {milestone.title}
                    </h3>
                    
                    {milestone.date && (
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-dm-sans font-semibold ${
                        (milestone.completed || milestone.status === 'completed')
                          ? 'bg-green-100 text-green-700'
                          : milestone.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {milestone.date}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-lg text-gray-700 font-dm-sans leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
