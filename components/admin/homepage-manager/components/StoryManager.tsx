"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { HomepageStorySettings } from "@/lib/types/homepage-settings"

interface StoryManagerProps {
  story: HomepageStorySettings
  onChange: (story: HomepageStorySettings) => void
}

export default function StoryManager({ story, onChange }: StoryManagerProps) {
  const update = (updates: Partial<HomepageStorySettings>) => {
    onChange({ ...story, ...updates })
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
                placeholder="2015"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Image URL</Label>
              <Input
                value={story.image}
                onChange={(e) => update({ image: e.target.value })}
                placeholder="/ourStory.png"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Image Alt Text</Label>
              <Input
                value={story.imageAlt}
                onChange={(e) => update({ imageAlt: e.target.value })}
                className="mt-1"
              />
            </div>
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
