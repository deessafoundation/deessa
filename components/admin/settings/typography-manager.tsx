"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Type,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Eye,
  Loader2,
  Save,
  RotateCcw,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import { updateTypographyConfig } from "@/lib/actions/typography-settings"
import {
  DEFAULT_TYPOGRAPHY_CONFIG,
  type TypographyConfig,
  type TypographyTheme,
} from "@/lib/typography/types"
import { cn } from "@/lib/utils"

interface TypographyManagerProps {
  initialConfig?: TypographyConfig
}

export function TypographyManager({ initialConfig }: TypographyManagerProps) {
  const router = useRouter()
  const [config, setConfig] = useState<TypographyConfig>(
    initialConfig || DEFAULT_TYPOGRAPHY_CONFIG
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSelectTheme = (theme: TypographyTheme) => {
    setConfig((prev) => ({ ...prev, theme }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await updateTypographyConfig(config)
      if (res?.error) {
        notifications.error("Failed to save typography settings: " + res.error)
      } else {
        notifications.success("Typography theme updated successfully! Changes are live across the website.")
        router.refresh()
      }
    } catch {
      notifications.error("An unexpected error occurred while saving settings.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(DEFAULT_TYPOGRAPHY_CONFIG)
  }

  const themes: Array<{
    id: TypographyTheme
    name: string
    badge: string
    badgeVariant: "default" | "secondary" | "outline"
    badgeColor?: string
    headingFontName: string
    bodyFontName: string
    headingStyle: string
    bodyStyle: string
    description: string
    features: string[]
  }> = [
    {
      id: "warm-inclusive",
      name: "Nunito Sans + Atkinson Hyperlegible",
      badge: "Recommended • Braille Institute Low-Vision Standard",
      badgeVariant: "default",
      badgeColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
      headingFontName: "Nunito Sans (Weights 600, 700, 800)",
      bodyFontName: "Atkinson Hyperlegible (Weights 400, 700)",
      headingStyle: "font-[family-name:var(--font-nunito-sans)] font-bold",
      bodyStyle: "font-[family-name:var(--font-atkinson)]",
      description:
        "Bespoke pairing tailored specifically for deessa Foundation. Nunito Sans provides warm, empathetic rounded headings without childishness, while Atkinson Hyperlegible (developed by the Braille Institute of America) provides world-class reading clarity for low-vision and neurodivergent visitors.",
      features: [
        "Unambiguous character distinctions (distinguishes I, l, 1 and 0, O)",
        "Rounded, compassionate heading aesthetics",
        "High contrast readability on phones and desktop",
        "Zero artificial text-stroke hacks required",
      ],
    },
    {
      id: "classic-brand",
      name: "Marissa Font + Comic Neue",
      badge: "Classic Foundation Identity",
      badgeVariant: "secondary",
      headingFontName: "Marissa Font (Bundled TTF)",
      bodyFontName: "Comic Neue (Local TTF)",
      headingStyle: "font-marissa",
      bodyStyle: "font-comic",
      description:
        "The original foundation brand identity. Uses the playful, handwritten Marissa display font for section headings with Comic Neue for body copy and statistics numbers.",
      features: [
        "Original playful, informal personality",
        "Handwritten crayon-style headline aesthetic",
        "Requires -webkit-text-stroke styling on some headings",
      ],
    },
    {
      id: "modern-clean",
      name: "DM Sans + Plus Jakarta Sans",
      badge: "Editorial & Contemporary",
      badgeVariant: "outline",
      headingFontName: "DM Sans (Geometric Display)",
      bodyFontName: "Plus Jakarta Sans (Modern Body)",
      headingStyle: "font-[family-name:var(--font-dm-sans)] font-bold",
      bodyStyle: "font-sans",
      description:
        "A crisp, contemporary editorial aesthetic commonly used in modern non-profit and NGO reports. Sharp geometric headings with neutral, high-legibility body text.",
      features: [
        "Standard modern sans-serif geometry",
        "Matches the Nepal Accessibility Summit landing styling",
        "Neutral, formal presentation",
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="border-border/60 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Type className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  Typography & Brand Fonts
                </CardTitle>
                <CardDescription className="text-sm">
                  Control the global typography system across all public pages.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="min-h-10 text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Recommended</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="min-h-10 text-xs gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSaving ? "Saving..." : "Save Typography"}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Theme Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {themes.map((t) => {
          const isSelected = config.theme === t.id
          return (
            <div
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              className={cn(
                "group relative flex cursor-pointer flex-col rounded-2xl border-2 p-5 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/[0.03] shadow-lg ring-2 ring-primary/20"
                  : "border-border/70 bg-card hover:border-primary/50 hover:shadow-md"
              )}
            >
              {/* Header Badge & Checkmark */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge
                  variant={t.badgeVariant}
                  className={cn("text-[11px] font-semibold py-0.5", t.badgeColor)}
                >
                  {t.badge}
                </Badge>
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/80 bg-muted/30 text-transparent group-hover:border-primary/50"
                  )}
                >
                  <CheckCircle2 className="size-4" />
                </div>
              </div>

              {/* Title & Font details */}
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                {t.name}
              </h3>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground/80">Headings:</span>{" "}
                  {t.headingFontName}
                </p>
                <p>
                  <span className="font-semibold text-foreground/80">Body & UI:</span>{" "}
                  {t.bodyFontName}
                </p>
              </div>

              {/* Live Preview Box */}
              <div className="mt-4 flex-1 rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <Eye className="size-3" /> Live Typography Preview
                </p>
                <div className="space-y-2">
                  <p className={cn("text-xl leading-tight text-foreground", t.headingStyle)}>
                    Every child deserves space to thrive
                  </p>
                  <p className={cn("text-xs leading-relaxed text-muted-foreground", t.bodyStyle)}>
                    Through creativity, learning, and everyday connection, deessa builds a world
                    where every child feels understood, included, and free to explore their potential.
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[11px]">
                    <span className={cn("font-bold text-primary", t.headingStyle)}>
                      10,000+
                    </span>
                    <span className={cn("text-muted-foreground", t.bodyStyle)}>
                      Children supported in Nepal
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & bullets */}
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {t.description}
              </p>

              <ul className="mt-3 space-y-1 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
