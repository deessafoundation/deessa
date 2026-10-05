'use client'

export function ProgramSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-screen bg-gradient-to-br from-gray-200 to-gray-300">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="w-full max-w-2xl space-y-6">
            <div className="h-6 w-48 bg-gray-300 rounded-full shimmer" />
            <div className="h-16 w-full bg-gray-300 rounded-lg shimmer" />
            <div className="h-24 w-full bg-gray-300 rounded-lg shimmer" />
            <div className="flex gap-4">
              <div className="h-12 w-32 bg-gray-300 rounded-full shimmer" />
              <div className="h-12 w-32 bg-gray-300 rounded-full shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Section Skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-8 shimmer" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-48 bg-gray-200 rounded-xl shimmer" />
              ))}
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            #f0f0f0 0%,
            #e0e0e0 50%,
            #f0f0f0 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite ease-in-out;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

export function SectionSkeleton() {
  return (
    <div className="animate-pulse py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-12 shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-xl shimmer" />
              <div className="h-6 bg-gray-200 rounded shimmer" />
              <div className="h-4 bg-gray-200 rounded shimmer w-3/4" />
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            #f0f0f0 0%,
            #e0e0e0 50%,
            #f0f0f0 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite ease-in-out;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}
