"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FancySelect } from "@/components/ui/fancy-select"
import { Switch } from "@/components/ui/switch"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { createEvent, updateEvent } from "@/lib/actions/admin-events"
import { FileUpload } from "@/components/admin/file-upload"
import type { Event } from "@/lib/types/admin"

interface EventFormProps {
  event?: Event
}

export function EventForm({ event }: EventFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(event?.image || "")
  const [startDate, setStartDate] = useState<Date | null>(
    event?.event_date ? new Date(event.event_date + "T00:00:00") : null
  )
  const [endDate, setEndDate] = useState<Date | null>(
    event?.event_end_date ? new Date(event.event_end_date + "T00:00:00") : null
  )
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    // Append date values to FormData
    if (startDate) {
      formData.set("event_date", startDate.toISOString().split("T")[0])
      formData.set("event_time", startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }
    if (endDate) {
      formData.set("event_end_date", endDate.toISOString().split("T")[0])
    }

    const result = event ? await updateEvent(event.id, formData) : await createEvent(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (event) {
      router.refresh()
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" defaultValue={event?.title} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" name="description" defaultValue={event?.description} rows={4} required />
              </div>

              <FileUpload
                bucket="event-images"
                currentUrl={imageUrl}
                onUpload={setImageUrl}
                label="Event Banner Image"
                maxSizeMB={5}
                allowUrl={true}
              />
              <input type="hidden" name="image" value={imageUrl} />

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
                <Input id="location" name="location" defaultValue={event?.location} required />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Published</Label>
                <Switch id="isPublished" name="isPublished" defaultChecked={event?.is_published} value="true" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={event?.category || ""}
                  placeholder="Education, Health, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <FancySelect
                  name="type"
                  defaultValue={event?.type || "upcoming"}
                  options={[
                    { value: "upcoming", label: "Upcoming" },
                    { value: "past", label: "Past" },
                  ]}
                  size="sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Max Capacity</Label>
                <Input
                  id="maxCapacity"
                  name="maxCapacity"
                  type="number"
                  min="0"
                  defaultValue={event?.max_capacity || ""}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {event ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
