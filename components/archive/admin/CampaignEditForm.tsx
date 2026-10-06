"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AssetPicker, type AssetPick } from "@/components/admin/programs/sections/asset-picker"
import type { ProgramDocument, ProgramSection } from "@/lib/programs/content"

// ── Helpers ──────────────────────────────────────────────────

function Section({ title, hint, defaultOpen = true, accent, children }: {
  title: string
  hint?: string
  defaultOpen?: boolean
  accent?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {accent && <div className="w-1.5 h-5 rounded-full shrink-0" style={{ backgroundColor: accent }} />}
          <span className="text-sm font-medium">{title}</span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t px-5 py-5 space-y-4">{children}</div>}
    </div>
  )
}

function Field({ label, hint, children, required, count, max }: {
  label: string
  hint?: string
  children: React.ReactNode
  required?: boolean
  count?: number
  max?: number
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {count !== undefined && max !== undefined && (
          <span className={`text-[10px] tabular-nums ${count > max ? "text-destructive" : count > max * 0.9 ? "text-amber-500" : "text-muted-foreground/50"}`}>
            {count}/{max}
          </span>
        )}
      </div>
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
      {children}
    </div>
  )
}

const inputClass = "h-8 text-sm"
const textareaClass = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// ── Types ────────────────────────────────────────────────────

type Hero = ProgramDocument["hero"]
type Sections = ProgramSection[]

interface CampaignData {
  hero: Hero
  eyebrow: string
  shortDescription: string
  sections: Sections
}

// ── Component ────────────────────────────────────────────────

