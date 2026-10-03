"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FancySelect } from "@/components/ui/fancy-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, GripVertical, Eye, EyeOff, Upload, Link as LinkIcon, X } from "lucide-react"
import type { HomepageHeroCarouselSettings, HeroCarouselSlide } from "@/lib/types/homepage-settings"
import { notifications } from "@/lib/notifications"

interface HeroCarouselManagerProps {
  heroCarousel: HomepageHeroCarouselSettings
  onChange: (heroCarousel: HomepageHeroCarouselSettings) => void
}

export default function HeroCarouselManager({ heroCarousel, onChange }: HeroCarouselManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  const updateSettings = (updates: Partial<HomepageHeroCarouselSettings>) => {
    onChange({ ...heroCarousel, ...updates })
  }

  const addSlide = () => {
    const newSlide: HeroCarouselSlide = {
      id: `slide-${Date.now()}`,
      image: '',
      title: 'New Slide Title',
      subtitle: 'Add your subtitle here',
      cta: 'Learn More',
      ctaHref: '/',
      ctaVariant: 'primary',
      order: heroCarousel.slides.length + 1,
      visible: true,
    }
    updateSettings({ slides: [...heroCarousel.slides, newSlide] })
  }

  const updateSlide = (index: number, updates: Partial<HeroCarouselSlide>) => {
    const newSlides = [...heroCarousel.slides]
    newSlides[index] = { ...newSlides[index], ...updates }
    updateSettings({ slides: newSlides })
  }

  const deleteSlide = (index: number) => {
    const newSlides = heroCarousel.slides.filter((_, i) => i !== index)
    updateSettings({ slides: newSlides })
  }

  const toggleVisibility = (index: number) => {
    updateSlide(index, { visible: !heroCarousel.slides[index].visible })
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

    const maxSize = 5 * 1024 * 1024 // 5MB (hero images are full-screen)
    if (file.size > maxSize) {
      notifications.showError({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
      })
      return
    }

    setUploadingIndex(index)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "homepage-hero")
      formData.append("customName", `hero-slide-${index + 1}`)

      const currentImage = heroCarousel.slides[index].image
      if (currentImage?.includes("/storage/v1/object/public/")) {
        const urlParts = currentImage.split("/storage/v1/object/public/")[1]
        if (urlParts) {
          formData.append("oldFilePath", urlParts.split("/").slice(1).join("/"))
        }
      }

      const response = await fetch("/api/upload", { method: "POST", body: formData })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      updateSlide(index, { image: data.url })

      notifications.showSuccess({
        title: "Image uploaded",
        description: `Slide ${index + 1} image has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      notifications.showError({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload image. Please try again.",
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

    const newSlides = [...heroCarousel.slides]
    const draggedSlide = newSlides[draggedIndex]
    newSlides.splice(draggedIndex, 1)
    newSlides.splice(index, 0, draggedSlide)

    // Update order
    newSlides.forEach((slide, i) => {
      slide.order = i + 1
    })

    updateSettings({ slides: newSlides })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Carousel Settings</CardTitle>
          <CardDescription>
            Manage the hero carousel slides displayed at the top of the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Slide Interval (ms)</Label>
              <Input
                type="number"
                value={heroCarousel.interval}
                onChange={(e) => updateSettings({ interval: parseInt(e.target.value) || 6000 })}
                min={3000}
                max={15000}
                step={1000}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Time between slide transitions (3000-15000ms)</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Play</Label>
                <p className="text-xs text-gray-500">Automatically advance slides</p>
              </div>
              <Switch
                checked={heroCarousel.autoPlay}
                onCheckedChange={(checked) => updateSettings({ autoPlay: checked })}
              />
            </div>
          </div>

          {/* Add Slide Button */}
          <Button onClick={addSlide} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add New Slide
          </Button>

          {/* Slides List */}
          <div className="space-y-4">
            {heroCarousel.slides.map((slide, index) => (
              <Card
                key={slide.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`${!slide.visible ? 'opacity-50' : ''} ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                      <CardTitle className="text-base">Slide {index + 1}</CardTitle>
                      {!slide.visible && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Hidden</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(index)}
                        title={slide.visible ? 'Hide slide' : 'Show slide'}
                      >
                        {slide.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSlide(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Slide Image — upload directly or paste a URL */}
                  <div>
                    <Label>Slide Image</Label>
                    <Tabs defaultValue="upload" className="mt-2">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload
                        </TabsTrigger>
                        <TabsTrigger value="url" className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          URL
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload" className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(index, file)
                              e.target.value = ""
                            }}
                            disabled={uploadingIndex === index}
                            className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gradient-to-r file:from-cyan-500 file:to-sky-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:shadow-lg file:shadow-cyan-500/25 hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          {slide.image && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateSlide(index, { image: "" })}
                              title="Remove image"
                              className="shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Max 5MB • JPG, PNG, or WebP • landscape works best (1920x1080px+)</p>
                        {uploadingIndex === index && (
                          <div className="flex items-center gap-2 text-xs text-primary">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span>Uploading...</span>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="url" className="space-y-2">
                        <Input
                          value={slide.image}
                          onChange={(e) => updateSlide(index, { image: e.target.value })}
                          placeholder="https://... or /image.jpg"
                        />
                        <p className="text-xs text-gray-500">Enter a direct URL to an image, or a path from the public folder</p>
                      </TabsContent>
                    </Tabs>

                    {slide.image && (
                      <div className="mt-2 relative h-32 rounded-lg overflow-hidden border">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={slide.title}
                      onChange={(e) => updateSlide(index, { title: e.target.value })}
                      placeholder="Slide title"
                      className="mt-1"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <Label>Subtitle</Label>
                    <Textarea
                      value={slide.subtitle}
                      onChange={(e) => updateSlide(index, { subtitle: e.target.value })}
                      placeholder="Slide subtitle or description"
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  {/* CTA */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>CTA Button Text</Label>
                      <Input
                        value={slide.cta}
                        onChange={(e) => updateSlide(index, { cta: e.target.value })}
                        placeholder="Learn More"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>CTA Link</Label>
                      <Input
                        value={slide.ctaHref}
                        onChange={(e) => updateSlide(index, { ctaHref: e.target.value })}
                        placeholder="/page"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* CTA Variant */}
                  <div>
                    <Label>CTA Button Style</Label>
                    <FancySelect
                      value={slide.ctaVariant || 'primary'}
                      onValueChange={(value) => updateSlide(index, { ctaVariant: value as 'primary' | 'secondary' })}
                      options={[
                        { value: "primary", label: "Primary (Filled)" },
                        { value: "secondary", label: "Secondary (Outline)" },
                      ]}
                      size="sm"
                    />
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white">
                    <h3 className="text-xl font-bold mb-2">{slide.title}</h3>
                    <p className="text-sm opacity-90 mb-3">{slide.subtitle}</p>
                    <button className={`px-4 py-2 rounded text-sm font-semibold ${
                      slide.ctaVariant === 'primary' 
                        ? 'bg-white text-blue-600' 
                        : 'border-2 border-white text-white'
                    }`}>
                      {slide.cta}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {heroCarousel.slides.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No slides added yet. Click "Add New Slide" to get started.</p>
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
            <li>Use high-quality images (at least 1920x1080px)</li>
            <li>Keep titles short and impactful (under 60 characters)</li>
            <li>Drag slides to reorder them</li>
            <li>Hide slides temporarily without deleting them</li>
            <li>Recommended: 3-5 slides for optimal user experience</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
