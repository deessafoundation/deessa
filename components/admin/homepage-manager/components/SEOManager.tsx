"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { HomepageSEOSettings } from "@/lib/types/homepage-settings"

interface SEOManagerProps {
  seo: HomepageSEOSettings
  onChange: (seo: HomepageSEOSettings) => void
}

export default function SEOManager({ seo, onChange }: SEOManagerProps) {
  const updateSEO = (updates: Partial<HomepageSEOSettings>) => {
    onChange({ ...seo, ...updates })
  }

  const updateKeywords = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k)
    updateSEO({ keywords })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>
            Manage homepage SEO metadata for better search engine visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Page Title</Label>
            <Input
              value={seo.title}
              onChange={(e) => updateSEO({ title: e.target.value })}
              className="mt-1"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              {seo.title.length}/60 characters (optimal: 50-60)
            </p>
          </div>

          <div>
            <Label>Meta Description</Label>
            <Textarea
              value={seo.description}
              onChange={(e) => updateSEO({ description: e.target.value })}
              rows={3}
              className="mt-1"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {seo.description.length}/160 characters (optimal: 150-160)
            </p>
          </div>

          <div>
            <Label>Keywords</Label>
            <Input
              value={seo.keywords.join(', ')}
              onChange={(e) => updateKeywords(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate keywords with commas. Current: {seo.keywords.length} keywords
            </p>
          </div>

          <div>
            <Label>Open Graph Image URL</Label>
            <Input
              value={seo.ogImage}
              onChange={(e) => updateSEO({ ogImage: e.target.value })}
              placeholder="/og-image-home.jpg"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended size: 1200x630px
            </p>
          </div>

          {/* Preview Card */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-base">Search Result Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {seo.title}
                </p>
                <p className="text-green-700 text-sm">
                  https://deeshafoundation.org
                </p>
                <p className="text-gray-600 text-sm">
                  {seo.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 SEO Tips:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
            <li>Keep title under 60 characters</li>
            <li>Keep description between 150-160 characters</li>
            <li>Use relevant keywords naturally</li>
            <li>Update OG image for social media sharing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
