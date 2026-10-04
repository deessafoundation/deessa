import { Skeleton } from "@/components/ui/skeleton"

export function ProgramEditSkeleton() {
  return (
    <div className="space-y-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 -mx-6 border-b bg-background/95 px-6 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-8 w-20 shrink-0" />
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-48 max-w-[40vw]" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-16 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Skeleton className="h-8 w-[76px]" />
            <Skeleton className="h-8 w-[64px]" />
            <Skeleton className="h-8 w-[80px]" />
            <Skeleton className="h-8 w-[86px]" />
          </div>
        </div>
      </div>

      {/* Program info card */}
      <div className="space-y-5 rounded-lg border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Page content card */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-5 py-3">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-5 p-5">
          <Skeleton className="h-5 w-52" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      </div>

      {/* Media library card */}
      <div className="space-y-3 rounded-lg border bg-card p-5">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
