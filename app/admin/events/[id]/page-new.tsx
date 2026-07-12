import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  ExternalLink,
  Eye,
  EyeOff,
  Download,
  Send,
} from "lucide-react"
import type { EventModuleEvent, EventRegistration } from "@/lib/types/events-module"

async function getEvent(id: string): Promise<EventModuleEvent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as EventModuleEvent
}

async function getRegistrations(eventId: string): Promise<EventRegistration[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
  return (data || []) as EventRegistration[]
}

const statusIcons: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle className="h-3 w-3 text-green-600" />,
  pending: <Clock className="h-3 w-3 text-yellow-600" />,
  cancelled: <XCircle className="h-3 w-3 text-red-600" />,
  expired: <XCircle className="h-3 w-3 text-gray-400" />,
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  disabled: "bg-yellow-100 text-yellow-700",
  archived: "bg-red-100 text-red-700",
}

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, registrations] = await Promise.all([
    getEvent(id),
    getRegistrations(id),
  ])

  if (!event) {
    notFound()
  }

  // Calculate statistics
  const totalRegs = registrations.length
  const confirmed = registrations.filter((r) => r.status === "confirmed").length
  const pending = registrations.filter((r) => r.status === "pending").length
  const cancelled = registrations.filter((r) => r.status === "cancelled").length
  const paidRegs = registrations.filter((r) => r.payment_status === "paid").length
  
  // Calculate revenue if paid event
  const totalRevenue = registrations
    .filter((r) => r.payment_status === "paid")
    .reduce((sum, r) => sum + (r.payment_amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">Event Dashboard & Registrations</p>
        </div>
        <div className="flex items-center gap-2">
          {event.status === "published" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/${event.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public Page
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={`/admin/events/${id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Event Status Badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className={statusColors[event.status] || ""}
        >
          {event.status === "published" && <Eye className="mr-1 h-3 w-3" />}
          {event.status === "draft" && <EyeOff className="mr-1 h-3 w-3" />}
          {event.status}
        </Badge>
        <Badge variant="outline">{event.category}</Badge>
        {event.is_free && (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            Free Event
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRegs}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{confirmed}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cancelled}</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!event.is_free && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-bold">
                    NPR {totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Revenue ({paidRegs} paid)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Registrations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Registrations</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={totalRegs === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" disabled={totalRegs === 0}>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No registrations yet</p>
                    <p className="text-sm">
                      Registrations will appear here once users start signing up.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">
                      {reg.full_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {reg.email}
                      </div>
                    </TableCell>
                    <TableCell>{reg.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[reg.status] || ""}
                      >
                        {statusIcons[reg.status]}
                        <span className="ml-1">{reg.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          reg.payment_status === "paid"
                            ? "border-green-200 text-green-700"
                            : ""
                        }
                      >
                        {reg.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(reg.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
