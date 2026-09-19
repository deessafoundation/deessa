import Link from "next/link"
import { ArrowRight, BookOpen, Check, Heart, Users } from "lucide-react"
import type { WhatWeDoArea, WhatWeDoLearningItem } from "@/lib/data/what-we-do-areas"
import { WhatWeDoVideoPlayer } from "@/components/what-we-do-video-player"

const learningIconMap = {
  book: BookOpen,
  people: Users,
  heart: Heart,
}

const learningColorMap: Record<WhatWeDoLearningItem["color"], string> = {
  blue: "text-sky-500",
  orange: "text-orange-500",
  purple: "text-purple-600",
}

export function WhatWeDoAreaDetail({ area }: { area: WhatWeDoArea }) {
  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-12 lg:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(41,182,200,0.12) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="pointer-events-none absolute -left-40 top-20 size-96 rounded-full bg-sky-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-16 size-96 rounded-full bg-purple-100/50 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm font-comic text-slate-500">
          <Link href="/" className="transition-colors hover:text-sky-600">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/whatwedo" className="transition-colors hover:text-sky-600">What We Do</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800">{area.label}</span>
        </nav>

        <header className="mx-auto mb-10 max-w-5xl text-center">
          <p className={`mb-5 text-xs font-bold uppercase tracking-[0.22em] ${area.labelClass}`}>
            {area.label}
          </p>
          <h1 className="font-marissa text-4xl leading-tight text-[#1a1a2e] sm:text-5xl lg:text-6xl">
            {area.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl font-comic text-base leading-relaxed text-slate-600 sm:text-lg">
            {area.subtitle}
          </p>
        </header>

        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
          <WhatWeDoVideoPlayer
            src={area.videoSrc}
            label={area.videoLabel}
            areaLabel={area.label}
            posterSrc={area.posterSrc}
          />

          <aside className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:p-8">
            <h2 className="font-marissa text-3xl leading-tight text-[#1a1a2e]">{area.panelTitle}</h2>
            <p className="mt-4 font-comic text-sm leading-7 text-slate-600 sm:text-base">
              {area.description}
            </p>
            <ul className="mt-6 space-y-4">
              {area.highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-3 font-comic text-sm text-slate-700 sm:text-base">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
            <Link
              href={area.ctaHref}
              className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-sky-500 px-6 py-3 font-comic text-sm font-bold text-sky-600 transition-colors hover:bg-sky-500 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
            >
              {area.ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </aside>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
          <div>
            <h2 className="mb-5 font-marissa text-3xl text-[#1a1a2e] sm:text-4xl">{area.learningTitle}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {area.learningItems.map((item) => {
                const Icon = learningIconMap[item.icon]
                return (
                  <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center gap-3">
                      <Icon className={`size-10 ${learningColorMap[item.color]}`} strokeWidth={2.2} />
                      <h3 className="font-comic text-lg font-bold text-[#1a1a2e]">{item.title}</h3>
                    </div>
                    <p className="mt-4 font-comic text-sm leading-6 text-slate-600">{item.description}</p>
                  </article>
                )
              })}
            </div>
          </div>

          <aside className="rounded-3xl border border-blue-100 bg-gradient-to-br from-sky-50 to-purple-50 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-marissa text-3xl text-[#1a1a2e]">Who this is for</h2>
                <p className="mt-2 font-comic text-sm leading-6 text-slate-600">{area.audienceDescription}</p>
              </div>
              <Users className="size-12 shrink-0 text-purple-600" strokeWidth={1.8} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {area.audiences.map((audience) => (
                <span key={audience} className="rounded-full border border-sky-400/70 bg-white/70 px-3 py-2 text-center font-comic text-xs font-medium text-slate-700 sm:text-sm">
                  {audience}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-3xl border border-sky-100 bg-sky-50/80 px-6 py-7 text-center sm:flex-row sm:px-8 sm:text-left">
          <div>
            <h2 className="font-marissa text-3xl text-[#1a1a2e]">{area.closingTitle}</h2>
            <p className="mt-1 font-comic text-sm text-slate-600 sm:text-base">{area.closingDescription}</p>
          </div>
          <Link
            href="/whatwedo#programs"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-sky-500 px-7 py-3 font-comic text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-transform hover:-translate-y-0.5 hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
          >
            Explore our work
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
