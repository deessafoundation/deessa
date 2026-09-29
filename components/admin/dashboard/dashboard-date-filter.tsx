"use client"

import { useRouter, useSearchParams } from "next/navigation"

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
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => handleRangeChange(r.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            currentRange === r.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
