'use client'

import type { GalleryContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { SafeImage } from '../SafeImage'
import { SectionHeading } from './SectionHeading'

interface GallerySectionProps {
  heading?: string
  content: GalleryContent
  theme: ProgramTheme
}

export function GallerySection({ heading, content, theme }: GallerySectionProps) {
  const [imageStates, setImageStates] = useState<Record<number, { loaded: boolean; error: boolean }>>({})

  const handleImageLoad = (index: number) => {
    setImageStates(prev => ({ ...prev, [index]: { loaded: true, error: false } }))
  }

  const handleImageError = (index: number) => {
    setImageStates(prev => ({ ...prev, [index]: { loaded: true, error: true } }))
  }

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="sky" />}

        {content.layout === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {content.images.map((image, index) => {
              const state = imageStates[index]
              const hasError = state?.error
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {!state?.loaded && !hasError && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                  )}
                  {hasError ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs font-medium text-center px-2">{image.alt || "Image"}</span>
                    </div>
                  ) : (
                    <SafeImage
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className={`object-cover group-hover:scale-110 transition-all duration-500 ${state?.loaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />
                  )}
                  
                  {image.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <p className="text-white font-dm-sans text-sm leading-relaxed">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {content.layout === 'masonry' && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {content.images.map((image, index) => {
              const state = imageStates[index]
              const hasError = state?.error
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative break-inside-avoid rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3]">
                    {!state?.loaded && !hasError && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    {hasError ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs font-medium text-center px-2">{image.alt || "Image"}</span>
                      </div>
                    ) : (
                      <SafeImage
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={`object-cover group-hover:scale-110 transition-all duration-500 ${state?.loaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index)}
                      />
                    )}
                    
                    {image.caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <p className="text-white font-dm-sans text-sm leading-relaxed">
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
