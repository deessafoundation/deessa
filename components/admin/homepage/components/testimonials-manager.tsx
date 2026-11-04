"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Star,
  UploadCloud,
  Link as LinkIcon,
  X,
  MessageSquare,
  Loader2,
  ImageIcon,
} from "lucide-react"
import type { HomepageTestimonialsSettings, HomepageTestimonial } from "@/lib/types/homepage-settings"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface TestimonialsManagerProps {
  testimonials: HomepageTestimonialsSettings
  onChange: (testimonials: HomepageTestimonialsSettings) => void
}

export default function TestimonialsManager({ testimonials, onChange }: TestimonialsManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<{ index: number; url: string } | null>(null)
  const [deleteTestimonialDialogOpen, setDeleteTestimonialDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<{
    index: number
    testimonial: HomepageTestimonial
  } | null>(null)

  const updateTestimonials = (newTestimonials: HomepageTestimonial[]) => {
    onChange({ testimonials: newTestimonials })
  }

  const addTestimonial = () => {
    const newTestimonial: HomepageTestimonial = {
      id: `testimonial-${Date.now()}`,
      name: "New Contributor",
      role: "Parent / Partner",
      location: "Kathmandu, Nepal",
      image: "",
      video: "",
      topic: "Autism Support & Education",
      caption: "",
      quote: "Share the transformative experience and grassroots impact observed firsthand...",
      rating: 5,
      order: (testimonials.testimonials || []).length + 1,
      visible: true,
      featured: false,
    }
    updateTestimonials([...(testimonials.testimonials || []), newTestimonial])
  }

  const updateTestimonial = (index: number, updates: Partial<HomepageTestimonial>) => {
    const newTestimonials = [...(testimonials.testimonials || [])]
    newTestimonials[index] = { ...newTestimonials[index], ...updates }
    updateTestimonials(newTestimonials)
  }

  const deleteTestimonial = (index: number) => {
    const testimonial = testimonials.testimonials[index]
    if (testimonial.image && testimonial.image.includes("/storage/v1/object/public/testimonials/")) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: testimonial.image }),
      }).catch((error) => {
        console.warn("Failed to delete testimonial image:", error)
      })
    }

    const newTestimonials = testimonials.testimonials.filter((_, i) => i !== index)
    updateTestimonials(newTestimonials)

    notifications.showSuccess({
      title: "Testimonial deleted",
      description: "The testimonial has been removed successfully.",
    })

    setDeleteTestimonialDialogOpen(false)
    setTestimonialToDelete(null)
  }

  const confirmDeleteTestimonial = (index: number) => {
    const testimonial = testimonials.testimonials[index]
    setTestimonialToDelete({ index, testimonial })
    setDeleteTestimonialDialogOpen(true)
  }

  const toggleVisibility = (index: number) => {
    updateTestimonial(index, { visible: !testimonials.testimonials[index].visible })
  }

  const toggleFeatured = (index: number) => {
    updateTestimonial(index, { featured: !testimonials.testimonials[index].featured })
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newTestimonials = [...testimonials.testimonials]
    ;[newTestimonials[index - 1], newTestimonials[index]] = [newTestimonials[index], newTestimonials[index - 1]]
    updateTestimonials(newTestimonials)
  }

  const moveDown = (index: number) => {
    if (index === testimonials.testimonials.length - 1) return
    const newTestimonials = [...testimonials.testimonials]
    ;[newTestimonials[index], newTestimonials[index + 1]] = [newTestimonials[index + 1], newTestimonials[index]]
    updateTestimonials(newTestimonials)
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = testimonials.testimonials[index].image
    if (imageUrl && imageUrl.includes("/storage/v1/object/public/testimonials/")) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        })
      } catch (error) {
        console.warn("Error deleting image:", error)
      }
    }

    updateTestimonial(index, { image: "" })
    notifications.showSuccess({
      title: "Image removed",
      description: "The testimonial image has been removed.",
    })
    setDeleteDialogOpen(false)
    setImageToDelete(null)
  }

  const confirmRemoveImage = (index: number) => {
    const imageUrl = testimonials.testimonials[index].image
    if (imageUrl) {
      setImageToDelete({ index, url: imageUrl })
      setDeleteDialogOpen(true)
    }
  }

  const handleImageUpload = async (index: number, file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      notifications.showError({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image.",
      })
      return
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      notifications.showError({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
      })
      return
    }

    setUploadingIndex(index)
    const oldImageUrl = testimonials.testimonials[index].image
    const testimonialName = testimonials.testimonials[index].name

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "testimonials")
      formData.append("customName", testimonialName)

      if (oldImageUrl && oldImageUrl.includes("/storage/v1/object/public/testimonials/")) {
        const urlParts = oldImageUrl.split("/storage/v1/object/public/testimonials/")[1]
        if (urlParts) {
          formData.append("oldFilePath", urlParts)
        }
      }

      const response = await fetch("/api/upload", { method: "POST", body: formData })
      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      updateTestimonial(index, { image: data.url })

      notifications.showSuccess({
        title: "Image uploaded",
        description: "Testimonial portrait has been uploaded successfully.",
      })
    } catch {
      notifications.showError({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
      })
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleDragStart = (index: number) => setDraggedIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const newTestimonials = [...testimonials.testimonials]
    const draggedItem = newTestimonials[draggedIndex]
    newTestimonials.splice(draggedIndex, 1)
    newTestimonials.splice(index, 0, draggedItem)
    newTestimonials.forEach((item, i) => {
      item.order = i + 1
    })
    updateTestimonials(newTestimonials)
    setDraggedIndex(index)
  }
  const handleDragEnd = () => setDraggedIndex(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/70">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Voices & Testimonials
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Beneficiary families, partners, educators, and changemakers sharing lived experiences.
          </p>
        </div>
        <Button onClick={addTestimonial} size="sm" className="h-9 self-start sm:self-auto text-xs font-medium">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Testimonial
        </Button>
      </div>

      <div className="space-y-4">
        {(testimonials.testimonials || []).map((testimonial, index) => (
          <Card
            key={testimonial.id || index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "border border-border/80 shadow-sm transition-all",
              !testimonial.visible && "opacity-60 bg-muted/30",
              draggedIndex === index && "opacity-40 border-primary"
            )}
          >
            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-mono font-semibold text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {testimonial.name || "Untitled Contributor"}
                </span>
                {testimonial.featured && (
                  <span className="text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </span>
                )}
                {!testimonial.visible && (
                  <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                  aria-label="Move testimonial earlier"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveDown(index)}
                  disabled={index === (testimonials.testimonials || []).length - 1}
                  className="h-8 w-8 p-0"
                  aria-label="Move testimonial later"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFeatured(index)}
                  className="h-8 w-8 p-0"
                  aria-label={testimonial.featured ? "Unfeature" : "Feature"}
                  title={testimonial.featured ? "Remove featured" : "Set as featured"}
                >
                  <Star className={cn("w-4 h-4", testimonial.featured && "fill-amber-500 text-amber-500")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVisibility(index)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  aria-label={testimonial.visible ? "Hide" : "Show"}
                >
                  {testimonial.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => confirmDeleteTestimonial(index)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Delete testimonial"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium">Contributor Name</Label>
                  <Input
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(index, { name: e.target.value })}
                    placeholder="Full Name"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Role / Affiliation</Label>
                  <Input
                    value={testimonial.role}
                    onChange={(e) => updateTestimonial(index, { role: e.target.value })}
                    placeholder="e.g. Special Educator, Parent"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Location</Label>
                  <Input
                    value={testimonial.location}
                    onChange={(e) => updateTestimonial(index, { location: e.target.value })}
                    placeholder="e.g. Pokhara, Nepal"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Portrait Image Uploader */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <Label className="text-xs font-medium">Contributor Portrait</Label>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full max-w-xs grid-cols-2 h-8">
                    <TabsTrigger value="url" className="text-xs">
                      <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                      Image URL
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="text-xs">
                      <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="mt-2 space-y-1">
                    <Input
                      value={testimonial.image}
                      onChange={(e) => updateTestimonial(index, { image: e.target.value })}
                      placeholder="https://... or /team/contributor.jpg"
                      className="h-9 font-mono text-xs"
                    />
                  </TabsContent>

                  <TabsContent value="upload" className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(index, file)
                        }}
                        disabled={uploadingIndex === index}
                        className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                      />
                    </div>
                    {uploadingIndex === index && (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading portrait...</span>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {testimonial.image && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-muted/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border bg-card shrink-0">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                      <p className="text-xs font-mono truncate text-muted-foreground">{testimonial.image}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmRemoveImage(index)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Quote / Transcript */}
              <div>
                <Label className="text-xs font-medium">Testimonial Quote / Statement</Label>
                <Textarea
                  value={testimonial.caption ?? testimonial.quote}
                  onChange={(e) => updateTestimonial(index, { caption: e.target.value, quote: e.target.value })}
                  rows={3}
                  placeholder="Share what the speaker observed..."
                  className="mt-1.5 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium">Focus Topic</Label>
                  <Input
                    value={testimonial.topic ?? ""}
                    onChange={(e) => updateTestimonial(index, { topic: e.target.value })}
                    placeholder="e.g. Autism inclusion, early intervention"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Video Interview URL (optional)</Label>
                  <Input
                    value={testimonial.video ?? ""}
                    onChange={(e) => updateTestimonial(index, { video: e.target.value })}
                    placeholder="https://.../interview.mp4"
                    className="mt-1.5 h-9 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Live Card Preview */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs italic text-foreground mb-3 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {testimonial.image ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-border shrink-0 bg-card">
                      <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {testimonial.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-xs text-foreground">{testimonial.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {testimonial.role}{testimonial.location ? ` • ${testimonial.location}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(testimonials.testimonials || []).length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20">
            <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No testimonials recorded</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add quotes and stories from partners, educators, and families.
            </p>
            <Button onClick={addTestimonial} size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add First Testimonial
            </Button>
          </div>
        )}
      </div>

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Contributor Portrait?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the photo from this testimonial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => imageToDelete && handleRemoveImage(imageToDelete.index)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Testimonial Confirmation Dialog */}
      <AlertDialog open={deleteTestimonialDialogOpen} onOpenChange={setDeleteTestimonialDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{testimonialToDelete?.testimonial.name}&rdquo;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => testimonialToDelete && deleteTestimonial(testimonialToDelete.index)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Testimonial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
