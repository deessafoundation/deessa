import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SupportLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-xl" />
            <div>
              <Skeleton className="h-7 w-52 mb-1" />
              <Skeleton className="h-4 w-80" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-xl border border-border/60">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-16 mt-2" />
              <Skeleton className="h-3 w-32 mt-1" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Scope Tabs & Toolbar Skeleton */}
      <Card className="rounded-xl border border-border/60">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-10 w-full sm:w-[540px] rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-lg hidden sm:block" />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-border/40">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-44 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-40 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="rounded-xl border border-border/60 overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0 divide-y divide-border/40">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-6 font-mono" />
                  <Skeleton className="size-9 rounded-xl" />
                  <div className="space-y-1.5 flex-1 max-w-sm">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-md hidden md:block" />
                <Skeleton className="h-4 w-40 hidden lg:block" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
