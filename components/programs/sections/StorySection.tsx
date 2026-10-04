'use client'

import type { StoryContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { SafeImage } from '../safe-image'
import { SectionHeading } from './SectionHeading'

interface StorySectionProps {
  heading?: string
  content: StoryContent
  theme: ProgramTheme
}

export function StorySection({ heading, content, theme }: StorySectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="violet" size="sm" />}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          {/* Photo side */}
          {content.image && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              {!imageLoaded && !imageError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
              <SafeImage
                src={content.image}
                alt={content.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Text side */}
          <div className={content.image ? '' : 'md:col-span-2 max-w-3xl mx-auto'}>
            {content.title && (
              <div className="text-sm text-blue-600 font-dm-sans font-medium uppercase tracking-wider mb-3">
                {content.title}
              </div>
            )}

            <blockquote className="text-xl md:text-2xl font-dm-sans text-gray-800 leading-relaxed italic mb-6 relative pl-6 border-l-4 border-blue-400">
              {content.outcome || content.context}
            </blockquote>

            {content.challenge && (
              <p className="text-gray-600 font-dm-sans leading-relaxed mb-4">
                {content.challenge}
              </p>
            )}

            {content.approach && (
              <p className="text-gray-600 font-dm-sans leading-relaxed">
                {content.approach}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
