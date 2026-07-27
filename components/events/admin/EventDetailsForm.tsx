"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FancySelect } from "@/components/ui/fancy-select"
import { Switch } from "@/components/ui/switch"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Loader2 } from "lucide-react"
import { updateEvent } from "@/lib/actions/events-module/event-crud"
import { notifications } from "@/lib/notifications"
import type { EventModuleEvent, EventCategory } from "@/lib/types/events-module"

interface EventDetailsFormProps {
  event: EventModuleEvent
  onSave?: (updates: Partial<EventModuleEvent>) => void
}

export function EventDetailsForm({ event, onSave }: EventDetailsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFree, setIsFree] = useState(event.is_free)

  // Date states
  const [startDate, setStartDate] = useState<Date | null>(
    event.event_date ? new Date(event.event_date + "T00:00:00") : null
  )
  const [endDate, setEndDate] = useState<Date | null>(
    event.event_end_date ? new Date(event.event_end_date + "T00:00:00") : null
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    const result = await updateEvent(event.id, {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      short_description: (formData.get("short_description") as string) || undefined,
      event_date: startDate
        ? startDate.toISOString().split("T")[0]
        : (formData.get("event_date") as string),
      event_time: startDate
        ? startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : (formData.get("event_time") as string) || undefined,
      event_end_date: endDate
        ? endDate.toISOString().split("T")[0]
        : undefined,
      location: (formData.get("location") as string) || event.location,
      category: ((formData.get("category") as string) || event.category) as EventCategory,
      is_free: isFree,
      contact_email: (formData.get("contact_email") as string) || undefined,
    })

    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Event details saved successfully." })
      onSave?.({
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        description: formData.get("description") as string,
        short_description: (formData.get("short_description") as string) || undefined,
        event_date: startDate ? startDate.toISOString().split("T")[0] : undefined,
        event_time: startDate ? startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : undefined,
        event_end_date: endDate ? endDate.toISOString().split("T")[0] : undefined,
        location: (formData.get("location") as string) || undefined,
        category: ((formData.get("category") as string) || event.category) as any,
        is_free: isFree,
        contact_email: (formData.get("contact_email") as string) || undefined,
      })
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={event.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={event.slug}
              required
            />
            <p className="text-xs text-muted-foreground">
              /events/{event.slug}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Input
              id="short_description"
              name="short_description"
              defaultValue={event.short_description || ""}
              placeholder="Brief summary for event cards"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={event.description}
              rows={8}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schedule & Location — 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Schedule & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date & Time *</Label>
                  <DateTimePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Pick start date & time"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <DateTimePicker
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="Pick end date & time"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={event.location}
                  placeholder="e.g. Hyatt Regency, Kathmandu"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings — 1/3 width */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="category" className="shrink-0">Category</Label>
                <div className="w-[160px]">
                  <FancySelect
                    name="category"
                    defaultValue={event.category}
                    options={[
                      { value: "conference", label: "Conference" },
                      { value: "workshop", label: "Workshop" },
                      { value: "seminar", label: "Seminar" },
                      { value: "meetup", label: "Meetup" },
                      { value: "general", label: "General" },
                    ]}
                    size="sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_free">Free Event</Label>
                  <p className="text-xs text-muted-foreground">
                    {isFree
                      ? "No payment required"
                      : "Configure tickets in Pricing tab"}
                  </p>
                </div>
                <Switch
                  id="is_free"
                  checked={isFree}
                  onCheckedChange={setIsFree}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  defaultValue={event.contact_email || ""}
                  placeholder="events@deessa.org"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <Button type="submit" size="lg" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  )
}
