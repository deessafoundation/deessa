"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import type { HomepageBannersSettings, HomepageBanner } from "@/lib/types/homepage-settings"

interface BannersManagerProps {
  banners: HomepageBannersSettings
  onChange: (banners: HomepageBannersSettings) => void
}

export default function BannersManager({ banners, onChange }: BannersManagerProps) {
  const addBanner = () => {
    const newBanner: HomepageBanner = {
      id: `banner-${Date.now()}`,
      type: "brush-quote",
      color: "#8B8DD4",
      headline: "New Banner Headline",
      body: "Banner body text",
      ctaLabel: null,
      ctaUrl: null,
      order: banners.banners.length + 1,
      visible: true,
      animate: true,
      animationDuration: 1.2,
    }
    onChange({ banners: [...banners.banners, newBanner] })
  }

  const updateBanner = (index: number, updates: Partial<HomepageBanner>) => {
    const newBanners = [...banners.banners]
    newBanners[index] = { ...newBanners[index], ...updates }
    onChange({ banners: newBanners })
  }

  const deleteBanner = (index: number) => {
    const newBanners = banners.banners.filter((_, i) => i !== index)
    onChange({ banners: newBanners })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Banners</CardTitle>
          <CardDescription>
            Manage brush stroke quote banners displayed on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {banners.banners.map((banner, index) => (
            <Card key={banner.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Banner {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBanner(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Headline</Label>
                  <Input
                    value={banner.headline}
                    onChange={(e) => updateBanner(index, { headline: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Body (optional)</Label>
                  <Textarea
                    value={banner.body || ""}
                    onChange={(e) => updateBanner(index, { body: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Color (Hex)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={banner.color}
                        onChange={(e) => updateBanner(index, { color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={banner.color}
                        onChange={(e) => updateBanner(index, { color: e.target.value })}
                        placeholder="#8B8DD4"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Animation Duration (seconds)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={banner.animationDuration || 1.2}
                      onChange={(e) => updateBanner(index, { animationDuration: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Animate</Label>
                    <Switch
                      checked={banner.animate}
                      onCheckedChange={(checked) => updateBanner(index, { animate: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Visible</Label>
                    <Switch
                      checked={banner.visible}
                      onCheckedChange={(checked) => updateBanner(index, { visible: checked })}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div 
                  className="p-6 rounded-lg text-white"
                  style={{ backgroundColor: banner.color }}
                >
                  <h3 className="font-bold text-xl mb-2">{banner.headline}</h3>
                  {banner.body && <p className="text-sm opacity-90">{banner.body}</p>}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addBanner} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
