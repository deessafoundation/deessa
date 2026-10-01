import { ServiceEditForm } from '@/components/admin/ServiceEditForm'
import { serviceDemoDocument } from '@/data/programs/service-demo-document'
import { describe, expect, it, jest } from '@jest/globals'
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { TemplateSectionsEditor } from '@/components/admin/program-sections/TemplateSectionsEditor'
import { TemplateSection, TemplateTextField } from '@/components/admin/program-sections/TemplateSection'
import { SectionFormFactory } from '@/components/admin/program-sections/forms/SectionFormFactory'
import { EditorialProgramEditor } from '@/components/admin/EditorialProgramEditor'
import { AssetPicker } from '@/components/admin/program-sections/AssetPicker'
import { editorialDemoDocuments } from '@/data/programs/editorial-demo-documents'
import { programDocumentSchema, type ProgramSection } from '@/lib/programs/content'

jest.mock('@/components/admin/program-sections/forms/SectionFormFactory', () => ({ SectionFormFactory: () => null }))
jest.mock('@/components/admin/program-sections/AssetPicker', () => ({ AssetPicker: () => null }))

type Element = ReactElement<Record<string, any>>
function elements(node: ReactNode): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements)
  if (!isValidElement<Record<string, any>>(node)) return []
  return [node, ...elements(node.props.children)]
}

function editor(category: keyof typeof editorialDemoDocuments, sections: ProgramSection[], onChange: (sections: ProgramSection[]) => void) {
  return elements(TemplateSectionsEditor({ category, programId: 'test', sections, onChange }))
}

describe('fixed template editors', () => {
  it.each(['campaign', 'outreach', 'research'] as const)('shows the eight fixed %s panels even in an empty draft', category => {
    const nodes = editor(category, [], () => {})
    expect(nodes.filter(n => n.type === TemplateSection)).toHaveLength(8)
    expect(nodes.filter(n => n.type === SectionFormFactory).every(n => n.props.templateMode === true)).toBe(true)
    expect(nodes.some(n => n.props.children === 'Add section')).toBe(false)
  })

  it('keeps the panel mounted after the first field in an empty section is entered', () => {
    let sections: ProgramSection[] = []
    const before = editor('campaign', sections, next => { sections = next })
    const panel = before.find(n => n.type === TemplateSection && n.props.title === 'Campaign Purpose')!
    const field = elements(panel).find(n => n.type === TemplateTextField && n.props.label === 'Section title')!
    field.props.onChange('Our purpose')
    const after = editor('campaign', sections, () => {}).find(n => n.type === TemplateSection && n.props.title === 'Campaign Purpose')!
    expect(after.key).toBe(panel.key)
    expect(sections).toHaveLength(1)
    expect(sections[0].intro).toBe('Our purpose')
  })

  it.each(['Outreach Metrics', 'Field Notes Gallery'])('edits only %s while preserving the ribbon, essay and hidden content', title => {
    const source = structuredClone(editorialDemoDocuments.outreach.sections)
    source.push({ ...source[0], id: 'legacy-hidden', enabled: false })
    let result = source
    const panel = editor('outreach', source, next => { result = next }).find(n => n.type === TemplateSection && n.props.title === title)!
    const form = elements(panel).find(n => n.type === SectionFormFactory)!
    const changedId = form.props.section.id
    const field = elements(panel).find(n => n.type === TemplateTextField && n.props.label === 'Section title')!
    field.props.onChange('Updated title')
    expect(result.find(s => s.id === changedId)?.intro).toBe('Updated title')
    expect(result.filter(s => s.id !== changedId)).toEqual(source.filter(s => s.id !== changedId))
    expect(programDocumentSchema.safeParse({ ...editorialDemoDocuments.outreach, sections: result }).success).toBe(true)
  })

  it.each(['campaign', 'outreach', 'research'] as const)('preserves %s hero metadata and both actions on image replacement', category => {
    const document = structuredClone(editorialDemoDocuments[category])
    const data = { ...document, eyebrow: document.eyebrow || '' }
    data.hero.image = { url: '/old.jpg', assetId: '00000000-0000-4000-8000-000000000001', alt: 'Original alt', caption: 'Original caption', focalPoint: '75% center' }
    let result = data
    const nodes = elements(EditorialProgramEditor({ programId: 'test', category, data, onChange: next => { result = { ...data, ...next } }, onSectionsChange: () => {} }))
    nodes.find(n => n.type === AssetPicker)!.props.onPick({ assetId: undefined, url: '/replacement.jpg' })
    expect(result.hero.image).toEqual({ url: '/replacement.jpg', assetId: undefined, alt: 'Original alt', caption: 'Original caption', focalPoint: '75% center' })
    expect(result.hero.actions).toEqual(data.hero.actions)
    expect(result.hero.editorial).toEqual(data.hero.editorial)
    expect(programDocumentSchema.safeParse(result).success).toBe(true)
  })
})

describe('Service editor compatibility', () => {
  it('keeps the secondary action when primary button copy changes', () => {
    const data = { ...structuredClone(serviceDemoDocument), eyebrow: serviceDemoDocument.eyebrow || '' }
    let result = data
    const nodes = elements(ServiceEditForm({ data, onChange: next => { result = { ...data, ...next } } }))
    const field = nodes.find(n => n.props.label === 'Button Text')!
    elements(field).find(n => typeof n.props.onChange === 'function')!.props.onChange({ target: { value: 'Find help' } })
    expect(result.hero.actions[0].label).toBe('Find help')
    expect(result.hero.actions[1]).toEqual(data.hero.actions[1])
  })
  it('keeps the handwritten note when a journey step changes', () => {
    const data = { ...structuredClone(serviceDemoDocument), eyebrow: serviceDemoDocument.eyebrow || '' }
    let result = data
    const original = data.sections.find(s => s.content.type === 'how_it_works')!
    const nodes = elements(ServiceEditForm({ data, onChange: next => { result = { ...data, ...next } } }))
    const input = nodes.find(n => n.props.placeholder === "Let's have a conversation")!
    input.props.onChange({ target: { value: 'Start here' } })
    const updated = result.sections.find(s => s.id === original.id)!
    expect(updated.content).toMatchObject({ handwrittenNote: (original.content as { handwrittenNote?: string }).handwrittenNote, items: expect.arrayContaining([expect.objectContaining({ title: 'Start here' })]) })
    expect(programDocumentSchema.safeParse(result).success).toBe(true)
  })
})