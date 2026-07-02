"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
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
  return <Badge className="bg-slate-100 text-slate-400 hover:bg-slate-100 text-[10px] px-2">Unpaid</Badge>
}

function ModeBadge({ mode }: { mode?: string | null }) {
  if (!mode) return <span className="text-xs text-muted-foreground">—</span>
  const isOnline = mode.toLowerCase().includes("online")
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isOnline
          ? "bg-blue-100 text-blue-700"
          : "bg-primary/10 text-primary"
      }`}
    >
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

  const filtered = useMemo(() => {
    if (!search.trim()) return registrations
    const q = search.toLowerCase()
    return registrations.filter((r) => {
      const custom = (r.custom_fields || {}) as Record<string, unknown>
      const role = formatCustomValue(custom.role)
      const mode = formatCustomValue(custom.attendance_mode || custom.mode)

      return (
        r.full_name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q) ||
        r.payment_status?.toLowerCase().includes(q) ||
        (hasRoleField && role.toLowerCase().includes(q)) ||
        (hasModeField && mode.toLowerCase().includes(q))
      )
    })
  }, [registrations, search, hasRoleField, hasModeField])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const totalCols = 5 + (hasRoleField ? 1 : 0) + (hasModeField ? 1 : 0) + 2 // name, email, phone, status, payment + role? + mode? + amount, registered

  return (
    <Card>
      <CardHeader className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">All Registrations</CardTitle>
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
                      {search ? (
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
