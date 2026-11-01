"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Sparkles, Camera } from "lucide-react"

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
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Classic Hero Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Manage the primary headline, mission subtitle, and collateral photos displayed across hero layouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Content */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Hero Eyebrow / Badge Text</Label>
              <Input
                value={hero.badge}
                onChange={(e) => updateHero({ badge: e.target.value })}
                placeholder="Est. 2014 • Kathmandu"
                className="mt-1.5 h-9 text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Small badge label rendered above the headline</p>
            </div>

            <div>
              <Label className="text-xs font-medium">Main Hero Headline</Label>
              <Input
                value={hero.title}
                onChange={(e) => updateHero({ title: e.target.value })}
                placeholder="Hope for Every Child."
                className="mt-1.5 h-9 text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Primary high-impact title</p>
            </div>

            <div>
              <Label className="text-xs font-medium">Narrative Subtitle</Label>
              <Textarea
                value={hero.subtitle}
                onChange={(e) => updateHero({ subtitle: e.target.value })}
                placeholder="We are rewriting the future of rural Nepal..."
                rows={3}
                className="mt-1.5 text-sm resize-none"
              />
            </div>

            {/* Live Card Preview */}
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm">
              <span className="text-xs font-bold tracking-wider text-primary uppercase">
                {hero.badge || "EST. 2014 • KATHMANDU"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1 mb-2 leading-tight">
                {hero.title || "Hero Headline"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                {hero.subtitle || "Hero descriptive subtitle text..."}
              </p>
            </div>
          </div>

          {/* Collateral Photography */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Camera className="w-4 h-4 text-primary" />
                Collateral & Photo Wall Images
              </h4>
              <p className="text-xs text-muted-foreground">
                Secondary images used in photo walls, fallback posters, and media montages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Main Hero Poster Image
                </Label>
                <Input
                  value={hero.mainImage}
                  onChange={(e) => updateHero({ mainImage: e.target.value })}
                  placeholder="/home/hero/art_banner.jpeg"
                  className="mt-1.5 h-9 text-xs font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Classroom / Education Photo
                </Label>
                <Input
                  value={hero.classroomImage}
                  onChange={(e) => updateHero({ classroomImage: e.target.value })}
                  placeholder="/home/classroom.jpg"
                  className="mt-1.5 h-9 text-xs font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Community Activity Photo 1
                </Label>
                <Input
                  value={hero.donorImage1}
                  onChange={(e) => updateHero({ donorImage1: e.target.value })}
                  placeholder="/home/community1.jpg"
                  className="mt-1.5 h-9 text-xs font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Community Activity Photo 2
                </Label>
                <Input
                  value={hero.donorImage2}
                  onChange={(e) => updateHero({ donorImage2: e.target.value })}
                  placeholder="/home/community2.jpg"
                  className="mt-1.5 h-9 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
