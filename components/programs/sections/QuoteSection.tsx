'use client'

import type { QuoteContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { SafeImage } from '../SafeImage'
import { SectionHeading } from './SectionHeading'

interface QuoteSectionProps {
  heading?: string
  content: QuoteContent
  theme: ProgramTheme
}

export function QuoteSection({ heading, content, theme }: QuoteSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="violet" />}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-10 md:p-14 rounded-3xl shadow-2xl relative"
        >
          {/* Quote icon */}
          <div className="absolute -top-6 left-10 text-8xl text-blue-200 font-serif">"</div>
          
          <div className="relative">
            <p className="text-2xl md:text-3xl font-dm-sans text-gray-800 leading-relaxed mb-10 italic">
              {content.quote}
            </p>

            <div className="flex items-center gap-6">
              {content.photo && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                  {!imageLoaded && !imageError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                  <SafeImage
                    src={content.photo}
                    alt={content.person}
                    fill
                    sizes="80px"
                    className={`object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              
              <div>
                <div className="text-xl font-marissa text-gray-900 mb-1">
                  {content.person}
                </div>
                <div className="text-base text-blue-600 font-dm-sans">
                  {content.role}
                  {content.location && ` • ${content.location}`}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative element */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full -z-10 blur-2xl" />
        </motion.div>
      </div>
    </section>
  )
}
