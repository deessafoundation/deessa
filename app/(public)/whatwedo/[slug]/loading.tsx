export default function ProgramDetailLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero skeleton - full bleed */}
      <section className="relative w-full h-[650px] md:h-[750px] bg-gradient-to-br from-gray-200 to-gray-300">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 via-gray-900/20 to-transparent" />
        <div className="relative z-10 flex items-center h-full px-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl space-y-6">
              <div className="h-5 w-32 bg-white/30 rounded-full" />
              <div className="h-16 w-full bg-white/30 rounded-2xl" />
              <div className="h-12 w-3/4 bg-white/30 rounded-xl" />
              <div className="flex gap-4 mt-8">
                <div className="h-12 w-36 bg-white/30 rounded-full" />
                <div className="h-12 w-36 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section skeletons */}
      {[1, 2, 3].map((i) => (
        <section key={i} className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-4">
                  <div className="h-48 bg-gray-200 rounded-xl" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
