"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Upload, Link as LinkIcon, X } from "lucide-react"
import type { HomepageStorySettings } from "@/lib/types/homepage-settings"
import { notifications } from "@/lib/notifications"

interface StoryManagerProps {
  story: HomepageStorySettings
  onChange: (story: HomepageStorySettings) => void
}

export default function StoryManager({ story, onChange }: StoryManagerProps) {
  const [isUploading, setIsUploading] = useState(false)

  const update = (updates: Partial<HomepageStorySettings>) => {
    onChange({ ...story, ...updates })
  }

  const handleImageUpload = async (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      notifications.showError({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image.",
      })
      return
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      notifications.showError({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "homepage-story")
      formData.append("customName", "our-story")

      if (story.image?.includes("/storage/v1/object/public/")) {
        const urlParts = story.image.split("/storage/v1/object/public/")[1]
        if (urlParts) {
          formData.append("oldFilePath", urlParts.split("/").slice(1).join("/"))
        }
      }

      const response = await fetch("/api/upload", { method: "POST", body: formData })
      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      update({ image: data.url })

      notifications.showSuccess({
        title: "Image uploaded",
        description: "Story image has been uploaded successfully.",
      })
    } catch {
      notifications.showError({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const updateParagraph = (index: number, value: string) => {
    const paragraphs = [...story.paragraphs]
    paragraphs[index] = value
    update({ paragraphs })
  }

  const addParagraph = () => {
    update({ paragraphs: [...story.paragraphs, ""] })
  }

  const removeParagraph = (index: number) => {
    update({ paragraphs: story.paragraphs.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Our Story Section</CardTitle>
          <CardDescription>
            The "How deessa Started" section on the homepage — right after the impact stats bar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Eyebrow Label</Label>
              <Input
                value={story.eyebrow}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="Our Story"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Badge Headline</Label>
              <Input
                value={story.badgeText}
                onChange={(e) => update({ badgeText: e.target.value })}
                placeholder="How deessa Started"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Paragraphs</Label>
            <div className="space-y-3 mt-1">
              {story.paragraphs.map((p, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={p}
                    onChange={(e) => updateParagraph(index, e.target.value)}
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParagraph(index)}
                    className="text-red-600 hover:text-red-700 self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={addParagraph} variant="outline" size="sm" className="mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Paragraph
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Link Text</Label>
              <Input
                value={story.linkText}
                onChange={(e) => update({ linkText: e.target.value })}
                placeholder="Read Our Full Story"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input
                value={story.linkUrl}
                onChange={(e) => update({ linkUrl: e.target.value })}
                placeholder="/our-story"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Founded Year Badge</Label>
              <Input
                value={story.founded}
                onChange={(e) => update({ founded: e.target.value })}
                placeholder="2022"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Founded Badge Label</Label>
              <Input
                value={story.foundedLabel}
                onChange={(e) => update({ foundedLabel: e.target.value })}
                placeholder="Founded"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Story Image</Label>
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
                      if (file) handleImageUpload(file)
                    }}
                    disabled={isUploading}
                    className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gradient-to-r file:from-cyan-500 file:to-sky-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:shadow-lg file:shadow-cyan-500/25 hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {story.image && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => update({ image: "" })}
                      title="Remove image"
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">Max 2MB • JPG, PNG, or WebP</p>
                {isUploading && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Uploading...</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-2">
                <Input
                  value={story.image}
                  onChange={(e) => update({ image: e.target.value })}
                  placeholder="/ourStory.png"
                />
                <p className="text-xs text-gray-500">Enter a direct URL to an image, or a path from the public folder</p>
              </TabsContent>
            </Tabs>

            {story.image && (
              <div className="mt-3 flex items-center gap-3">
                <div className="relative w-28 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={story.image}
                    alt={story.imageAlt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="112" height="80"><rect fill="%23f3f4f6" width="112" height="80"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10">No Image</text></svg>'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 truncate max-w-[240px]">{story.image}</p>
              </div>
            )}
          </div>

          <div>
            <Label>Image Alt Text</Label>
            <Input
              value={story.imageAlt}
              onChange={(e) => update({ imageAlt: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1">{story.eyebrow}</p>
            <h4 className="text-lg font-black text-gray-800 mb-2">{story.badgeText}</h4>
            {story.paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-gray-600 mb-2">{p}</p>
            ))}
            <p className="text-sm font-bold text-primary">{story.linkText} →</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
