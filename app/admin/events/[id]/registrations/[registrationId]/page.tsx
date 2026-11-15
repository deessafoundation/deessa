import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Mail,
  Calendar,
  Users,
  ChevronRight,
  MapPin,
  Clock,
  StickyNote,
  FileJson,
  Ticket,
  CheckCircle,
  CheckCircle2,
  CreditCard,
  Camera,
  RotateCcw,
  DollarSign,
  MailCheck,
  MailX,
  XCircle,
  LogIn,
  AlertCircle,
  UserPlus,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getEventRegistrationDetail, getEventPaymentEvents } from "@/lib/actions/events-module/event-registration"
import { DetailRow } from "@/components/ui/detail-row"
import { EventStatusActions } from "@/components/admin/events/event-status-actions"
import { EventCheckInButton } from "@/components/admin/events/event-check-in-button"
import { EventRegistrationNotes } from "@/components/admin/events/event-registration-notes"
import { EventRegistrationEmailActions } from "@/components/admin/events/event-registration-email-actions"
import { EventDeleteRegistrationButton } from "@/components/admin/events/event-delete-registration-button"
import { EventCommunicationLog } from "@/components/admin/events/event-communication-log"
import { EventPaymentInfo } from "@/components/admin/events/event-payment-info"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { cn } from "@/lib/utils"
import type { FormSchema, FormStep, FormField } from "@/lib/types/event-form-schema"

function getInitials(name: string | null | undefined) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed")
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 hover:bg-green-100 text-xs sm:text-sm px-3 py-1 font-semibold border-0">
        Confirmed
      </Badge>
    )
  if (status === "cancelled")
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 hover:bg-red-100 text-xs sm:text-sm px-3 py-1 font-semibold border-0">
        Cancelled
      </Badge>
    )
  if (status === "expired")
    return (
      <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 text-xs sm:text-sm px-3 py-1 font-semibold border-0">
        Expired
      </Badge>
    )
  return (
    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 text-xs sm:text-sm px-3 py-1 font-semibold border-0">
      Pending
    </Badge>
  )
}

