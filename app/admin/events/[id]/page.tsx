import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  Settings,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RegistrationsTable } from "@/components/admin/events/registrations-table"
import type { EventRegistration, EventModuleEvent } from "@/lib/types/events-module"
import type { FormSchema } from "@/lib/types/event-form-schema"

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

async function getFormSchemaFields(eventId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("event_form_schemas")
    .select("form_config")
    .eq("event_id", eventId)
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data?.form_config) return []

  const schema = data.form_config as FormSchema
  const fieldIds: string[] = []
  for (const step of schema.steps || []) {
    for (const field of step.fields || []) {
      if (field.storage !== "core") {
        fieldIds.push(field.id)
      }
    }
  }
  return fieldIds
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 font-semibold border-0",
  published: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 font-semibold border-0",
  disabled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 font-semibold border-0",
  archived: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-semibold border-0",
}

export default async function EventRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, registrations, revenue, formFields] = await Promise.all([
    getEvent(id),
    getRegistrations(id),
    getRevenue(id),
    getFormSchemaFields(id),
  ])

  if (!event) {
    notFound()
  }

  const hasRoleField = formFields.some(
    (f) => f.toLowerCase() === "role" || f.toLowerCase().includes("role")
  )
  const hasModeField = formFields.some(
    (f) =>
      f.toLowerCase() === "attendance_mode" ||
      f.toLowerCase() === "mode" ||
      f.toLowerCase().includes("mode") ||
      f.toLowerCase().includes("attendance")
  )

  const total = registrations.length
  const confirmed = registrations.filter((r) => r.status === "confirmed").length
  const unpaid = registrations.filter(
    (r) => r.payment_status !== "paid" && r.status !== "cancelled"
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/events"
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              ← Back to Events
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Registrations</h1>
            <Badge className={cn("text-xs font-semibold px-2.5 py-0.5", statusColors[event.status] || "bg-slate-100 text-slate-700")}>
              {event.status}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{event.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {event.status === "published" && (
            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs sm:text-sm">
              <Link href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5 text-muted-foreground" />
                View Public
              </Link>
            </Button>
          )}
          <Link
            href={`/admin/events/${id}/settings`}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-all shadow-xs"
          >
            <Settings className="size-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Registrations</p>
              <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Users className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-xl sm:text-3xl font-bold tracking-tight text-foreground">{total}</p>
            <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground truncate">All time attendees</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Confirmed</p>
              <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-xl sm:text-3xl font-bold tracking-tight text-foreground">{confirmed}</p>
            <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground truncate">
              {total > 0 ? Math.round((confirmed / total) * 100) : 0}% confirmation rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Awaiting Payment</p>
              <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-xl sm:text-3xl font-bold tracking-tight text-foreground">{unpaid}</p>
            <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground truncate">Pending completion</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Revenue</p>
              <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="mt-2 min-w-0">
              {!event.is_free && (
                <span className="block text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">
                  NPR
                </span>
              )}
              <p
                className="text-xl sm:text-3xl font-bold tracking-tight text-foreground truncate leading-tight"
                title={event.is_free ? "Free" : `NPR ${revenue.toLocaleString()}`}
              >
                {event.is_free ? "Free" : revenue.toLocaleString()}
              </p>
            </div>
            <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground truncate">
              {event.is_free ? "No charges" : "Total collected"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table & Card View */}
      <RegistrationsTable
        eventId={id}
        registrations={registrations}
        hasRoleField={hasRoleField}
        hasModeField={hasModeField}
      />
    </div>
  )
}
