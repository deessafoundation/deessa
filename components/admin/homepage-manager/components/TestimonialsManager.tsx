"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, GripVertical, Eye, EyeOff, Star } from "lucide-react"
import type { HomepageTestimonialsSettings, HomepageTestimonial } from "@/lib/types/homepage-settings"

interface TestimonialsManagerProps {
  testimonials: HomepageTestimonialsSettings
  onChange: (testimonials: HomepageTestimonialsSettings) => void
}

export default function TestimonialsManager({ testimonials, onChange }: TestimonialsManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

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
    const newTestimonials = testimonials.testimonials.filter((_, i) => i !== index)
    updateTestimonials(newTestimonials)
  }

  const toggleVisibility = (index: number) => {
    updateTestimonial(index, { visible: !testimonials.testimonials[index].visible })
  }

  const toggleFeatured = (index: number) => {
    updateTestimonial(index, { featured: !testimonials.testimonials[index].featured })
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
                        onClick={() => deleteTestimonial(index)}
                        className="text-red-600 hover:text-red-700"
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
                    <Label>Image URL</Label>
                    <Input
                      value={testimonial.image}
                      onChange={(e) => updateTestimonial(index, { image: e.target.value })}
                      placeholder="https://... or /image.jpg"
                      className="mt-1"
                    />
                    {testimonial.image && (
                      <div className="mt-2 relative w-20 h-20 rounded-full overflow-hidden border">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Quote */}
                  <div>
                    <Label>Testimonial Quote</Label>
                    <Textarea
                      value={testimonial.quote}
                      onChange={(e) => updateTestimonial(index, { quote: e.target.value })}
                      placeholder="What they said about us..."
                      rows={3}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">{testimonial.quote.length} characters</p>
                  </div>

                  {/* Rating */}
                  <div>
                    <Label>Rating (1-5 stars)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={testimonial.rating}
                        onChange={(e) => updateTestimonial(index, { rating: Math.min(5, Math.max(1, parseInt(e.target.value) || 5)) })}
                        min={1}
                        max={5}
                        className="w-20"
                      />
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= testimonial.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= testimonial.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
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
    </div>
  )
}
