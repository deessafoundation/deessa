import { deleteProgramAsset, registerProgramAsset, uploadProgramAsset } from '@/lib/actions/program-assets'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { editorialDemoDocuments } from '@/data/programs/editorial-demo-documents'
import { serviceDemoDocument } from '@/data/programs/service-demo-document'
import { getDefaultSectionsForCategory } from '@/components/admin/programs/sections/types'
import { programDraftSchema, programDocumentSchema } from '@/lib/programs/content'
import { createProgram, updateProgramDraft, publishProgram, unpublishProgram, archiveProgram, restoreProgram, deleteProgram, restoreProgramVersion } from '@/lib/actions/program-crud'

let mockAdmin: any
let mockTables: Record<string, any[]>
let mockFailure: { table: string; op: string; empty?: boolean } | null
const mockService = jest.fn(() => ({ storage: { from: () => ({ remove: async () => ({ error: null }) }) } }))
function mockFrom(table: string) {
  let op = 'select', payload: any, single = false, reverse = false, maximum = Infinity
  const filters: Array<(row: any) => boolean> = []
  const q: any = {
    select: () => q, eq: (key: string, value: unknown) => { filters.push(row => row[key] === value); return q },
    insert: (value: any) => { op = 'insert'; payload = value; return q },
    update: (value: any) => { op = 'update'; payload = value; return q },
    upsert: (value: any) => { op = 'upsert'; payload = value; return q },
    delete: () => { op = 'delete'; return q },
    single: () => { single = true; return q }, maybeSingle: () => { single = true; return q },
    order: (_key: string, opts: any) => { reverse = !opts.ascending; return q }, limit: (value: number) => { maximum = value; return q },
    then: (resolve: (value: any) => void) => {
      if (mockFailure?.table === table && mockFailure.op === op) return Promise.resolve(resolve({ data: null, error: mockFailure.empty ? null : { message: 'Database rejected write' } }))
      const rows = mockTables[table] ||= []
      let found = rows.filter(row => filters.every(matches => matches(row)))
      if (op === 'insert' || op === 'upsert') {
        const row = { id: `id-${rows.length + 1}`, ...payload }
        if (op === 'upsert') mockTables[table] = rows.filter(r => r.id !== row.id)
        mockTables[table].push(row); found = [row]
      }
      if (op === 'update') found.forEach(row => Object.assign(row, payload))
      if (op === 'delete') mockTables[table] = rows.filter(row => !found.includes(row))
      if (reverse) found.reverse()
      found = found.slice(0, maximum)
      return Promise.resolve(resolve({ data: single ? found[0] || null : found, error: null }))
    },
  }
  return q
}
jest.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ from: mockFrom }) }))
jest.mock('@/lib/supabase/service', () => ({ createServiceRoleClient: () => mockService() }))
jest.mock('@/lib/actions/admin-auth', () => ({ getCurrentAdmin: async () => mockAdmin }))
jest.mock('@/lib/programs/slug', () => ({ uniqueSlug: async (_client: unknown, title: string) => title.toLowerCase().replaceAll(' ', '-') }))
jest.mock('@/lib/rate-limit', () => ({ checkRateLimit: async () => ({ allowed: true }) }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
const fixtures = { service: serviceDemoDocument, ...editorialDemoDocuments }
beforeEach(() => { mockAdmin = { id: 'admin', user_id: 'user', role: 'EDITOR', is_active: true }; mockTables = {}; mockFailure = null; mockService.mockClear() })

describe('program lifecycle with controlled database responses', () => {
  it.each(['service', 'campaign', 'outreach', 'research'] as const)('%s creates, saves, publishes, unpublishes, archives, restores and deletes', async category => {
    const doc = structuredClone(fixtures[category])
    const created = await createProgram({ title: doc.title, category, document: doc })
    expect(created.ok).toBe(true)
    if (!created.ok) return
    const id = created.data.id
    doc.title = 'Parents & caregivers'
    expect(await updateProgramDraft(id, doc, 1)).toEqual({ ok: true, data: { revision: 2 } })
    expect(mockTables.programs[0].title).toBe('Parents & caregivers')
    expect((await publishProgram(id, 'Audit', 2)).ok).toBe(true)
    expect(mockTables.program_publications[0].document.hero).toEqual(doc.hero)
    expect(mockTables.program_publications[0].document.sections).toEqual(doc.sections)
    expect((await deleteProgram(id)).ok).toBe(false)
    expect((await unpublishProgram(id)).ok).toBe(true)
    expect(mockTables.program_publications).toHaveLength(0)
    expect((await archiveProgram(id)).ok).toBe(true)
    expect((await publishProgram(id)).ok).toBe(false)
    expect((await restoreProgram(id)).ok).toBe(true)
    expect((await deleteProgram(id)).ok).toBe(true)
    expect(mockTables.programs).toHaveLength(0)
  })
  it.each(['service', 'campaign', 'outreach', 'research'] as const)('allows an incomplete new %s draft but blocks publishing it', category => {
    const doc = { ...fixtures[category], sections: getDefaultSectionsForCategory(category) }
    expect(programDraftSchema.safeParse(doc).success).toBe(true)
    expect(programDocumentSchema.safeParse(doc).success).toBe(false)
  })
  it.each([null, { role: 'FINANCE', is_active: true }, { role: 'ADMIN', is_active: false }, { role: 'UNKNOWN', is_active: true }])('rejects unauthorized actions before accessing data or elevated storage', async admin => {
    mockAdmin = admin
    for (const action of [() => createProgram({ title: 'Test', category: 'service', document: fixtures.service }), () => updateProgramDraft('id', fixtures.service, 1), () => publishProgram('id'), () => unpublishProgram('id'), () => archiveProgram('id'), () => restoreProgram('id'), () => deleteProgram('id')]) expect((await action()).ok).toBe(false)
    expect(mockTables).toEqual({})
    expect(mockService).not.toHaveBeenCalled()
  })
  it('reports a revision race instead of silently claiming a successful save', async () => {
    await createProgram({ title: 'Test', category: 'service', document: fixtures.service })
    mockFailure = { table: 'program_drafts', op: 'update', empty: true }
    expect((await updateProgramDraft('id-1', fixtures.service, 1)).ok).toBe(false)
  })
  it('does not claim unpublish or archive success when removal fails', async () => {
    await createProgram({ title: 'Test', category: 'service', document: fixtures.service })
    await publishProgram('id-1')
    mockFailure = { table: 'program_publications', op: 'delete' }
    expect((await unpublishProgram('id-1')).ok).toBe(false)
    expect((await archiveProgram('id-1')).ok).toBe(false)
    expect(mockTables.programs[0].status).toBe('published')
  })
  it('restores published metadata and SEO alongside content', async () => {
    const doc = structuredClone(fixtures.research)
    doc.seo = { title: 'Original SEO', description: 'Original description' }
    await createProgram({ title: doc.title, category: doc.category, document: doc })
    await publishProgram('id-1')
    await updateProgramDraft('id-1', { ...doc, shortDescription: 'Changed', seo: { title: 'Changed SEO' } }, 1)
    expect((await restoreProgramVersion('id-1', 1)).ok).toBe(true)
    expect(mockTables.programs[0].short_description).toBe(doc.shortDescription)
    expect(mockTables.program_drafts[0].seo_title).toBe('Original SEO')
  })
})

describe('media security', () => {
  it.each([{ role: 'FINANCE', is_active: true }, { role: 'ADMIN', is_active: false }])('rejects unauthorized media mutations before elevated storage access', async admin => {
    mockAdmin = admin
    expect((await uploadProgramAsset('id', {} as File, { altText: 'Test' })).ok).toBe(false)
    expect((await registerProgramAsset('id', 'path', '/image.jpg', 'image.jpg', 'image/jpeg', 10, { altText: 'Test' })).ok).toBe(false)
    expect((await deleteProgramAsset('asset')).ok).toBe(false)
    expect(mockService).not.toHaveBeenCalled()
  })
  it('protects an image referenced by URL in a published snapshot', async () => {
    mockTables.program_assets = [{ id: 'asset', program_id: 'id', storage_path: 'id/photo.jpg', url: 'https://example.com/photo.jpg' }]
    mockTables.program_publications = [{ document: { hero: { image: { url: 'https://example.com/photo.jpg' } } } }]
    const result = await deleteProgramAsset('asset')
    expect(result.ok).toBe(false)
    expect(mockTables.program_assets).toHaveLength(1)
  })
})