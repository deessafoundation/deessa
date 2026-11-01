"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, UploadCloud, Link as LinkIcon, X, BookOpen, Loader2, Image as ImageIcon } from "lucide-react"
import type { HomepageStorySettings } from "@/lib/types/homepage-settings"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface StoryManagerProps {
  story: HomepageStorySettings
  onChange: (story: HomepageStorySettings) => void
}

export default function StoryManager({ story, onChange }: StoryManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      notifications.showError({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
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
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Our Story Section
          </CardTitle>
          <CardDescription className="text-xs">
            The narrative &ldquo;How deessa Started&rdquo; section on the homepage, immediately following the impact statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Eyebrow Category</Label>
              <Input
                value={story.eyebrow}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="Our Story"
                className="mt-1.5 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Badge Headline</Label>
              <Input
                value={story.badgeText}
                onChange={(e) => update({ badgeText: e.target.value })}
                placeholder="How deessa Started"
                className="mt-1.5 h-9 text-sm"
              />
            </div>
          </div>

          {/* Narrative Paragraphs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Narrative Paragraphs</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addParagraph}
                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Paragraph
              </Button>
            </div>
            <div className="space-y-3">
              {story.paragraphs.map((p, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-[11px] font-mono font-semibold text-muted-foreground shrink-0 mt-1">
                    {index + 1}
                  </span>
                  <Textarea
                    value={p}
                    onChange={(e) => updateParagraph(index, e.target.value)}
                    rows={3}
                    placeholder={`Paragraph ${index + 1} copy...`}
                    className="flex-1 text-sm resize-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParagraph(index)}
                    disabled={story.paragraphs.length <= 1}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-1"
                    title="Remove paragraph"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Link Callout Text</Label>
              <Input
                value={story.linkText}
                onChange={(e) => update({ linkText: e.target.value })}
                placeholder="Read Our Full Story"
                className="mt-1.5 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Link Callout Destination URL</Label>
              <Input
                value={story.linkUrl}
                onChange={(e) => update({ linkUrl: e.target.value })}
                placeholder="/our-story"
                className="mt-1.5 h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Founding Year Badge</Label>
              <Input
                value={story.founded}
                onChange={(e) => update({ founded: e.target.value })}
                placeholder="2022"
                className="mt-1.5 h-9 font-mono tabular-nums text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Founding Badge Label</Label>
              <Input
                value={story.foundedLabel}
                onChange={(e) => update({ foundedLabel: e.target.value })}
                placeholder="Founded in Kathmandu"
                className="mt-1.5 h-9 text-sm"
              />
            </div>
          </div>

          {/* Media Asset Management */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <Label className="text-xs font-medium">Feature Story Photography</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full max-w-xs grid-cols-2 h-8">
                <TabsTrigger value="upload" className="text-xs">
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url" className="text-xs">
                  <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                  Direct URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-3 mt-3">
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer text-center",
                    isUploading && "pointer-events-none opacity-60"
                  )}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-primary text-xs font-medium">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to secure media storage...</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        Drop image here, or <span className="text-primary underline">browse local files</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        JPG, PNG, WebP up to 5MB
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  disabled={isUploading}
                  className="sr-only"
                />
              </TabsContent>

              <TabsContent value="url" className="space-y-2 mt-3">
                <Input
                  value={story.image}
                  onChange={(e) => update({ image: e.target.value })}
                  placeholder="e.g. /home/hero/art_banner.jpeg or https://..."
                  className="h-9 font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Enter an absolute public path or hosted HTTPS media link.
                </p>
              </TabsContent>
            </Tabs>

            {/* Image Preview & Details */}
            {story.image && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-border bg-card shrink-0">
                    <img
                      src={story.image}
                      alt={story.imageAlt || "Story asset"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono truncate text-foreground">{story.image}</p>
                    <p className="text-[11px] text-muted-foreground">Active story photo</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update({ image: "" })}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div>
              <Label className="text-xs font-medium">Image Alt Description</Label>
              <Input
                value={story.imageAlt}
                onChange={(e) => update({ imageAlt: e.target.value })}
                placeholder="Accessible description of the image content..."
                className="mt-1.5 h-9 text-sm"
              />
            </div>
          </div>

          {/* Live Section Preview */}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 sm:p-5">
            <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
              {story.eyebrow || "Our Story"}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-foreground mt-0.5 mb-2">
              {story.badgeText || "How deessa Started"}
            </h4>
            <div className="space-y-1.5 mb-3">
              {story.paragraphs.map((p, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            <p className="text-xs font-bold text-primary flex items-center gap-1">
              <span>{story.linkText || "Read Our Full Story"}</span>
              <span>→</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
