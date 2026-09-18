'use client'

import type { CTAContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface CTASectionProps {
  content: CTAContent
  theme: ProgramTheme
}

export function CTASection({ content, theme }: CTASectionProps) {
  const getBackgroundStyle = () => {
    if (content.backgroundStyle === 'gradient') {
      return 'bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600'
    }
    if (content.backgroundStyle === 'solid') {
      return theme === 'warm' ? 'bg-blue-600' : 'bg-purple-600'
    }
    return 'bg-gradient-to-r from-blue-600 to-purple-600'
  }

  return (
    <section className={`py-20 md:py-28 ${getBackgroundStyle()} relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-4xl md:text-5xl lg:text-6xl font-marissa text-white leading-tight"
        >
          {content.title}
        </motion.h2>

        {content.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-12 text-xl md:text-2xl text-white/90 font-dm-sans leading-relaxed max-w-3xl mx-auto"
          >
            {content.description}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-5 justify-center"
        >
          {content.buttons.map((button, index) => (
            <Link
              key={index}
              href={button.url}
              className={`px-10 py-5 rounded-full font-dm-sans font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 ${
                button.variant === 'primary'
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}
            >
              {button.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
