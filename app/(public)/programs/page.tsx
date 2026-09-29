import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { aacSupportProgram } from '@/data/programs/aac-support'
import { thousandFamiliesCampaign } from '@/data/programs/1000-families'

export const metadata: Metadata = {
  title: 'Programs - deessa Foundation',
  description: 'Explore our programs supporting children with autism and their families across Nepal.',
}

const programs = [aacSupportProgram, thousandFamiliesCampaign]

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Hero */}
      <section data-a11y-region="neutral" className="relative py-20 bg-gradient-to-br from-[#3FABDE] to-[#0B5F8A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 text-sm font-comic tracking-widest uppercase">
              deessa FOUNDATION
            </div>
            <h1 className="mb-6 text-5xl md:text-6xl font-marissa leading-tight">
              Our Programs
            </h1>
            <p className="text-xl md:text-2xl font-dm-sans text-white/90 max-w-3xl mx-auto leading-relaxed">
              From communication support to community campaigns — discover how we're
              making a difference for children with autism and their families.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={program.hero.image}
                    alt={program.hero.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Badge */}
                  {program.eyebrow && (
                    <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm text-sm font-comic font-bold text-[#1a1a2e] shadow-lg">
                      {program.eyebrow}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8">
                  <h2 className="text-3xl font-marissa text-[#1a1a2e] mb-4 group-hover:text-[#3FABDE] transition-colors">
                    {program.title}
                  </h2>
                  
                  <p className="font-dm-sans text-[#6c757d] leading-relaxed mb-6">
                    {program.shortDescription}
                  </p>

                  {/* Tags */}
                  {program.tags && program.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {program.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-blue-50 text-[#3FABDE] text-xs font-comic font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center text-[#3FABDE] font-comic font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Learn More →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-a11y-region="neutral" className="py-16 bg-gradient-to-br from-purple-900 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-4xl md:text-5xl font-marissa">
            Want to Get Involved?
          </h2>
          <p className="mb-8 text-lg md:text-xl font-dm-sans text-white/85 leading-relaxed">
            Your support helps us reach more families and create lasting impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="px-8 py-4 rounded-full bg-yellow-400 text-purple-900 font-comic font-bold text-base hover:bg-yellow-300 hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Donate Now
            </Link>
            <Link
              href="/get-involved"
              className="px-8 py-4 rounded-full border-2 border-white text-white font-comic font-bold text-base hover:bg-white/10 transition-all duration-300"
            >
              Volunteer with Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
