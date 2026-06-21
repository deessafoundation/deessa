"use client"

import * as React from "react"
import { MapPin, Search, X, Navigation, Globe, Plus, Minus, LocateFixed } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LocationPickerProps {
  value?: { lat: number; lng: number; address?: string } | null
  onChange?: (location: { lat: number; lng: number; address?: string } | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 }

function latLngToTile(lat: number, lng: number, zoom: number) {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  )
  return { x, y }
}

function tileToLatLng(x: number, y: number, zoom: number) {
  const n = Math.pow(2, zoom)
  const lng = (x / n) * 360 - 180
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)))
  const lat = (latRad * 180) / Math.PI
  return { lat, lng }
}

function LocationPicker({
  value,
  onChange,
  placeholder = "Pick a location",
  disabled = false,
  className,
}: LocationPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState(value?.address || "")
  const [mapCenter, setMapCenter] = React.useState(value || DEFAULT_CENTER)
  const [zoom, setZoom] = React.useState(13)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number; center: { lat: number; lng: number } } | null>(null)
  const mapRef = React.useRef<HTMLDivElement>(null)

  const currentLat = value?.lat ?? mapCenter.lat
  const currentLng = value?.lng ?? mapCenter.lng

  const TILE_SIZE = 256

  // Convert lat/lng to pixel position on the map
  function latLngToPixel(lat: number, lng: number, centerLat: number, centerLng: number, zoom: number, mapWidth: number, mapHeight: number) {
    const centerTile = latLngToTile(centerLat, centerLng, zoom)
    const targetTile = latLngToTile(lat, lng, zoom)

    const centerPixelX = centerTile.x * TILE_SIZE + TILE_SIZE / 2
    const centerPixelY = centerTile.y * TILE_SIZE + TILE_SIZE / 2
    const targetPixelX = targetTile.x * TILE_SIZE + TILE_SIZE / 2
    const targetPixelY = targetTile.y * TILE_SIZE + TILE_SIZE / 2

    const pixelX = (targetPixelX - centerPixelX) + mapWidth / 2
    const pixelY = (targetPixelY - centerPixelY) + mapHeight / 2

    return { x: pixelX, y: pixelY }
  }

  // Convert pixel position to lat/lng
  function pixelToLatLng(pixelX: number, pixelY: number, centerLat: number, centerLng: number, zoom: number, mapWidth: number, mapHeight: number) {
    const centerTile = latLngToTile(centerLat, centerLng, zoom)

    const offsetXPixels = pixelX - mapWidth / 2
    const offsetYPixels = pixelY - mapHeight / 2

    const tileX = centerTile.x + offsetXPixels / TILE_SIZE
    const tileY = centerTile.y + offsetYPixels / TILE_SIZE

    return tileToLatLng(tileX, tileY, zoom)
  }

  function handleMapMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY, center: mapCenter })
  }

  function handleMapMouseMove(e: React.MouseEvent) {
    if (!isDragging || !dragStart || !mapRef.current) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    const pixelsPerTile = TILE_SIZE
    const lngPerTile = 360 / Math.pow(2, zoom)
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * latLngToTile(dragStart.center.lat, dragStart.center.lng, zoom).y) / Math.pow(2, zoom))))
    const latPerTile = (Math.PI / Math.cos(latRad)) * (180 / Math.PI) / Math.pow(2, zoom)

    const newLng = dragStart.center.lng - (dx / pixelsPerTile) * lngPerTile
    const newLat = dragStart.center.lat + (dy / pixelsPerTile) * latPerTile

    setMapCenter({ lat: newLat, lng: newLng })
  }

  function handleMapMouseUp() {
    setIsDragging(false)
    setDragStart(null)
  }

  function handleMapClick(e: React.MouseEvent) {
    if (!mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const pixelX = e.clientX - rect.left
    const pixelY = e.clientY - rect.top

    const newLatLng = pixelToLatLng(pixelX, pixelY, currentLat, currentLng, zoom, rect.width, rect.height)
    onChange?.({ ...newLatLng, address: searchQuery || undefined })
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1
    setZoom((z) => Math.max(1, Math.min(19, z + delta)))
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(19, z + 1))
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(1, z - 1))
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "User-Agent": "DeessaFoundation/1.0" } }
      )
      const data = await res.json()
      if (data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        const newCenter = { lat, lng, address: result.display_name }
        setMapCenter(newCenter)
        onChange?.(newCenter)
      }
    } catch {}
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange?.(null)
    setSearchQuery("")
    setMapCenter(DEFAULT_CENTER)
  }

  function handleUseMyLocation() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const newCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMapCenter(newCenter)
        onChange?.(newCenter)
      },
      () => {}
    )
  }

  // Calculate tile positions for the map
  const centerTile = latLngToTile(currentLat, currentLng, zoom)
  const tilesNeeded = 9 // 3x3 grid minimum

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm transition-colors",
          "hover:border-primary/50 hover:bg-accent/50",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground",
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="size-4 text-muted-foreground shrink-0" />
          {value ? (
            <span className="text-foreground font-medium truncate">
              {value.address || `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="size-3.5" />
          </button>
        )}
      </button>

      {/* Full screen modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border p-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search for a place..."
                  className="pl-9 h-10"
                />
              </div>
              <Button size="sm" onClick={handleSearch} className="h-10 px-4">
                Search
              </Button>
              <Button size="sm" variant="ghost" onClick={handleUseMyLocation} className="h-10 px-2" title="Use my location">
                <LocateFixed className="size-4" />
              </Button>
              <button
                onClick={() => setOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Map */}
            <div
              ref={mapRef}
              className={cn(
                "relative h-[350px] overflow-hidden select-none",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              onMouseDown={handleMapMouseDown}
              onMouseMove={handleMapMouseMove}
              onMouseUp={handleMapMouseUp}
              onMouseLeave={handleMapMouseUp}
              onClick={handleMapClick}
              onWheel={handleWheel}
            >
              {/* Tiles */}
              {Array.from({ length: 5 }, (_, row) =>
                Array.from({ length: 7 }, (_, col) => {
                  const tileX = centerTile.x - 3 + col
                  const tileY = centerTile.y - 2 + row
                  return (
                    <img
                      key={`${tileX}-${tileY}`}
                      src={`https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`}
                      alt=""
                      className="absolute pointer-events-none"
                      style={{
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        left: `${(col - 3) * TILE_SIZE}px`,
                        top: `${(row - 2) * TILE_SIZE}px`,
                        transform: `translate(${-TILE_SIZE / 2}px, ${-TILE_SIZE / 2}px)`,
                      }}
                      draggable={false}
                    />
                  )
                })
              )}

              {/* Pin */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
                <div className="relative">
                  <MapPin className="size-8 text-primary drop-shadow-lg" fill="currentColor" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/30 rounded-full" />
                </div>
              </div>

              {/* Zoom controls */}
              <div className="absolute right-3 top-3 flex flex-col gap-1 z-20">
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomIn() }}
                  className="flex size-8 items-center justify-center rounded-lg bg-background border border-border shadow-sm hover:bg-muted transition-colors"
                >
                  <Plus className="size-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomOut() }}
                  className="flex size-8 items-center justify-center rounded-lg bg-background border border-border shadow-sm hover:bg-muted transition-colors"
                >
                  <Minus className="size-4" />
                </button>
              </div>

              {/* Coordinates badge */}
              <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg border border-border px-2.5 py-1.5 text-xs font-mono text-muted-foreground z-20">
                {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
              </div>
            </div>

            {/* Footer with inputs */}
            <div className="border-t border-border p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={currentLat.toFixed(6)}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value)
                      if (!isNaN(lat)) {
                        const newCenter = { lat, lng: currentLng }
                        setMapCenter(newCenter)
                        onChange?.({ ...newCenter, address: searchQuery || undefined })
                      }
                    }}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Longitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={currentLng.toFixed(6)}
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value)
                      if (!isNaN(lng)) {
                        const newCenter = { lat: currentLat, lng }
                        setMapCenter(newCenter)
                        onChange?.({ ...newCenter, address: searchQuery || undefined })
                      }
                    }}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Globe className="size-3" />
                  <span>OpenStreetMap • Scroll to zoom • Drag to pan • Click to place pin</span>
                </div>
                <Button size="sm" onClick={() => setOpen(false)} className="h-8">
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export { LocationPicker }
export type { LocationPickerProps }
