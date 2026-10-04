"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  CreditCard,
  Calendar,
  MapPin,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  ImageIcon,
  LayoutList,
  FormInput,
  Mail,
  Pause,
  Play,
  Archive,
  RotateCcw,
  Trash2,
  Copy,
  ChevronRight,
  AlertTriangle,
  Megaphone,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  ClipboardList,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { EventDetailsForm } from "../../admin/events/event-details-form"
import { EventMediaForm } from "./EventMediaForm"
import { EventLocationForm } from "./EventLocationForm"
import { AgendaEditor } from "../../admin/events/agenda-editor"
import { PricingEditor } from "./PricingEditor"
import { EventFormBuilder } from "./EventFormBuilder"
import { EmailTemplateEditor } from "../../admin/events/email-template-editor"
import {
  setEventStatus,
  deleteEvent,
  duplicateEvent,
} from "@/lib/actions/events-module/event-crud"
import { notifications } from "@/lib/notifications"
import type {
  EventModuleEvent,
  EventTicketType,
  EventAgendaItem,
  EventEmailTemplate,
  EventStatus,
} from "@/lib/types/events-module"
import type { FormSchema } from "@/lib/types/conference-form-schema"

interface SettingsData {
  event: EventModuleEvent
  stats: {
    total: number
    confirmed: number
    pending: number
    cancelled: number
    revenue: number
    formStatus: string
    formVersion: number
    ticketTypes: number
    isFree: boolean
  }
  ticketTypes: EventTicketType[]
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  disabled: "bg-yellow-100 text-yellow-700",
  archived: "bg-red-100 text-red-700",
}

const statusLabels: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  disabled: "Disabled",
  archived: "Archived",
}

const tabs = [
  { label: "Details", id: "details", icon: FileText },
  { label: "Media", id: "media", icon: ImageIcon },
  { label: "Location", id: "location", icon: MapPin },
  { label: "Agenda", id: "agenda", icon: LayoutList },
  { label: "Tickets & Pricing", id: "pricing", icon: CreditCard },
  { label: "Registration Form", id: "form-builder", icon: FormInput },
  { label: "Email Templates", id: "email-templates", icon: Mail },
  { label: "Promote", id: "promote", icon: Megaphone },
]

interface EventSettingsClientProps {
  eventId: string
}

