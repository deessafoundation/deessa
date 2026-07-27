import { Calendar } from "lucide-react"

export function EventPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <Calendar className="absolute inset-0 m-auto h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading event...</p>
      </div>
    </div>
  )
}

export function EventGridLoading() {
  return (
    <div className="grid gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-background rounded-2xl overflow-hidden border border-border animate-pulse"
        >
          <div className="grid md:grid-cols-3 gap-0">
            <div className="aspect-[16/10] md:aspect-auto bg-muted" />
            <div className="md:col-span-2 p-6 md:p-8 space-y-4">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-muted rounded-full" />
                <div className="h-5 w-24 bg-muted rounded-full" />
              </div>
              <div className="h-7 w-3/4 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function EventDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="w-full h-[400px] md:h-[500px] bg-muted animate-pulse" />

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}
