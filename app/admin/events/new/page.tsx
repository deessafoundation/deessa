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
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  Tag,
  FileText,
  Sparkles,
} from "lucide-react"
import { createEvent } from "@/lib/actions/events-module/event-crud"
import type { EventCategory } from "@/lib/types/events-module"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const categories: { value: EventCategory; label: string; icon: string }[] = [
  { value: "conference", label: "Conference", icon: "🎯" },
  { value: "workshop", label: "Workshop", icon: "🛠️" },
  { value: "seminar", label: "Seminar", icon: "📚" },
  { value: "meetup", label: "Meetup", icon: "🤝" },
  { value: "general", label: "General", icon: "📌" },
]

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
      router.push(`/admin/events/${result.data.id}/settings`)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create New Event</h1>
          <p className="text-muted-foreground">Set up the basics for your new event</p>
        </div>

        <form id="new-event-form" onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Hero Section - Title & Description */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                      Event Title
                    </Label>
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
                      className="h-11 text-base"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-sm font-medium text-foreground">
                        URL Slug
                      </Label>
                      <div className="flex items-center gap-0">
                        <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">
                          /events/
                        </span>
                        <Input
                          id="slug"
                          name="slug"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="your-event-slug"
                          className="rounded-l-none border-l-0"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium text-foreground">
                        Category
                      </Label>
                      <Select name="category" defaultValue="general">
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <span className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                {cat.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="short_description" className="text-sm font-medium text-foreground">
                      Short Description
                    </Label>
                    <Input
                      id="short_description"
                      name="short_description"
                      placeholder="A brief summary for event cards (1-2 sentences)"
                      maxLength={200}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown on event cards and social previews
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                    Full Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Write a detailed description of your event. Include what attendees can expect, key highlights, and any important information..."
                    rows={8}
                    className="text-base leading-relaxed"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Location */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        Start Date & Time <span className="text-red-500">*</span>
                      </Label>
                      <DateTimePicker
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Pick start date & time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        End Date & Time
                      </Label>
                      <DateTimePicker
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="Pick end date & time"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-semibold text-foreground">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="e.g. Kathmandu, Nepal"
                        className="h-11 pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                  <Tag className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_free" className="text-sm font-semibold text-foreground">
                        Free Event
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {isFree
                          ? "Registration is free — no payment required"
                          : "Paid event — ticket types can be configured after creation"}
                      </p>
                    </div>
                    <Switch
                      id="is_free"
                      checked={isFree}
                      onCheckedChange={setIsFree}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-sm font-medium text-foreground">
                      Contact Email
                    </Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      placeholder="events@deessafoundation.com"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-[#3FABDE] hover:bg-[#2f9bca] text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
