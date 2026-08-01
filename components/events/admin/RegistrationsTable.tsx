"use client"

import { useState, useMemo, useCallback } from "react"
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
} from "lucide-react"
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
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
  "bg-red-100 text-red-700",
  "bg-pink-100 text-pink-700",
]

function avatarColor(name: string | null | undefined) {
  let hash = 0
  for (const c of name ?? "") hash = (hash + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed")
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Confirmed</Badge>
  if (status === "cancelled")
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>
  if (status === "expired")
    return <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100">Expired</Badge>
  return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
}

function PaymentBadge({ status }: { status?: string | null }) {
  if (status === "paid")
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] px-2">Paid</Badge>
  if (status === "failed")
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px] px-2">Failed</Badge>
  if (status === "refunded")
    return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-[10px] px-2">Refunded</Badge>
  if (status === "review")
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px] px-2">Under Review</Badge>
  return <Badge className="bg-slate-100 text-slate-400 hover:bg-slate-100 text-[10px] px-2">Unpaid</Badge>
}

function PaymentMethodBadge({ method }: { method?: string | null }) {
  if (!method) return <span className="text-xs text-muted-foreground">—</span>
  if (method === "venue") return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
      Pay at Venue
    </span>
  )
  if (method === "qr") return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700">
      QR Code
    </span>
  )
  if (method === "online") return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700">
      Online
    </span>
  )
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600">
      {method.charAt(0).toUpperCase() + method.slice(1)}
    </span>
  )
}

function ModeBadge({ mode }: { mode?: string | null }) {
  if (!mode) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
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
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
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

  // Style header row - brand blue bg, white bold text
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

  // Freeze header row
  sheet.views = [{ state: "frozen", ySplit: 1 }]

  // Generate buffer and download
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
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [paymentProviderFilter, setPaymentProviderFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const custom = (r.custom_fields || {}) as Record<string, unknown>
        const role = formatCustomValue(custom.role)
        const mode = formatCustomValue(custom.attendance_mode || custom.mode)

        const matchesSearch =
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

  const hasActiveFilters = statusFilter !== "all" || paymentFilter !== "all" || paymentMethodFilter !== "all" || paymentProviderFilter !== "all" || search.trim() !== ""

  const clearFilters = () => {
    setStatusFilter("all")
    setPaymentFilter("all")
    setPaymentMethodFilter("all")
    setPaymentProviderFilter("all")
    setSearch("")
  }

  // Get unique payment providers from registrations
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

  const totalCols = 6 + (hasRoleField ? 1 : 0) + (hasModeField ? 1 : 0) + 2 // name, email, phone, method, status, payment + role? + mode? + amount, registered

  return (
    <Card>
      <CardHeader className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">All Registrations</CardTitle>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filters:</span>
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
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
            <SelectTrigger className="w-[140px] h-8 text-xs">
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
            <SelectTrigger className="w-[140px] h-8 text-xs">
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
              <SelectTrigger className="w-[140px] h-8 text-xs">
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
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}

          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {filtered.length} of {registrations.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                {hasRoleField && <TableHead>Role</TableHead>}
                {hasModeField && <TableHead>Mode</TableHead>}
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={totalCols} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      {hasActiveFilters ? (
                        <>
                          <Filter className="size-10 text-muted-foreground/40" />
                          <p className="font-medium">No matching registrations</p>
                          <p className="text-sm">Try adjusting your filters or search term</p>
                          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                            <X className="h-4 w-4 mr-1.5" />
                            Clear all filters
                          </Button>
                        </>
                      ) : search ? (
                        <>
                          <Search className="size-10 text-muted-foreground/40" />
                          <p className="font-medium">No registrations found</p>
                          <p className="text-sm">Try a different search term</p>
                        </>
                      ) : (
                        <>
                          <Users className="size-10 text-muted-foreground/40" />
                          <p className="font-medium">No registrations yet</p>
                          <p className="text-sm">Registrations will appear here once users start signing up.</p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((reg) => {
                  const custom = (reg.custom_fields || {}) as Record<string, unknown>
                  const role = hasRoleField ? formatCustomValue(custom.role) : null
                  const mode = hasModeField
                    ? formatCustomValue(custom.attendance_mode || custom.mode)
                    : null

                  return (
                    <TableRow
                      key={reg.id}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/events/${eventId}/registrations/${reg.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          router.push(`/admin/events/${eventId}/registrations/${reg.id}`)
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`View ${reg.full_name}'s registration`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(reg.full_name)}`}
                          >
                            {getInitials(reg.full_name)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{reg.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reg.email?.toLowerCase()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reg.phone || "—"}
                      </TableCell>
                      {hasRoleField && (
                        <TableCell className="text-sm">
                          {role !== "—" ? (
                            <Badge variant="outline" className="font-normal">
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
                        <PaymentMethodBadge method={reg.payment_method} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={reg.status} />
                      </TableCell>
                      <TableCell>
                        <PaymentBadge status={reg.payment_status} />
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {reg.payment_amount
                          ? `${reg.payment_currency || "NPR"} ${Number(reg.payment_amount).toLocaleString()}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(reg.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
            <p>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
              {filtered.length} registrations
              {search && (
                <span className="ml-1 text-primary">
                  ({filtered.length} match{filtered.length !== 1 ? "es" : ""})
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3 w-3" />
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
                      className={`h-7 w-7 text-xs ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
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
                className="h-7 px-2 text-xs"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
