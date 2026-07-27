import type { ReactNode } from "react"
import { Calendar, Sparkles } from "lucide-react"

export default function EventsLoadingPage() {
  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO SKELETON
          ═══════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fcff_0%,#eaf5fb_45%,#f7f4ef_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(41,182,200,0.22),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(111,62,150,0.14),transparent_24%),radial-gradient(circle_at_78%_88%,rgba(247,197,43,0.18),transparent_22%),radial-gradient(circle_at_center,rgba(255,255,255,0.5),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(11,95,138,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(11,95,138,0.18)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 md:px-8 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-24">
          {/* Copy */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="h-12 w-full max-w-3xl animate-pulse rounded-2xl bg-slate-200/70 sm:h-14 lg:h-16" />
              <div className="h-12 w-3/4 max-w-2xl animate-pulse rounded-2xl bg-slate-200/70 sm:h-14 lg:h-16" />
            </div>

            <div className="mt-5 space-y-2">
              <div className="h-6 w-full max-w-2xl animate-pulse rounded-lg bg-slate-200/60 sm:h-7" />
              <div className="h-6 w-4/5 max-w-xl animate-pulse rounded-lg bg-slate-200/60 sm:h-7" />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="h-12 w-full animate-pulse rounded-full bg-slate-200/70 sm:w-40" />
              <div className="h-12 w-full animate-pulse rounded-full bg-slate-200/50 sm:w-40" />
            </div>
          </div>

          {/* Overview card skeleton */}
          <div className="lg:col-span-5">
            <div className="rounded-[2.1rem] bg-white/85 p-5 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.42)] backdrop-blur md:p-6">
              <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-3 space-y-2">
                <div className="h-8 w-full animate-pulse rounded-xl bg-slate-200/70" />
                <div className="h-8 w-3/4 animate-pulse rounded-xl bg-slate-200/70" />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-5 w-full animate-pulse rounded-lg bg-slate-200/60" />
                <div className="h-5 w-4/5 animate-pulse rounded-lg bg-slate-200/60" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl bg-slate-100 p-3">
                    <div className="h-8 w-12 animate-pulse rounded-lg bg-slate-200" />
                    <div className="mt-2 h-3 w-full animate-pulse rounded-full bg-slate-200/70" />
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="h-10 w-full animate-pulse rounded-full bg-slate-200" />
                <div className="h-10 w-full animate-pulse rounded-full bg-slate-200/70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED + UPCOMING SKELETON
          ═══════════════════════════════════════════ */}
      <section className="scroll-mt-24 bg-[#faf9f6] py-16 md:py-24">
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          {/* Soft decorative blobs */}
          <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[rgba(41,182,200,0.12)] blur-[90px]" />
          <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[rgba(247,197,43,0.12)] blur-[90px]" />

          <div className="relative mb-10 md:mb-14">
            <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-3 h-10 w-full max-w-md animate-pulse rounded-2xl bg-slate-200/70 sm:h-12" />
            <div className="mt-3 space-y-2">
              <div className="h-6 w-full max-w-2xl animate-pulse rounded-lg bg-slate-200/60" />
              <div className="h-6 w-3/4 max-w-xl animate-pulse rounded-lg bg-slate-200/60" />
            </div>
          </div>

          {/* Featured event skeleton */}
          <div className="relative mb-12 md:mb-16">
            <FeaturedEventSkeleton />
          </div>

          {/* More upcoming section */}
          <div className="relative">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200/70" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200/60" />
            </div>
            <EventCardGridSkeleton count={3} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PAST EVENTS SKELETON
          ═══════════════════════════════════════════ */}
      <section className="scroll-mt-24 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 md:mb-14">
            <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-3 h-10 w-64 animate-pulse rounded-2xl bg-slate-200/70" />
            <div className="mt-3 space-y-2">
              <div className="h-6 w-full max-w-2xl animate-pulse rounded-lg bg-slate-200/60" />
              <div className="h-6 w-2/3 max-w-lg animate-pulse rounded-lg bg-slate-200/60" />
            </div>
          </div>

          <EventCardGridSkeleton count={6} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA SKELETON
          ═══════════════════════════════════════════ */}
      <section className="bg-[linear-gradient(180deg,#f7f4ef_0%,#fbf8f4_100%)] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="rounded-[2.25rem] bg-primary px-6 py-10 text-center text-white shadow-[0_22px_60px_-40px_rgba(11,95,138,0.85)] md:px-10 md:py-14">
            <div className="mx-auto h-3 w-24 animate-pulse rounded-full bg-white/30" />
            <div className="mx-auto mt-4 h-10 w-full max-w-md animate-pulse rounded-2xl bg-white/30" />
            <div className="mx-auto mt-5 space-y-2">
              <div className="mx-auto h-6 w-full max-w-2xl animate-pulse rounded-lg bg-white/20" />
              <div className="mx-auto h-6 w-3/4 max-w-xl animate-pulse rounded-lg bg-white/20" />
            </div>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <div className="h-12 w-full animate-pulse rounded-full bg-white/40 sm:w-40" />
              <div className="h-12 w-full animate-pulse rounded-full bg-white/20 sm:w-40" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ──────────────────  Featured event skeleton  ────────────────── */

