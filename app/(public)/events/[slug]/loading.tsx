import { Calendar, MapPin, Clock, Info, Mail, Share2 } from "lucide-react"

export default function EventDetailLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero Skeleton */}
      <section className="relative isolate overflow-hidden">
        <div className="relative h-[500px] w-full animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 md:h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
          
          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-4 pb-10 md:px-8 md:pb-16">
              <div className="mx-auto max-w-7xl">
                {/* Back link skeleton */}
                <div className="mb-6 h-5 w-24 rounded-full bg-white/20" />

                {/* Badges skeleton */}
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="h-7 w-24 rounded-full bg-white/20" />
                  <div className="h-7 w-20 rounded-full bg-white/20" />
                </div>

                {/* Title skeleton */}
                <div className="mb-6 space-y-3">
                  <div className="h-12 w-full max-w-2xl rounded-2xl bg-white/20 md:h-14" />
                  <div className="h-12 w-3/4 max-w-xl rounded-2xl bg-white/20 md:h-14" />
                </div>

                {/* Meta info skeleton */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-full bg-white/20" />
                    <div className="h-5 w-40 rounded-full bg-white/20" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-full bg-white/20" />
                    <div className="h-5 w-24 rounded-full bg-white/20" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-full bg-white/20" />
                    <div className="h-5 w-32 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="relative bg-[#faf9f6] py-12 md:py-20">
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {/* Main Column */}
            <div className="space-y-10 lg:col-span-2 lg:space-y-14">
              {/* About Section Skeleton */}
              <div className="animate-pulse">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-200">
                    <Info className="size-5 text-slate-300" />
                  </div>
                  <div className="h-8 w-48 rounded-xl bg-slate-200" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
                  <div className="space-y-3">
                    <div className="h-5 w-full rounded-lg bg-slate-200" />
                    <div className="h-5 w-full rounded-lg bg-slate-200" />
                    <div className="h-5 w-4/5 rounded-lg bg-slate-200" />
                    <div className="h-5 w-full rounded-lg bg-slate-200" />
                    <div className="h-5 w-5/6 rounded-lg bg-slate-200" />
                  </div>
                </div>
              </div>

              {/* Schedule Section Skeleton */}
              <div className="animate-pulse">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-200">
                    <Calendar className="size-5 text-slate-300" />
                  </div>
                  <div className="h-8 w-40 rounded-xl bg-slate-200" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-7 w-16 rounded-xl bg-slate-200" />
                    <div className="h-6 w-32 rounded-lg bg-slate-200" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="size-10 shrink-0 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 rounded-full bg-slate-200" />
                          <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
                          <div className="h-4 w-1/2 rounded-full bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map Section Skeleton */}
              <div className="animate-pulse">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-200">
                    <MapPin className="size-5 text-slate-300" />
                  </div>
                  <div className="h-8 w-36 rounded-xl bg-slate-200" />
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="h-[400px] w-full bg-slate-200" />
                  <div className="border-t border-slate-100 p-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 size-5 shrink-0 text-slate-300" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-48 rounded-lg bg-slate-200" />
                        <div className="h-4 w-64 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Registration Card Skeleton */}
              <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-5">
                  <div className="mb-2 h-3 w-20 rounded-full bg-slate-200" />
                  <div className="h-10 w-24 rounded-xl bg-slate-200" />
                </div>

                <div className="mb-6 space-y-3 border-y border-slate-100 py-5">
                  <div className="flex items-start gap-3">
                    <div className="size-9 shrink-0 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-12 rounded-full bg-slate-200" />
                      <div className="h-4 w-32 rounded-full bg-slate-200" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-9 shrink-0 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-12 rounded-full bg-slate-200" />
                      <div className="h-4 w-24 rounded-full bg-slate-200" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-9 shrink-0 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-16 rounded-full bg-slate-200" />
                      <div className="h-4 w-40 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>

                <div className="mb-3 h-12 w-full rounded-full bg-slate-200" />
                <div className="h-10 w-full rounded-full bg-slate-200" />
              </div>

              {/* Quick Links Skeleton */}
              <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-4 h-4 w-24 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-full rounded-xl bg-slate-50" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="bg-primary px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex h-8 w-40 animate-pulse rounded-full bg-white/20" />
          <div className="mx-auto mb-4 h-10 w-full max-w-md animate-pulse rounded-2xl bg-white/20" />
          <div className="mx-auto mb-8 space-y-2">
            <div className="mx-auto h-6 w-full max-w-2xl animate-pulse rounded-lg bg-white/10" />
            <div className="mx-auto h-6 w-3/4 max-w-xl animate-pulse rounded-lg bg-white/10" />
          </div>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <div className="h-12 w-full animate-pulse rounded-full bg-white/30 sm:w-44" />
            <div className="h-12 w-full animate-pulse rounded-full bg-white/10 sm:w-36" />
          </div>
        </div>
      </section>
    </div>
  )
}
