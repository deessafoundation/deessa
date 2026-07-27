"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FancySelect } from "@/components/ui/fancy-select"
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react"
import type { HomepageHeroCarouselSettings, HeroCarouselSlide } from "@/lib/types/homepage-settings"

interface HeroCarouselManagerProps {
  heroCarousel: HomepageHeroCarouselSettings
  onChange: (heroCarousel: HomepageHeroCarouselSettings) => void
}

export default function HeroCarouselManager({ heroCarousel, onChange }: HeroCarouselManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

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
                  {/* Image URL */}
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={slide.image}
                      onChange={(e) => updateSlide(index, { image: e.target.value })}
                      placeholder="https://... or /image.jpg"
                      className="mt-1"
                    />
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
