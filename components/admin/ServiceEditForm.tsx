"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Plus, Trash2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AssetPicker, AssetPick } from "@/components/admin/program-sections/AssetPicker"
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

interface ServiceData {
  hero: Hero
  eyebrow: string
  shortDescription: string
  sections: Sections
}

// ── Component ────────────────────────────────────────────────

export function ServiceEditForm({
  data,
  onChange,
}: {
  data: ServiceData
  onChange: (data: ServiceData) => void
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
      onChange({ ...data, sections: [...sections, { id: `${type.replace(/_/g, "-")}-auto`, enabled: true, content }] })
    }
  }

  function updateSectionMeta(type: ProgramSection["content"]["type"], updates: Partial<Pick<ProgramSection, "heading" | "intro" | "description">>) {
    const exists = sections.find((s) => s.content.type === type)
    if (exists) {
      onChange({ ...data, sections: sections.map((s) => s.content.type === type ? { ...s, ...updates } : s) })
    } else {
      const content = (() => {
        switch (type) {
          case "features": return { type: "features" as const, layout: "grid" as const, features: [{ title: "", description: "" }] }
          case "how_it_works": return { type: "how_it_works" as const, items: [{ title: "", description: "" }] }
          case "faq": return { type: "faq" as const, items: [{ question: "", answer: "" }] }
          case "stats": return { type: "stats" as const, stats: [{ value: "", label: "" }] }
          case "quote": return { type: "quote" as const, quote: "", person: "" }
          case "gallery": return { type: "gallery" as const, layout: "grid" as const, images: [] }
          case "cta": return { type: "cta" as const, title: "", description: "", buttons: [{ label: "", url: "/", variant: "primary" as const }] }
          default: return { type, facts: [] } as any
        }
      })()
      onChange({ ...data, sections: [...sections, { id: `${type.replace(/_/g, "-")}-auto`, enabled: true, ...updates, content }] })
    }
  }

  function removeSection(type: ProgramSection["content"]["type"]) {
    onChange({ ...data, sections: sections.filter((s) => s.content.type !== type) })
  }

  // ── Facts Bar helpers ────────────────────────────────────

  const factsSection = getSection("facts_bar")
  const facts = factsSection?.content.type === "facts_bar" ? factsSection.content.facts : []

  function updateFact(index: number, field: "label" | "value", val: string) {
    const next = facts.map((f, i) => i === index ? { ...f, [field]: val } : f)
    updateSection("facts_bar", { type: "facts_bar", facts: next })
  }

  function addFact() {
    if (facts.length >= 6) return
    updateSection("facts_bar", { type: "facts_bar", facts: [...facts, { label: "", value: "" }] })
  }

  function removeFact(index: number) {
    updateSection("facts_bar", { type: "facts_bar", facts: facts.filter((_, i) => i !== index) })
  }

  // ── Features helpers ─────────────────────────────────────

  const featuresSection = getSection("features")
  const features = featuresSection?.content.type === "features" ? featuresSection.content.features : []

  function updateFeature(index: number, field: string, val: string) {
    const next = features.map((f, i) => i === index ? { ...f, [field]: val } : f)
    updateSection("features", { type: "features", layout: "grid", features: next })
  }

  function addFeature() {
    if (features.length >= 6) return
    updateSection("features", { type: "features", layout: "grid", features: [...features, { title: "", description: "", icon: "", number: "" }] })
  }

  function removeFeature(index: number) {
    updateSection("features", { type: "features", layout: "grid", features: features.filter((_, i) => i !== index) })
  }

  // ── Steps helpers ────────────────────────────────────────

  const stepsSection = getSection("how_it_works")
  const steps = stepsSection?.content.type === "how_it_works" ? stepsSection.content.items : []

  function updateStep(index: number, field: string, val: string) {
    const next = steps.map((s, i) => i === index ? { ...s, [field]: val } : s)
    updateSection("how_it_works", { type: "how_it_works", items: next })
  }

  function addStep() {
    if (steps.length >= 6) return
    updateSection("how_it_works", { type: "how_it_works", items: [...steps, { title: "", description: "" }] })
  }

  function removeStep(index: number) {
    updateSection("how_it_works", { type: "how_it_works", items: steps.filter((_, i) => i !== index) })
  }

  // ── FAQ helpers ──────────────────────────────────────────

  const faqSection = getSection("faq")
  const faqs = faqSection?.content.type === "faq" ? faqSection.content.items : []

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

  // ── Stats helpers ────────────────────────────────────────

  const statsSection = getSection("stats")
  const stats = statsSection?.content.type === "stats" ? statsSection.content.stats : []

  function updateStat(index: number, field: string, val: string) {
    const next = stats.map((s, i) => i === index ? { ...s, [field]: val } : s)
    updateSection("stats", { type: "stats", stats: next })
  }

  function addStat() {
    if (stats.length >= 6) return
    updateSection("stats", { type: "stats", stats: [...stats, { value: "", label: "" }] })
  }

  function removeStat(index: number) {
    updateSection("stats", { type: "stats", stats: stats.filter((_, i) => i !== index) })
  }

  // ── Gallery helpers ──────────────────────────────────────

  const gallerySection = getSection("gallery")
  const galleryImages = gallerySection?.content.type === "gallery" ? gallerySection.content.images : []

  function updateGalleryImage(index: number, pick: AssetPick) {
    const next = galleryImages.map((img, i) => i === index ? { ...img, ...pick } : img)
    updateSection("gallery", { type: "gallery", layout: "grid", images: next })
  }

  function updateGalleryImageField(index: number, field: "alt" | "caption", value: string) {
    const next = galleryImages.map((img, i) => i === index ? { ...img, [field]: value } : img)
    updateSection("gallery", { type: "gallery", layout: "grid", images: next })
  }

  function addGalleryImage() {
    if (galleryImages.length >= 8) return
    updateSection("gallery", { type: "gallery", layout: "grid", images: [...galleryImages, { alt: "" }] })
  }

  function removeGalleryImage(index: number) {
    updateSection("gallery", { type: "gallery", layout: "grid", images: galleryImages.filter((_, i) => i !== index) })
  }

  // ── Story helpers ────────────────────────────────────────

  const storySection = getSection("story")
  const story = storySection?.content.type === "story" ? storySection.content : null

  function updateStory(updates: Record<string, unknown>) {
    updateSection("story", { type: "story", quote: story?.quote || "", person: story?.person || "", stats: story?.stats || [], ...story, ...updates } as ProgramSection["content"])
  }

  function updateStoryStat(index: number, field: string, val: string) {
    const s = story?.stats || []
    const next = s.map((st, i) => i === index ? { ...st, [field]: val } : st)
    updateStory({ stats: next })
  }

  function addStoryStat() {
    const s = story?.stats || []
    if (s.length >= 4) return
    updateStory({ stats: [...s, { value: "", label: "" }] })
  }

  function removeStoryStat(index: number) {
    const s = story?.stats || []
    updateStory({ stats: s.filter((_, i) => i !== index) })
  }

  // ── CTA helpers ──────────────────────────────────────────

  const ctaSection = getSection("cta")
  const cta = ctaSection?.content.type === "cta" ? ctaSection.content : null

  function updateCta(updates: Record<string, unknown>) {
    updateSection("cta", { type: "cta", title: cta?.title || "", description: cta?.description || "", buttons: cta?.buttons || [], ...cta, ...updates } as ProgramSection["content"])
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ─── HERO ─── */}
      <Section title="Hero" hint="The top of your page" accent="#3FABDE">
        {/* Image first — sets visual context */}
        <Field label="Hero Image" required>
          <AssetPicker
            assetId={hero.image?.assetId ?? null}
            url={hero.image?.url}
            alt={hero.image?.alt || "Hero image"}
            onPick={(pick) => updateHero({ image: { ...pick, alt: hero.image?.alt || "Hero image" } })}
            onClear={() => updateHero({ image: undefined })}
            label="Upload hero image"
          />
        </Field>

        {/* Title block */}
        <Field label="Eyebrow" hint="Small label above the title" required count={eyebrow.length} max={120}>
          <Input value={eyebrow} onChange={(e) => onChange({ ...data, eyebrow: e.target.value })} placeholder="SERVICES & PROGRAMS" maxLength={120} className={inputClass} />
        </Field>
        <Field label="Title" hint="The main heading visitors see" required count={hero.title.length} max={180}>
          <Input value={hero.title} onChange={(e) => updateHero({ title: e.target.value })} placeholder="Every little expression." maxLength={180} className="h-10 text-base font-semibold" />
        </Field>
        <Field label="Description" hint="A short paragraph below the title" required count={hero.description.length} max={800}>
          <textarea value={hero.description} onChange={(e) => updateHero({ description: e.target.value })} placeholder="Communication looks different for every child…" maxLength={800} rows={3} className={textareaClass} />
        </Field>

        {/* Button — single row */}
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <Field label="Button Text" required count={(hero.actions?.[0]?.label || "").length} max={80}>
            <Input value={hero.actions?.[0]?.label || ""} onChange={(e) => {
              const actions = [...(hero.actions || [])]
              actions[0] = { label: e.target.value, url: actions[0]?.url || "#", variant: "primary" }
              updateHero({ actions: actions.slice(0, 1) })
            }} placeholder="Find support for your family" maxLength={80} className={inputClass} />
          </Field>
          <Field label="Button Link" required>
            <Input value={hero.actions?.[0]?.url || ""} onChange={(e) => {
              const actions = [...(hero.actions || [])]
              actions[0] = { label: actions[0]?.label || "", url: e.target.value, variant: "primary" }
              updateHero({ actions: actions.slice(0, 1) })
            }} placeholder="#support" className={`${inputClass} font-mono text-xs`} />
          </Field>
        </div>

        {/* Extras — compact row */}
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_1fr]">
          <Field label="Note Text" count={(hero.note?.text || "").length} max={200}>
            <Input value={hero.note?.text || ""} onChange={(e) => updateHero({ note: { text: e.target.value, icon: hero.note?.icon || "" } })} placeholder="At your pace." maxLength={200} className={inputClass} />
          </Field>
          <Field label="Note Icon">
            <Input value={hero.note?.icon || ""} onChange={(e) => updateHero({ note: { text: hero.note?.text || "", icon: e.target.value } })} placeholder="Heart" className={`${inputClass} font-mono text-xs`} />
          </Field>
          <Field label="Photo Caption" count={(hero.photoNote || "").length} max={200}>
            <Input value={hero.photoNote || ""} onChange={(e) => updateHero({ photoNote: e.target.value })} placeholder="A connection can begin…" maxLength={200} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Sticker Text" count={(hero.sticker?.text || "").length} max={200}>
            <Input value={hero.sticker?.text || ""} onChange={(e) => updateHero({ sticker: { text: e.target.value, icon: hero.sticker?.icon || "" } })} placeholder="Every mind is a gift." maxLength={200} className={inputClass} />
          </Field>
          <Field label="Sticker Icon">
            <Input value={hero.sticker?.icon || ""} onChange={(e) => updateHero({ sticker: { text: hero.sticker?.text || "", icon: e.target.value } })} placeholder="Sparkles" className={`${inputClass} font-mono text-xs`} />
          </Field>
        </div>
      </Section>

      {/* ─── FACTS BAR ─── */}
      <Section title="Quick Facts" hint="4-column strip below the hero" defaultOpen={false} accent="#F59E0B">
        {facts.map((fact, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Field label={`Label ${i + 1}`} required>
                <Input value={fact.label} onChange={(e) => updateFact(i, "label", e.target.value)} placeholder="THE PROGRAM" className={inputClass} />
              </Field>
              <Field label={`Value ${i + 1}`} required>
                <Input value={fact.value} onChange={(e) => updateFact(i, "value", e.target.value)} placeholder="AAC communication support" className={inputClass} />
              </Field>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => removeFact(i)} className="h-8 w-8 text-destructive shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {facts.length < 6 && (
          <Button variant="outline" size="sm" onClick={addFact} className="w-full gap-1.5 text-xs">
            <Plus className="h-3 w-3" /> Add Fact
          </Button>
        )}
      </Section>

      {/* ─── SUPPORT GRID ─── */}
      <Section title="Support Grid" hint="Feature cards with icons" defaultOpen={false} accent="#D6336C">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section Heading" hint="Label above the grid" count={(getSection("features")?.heading || "").length} max={180}>
            <Input value={getSection("features")?.heading || ""} onChange={(e) => updateSectionMeta("features", { heading: e.target.value })} placeholder="A LITTLE UNDERSTANDING GOES A LONG WAY" maxLength={180} className={inputClass} />
          </Field>
          <Field label="Section Intro" hint="Title shown above the cards" count={(getSection("features")?.intro || "").length} max={800}>
            <Input value={getSection("features")?.intro || ""} onChange={(e) => updateSectionMeta("features", { intro: e.target.value })} placeholder='More ways to say "this is me."' maxLength={800} className={inputClass} />
          </Field>
        </div>
        <Field label="Section Description" hint="Paragraph below the title" count={(getSection("features")?.description || "").length} max={800}>
          <textarea value={getSection("features")?.description || ""} onChange={(e) => updateSectionMeta("features", { description: e.target.value })} placeholder="AAC means augmentative and alternative communication…" maxLength={800} rows={3} className={textareaClass} />
        </Field>
        <div className="h-px bg-border" />
        {features.map((feat, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Feature {i + 1}</span>
              {features.length > 1 && (
                <Button variant="ghost" size="icon-sm" onClick={() => removeFeature(i)} className="h-6 w-6 text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Icon" hint="Emoji">
                <Input value={feat.icon || ""} onChange={(e) => updateFeature(i, "icon", e.target.value)} placeholder="💬" maxLength={40} className={inputClass} />
              </Field>
              <Field label="Number" hint="Badge">
                <Input value={feat.number || ""} onChange={(e) => updateFeature(i, "number", e.target.value)} placeholder="01" maxLength={10} className={inputClass} />
              </Field>
              <Field label="Title" required count={feat.title.length} max={120}>
                <Input value={feat.title} onChange={(e) => updateFeature(i, "title", e.target.value)} placeholder="Feature name" maxLength={120} className={inputClass} />
              </Field>
            </div>
            <Field label="Description" required count={feat.description.length} max={800}>
              <textarea value={feat.description} onChange={(e) => updateFeature(i, "description", e.target.value)} placeholder="What this feature does" maxLength={800} rows={3} className={textareaClass} />
            </Field>
          </div>
        ))}
        {features.length < 6 && (
          <Button variant="outline" size="sm" onClick={addFeature} className="w-full gap-1.5 text-xs">
            <Plus className="h-3 w-3" /> Add Feature
          </Button>
        )}
      </Section>

      {/* ─── JOURNEY STEPS ─── */}
      <Section title="Journey Steps" hint="How it works section" defaultOpen={false} accent="#95C11F">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section Heading" count={(getSection("how_it_works")?.heading || "").length} max={180}>
            <Input value={getSection("how_it_works")?.heading || ""} onChange={(e) => updateSectionMeta("how_it_works", { heading: e.target.value })} placeholder="NO TWO JOURNEYS ARE THE SAME" maxLength={180} className={inputClass} />
          </Field>
          <Field label="Section Intro" count={(getSection("how_it_works")?.intro || "").length} max={800}>
            <Input value={getSection("how_it_works")?.intro || ""} onChange={(e) => updateSectionMeta("how_it_works", { intro: e.target.value })} placeholder="We start where you are." maxLength={800} className={inputClass} />
          </Field>
        </div>
        <Field label="Section Description" count={(getSection("how_it_works")?.description || "").length} max={800}>
          <textarea value={getSection("how_it_works")?.description || ""} onChange={(e) => updateSectionMeta("how_it_works", { description: e.target.value })} placeholder="You don't need all the answers…" maxLength={800} rows={3} className={textareaClass} />
        </Field>
        <Field label="Handwritten Note" hint="Decorative text like 'Small steps count, too.'" count={(stepsSection?.content.type === "how_it_works" ? (stepsSection.content as { handwrittenNote?: string }).handwrittenNote || "" : "").length} max={200}>
          <Input value={stepsSection?.content.type === "how_it_works" ? (stepsSection.content as { handwrittenNote?: string }).handwrittenNote || "" : ""} onChange={(e) => {
            const sec = getSection("how_it_works")
            if (sec && sec.content.type === "how_it_works") {
              const newSections = sections.map((s) => s.id === sec.id ? { ...s, content: { ...s.content, handwrittenNote: e.target.value || undefined } } : s)
              onChange({ ...data, sections: newSections })
            }
          }} placeholder="Small steps count, too." maxLength={200} className={inputClass} />
        </Field>
        <div className="h-px bg-border" />
        {steps.map((step, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
              {steps.length > 1 && (
                <Button variant="ghost" size="icon-sm" onClick={() => removeStep(i)} className="h-6 w-6 text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Field label="Title" required count={step.title.length} max={120}>
              <Input value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} placeholder="Let's have a conversation" maxLength={120} className={inputClass} />
            </Field>
            <Field label="Description" required count={step.description.length} max={800}>
              <textarea value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} placeholder="Tell us about your child…" maxLength={800} rows={3} className={textareaClass} />
            </Field>
          </div>
        ))}
        {steps.length < 6 && (
          <Button variant="outline" size="sm" onClick={addStep} className="w-full gap-1.5 text-xs">
            <Plus className="h-3 w-3" /> Add Step
          </Button>
        )}
      </Section>

      {/* ─── STORY ─── */}
      <Section title="Story" hint="Photo + quote section" defaultOpen={false} accent="#8B5CF6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section Heading" count={(getSection("story")?.heading || "").length} max={180}>
            <Input value={getSection("story")?.heading || ""} onChange={(e) => updateSectionMeta("story", { heading: e.target.value })} placeholder="THE MOMENTS THAT MATTER" maxLength={180} className={inputClass} />
          </Field>
          <AssetPicker
            assetId={story?.image?.assetId ?? null}
            url={story?.image?.url}
            alt={story?.image?.alt || "Story photo"}
            onPick={(pick) => updateStory({ image: { ...pick, alt: story?.image?.alt || "Story photo" } })}
            onClear={() => updateStory({ image: undefined })}
            label="Story Photo"
          />
        </div>
        <Field label="Quote" hint="The blockquote text" required count={(story?.quote || "").length} max={1200}>
          <textarea value={story?.quote || ""} onChange={(e) => updateStory({ quote: e.target.value })} placeholder="It wasn't just a new way to communicate…" maxLength={1200} rows={3} className={textareaClass} />
        </Field>
        <Field label="Description" hint="Paragraph below the quote" count={(story?.description || "").length} max={800}>
          <textarea value={story?.description || ""} onChange={(e) => updateStory({ description: e.target.value })} placeholder="A sample family story…" maxLength={800} rows={3} className={textareaClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Person Name" required count={(story?.person || "").length} max={120}>
            <Input value={story?.person || ""} onChange={(e) => updateStory({ person: e.target.value })} placeholder="A parent's perspective" maxLength={120} className={inputClass} />
          </Field>
          <Field label="Role / Location" count={(story?.role || "").length} max={120}>
            <Input value={story?.role || ""} onChange={(e) => updateStory({ role: e.target.value })} placeholder="Illustrative story" maxLength={120} className={inputClass} />
          </Field>
        </div>
        <div className="h-px bg-border" />
        <Label className="text-xs text-muted-foreground">Mini Stats</Label>
        {(story?.stats || []).map((stat, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Field label="Value" required count={stat.value.length} max={40}>
                <Input value={stat.value} onChange={(e) => updateStoryStat(i, "value", e.target.value)} placeholder="120" maxLength={40} className={inputClass} />
              </Field>
              <Field label="Label" required count={stat.label.length} max={120}>
                <Input value={stat.label} onChange={(e) => updateStoryStat(i, "label", e.target.value)} placeholder="families" maxLength={120} className={inputClass} />
              </Field>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => removeStoryStat(i)} className="h-8 w-8 text-destructive shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {(story?.stats || []).length < 4 && (
          <Button variant="outline" size="sm" onClick={addStoryStat} className="w-full gap-1.5 text-xs">
            <Plus className="h-3 w-3" /> Add Mini Stat
          </Button>
        )}
      </Section>

      {/* ─── FAQ ─── */}
      <Section title="FAQ" hint="Expandable questions & answers" defaultOpen={false} accent="#3FABDE">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section Heading" count={(getSection("faq")?.heading || "").length} max={180}>
            <Input value={getSection("faq")?.heading || ""} onChange={(e) => updateSectionMeta("faq", { heading: e.target.value })} placeholder="LET'S MAKE THE FIRST STEP EASIER" maxLength={180} className={inputClass} />
          </Field>
          <Field label="Section Intro" count={(getSection("faq")?.intro || "").length} max={800}>
            <Input value={getSection("faq")?.intro || ""} onChange={(e) => updateSectionMeta("faq", { intro: e.target.value })} placeholder="A few things you might wonder." maxLength={800} className={inputClass} />
          </Field>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Q&A {i + 1}</span>
              {faqs.length > 1 && (
                <Button variant="ghost" size="icon-sm" onClick={() => removeFaq(i)} className="h-6 w-6 text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Field label="Question" required count={faq.question.length} max={240}>
              <Input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Who is this program for?" maxLength={240} className={inputClass} />
            </Field>
            <Field label="Answer" required count={faq.answer.length} max={2000}>
              <textarea value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Children aged 2–12 and their parents…" maxLength={2000} rows={3} className={textareaClass} />
            </Field>
          </div>
        ))}
        {faqs.length < 10 && (
          <Button variant="outline" size="sm" onClick={addFaq} className="w-full gap-1.5 text-xs">
            <Plus className="h-3 w-3" /> Add Q&A
          </Button>
        )}
      </Section>

      {/* ─── CTA ─── */}
      <Section title="Call to Action" hint="Bottom action section" defaultOpen={false} accent="#0B5F8A">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section Heading" count={(getSection("cta")?.heading || "").length} max={180}>
            <Input value={getSection("cta")?.heading || ""} onChange={(e) => updateSectionMeta("cta", { heading: e.target.value })} placeholder="YOU DON'T HAVE TO FIGURE IT OUT ALONE" maxLength={180} className={inputClass} />
          </Field>
          <Field label="Title" required count={(cta?.title || "").length} max={160}>
            <Input value={cta?.title || ""} onChange={(e) => updateCta({ title: e.target.value })} placeholder="Let's find your next small step." maxLength={160} className={inputClass} />
          </Field>
        </div>
        <Field label="Description" count={(cta?.description || "").length} max={800}>
          <textarea value={cta?.description || ""} onChange={(e) => updateCta({ description: e.target.value })} placeholder="Start with a conversation…" maxLength={800} rows={3} className={textareaClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Button Text" required count={(cta?.buttons?.[0]?.label || "").length} max={80}>
            <Input value={cta?.buttons?.[0]?.label || ""} onChange={(e) => {
              const buttons = [...(cta?.buttons || [])]
              buttons[0] = { label: e.target.value, url: buttons[0]?.url || "/", variant: "primary" as const }
              updateCta({ buttons: buttons.slice(0, 1) })
            }} placeholder="Ask about communication support" maxLength={80} className={inputClass} />
          </Field>
          <Field label="Button URL" required>
            <Input value={cta?.buttons?.[0]?.url || ""} onChange={(e) => {
              const buttons = [...(cta?.buttons || [])]
              buttons[0] = { label: buttons[0]?.label || "", url: e.target.value, variant: "primary" as const }
              updateCta({ buttons: buttons.slice(0, 1) })
            }} placeholder="/contact" className={`${inputClass} font-mono text-xs`} />
          </Field>
        </div>
      </Section>

      {/* ─── METRICS ─── */}
      <Section title="Impact Metrics" hint="Stat cards grid" defaultOpen={false} accent="#F59E0B">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section Heading" count={(getSection("stats")?.heading || "").length} max={180}>
            <Input value={getSection("stats")?.heading || ""} onChange={(e) => updateSectionMeta("stats", { heading: e.target.value })} placeholder="A SAMPLE IMPACT SNAPSHOT" maxLength={180} className={inputClass} />
          </Field>
          <Field label="Section Intro" count={(getSection("stats")?.intro || "").length} max={800}>
            <Input value={getSection("stats")?.intro || ""} onChange={(e) => updateSectionMeta("stats", { intro: e.target.value })} placeholder="Small steps, visible change." maxLength={800} className={inputClass} />
          </Field>
        </div>
        <Field label="Section Description" count={(getSection("stats")?.description || "").length} max={800}>
          <textarea value={getSection("stats")?.description || ""} onChange={(e) => updateSectionMeta("stats", { description: e.target.value })} placeholder="Example numbers show how…" maxLength={800} rows={3} className={textareaClass} />
        </Field>
        {stats.map((stat, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Field label="Value" required count={stat.value.length} max={40}>
                <Input value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="120+" maxLength={40} className={inputClass} />
              </Field>
              <Field label="Label" required count={stat.label.length} max={120}>
                <Input value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="families" maxLength={120} className={inputClass} />
              </Field>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => removeStat(i)} className="h-8 w-8 text-destructive shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {stats.length < 6 && (
          <Button variant="outline" size="sm" onClick={addStat} className="w-full gap-1.5 text-xs">
            <Plus className="h-3 w-3" /> Add Metric
          </Button>
        )}
      </Section>

      {/* ─── GALLERY ─── */}
      <Section title="Gallery" hint="Photo grid" defaultOpen={false} accent="#0EA5E9">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section Heading" count={(getSection("gallery")?.heading || "").length} max={180}>
            <Input value={getSection("gallery")?.heading || ""} onChange={(e) => updateSectionMeta("gallery", { heading: e.target.value })} placeholder="A GLIMPSE OF THE WORK" maxLength={180} className={inputClass} />
          </Field>
          <Field label="Section Intro" count={(getSection("gallery")?.intro || "").length} max={800}>
            <Input value={getSection("gallery")?.intro || ""} onChange={(e) => updateSectionMeta("gallery", { intro: e.target.value })} placeholder="Support lives in everyday moments." maxLength={800} className={inputClass} />
          </Field>
        </div>
        {galleryImages.map((img, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Image {i + 1}</span>
              {galleryImages.length > 1 && (
                <Button variant="ghost" size="icon-sm" onClick={() => removeGalleryImage(i)} className="h-6 w-6 text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <AssetPicker
              assetId={img.assetId ?? null}
              url={img.url}
              alt={img.alt}
              onPick={(pick) => updateGalleryImage(i, pick)}
              onClear={() => updateGalleryImage(i, { assetId: undefined, url: undefined })}
              label="Upload image"
            />
            <Field label="Alt Text" hint="For screen readers" required count={(img.alt || "").length} max={180}>
              <Input value={img.alt} onChange={(e) => updateGalleryImageField(i, "alt", e.target.value)} placeholder="Describe this image" maxLength={180} className={inputClass} />
            </Field>
            <Field label="Caption" count={(img.caption || "").length} max={300}>
              <Input value={img.caption || ""} onChange={(e) => updateGalleryImageField(i, "caption", e.target.value)} placeholder="Shown on hover" maxLength={300} className={inputClass} />
            </Field>
          </div>
        ))}
        {galleryImages.length < 8 && (
          <Button variant="outline" size="sm" onClick={addGalleryImage} className="w-full gap-1.5 text-xs">
            <Plus className="h-3 w-3" /> Add Image
          </Button>
        )}
      </Section>
    </div>
  )
}