export function CampaignEditForm({
  data,
  onChange,
}: {
  data: CampaignData
  onChange: (data: CampaignData) => void
}) {
  const { hero, eyebrow, shortDescription, sections } = data

  function updateHero(updates: Partial<Hero>) {
    onChange({ ...data, hero: { ...hero, ...updates } })
  }

  function getSection(type: ProgramSection["content"]["type"]) {
    return sections.find((s) => s.content.type === type) ?? null
  }

  function getAllSections(type: ProgramSection["content"]["type"]) {
    return sections.filter((s) => s.content.type === type)
  }

  function updateSection(type: ProgramSection["content"]["type"], content: ProgramSection["content"]) {
    const exists = sections.find((s) => s.content.type === type)
    if (exists) {
      onChange({ ...data, sections: sections.map((s) => s.content.type === type ? { ...s, content } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: `${type.replace(/_/g, "-")}-auto`, heading: "", enabled: true, content }] })
    }
  }

  function updateSectionMeta(type: ProgramSection["content"]["type"], updates: Partial<Pick<ProgramSection, "heading" | "intro">>) {
    const exists = sections.find((s) => s.content.type === type)
    if (exists) {
      onChange({ ...data, sections: sections.map((s) => s.content.type === type ? { ...s, ...updates } : s) })
    } else {
      const content = createDefaultContent(type)
      if (content) {
        onChange({ ...data, sections: [...sections, { id: `${type.replace(/_/g, "-")}-auto`, ...updates, enabled: true, content }] })
      }
    }
  }

  function createDefaultContent(type: ProgramSection["content"]["type"]): ProgramSection["content"] | null {
    switch (type) {
      case "progress_tracker": return { type: "progress_tracker", current: 0, goal: 100, unit: "" }
      case "features": return { type: "features", layout: "grid", features: [{ title: "", description: "" }] }
      case "timeline": return { type: "timeline", items: [{ title: "", description: "", date: "", status: "upcoming" }] }
      case "stats": return { type: "stats", stats: [{ value: "", label: "" }] }
      case "gallery": return { type: "gallery", layout: "grid", images: [] }
      case "quote": return { type: "quote", quote: "", person: "" }
      case "cta": return { type: "cta", title: "", description: "", buttons: [{ label: "", url: "/", variant: "primary" }] }
      case "rich_text": return { type: "rich_text", body: "" }
      default: return null
    }
  }

  // ── Progress helpers ──────────────────────────────────────

  const progressSection = getSection("progress_tracker")
  const progress = progressSection?.content.type === "progress_tracker" ? progressSection.content : null

  function updateProgress(updates: Partial<{ current: number; goal: number; unit: string; startDate: string; endDate: string }>) {
    const current = progress || { current: 0, goal: 1000, unit: "families", startDate: "", endDate: "" }
    updateSection("progress_tracker", { type: "progress_tracker", ...current, ...updates })
  }

  // ── Purpose (Rich Text) helpers ──────────────────────────

  const purposeSection = getSection("rich_text")

  function updatePurposeBody(body: string) {
    const exists = purposeSection
    if (exists) {
      onChange({ ...data, sections: sections.map((s) => s.content.type === "rich_text" ? { ...s, content: { type: "rich_text", body } } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: "rich_text-auto", heading: "", enabled: true, content: { type: "rich_text", body } }] })
    }
  }

  // ── Promise Grid (Features) helpers ──────────────────────

  const promisesSection = getAllSections("features").find((s) => s.id !== sections.find((x) => x.content.type === "features")?.id) || getSection("features")
  const promises = promisesSection?.content.type === "features" ? promisesSection.content.features : []

  function updatePromise(index: number, field: string, val: string) {
    const next = promises.map((f, i) => i === index ? { ...f, [field]: val } : f)
    if (promisesSection) {
      onChange({ ...data, sections: sections.map((s) => s === promisesSection ? { ...s, content: { type: "features", layout: "grid", features: next } } : s) })
    }
  }

  function addPromise() {
    if (promises.length >= 6) return
    const next = [...promises, { title: "", description: "", icon: "" }]
    if (promisesSection) {
      onChange({ ...data, sections: sections.map((s) => s === promisesSection ? { ...s, content: { type: "features", layout: "grid", features: next } } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: "features-promises-auto", heading: "", enabled: true, content: { type: "features", layout: "grid", features: next } }] })
    }
  }

  function removePromise(index: number) {
    const next = promises.filter((_, i) => i !== index)
    if (promisesSection) {
      onChange({ ...data, sections: sections.map((s) => s === promisesSection ? { ...s, content: { type: "features", layout: "grid", features: next } } : s) })
    }
  }

  // ── Journey / Milestones (Timeline) helpers ──────────────

  const journeySection = getSection("timeline")
  const milestones = journeySection?.content.type === "timeline" ? journeySection.content.items : []

  function updateMilestone(index: number, field: string, val: string) {
    const next = milestones.map((m, i) => i === index ? { ...m, [field]: val } : m)
    updateSection("timeline", { type: "timeline", items: next })
  }

  function addMilestone() {
    if (milestones.length >= 10) return
    updateSection("timeline", { type: "timeline", items: [...milestones, { date: "", title: "", description: "", status: "upcoming" }] })
  }

  function removeMilestone(index: number) {
    updateSection("timeline", { type: "timeline", items: milestones.filter((_, i) => i !== index) })
  }

  // ── Story (Quote) helpers ────────────────────────────────

  const storySection = getSection("quote")
  const story = storySection?.content.type === "quote" ? storySection.content : null

  function updateStory(updates: Partial<{ quote: string; person: string; role: string; location: string }>) {
    const current = story || { quote: "", person: "", role: "", location: "" }
    updateSection("quote", { type: "quote", ...current, ...updates })
  }

  // ── Reach Metrics (Stats) helpers ────────────────────────

  const reachSection = getSection("stats")
  const reachMetrics = reachSection?.content.type === "stats" ? reachSection.content.stats : []

  function updateReachMetric(index: number, field: "value" | "label", val: string) {
    const next = reachMetrics.map((s, i) => i === index ? { ...s, [field]: val } : s)
    updateSection("stats", { type: "stats", stats: next })
  }

  function addReachMetric() {
    if (reachMetrics.length >= 6) return
    updateSection("stats", { type: "stats", stats: [...reachMetrics, { value: "", label: "" }] })
  }

  function removeReachMetric(index: number) {
    updateSection("stats", { type: "stats", stats: reachMetrics.filter((_, i) => i !== index) })
  }

  // ── Gallery helpers ──────────────────────────────────────

  const gallerySection = getSection("gallery")
  const galleryImages = gallerySection?.content.type === "gallery" ? gallerySection.content.images : []

  function updateGalleryImage(index: number, updates: Partial<{ assetId: string; url: string; alt: string; caption: string }>) {
    const next = galleryImages.map((img, i) => i === index ? { ...img, ...updates } : img)
    updateSection("gallery", { type: "gallery", layout: "grid", images: next })
  }

  function addGalleryImage() {
    if (galleryImages.length >= 8) return
    updateSection("gallery", { type: "gallery", layout: "grid", images: [...galleryImages, { assetId: "", url: "", alt: "", caption: "" }] })
  }

  function removeGalleryImage(index: number) {
    updateSection("gallery", { type: "gallery", layout: "grid", images: galleryImages.filter((_, i) => i !== index) })
  }

  // ── CTA helpers ──────────────────────────────────────────

  const ctaSection = getSection("cta")
  const ctaContent = ctaSection?.content.type === "cta" ? ctaSection.content : null

  function updateCta(updates: Partial<{ title: string; description: string }>) {
    const current = ctaContent || { title: "", description: "", buttons: [] }
    updateSection("cta", { type: "cta", ...current, ...updates })
  }

  function setCtaButton(label: string, url: string) {
    updateSection("cta", {
      type: "cta",
      title: ctaContent?.title || "",
      description: ctaContent?.description || "",
      buttons: [{ label, url, variant: "primary" }],
    })
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* 1. Hero */}
      <Section title="Campaign Hero" hint="Main campaign hero section" accent="#3FABDE">
        <Field label="Eyebrow" hint="e.g. CAMPAIGNS / THE 1,000 FAMILIES INITIATIVE">
          <Input className={inputClass} value={eyebrow} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} placeholder="CAMPAIGNS / THE 1,000 FAMILIES INITIATIVE" />
        </Field>
        <Field label="Heading Line 1" required>
          <Input className={inputClass} value={hero.title} onChange={(e) => updateHero({ title: e.target.value })} placeholder="A little support." />
        </Field>
        <Field label="Heading Line 2 (emphasized)" hint="Appears in accent color">
          <Input className={inputClass} value={hero.description} onChange={(e) => updateHero({ description: e.target.value })} placeholder="A world of possibility." />
        </Field>
        <Field label="Subtitle Paragraph" required>
          <textarea className={textareaClass + " !min-h-[60px]"} value={shortDescription} onChange={(e) => onChange({ ...data, shortDescription: e.target.value })} placeholder="Let's bring communication tools, practical guidance and a sense of belonging to 1,000 families across Nepal." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary CTA Text">
            <Input className={inputClass} value={hero.actions?.[0]?.label || ""} onChange={(e) => updateHero({ actions: [{ label: e.target.value, url: hero.actions?.[0]?.url || "#campaign-participate", variant: "primary" }] })} placeholder="Find your part in the story" />
          </Field>
          <Field label="Primary CTA URL">
            <Input className={inputClass} value={hero.actions?.[0]?.url || ""} onChange={(e) => updateHero({ actions: [{ label: hero.actions?.[0]?.label || "", url: e.target.value, variant: "primary" }] })} placeholder="#campaign-participate" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Secondary CTA Text">
            <Input className={inputClass} value={hero.actions?.[1]?.label || ""} onChange={(e) => {
              const actions = [...(hero.actions || [])]
              actions[1] = { label: e.target.value, url: actions[1]?.url || "#campaign-why", variant: "secondary" as const }
              updateHero({ actions })
            }} placeholder="Get to know the campaign" />
          </Field>
          <Field label="Secondary CTA URL">
            <Input className={inputClass} value={hero.actions?.[1]?.url || ""} onChange={(e) => {
              const actions = [...(hero.actions || [])]
              actions[1] = { label: actions[1]?.label || "", url: e.target.value, variant: "secondary" as const }
              updateHero({ actions })
            }} placeholder="#campaign-why" />
          </Field>
        </div>
        <Field label="Hero Image">
          <AssetPicker
            assetId={hero.image?.assetId ?? null}
            url={hero.image?.url}
            alt={hero.image?.alt || hero.title}
            onPick={(pick) => updateHero({ image: { ...pick, alt: hero.image?.alt || hero.title } })}
            onClear={() => updateHero({ image: undefined })}
          />
        </Field>
        <Field label="Photo Label Overlay" hint="e.g. Every family. Every possibility.">
          <Input className={inputClass} value={hero.note?.text || ""} onChange={(e) => updateHero({ note: { text: e.target.value, icon: hero.note?.icon || "" } })} placeholder="Every family. Every possibility." />
        </Field>
        <Field label="Hero Caption" hint="Uppercase text at bottom of image">
          <Input className={inputClass} value={hero.photoNote || ""} onChange={(e) => updateHero({ photoNote: e.target.value })} placeholder="ONE SHARED GOAL. A thousand different stories." />
        </Field>
      </Section>

      {/* 2. Progress / Campaign Goal */}
      <Section title="Campaign Progress" hint="Progress bar toward the goal" accent="#F59E0B">
        <Field label="Eyebrow">
          <Input className={inputClass} value={progressSection?.heading || ""} onChange={(e) => updateSectionMeta("progress_tracker", { heading: e.target.value })} placeholder="OUR SHARED GOAL" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Current Value" required>
            <Input className={inputClass} type="number" value={progress?.current ?? ""} onChange={(e) => updateProgress({ current: Number(e.target.value) })} placeholder="820" />
          </Field>
          <Field label="Goal" required>
            <Input className={inputClass} type="number" value={progress?.goal ?? ""} onChange={(e) => updateProgress({ goal: Number(e.target.value) })} placeholder="1000" />
          </Field>
          <Field label="Unit" required>
            <Input className={inputClass} value={progress?.unit || ""} onChange={(e) => updateProgress({ unit: e.target.value })} placeholder="families" />
          </Field>
        </div>
        <Field label="Footnote" hint="e.g. Illustrative progress · September 2026">
          <Input className={inputClass} value={progressSection?.intro || ""} onChange={(e) => updateSectionMeta("progress_tracker", { intro: e.target.value })} placeholder="Illustrative progress · September 2026" />
        </Field>
      </Section>

      {/* 3. Purpose / Why This Matters */}
      <Section title="Purpose / Why This Matters" hint="Left heading + right body text" defaultOpen={false} accent="#3FABDE">
        <Field label="Eyebrow">
          <Input className={inputClass} value={purposeSection?.heading || ""} onChange={(e) => {
            if (purposeSection) {
              onChange({ ...data, sections: sections.map((s) => s.content.type === "rich_text" ? { ...s, heading: e.target.value } : s) })
            }
          }} placeholder="WHY THIS MATTERS" />
        </Field>
        <Field label="Body Text" required>
          <textarea className={textareaClass} value={purposeSection?.content.type === "rich_text" ? purposeSection.content.body : ""} onChange={(e) => updatePurposeBody(e.target.value)} placeholder={"A child has something to say. A parent is looking for a way to understand.\n\nSometimes, the first step is a simple picture board."} />
        </Field>
      </Section>

      {/* 4. Promise Grid / What the Campaign Provides */}
      <Section title="Promise Grid" hint="What the campaign provides (3 cards)" accent="#D6336C">
        <Field label="Section Heading">
          <Input className={inputClass} value={promisesSection?.heading || ""} onChange={(e) => {
            if (promisesSection) {
              onChange({ ...data, sections: sections.map((s) => s === promisesSection ? { ...s, heading: e.target.value } : s) })
            }
          }} placeholder="What the campaign provides" />
        </Field>
        {promises.map((promise, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Card {String(i + 1).padStart(2, "0")}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePromise(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
            <Field label="Icon" hint="Emoji or icon name">
              <Input className={inputClass} value={promise.icon || ""} onChange={(e) => updatePromise(i, "icon", e.target.value)} placeholder="💬" />
            </Field>
            <Field label="Title" required>
              <Input className={inputClass} value={promise.title} onChange={(e) => updatePromise(i, "title", e.target.value)} placeholder="Tools to express" />
            </Field>
            <Field label="Description">
              <textarea className={textareaClass + " !min-h-[60px]"} value={promise.description} onChange={(e) => updatePromise(i, "description", e.target.value)} placeholder="Picture boards, visual routines and everyday resources that families can make their own." />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addPromise} disabled={promises.length >= 6}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Card
        </Button>
      </Section>

      {/* 5. Journey / Milestones */}
      <Section title="Journey / Milestones" hint="Step-by-step progress" accent="#95C11F">
        <Field label="Section Heading">
          <Input className={inputClass} value={journeySection?.heading || ""} onChange={(e) => updateSectionMeta("timeline", { heading: e.target.value })} placeholder="STEP BY STEP, TOGETHER" />
        </Field>
        {milestones.map((ms, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Milestone {String(i + 1).padStart(2, "0")}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMilestone(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title" required>
                <Input className={inputClass} value={ms.title} onChange={(e) => updateMilestone(i, "title", e.target.value)} placeholder="Listen & connect" />
              </Field>
              <Field label="Status" hint="Complete / In progress / Up next">
                <Input className={inputClass} value={ms.status || ""} onChange={(e) => updateMilestone(i, "status", e.target.value)} placeholder="Complete" />
              </Field>
            </div>
            <Field label="Description">
              <textarea className={textareaClass + " !min-h-[60px]"} value={ms.description} onChange={(e) => updateMilestone(i, "description", e.target.value)} placeholder="Start with families, local educators and the questions that matter." />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addMilestone} disabled={milestones.length >= 10}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Milestone
        </Button>
      </Section>

      {/* 6. Story / People & Stories */}
      <Section title="Story / People & Stories" hint="Photo + quote story block" defaultOpen={false} accent="#8B5CF6">
        <Field label="Eyebrow">
          <Input className={inputClass} value={storySection?.heading || ""} onChange={(e) => updateSectionMeta("quote", { heading: e.target.value })} placeholder="A MOMENT FROM THE JOURNEY" />
        </Field>
        <Field label="Story Image">
          <AssetPicker
            assetId={null}
            url={undefined}
            alt=""
            onPick={() => {}}
            onClear={() => {}}
          />
        </Field>
        <Field label="Heading" hint="e.g. It starts with I understand.">
          <Input className={inputClass} value={story?.person || ""} onChange={(e) => updateStory({ person: e.target.value })} placeholder="It starts with I understand." />
        </Field>
        <Field label="Narrative Paragraph">
          <textarea className={textareaClass} value={story?.role || ""} onChange={(e) => updateStory({ role: e.target.value })} placeholder="At a community session, a parent tries a picture board for the first time." />
        </Field>
        <Field label="Blockquote" required>
          <textarea className={textareaClass + " !min-h-[60px]"} value={story?.quote || ""} onChange={(e) => updateStory({ quote: e.target.value })} placeholder={'"We left with something we could try together."'} />
        </Field>
        <Field label="Attribution">
          <Input className={inputClass} value={story?.location || ""} onChange={(e) => updateStory({ location: e.target.value })} placeholder="Illustrative family story" />
        </Field>
      </Section>

      {/* 7. Reach / Impact Metrics */}
      <Section title="Reach / Impact Metrics" hint="Key campaign numbers" defaultOpen={false} accent="#F59E0B">
        <Field label="Section Heading">
          <Input className={inputClass} value={reachSection?.heading || ""} onChange={(e) => updateSectionMeta("stats", { heading: e.target.value })} placeholder="MORE THAN A NUMBER" />
        </Field>
        {reachMetrics.map((m, i) => (
          <div key={i} className="flex gap-2 items-end">
            <Field label={`Value ${i + 1}`} count={reachMetrics.length} max={6}>
              <Input className={inputClass} value={m.value} onChange={(e) => updateReachMetric(i, "value", e.target.value)} placeholder="820" />
            </Field>
            <Field label="Label">
              <Input className={inputClass} value={m.label} onChange={(e) => updateReachMetric(i, "label", e.target.value)} placeholder="families connected" />
            </Field>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => removeReachMetric(i)}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addReachMetric} disabled={reachMetrics.length >= 6}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Metric
        </Button>
      </Section>

      {/* 8. Gallery */}
      <Section title="Campaign Gallery" hint="Photo grid with captions" defaultOpen={false} accent="#0EA5E9">
        <Field label="Section Heading">
          <Input className={inputClass} value={gallerySection?.heading || ""} onChange={(e) => updateSectionMeta("gallery", { heading: e.target.value })} placeholder="A FEW MOMENTS ALONG THE WAY" />
        </Field>
        {galleryImages.map((img, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Image {String(i + 1).padStart(2, "0")}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeGalleryImage(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
            <AssetPicker
              assetId={img.assetId ?? null}
              url={img.url}
              alt={img.alt}
              onPick={(pick) => updateGalleryImage(i, pick)}
              onClear={() => updateGalleryImage(i, { assetId: "", url: "" })}
            />
            <Field label="Alt Text">
              <Input className={inputClass} value={img.alt} onChange={(e) => updateGalleryImage(i, { alt: e.target.value })} placeholder="Description for accessibility" />
            </Field>
            <Field label="Caption">
              <Input className={inputClass} value={img.caption || ""} onChange={(e) => updateGalleryImage(i, { caption: e.target.value })} placeholder="Connection begins with being together." />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addGalleryImage} disabled={galleryImages.length >= 8}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
        </Button>
      </Section>

      {/* 9. Participate / Get Involved */}
      <Section title="Participation / Get Involved" hint="Volunteer and share options" defaultOpen={false} accent="#0B5F8A">
        <Field label="Eyebrow">
          <Input className={inputClass} value={ctaSection?.heading || ""} onChange={(e) => updateSectionMeta("cta", { heading: e.target.value })} placeholder="THERE IS A PLACE FOR YOU HERE" />
        </Field>
        <Field label="Heading" required>
          <Input className={inputClass} value={ctaContent?.title || ""} onChange={(e) => updateCta({ title: e.target.value })} placeholder="Bring what you can. Be part of what's next." />
        </Field>
        <Field label="Description">
          <textarea className={textareaClass + " !min-h-[60px]"} value={ctaContent?.description || ""} onChange={(e) => updateCta({ description: e.target.value })} placeholder="Your time, your skills or a conversation can help this community grow." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary Button Text">
            <Input className={inputClass} value={ctaContent?.buttons?.[0]?.label || ""} onChange={(e) => setCtaButton(e.target.value, ctaContent?.buttons?.[0]?.url || "/volunteer")} placeholder="Explore ways to volunteer" />
          </Field>
          <Field label="Primary Button URL">
            <Input className={inputClass} value={ctaContent?.buttons?.[0]?.url || ""} onChange={(e) => setCtaButton(ctaContent?.buttons?.[0]?.label || "", e.target.value)} placeholder="/volunteer" />
          </Field>
        </div>
      </Section>
    </div>
  )
}
