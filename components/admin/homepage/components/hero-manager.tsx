"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Upload } from "lucide-react"

interface HomeHeroSettings {
  mainImage: string
  videoImage: string
  classroomImage: string
  donorImage1: string
  donorImage2: string
  title: string
  subtitle: string
  badge: string
}

interface HeroManagerProps {
  hero: HomeHeroSettings
  onChange: (hero: HomeHeroSettings) => void
}

export default function HeroManager({ hero, onChange }: HeroManagerProps) {
  const updateHero = (updates: Partial<HomeHeroSettings>) => {
    onChange({ ...hero, ...updates })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>
            Manage the main hero section content, images, and text displayed at the top of the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hero Text Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Badge Text</Label>
                <Input
                  value={hero.badge}
                  onChange={(e) => updateHero({ badge: e.target.value })}
                  placeholder="Est. 2014 • Kathmandu"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Small text displayed above the title</p>
              </div>

              <div>
                <Label>Main Title</Label>
                <Input
                  value={hero.title}
                  onChange={(e) => updateHero({ title: e.target.value })}
                  placeholder="Hope for Every Child."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Large headline text</p>
              </div>

              <div>
                <Label>Subtitle</Label>
                <Textarea
                  value={hero.subtitle}
                  onChange={(e) => updateHero({ subtitle: e.target.value })}
                  placeholder="We are rewriting the future of rural Nepal..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Descriptive text below the title</p>
              </div>

              {/* Preview */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white">
                <p className="text-xs font-semibold mb-2 opacity-90">{hero.badge}</p>
                <h2 className="text-3xl font-bold mb-2">{hero.title}</h2>
                <p className="text-sm opacity-90">{hero.subtitle}</p>
              </div>
            </CardContent>
          </Card>

          {/* Hero Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hero Images</CardTitle>
              <CardDescription>
                Manage the images displayed in the hero section and photo wall
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Hero Image */}
              <div>
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Main Hero Image
                </Label>
                <Input
                  value={hero.mainImage}
                  onChange={(e) => updateHero({ mainImage: e.target.value })}
                  placeholder="https://... or /image.jpg"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Primary background image for the hero section</p>
                {hero.mainImage && (
                  <div className="mt-2 relative h-32 rounded-lg overflow-hidden border">
                    <img 
                      src={hero.mainImage} 
                      alt="Main hero preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
                        e.currentTarget.alt = 'Invalid image URL'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Video/Animation Image */}
              <div>
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Video/Animation Image
                </Label>
                <Input
                  value={hero.videoImage}
                  onChange={(e) => updateHero({ videoImage: e.target.value })}
                  placeholder="/video.mp4 or /animation.gif"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Video or animated content for the hero section</p>
              </div>

              {/* Classroom Image */}
              <div>
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Classroom/Education Image
                </Label>
                <Input
                  value={hero.classroomImage}
                  onChange={(e) => updateHero({ classroomImage: e.target.value })}
                  placeholder="https://... or /classroom.jpg"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Image showing education/classroom activities</p>
                {hero.classroomImage && (
                  <div className="mt-2 relative h-32 rounded-lg overflow-hidden border">
                    <img 
                      src={hero.classroomImage} 
                      alt="Classroom preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Donor Image 1 */}
              <div>
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Donor/Community Image 1
                </Label>
                <Input
                  value={hero.donorImage1}
                  onChange={(e) => updateHero({ donorImage1: e.target.value })}
                  placeholder="https://... or /donor1.jpg"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">First donor or community engagement image</p>
                {hero.donorImage1 && (
                  <div className="mt-2 relative h-32 rounded-lg overflow-hidden border">
                    <img 
                      src={hero.donorImage1} 
                      alt="Donor 1 preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Donor Image 2 */}
              <div>
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Donor/Community Image 2
                </Label>
                <Input
                  value={hero.donorImage2}
                  onChange={(e) => updateHero({ donorImage2: e.target.value })}
                  placeholder="https://... or /donor2.jpg"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Second donor or community engagement image</p>
                {hero.donorImage2 && (
                  <div className="mt-2 relative h-32 rounded-lg overflow-hidden border">
                    <img 
                      src={hero.donorImage2} 
                      alt="Donor 2 preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Image Tips:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
            <li>Use high-quality images (at least 1920x1080px for hero)</li>
            <li>Optimize images before uploading (compress to reduce file size)</li>
            <li>Use HTTPS URLs for external images</li>
            <li>Test images on mobile devices</li>
            <li>Ensure images have appropriate alt text for accessibility</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <p className="text-sm text-amber-900">
            <strong>📸 Photo Wall:</strong> The classroom and donor images are used in the photo wall collage 
            displayed on the Impact page. Update these to refresh the visual storytelling.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
