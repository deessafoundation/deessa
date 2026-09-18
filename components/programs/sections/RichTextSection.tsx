'use client'

import type { RichTextContent, ProgramTheme } from '@/lib/types/program-prototype'
import { motion } from 'framer-motion'
import { SectionHeading } from './SectionHeading'

interface RichTextSectionProps {
  heading?: string
  content: RichTextContent
  theme: ProgramTheme
}

export function RichTextSection({ heading, content, theme }: RichTextSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading && <SectionHeading heading={heading} accent="ocean" />}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="prose prose-lg max-w-none font-dm-sans text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>

      <style jsx global>{`
        .prose h3 {
          font-family: 'Marissa Font', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
        }
        
        .prose p {
          font-size: 1.125rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          color: #4a5568;
        }
        
        .prose .lead {
          font-size: 1.375rem;
          line-height: 1.9;
          margin-bottom: 2.5rem;
          color: #1a1a2e;
          font-weight: 500;
        }
        
        .prose ul {
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .prose li {
          margin-bottom: 0.875rem;
          line-height: 1.8;
          font-size: 1.125rem;
        }
        
        .prose strong {
          color: #3B82F6;
          font-weight: 600;
        }
        
        .prose a {
          color: #3B82F6;
          text-decoration: underline;
          transition: color 0.2s;
        }
        
        .prose a:hover {
          color: #2563EB;
        }
      `}</style>
    </section>
  )
}
