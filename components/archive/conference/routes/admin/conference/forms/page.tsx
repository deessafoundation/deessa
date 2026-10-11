import Link from "next/link"
import { ArrowLeft, Eye, Copy, Edit, FileText, Calendar, Users } from "lucide-react"
import { getAllEvents } from "@/lib/actions/events"
import { getEventStatus } from "@/lib/utils/event-helpers"
import { getActiveFormSchema, getFormSchemaHistory } from "@/lib/actions/conference-form-schema"
import { getConferenceRegistrations } from "@/lib/actions/conference-registration"
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

export const metadata = {
  title: "Conference Forms Overview | Admin",
  description: "Manage registration forms for all events",
}

export default async function ConferenceFormsOverviewPage() {
  // Fetch all events
  const events = await getAllEvents()

  // Fetch active schemas and registration counts for each event
  const eventsWithData = await Promise.all(
    events.map(async (event) => {
      const schema = await getActiveFormSchema(event.id)
      const history = await getFormSchemaHistory(event.id)
      const allRegistrations = await getConferenceRegistrations()
      const registrations = allRegistrations.filter((r) => r.event_id === event.id)

      const fieldCount = schema
        ? schema.steps.reduce((sum, step) => sum + step.fields.length, 0)
        : 0

      return {
        event,
        schema,
        fieldCount,
        registrationCount: registrations.length,
        hasCustomForm: !!schema && schema.version > 1,
        status: getEventStatus(event),
        lastUpdated: history.length > 0 ? history[0].createdAt : null,
      }
    })
  )

  const getStatusBadge = (status: "current" | "past" | "future") => {
    if (status === "current") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          🟢 Current
        </Badge>
      )
    }
    if (status === "past") {
      return (
        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
          🔴 Past
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        ⚪ Future
      </Badge>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Stats
  const totalEvents = events.length
  const currentEvents = eventsWithData.filter((e) => e.status === "current").length
  const customForms = eventsWithData.filter((e) => e.hasCustomForm).length
  const totalRegistrations = eventsWithData.reduce((sum, e) => sum + e.registrationCount, 0)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/conference"
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="size-4" />
          Conference
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Forms Management</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conference Forms Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage registration forms for all events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Events</p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalEvents}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentEvents} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Custom Forms</p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <FileText className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{customForms}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalEvents - customForms} using default
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Users className="size-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalRegistrations}</p>
            <p className="mt-1 text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Form Builder</p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Edit className="size-4" />
              </div>
            </div>
            <Link
              href="/admin/conference/settings/form-builder"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Open Builder →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader className="border-b border-border px-6 py-4">
          <CardTitle className="text-base font-bold">Forms by Event</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Form</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsWithData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="size-10 text-muted-foreground/40" />
                        <p className="font-medium">No events found</p>
                        <p className="text-sm">Create an event first to manage forms.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  eventsWithData.map((item) => (
                    <TableRow key={item.event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{item.event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.event.event_date)} • {item.event.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.schema ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              v{item.schema.version}
                            </Badge>
                            {item.hasCustomForm && (
                              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                                Custom
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            No form
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(item.lastUpdated)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {item.fieldCount} {item.fieldCount === 1 ? "field" : "fields"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {item.registrationCount}
                          </span>
                          {item.registrationCount > 0 && (
                            <Link
                              href={`/admin/conference?event=${item.event.id}`}
                              className="text-xs text-primary hover:underline"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/conference/settings/form-builder?event=${item.event.id}`}>
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <Edit className="size-3.5" />
                              Edit Form
                            </Button>
                          </Link>
                          {item.schema && (
                            <Link
                              href={`/conference/register?preview=true&event=${item.event.id}`}
                              target="_blank"
                            >
                              <Button variant="ghost" size="sm" className="gap-1.5">
                                <Eye className="size-3.5" />
                                Preview
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FileText className="size-4" />
            </div>
            <div>
              <p className="font-medium text-blue-900">About Form Versions</p>
              <p className="text-sm text-blue-700 mt-1">
                Each event can have its own custom registration form. Version 1 is the default form. 
                Custom forms (v2+) are created in the Form Builder. Changes to one event's form don't 
                affect other events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
