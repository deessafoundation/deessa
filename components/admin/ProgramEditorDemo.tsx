"use client"
import { useCallback, useState } from 'react'
import { EditorialProgramEditor } from './EditorialProgramEditor'
import { ServiceEditForm } from './ServiceEditForm'
import { ProgramIdProvider } from './program-sections/program-id-context'
import { programDocumentSchema, type ProgramDocument, type ProgramCategory, type ProgramSection } from '@/lib/programs/content'
import { editorialDemoDocuments } from '@/data/programs/editorial-demo-documents'
import { serviceDemoDocument } from '@/data/programs/service-demo-document'

const fixtures = { service: serviceDemoDocument, ...editorialDemoDocuments }
export function ProgramEditorDemo() {
  const [category, setCategory] = useState<ProgramCategory>('campaign')
  const [document, setDocument] = useState<ProgramDocument>(fixtures.campaign)
  const [saved, setSaved] = useState<ProgramDocument>(fixtures.campaign)
  const [key, setKey] = useState(0)
  const [status, setStatus] = useState('Ready')
  const onSectionsChange = useCallback((sections: ProgramSection[]) => setDocument(doc => ({ ...doc, sections })), [])
  return <div className="mx-auto max-w-5xl space-y-5 px-5 py-10">
    <h1 className="text-2xl font-semibold">Program editor check</h1>
    <p className="text-sm text-muted-foreground">Development-only editor using sample data. Save and restore here use memory, not the database. File uploads require a real program and an authenticated admin; URL selection can be tested here.</p>
    <nav aria-label="Editor category" className="flex flex-wrap gap-3">{(Object.keys(fixtures) as ProgramCategory[]).map(value => <button type="button" key={value} className="rounded border px-4 py-2 capitalize" aria-pressed={value === category} onClick={() => { setCategory(value); setDocument(structuredClone(fixtures[value])); setSaved(structuredClone(fixtures[value])); setKey(k => k + 1); setStatus('Ready') }}>{value}</button>)}</nav>
    <div className="flex flex-wrap gap-3">
      <button type="button" className="rounded border px-4 py-2" onClick={() => { const parsed = programDocumentSchema.safeParse(document); if (parsed.success) { setSaved(JSON.parse(JSON.stringify(parsed.data))); setStatus('Saved and validated') } else setStatus(parsed.error.issues.map(i => i.path.join('.') + ': ' + i.message).join('; ')) }}>Save sample</button>
      <button type="button" className="rounded border px-4 py-2" onClick={() => { setDocument(structuredClone(saved)); setKey(k => k + 1); setStatus('Restored saved sample') }}>Restore saved sample</button>
      <span role="status">{status}</span>
    </div>
    <ProgramIdProvider programId="editor-preview"><div key={key}>{category === 'service' ? <ServiceEditForm data={{ ...document, eyebrow: document.eyebrow || '' }} onChange={data => setDocument(doc => ({ ...doc, ...data }))} /> : <EditorialProgramEditor category={category} programId="editor-preview" data={{ ...document, eyebrow: document.eyebrow || '' }} onChange={data => setDocument(doc => ({ ...doc, ...data }))} onSectionsChange={onSectionsChange} />}</div></ProgramIdProvider>
    <details><summary>Current document</summary><pre className="overflow-auto text-xs" data-testid="editor-document">{JSON.stringify(document, null, 2)}</pre></details>
  </div>
}

