"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FancySelect } from "@/components/ui/fancy-select"
import { Switch } from "@/components/ui/switch"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
  Loader2,
  Upload,
  ImageIcon,
  X,
  QrCode,
  Link2,
  Check,
  AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { updateEvent } from "@/lib/actions/events-module/event-crud"
import { notifications } from "@/lib/notifications"
import type { EventModuleEvent, EventCategory } from "@/lib/types/events-module"

interface EventDetailsFormProps {
  event: EventModuleEvent
  onSave?: (updates: Partial<EventModuleEvent>) => void
}

const QR_BUCKET = "event-images"
const QR_MAX_SIZE_MB = 5
const QR_MAX_SIZE_BYTES = QR_MAX_SIZE_MB * 1024 * 1024
const QR_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

export function EventDetailsForm({ event, onSave }: EventDetailsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFree, setIsFree] = useState(event.is_free)

  // QR Payment state
  const [qrImageUrl, setQrImageUrl] = useState(event.payment_qr_image_url || "")
  const [paymentInstructions, setPaymentInstructions] = useState(event.payment_instructions || "")
  const [uploadingQr, setUploadingQr] = useState(false)
  const [showQrUrl, setShowQrUrl] = useState(false)
  const qrInputRef = useRef<HTMLInputElement>(null)

  // Payment method toggles
  const [allowOnlinePayment, setAllowOnlinePayment] = useState(event.allow_online_payment ?? true)
  const [allowQrPayment, setAllowQrPayment] = useState(event.allow_qr_payment ?? false)
  const [allowPayAtVenue, setAllowPayAtVenue] = useState(event.allow_pay_at_venue ?? false)

  // Date states
  const [startDate, setStartDate] = useState<Date | null>(
    event.event_date ? new Date(event.event_date + "T00:00:00") : null
  )
  const [endDate, setEndDate] = useState<Date | null>(
    event.event_end_date ? new Date(event.event_end_date + "T00:00:00") : null
  )
  const [registrationCloseAt, setRegistrationCloseAt] = useState<Date | null>(
    event.registration_close_at ? new Date(event.registration_close_at) : null
  )

  // QR code upload handlers
  const validateQrFile = (file: File): string | null => {
    if (!QR_ACCEPTED_TYPES.includes(file.type)) {
      return "Invalid file type. Accepted: PNG, JPG, WEBP, GIF"
    }
    if (file.size > QR_MAX_SIZE_BYTES) {
      return `File too large. Maximum size is ${QR_MAX_SIZE_MB}MB`
    }
    return null
  }

  const uploadQrFile = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      notifications.showError({ description: "You must be logged in to upload files" })
      return null
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { data, error } = await supabase.storage
      .from(QR_BUCKET)
      .upload(filePath, file, { cacheControl: "3600", upsert: false })

    if (error) {
      notifications.showError({ description: error.message || "Upload failed" })
      return null
    }

    const { data: urlData } = supabase.storage.from(QR_BUCKET).getPublicUrl(data.path)
    return urlData.publicUrl
  }

  const handleQrFileUpload = useCallback(async (file: File) => {
    const validationError = validateQrFile(file)
    if (validationError) {
      notifications.showError({ description: validationError })
      return
    }

    setUploadingQr(true)
    const url = await uploadQrFile(file)
    setUploadingQr(false)

    if (url) {
      setQrImageUrl(url)
      notifications.showSuccess({ description: "QR code uploaded successfully" })
    }
  }, [])

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleQrFileUpload(file)
    if (e.target) e.target.value = ""
  }

  const handleQrDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) handleQrFileUpload(file)
  }

  const handleQrUrlSubmit = (url: string) => {
    if (!url.trim()) return
    try {
      new URL(url)
      setQrImageUrl(url)
    } catch {
      notifications.showError({ description: "Invalid URL format" })
    }
  }

  const handleRemoveQr = () => {
    setQrImageUrl("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    // Validate at least 1 payment method is enabled for paid events
    if (!isFree && !allowOnlinePayment && !allowQrPayment && !allowPayAtVenue) {
      notifications.showError({ description: "At least one payment method must be enabled for paid events." })
      setIsLoading(false)
      return
    }

    // Clear QR data when QR is disabled
    const effectiveQrUrl = allowQrPayment ? qrImageUrl : ""
    const effectiveInstructions = allowQrPayment ? paymentInstructions : ""

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
      allow_online_payment: allowOnlinePayment,
      allow_qr_payment: allowQrPayment,
      allow_pay_at_venue: allowPayAtVenue,
      contact_email: (formData.get("contact_email") as string) || undefined,
      payment_qr_image_url: effectiveQrUrl || undefined,
      payment_instructions: effectiveInstructions || undefined,
      registration_close_at: registrationCloseAt
        ? registrationCloseAt.toISOString()
        : undefined,
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
        allow_online_payment: allowOnlinePayment,
        allow_qr_payment: allowQrPayment,
        allow_pay_at_venue: allowPayAtVenue,
        contact_email: (formData.get("contact_email") as string) || undefined,
        payment_qr_image_url: effectiveQrUrl || undefined,
        payment_instructions: effectiveInstructions || undefined,
        registration_close_at: registrationCloseAt
          ? registrationCloseAt.toISOString()
          : undefined,
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

              <div className="space-y-2">
                <Label>Registration Deadline</Label>
                <DateTimePicker
                  value={registrationCloseAt}
                  onChange={setRegistrationCloseAt}
                  placeholder="Optional — when to close registration"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep registration open until the event date
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Methods Section — only shown when event is paid */}
      {!isFree && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="size-5 text-muted-foreground" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Choose which payment methods registrants can use. At least one must be enabled.
            </p>

            {/* Online Payment Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <div>
                  <Label className="font-semibold">Online Payment</Label>
                  <p className="text-xs text-muted-foreground">
                    Stripe, Khalti, eSewa — instant payment verification
                  </p>
                </div>
              </div>
              <Switch
                checked={allowOnlinePayment}
                onCheckedChange={setAllowOnlinePayment}
              />
            </div>

            {/* QR Code Payment Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100">
                  <QrCode className="size-5 text-amber-600" />
                </div>
                <div>
                  <Label className="font-semibold">QR Code Payment</Label>
                  <p className="text-xs text-muted-foreground">
                    User scans QR, uploads screenshot — admin verifies manually
                  </p>
                </div>
              </div>
              <Switch
                checked={allowQrPayment}
                onCheckedChange={setAllowQrPayment}
              />
            </div>

            {/* Pay at Venue Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                  <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <Label className="font-semibold">Pay at Venue</Label>
                  <p className="text-xs text-muted-foreground">
                    User registers now, pays cash/card at the check-in desk
                  </p>
                </div>
              </div>
              <Switch
                checked={allowPayAtVenue}
                onCheckedChange={setAllowPayAtVenue}
              />
            </div>

            {/* QR Code Settings — only shown when QR is enabled */}
            {allowQrPayment && (
              <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4 mt-2">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">QR Code Settings</p>

                {/* QR Code Image Upload */}
                <div className="space-y-2">
                  <Label>QR Code Image</Label>
                  {qrImageUrl ? (
                    <div className="space-y-3">
                      <div className="relative group inline-block rounded-xl overflow-hidden border border-border">
                        <img src={qrImageUrl} alt="QR Code" className="h-48 w-48 object-contain bg-white" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = "image/*"
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) handleQrFileUpload(file)
                              }
                              input.click()
                            }}
                            className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-white transition-colors"
                          >
                            <Upload className="size-3" />
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveQr}
                            className="flex items-center gap-2 rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="size-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={qrImageUrl}
                          onChange={(e) => setQrImageUrl(e.target.value)}
                          placeholder="Or enter image URL"
                          className="text-xs font-mono"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQrUrlSubmit(qrImageUrl)}
                        >
                          <Link2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div
                        className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                        onDrop={handleQrDrop}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                        onClick={() => qrInputRef.current?.click()}
                      >
                        <input
                          ref={qrInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleQrFileChange}
                          className="hidden"
                        />
                        {uploadingQr ? (
                          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-3" />
                        ) : (
                          <QrCode className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                        )}
                        <p className="text-sm font-medium text-foreground">
                          {uploadingQr ? "Uploading..." : "Click to upload or drag & drop"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WEBP, GIF up to {QR_MAX_SIZE_MB}MB
                        </p>
                      </div>
                      {!showQrUrl ? (
                        <button
                          type="button"
                          onClick={() => setShowQrUrl(true)}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
                        >
                          <Link2 className="size-3" />
                          Or paste an image URL
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            value={qrImageUrl}
                            onChange={(e) => setQrImageUrl(e.target.value)}
                            placeholder="https://example.com/qr-code.png"
                            className="text-xs font-mono"
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQrUrlSubmit(qrImageUrl)}
                          >
                            <Check className="size-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowQrUrl(false)}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="payment_instructions">Payment Instructions</Label>
                  <Textarea
                    id="payment_instructions"
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    placeholder="e.g., Scan the QR code to pay NPR 500. Use your full name as payment reference. After payment, upload your screenshot during registration."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {paymentInstructions.length}/500 characters — Displayed alongside the QR code on the event page
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button type="submit" size="lg" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  )
}
