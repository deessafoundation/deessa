import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  MapPin,
  FileText,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Users,
} from "lucide-react"
import type { EventModuleEvent } from "@/lib/types/events-module"
import { EventSettingsTabs } from "../../../events/admin/EventSettingsTabs"

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

async function getRegistrationStats(eventId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_registrations")
    .select("status, payment_status")
    .eq("event_id", eventId)

  const registrations = data || []
  const total = registrations.length
  const confirmed = registrations.filter((r) => r.status === "confirmed").length
  const pending = registrations.filter((r) => r.status === "pending").length
  const cancelled = registrations.filter((r) => r.status === "cancelled").length

  return { total, confirmed, pending, cancelled }
}

async function getRevenue(eventId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_registrations")
    .select("payment_amount")
    .eq("event_id", eventId)
    .eq("payment_status", "paid")

  if (!data) return 0
  return data.reduce((sum, reg) => sum + (reg.payment_amount || 0), 0)
}

async function getFormStatus(eventId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_form_schemas")
    .select("version, is_active")
    .eq("event_id", eventId)
    .order("version", { ascending: false })
    .limit(1)
    .single()

  if (!data) return "No form created"
  if (data.is_active) return `Active (v${data.version})`
  return `Draft (v${data.version})`
}

async function getTicketCount(eventId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from("event_ticket_types")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("is_active", true)
  return count || 0
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  disabled: "bg-yellow-100 text-yellow-700",
  archived: "bg-red-100 text-red-700",
}

interface EventSettingsWrapperProps {
  eventId: string
  children: React.ReactNode
}

export async function EventSettingsWrapper({
  eventId,
  children,
}: EventSettingsWrapperProps) {
  const event = await getEvent(eventId)

  if (!event) {
    notFound()
  }

  const [stats, revenue, formStatus, ticketCount] = await Promise.all([
    getRegistrationStats(eventId),
    getRevenue(eventId),
    getFormStatus(eventId),
    getTicketCount(eventId),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Event Settings</h1>
        <p className="text-muted-foreground">{event.title}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.confirmed}</p>
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
                <p className="text-2xl font-bold">{stats.pending}</p>
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
                <p className="text-2xl font-bold">{stats.cancelled}</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {event.is_free ? "Free" : `NPR ${revenue.toLocaleString()}`}
                </p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Event Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Free
              </Badge>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Event Date</span>
              </div>
              <p className="font-medium">
                {new Date(event.event_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {event.event_time && ` • ${event.event_time}`}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </div>
              <p className="font-medium">{event.location}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Registration Form</span>
              </div>
              <p className="font-medium">{formStatus}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Ticket Types</span>
              </div>
              <p className="font-medium">
                {event.is_free ? "Free Event" : `${ticketCount} Active`}
              </p>
            </div>
          </div>

          {event.status === "published" && (
            <div className="pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${event.slug}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public Page
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <EventSettingsTabs eventId={eventId} />

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  )
}
