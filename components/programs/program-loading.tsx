import { cn } from "@/lib/utils"
import styles from "./program-loading.module.css"

function Placeholder({ className }: { className: string }) {
  return <div className={cn(styles.placeholder, "rounded-xl", className)} />
}

function Cards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className={cn(styles.card, "overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_16px_rgba(26,26,46,0.06)]")}>
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-slate-300 to-slate-400" />
          
          {/* Image area */}
          <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200" />
          
          {/* Content */}
          <div className="space-y-4 p-6 sm:p-7">
            {/* Category badge */}
            <Placeholder className="h-4 w-24" />
            
            {/* Title */}
            <Placeholder className="h-7 w-4/5" />
            
            {/* Description lines */}
            <div className="space-y-2">
              <Placeholder className="h-4 w-full" />
              <Placeholder className="h-4 w-full" />
              <Placeholder className="h-4 w-3/4" />
            </div>
            
            {/* Learn more button */}
            <div className="pt-4 border-t border-slate-100">
              <Placeholder className="h-9 w-32 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProgramCardsSkeleton() {
  return (
    <div className={styles.root}>
      <p role="status" className="sr-only">Loading programs...</p>
      <div aria-hidden="true" className="space-y-8">
        {/* Filter tabs skeleton */}
        <div className="-mx-4 mb-10 md:mb-12 overflow-x-auto px-4 py-2">
          <div className="mx-auto flex w-max gap-1.5 rounded-full border border-slate-200/80 bg-white p-1.5 shadow-[0_2px_16px_rgba(26,26,46,0.06)]">
            {Array.from({ length: 5 }, (_, index) => (
              <Placeholder key={index} className="h-11 w-28 rounded-full" />
            ))}
          </div>
        </div>
        
        {/* Cards grid */}
        <Cards />
      </div>
    </div>
  )
}

