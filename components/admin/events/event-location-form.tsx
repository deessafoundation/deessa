"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MapPin, ExternalLink, Navigation } from "lucide-react"
import { updateEvent } from "@/lib/actions/events-module/event-crud"
import { notifications } from "@/lib/notifications"
import type { EventModuleEvent } from "@/lib/types/events-module"

interface EventLocationFormProps {
  event: EventModuleEvent
  onSave?: (updates: Partial<EventModuleEvent>) => void
}

export function EventLocationForm({ event, onSave }: EventLocationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lat, setLat] = useState<string>(event.latitude?.toString() || "")
  const [lng, setLng] = useState<string>(event.longitude?.toString() || "")
  const [venueName, setVenueName] = useState(event.venue_name || "")
  const [address, setAddress] = useState(event.address || "")
  const [location, setLocation] = useState(event.location || "")

  const hasCoordinates = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))
  const previewLat = hasCoordinates ? parseFloat(lat) : 27.7172
  const previewLng = hasCoordinates ? parseFloat(lng) : 85.324

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const result = await updateEvent(event.id, {
      location,
      venue_name: venueName || undefined,
      address: address || undefined,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
    })

    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Location saved successfully." })
      onSave?.({
        location,
        venue_name: venueName || undefined,
        address: address || undefined,
        latitude: lat ? parseFloat(lat) : undefined,
        longitude: lng ? parseFloat(lng) : undefined,
      })
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Location Fields */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
              <CardTitle className="text-base">Venue Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kathmandu, Nepal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_name">Venue Name</Label>
                <Input
                  id="venue_name"
                  name="venue_name"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Hotel Yak & Yeti"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Durbar Marg, Kathmandu 44600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="27.7172"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="85.3240"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.geolocation?.getCurrentPosition(
                    (pos) => {
                      setLat(pos.coords.latitude.toFixed(6))
                      setLng(pos.coords.longitude.toFixed(6))
                    },
                    () => {}
                  )
                }}
                className="w-full"
              >
                <Navigation className="mr-2 size-4" />
                Use My Current Location
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Map Preview */}
        <div>
          <Card className="h-full overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
              <CardTitle className="text-base">Map Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {hasCoordinates ? (
                <div className="overflow-hidden rounded-2xl">
                  <div className="h-[400px] w-full">
                    <iframe
                      src={`https://maps.google.com/maps?q=${previewLat},${previewLng}&output=embed&z=16`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Event location map"
                    />
                  </div>
                  {(venueName || address) && (
                    <div className="border-t border-border p-5">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-1 size-5 shrink-0 text-primary" />
                        <div>
                          {venueName && (
                            <p className="mb-1 font-bold text-foreground">
                              {venueName}
                            </p>
                          )}
                          {address && (
                            <p className="text-sm text-muted-foreground">
                              {address}
                            </p>
                          )}
                          <a
                            href={`https://www.google.com/maps?q=${previewLat},${previewLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                          >
                            Open in Google Maps
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 bg-muted/30">
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MapPin className="size-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    No coordinates set
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Enter latitude and longitude to see a map preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <Button type="submit" size="lg" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Location
      </Button>
    </form>
  )
}