function FeaturedEventSkeleton() {
  return (
    <div className="group relative animate-pulse">
      <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] lg:grid-cols-12 lg:items-stretch">
        {/* Image skeleton */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#eaf5fb] via-[#f8fcff] to-[#f7f4ef] lg:col-span-6 lg:aspect-auto lg:min-h-[400px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="size-16 text-primary/20" aria-hidden="true" />
          </div>

          {/* Floating date block */}
          <div className="absolute left-5 top-5 flex flex-col items-center rounded-2xl bg-white px-3.5 py-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)]">
            <div className="h-2.5 w-8 rounded-full bg-slate-200" />
            <div className="mt-1 h-8 w-10 rounded-lg bg-slate-200" />
            <div className="mt-1 h-2 w-6 rounded-full bg-slate-200" />
          </div>

          {/* Category chip skeleton */}
          <div className="absolute bottom-5 left-5">
            <div className="h-7 w-24 rounded-full bg-slate-200/90 shadow-lg" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="relative flex flex-col justify-center p-7 sm:p-9 lg:col-span-6 lg:p-10">
          <div className="mb-5 h-1 w-12 rounded-full bg-slate-200" />

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="h-6 w-16 rounded-full bg-slate-200" />
            <div className="h-6 w-20 rounded-full bg-slate-200/70" />
          </div>

          <div className="space-y-2">
            <div className="h-8 w-full rounded-xl bg-slate-200/80" />
            <div className="h-8 w-5/6 rounded-xl bg-slate-200/80" />
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="h-5 w-full rounded-lg bg-slate-200/60" />
            <div className="h-5 w-4/5 rounded-lg bg-slate-200/60" />
            <div className="h-5 w-3/5 rounded-lg bg-slate-200/60" />
          </div>

          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-slate-200" />
              <div className="h-4 w-48 rounded-full bg-slate-200/70" />
            </div>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-slate-200" />
              <div className="h-4 w-56 rounded-full bg-slate-200/70" />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <div className="h-4 w-28 rounded-full bg-slate-200" />
            <div className="h-4 w-4 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────  Event card grid skeleton  ────────────────── */

function EventCardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}

function EventCardSkeleton() {
  return (
    <div className="flex h-full min-h-0 animate-pulse flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
      {/* Image skeleton */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#eaf5fb] via-[#f8fcff] to-[#f7f4ef]">
        <div className="absolute inset-0 flex items-center justify-center">
          <Calendar className="size-12 text-primary/20" aria-hidden="true" />
        </div>

        {/* Category badge skeleton */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="h-7 w-24 rounded-full bg-white/90 shadow-lg" />
        </div>

        {/* Date stamp skeleton */}
        <div className="absolute right-3 top-3 z-10 rounded-xl bg-white/95 px-2.5 py-1.5 shadow-md">
          <div className="h-2 w-6 rounded-full bg-slate-200" />
          <div className="mt-1 h-5 w-8 rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <div className="h-5 w-16 rounded-full bg-slate-200" />
          <div className="h-5 w-20 rounded-full bg-slate-200/70" />
        </div>

        <div className="mb-2 space-y-2">
          <div className="h-6 w-full rounded-lg bg-slate-200/80" />
          <div className="h-6 w-4/5 rounded-lg bg-slate-200/80" />
        </div>

        <div className="mb-4 space-y-1.5">
          <div className="h-4 w-full rounded-lg bg-slate-200/60" />
          <div className="h-4 w-5/6 rounded-lg bg-slate-200/60" />
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-4 w-20 rounded-full bg-slate-200/70" />
            <div className="h-4 w-32 rounded-full bg-slate-200/70" />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
            <div className="h-4 w-16 rounded-full bg-slate-200" />
            <div className="h-4 w-24 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
