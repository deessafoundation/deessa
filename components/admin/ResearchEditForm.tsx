"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AssetPicker, type AssetPick } from "@/components/admin/program-sections/AssetPicker"
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

interface ResearchData {
  hero: Hero
  eyebrow: string
  shortDescription: string
  sections: Sections
}

// ── Component ────────────────────────────────────────────────

export function ResearchEditForm({
  data,
  onChange,
}: {
  data: ResearchData
  onChange: (data: ResearchData) => void
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
      case "how_it_works": return { type: "how_it_works", items: [{ title: "", description: "" }] }
      case "faq": return { type: "faq", items: [{ question: "", answer: "" }] }
      case "stats": return { type: "stats", stats: [{ value: "", label: "" }] }
      case "gallery": return { type: "gallery", layout: "grid", images: [] }
      case "cta": return { type: "cta", title: "", description: "", buttons: [{ label: "", url: "/", variant: "primary" }] }
      case "rich_text": return { type: "rich_text", body: "" }
      default: return null
    }
  }

  // ── Approach (How It Works) helpers ──────────────────────

  const approachSection = getSection("how_it_works")
  const stages = approachSection?.content.type === "how_it_works" ? approachSection.content.items : []

  function updateStage(index: number, field: string, val: string) {
    const next = stages.map((s, i) => i === index ? { ...s, [field]: val } : s)
    updateSection("how_it_works", { type: "how_it_works", items: next })
  }

  function addStage() {
    if (stages.length >= 6) return
    updateSection("how_it_works", { type: "how_it_works", items: [...stages, { title: "", description: "" }] })
  }

  function removeStage(index: number) {
    updateSection("how_it_works", { type: "how_it_works", items: stages.filter((_, i) => i !== index) })
  }

  // ── Resources (FAQ) helpers ──────────────────────────────

  const resourcesSection = getSection("faq")
  const faqs = resourcesSection?.content.type === "faq" ? resourcesSection.content.items : []

  function updateFaq(index: number, field: "question" | "answer", val: string) {
    const next = faqs.map((f, i) => i === index ? { ...f, [field]: val } : f)
    updateSection("faq", { type: "faq", items: next })
  }

  function addFaq() {
    if (faqs.length >= 10) return
    updateSection("faq", { type: "faq", items: [...faqs, { question: "", answer: "" }] })
  }

  function removeFaq(index: number) {
    updateSection("faq", { type: "faq", items: faqs.filter((_, i) => i !== index) })
  }

  // ── Insights (Features as list) helpers ──────────────────

  const insightsSection = sections.find((s) => s.content.type === "features")
  const insights = insightsSection?.content.type === "features" ? insightsSection.content.features : []

  function updateInsight(index: number, field: string, val: string) {
    const next = insights.map((f, i) => i === index ? { ...f, [field]: val } : f)
    if (insightsSection) {
      onChange({ ...data, sections: sections.map((s) => s === insightsSection ? { ...s, content: { type: "features", layout: "list", features: next } } : s) })
    }
  }

  function addInsight() {
    if (insights.length >= 6) return
    const next = [...insights, { title: "", description: "" }]
    if (insightsSection) {
      onChange({ ...data, sections: sections.map((s) => s === insightsSection ? { ...s, content: { type: "features", layout: "list", features: next } } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: "features-insights-auto", heading: "", enabled: true, content: { type: "features", layout: "list", features: next } }] })
    }
  }

  function removeInsight(index: number) {
    const next = insights.filter((_, i) => i !== index)
    if (insightsSection) {
      onChange({ ...data, sections: sections.map((s) => s === insightsSection ? { ...s, content: { type: "features", layout: "list", features: next } } : s) })
    }
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

  // ── Metrics helpers ──────────────────────────────────────

  const metricsSection = getSection("stats")
  const metrics = metricsSection?.content.type === "stats" ? metricsSection.content.stats : []

  function updateMetric(index: number, field: "value" | "label", val: string) {
    const next = metrics.map((s, i) => i === index ? { ...s, [field]: val } : s)
    updateSection("stats", { type: "stats", stats: next })
  }

  function addMetric() {
    if (metrics.length >= 6) return
    updateSection("stats", { type: "stats", stats: [...metrics, { value: "", label: "" }] })
  }

  function removeMetric(index: number) {
    updateSection("stats", { type: "stats", stats: metrics.filter((_, i) => i !== index) })
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

  // ── Rich Text helpers ────────────────────────────────────

  const richTextSection = getSection("rich_text")

  function updateRichTextBody(body: string) {
    const exists = richTextSection
    if (exists) {
      onChange({ ...data, sections: sections.map((s) => s.content.type === "rich_text" ? { ...s, content: { type: "rich_text", body } } : s) })
    } else {
      onChange({ ...data, sections: [...sections, { id: "rich_text-auto", heading: "", enabled: true, content: { type: "rich_text", body } }] })
    }
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* 1. Hero */}
      <Section title="Hero" hint="Research hero with concept visual" accent="#3FABDE">
        <Field label="Eyebrow" hint="e.g. RESEARCH & INNOVATION">
          <Input className={inputClass} value={eyebrow} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} placeholder="RESEARCH & INNOVATION" />
        </Field>
        <Field label="Heading Line 1" required>
          <Input className={inputClass} value={hero.title} onChange={(e) => updateHero({ title: e.target.value })} placeholder="Designed for" />
        </Field>
        <Field label="Heading Line 2 (emphasized)" hint="Appears in accent color">
          <Input className={inputClass} value={hero.description} onChange={(e) => updateHero({ description: e.target.value })} placeholder="the everyday." />
        </Field>
        <Field label="Description Paragraph" required>
          <textarea className={textareaClass} value={shortDescription} onChange={(e) => onChange({ ...data, shortDescription: e.target.value })} placeholder="Meet deessa Companion. An exploration of simple digital tools that support communication, routines and everyday independence." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary CTA Text">
            <Input className={inputClass} value={hero.actions?.[0]?.label || ""} onChange={(e) => updateHero({ actions: [{ label: e.target.value, url: hero.actions?.[0]?.url || "#approach", variant: "primary" }] })} placeholder="Explore the concept" />
          </Field>
          <Field label="Primary CTA URL">
            <Input className={inputClass} value={hero.actions?.[0]?.url || ""} onChange={(e) => updateHero({ actions: [{ label: hero.actions?.[0]?.label || "", url: e.target.value, variant: "primary" }] })} placeholder="#approach" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Secondary CTA Text">
            <Input className={inputClass} value={hero.actions?.[1]?.label || ""} onChange={(e) => {
              const actions = [...(hero.actions || [])]
              actions[1] = { label: e.target.value, url: actions[1]?.url || "#methodology", variant: "secondary" as const }
              updateHero({ actions })
            }} placeholder="Our approach" />
          </Field>
          <Field label="Secondary CTA URL">
            <Input className={inputClass} value={hero.actions?.[1]?.url || ""} onChange={(e) => {
              const actions = [...(hero.actions || [])]
              actions[1] = { label: actions[1]?.label || "", url: e.target.value, variant: "secondary" as const }
              updateHero({ actions })
            }} placeholder="#methodology" />
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
      </Section>

      {/* 2. Question Strip */}
      <Section title="Research Question" hint="Dark strip with the core question" defaultOpen={false} accent="#0B5F8A">
        <Field label="Question Text" required>
          <textarea className={textareaClass + " !min-h-[60px]"} value={richTextSection?.content.type === "rich_text" ? richTextSection.content.body : ""} onChange={(e) => updateRichTextBody(e.target.value)} placeholder="How might a simple tool make everyday expression a little easier?" />
        </Field>
      </Section>

      {/* 3. Approach Stages */}
      <Section title="Approach / Design Process" hint="Numbered research stages" accent="#95C11F">
        <Field label="Section Heading">
          <Input className={inputClass} value={approachSection?.heading || ""} onChange={(e) => updateSectionMeta("how_it_works", { heading: e.target.value })} placeholder="An idea shaped by listening." />
        </Field>
        <Field label="Section Intro">
          <textarea className={textareaClass + " !min-h-[60px]"} value={approachSection?.intro || ""} onChange={(e) => updateSectionMeta("how_it_works", { intro: e.target.value })} placeholder="Useful tools begin with real life." />
        </Field>
        {stages.map((stage, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Stage {String(i + 1).padStart(2, "0")}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStage(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
            <Field label="Title" required>
              <Input className={inputClass} value={stage.title} onChange={(e) => updateStage(i, "title", e.target.value)} placeholder="Start with everyday life" />
            </Field>
            <Field label="Description">
              <textarea className={textareaClass + " !min-h-[60px]"} value={stage.description} onChange={(e) => updateStage(i, "description", e.target.value)} placeholder="Conversations with families reveal the moments where a simple tool could make a difference." />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addStage} disabled={stages.length >= 6}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Stage
        </Button>
      </Section>

      {/* 4. Research Insights */}
      <Section title="Research Insights" hint="What we are learning" defaultOpen={false} accent="#D6336C">
        <Field label="Section Heading">
          <Input className={inputClass} value={insightsSection?.heading || ""} onChange={(e) => {
            if (insightsSection) {
              onChange({ ...data, sections: sections.map((s) => s === insightsSection ? { ...s, heading: e.target.value } : s) })
            }
          }} placeholder="The next version starts with a question." />
        </Field>
        {insights.map((insight, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Insight {String(i + 1).padStart(2, "0")}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeInsight(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
            <Field label="Title" required>
              <Input className={inputClass} value={insight.title} onChange={(e) => updateInsight(i, "title", e.target.value)} placeholder="Familiarity comes first." />
            </Field>
            <Field label="Description">
              <textarea className={textareaClass + " !min-h-[60px]"} value={insight.description} onChange={(e) => updateInsight(i, "description", e.target.value)} placeholder="Everyday words and recognizable symbols can make the first interaction feel less demanding." />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addInsight} disabled={insights.length >= 6}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Insight
        </Button>
      </Section>

      {/* 5. Resources / FAQ */}
      <Section title="Resources / FAQ" hint="Collapsible Q&A items" accent="#3FABDE">
        <Field label="Section Heading">
          <Input className={inputClass} value={resourcesSection?.heading || ""} onChange={(e) => updateSectionMeta("faq", { heading: e.target.value })} placeholder="Explore the thinking." />
        </Field>
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Item {String(i + 1).padStart(2, "0")}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFaq(i)}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
            <Field label="Question" required>
              <Input className={inputClass} value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Design brief / A calmer everyday experience" />
            </Field>
            <Field label="Answer" required>
              <textarea className={textareaClass + " !min-h-[80px]"} value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="This concept explores communication cards and visual routines..." />
            </Field>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addFaq} disabled={faqs.length >= 10}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
        </Button>
      </Section>

      {/* 6. Call to Action */}
      <Section title="Call to Action" hint="Closing collaboration CTA" accent="#0B5F8A">
        <Field label="Eyebrow">
          <Input className={inputClass} value={ctaSection?.heading || ""} onChange={(e) => updateSectionMeta("cta", { heading: e.target.value })} placeholder="BETTER QUESTIONS. BETTER POSSIBILITIES." />
        </Field>
        <Field label="Heading" required>
          <Input className={inputClass} value={ctaContent?.title || ""} onChange={(e) => updateCta({ title: e.target.value })} placeholder="Help shape what comes next." />
        </Field>
        <Field label="Description">
          <textarea className={textareaClass + " !min-h-[60px]"} value={ctaContent?.description || ""} onChange={(e) => updateCta({ description: e.target.value })} placeholder="Families, educators, researchers and thoughtful collaborators: there is a place for your perspective." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Button Text">
            <Input className={inputClass} value={ctaContent?.buttons?.[0]?.label || ""} onChange={(e) => setCtaButton(e.target.value, ctaContent?.buttons?.[0]?.url || "/contact")} placeholder="Explore a collaboration" />
          </Field>
          <Field label="Button URL">
            <Input className={inputClass} value={ctaContent?.buttons?.[0]?.url || ""} onChange={(e) => setCtaButton(ctaContent?.buttons?.[0]?.label || "", e.target.value)} placeholder="/contact" />
          </Field>
        </div>
      </Section>

      {/* 7. Metrics */}
      <Section title="Early Results / Metrics" hint="Impact numbers" defaultOpen={false} accent="#F59E0B">
        <Field label="Section Heading">
          <Input className={inputClass} value={metricsSection?.heading || ""} onChange={(e) => updateSectionMeta("stats", { heading: e.target.value })} placeholder="EARLY RESULTS / SAMPLE ONLY" />
        </Field>
        {metrics.map((m, i) => (
          <div key={i} className="flex gap-2 items-end">
            <Field label={`Value ${i + 1}`} count={metrics.length} max={6}>
              <Input className={inputClass} value={m.value} onChange={(e) => updateMetric(i, "value", e.target.value)} placeholder="3" />
            </Field>
            <Field label="Label">
              <Input className={inputClass} value={m.label} onChange={(e) => updateMetric(i, "label", e.target.value)} placeholder="prototype rounds" />
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

      {/* 8. Gallery */}
      <Section title="Research Gallery" hint="Visual artefacts" defaultOpen={false} accent="#0EA5E9">
        <Field label="Section Heading">
          <Input className={inputClass} value={gallerySection?.heading || ""} onChange={(e) => updateSectionMeta("gallery", { heading: e.target.value })} placeholder="RESEARCH ARTEFACTS" />
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
              <Input className={inputClass} value={img.caption || ""} onChange={(e) => updateGalleryImage(i, { caption: e.target.value })} placeholder="A routine begins with listening." />
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
