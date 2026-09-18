'use client'

import { motion } from 'framer-motion'

type AccentColor =
  | 'ocean'    // #3FABDE
  | 'sky'      // #0EA5E9
  | 'dark'     // #0B5F8A
  | 'pink'     // #D6336C
  | 'green'    // #95C11F
  | 'amber'    // #F59E0B
  | 'violet'   // #8B5CF6
  | 'white'    // for dark backgrounds

const ACCENT_STYLES: Record<AccentColor, string> = {
  ocean: 'from-[#3FABDE] to-[#0B5F8A]',
  sky: 'from-[#0EA5E9] to-[#38BDF8]',
  dark: 'from-[#0B5F8A] to-[#1a1a2e]',
  pink: 'from-[#D6336C] to-[#EC4899]',
  green: 'from-[#95C11F] to-[#65A30D]',
  amber: 'from-[#F59E0B] to-[#F97316]',
  violet: 'from-[#8B5CF6] to-[#A78BFA]',
  white: 'from-white/80 to-white/40',
}

interface SectionHeadingProps {
  heading: string
  accent?: AccentColor
  align?: 'center' | 'left'
  light?: boolean // for dark backgrounds (text-white)
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'text-3xl md:text-4xl',
  md: 'text-4xl md:text-5xl',
  lg: 'text-4xl md:text-5xl lg:text-6xl',
}

export function SectionHeading({
  heading,
  accent = 'ocean',
  align = 'center',
  light = false,
  size = 'md',
  className = '',
}: SectionHeadingProps) {
  const textColor = light ? 'text-white' : 'text-gray-900'
  const alignClass = align === 'center' ? 'text-center' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-12 ${alignClass} ${className}`}
    >
      <h2 className={`${sizeClasses[size]} font-marissa ${textColor} leading-tight`}>
        {heading}
      </h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        className={`mt-4 h-1 w-16 rounded-full bg-gradient-to-r ${ACCENT_STYLES[accent]} ${align === 'center' ? 'mx-auto' : ''}`}
      />
    </motion.div>
  )
}
