'use client'

import type { Program } from '@/lib/types/program-prototype'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface RelatedProgramsSectionProps {
  programs: NonNullable<Program['relatedPrograms']>
}

const categoryColors: Record<string, string> = {
  service: 'bg-blue-500',
  outreach: 'bg-orange-500',
  research: 'bg-teal-500',
  campaign: 'bg-purple-500',
}

const categoryLabels: Record<string, string> = {
  service: 'Service',
  outreach: 'Outreach',
  research: 'Research',
  campaign: 'Campaign',
}

export function RelatedProgramsSection({ programs }: RelatedProgramsSectionProps) {
  if (!programs.length) return null

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-3xl md:text-4xl font-marissa text-gray-900 text-center"
        >
          Related Programs
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/whatwedo/${program.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-[180px] overflow-hidden">
                  <RelatedProgramImage image={program.image} alt={program.title} />
                  <div
                    className={`absolute bottom-3 left-3 px-3 py-1 rounded-full ${categoryColors[program.category] || 'bg-gray-500'} text-white text-[11px] font-comic font-bold tracking-wide shadow-lg`}
                  >
                    {categoryLabels[program.category] || program.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-marissa text-gray-900 mb-2 group-hover:text-[#29b6c8] transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-sm font-dm-sans text-gray-600 line-clamp-2">
                    {program.shortDescription}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RelatedProgramImage({ image, alt }: { image: string; alt: string }) {
  const [error, setError] = useState(false)

  if (error || !image) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-gray-400 text-xs font-medium">{alt}</span>
      </div>
    )
  }

  return (
    <Image
      src={image}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  )
}
