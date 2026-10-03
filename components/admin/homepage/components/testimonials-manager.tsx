"use client"

import { useState } from "react"
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
import { Plus, Trash2, GripVertical, Eye, EyeOff, Star, Upload, Link as LinkIcon, X } from "lucide-react"
import type { HomepageTestimonialsSettings, HomepageTestimonial } from "@/lib/types/homepage-settings"
import { notifications } from "@/lib/notifications"

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
  const [testimonialToDelete, setTestimonialToDelete] = useState<{ index: number; testimonial: HomepageTestimonial } | null>(null)

  const updateTestimonials = (newTestimonials: HomepageTestimonial[]) => {
    onChange({ testimonials: newTestimonials })
  }

  const addTestimonial = () => {
    const newTestimonial: HomepageTestimonial = {
      id: `testimonial-${Date.now()}`,
      name: 'New Person',
      role: 'Role',
      location: 'Location',
      image: '',
      video: '',
      topic: '',
      caption: '',
      quote: 'Add testimonial quote here...',
      rating: 5,
      order: testimonials.testimonials.length + 1,
      visible: true,
      featured: false,
    }
    updateTestimonials([...testimonials.testimonials, newTestimonial])
  }

  const updateTestimonial = (index: number, updates: Partial<HomepageTestimonial>) => {
    const newTestimonials = [...testimonials.testimonials]
    newTestimonials[index] = { ...newTestimonials[index], ...updates }
    updateTestimonials(newTestimonials)
  }

  const deleteTestimonial = (index: number) => {
    const testimonial = testimonials.testimonials[index]
    
    // If testimonial has an uploaded image, delete it from storage
    if (testimonial.image && testimonial.image.includes('/storage/v1/object/public/testimonials/')) {
      fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: testimonial.image }),
      }).catch((error) => {
        console.warn('Failed to delete testimonial image:', error)
      })
    }
    
    const newTestimonials = testimonials.testimonials.filter((_, i) => i !== index)
    updateTestimonials(newTestimonials)
    
    notifications.showSuccess({
      title: "Testimonial deleted",
      description: "The testimonial has been removed successfully.",
    })
    
    // Close dialog and reset state
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

  // Handle image removal (delete from storage)
  const handleRemoveImage = async (index: number) => {
    const imageUrl = testimonials.testimonials[index].image
    
    // If it's a storage URL, delete it from storage
    if (imageUrl && imageUrl.includes('/storage/v1/object/public/testimonials/')) {
      try {
        const response = await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        })

        if (!response.ok) {
          console.warn('Failed to delete image from storage')
        }
      } catch (error) {
        console.warn('Error deleting image:', error)
        // Continue anyway - we'll still clear the URL from the testimonial
      }
    }

    // Clear the image URL from the testimonial
    updateTestimonial(index, { image: '' })
    
    notifications.showSuccess({
      title: "Image removed",
      description: "The testimonial image has been removed.",
    })
    
    // Close dialog and reset state
    setDeleteDialogOpen(false)
    setImageToDelete(null)
  }

  // Open confirmation dialog
  const confirmRemoveImage = (index: number) => {
    const imageUrl = testimonials.testimonials[index].image
    if (imageUrl) {
      setImageToDelete({ index, url: imageUrl })
      setDeleteDialogOpen(true)
    }
  }

  // Image upload handler
  const handleImageUpload = async (index: number, file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      notifications.showError({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image.",
      })
      return
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      notifications.showError({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
      })
      return
    }

    setUploadingIndex(index)

    // Store old image URL for cleanup
    const oldImageUrl = testimonials.testimonials[index].image
    const testimonialName = testimonials.testimonials[index].name

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'testimonials')
      formData.append('customName', testimonialName) // Send testimonial name for filename
      
      // If there's an old image from our storage, include it for deletion
      if (oldImageUrl && oldImageUrl.includes('/storage/v1/object/public/testimonials/')) {
        // Extract the file path from the URL
        const urlParts = oldImageUrl.split('/storage/v1/object/public/testimonials/')
        if (urlParts[1]) {
          formData.append('oldFilePath', urlParts[1])
        }
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      updateTestimonial(index, { image: data.url })
      
      notifications.showSuccess({
        title: "Image uploaded",
        description: "Testimonial image has been uploaded successfully.",
      })
    } catch (error) {
      notifications.showError({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
      })
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newTestimonials = [...testimonials.testimonials]
    const draggedItem = newTestimonials[draggedIndex]
    newTestimonials.splice(draggedIndex, 1)
    newTestimonials.splice(index, 0, draggedItem)

    // Update order
    newTestimonials.forEach((item, i) => {
      item.order = i + 1
    })

    updateTestimonials(newTestimonials)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            Manage testimonials displayed on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Testimonial Button */}
          <Button onClick={addTestimonial} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add New Testimonial
          </Button>

          {/* Testimonials List */}
          <div className="space-y-4">
            {testimonials.testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`${!testimonial.visible ? 'opacity-50' : ''} ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      {testimonial.featured && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                      {!testimonial.visible && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Hidden</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(index)}
                        title={testimonial.featured ? 'Unfeature' : 'Feature'}
                      >
                        <Star className={`w-4 h-4 ${testimonial.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(index)}
                        title={testimonial.visible ? 'Hide' : 'Show'}
                      >
                        {testimonial.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDeleteTestimonial(index)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete testimonial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Person Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, { name: e.target.value })}
                        placeholder="Full Name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={testimonial.role}
                        onChange={(e) => updateTestimonial(index, { role: e.target.value })}
                        placeholder="Parent, Volunteer, etc."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={testimonial.location}
                        onChange={(e) => updateTestimonial(index, { location: e.target.value })}
                        placeholder="City, District"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <Label>Profile Image</Label>
                    <Tabs defaultValue="url" className="mt-2">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url" className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          URL
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="url" className="space-y-2">
                        <Input
                          value={testimonial.image}
                          onChange={(e) => updateTestimonial(index, { image: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-xs text-gray-500">
                          Enter a direct URL to an image (JPG, PNG, WebP)
                        </p>
                      </TabsContent>
                      
                      <TabsContent value="upload" className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            id={`file-upload-${index}`}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(index, file)
                            }}
                            disabled={uploadingIndex === index}
                            className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gradient-to-r file:from-cyan-500 file:to-sky-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:shadow-lg file:shadow-cyan-500/25 hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          {testimonial.image && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmRemoveImage(index)}
                              title="Remove image"
                              className="shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Max 2MB • JPG, PNG, or WebP • Square images work best
                        </p>
                        {uploadingIndex === index && (
                          <div className="flex items-center gap-2 text-xs text-primary">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <span>Uploading...</span>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                    
                    {testimonial.image && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23f3f4f6" width="80" height="80"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">No Image</text></svg>'
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">
                          <p className="font-medium">Preview</p>
                          <p className="truncate max-w-[200px]">{testimonial.image}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quote */}
                  <div>
                    <Label>Video Caption / Key Message</Label>
                    <Textarea
                      value={testimonial.caption ?? testimonial.quote}
                      onChange={(e) => updateTestimonial(index, { caption: e.target.value, quote: e.target.value })}
                      placeholder="Summarise what the speaker says..."
                      rows={3}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">{(testimonial.caption ?? testimonial.quote).length} characters</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Topic</Label>
                      <Input
                        value={testimonial.topic ?? ''}
                        onChange={(e) => updateTestimonial(index, { topic: e.target.value })}
                        placeholder="Autism awareness, education, inclusion..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Video URL</Label>
                      <Input
                        value={testimonial.video ?? ''}
                        onChange={(e) => updateTestimonial(index, { video: e.target.value })}
                        placeholder="https://…/speaker-message.mp4"
                        className="mt-1"
                      />
                      <p className="mt-1 text-xs text-gray-500">Use a direct MP4 or a public Supabase Storage link.</p>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm italic text-gray-700 mb-3">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      {testimonial.image && (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                          <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-gray-600">{testimonial.role}, {testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {testimonials.testimonials.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No testimonials added yet. Click "Add New Testimonial" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Tips:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
            <li>Use real photos for authenticity (with permission)</li>
            <li>Keep quotes concise and impactful (150-200 characters ideal)</li>
            <li>Feature your best testimonials to highlight them</li>
            <li>Drag to reorder testimonials</li>
            <li>Include diverse voices (parents, volunteers, beneficiaries)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image Permanently?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will permanently delete the image from storage. This action cannot be undone.
              </p>
              {imageToDelete?.url && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
                      <img
                        src={imageToDelete.url}
                        alt="Image to delete"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-gray-600 overflow-hidden">
                      <p className="font-medium text-gray-900 mb-1">
                        {testimonials.testimonials[imageToDelete.index]?.name}'s Photo
                      </p>
                      <p className="text-gray-500">Profile image</p>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => imageToDelete && handleRemoveImage(imageToDelete.index)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Testimonial Confirmation Dialog */}
      <AlertDialog open={deleteTestimonialDialogOpen} onOpenChange={setDeleteTestimonialDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will permanently delete this testimonial and its image (if uploaded). This action cannot be undone.
              </p>
              {testimonialToDelete && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border space-y-3">
                  <div className="flex items-center gap-3">
                    {testimonialToDelete.testimonial.image && (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
                        <img
                          src={testimonialToDelete.testimonial.image}
                          alt={testimonialToDelete.testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {testimonialToDelete.testimonial.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {testimonialToDelete.testimonial.role}, {testimonialToDelete.testimonial.location}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs italic text-gray-700">
                      "{testimonialToDelete.testimonial.quote.substring(0, 100)}
                      {testimonialToDelete.testimonial.quote.length > 100 ? '...' : ''}"
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => testimonialToDelete && deleteTestimonial(testimonialToDelete.index)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Testimonial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
