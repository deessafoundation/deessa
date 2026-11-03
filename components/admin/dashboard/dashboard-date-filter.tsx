"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

const ranges = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "ytd", label: "YTD" },
  { value: "all", label: "All" },
]

export function DashboardDateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentRange = searchParams.get("range") || "30d"

  const handleRangeChange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", range)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/70 w-full sm:w-auto justify-between sm:justify-start overflow-x-auto scrollbar-none">
      <div className="hidden sm:flex items-center pl-1.5 pr-1 text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
      </div>
      {ranges.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => handleRangeChange(r.value)}
          aria-pressed={currentRange === r.value}
          aria-label={`Filter by ${r.label} range`}
          className={cn(
            "relative overflow-hidden flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 text-xs font-medium rounded-xl transition-all duration-200 whitespace-nowrap min-h-[38px] sm:min-h-[36px] min-w-[36px] flex items-center justify-center border border-transparent group",
            currentRange === r.value
              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm border-primary/30 font-semibold"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20"
          )}
        >
          <span className="relative z-10">{r.label}</span>
          {currentRange === r.value && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100 animate-shimmer pointer-events-none" />
          )}
        </button>
      ))}
    </div>
  )
}
