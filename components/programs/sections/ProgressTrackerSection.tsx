'use client'

import type { ProgressTrackerContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

interface ProgressTrackerSectionProps {
  heading?: string
  content: ProgressTrackerContent
  theme: ProgramTheme
}

export function ProgressTrackerSection({ heading, content, theme }: ProgressTrackerSectionProps) {
  const [animatedCurrent, setAnimatedCurrent] = useState(0)
  const percentage = Math.round((content.current / content.goal) * 100)
  const remaining = content.goal - content.current

  // Animate the counter
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = content.current / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep <= steps) {
        setAnimatedCurrent(Math.floor(increment * currentStep))
      } else {
        setAnimatedCurrent(content.current)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [content.current])

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-blue-50 via-purple-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading heading={heading || 'Our Campaign Goal'} accent="amber" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Visual Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Main progress circle */}
            <div className="relative bg-white p-12 rounded-full shadow-2xl aspect-square flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="mb-4"
                >
                  <Heart className="w-20 h-20 text-red-500 mx-auto fill-red-500" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="text-7xl md:text-8xl font-marissa text-blue-600 mb-3"
                >
                  {percentage}%
                </motion.div>
                
                <div className="text-xl text-gray-600 font-dm-sans font-semibold">
                  Complete
                </div>
              </div>
              
              {/* Decorative ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  stroke="#DBEAFE"
                  strokeWidth="8"
                  fill="none"
                  className="opacity-30"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  stroke="url(#blueGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 1000 }}
                  whileInView={{ strokeDashoffset: 1000 - (1000 * percentage) / 100 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  style={{ strokeDasharray: 1000 }}
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* Right: Numbers & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Current vs Goal */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border-4 border-blue-200">
              <div className="flex items-baseline justify-center gap-4 mb-6">
                <motion.div 
                  className="text-6xl md:text-7xl font-marissa text-blue-600"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  {animatedCurrent.toLocaleString()}
                </motion.div>
                <div className="text-4xl font-dm-sans text-gray-400">/</div>
                <div className="text-5xl font-marissa text-gray-700">
                  {content.goal.toLocaleString()}
                </div>
              </div>
              
              <div className="text-center text-2xl text-gray-800 font-dm-sans font-semibold">
                {content.unit} Reached
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative bg-white p-6 rounded-3xl shadow-lg">
              <div className="h-8 bg-blue-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 rounded-full relative"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                </motion.div>
              </div>
            </div>

            {/* Remaining card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-3xl border-2 border-blue-300"
            >
              <div className="text-center">
                <div className="text-4xl font-marissa text-gray-900 mb-3">
                  {remaining.toLocaleString()} {content.unit} to go!
                </div>
                <div className="text-lg text-gray-700 font-dm-sans">
                  Help us reach our goal and make a difference
                </div>
              </div>
            </motion.div>

            {/* Timeline info */}
            {(content.startDate || content.endDate || content.daysLeft) && (
              <div className="grid grid-cols-3 gap-4">
                {content.startDate && (
                  <div className="text-center p-5 rounded-2xl bg-white shadow-md border border-blue-100">
                    <div className="text-xs font-dm-sans text-blue-600 uppercase font-semibold mb-2">Started</div>
                    <div className="font-dm-sans text-gray-800 text-sm font-semibold">{content.startDate}</div>
                  </div>
                )}
                
                {content.endDate && (
                  <div className="text-center p-5 rounded-2xl bg-white shadow-md border border-blue-100">
                    <div className="text-xs font-dm-sans text-blue-600 uppercase font-semibold mb-2">Deadline</div>
                    <div className="font-dm-sans text-gray-800 text-sm font-semibold">{content.endDate}</div>
                  </div>
                )}
                
                {content.daysLeft !== undefined && (
                  <div className="text-center p-5 rounded-2xl bg-blue-100 shadow-md border-2 border-blue-300">
                    <div className="text-xs font-dm-sans text-blue-700 uppercase font-semibold mb-2">Days Left</div>
                    <div className="font-dm-sans text-blue-900 font-bold text-sm">{content.daysLeft}</div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </section>
  )
}
