"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import ExcelJS from "exceljs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  X,
  LayoutGrid,
  Table as TableIcon,
  Mail,
  Phone,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { EventRegistration } from "@/lib/types/events-module"

function getInitials(name: string | null | undefined) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
  "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
  "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
]

function avatarColor(name: string | null | undefined) {
  let hash = 0
  for (const c of name ?? "") hash = (hash + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed")
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 hover:bg-green-100 text-xs font-semibold border-0">
        Confirmed
      </Badge>
    )
  if (status === "cancelled")
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100 text-xs font-semibold border-0">
        Cancelled
      </Badge>
    )
  if (status === "expired")
    return (
      <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold border-0">
        Expired
      </Badge>
    )
  return (
    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold border-0">
      Pending
    </Badge>
  )
}

function PaymentBadge({ status }: { status?: string | null }) {
  if (status === "paid")
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 hover:bg-green-100 text-[11px] px-2 py-0 font-semibold border-0">
        Paid
      </Badge>
    )
  if (status === "failed")
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100 text-[11px] px-2 py-0 font-semibold border-0">
        Failed
      </Badge>
    )
  if (status === "refunded")
    return (
      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 text-[11px] px-2 py-0 font-semibold border-0">
        Refunded
      </Badge>
    )
  if (status === "review")
    return (
      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 text-[11px] px-2 py-0 font-semibold border-0">
        In Review
      </Badge>
    )
  return (
    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 text-[11px] px-2 py-0 font-semibold border-0">
      Unpaid
    </Badge>
  )
}

function PaymentMethodBadge({ method }: { method?: string | null }) {
  if (!method) return <span className="text-xs text-muted-foreground">—</span>
  if (method === "venue")
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300">
        Pay at Venue
      </span>
    )
  if (method === "qr")
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
        QR Code
      </span>
    )
  if (method === "online")
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
        Online
      </span>
    )
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {method.charAt(0).toUpperCase() + method.slice(1)}
    </span>
  )
}

function ModeBadge({ mode }: { mode?: string | null }) {
  if (!mode) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
      {mode.charAt(0).toUpperCase() + mode.slice(1)}
    </span>
  )
}

function formatCustomValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}

const ITEMS_PER_PAGE = 10

