"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react"
import { createEvent } from "@/lib/actions/events-module/event-crud"
import type { EventCategory } from "@/lib/types/events-module"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function NewEventPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [isFree, setIsFree] = useState(true)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!startDate) {
      setError("Please select a start date.")
      setIsLoading(false)
      return
    }

    const result = await createEvent({
      title,
      slug: slug || generateSlug(title),
      description: (e.currentTarget.elements.namedItem("description") as HTMLTextAreaElement).value,
      short_description: (e.currentTarget.elements.namedItem("short_description") as HTMLInputElement).value || undefined,
      event_date: startDate.toISOString().split("T")[0],
      event_time: startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      event_end_date: endDate ? endDate.toISOString().split("T")[0] : undefined,
      location: (e.currentTarget.elements.namedItem("location") as HTMLInputElement).value,
      category: ((e.currentTarget.elements.namedItem("category") as HTMLSelectElement)?.value || "general") as EventCategory,
      is_free: isFree,
      contact_email: (e.currentTarget.elements.namedItem("contact_email") as HTMLInputElement).value || undefined,
    })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.data) {
      router.push(`/admin/events/${result.data.id}/details`)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Events
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Create Event</h1>
        <p className="text-muted-foreground">
          Set up the basics for your new event
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!slug || slug === generateSlug(title)) {
                    setSlug(generateSlug(e.target.value))
                  }
                }}
                placeholder="e.g. Annual Tech Conference 2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="annual-tech-conference-2026"
                required
              />
              <p className="text-xs text-muted-foreground">
                /events/{slug || "your-event-slug"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                name="short_description"
                placeholder="A brief summary for event cards (1-2 sentences)"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of your event..."
                rows={6}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Date & Location</CardTitle>
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
                placeholder="e.g. Kathmandu, Nepal"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="general">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_free">Free Event</Label>
                <p className="text-sm text-muted-foreground">
                  {isFree
                    ? "Registration is free — no payment required"
                    : "Paid event — ticket types can be configured later"}
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
                placeholder="events@deessa.org"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Event
          </Button>
        </div>
      </form>
    </div>
  )
}