export function EventSettingsClient({ eventId }: EventSettingsClientProps) {
  const router = useRouter()
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [agendaItems, setAgendaItems] = useState<EventAgendaItem[]>([])
  const [pricingItems, setPricingItems] = useState<EventTicketType[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EventEmailTemplate[]>([])
  const [emailTemplatesVersion, setEmailTemplatesVersion] = useState(0)
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null)
  const [formSchemaVersion, setFormSchemaVersion] = useState(0)
  const [fetchedTabs, setFetchedTabs] = useState<Set<string>>(new Set())
  const [formSchemaLoaded, setFormSchemaLoaded] = useState(false)
  const [registerConfig, setRegisterConfig] = useState<{
    enabled: boolean
    label: string
    href: string
    eventId: string | null
    eventTitle: string | null
  } | null>(null)
  const [registerConfigLoading, setRegisterConfigLoading] = useState(false)
  const [registerConfigSaving, setRegisterConfigSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/events/${eventId}/settings`)
        const json = await res.json()
        if (json.error) {
          notifications.showError({ description: json.error })
          return
        }
        setData(json)
      } catch {
        notifications.showError({ description: "Failed to load event settings" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [eventId])

  // Fetch form schema on mount ONCE
  useEffect(() => {
    if (!data || formSchemaLoaded) return
    
    fetch(`/api/admin/events/${eventId}/form-schema`)
      .then((r) => r.json())
      .then((json) => {
        if (json.schema) {
          setFormSchema(json.schema)
        } else {
          // No schema exists, use default
          setFormSchema({
            version: 1,
            steps: [
              {
                id: "personal",
                label: "Personal Details",
                description: "Please provide your contact information",
                order: 0,
                fields: [
                  {
                    id: "full_name",
                    type: "text",
                    label: "Full Name",
                    required: true,
                    storage: "core",
                    order: 0,
                  },
                  {
                    id: "email",
                    type: "email",
                    label: "Email Address",
                    required: true,
                    storage: "core",
                    order: 1,
                  },
                  {
                    id: "phone",
                    type: "tel",
                    label: "Phone Number",
                    required: false,
                    storage: "core",
                    order: 2,
                  },
                ],
              },
            ],
            metadata: {
              createdBy: "system",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          })
        }
        setFormSchemaLoaded(true)
      })
      .catch(() => {
        // On error, still set loaded to true with default schema
        setFormSchemaLoaded(true)
      })
  }, [eventId, data, formSchemaLoaded])

  useEffect(() => {
    if (!data) return
    if (activeTab === "agenda" && !fetchedTabs.has("agenda")) {
      fetch(`/api/admin/events/${eventId}/agenda`)
        .then((r) => r.json())
        .then((json) => {
          setAgendaItems(json.items || [])
          setFetchedTabs((prev) => new Set(prev).add("agenda"))
        })
        .catch(() => {})
    }
    if (activeTab === "pricing" && !fetchedTabs.has("pricing")) {
      fetch(`/api/admin/events/${eventId}/pricing`)
        .then((r) => r.json())
        .then((json) => {
          setPricingItems(json.ticketTypes || [])
          setFetchedTabs((prev) => new Set(prev).add("pricing"))
        })
        .catch(() => {})
    }
    if (activeTab === "email-templates") {
      fetch(`/api/admin/events/${eventId}/email-templates`)
        .then((r) => r.json())
        .then((json) => setEmailTemplates(json.templates || []))
        .catch(() => {})
    }
    if (activeTab === "promote" && !fetchedTabs.has("promote")) {
      setRegisterConfigLoading(true)
      fetch(`/api/admin/events/${eventId}/register-button`)
        .then((r) => r.json())
        .then((json) => {
          setRegisterConfig(json.config || { enabled: false, label: "Register", href: `/events/${data?.event?.slug || ""}`, eventId: null, eventTitle: null })
          setFetchedTabs((prev) => new Set(prev).add("promote"))
        })
        .catch(() => {
          setRegisterConfig({ enabled: false, label: "Register", href: `/events/${data?.event?.slug || ""}`, eventId: null, eventTitle: null })
          setFetchedTabs((prev) => new Set(prev).add("promote"))
        })
        .finally(() => setRegisterConfigLoading(false))
    }
  }, [activeTab, data, eventId, emailTemplatesVersion, fetchedTabs])

  async function handleStatusChange(newStatus: EventStatus) {
    if (!data) return
    setIsLoading(newStatus)
    const result = await setEventStatus(data.event.id, newStatus)
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: `Event ${newStatus === "archived" ? "archived" : "updated"}.` })
      setData({ ...data, event: { ...data.event, status: newStatus } })
    }
    setIsLoading(null)
  }

  async function handleDelete() {
    if (!data) return
    setIsLoading("delete")
    const result = await deleteEvent(data.event.id)
    if (result.error) {
      notifications.showError({ description: result.error })
      setIsLoading(null)
    } else {
      notifications.showSuccess({ description: "Event deleted." })
      router.push("/admin/events")
    }
  }

  async function handleDuplicate() {
    if (!data) return
    setIsLoading("duplicate")
    const result = await duplicateEvent(data.event.id)
    if (result.error) {
      notifications.showError({ description: result.error })
    } else if (result.data) {
      notifications.showSuccess({ description: "Event duplicated. Redirecting..." })
      router.push(`/admin/events/${result.data.id}/settings`)
    }
    setIsLoading(null)
  }

  async function handleSaveRegisterButton() {
    if (!data || !registerConfig) return
    setRegisterConfigSaving(true)
    try {
      const { saveRegisterButtonConfig } = await import("@/lib/actions/admin-settings")
      const eventSlug = data.event.slug || data.event.id
      const result = await saveRegisterButtonConfig({
        enabled: registerConfig.enabled,
        label: registerConfig.label,
        href: registerConfig.enabled ? `/events/${eventSlug}` : registerConfig.href,
        eventId: registerConfig.enabled ? data.event.id : null,
        eventTitle: registerConfig.enabled ? data.event.title : null,
      })
      if (result.error) {
        notifications.showError({ title: "Cannot assign register button", description: result.error })
      } else {
        notifications.showSuccess({ description: "Register button config saved." })
        setFetchedTabs((prev) => {
          const next = new Set(prev)
          next.delete("promote")
          return next
        })
      }
    } catch {
      notifications.showError({ description: "Failed to save register button config" })
    } finally {
      setRegisterConfigSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded-lg bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 rounded-full bg-gray-200" />
            <div className="h-9 w-28 rounded-lg bg-gray-200" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-6 w-12 rounded bg-gray-200" />
                  <div className="h-3 w-16 rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Event overview skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-gray-100" />
            <div className="space-y-1.5">
              <div className="h-5 w-40 rounded bg-gray-200" />
              <div className="h-3 w-56 rounded bg-gray-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-16 rounded bg-gray-100" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="mt-4 h-10 w-full rounded-lg bg-gray-50" />
        </div>

        {/* Tabs skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 h-10 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-40 rounded-lg bg-gray-200" />
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="h-10 w-full rounded-lg bg-gray-100" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="h-10 w-full rounded-lg bg-gray-100" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="h-10 w-full rounded-lg bg-gray-100" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-100" />
                <div className="h-10 w-full rounded-lg bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Event not found
      </div>
    )
  }

  const { event, stats } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">{event.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={statusColors[event.status]}>
            {event.status === "published" && <Eye className="mr-1 h-3 w-3" />}
            {event.status === "draft" && <EyeOff className="mr-1 h-3 w-3" />}
            {event.status}
          </Badge>
          {event.status === "published" && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/events/${event.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Registrations</p>
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
                <p className="text-xs text-muted-foreground">Confirmed</p>
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
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {stats.formVersion > 0
                    ? `v${stats.formVersion}`
                    : "None"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Form ({stats.formStatus})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ticketTypes}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.isFree ? "Free Event" : "Ticket Types"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.isFree ? "Free" : `NPR ${stats.revenue.toLocaleString()}`}
                </p>
                <p className="text-xs text-muted-foreground">Revenue</p>
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
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Date</span>
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
                <span>Form</span>
              </div>
              <p className="font-medium">
                {stats.formVersion > 0
                  ? `v${stats.formVersion} (${stats.formStatus})`
                  : "No form created"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Tickets</span>
              </div>
              <p className="font-medium">
                {stats.isFree ? "Free Event" : `${stats.ticketTypes} active`}
              </p>
            </div>
          </div>
          {event.description && (
            <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div>
        {activeTab === "details" && (
          <EventDetailsForm
            event={event}
            onSave={(updates) => setData((prev) => prev ? { ...prev, event: { ...prev.event, ...updates } } : prev)}
          />
        )}
        {activeTab === "media" && (
          <EventMediaForm
            event={event}
            onSave={(updates) => setData((prev) => prev ? { ...prev, event: { ...prev.event, ...updates } } : prev)}
          />
        )}
        {activeTab === "location" && (
          <EventLocationForm
            event={event}
            onSave={(updates) => setData((prev) => prev ? { ...prev, event: { ...prev.event, ...updates } } : prev)}
          />
        )}
        {activeTab === "agenda" && (
          fetchedTabs.has("agenda") ? (
            <AgendaEditor eventId={eventId} items={agendaItems} />
          ) : (
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 rounded-lg bg-gray-200" />
                  <div className="h-4 w-48 rounded-lg bg-gray-100" />
                </div>
                <div className="h-9 w-32 rounded-lg bg-gray-200" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="size-6 rounded bg-gray-200" />
                      <div className="size-6 rounded bg-gray-200" />
                    </div>
                    <div className="size-7 rounded-full bg-gray-200" />
                    <div className="h-9 w-28 rounded-lg bg-gray-100" />
                    <span className="text-xs text-gray-200">—</span>
                    <div className="h-9 w-28 rounded-lg bg-gray-100" />
                    <div className="h-9 flex-1 rounded-lg bg-gray-100" />
                    <div className="size-8 rounded-lg bg-gray-200" />
                    <div className="size-8 rounded-lg bg-gray-200" />
                  </div>
                  <div className="ml-16 h-4 w-3/4 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          )
        )}
        {activeTab === "pricing" && (
          fetchedTabs.has("pricing") ? (
            <PricingEditor
              eventId={eventId}
              ticketTypes={pricingItems}
              isFree={event.is_free}
            />
          ) : (
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 rounded-lg bg-gray-200" />
                  <div className="h-4 w-28 rounded-lg bg-gray-100" />
                </div>
                <div className="h-9 w-36 rounded-lg bg-gray-200" />
              </div>
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 rounded bg-gray-200" />
                      <div className="flex gap-4">
                        <div className="h-4 w-20 rounded bg-gray-100" />
                        <div className="h-4 w-16 rounded bg-gray-100" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-10 rounded-full bg-gray-200" />
                      <div className="size-8 rounded-lg bg-gray-200" />
                      <div className="size-8 rounded-lg bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        <div className={activeTab === "form-builder" ? "" : "hidden"}>
          {formSchemaLoaded && formSchema ? (
            <EventFormBuilder
              key={formSchema.version}
              eventId={eventId}
              onSchemaSaved={(schema) => {
                setFormSchema(schema)
                setFormSchemaVersion((v) => v + 1)
              }}
              initialSchema={formSchema}
            />
          ) : (
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 rounded bg-gray-200" />
                  <div className="h-5 w-32 rounded bg-gray-100" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-20 rounded-lg bg-gray-200" />
                  <div className="h-8 w-20 rounded-lg bg-gray-200" />
                  <div className="h-9 w-28 rounded-lg bg-gray-200" />
                  <div className="h-9 w-24 rounded-lg bg-gray-200" />
                </div>
              </div>
              <div className="grid grid-cols-[220px_1fr_340px] gap-4">
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 rounded-lg bg-gray-100" />
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="h-12 rounded-xl bg-gray-100" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="space-y-3">
                        <div className="h-5 w-40 rounded bg-gray-200" />
                        <div className="h-10 rounded-lg bg-gray-100" />
                        <div className="h-10 rounded-lg bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="h-6 w-32 rounded bg-gray-200" />
                  <div className="h-10 rounded-lg bg-gray-100" />
                  <div className="h-10 rounded-lg bg-gray-100" />
                  <div className="h-24 rounded-lg bg-gray-100" />
                </div>
              </div>
            </div>
          )}
        </div>
        {activeTab === "email-templates" && (
          <EmailTemplateEditor
            eventId={eventId}
            templates={emailTemplates}
            onTemplatesChanged={() => setEmailTemplatesVersion((v) => v + 1)}
            eventTitle={data?.event?.title}
            eventDate={data?.event?.event_date}
            eventLocation={data?.event?.location}
          />
        )}
        {activeTab === "promote" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Promote Event — Navbar Register Button
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {registerConfigLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-10 w-full rounded-lg bg-gray-100" />
                  <div className="h-10 w-full rounded-lg bg-gray-100" />
                  <div className="h-10 w-3/4 rounded-lg bg-gray-100" />
                </div>
              ) : registerConfig ? (
                <>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                    <p className="font-semibold mb-1">How it works</p>
                    <p>Enable this to set <strong>{event.title}</strong> as the target of the <strong>Register</strong> button in the website navbar. Only one event can be assigned at a time.</p>
                  </div>

                  {/* Enable/Disable Toggle */}
                  {(() => {
                    const isAssignedToOther = registerConfig.eventId !== null && registerConfig.eventId !== event.id
                    return (
                      <div className={cn("flex items-center justify-between rounded-xl border p-4", isAssignedToOther ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-gray-50")}>
                        <div className="flex items-center gap-3">
                          {registerConfig.enabled && !isAssignedToOther ? (
                            <ToggleRight className="h-8 w-8 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-8 w-8 text-gray-400" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">Set as Navbar Register Button</p>
                            <p className="text-sm text-gray-500">
                              {isAssignedToOther
                                ? `Assigned to "${registerConfig.eventTitle}" — disable that event first`
                                : registerConfig.enabled
                                  ? `Currently pointing to: ${event.title}`
                                  : "Not active — navbar uses default link"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (isAssignedToOther) return
                            setRegisterConfig({ ...registerConfig, enabled: !registerConfig.enabled })
                          }}
                          disabled={isAssignedToOther}
                          className={cn(
                            "relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            isAssignedToOther ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                            registerConfig.enabled && !isAssignedToOther ? "bg-green-600" : "bg-gray-300"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                              registerConfig.enabled && !isAssignedToOther ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    )
                  })()}

                  {/* Label */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Button Label</label>
                    <input
                      type="text"
                      value={registerConfig.label}
                      onChange={(e) => setRegisterConfig({ ...registerConfig, label: e.target.value })}
                      placeholder="Register"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Preview</label>
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-primary/50 px-6 py-2.5 text-[15px] font-medium text-primary">
                          <ClipboardList className="size-3.5" />
                          {registerConfig.label || "Register"}
                        </div>
                        <span className="text-xs text-gray-400">→ {registerConfig.href}</span>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end gap-3">
                    {registerConfig.eventId && registerConfig.eventId !== event.id && (
                      <p className="text-xs text-amber-600">
                        Disable &quot;{registerConfig.eventTitle}&quot; first
                      </p>
                    )}
                    <Button
                      onClick={handleSaveRegisterButton}
                      disabled={registerConfigSaving || (registerConfig.eventId !== null && registerConfig.eventId !== event.id)}
                      className="bg-[#3FABDE] hover:bg-[#2f9bca]"
                    >
                      {registerConfigSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Configuration
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Failed to load register button configuration.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <Badge variant="secondary" className={statusColors[event.status]}>
              {statusLabels[event.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-center gap-4">
            {/* Publish / Re-enable */}
            {(event.status === "draft" || event.status === "disabled") && (
              <button
                onClick={() => handleStatusChange("published")}
                disabled={isLoading !== null}
                className="group flex items-center gap-3 rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3.5 min-w-[180px] text-left transition-all hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-100 hover:shadow-sm disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-green-100 transition-colors group-hover:bg-green-200">
                  {isLoading === "published" ? <Loader2 className="size-4 animate-spin text-green-600" /> : <Eye className="size-4 text-green-600 transition-transform group-hover:scale-110" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-green-700">{event.status === "draft" ? "Publish" : "Re-enable"}</p>
                  <p className="text-xs text-green-600/70">{event.status === "draft" ? "Make event live" : "Restore event"}</p>
                </div>
              </button>
            )}

            {/* Disable */}
            {event.status === "published" && (
              <button
                onClick={() => handleStatusChange("disabled")}
                disabled={isLoading !== null}
                className="group flex items-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3.5 min-w-[180px] text-left transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 hover:shadow-sm disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 transition-colors group-hover:bg-amber-200">
                  {isLoading === "disabled" ? <Loader2 className="size-4 animate-spin text-amber-600" /> : <Pause className="size-4 text-amber-600 transition-transform group-hover:scale-110" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-700">Disable</p>
                  <p className="text-xs text-amber-600/70">Take event offline</p>
                </div>
              </button>
            )}

            {/* Archive */}
            {(event.status === "published" || event.status === "disabled") && (
              <button
                onClick={() => setArchiveDialogOpen(true)}
                disabled={isLoading !== null}
                className="group flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 min-w-[180px] text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:shadow-sm disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
                  <Archive className="size-4 text-slate-600 transition-transform group-hover:scale-110" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Archive</p>
                  <p className="text-xs text-slate-500">Hide from listings</p>
                </div>
              </button>
            )}

            {/* Restore from archived */}
            {event.status === "archived" && (
              <button
                onClick={() => handleStatusChange("draft")}
                disabled={isLoading !== null}
                className="group flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 min-w-[180px] text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:shadow-sm disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
                  {isLoading === "draft" ? <Loader2 className="size-4 animate-spin text-slate-600" /> : <RotateCcw className="size-4 text-slate-600 transition-transform group-hover:scale-110" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Restore</p>
                  <p className="text-xs text-slate-500">Back to draft</p>
                </div>
              </button>
            )}

            {/* Duplicate */}
            <button
              onClick={() => setDuplicateDialogOpen(true)}
              disabled={isLoading !== null}
              className="group flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-3.5 min-w-[180px] text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:shadow-sm disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Copy className="size-4 text-primary transition-transform group-hover:scale-110" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Duplicate</p>
                <p className="text-xs text-primary/70">Create a copy</p>
              </div>
            </button>

            {/* Delete */}
            <button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isLoading !== null}
              className="group flex items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3.5 min-w-[180px] text-left transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-sm disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-red-100 transition-colors group-hover:bg-red-200">
                <Trash2 className="size-4 text-red-600 transition-transform group-hover:scale-110" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-600">Delete</p>
                <p className="text-xs text-red-500/70">Permanent removal</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Archive Modal ── */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <Archive className="size-5 text-slate-600" />
              </div>
              Archive Event
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              Archive <strong className="text-foreground">{event.title}</strong>? It will be hidden from public listings.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed">
            The event can be <strong>restored to draft</strong> later if needed. Existing registrations will not be affected.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>Keep Active</Button>
            <Button onClick={() => { setArchiveDialogOpen(false); handleStatusChange("archived") }} disabled={isLoading === "archived"} className="bg-slate-600 hover:bg-slate-700 text-white">
              {isLoading === "archived" && <Loader2 className="mr-2 size-4 animate-spin" />}
              Yes, Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Duplicate Modal ── */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Copy className="size-5 text-primary" />
              </div>
              Duplicate Event
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              Create a new draft event with the same details, agenda, ticket types, email templates, and form schema.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed">
            Registrations will <strong>NOT</strong> be copied. The new event will be created as a draft.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDuplicate} disabled={isLoading === "duplicate"}>
              {isLoading === "duplicate" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Modal ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
              Delete Event
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              Are you sure you want to delete &quot;{event.title}&quot;?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 leading-relaxed">
            ⚠ <strong>This action cannot be undone.</strong> All event data, agenda, forms, and email templates will be permanently deleted.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading === "delete"}>
              {isLoading === "delete" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
