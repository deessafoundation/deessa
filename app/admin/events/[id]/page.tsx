import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  Settings,
  DollarSign,
  CheckCircle,
  Clock,
} from "lucide-react"
import { RegistrationsTable } from "@/components/admin/events/registrations-table"
import type { EventRegistration, EventModuleEvent } from "@/lib/types/events-module"
import type { FormSchema } from "@/lib/types/conference-form-schema"

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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
          <p className="text-sm text-muted-foreground">{event.title}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/events/${id}/settings`}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all"
          >
            <Settings className="size-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{total}</p>
            <p className="mt-1 text-xs text-muted-foreground">All time registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{confirmed}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {total > 0 ? Math.round((confirmed / total) * 100) : 0}% confirmation rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Awaiting Payment</p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Clock className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{unpaid}</p>
            <p className="mt-1 text-xs text-muted-foreground">Payment not yet received</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <DollarSign className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {event.is_free ? "Free" : `NPR ${revenue.toLocaleString()}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Total collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table */}
      <RegistrationsTable
        eventId={id}
        registrations={registrations}
        hasRoleField={hasRoleField}
        hasModeField={hasModeField}
      />
    </div>
  )
}