function buildExportRows(
  registrations: EventRegistration[],
  hasRoleField: boolean,
  hasModeField: boolean
) {
  return registrations.map((reg) => {
    const custom = (reg.custom_fields || {}) as Record<string, unknown>
    const row: Record<string, string> = {
      "Registration ID": `deessa-${reg.id.slice(0, 6).toUpperCase()}`,
      Name: reg.full_name || "",
      Email: reg.email || "",
      Phone: reg.phone || "",
      Status: reg.status || "",
      "Payment Status": reg.payment_status || "",
      "Payment Method": reg.payment_method || "",
      Amount: reg.payment_amount
        ? `${reg.payment_currency || "NPR"} ${Number(reg.payment_amount).toLocaleString()}`
        : "",
      "Payment Provider": reg.payment_provider || "",
      Registered: new Date(reg.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }
    if (hasRoleField) {
      row["Role"] = formatCustomValue(custom.role)
    }
    if (hasModeField) {
      row["Mode"] = formatCustomValue(custom.attendance_mode || custom.mode)
    }
    // Include custom fields
    for (const [key, val] of Object.entries(custom)) {
      if (!["role", "attendance_mode", "mode"].includes(key)) {
        row[key] = formatCustomValue(val)
      }
    }
    return row
  })
}

function downloadFile(data: Blob, filename: string) {
  const url = URL.createObjectURL(data)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function exportToCsv(rows: Record<string, string>[], filename: string) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? ""
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`
          }
          return val
        })
        .join(",")
    ),
  ].join("\n")
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  downloadFile(blob, filename)
}

async function exportToExcel(rows: Record<string, string>[], filename: string) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Registrations")

  // Add header row
  const headerRow = sheet.addRow(headers.map((h) => h.toUpperCase()))

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0B5F8A" },
    }
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
    }
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    }
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF094A72" } },
    }
  })
  headerRow.height = 24

  // Add data rows
  rows.forEach((row, idx) => {
    const dataRow = sheet.addRow(headers.map((h) => row[h] ?? ""))
    const isEven = idx % 2 === 0

    dataRow.eachCell((cell, colNumber) => {
      const headerName = headers[colNumber - 1]
      const val = String(cell.value ?? "")
      const isStatusCol = headerName === "Status" || headerName === "Payment Status"

      let fontColor = "FF1E293B"
      if (isStatusCol) {
        if (val === "Confirmed" || val === "Paid") fontColor = "FF15803D"
        else if (val === "Cancelled" || val === "Failed") fontColor = "FFDC2626"
        else if (val === "Pending" || val === "Unpaid" || val === "Under Review") fontColor = "FFD97706"
      }

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "FFF8FAFC" : "FFFFFFFF" },
      }
      cell.font = {
        color: { argb: fontColor },
        size: 10,
      }
      cell.alignment = {
        vertical: "middle",
      }
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      }
    })
  })

  // Auto-width columns
  sheet.columns.forEach((col, i) => {
    const header = headers[i]
    const maxDataLen = rows.reduce((max, r) => Math.max(max, String(r[header] ?? "").length), 0)
    col.width = Math.max(header.length + 4, maxDataLen + 4, 14)
  })

  sheet.views = [{ state: "frozen", ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  downloadFile(blob, filename)
}

function getPaginationPages(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | string)[] = []
  pages.push(1)

  if (current > 3) {
    pages.push("...")
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push("...")
  }

  pages.push(total)

  return pages
}

interface RegistrationsTableProps {
  eventId: string
  registrations: EventRegistration[]
  hasRoleField?: boolean
  hasModeField?: boolean
}

export function RegistrationsTable({
  eventId,
  registrations,
  hasRoleField = false,
  hasModeField = false,
}: RegistrationsTableProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [paymentProviderFilter, setPaymentProviderFilter] = useState<string>("all")

  // Responsive default: cards on mobile, table on desktop
  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia("(max-width: 767px)")
    if (mql.matches) {
      requestAnimationFrame(() => setViewMode("card"))
    }
    const handler = (e: MediaQueryListEvent) => {
      setViewMode(e.matches ? "card" : "table")
    }
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const custom = (r.custom_fields || {}) as Record<string, unknown>
        const role = formatCustomValue(custom.role)
        const mode = formatCustomValue(custom.attendance_mode || custom.mode)
        const shortId = `deessa-${r.id.slice(0, 6).toLowerCase()}`

        const matchesSearch =
          shortId.includes(q) ||
          r.full_name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q) ||
          r.status?.toLowerCase().includes(q) ||
          r.payment_status?.toLowerCase().includes(q) ||
          (hasRoleField && role.toLowerCase().includes(q)) ||
          (hasModeField && mode.toLowerCase().includes(q))

        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== "all" && r.status !== statusFilter) return false

      // Payment status filter
      if (paymentFilter !== "all" && r.payment_status !== paymentFilter) return false

      // Payment method filter
      if (paymentMethodFilter !== "all") {
        if (paymentMethodFilter === "__none__") {
          if (r.payment_method !== null && r.payment_method !== undefined) return false
        } else {
          if (r.payment_method !== paymentMethodFilter) return false
        }
      }

      // Payment provider filter
      if (paymentProviderFilter !== "all") {
        const provider = r.payment_provider || "free"
        if (provider !== paymentProviderFilter) return false
      }

      return true
    })
  }, [registrations, search, statusFilter, paymentFilter, paymentMethodFilter, paymentProviderFilter, hasRoleField, hasModeField])

  const hasActiveFilters =
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    paymentMethodFilter !== "all" ||
    paymentProviderFilter !== "all" ||
    search.trim() !== ""

  const clearFilters = () => {
    setStatusFilter("all")
    setPaymentFilter("all")
    setPaymentMethodFilter("all")
    setPaymentProviderFilter("all")
    setSearch("")
    setCurrentPage(1)
  }

  // Get unique payment providers
  const paymentProviders = useMemo(() => {
    const providers = new Set<string>()
    registrations.forEach((r) => {
      providers.add(r.payment_provider || "free")
    })
    return Array.from(providers).sort()
  }, [registrations])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleExport = useCallback(
    async (format: "csv" | "excel") => {
      const rows = buildExportRows(filtered, hasRoleField, hasModeField)
      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = `registrations-${timestamp}`

      if (format === "csv") {
        exportToCsv(rows, `${filename}.csv`)
      } else {
        await exportToExcel(rows, `${filename}.xlsx`)
      }
    },
    [filtered, hasRoleField, hasModeField]
  )

  return (
    <Card className="border-border shadow-xs overflow-hidden">
      <CardHeader className="border-b border-border bg-card px-4 sm:px-6 py-4 space-y-3">
        {/* Top Control Bar: Title, Search, View Mode Toggle & Export */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
              All Registrations
            </CardTitle>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
              {filtered.length}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID, name, email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle Pill (Table vs Card) */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center justify-center rounded-md p-1.5 transition-colors",
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Table View"
                aria-label="Table View"
              >
                <TableIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={cn(
                  "flex items-center justify-center rounded-md p-1.5 transition-colors",
                  viewMode === "card"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Card View"
                aria-label="Card View"
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0 h-9 text-xs sm:text-sm">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer text-xs sm:text-sm">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")} className="cursor-pointer text-xs sm:text-sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-muted-foreground" />
                  Export as Excel (.xlsx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filter Selects Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Filter:</span>
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
            <SelectTrigger className="w-[125px] sm:w-[135px] h-8 text-xs bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setCurrentPage(1) }}>
            <SelectTrigger className="w-[125px] sm:w-[135px] h-8 text-xs bg-background">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentMethodFilter} onValueChange={(v) => { setPaymentMethodFilter(v); setCurrentPage(1) }}>
            <SelectTrigger className="w-[125px] sm:w-[135px] h-8 text-xs bg-background">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="qr">QR Code</SelectItem>
              <SelectItem value="venue">Pay at Venue</SelectItem>
              <SelectItem value="__none__">Free / No Method</SelectItem>
            </SelectContent>
          </Select>

          {paymentProviders.length > 1 && (
            <Select value={paymentProviderFilter} onValueChange={(v) => { setPaymentProviderFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[125px] sm:w-[135px] h-8 text-xs bg-background">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {paymentProviders.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p === "free" ? "Free" : p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground ml-auto"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear filters</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-3 px-4">
            <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60">
              {hasActiveFilters ? <Filter className="size-6" /> : <Users className="size-6" />}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm sm:text-base">
                {hasActiveFilters ? "No matching registrations found" : "No attendees registered yet"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try resetting filters or search terms to see registrations."
                  : "Registrations will appear here once attendees sign up for this event."}
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs h-8">
                Clear all filters
              </Button>
            )}
          </div>
        ) : viewMode === "card" ? (
          /* Card View Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-4 sm:p-5 bg-muted/15">
            {paginated.map((reg) => {
              const custom = (reg.custom_fields || {}) as Record<string, unknown>
              const role = hasRoleField ? formatCustomValue(custom.role) : null
              const mode = hasModeField ? formatCustomValue(custom.attendance_mode || custom.mode) : null
              const shortId = `deessa-${reg.id.slice(0, 6).toUpperCase()}`

              return (
                <div
                  key={reg.id}
                  onClick={() => router.push(`/admin/events/${eventId}/registrations/${reg.id}`)}
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* Header Row: Avatar, Name, ShortId, Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                            avatarColor(reg.full_name)
                          )}
                        >
                          {getInitials(reg.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {reg.full_name}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">{shortId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <StatusBadge status={reg.status} />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="size-3 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{reg.email?.toLowerCase()}</span>
                      </div>
                      {reg.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="size-3 shrink-0 text-muted-foreground/70" />
                          <span>{reg.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Custom Attributes (Role, Attendance Mode) */}
                    {(role && role !== "—" || mode && mode !== "—") && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {role && role !== "—" && (
                          <Badge variant="outline" className="text-[10px] font-normal py-0">
                            {role}
                          </Badge>
                        )}
                        {mode && mode !== "—" && <ModeBadge mode={mode} />}
                      </div>
                    )}
                  </div>

                  {/* Footer Row: Payment & Date */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">
                        {reg.payment_amount
                          ? `${reg.payment_currency || "NPR"} ${Number(reg.payment_amount).toLocaleString()}`
                          : "Free"}
                      </span>
                      <PaymentBadge status={reg.payment_status} />
                      <PaymentMethodBadge method={reg.payment_method} />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                      <Calendar className="size-3 text-muted-foreground/60" />
                      <span>
                        {new Date(reg.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[110px] text-xs font-semibold">ID</TableHead>
                  <TableHead className="text-xs font-semibold">Attendee</TableHead>
                  <TableHead className="text-xs font-semibold">Email</TableHead>
                  <TableHead className="text-xs font-semibold">Phone</TableHead>
                  {hasRoleField && <TableHead className="text-xs font-semibold">Role</TableHead>}
                  {hasModeField && <TableHead className="text-xs font-semibold">Mode</TableHead>}
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Payment</TableHead>
                  <TableHead className="text-xs font-semibold">Method</TableHead>
                  <TableHead className="text-xs font-semibold">Amount</TableHead>
                  <TableHead className="text-xs font-semibold">Registered</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((reg) => {
                  const custom = (reg.custom_fields || {}) as Record<string, unknown>
                  const role = hasRoleField ? formatCustomValue(custom.role) : null
                  const mode = hasModeField ? formatCustomValue(custom.attendance_mode || custom.mode) : null
                  const shortId = `deessa-${reg.id.slice(0, 6).toUpperCase()}`

                  return (
                    <TableRow
                      key={reg.id}
                      onClick={() => router.push(`/admin/events/${eventId}/registrations/${reg.id}`)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                        {shortId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              avatarColor(reg.full_name)
                            )}
                          >
                            {getInitials(reg.full_name)}
                          </div>
                          <span className="font-semibold text-xs sm:text-sm text-foreground">
                            {reg.full_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {reg.email?.toLowerCase()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {reg.phone || "—"}
                      </TableCell>
                      {hasRoleField && (
                        <TableCell className="text-xs">
                          {role && role !== "—" ? (
                            <Badge variant="outline" className="font-normal text-[11px] py-0">
                              {role}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                      {hasModeField && (
                        <TableCell>
                          <ModeBadge mode={mode !== "—" ? mode : null} />
                        </TableCell>
                      )}
                      <TableCell>
                        <StatusBadge status={reg.status} />
                      </TableCell>
                      <TableCell>
                        <PaymentBadge status={reg.payment_status} />
                      </TableCell>
                      <TableCell>
                        <PaymentMethodBadge method={reg.payment_method} />
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">
                        {reg.payment_amount
                          ? `${reg.payment_currency || "NPR"} ${Number(reg.payment_amount).toLocaleString()}`
                          : "Free"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(reg.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="size-4 text-muted-foreground/60" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border px-4 sm:px-6 py-3 gap-3 text-xs text-muted-foreground bg-card">
            <p>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-medium text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
              <span className="font-medium text-foreground">{filtered.length}</span> registrations
              {search && <span className="ml-1 text-primary">({filtered.length} matching)</span>}
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-1">
                {getPaginationPages(currentPage, totalPages).map((page, i) =>
                  page === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(page as number)}
                      className={cn(
                        "h-8 w-8 text-xs font-medium",
                        currentPage === page ? "bg-primary text-primary-foreground" : ""
                      )}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 text-xs"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5 sm:ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