export function ProgramsPageSkeleton() {
  return (
    <div className={cn(styles.root, "min-h-screen bg-white")}>
      <h1 className="sr-only">What We Do</h1>
      <p role="status" className="sr-only">Loading programs...</p>
      <div aria-hidden="true">
        {/* Hero Section Skeleton */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center space-y-6">
            {/* Eyebrow */}
            <Placeholder className="h-3 w-32 mx-auto" />
            
            {/* Title lines */}
            <div className="space-y-3">
              <Placeholder className="h-12 w-full max-w-3xl mx-auto" />
              <Placeholder className="h-12 w-3/4 max-w-2xl mx-auto" />
            </div>
            
            {/* Subtitle */}
            <div className="space-y-2 max-w-2xl mx-auto">
              <Placeholder className="h-5 w-full" />
              <Placeholder className="h-5 w-2/3 mx-auto" />
            </div>
          </div>
        </div>

        {/* What We Do Section Skeleton */}
        <section className="bg-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-14 md:mb-20 space-y-4">
              <Placeholder className="h-3 w-24 mx-auto" />
              <div className="space-y-3">
                <Placeholder className="h-10 w-full max-w-2xl mx-auto" />
                <Placeholder className="h-10 w-3/4 max-w-xl mx-auto" />
              </div>
              <div className="space-y-2 max-w-3xl mx-auto">
                <Placeholder className="h-5 w-full" />
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 md:p-8">
                  <div className="flex flex-col items-center text-center space-y-5">
                    {/* Icon */}
                    <Placeholder className="w-16 h-16 rounded-2xl" />
                    
                    {/* Title */}
                    <Placeholder className="h-6 w-32" />
                    
                    {/* Description */}
                    <div className="space-y-2 w-full">
                      <Placeholder className="h-4 w-full" />
                      <Placeholder className="h-4 w-full" />
                      <Placeholder className="h-4 w-3/4 mx-auto" />
                    </div>
                    
                    {/* Link */}
                    <Placeholder className="h-4 w-28 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Grid Section Skeleton */}
        <section className="bg-[#f8f6f1] py-10 md:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-8 md:mb-10 space-y-4">
              <Placeholder className="h-10 w-80 max-w-full mx-auto" />
              <Placeholder className="h-5 w-full max-w-2xl mx-auto" />
            </div>
            
            <ProgramCardsSkeleton />
          </div>
        </section>

        {/* Support CTA Section Skeleton */}
        <section className="bg-gradient-to-b from-white to-slate-50 py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-10 md:mb-14 space-y-4">
              <Placeholder className="h-6 w-32 mx-auto rounded-full" />
              <div className="space-y-3">
                <Placeholder className="h-10 w-full max-w-2xl mx-auto" />
              </div>
              <Placeholder className="h-5 w-full max-w-xl mx-auto" />
            </div>

            {/* 3 Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 lg:p-8 shadow-[0_2px_16px_rgba(26,26,46,0.06)]">
                  <div className="space-y-5">
                    {/* Icon */}
                    <Placeholder className="w-14 h-14 rounded-2xl" />
                    
                    {/* Title */}
                    <Placeholder className="h-7 w-40" />
                    
                    {/* Description */}
                    <div className="space-y-2">
                      <Placeholder className="h-4 w-full" />
                      <Placeholder className="h-4 w-3/4" />
                    </div>
                    
                    {/* Button */}
                    <Placeholder className="h-12 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export function ProgramDetailSkeleton() {
  return (
    <div className={cn(styles.root, "min-h-screen bg-white")}>
      <h1 className="sr-only">Program details</h1>
      <p role="status" className="sr-only">Loading program details...</p>
      <div aria-hidden="true">
        {/* Breadcrumb */}
        <nav className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-6 sm:px-8">
          <Placeholder className="h-4 w-32" />
          <span className="text-slate-400">/</span>
          <Placeholder className="h-4 w-48" />
        </nav>

        {/* Hero Section */}
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <div className="grid items-center gap-10 py-6 md:grid-cols-2 md:py-12">
            <div className="space-y-6">
              {/* Category badge */}
              <Placeholder className="h-6 w-32 rounded-full" />
              
              {/* Title */}
              <div className="space-y-3">
                <Placeholder className="h-12 w-full" />
                <Placeholder className="h-12 w-4/5" />
              </div>
              
              {/* Description */}
              <div className="space-y-3 pt-2">
                <Placeholder className="h-5 w-full" />
                <Placeholder className="h-5 w-full" />
                <Placeholder className="h-5 w-2/3" />
              </div>
              
              {/* Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Placeholder className="h-12 w-40 rounded-full" />
                <Placeholder className="h-12 w-32 rounded-full" />
              </div>
            </div>
            
            {/* Image */}
            <div className="relative">
              <Placeholder className="aspect-[4/5] max-h-[32rem] w-full rounded-3xl" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 border-y border-slate-200 py-8 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-3">
                <Placeholder className="h-4 w-2/3" />
                <Placeholder className="h-8 w-3/4" />
              </div>
            ))}
          </div>

          {/* Content Sections */}
          <div className="space-y-12 py-12">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="space-y-5">
                <Placeholder className="h-9 w-3/4 max-w-lg" />
                <div className="space-y-3">
                  <Placeholder className="h-5 w-full" />
                  <Placeholder className="h-5 w-full" />
                  <Placeholder className="h-5 w-4/5" />
                  <Placeholder className="h-5 w-full" />
                  <Placeholder className="h-5 w-3/4" />
                </div>
              </div>
            ))}
          </div>

          {/* Related Programs */}
          <div className="border-t border-slate-200 pt-12">
            <div className="space-y-8">
              <Placeholder className="h-8 w-64" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <Placeholder className="aspect-[16/10] rounded-none" />
                    <div className="p-5 space-y-3">
                      <Placeholder className="h-4 w-20" />
                      <Placeholder className="h-6 w-full" />
                      <Placeholder className="h-4 w-full" />
                      <Placeholder className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
