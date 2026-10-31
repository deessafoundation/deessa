"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FancySelect } from "@/components/ui/fancy-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  UploadCloud,
  Link as LinkIcon,
  X,
  Laptop,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react"
import type { HomepageHeroCarouselSettings, HeroCarouselSlide } from "@/lib/types/homepage-settings"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface HeroCarouselManagerProps {
  heroCarousel: HomepageHeroCarouselSettings
  onChange: (heroCarousel: HomepageHeroCarouselSettings) => void
}

/**
 * Compact, high-craft file upload component designed specifically for hero carousel slides.
 * Provides drag-and-drop, direct file browsing, instant URL mode toggle, active asset preview,
 * and quick replacement without excessive vertical footprint.
 */
interface CompactMediaUploadProps {
  label: string
  sublabel: string
  aspectRatio: "16/9" | "9/16"
  aspectBadge: string
  recommendedSize: string
  currentUrl: string
  isUploading: boolean
  onUploadFile: (file: File) => void
  onUrlChange: (url: string) => void
  onRemove: () => void
  fallbackNotice?: string
}

function CompactMediaUpload({
  label,
  sublabel,
  aspectRatio,
  aspectBadge,
  recommendedSize,
  currentUrl,
  isUploading,
  onUploadFile,
  onUrlChange,
  onRemove,
  fallbackNotice,
}: CompactMediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isUploading) setIsDragging(true)
  }, [isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (isUploading) return
      const file = e.dataTransfer.files?.[0]
      if (file) onUploadFile(file)
    },
    [isUploading, onUploadFile]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUploadFile(file)
    e.target.value = ""
  }

  const hasImage = Boolean(currentUrl && currentUrl.trim().length > 0)

  return (
    <div className="space-y-2">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-800">{label}</span>
          <span className="text-[11px] text-slate-400 ml-1.5 hidden sm:inline">({recommendedSize})</span>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <LinkIcon className="h-3 w-3" />
          <span>{showUrlInput ? "Use File Upload" : "Enter URL"}</span>
        </button>
      </div>

      {/* Manual URL Input Overlay */}
      {showUrlInput ? (
        <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-white">
          <Input
            value={currentUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://... or /home/hero/art_banner.jpeg"
            className="text-xs h-9 font-mono"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Paste a direct HTTPS image URL or a local `/public` path.</span>
            {hasImage && (
              <button
                type="button"
                onClick={onRemove}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      ) : hasImage ? (
        /* Active Asset Preview Card */
        <div className="group relative flex items-center gap-3.5 p-2.5 sm:p-3 rounded-xl border border-slate-200/90 bg-white shadow-xs transition-all hover:border-slate-300">
          {/* Thumbnail */}
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-inner",
              aspectRatio === "16/9" ? "w-24 sm:w-28 aspect-[16/9]" : "w-14 sm:w-16 aspect-[9/16]"
            )}
          >
            <img
              src={currentUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230f172a"/><text y="52" x="50" text-anchor="middle" fill="%2394a3b8" font-size="10">Missing</text></svg>'
              }}
            />
            <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.2 text-[8px] font-bold text-white tracking-wider uppercase backdrop-blur-xs">
              {aspectBadge}
            </span>
          </div>

          {/* Asset Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-800">Asset Ready</span>
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline truncate max-w-[200px]">
                {currentUrl.split("/").pop()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">{sublabel}</p>
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={onRemove}
                disabled={isUploading}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />
        </div>
      ) : (
        /* Compact Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isUploading) {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          tabIndex={isUploading ? -1 : 0}
          role="button"
          aria-label={`Upload image for ${label}`}
          className={cn(
            "group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl border border-dashed text-center transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
            isDragging
              ? "border-sky-500 bg-sky-50/80 scale-[1.01]"
              : "border-slate-300 bg-white/70 hover:border-sky-400 hover:bg-sky-50/30",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            <div className="flex items-center gap-2.5 py-1 text-sky-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs font-semibold">Uploading to secure storage...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100 group-hover:scale-105 group-hover:bg-sky-600 group-hover:text-white transition-all duration-150">
                <UploadCloud className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800">
                  Drop image here, or <span className="text-sky-600 underline underline-offset-2">browse files</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  {recommendedSize} • JPG, PNG, WebP up to 5MB
                </p>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />
        </div>
      )}

      {/* Fallback Notice for Optional Mobile Slot */}
      {fallbackNotice && !hasImage && !showUrlInput && (
        <p className="text-[11px] text-slate-400 italic px-1">{fallbackNotice}</p>
      )}
    </div>
  )
}

export default function HeroCarouselManager({ heroCarousel, onChange }: HeroCarouselManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [uploadingTarget, setUploadingTarget] = useState<{ index: number; type: "desktop" | "mobile" } | null>(null)
  const [previewModes, setPreviewModes] = useState<Record<string, "desktop" | "mobile">>({})

  const updateSettings = (updates: Partial<HomepageHeroCarouselSettings>) => {
    onChange({ ...heroCarousel, ...updates })
  }

  const addSlide = () => {
    const newSlide: HeroCarouselSlide = {
      id: `slide-${Date.now()}`,
      image: "",
      mobileImage: "",
      title: "New Slide Title",
      subtitle: "Add your subtitle here",
      cta: "Learn More",
      ctaHref: "/",
      ctaVariant: "primary",
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

  const getPreviewMode = (slideId: string): "desktop" | "mobile" => {
    return previewModes[slideId] || "desktop"
  }

  const setPreviewMode = (slideId: string, mode: "desktop" | "mobile") => {
    setPreviewModes((prev) => ({ ...prev, [slideId]: mode }))
  }

  const handleImageUpload = async (index: number, type: "desktop" | "mobile", file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      notifications.showError({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image.",
      })
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      notifications.showError({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
      })
      return
    }

    setUploadingTarget({ index, type })
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "homepage-hero")
      formData.append("customName", `hero-slide-${index + 1}-${type}`)

      const currentImage = type === "desktop" ? heroCarousel.slides[index].image : heroCarousel.slides[index].mobileImage
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
      if (type === "desktop") {
        updateSlide(index, { image: data.url })
      } else {
        updateSlide(index, { mobileImage: data.url })
      }

      notifications.showSuccess({
        title: "Image uploaded",
        description: `Slide ${index + 1} ${type === "desktop" ? "desktop" : "mobile"} image has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      notifications.showError({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload image. Please try again.",
      })
    } finally {
      setUploadingTarget(null)
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
      {/* Top Header Card */}
      <Card className="border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Hero Carousel Manager</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Configure full-width hero slideshow banners with responsive desktop and mobile visual art direction.
              </CardDescription>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
              <Sparkles className="h-3 w-3" />
              <span>{heroCarousel.slides.length} Slides</span>
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          {/* Timing and AutoPlay Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Slide Interval</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={heroCarousel.interval}
                  onChange={(e) => updateSettings({ interval: parseInt(e.target.value) || 6000 })}
                  min={3000}
                  max={15000}
                  step={1000}
                  className="h-8 text-xs font-mono w-28 bg-white"
                />
                <span className="text-xs text-slate-400">milliseconds ({((heroCarousel.interval || 6000) / 1000).toFixed(1)}s)</span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end sm:gap-4 pt-1 sm:pt-0">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Auto Advance</Label>
                <p className="text-[11px] text-slate-400">Cycle through slides automatically</p>
              </div>
              <Switch
                checked={heroCarousel.autoPlay}
                onCheckedChange={(checked) => updateSettings({ autoPlay: checked })}
              />
            </div>
          </div>

          {/* Add Slide Primary Action */}
          <Button onClick={addSlide} variant="outline" className="w-full h-10 border-dashed border-slate-300 hover:border-slate-400 text-xs font-semibold">
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Slide
          </Button>

          {/* Slides List */}
          <div className="space-y-5">
            {heroCarousel.slides.map((slide, index) => {
              const slideKey = slide.id || `slide-${index}`
              const currentPreviewMode = getPreviewMode(slideKey)
              const isUploadingDesktop = uploadingTarget?.index === index && uploadingTarget.type === "desktop"
              const isUploadingMobile = uploadingTarget?.index === index && uploadingTarget.type === "mobile"

              return (
                <Card
                  key={slideKey}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "border border-slate-200/90 shadow-xs transition-all overflow-hidden",
                    !slide.visible && "opacity-60 bg-slate-50/40",
                    draggedIndex === index && "opacity-40 ring-2 ring-sky-500"
                  )}
                >
                  {/* Slide Title Bar */}
                  <CardHeader className="py-2.5 px-4 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-200/80 text-[11px] font-bold text-slate-700 font-mono">
                          {index + 1}
                        </span>
                        <CardTitle className="text-sm font-semibold text-slate-800 truncate max-w-[240px] sm:max-w-md">
                          {slide.title || "Untitled Slide"}
                        </CardTitle>
                        {!slide.visible && (
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            Hidden
                          </span>
                        )}
                        {slide.mobileImage ? (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.5 rounded font-medium">
                            <Smartphone className="w-2.5 h-2.5" /> Mobile Ready
                          </span>
                        ) : (
                          <span className="hidden sm:inline-flex text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            Auto Fallback
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(index)}
                          title={slide.visible ? "Hide slide" : "Show slide"}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800"
                        >
                          {slide.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSlide(index)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 space-y-5">
                    {/* 1. VISUAL MEDIA TABS */}
                    <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Slide Visual Assets
                        </Label>
                        <span className="text-[11px] text-slate-400">
                          {slide.mobileImage ? "Dual responsive artwork configured" : "Single image with auto-framing"}
                        </span>
                      </div>

                      <Tabs defaultValue="desktop" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-9 p-0.5 bg-slate-200/60 rounded-lg">
                          <TabsTrigger
                            value="desktop"
                            className="flex items-center justify-center gap-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
                          >
                            <Laptop className="h-3.5 w-3.5" />
                            <span>Desktop (16:9)</span>
                            {slide.image && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-0.5" />}
                          </TabsTrigger>
                          <TabsTrigger
                            value="mobile"
                            className="flex items-center justify-center gap-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs"
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                            <span>Mobile (Portrait)</span>
                            {slide.mobileImage ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-0.5" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Optional)</span>
                            )}
                          </TabsTrigger>
                        </TabsList>

                        {/* Desktop Image Tab */}
                        <TabsContent value="desktop" className="pt-3 space-y-2">
                          <CompactMediaUpload
                            label="Desktop Widescreen Banner"
                            sublabel="Displayed on laptops, desktop monitors, and widescreen tablets (≥ 768px)."
                            aspectRatio="16/9"
                            aspectBadge="16:9 Widescreen"
                            recommendedSize="1920 × 1080px"
                            currentUrl={slide.image}
                            isUploading={isUploadingDesktop}
                            onUploadFile={(file) => handleImageUpload(index, "desktop", file)}
                            onUrlChange={(url) => updateSlide(index, { image: url })}
                            onRemove={() => updateSlide(index, { image: "" })}
                          />
                        </TabsContent>

                        {/* Mobile Image Tab */}
                        <TabsContent value="mobile" className="pt-3 space-y-2">
                          <CompactMediaUpload
                            label="Mobile Portrait Banner"
                            sublabel="Tailored framing for smartphones (< 768px) with zero lateral face cropping."
                            aspectRatio="9/16"
                            aspectBadge="9:16 Portrait"
                            recommendedSize="1080 × 1350px or 1080 × 1920px"
                            currentUrl={slide.mobileImage || ""}
                            isUploading={isUploadingMobile}
                            onUploadFile={(file) => handleImageUpload(index, "mobile", file)}
                            onUrlChange={(url) => updateSlide(index, { mobileImage: url })}
                            onRemove={() => updateSlide(index, { mobileImage: "" })}
                            fallbackNotice="Optional: If left unassigned, phones automatically display the desktop image with centered focal framing."
                          />
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* 2. TEXT AND CALL TO ACTION */}
                    <div className="space-y-3.5">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Slide Heading</Label>
                        <Input
                          value={slide.title}
                          onChange={(e) => updateSlide(index, { title: e.target.value })}
                          placeholder="e.g. Every child deserves space to thrive"
                          className="mt-1 h-9 text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Subtitle / Description</Label>
                        <Textarea
                          value={slide.subtitle}
                          onChange={(e) => updateSlide(index, { subtitle: e.target.value })}
                          placeholder="Supporting copy for this campaign slide"
                          rows={2}
                          className="mt-1 text-xs resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Button Label</Label>
                          <Input
                            value={slide.cta}
                            onChange={(e) => updateSlide(index, { cta: e.target.value })}
                            placeholder="Learn More"
                            className="mt-1 h-9 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Button Target URL</Label>
                          <Input
                            value={slide.ctaHref}
                            onChange={(e) => updateSlide(index, { ctaHref: e.target.value })}
                            placeholder="/about"
                            className="mt-1 h-9 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Button Styling</Label>
                          <div className="mt-1">
                            <FancySelect
                              value={slide.ctaVariant || "primary"}
                              onValueChange={(value) =>
                                updateSlide(index, { ctaVariant: value as "primary" | "secondary" })
                              }
                              options={[
                                { value: "primary", label: "Primary (Solid Blue)" },
                                { value: "secondary", label: "Secondary (White Outline)" },
                              ]}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. INTERACTIVE RESPONSIVE PREVIEW */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Live Responsive Preview
                        </Label>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => setPreviewMode(slideKey, "desktop")}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                              currentPreviewMode === "desktop"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            )}
                          >
                            <Laptop className="w-3.5 h-3.5" />
                            <span>Desktop 16:9</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewMode(slideKey, "mobile")}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                              currentPreviewMode === "mobile"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            )}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Mobile 9:16</span>
                          </button>
                        </div>
                      </div>

                      {currentPreviewMode === "desktop" ? (
                        /* Desktop Browser Simulation */
                        <div className="relative w-full aspect-[16/7] min-h-[190px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center">
                          {slide.image ? (
                            <img
                              src={slide.image}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
                              No desktop image selected
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/20" />
                          <div className="relative z-10 p-5 sm:p-7 max-w-lg text-white">
                            <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase mb-2 backdrop-blur-xs text-white">
                              A society where everyone is understood
                            </span>
                            <h4 className="text-base sm:text-xl font-bold leading-tight mb-1 text-white line-clamp-2">
                              {slide.title || "Slide Title"}
                            </h4>
                            <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                              {slide.subtitle || "Slide subtitle will appear here."}
                            </p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 text-white shadow-sm">
                              <span>{slide.cta || "Learn More"}</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Mobile Smartphone Silhouette */
                        <div className="py-2 flex flex-col items-center">
                          <div className="relative w-[230px] h-[370px] rounded-[28px] overflow-hidden bg-slate-950 border-4 border-slate-700 shadow-xl flex flex-col justify-start pt-[22%] pb-4 px-3.5">
                            {/* Smartphone Speaker Island */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-3.5 w-16 bg-slate-800 rounded-full z-20" />

                            {/* Background Image: mobileImage || desktop fallback */}
                            {(slide.mobileImage || slide.image) ? (
                              <img
                                src={slide.mobileImage || slide.image}
                                alt=""
                                className={cn(
                                  "absolute inset-0 w-full h-full object-cover",
                                  !slide.mobileImage && "object-[50%_25%]"
                                )}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-500 text-xs text-center px-4">
                                No image selected
                              </div>
                            )}

                            {/* Mobile Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/60" />

                            {/* Framing Source Badge */}
                            <div className="absolute top-7 left-3 right-3 flex justify-between items-center z-10">
                              <span
                                className={cn(
                                  "text-[8px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-xs uppercase tracking-wider",
                                  slide.mobileImage
                                    ? "bg-emerald-500/90 text-white"
                                    : "bg-amber-500/90 text-white"
                                )}
                              >
                                {slide.mobileImage ? "Mobile Crop" : "Auto-Crop"}
                              </span>
                              <span className="text-[8px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded font-mono">
                                9:16
                              </span>
                            </div>

                            {/* Mobile Typography & CTA (Shifted upward to preserve landscape artwork) */}
                            <div className="relative z-10 text-white mt-1">
                              <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-semibold mb-1.5 backdrop-blur-xs text-white">
                                A society where everyone is understood
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold leading-tight mb-1 text-white line-clamp-2">
                                {slide.title || "Slide Title"}
                              </h4>
                              <p className="text-[10px] text-slate-300 line-clamp-2 mb-2 leading-snug">
                                {slide.subtitle || "Slide subtitle will appear here."}
                              </p>
                              <div className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 text-white shadow-sm">
                                <span>{slide.cta || "Learn More"}</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">
                            {slide.mobileImage
                              ? "✓ Dedicated portrait mobile asset rendered"
                              : "ℹ Using desktop image with centered mobile framing"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {heroCarousel.slides.length === 0 && (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">No slides added yet. Click "Add New Slide" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