function formatTs(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function daysUntil(target: Date): number {
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string; registrationId: string }>
}) {
  const { id, registrationId } = await params
  const reg = await getEventRegistrationDetail(registrationId)

  if (!reg || reg.event_id !== id) {
    notFound()
  }

  const event = reg.event as {
    id: string
    title: string
    slug: string
    description: string
    event_date: string
    event_time: string | null
    event_end_date: string | null
    location: string
    venue_name: string | null
    address: string | null
    status: string
    category: string
    is_free: boolean
    contact_email: string | null
  } | null

  const ticketType = reg.ticket_type as {
    id: string
    name: string
    price: number
    currency: string
  } | null

  // Fetch form schema for field labels
  let formSteps: FormStep[] | null = null
  if (reg.form_schema_version) {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data: schemaData } = await supabase
      .from("event_form_schemas")
      .select("form_config")
      .eq("event_id", id)
      .eq("version", reg.form_schema_version)
      .maybeSingle()

    if (schemaData?.form_config) {
      const schema = schemaData.form_config as FormSchema
      formSteps = schema.steps || []
    }
  }

  const shortId = `deessa-${reg.id.slice(0, 6).toUpperCase()}`
  const registeredAt = new Date(reg.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const registeredTime = new Date(reg.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const initials = getInitials(reg.full_name)

  const eventDate = new Date(event?.event_date || Date.now())
  const days = daysUntil(eventDate)

  // Fetch payment events for timeline
  const paymentEvents = await getEventPaymentEvents(registrationId)

  // Generate signed URL for payment screenshot (private bucket)
  let paymentScreenshotSignedUrl: string | null = null
  const regAny = reg as Record<string, unknown>
  if (regAny.payment_screenshot_url) {
    try {
      const { data: signed } = await createServiceRoleClient()
        .storage.from("event-payment-screenshots")
        .createSignedUrl(regAny.payment_screenshot_url as string, 60 * 60) // 1 hour expiry
      paymentScreenshotSignedUrl = signed?.signedUrl ?? null
    } catch (err) {
      console.error("Failed to generate signed URL for payment screenshot:", err)
    }
  }

  // Build timeline
  type TimelineItem = {
    icon: LucideIcon
    label: string
    ts: string
    iconBg: string
    iconColor: string
  }

  const timeline: TimelineItem[] = [
    {
      icon: UserPlus,
      label: "Registration submitted",
      ts: formatTs(reg.created_at),
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ]

  if (reg.last_registration_email_sent_at) {
    timeline.push({
      icon: Mail,
      label: "Registration email sent",
      ts: formatTs(reg.last_registration_email_sent_at),
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    })
  }

  // QR payment screenshot uploaded
  if (regAny.payment_screenshot_url) {
    timeline.push({
      icon: Camera,
      label: "Payment screenshot uploaded",
      ts: formatTs(reg.created_at),
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    })
  }

  if (reg.payment_initiated_at && reg.payment_id) {
    const provider = reg.payment_provider
      ? reg.payment_provider.charAt(0).toUpperCase() + reg.payment_provider.slice(1)
      : "Gateway"
    timeline.push({
      icon: CreditCard,
      label: `Payment initiated via ${provider}`,
      ts: formatTs(reg.payment_initiated_at),
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    })
  }

  if (reg.status === "pending" && reg.payment_status !== "paid" && reg.expires_at) {
    timeline.push({
      icon: Clock,
      label: `Awaiting payment — expires ${formatTs(reg.expires_at)}`,
      ts: "",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    })
  }

  if (reg.payment_status === "failed" && reg.payment_failed_at) {
    timeline.push({
      icon: AlertCircle,
      label: "Payment attempt failed",
      ts: formatTs(reg.payment_failed_at),
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    })
  }

  if (reg.payment_status === "refunded") {
    timeline.push({
      icon: RotateCcw,
      label: "Payment refunded",
      ts: reg.payment_paid_at ? formatTs(reg.payment_paid_at) : "—",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    })
  }

  if (reg.payment_id === "manual:admin-override") {
    const by = reg.payment_override_by ? ` by ${reg.payment_override_by}` : ""
    timeline.push({
      icon: DollarSign,
      label: `Payment manually marked as paid${by}`,
      ts: reg.payment_paid_at ? formatTs(reg.payment_paid_at) : "—",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    })
  }

  if (reg.payment_status === "paid" && reg.payment_id && reg.payment_id !== "manual:admin-override") {
    const provider = reg.payment_provider
      ? reg.payment_provider.charAt(0).toUpperCase() + reg.payment_provider.slice(1)
      : "Gateway"
    timeline.push({
      icon: CheckCircle2,
      label: `Payment verified via ${provider}`,
      ts: reg.payment_paid_at ? formatTs(reg.payment_paid_at) : "—",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    })
  }

  if (reg.confirmed_at) {
    const by = reg.confirmed_by ? ` by ${reg.confirmed_by}` : ""
    timeline.push({
      icon: CheckCircle,
      label: `Registration confirmed${by}`,
      ts: formatTs(reg.confirmed_at),
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    })
  }

  if (reg.last_confirmation_email_sent_at) {
    timeline.push({
      icon: MailCheck,
      label: "Confirmation email sent",
      ts: formatTs(reg.last_confirmation_email_sent_at),
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    })
  }

  if (reg.cancelled_at) {
    const by = reg.cancelled_by ? ` by ${reg.cancelled_by}` : ""
    timeline.push({
      icon: XCircle,
      label: `Registration cancelled${by}`,
      ts: formatTs(reg.cancelled_at),
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    })
  }

  if (reg.last_cancellation_email_sent_at) {
    timeline.push({
      icon: MailX,
      label: "Cancellation email sent",
      ts: formatTs(reg.last_cancellation_email_sent_at),
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    })
  }

  if (reg.status === "expired") {
    timeline.push({
      icon: Clock,
      label: "Registration expired — payment not received in time",
      ts: reg.expires_at ? formatTs(reg.expires_at) : "—",
      iconBg: "bg-slate-500/10",
      iconColor: "text-slate-600 dark:text-slate-400",
    })
  }

  if (reg.checked_in_at) {
    const by = reg.checked_in_by ? ` by ${reg.checked_in_by}` : ""
    timeline.push({
      icon: LogIn,
      label: `Checked in${by}`,
      ts: formatTs(reg.checked_in_at),
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    })
  }

  timeline.reverse()

  // Extract custom fields
  const customFields = (reg.custom_fields || {}) as Record<string, unknown>

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-wrap">
        <Link href="/admin/events" className="hover:text-foreground transition-colors font-medium">
          Events
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
        {event && (
          <>
            <Link
              href={`/admin/events/${id}`}
              className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-xs font-medium"
              title={event.title}
            >
              {event.title}
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
          </>
        )}
        <Link href={`/admin/events/${id}`} className="hover:text-foreground transition-colors">
          Registrations
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
        <span className="font-mono text-foreground font-semibold">{shortId}</span>
      </nav>

      {/* Header Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex size-12 sm:size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-base sm:text-lg font-bold text-primary">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                  {reg.full_name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{reg.email?.toLowerCase()}</p>
                <p className="mt-0.5 sm:mt-1 font-mono text-xs text-muted-foreground">
                  {shortId}
                </p>
                {reg.admin_notes && (
                  <p className="mt-1 text-xs text-amber-600 italic line-clamp-1">
                    📌 {reg.admin_notes}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border/60">
              <div className="flex items-center gap-2">
                <StatusBadge status={reg.status} />
                {reg.checked_in_at && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 font-semibold border-0 text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Checked In
                  </Badge>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground text-right">
                Registered {registeredAt} at {registeredTime}
              </p>
              {reg.registration_source && (
                <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                  Source: {reg.registration_source}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Top Check-in Action */}
      <div className="block lg:hidden">
        <EventCheckInButton
          registrationId={registrationId}
          isCheckedIn={!!reg.checked_in_at}
          checkedInAt={reg.checked_in_at}
          checkedInBy={reg.checked_in_by}
        />
      </div>

      {/* Registration Context */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border px-4 sm:px-6 py-3.5 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Calendar className="size-4 text-primary" />
            Registration Context
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Event
              </p>
              <div>
                <p className="font-semibold text-foreground text-sm sm:text-base">{event!.title}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {eventDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {event!.event_time && ` • ${event!.event_time}`}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{event!.location}</p>
              </div>
            </div>
            {reg.form_schema_version && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Form Used
                </p>
                <div>
                  <Badge
                    variant="outline"
                    className="bg-muted text-foreground border-border font-mono text-xs"
                  >
                    Version {reg.form_schema_version}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Steps */}
          {formSteps ? (
            formSteps.map((step) => {
              const visibleFields = (step.fields || []).filter(
                (f: FormField) => f.type !== "heading" && f.type !== "paragraph"
              )
              if (visibleFields.length === 0) return null

              return (
                <Card key={step.id}>
                  <CardHeader className="border-b border-border px-6 py-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileJson className="size-4 text-muted-foreground" />
                      {step.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-2">
                    {visibleFields.map((field: FormField) => {
                      // Core DB columns that exist on event_registrations table
                      const DB_COLUMNS: Record<string, string> = {
                        full_name: "full_name",
                        email: "email",
                        phone: "phone",
                        consent_terms: "consent_terms",
                        consent_marketing: "consent_marketing",
                      }

                      const dbCol = DB_COLUMNS[field.id] || (field as FormField & { coreColumn?: string }).coreColumn
                      let value: unknown
                      if (dbCol && reg[dbCol] !== undefined) {
                        value = reg[dbCol]
                      } else {
                        value = customFields[field.id]
                      }

                      let displayValue: string | string[] | null = null
                      if (value === undefined || value === null || value === "") {
                        displayValue = "—"
                      } else if (Array.isArray(value)) {
                        displayValue = value.length > 0 ? value.map(String) : ["—"]
                      } else if (typeof value === "boolean") {
                        displayValue = value ? "Yes" : "No"
                      } else {
                        displayValue = String(value)
                      }

                      return (
                        <DetailRow
                          key={field.id}
                          label={field.label}
                          value={displayValue}
                        />
                      )
                    })}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            /* Fallback: no schema — show raw custom fields */
            Object.keys(customFields).length > 0 && (
              <Card>
                <CardHeader className="border-b border-border px-6 py-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileJson className="size-4 text-muted-foreground" />
                    Form Responses
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-2">
                  {Object.entries(customFields).map(([key, value]) => {
                    if (value === undefined || value === null) return null
                    const label = key
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")

                    let displayValue: string | string[] | null = null
                    if (Array.isArray(value)) {
                      displayValue = value.map(String)
                    } else if (typeof value === "boolean") {
                      displayValue = value ? "Yes" : "No"
                    } else {
                      displayValue = String(value)
                    }

                    return (
                      <DetailRow key={key} label={label} value={displayValue} />
                    )
                  })}
                </CardContent>
              </Card>
            )
          )}

          {/* Ticket Info */}
          {ticketType && (
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Ticket className="size-4 text-muted-foreground" />
                  Ticket Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-2">
                <DetailRow label="Ticket Type" value={ticketType.name} />
                <DetailRow
                  label="Price"
                  value={`${ticketType.currency} ${ticketType.price}`}
                />
                {reg.payment_amount && (
                  <DetailRow
                    label="Amount Paid"
                    value={`${reg.payment_currency || "NPR"} ${Number(reg.payment_amount).toLocaleString()}`}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Consent */}
          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-muted-foreground" />
                Consent & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-2">
              <DetailRow
                label="Terms & Conditions"
                value={reg.consent_terms ? "Agreed" : "Not agreed"}
              />
              <DetailRow
                label="Marketing Consent"
                value={reg.consent_marketing ? "Yes" : "No"}
              />
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-muted-foreground" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative flex flex-col gap-0">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/80 shadow-xs",
                          item.iconBg,
                          item.iconColor
                        )}
                      >
                        <item.icon className="size-4" />
                      </div>
                      {i < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-border my-1.5" />
                      )}
                    </div>
                    <div className="pb-5 pt-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {item.label}
                      </p>
                      {item.ts && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.ts}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Communication Log */}
          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4 text-muted-foreground" />
                Communication Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <EventCommunicationLog registrationId={registrationId} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Check-in (Desktop) */}
          <div className="hidden lg:block">
            <EventCheckInButton
              registrationId={registrationId}
              isCheckedIn={!!reg.checked_in_at}
              checkedInAt={reg.checked_in_at}
              checkedInBy={reg.checked_in_by}
            />
          </div>

          {/* Manage Registration */}
          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="text-base">Manage Registration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 rounded-xl bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Current Status
                </p>
                <StatusBadge status={reg.status} />
              </div>
              <EventStatusActions
                registrationId={registrationId}
                currentStatus={reg.status}
                paymentStatus={reg.payment_status}
                fullName={reg.full_name}
                email={reg.email}
              />

              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Danger Zone
                </p>
                <EventDeleteRegistrationButton
                  registrationId={registrationId}
                  eventId={id}
                  shortId={shortId}
                  fullName={reg.full_name}
                  email={reg.email}
                  status={reg.status}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <EventPaymentInfo
            registrationId={registrationId}
            paymentStatus={reg.payment_status}
            paymentAmount={reg.payment_amount}
            paymentCurrency={reg.payment_currency}
            paymentProvider={reg.payment_provider}
            paymentId={reg.payment_id}
            stripeSessionId={(reg as Record<string, unknown>).stripe_session_id as string | null ?? null}
            khaltiPidx={(reg as Record<string, unknown>).khalti_pidx as string | null ?? null}
            esewaTransactionUuid={(reg as Record<string, unknown>).esewa_transaction_uuid as string | null ?? null}
            paymentInitiatedAt={reg.payment_initiated_at}
            paymentPaidAt={reg.payment_paid_at}
            paymentFailedAt={reg.payment_failed_at}
            paymentReviewAt={(reg as Record<string, unknown>).payment_review_at as string | null ?? null}
            paymentOverrideBy={(reg as Record<string, unknown>).payment_override_by as string | null ?? null}
            expiresAt={reg.expires_at}
            email={reg.email}
            fullName={reg.full_name}
            paymentEvents={paymentEvents}
            paymentScreenshotUrl={paymentScreenshotSignedUrl}
          />

          {/* Event Info + Quick Actions — combined like conference */}
          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="size-4 text-muted-foreground" />
                Event Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
                  <Calendar className="size-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {eventDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {event?.event_time && ` • ${event.event_time}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
                  <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Venue
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {event?.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                  <Clock className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/80 dark:text-amber-400/80">
                      Countdown
                    </p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                      {days > 0 ? `${days} days to go` : "Event has started!"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Quick Actions
                </p>
                <EventRegistrationEmailActions
                  registrationId={registrationId}
                  eventId={id}
                  eventTitle={event?.title || ""}
                  shortId={shortId}
                  email={reg.email}
                  status={reg.status}
                  fullName={reg.full_name}
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="size-4 text-muted-foreground" />
                Admin Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <EventRegistrationNotes
                registrationId={registrationId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
