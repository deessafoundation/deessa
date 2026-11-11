"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  HeartHandshake,
  Megaphone,
  Compass,
  FlaskConical,
  Check,
  Globe,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createProgram } from "@/lib/actions/program-crud"
import { slugify } from "@/lib/programs/slug"
import type { ProgramDocument, ProgramCategory } from "@/lib/programs/content"
import { getDefaultSectionsForCategory, type ProgramCategoryType } from "@/components/admin/programs/sections/types"
import { cn } from "@/lib/utils"

const CATEGORIES: {
  value: ProgramCategoryType
  label: string
  subtitle: string
  description: string
  icon: typeof HeartHandshake
  colorClass: string
  borderClass: string
  badgeClass: string
  defaultBlocks: string[]
}[] = [
  {
    value: "service",
    label: "Service Program",
    subtitle: "Clinical & Community",
    description: "Therapy, sensory spaces, family guidance, and direct support services.",
    icon: HeartHandshake,
    colorClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    borderClass: "border-sky-500/30 hover:border-sky-500/60",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    defaultBlocks: ["Facts Bar", "Features Grid", "How It Works", "Story", "FAQ", "Stats"],
  },
  {
    value: "campaign",
    label: "Advocacy Campaign",
    subtitle: "Drives & Petitions",
    description: "Public awareness initiatives, community drives, petitions, and goal progress.",
    icon: Megaphone,
    colorClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    borderClass: "border-purple-500/30 hover:border-purple-500/60",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    defaultBlocks: ["Progress Tracker", "Features", "Timeline", "Photo Story", "CTA"],
  },
  {
    value: "outreach",
    label: "Fieldwork & Outreach",
    subtitle: "Journals & Missions",
    description: "Rural outreach missions, partner spotlights, field journals, and dispatches.",
    icon: Compass,
    colorClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-500/30 hover:border-amber-500/60",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    defaultBlocks: ["Journal Cover", "Location Stamp", "Activities", "Gallery", "Quotes"],
  },
  {
    value: "research",
    label: "Research & Evidence",
    subtitle: "Studies & Tools",
    description: "Evidence-based studies, clinical trials, academic publications, and interactive tools.",
    icon: FlaskConical,
    colorClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
    borderClass: "border-teal-500/30 hover:border-teal-500/60",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
    defaultBlocks: ["Research Hero", "Concept Routines", "Communication Demo", "Insights"],
  },
]

export default function NewProgramPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<ProgramCategoryType>("service")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeCategoryConfig = CATEGORIES.find((c) => c.value === category) || CATEGORIES[0]
  const previewSlug = title.trim() ? slugify(title) : "my-new-program"

  async function handleCreate() {
    if (!title.trim()) {
      setError("Program Title is required")
      return
    }

    setLoading(true)
    setError(null)

    const defaultSections = getDefaultSectionsForCategory(category)

    const doc: ProgramDocument = {
      schemaVersion: 1,
      title: title.trim(),
      shortDescription: title.trim(),
      category: category as ProgramCategory,
      tags: [],
      hero: { title: title.trim(), description: title.trim(), actions: [] },
      seo: {},
      sections: defaultSections,
      relatedProgramIds: [],
    }

    const result = await createProgram({ title: title.trim(), category, document: doc })

    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/admin/programs/${result.data.id}/edit`)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground border-b pb-3">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <span>/</span>
        <Link href="/admin/programs" className="hover:text-foreground transition-colors">
          Programs
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">New Program Draft</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Create Program Draft</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Select an initiative category and provide an initial title to bootstrap your CMS layout.
              </p>
            </div>
          </div>
        </div>

        <Button variant="ghost" asChild className="h-10 text-sm">
          <Link href="/admin/programs">
            <ArrowLeft className="mr-2 size-4" />
            Back to Programs
          </Link>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-destructive font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Category Selection Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            1. Select Program Category <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            Determines public layout and pre-configured sections
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value
            const Icon = cat.icon

            return (
              <div
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "relative rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left",
                  isSelected
                    ? cn("border-primary bg-primary/5 shadow-xs ring-1 ring-primary", cat.borderClass)
                    : "border-border/70 hover:border-border hover:bg-muted/30 bg-card"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", cat.colorClass)}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm sm:text-base leading-tight">{cat.label}</h2>
                      <p className="text-[11px] text-muted-foreground font-medium">{cat.subtitle}</p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "size-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-transparent"
                    )}
                  >
                    {isSelected && <Check className="size-3 stroke-3" />}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>

                <div className="pt-2 border-t flex flex-wrap gap-1">
                  {cat.defaultBlocks.map((block) => (
                    <Badge key={block} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                      {block}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Program Metadata Form Card */}
      <Card className="border shadow-xs">
        <CardHeader className="p-5 pb-3 border-b bg-card/60">
          <CardTitle className="text-base font-bold">2. Program Title &amp; Public URL</CardTitle>
          <CardDescription className="text-xs">
            Enter the main public heading. You can refine all details, images, and content blocks in the editor next.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-sm font-semibold">
                Program Title <span className="text-destructive">*</span>
              </Label>
              <span className="text-xs text-muted-foreground font-mono">{title.length}/120</span>
            </div>
            <Input
              id="title"
              placeholder="e.g. Early Childhood Communication & AAC Support Program"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreate())}
              disabled={loading}
              maxLength={120}
              className="h-11 text-base font-medium rounded-xl"
              autoFocus
            />
          </div>

          {/* Real-time Public Slug Preview */}
          <div className="p-3 rounded-xl border bg-muted/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Globe className="size-3.5 text-primary" />
              Public URL Permalink Preview
            </div>
            <p className="text-xs font-mono text-foreground truncate">
              https://deeshafoundation.org/whatwedo/<span className="text-primary font-bold">{previewSlug}</span>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Will be created with <span className="font-semibold text-foreground">{activeCategoryConfig.label}</span> template.
            </p>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button variant="ghost" asChild disabled={loading} className="h-11 text-sm font-medium flex-1 sm:flex-none">
                <Link href="/admin/programs">Cancel</Link>
              </Button>

              <Button
                onClick={handleCreate}
                disabled={loading || !title.trim()}
                className="h-11 px-6 text-sm font-semibold shadow-xs flex-1 sm:flex-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating Draft…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Create Program Draft
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
