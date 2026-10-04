"use client"
import type { ProgramCategory, ProgramSection } from '@/lib/programs/content'
import { TemplateSection, TemplateTextField } from './template-section'
import { TEMPLATE_LAYOUTS, createTemplateSection, templateSectionDetails, type TemplateSlot } from '../../program-sections/template-layouts'
import { SectionFormFactory } from '../../program-sections/forms/SectionFormFactory'
import { ProgramIdProvider } from '../../program-sections/program-id-context'

// Fixed template panels: editing content never removes or replaces unrelated saved sections.
export function TemplateSectionsEditor({ category, programId, sections, onChange }: {
  category: Exclude<ProgramCategory, 'service'>; programId: string; sections: ProgramSection[]; onChange: (sections: ProgramSection[]) => void
}) {
  const used = new Set<string>()
  const panels = TEMPLATE_LAYOUTS[category].map(slot => {
    const existing = sections.find(section => !used.has(section.id) && templateSectionDetails(category, section, sections).key === slot.key)
    if (existing) used.add(existing.id)
    return { slot, section: existing || createTemplateSection(slot), exists: !!existing }
  })
  // Older/custom content stays editable and is never silently discarded.
  for (const section of sections.filter(section => !used.has(section.id))) panels.push({ slot: templateSectionDetails(category, section, sections), section, exists: true })

  function updatePanel(slot: TemplateSlot, section: ProgramSection, exists: boolean, updates: Partial<ProgramSection>) {
    const updated = { ...section, ...updates, ...(slot.presentation ? { presentation: slot.presentation } : {}) }
    if (exists) onChange(sections.map(item => item.id === section.id ? updated : item))
    else {
      const next = [...sections]
      const order = TEMPLATE_LAYOUTS[category].findIndex(item => item.key === slot.key)
      const insertion = next.findIndex(item => TEMPLATE_LAYOUTS[category].findIndex(candidate => candidate.key === templateSectionDetails(category, item, sections).key) > order)
      next.splice(insertion < 0 ? next.length : insertion, 0, updated)
      onChange(next)
    }
  }

  return <ProgramIdProvider programId={programId}><div className="space-y-4">
    {panels.map(({ slot, section, exists }, index) => {
      const content = section.content
      const update = (updates: Partial<ProgramSection>) => updatePanel(slot, section, exists, updates)
      const ribbon = slot.key === 'ribbon'
      const simpleHeading = content.type === 'progress_tracker' || ribbon || content.type === 'cta' || (category === 'campaign' && content.type === 'features') || (category === 'outreach' && content.type === 'quote') || slot.key === 'question'
      const footnote = ['stats', 'gallery', 'progress_tracker'].includes(content.type) && !ribbon || slot.key === 'insights'
      return <TemplateSection key={`${slot.key}-${index}`} title={slot.title} hint={slot.hint} accent={['#3FABDE', '#F59E0B', '#D6336C', '#95C11F'][index % 4]}>
        {!section.enabled && <p className="text-xs text-muted-foreground">This saved section is currently hidden. <button type="button" className="underline" onClick={() => update({ enabled: true })}>Show it on the page</button></p>}
        {!ribbon && <TemplateTextField label="Section heading" hint="Small label above this section" value={section.heading} max={180} onChange={heading => update({ heading })} />}
        {!simpleHeading && <div className="grid gap-4 sm:grid-cols-2">
          <TemplateTextField label="Section title" value={section.intro} max={800} rows={2} onChange={intro => update({ intro })} />
          <TemplateTextField label="Section description" value={section.description} max={800} rows={2} onChange={description => update({ description })} />
        </div>}
        {(content.type === 'progress_tracker' || category === 'outreach' && content.type === 'quote') && <TemplateTextField label="Section description" value={section.description} max={800} rows={2} onChange={description => update({ description })} />}
        <SectionFormFactory section={{ ...section, presentation: slot.presentation || section.presentation }} templateMode category={category} onChange={content => update({ content })} />
        {category === 'campaign' && ['story', 'quote'].includes(content.type) && <><TemplateTextField label="Read more button text" value={section.detailLabel} max={120} onChange={detailLabel => update({ detailLabel })} /><TemplateTextField label="Full story" value={section.detailText} max={4000} rows={4} onChange={detailText => update({ detailText })} /></>}
        {footnote && <TemplateTextField label="Footnote" value={section.footnote || (content.type === 'progress_tracker' ? section.intro : '')} max={300} onChange={footnote => update({ footnote })} />}
      </TemplateSection>
    })}
  </div></ProgramIdProvider>
}

