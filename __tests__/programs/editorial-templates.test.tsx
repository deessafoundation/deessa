import { describe, expect, it, jest } from '@jest/globals'
import { renderToStaticMarkup } from 'react-dom/server'
import { programDocumentSchema } from '@/lib/programs/content'
import { readEditorHero } from '@/lib/programs/editor-hero'
import { editorialDemoDocuments } from '@/data/programs/editorial-demo-documents'
import { CampaignTemplate } from '@/components/programs/templates/CampaignTemplate'
import { OutreachTemplate } from '@/components/programs/templates/OutreachTemplate'
import { ResearchTemplate } from '@/components/programs/templates/ResearchTemplate'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { serviceDemoDocument } from '@/data/programs/service-demo-document'

// The SSR test double deliberately avoids Next.js image optimization.
// eslint-disable-next-line @next/next/no-img-element
jest.mock('next/image', () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }))

describe('editorial CMS documents', () => {
  it('ships complete P07 SQL documents matching the current four category fixtures', () => {
    const sql = readFileSync(join(process.cwd(), 'scripts/db/programs-migrations/P07-programs-test-fixtures.sql'), 'utf8')
    const payload = sql.match(/\$fixtures\$\s*([\s\S]*?)\s*\$fixtures\$::jsonb/)
    expect(payload).not.toBeNull()
    const fixtures = JSON.parse(payload![1]) as Array<{ slug: string; document: unknown }>
    expect(fixtures.map(f => f.slug)).toEqual(['test-aac-support', 'test-community-outreach', 'test-deessa-companion', 'test-1000-families'])
    const sources = { service: serviceDemoDocument, ...editorialDemoDocuments }
    for (const fixture of fixtures) {
      const doc = programDocumentSchema.parse(fixture.document)
      const source = sources[doc.category]
      expect(doc.sections).toHaveLength(8)
      expect(doc.hero).toEqual(source.hero)
      expect(doc.sections).toEqual(JSON.parse(JSON.stringify(source.sections)))
    }
  })
  it.each(['campaign', 'outreach', 'research'] as const)('preserves all %s demo fields through validation and JSON storage', category => {
    const original = editorialDemoDocuments[category]
    const parsed = programDocumentSchema.parse(JSON.parse(JSON.stringify(original)))
    expect(parsed).toEqual(JSON.parse(JSON.stringify(original)))
  })
  it('keeps canonical hero metadata and reads legacy actions and images', () => {
    const hero = editorialDemoDocuments.research.hero
    expect(readEditorHero(hero, 'fallback', 'fallback')).toEqual(hero)
    expect(readEditorHero({ title: 'Old', image: '/old.jpg', cta: { label: 'Join', url: '/join' }, secondaryCta: { label: 'Learn', url: '#approach' } }, 'Title', 'Description')).toMatchObject({ image: { url: '/old.jpg', alt: 'Old' }, actions: [{ variant: 'primary' }, { variant: 'secondary' }] })
    expect(readEditorHero({ image: '' }, 'Title', 'Description').image).toBeUndefined()
  })
  it.each(['javascript:alert(1)', '//evil.example', '/\\evil.example'])('rejects unsafe action %s', url => {
    const doc = structuredClone(editorialDemoDocuments.campaign)
    doc.hero.actions[0].url = url
    expect(programDocumentSchema.safeParse(doc).success).toBe(false)
  })
  it('honors section order, repetition and visibility', () => {
    const doc = structuredClone(editorialDemoDocuments.campaign)
    const stats = doc.sections.find(s => s.content.type === 'stats')!
    doc.sections = [{ ...stats, id: 'second-stats', intro: 'Second block' }, { ...stats, id: 'hidden', enabled: false }, { ...stats, id: 'first-stats', intro: 'First block' }]
    const html = renderToStaticMarkup(<CampaignTemplate document={doc} />)
    expect(html).not.toContain('id="hidden"')
    expect(html.indexOf('id="second-stats"')).toBeLessThan(html.indexOf('id="first-stats"'))
  })
  it('clamps completed campaign progress without negative remaining families', () => {
    const doc = structuredClone(editorialDemoDocuments.campaign)
    const progress = doc.sections.find(s => s.content.type === 'progress_tracker')!
    if (progress.content.type === 'progress_tracker') progress.content.current = 1200
    const html = renderToStaticMarkup(<CampaignTemplate document={doc} />)
    expect(html).toContain('100% of the way there')
    expect(html).toContain('0 families to go')
  })
  it('renders the Outreach field journal and explicit accent without nesting emphasis', () => {
    const html = renderToStaticMarkup(<OutreachTemplate document={editorialDemoDocuments.outreach} />)
    expect(html).toContain('happen <em>together.</em>')
    expect(html).toContain('STOP 01')
    expect(html).not.toContain('<em><em>')
  })
  it('renders the Research concept card, board and resources', () => {
    const html = renderToStaticMarkup(<ResearchTemplate document={editorialDemoDocuments.research} />)
    expect(html).toContain('COMMUNICATION BOARD')
    expect(html).toContain('INSIGHT 01')
    expect(html).toContain('<summary>')
  })
})

describe('program URL validation', () => {
  it.each(['javascript:alert(1)', 'data:image/svg+xml,<svg></svg>', 'file:///etc/passwd'])('rejects an unsafe image URL %s', url => {
    const doc = structuredClone(editorialDemoDocuments.campaign)
    doc.hero.image = { url, alt: 'Image' }
    expect(programDocumentSchema.safeParse(doc).success).toBe(false)
  })
  it('rejects backslash resource URLs that browsers interpret as another host', () => {
    const doc = structuredClone(editorialDemoDocuments.research)
    doc.sections = [{ id: 'resources', enabled: true, content: { type: 'resources', resources: [{ label: 'Resource', description: '', url: '/\\evil.example' }] } }]
    expect(programDocumentSchema.safeParse(doc).success).toBe(false)
  })
})