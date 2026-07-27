"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Loader2,
  ImageIcon,
  X,
  Upload,
  Trash2,
  Replace,
  Check,
  AlertTriangle,
  ExternalLink,
  Link2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { updateEvent } from "@/lib/actions/events-module/event-crud"
import { notifications } from "@/lib/notifications"
import type { EventModuleEvent } from "@/lib/types/events-module"
import Image from "next/image"

interface EventMediaFormProps {
  event: EventModuleEvent
  onSave?: (updates: Partial<EventModuleEvent>) => void
}

const BUCKET = "event-images"
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

function getStoragePathFromUrl(url: string, bucket: string): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}

export function EventMediaForm({ event, onSave }: EventMediaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [bannerUrl, setBannerUrl] = useState(event.banner_url || "")
  const [imageUrl, setImageUrl] = useState(event.image || "")
  const MAX_GALLERY = 5
  const [gallery, setGallery] = useState<string[]>(event.gallery || [])
  const [newGalleryUrl, setNewGalleryUrl] = useState("")
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [showBannerUrl, setShowBannerUrl] = useState(false)
  const [showImageUrl, setShowImageUrl] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; url: string; field: string; index?: number }>({
    open: false,
    url: "",
    field: "",
  })

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Validate file before upload
  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Invalid file type. Accepted: PNG, JPG, WEBP, GIF`
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB`
    }
    return null
  }

  // Upload file to Supabase storage
  async function uploadFile(file: File): Promise<string | null> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      notifications.showError({ description: "You must be logged in to upload files" })
      return null
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { cacheControl: "3600", upsert: false })

    if (error) {
      notifications.showError({ description: error.message || "Upload failed" })
      return null
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
    return urlData.publicUrl
  }

  // Delete file from Supabase storage
  async function deleteFromStorage(url: string): Promise<boolean> {
    const path = getStoragePathFromUrl(url, BUCKET)
    if (!path) return true // External URL, nothing to delete

    const supabase = createClient()
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) {
      console.warn("Storage delete warning:", error.message)
      return false
    }
    return true
  }

  // Handle file upload for any field
  const handleFileUpload = useCallback(
    async (file: File, field: string) => {
      const validationError = validateFile(file)
      if (validationError) {
        notifications.showError({ description: validationError })
        return
      }

      setUploadingField(field)
      const url = await uploadFile(file)
      setUploadingField(null)

      if (url) {
        if (field === "banner") setBannerUrl(url)
        else if (field === "image") setImageUrl(url)
        notifications.showSuccess({ description: "Image uploaded successfully" })
      }
    },
    []
  )

  // Handle file input change
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, field: string) {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file, field)
    if (e.target) e.target.value = ""
  }

  // Handle drag and drop
  function handleDrop(e: React.DragEvent, field: string) {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileUpload(file, field)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  // Handle URL input
  function handleUrlSubmit(url: string, field: string) {
    if (!url.trim()) return
    // Basic URL validation
    try {
      new URL(url)
      if (field === "banner") setBannerUrl(url)
      else if (field === "image") setImageUrl(url)
    } catch {
      notifications.showError({ description: "Invalid URL format" })
    }
  }

  // Remove image (from form + storage)
  async function handleRemove(field: string, url: string, index?: number) {
    if (field === "banner") {
      await deleteFromStorage(url)
      setBannerUrl("")
    } else if (field === "image") {
      await deleteFromStorage(url)
      setImageUrl("")
    } else if (field === "gallery" && index !== undefined) {
      await deleteFromStorage(url)
      setGallery(gallery.filter((_, i) => i !== index))
    }
    setDeleteDialog({ open: false, url: "", field: "" })
    notifications.showSuccess({ description: "Image removed" })
  }

  // Add gallery image from URL
  function addGalleryImage() {
    if (gallery.length >= MAX_GALLERY) {
      notifications.showError({ description: `Maximum ${MAX_GALLERY} images allowed` })
      return
    }
    if (newGalleryUrl.trim()) {
      try {
        new URL(newGalleryUrl)
        setGallery([...gallery, newGalleryUrl.trim()])
        setNewGalleryUrl("")
      } catch {
        notifications.showError({ description: "Invalid URL format" })
      }
    }
  }

  // Add gallery image from file
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const remaining = MAX_GALLERY - gallery.length
    if (remaining <= 0) {
      notifications.showError({ description: `Maximum ${MAX_GALLERY} images allowed. Remove some first.` })
      if (e.target) e.target.value = ""
      return
    }

    setUploadingField("gallery")
    const newUrls: string[] = []

    for (const file of Array.from(files).slice(0, remaining)) {
      const validationError = validateFile(file)
      if (validationError) {
        notifications.showError({ description: `${file.name}: ${validationError}` })
        continue
      }
      const url = await uploadFile(file)
      if (url) newUrls.push(url)
    }

    if (newUrls.length > 0) {
      setGallery([...gallery, ...newUrls])
      const skipped = Array.from(files).length - newUrls.length
      if (skipped > 0) {
        notifications.showSuccess({ description: `${newUrls.length} uploaded, ${skipped} skipped (limit: ${MAX_GALLERY})` })
      } else {
        notifications.showSuccess({ description: `${newUrls.length} image(s) uploaded` })
      }
    }

    setUploadingField(null)
    if (e.target) e.target.value = ""
  }

  // Save changes
  async function handleSave() {
    setIsLoading(true)
    const result = await updateEvent(event.id, {
      banner_url: bannerUrl || undefined,
      image: imageUrl || undefined,
      gallery,
    })
    setIsLoading(false)

    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Media saved successfully" })
      onSave?.({
        banner_url: bannerUrl || undefined,
        image: imageUrl || undefined,
        gallery,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner Image */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Banner Image</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Hero image for the event detail page. Recommended: 1920x600px
              </p>
            </div>
            {bannerUrl && <Badge variant="secondary" className="bg-green-100 text-green-700"><Check className="size-3 mr-1" /> Set</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {bannerUrl ? (
            <div className="space-y-4">
              <div className="relative group rounded-xl overflow-hidden border border-border">
                <img src={bannerUrl} alt="Banner" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleFileUpload(file, "banner")
                      }
                      input.click()
                    }}
                    className="flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-foreground hover:bg-white transition-colors"
                  >
                    <Replace className="size-4" />
                    Replace
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, url: bannerUrl, field: "banner" })}
                    className="flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Or enter image URL"
                  className="text-xs font-mono"
                />
                <Button variant="outline" size="sm" onClick={() => handleUrlSubmit(bannerUrl, "banner")}>
                  <Link2 className="size-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                onDrop={(e) => handleDrop(e, "banner")}
                onDragOver={handleDragOver}
                onClick={() => bannerInputRef.current?.click()}
              >
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "banner")}
                  className="hidden"
                />
                {uploadingField === "banner" ? (
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-3" />
                ) : (
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                )}
                <p className="text-sm font-medium text-foreground">
                  {uploadingField === "banner" ? "Uploading..." : "Click to upload or drag & drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP, GIF up to {MAX_SIZE_MB}MB
                </p>
              </div>
              {!showBannerUrl ? (
                <button
                  type="button"
                  onClick={() => setShowBannerUrl(true)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
                >
                  <Link2 className="size-3" />
                  Or paste an image URL
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="text-xs font-mono"
                    autoFocus
                  />
                  <Button variant="outline" size="sm" onClick={() => handleUrlSubmit(bannerUrl, "banner")}>
                    <Check className="size-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowBannerUrl(false)}>
                    <X className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Thumbnail */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Card Thumbnail</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Image shown on event cards. Recommended: 400x300px
              </p>
            </div>
            {imageUrl && <Badge variant="secondary" className="bg-green-100 text-green-700"><Check className="size-3 mr-1" /> Set</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {imageUrl ? (
            <div className="space-y-4">
              <div className="relative group inline-block rounded-xl overflow-hidden border border-border">
                <img src={imageUrl} alt="Thumbnail" className="h-40 w-64 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleFileUpload(file, "image")
                      }
                      input.click()
                    }}
                    className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-white transition-colors"
                  >
                    <Replace className="size-3" />
                    Replace
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, url: imageUrl, field: "image" })}
                    className="flex items-center gap-2 rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or enter image URL"
                  className="text-xs font-mono"
                />
                <Button variant="outline" size="sm" onClick={() => handleUrlSubmit(imageUrl, "image")}>
                  <Link2 className="size-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                onDrop={(e) => handleDrop(e, "image")}
                onDragOver={handleDragOver}
                onClick={() => imageInputRef.current?.click()}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                  className="hidden"
                />
                {uploadingField === "image" ? (
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-3" />
                ) : (
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                )}
                <p className="text-sm font-medium text-foreground">
                  {uploadingField === "image" ? "Uploading..." : "Click to upload or drag & drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP, GIF up to {MAX_SIZE_MB}MB
                </p>
              </div>
              {!showImageUrl ? (
                <button
                  type="button"
                  onClick={() => setShowImageUrl(true)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
                >
                  <Link2 className="size-3" />
                  Or paste an image URL
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="text-xs font-mono"
                    autoFocus
                  />
                  <Button variant="outline" size="sm" onClick={() => handleUrlSubmit(imageUrl, "image")}>
                    <Check className="size-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowImageUrl(false)}>
                    <X className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Gallery</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Additional images for the event detail page
              </p>
            </div>
            {gallery.length > 0 && <Badge variant="secondary">{gallery.length}/{MAX_GALLERY} images</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Gallery Grid */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {gallery.map((url, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden border border-border">
                  <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = "image/*"
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) {
                            handleFileUpload(file, "gallery-replace").then(() => {
                              // Replace in gallery array
                              uploadFile(file).then((newUrl) => {
                                if (newUrl) {
                                  const newGallery = [...gallery]
                                  newGallery[index] = newUrl
                                  setGallery(newGallery)
                                  deleteFromStorage(url)
                                }
                              })
                            })
                          }
                        }
                        input.click()
                      }}
                      className="p-1.5 rounded-lg bg-white/90 text-foreground hover:bg-white transition-colors"
                    >
                      <Replace className="size-3" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ open: true, url, field: "gallery", index })}
                      className="p-1.5 rounded-lg bg-red-500/90 text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[10px] text-white/80 truncate">{url.split("/").pop()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Images */}
          {gallery.length >= MAX_GALLERY ? (
            <div className="rounded-xl border border-dashed border-muted-foreground/20 bg-muted/30 p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Maximum {MAX_GALLERY} images reached
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Remove an image to add a new one
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
              onDrop={(e) => {
                e.preventDefault()
                const files = e.dataTransfer.files
                if (files) {
                  const fakeEvent = { target: { files } } as any
                  handleGalleryUpload(fakeEvent)
                }
              }}
              onDragOver={handleDragOver}
              onClick={() => galleryInputRef.current?.click()}
            >
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
              {uploadingField === "gallery" ? (
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
              ) : (
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              )}
              <p className="text-sm font-medium text-foreground">
                {uploadingField === "gallery" ? "Uploading..." : "Click or drag to add images"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {MAX_GALLERY - gallery.length} slot{MAX_GALLERY - gallery.length !== 1 ? "s" : ""} remaining • PNG, JPG, WEBP, GIF up to {MAX_SIZE_MB}MB each
              </p>
            </div>
          )}

          {/* URL Input */}
          {gallery.length < MAX_GALLERY && (
            <div className="flex gap-2">
              <Input
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="Or enter image URL"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addGalleryImage()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addGalleryImage} disabled={!newGalleryUrl.trim()}>
                Add URL
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isLoading} size="lg" className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Media
      </Button>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
              Delete Image
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed">
              This will permanently remove the image from storage.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 leading-relaxed">
            ⚠ <strong>This action cannot be undone.</strong> The image will be permanently deleted from the server.
          </div>
          <DialogFooter className="gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, url: "", field: "" })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRemove(deleteDialog.field, deleteDialog.url, deleteDialog.index)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
