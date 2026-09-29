export default function WhatWeDoLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <section className="relative w-full h-[100svh] md:h-[88vh] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-[2px] opacity-30">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-300" />
          ))}
        </div>
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl space-y-6">
              <div className="h-6 w-40 bg-white/30 rounded-full" />
              <div className="h-16 w-full max-w-2xl bg-white/30 rounded-2xl" />
              <div className="h-12 w-3/4 bg-white/30 rounded-xl" />
              <div className="flex gap-4 mt-8">
                <div className="h-12 w-36 bg-white/30 rounded-full" />
                <div className="h-12 w-36 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards skeleton */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-20 bg-gray-200 rounded-full" />
                  <div className="h-6 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
