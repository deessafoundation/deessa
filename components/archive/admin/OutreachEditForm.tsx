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

interface OutreachData {
  hero: Hero
  eyebrow: string
  shortDescription: string
  sections: Sections
}

// ── Component ────────────────────────────────────────────────

export function OutreachEditForm({
  data,
  onChange,
}: {
  data: OutreachData
  onChange: (data: OutreachData) => void
}) {
  const { hero, eyebrow, shortDescription, sections } = data

  function updateHero(updates: Partial<Hero>) {
    onChange({ ...data, hero: { ...hero, ...updates } })
  }

  function getSection(type: ProgramSection["content"]["type"]) {
    return sections.find((s) => s.content.type === type) ?? null
  }

  function updateSection(type: ProgramSection["content"]["type"], content: ProgramSection["content"]) {
    const exists = sections.find((s) => s.content.type === type)
    if (exists) {
      onChange({ ...data, sections: sections.map((s) => s.content.type === type ? { ...s, content } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: `${type.replace(/_/g, "-")}-auto`, heading: "", enabled: true, content }] })
    }
  }

  function updateSectionHeading(type: ProgramSection["content"]["type"], heading: string) {
    const exists = sections.find((s) => s.content.type === type)
    if (exists) {
      onChange({ ...data, sections: sections.map((s) => s.content.type === type ? { ...s, heading } : s) })
    } else {
      const content = createDefaultContent(type)
      if (content) {
        onChange({ ...data, sections: [...sections, { id: `${type.replace(/_/g, "-")}-auto`, heading, enabled: true, content }] })
      }
    }
  }

  function createDefaultContent(type: ProgramSection["content"]["type"]): ProgramSection["content"] | null {
    switch (type) {
      case "stats": return { type: "stats", stats: [{ value: "", label: "" }] }
      case "activities": return { type: "activities", activities: [{ place: "", date: "", title: "", description: "" }] }
      case "gallery": return { type: "gallery", layout: "grid", images: [] }
      case "quote": return { type: "quote", quote: "", person: "" }
      case "cta": return { type: "cta", title: "", description: "", buttons: [{ label: "", url: "/", variant: "primary" }] }
      case "rich_text": return { type: "rich_text", body: "" }
      default: return null
    }
  }

  // ── Hero (Intro) helpers ──────────────────────────────────

  const heroNoteText = hero.note?.text || ""
  const heroNoteIcon = hero.note?.icon || ""

  // ── Ribbon Stats helpers ──────────────────────────────────

  const ribbonSection = getSection("stats")
  const ribbonStats = ribbonSection?.content.type === "stats" ? ribbonSection.content.stats : []

  function updateRibbonStat(index: number, field: "value" | "label", val: string) {
    const next = ribbonStats.map((s, i) => i === index ? { ...s, [field]: val } : s)
    updateSection("stats", { type: "stats", stats: next })
  }

  function addRibbonStat() {
    if (ribbonStats.length >= 6) return
    updateSection("stats", { type: "stats", stats: [...ribbonStats, { value: "", label: "" }] })
  }

  function removeRibbonStat(index: number) {
    updateSection("stats", { type: "stats", stats: ribbonStats.filter((_, i) => i !== index) })
  }

  // ── Opening (Rich Text) helpers ──────────────────────────

  const openingSection = sections.find((s) => s.content.type === "rich_text")

  function updateOpeningBody(body: string) {
    const exists = openingSection
    if (exists) {
      onChange({ ...data, sections: sections.map((s) => s.content.type === "rich_text" ? { ...s, content: { type: "rich_text", body } } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: "rich_text-auto", heading: "", enabled: true, content: { type: "rich_text", body } }] })
    }
  }

  // ── Postcards (Activities) helpers ────────────────────────

  const postcardsSection = getSection("activities")
  const postcards = postcardsSection?.content.type === "activities" ? postcardsSection.content.activities : []

  function updatePostcard(index: number, field: string, val: string) {
    const next = postcards.map((a, i) => i === index ? { ...a, [field]: val } : a)
    updateSection("activities", { type: "activities", activities: next })
  }

  function addPostcard() {
    if (postcards.length >= 10) return
    updateSection("activities", { type: "activities", activities: [...postcards, { place: "", date: "", title: "", description: "", count: "" }] })
  }

  function removePostcard(index: number) {
    updateSection("activities", { type: "activities", activities: postcards.filter((_, i) => i !== index) })
  }

  // ── Photo Essay (Gallery) helpers ─────────────────────────

  const essaySection = sections.find((s) => s.content.type === "gallery")
  const essayImages = essaySection?.content.type === "gallery" ? essaySection.content.images : []

  function updateEssayImage(index: number, updates: Partial<{ assetId: string; url: string; alt: string; caption: string }>) {
    const next = essayImages.map((img, i) => i === index ? { ...img, ...updates } : img)
    updateSection("gallery", { type: "gallery", layout: "grid", images: next })
  }

  function addEssayImage() {
    if (essayImages.length >= 4) return
    updateSection("gallery", { type: "gallery", layout: "grid", images: [...essayImages, { assetId: "", url: "", alt: "", caption: "" }] })
  }

  function removeEssayImage(index: number) {
    updateSection("gallery", { type: "gallery", layout: "grid", images: essayImages.filter((_, i) => i !== index) })
  }

  // ── Community Voice (Quote) helpers ───────────────────────

  const voiceSection = getSection("quote")
  const voiceQuote = voiceSection?.content.type === "quote" ? voiceSection.content : null

  function updateVoice(updates: Partial<{ quote: string; person: string; role: string; location: string }>) {
    const current = voiceQuote || { quote: "", person: "", role: "", location: "" }
    updateSection("quote", { type: "quote", ...current, ...updates })
  }

  // ── CTA helpers ──────────────────────────────────────────

  const ctaSection = getSection("cta")
  const ctaContent = ctaSection?.content.type === "cta" ? ctaSection.content : null

  function updateCta(updates: Partial<{ title: string; description: string; buttons: { label: string; url: string; variant: "primary" | "secondary" | "outline" }[] }>) {
    const current = ctaContent || { title: "", description: "", buttons: [] as { label: string; url: string; variant: "primary" | "secondary" | "outline" }[] }
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

  // ── Metrics (Stats #2) helpers ──────────────────────────

  const metricsSection = sections.find((s) => s.content.type === "stats" && s.id !== ribbonSection?.id)
  const metrics = metricsSection?.content.type === "stats" ? metricsSection.content.stats : []

  function updateMetric(index: number, field: "value" | "label", val: string) {
    const next = metrics.map((s, i) => i === index ? { ...s, [field]: val } : s)
    if (metricsSection) {
      onChange({ ...data, sections: sections.map((s) => s === metricsSection ? { ...s, content: { type: "stats", stats: next } } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: "stats-metrics-auto", heading: "", enabled: true, content: { type: "stats", stats: next } }] })
    }
  }

  function addMetric() {
    if (metrics.length >= 6) return
    const next = [...metrics, { value: "", label: "" }]
    if (metricsSection) {
      onChange({ ...data, sections: sections.map((s) => s === metricsSection ? { ...s, content: { type: "stats", stats: next } } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: "stats-metrics-auto", heading: "", enabled: true, content: { type: "stats", stats: next } }] })
    }
  }

  function removeMetric(index: number) {
    const next = metrics.filter((_, i) => i !== index)
    if (metricsSection) {
      onChange({ ...data, sections: sections.map((s) => s === metricsSection ? { ...s, content: { type: "stats", stats: next } } : s) })
    }
  }

  // ── Gallery helpers ──────────────────────────────────────

  const gallerySection = sections.find((s) => s.content.type === "gallery" && s.id !== essaySection?.id)
  const galleryImages = gallerySection?.content.type === "gallery" ? gallerySection.content.images : []

  function updateGalleryImage(index: number, updates: Partial<{ assetId: string; url: string; alt: string; caption: string }>) {
    const next = galleryImages.map((img, i) => i === index ? { ...img, ...updates } : img)
    if (gallerySection) {
      onChange({ ...data, sections: sections.map((s) => s === gallerySection ? { ...s, content: { type: "gallery", layout: "grid", images: next } } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: "gallery-auto", heading: "", enabled: true, content: { type: "gallery", layout: "grid", images: next } }] })
    }
  }

  function addGalleryImage() {
    if (galleryImages.length >= 8) return
    const next = [...galleryImages, { assetId: "", url: "", alt: "", caption: "" }]
    if (gallerySection) {
      onChange({ ...data, sections: sections.map((s) => s === gallerySection ? { ...s, content: { type: "gallery", layout: "grid", images: next } } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: "gallery-auto", heading: "", enabled: true, content: { type: "gallery", layout: "grid", images: next } }] })
    }
  }

  function removeGalleryImage(index: number) {
    const next = galleryImages.filter((_, i) => i !== index)
    if (gallerySection) {
      onChange({ ...data, sections: sections.map((s) => s === gallerySection ? { ...s, content: { type: "gallery", layout: "grid", images: next } } : s) })
    }
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* 1. Hero / Intro */}
      <Section title="Hero Introduction" hint="The opening section with stamp badge" accent="#3FABDE">
        <Field label="Eyebrow" hint="e.g. COMMUNITY & OUTREACH / FIELD JOURNAL 01">
          <Input className={inputClass} value={eyebrow} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} placeholder="COMMUNITY & OUTREACH" />
        </Field>
        <Field label="Heading Line 1" required>
          <Input className={inputClass} value={hero.title} onChange={(e) => updateHero({ title: e.target.value })} placeholder="Good things" />
        </Field>
        <Field label="Heading Line 2 (emphasized)" hint="This text appears in accent color">
          <Input className={inputClass} value={hero.description} onChange={(e) => updateHero({ description: e.target.value })} placeholder="happen together." />
        </Field>
        <Field label="Stamp Badge Text" hint="3 lines, e.g. LISTEN. / LEARN. / CONNECT.">
          <Input className={inputClass} value={heroNoteText} onChange={(e) => updateHero({ note: { text: e.target.value, icon: heroNoteIcon } })} placeholder="LISTEN.&#10;LEARN.&#10;CONNECT." />
        </Field>
        <Field label="Subtitle Lines" hint="Separate lines with line breaks">
          <textarea className={textareaClass} value={hero.photoNote || ""} onChange={(e) => updateHero({ photoNote: e.target.value })} placeholder={"A community learning journey.\nThree places. Many perspectives.\nA little more understanding."} />
        </Field>
        <Field label="Hero Image">
          <AssetPicker
            assetId={hero.image?.assetId ?? null}
            url={hero.image?.url}
            alt={hero.image?.alt || hero.title}
            onPick={(pick) => updateHero({ image: { ...pick, alt: hero.image?.alt || hero.title } })}
            onClear={() => updateHero({ image: undefined })}
          />
        </Field>
      </Section>

      {/* 2. Cover Photo */}
      <Section title="Cover Photo" hint="Large feature image with label overlay" defaultOpen={false} accent="#0EA5E9">
        <Field label="Cover Image">
          <AssetPicker
            assetId={hero.image?.assetId ?? null}
            url={hero.image?.url}
            alt={hero.image?.alt || hero.title}
            onPick={(pick) => updateHero({ image: { ...pick, alt: hero.image?.alt || hero.title } })}
            onClear={() => updateHero({ image: undefined })}
          />
        </Field>
        <Field label="Location Label" hint="Paper label overlay, e.g. Across the Kathmandu Valley">
          <Input className={inputClass} value={heroNoteText} onChange={(e) => updateHero({ note: { text: e.target.value, icon: heroNoteIcon } })} placeholder="Across the Kathmandu Valley" />
        </Field>
        <Field label="Caption Left" hint="e.g. THE COMMUNITY CONNECTION SERIES">
          <Input className={inputClass} value={eyebrow} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} placeholder="THE COMMUNITY CONNECTION SERIES" />
        </Field>
        <Field label="Caption Right" hint="e.g. APRIL 2026 · SAMPLE JOURNAL">
          <Input className={inputClass} value={hero.photoNote || ""} onChange={(e) => updateHero({ photoNote: e.target.value })} placeholder="APRIL 2026 · SAMPLE JOURNEY" />
        </Field>
      </Section>

      {/* 3. Ribbon Stats */}
      <Section title="Impact Ribbon" hint="Horizontal stat strip" accent="#F59E0B">
        <Field label="Section Heading" hint="Optional heading above the ribbon">
          <Input className={inputClass} value={ribbonSection?.heading || ""} onChange={(e) => updateSectionHeading("stats", e.target.value)} placeholder="" />
        </Field>
        {ribbonStats.map((stat, i) => (
          <div key={i} className="flex gap-2 items-end">
            <Field label={`Stat ${i + 1} Value`} count={ribbonStats.length} max={6}>
              <Input className={inputClass} value={stat.value} onChange={(e) => updateRibbonStat(i, "value", e.target.value)} placeholder="140" />
            </Field>
            <Field label="Label">
              <Input className={inputClass} value={stat.label} onChange={(e) => updateRibbonStat(i, "label", e.target.value)} placeholder="people connected" />
            </Field>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => removeRibbonStat(i)}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addRibbonStat} disabled={ribbonStats.length >= 6}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Stat
        </Button>
      </Section>

      {/* 4. Opening Narrative */}
      <Section title="Opening Narrative" hint="Introduction text with heading" defaultOpen={false} accent="#3FABDE">
        <Field label="Eyebrow" hint="e.g. IT STARTS WITH SHOWING UP">
          <Input className={inputClass} value={openingSection?.heading || ""} onChange={(e) => {
            if (openingSection) {
              onChange({ ...data, sections: sections.map((s) => s.content.type === "rich_text" ? { ...s, heading: e.target.value } : s) })
            }
          }} placeholder="IT STARTS WITH SHOWING UP" />
        </Field>
        <Field label="Body Text" hint="The main narrative paragraphs">
          <textarea className={textareaClass} value={openingSection?.content.type === "rich_text" ? openingSection.content.body : ""} onChange={(e) => updateOpeningBody(e.target.value)} placeholder={"We brought families, teachers and local volunteers into the same space.\n\nTo listen first. To try something new."} />
        </Field>
      </Section>

      {/* 5. Postcards (Community Stops) */}
      <Section title="Postcards from the Journey" hint="Community stop cards" accent="#95C11F">
        <Field label="Section Heading">
          <Input className={inputClass} value={postcardsSection?.heading || ""} onChange={(e) => updateSectionHeading("activities", e.target.value)} placeholder="Different places. Shared hopes." />
        </Field>
        {postcards.map((stop, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Stop {String(i + 1).padStart(2, "0")}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePostcard(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Place" required>
                <Input className={inputClass} value={stop.place} onChange={(e) => updatePostcard(i, "place", e.target.value)} placeholder="Lalitpur" />
              </Field>
              <Field label="Date">
                <Input className={inputClass} value={stop.date} onChange={(e) => updatePostcard(i, "date", e.target.value)} placeholder="12 April" />
              </Field>
            </div>
            <Field label="Title" required>
              <Input className={inputClass} value={stop.title} onChange={(e) => updatePostcard(i, "title", e.target.value)} placeholder="A space to listen" />
            </Field>
            <Field label="Description">
              <textarea className={textareaClass + " !min-h-[60px]"} value={stop.description} onChange={(e) => updatePostcard(i, "description", e.target.value)} placeholder="Parents and educators shared everyday experiences..." />
            </Field>
            <Field label="Participant Count">
              <Input className={inputClass} value={stop.count} onChange={(e) => updatePostcard(i, "count", e.target.value)} placeholder="45 participants" />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addPostcard} disabled={postcards.length >= 10}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Stop
        </Button>
      </Section>

      {/* 6. Photo Essay */}
      <Section title="Photo Essay" hint="Image story with captions" defaultOpen={false} accent="#0EA5E9">
        <Field label="Section Heading">
          <Input className={inputClass} value={essaySection?.heading || ""} onChange={(e) => {
            if (essaySection) {
              onChange({ ...data, sections: sections.map((s) => s === essaySection ? { ...s, heading: e.target.value } : s) })
            }
          }} placeholder="Learning looks like this." />
        </Field>
        {essayImages.map((img, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Image {String(i + 1).padStart(2, "0")}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeEssayImage(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
            <AssetPicker
              assetId={img.assetId ?? null}
              url={img.url}
              alt={img.alt}
              onPick={(pick) => updateEssayImage(i, pick)}
              onClear={() => updateEssayImage(i, { assetId: "", url: "" })}
            />
            <Field label="Alt Text">
              <Input className={inputClass} value={img.alt} onChange={(e) => updateEssayImage(i, { alt: e.target.value })} placeholder="Description for accessibility" />
            </Field>
            <Field label="Caption">
              <Input className={inputClass} value={img.caption || ""} onChange={(e) => updateEssayImage(i, { caption: e.target.value })} placeholder="Space for curiosity." />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addEssayImage} disabled={essayImages.length >= 4}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
        </Button>
      </Section>

      {/* 7. Community Voice */}
      <Section title="Community Voice" hint="Testimonial quote" defaultOpen={false} accent="#8B5CF6">
        <Field label="Eyebrow">
          <Input className={inputClass} value={voiceSection?.heading || ""} onChange={(e) => updateSectionHeading("quote", e.target.value)} placeholder="COMMUNITY VOICES" />
        </Field>
        <Field label="Quote" required>
          <textarea className={textareaClass} value={voiceQuote?.quote || ""} onChange={(e) => updateVoice({ quote: e.target.value })} placeholder={'"We came with questions. We left with ideas.'} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Person Name" required>
            <Input className={inputClass} value={voiceQuote?.person || ""} onChange={(e) => updateVoice({ person: e.target.value })} placeholder="A community participant" />
          </Field>
          <Field label="Role / Location">
            <Input className={inputClass} value={voiceQuote?.role || ""} onChange={(e) => updateVoice({ role: e.target.value })} placeholder="Sample story" />
          </Field>
        </div>
      </Section>

      {/* 8. Call to Action */}
      <Section title="Call to Action" hint="Closing CTA section" accent="#0B5F8A">
        <Field label="Eyebrow">
          <Input className={inputClass} value={ctaSection?.heading || ""} onChange={(e) => updateSectionHeading("cta", e.target.value)} placeholder="LET'S KEEP THE CONVERSATION GOING" />
        </Field>
        <Field label="Heading" required>
          <Input className={inputClass} value={ctaContent?.title || ""} onChange={(e) => updateCta({ title: e.target.value })} placeholder="Your community. Our next chapter?" />
        </Field>
        <Field label="Description">
          <textarea className={textareaClass + " !min-h-[60px]"} value={ctaContent?.description || ""} onChange={(e) => updateCta({ description: e.target.value })} placeholder="Bring a learning session to your school, neighborhood or community group." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Button Text" required>
            <Input className={inputClass} value={ctaContent?.buttons?.[0]?.label || ""} onChange={(e) => setCtaButton(e.target.value, ctaContent?.buttons?.[0]?.url || "/contact")} placeholder="Explore hosting a session" />
          </Field>
          <Field label="Button URL">
            <Input className={inputClass} value={ctaContent?.buttons?.[0]?.url || ""} onChange={(e) => setCtaButton(ctaContent?.buttons?.[0]?.label || "", e.target.value)} placeholder="/contact" />
          </Field>
        </div>
      </Section>

      {/* 9. Impact Metrics */}
      <Section title="Impact Metrics" hint="Numbered impact grid" defaultOpen={false} accent="#F59E0B">
        <Field label="Section Heading">
          <Input className={inputClass} value={metricsSection?.heading || ""} onChange={(e) => {
            if (metricsSection) {
              onChange({ ...data, sections: sections.map((s) => s === metricsSection ? { ...s, heading: e.target.value } : s) })
            }
          }} placeholder="BY THE NUMBERS" />
        </Field>
        {metrics.map((m, i) => (
          <div key={i} className="flex gap-2 items-end">
            <Field label={`Value ${i + 1}`} count={metrics.length} max={6}>
              <Input className={inputClass} value={m.value} onChange={(e) => updateMetric(i, "value", e.target.value)} placeholder="140" />
            </Field>
            <Field label="Label">
              <Input className={inputClass} value={m.label} onChange={(e) => updateMetric(i, "label", e.target.value)} placeholder="people connected" />
            </Field>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => removeMetric(i)}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addMetric} disabled={metrics.length >= 6}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Metric
        </Button>
      </Section>

      {/* 10. Gallery */}
      <Section title="Visual Gallery" hint="Image grid with captions" defaultOpen={false} accent="#0EA5E9">
        <Field label="Section Heading">
          <Input className={inputClass} value={gallerySection?.heading || ""} onChange={(e) => {
            if (gallerySection) {
              onChange({ ...data, sections: sections.map((s) => s === gallerySection ? { ...s, heading: e.target.value } : s) })
            }
          }} placeholder="The details tell the story." />
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
              <Input className={inputClass} value={img.caption || ""} onChange={(e) => updateGalleryImage(i, { caption: e.target.value })} placeholder="Arriving with curiosity." />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addGalleryImage} disabled={galleryImages.length >= 8}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
        </Button>
      </Section>
    </div>
  )
}
