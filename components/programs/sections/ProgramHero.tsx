'use client'

import type { ProgramHero as ProgramHeroType, ProgramTheme } from '@/lib/types/program-prototype'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface ProgramHeroProps {
  hero: ProgramHeroType
  theme: ProgramTheme
}

export function ProgramHero({ hero, theme }: ProgramHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const isSplit = hero.layout === 'split' || hero.layout === 'image_left' || hero.layout === 'image_right'
  const imageOnLeft = hero.layout === 'image_left'

  // Full-bleed hero
  if (hero.layout === 'full_bleed') {
    return (
      <section className="relative w-full h-[650px] md:h-[750px] overflow-hidden">
        <div className="absolute inset-0">
          {!imageLoaded && !imageError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
          {imageError ? (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <span className="text-white/40 text-lg font-medium">{hero.title || "Program"}</span>
            </div>
          ) : (
            <Image
              src={hero.image}
              alt={hero.imageAlt}
              fill
              sizes="100vw"
              className={`object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              priority
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-900/40 to-transparent" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex items-center h-full px-4"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            {hero.eyebrow && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-yellow-300 font-dm-sans text-sm font-semibold tracking-wide mb-6 uppercase"
              >
                {hero.eyebrow}
              </motion.div>
            )}
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-marissa mb-8 leading-tight">
              {hero.title}
            </h1>
            
            <p className="text-xl md:text-2xl font-dm-sans mb-10 leading-relaxed max-w-3xl">
              {hero.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              {hero.cta && (
                <Link
                  href={hero.cta.url}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-10 py-5 rounded-full font-dm-sans font-semibold transition-all text-center shadow-lg hover:shadow-xl hover:scale-105 text-lg"
                >
                  {hero.cta.label}
                </Link>
              )}
              
              {hero.secondaryCta && (
                <Link
                  href={hero.secondaryCta.url}
                  className="px-10 py-5 rounded-full font-dm-sans font-semibold border-2 border-white text-white hover:bg-white/20 transition-all text-center hover:scale-105 text-lg"
                >
                  {hero.secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    )
  }

  // Split layout (default for service programs)
  if (isSplit) {
    return (
      <section className="relative w-full overflow-hidden py-20 md:py-28 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30">
        {/* Subtle decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${imageOnLeft ? 'lg:grid-flow-dense' : ''}`}>
            {/* Content */}
            <div className={imageOnLeft ? 'lg:col-start-2' : ''}>
              {hero.eyebrow && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-blue-600 font-dm-sans text-sm font-semibold tracking-wide mb-6 uppercase"
                >
                  {hero.eyebrow}
                </motion.div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-4xl lg:text-5xl font-marissa mb-6 text-gray-900 leading-tight"
              >
                {hero.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-700 font-dm-sans mb-8 leading-relaxed"
              >
                {hero.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {hero.cta && (
                  <Link
                    href={hero.cta.url}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-dm-sans font-semibold transition-all text-center shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {hero.cta.label}
                  </Link>
                )}
                
                {hero.secondaryCta && (
                  <Link
                    href={hero.secondaryCta.url}
                    className="border-blue-400 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-dm-sans font-semibold border-2 transition-all text-center hover:scale-105"
                  >
                    {hero.secondaryCta.label}
                  </Link>
                )}
              </motion.div>
            </div>

            {/* Image with soft overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`relative ${imageOnLeft ? 'lg:col-start-1 lg:row-start-1' : ''}`}
            >
              <div className="relative h-[450px] md:h-[550px] rounded-3xl overflow-hidden shadow-2xl">
                {!imageLoaded && !imageError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                {imageError ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <span className="text-white/40 text-lg font-medium">{hero.title || "Program"}</span>
                  </div>
                ) : (
                  <Image
                    src={hero.image}
                    alt={hero.imageAlt || hero.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className={`object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    priority
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                )}
                {/* Gentle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent" />
              </div>
              
              {/* Decorative frame element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-blue-300 rounded-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  return null
}
