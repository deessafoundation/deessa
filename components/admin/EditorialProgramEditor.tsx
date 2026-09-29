"use client"

import { TemplateSection, TemplateTextField as TextField } from "./program-sections/TemplateSection"
import type { ProgramCategory, ProgramDocument, ProgramSection } from "@/lib/programs/content"
import { TemplateSectionsEditor } from "./program-sections/TemplateSectionsEditor"
import { AssetPicker } from "./program-sections/AssetPicker"

export interface EditorialEditorData {
  hero: ProgramDocument["hero"]
  eyebrow: string
  shortDescription: string
  sections: ProgramSection[]
}

export function EditorialProgramEditor({ programId, category, data, onChange, onSectionsChange }: {
  programId: string
  category: Exclude<ProgramCategory, "service">
  data: EditorialEditorData
  onChange: (data: EditorialEditorData) => void
  onSectionsChange: (sections: ProgramSection[]) => void
}) {
  const { hero } = data
  function updateHero(updates: Partial<ProgramDocument["hero"]>) {
    onChange({ ...data, hero: { ...hero, ...updates } })
  }
  function updateAction(index: number, key: "label" | "url" | "variant", value: string) {
    const actions = Array.from({ length: Math.max(index + 1, hero.actions.length) }, (_, i) => hero.actions[i] || { label: "", url: "", variant: i === 0 ? "primary" as const : "secondary" as const })
    actions[index] = { ...actions[index], [key]: value }
    updateHero({ actions })
  }
  const designFields: Array<[keyof NonNullable<typeof hero.editorial>, string]> = category === "research" ? [
    ["status", "Research status"], ["conceptLabel", "Concept card label"], ["conceptTitle", "Concept card heading"],
    ["conceptRoutine1", "First routine"], ["conceptRoutine2", "Second routine"], ["conceptBrand", "Concept name"],
    ["conceptCredit", "Concept credit"], ["figureLabel", "Figure caption"],
  ] : category === "outreach" ? [
    ["stamp", "Stamp badge (one line per word)"], ["location", "Cover location"],
    ["captionLeft", "Cover caption — left"], ["captionRight", "Cover caption — right"],
  ] : [["captionLeft", "Photo caption label"], ["captionRight", "Handwritten photo caption"]]
  return <div className="space-y-6">
    <TemplateSection title={category === "outreach" ? "Journal Cover" : category === "research" ? "Research Hero" : "Campaign Hero"} hint="The top of your page" defaultOpen>
      <AssetPicker assetId={hero.image?.assetId || null} url={hero.image?.url} alt={hero.image?.alt || hero.title}
        label={category === "research" ? "Hero image (leave empty to use the concept card)" : "Hero image"}
        onPick={image => updateHero({ image: { ...hero.image, ...image, alt: hero.image?.alt || hero.title } })}
        onClear={() => updateHero({ image: undefined })} />
      {hero.image && <>
        <TextField label="Image alternative text" value={hero.image.alt} max={180} onChange={alt => updateHero({ image: { ...hero.image!, alt } })} />
        <TextField label="Image focal point (for example 75% center)" value={hero.image.focalPoint} max={40} onChange={focalPoint => updateHero({ image: { ...hero.image!, focalPoint } })} />
      </>}
      <p className="text-sm text-muted-foreground">Use line breaks to compose headings and *asterisks* for accent text. The second heading field uses the demo’s accent color. Research tags are edited in the program details above.</p>
      <TextField label="Eyebrow" value={data.eyebrow} max={120} onChange={eyebrow => onChange({ ...data, eyebrow })} />
      <TextField label="Main heading" value={hero.title} max={180} onChange={title => updateHero({ title })} />
      <TextField label="Accent heading" value={hero.description} max={800} onChange={description => updateHero({ description })} />
      <TextField label={category === "outreach" ? "Program summary for cards and search" : "Introductory paragraph"} value={data.shortDescription} max={400} rows={3} onChange={shortDescription => onChange({ ...data, shortDescription })} />
      {category === "campaign" && <TextField label="Photo label" value={hero.note?.text} onChange={text => updateHero({ note: { ...hero.note, text } })} />}
      {category === "outreach" && <TextField label="Introduction beside the stamp" value={hero.photoNote} onChange={photoNote => updateHero({ photoNote })} />}
      <div className="grid gap-4 md:grid-cols-2">{designFields.map(([key, label]) => <TextField key={key} label={label} value={hero.editorial?.[key]} max={key === "conceptBrand" || key === "conceptCredit" ? 80 : key === "status" || key === "conceptLabel" ? 120 : 200} onChange={value => updateHero({ editorial: { ...hero.editorial, [key]: value } })} />)}</div>
      <div className="grid gap-4 sm:grid-cols-2">{[0, 1].map(i => <div key={i} className="space-y-3">
        <TextField label={i === 0 ? "Primary button text" : "Secondary button text"} value={hero.actions[i]?.label} max={80} onChange={value => updateAction(i, "label", value)} />
        <TextField label={i === 0 ? "Primary button link" : "Secondary button link"} value={hero.actions[i]?.url} max={500} onChange={value => updateAction(i, "url", value)} />
      </div>)}</div>
    </TemplateSection>
    <TemplateSectionsEditor key={category} category={category} programId={programId} sections={data.sections} onChange={onSectionsChange} />
  </div>
}
