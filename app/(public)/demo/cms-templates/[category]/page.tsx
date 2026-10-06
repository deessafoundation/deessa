import { notFound } from 'next/navigation'
import { CmsProgramRenderer } from '@/components/programs/cms-program-renderer'
import { editorialDemoDocuments } from '@/data/programs/editorial-demo-documents'

export const metadata = { title: 'CMS template comparison', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function TemplateComparison({ params }: { params: Promise<{ category: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound()
  const { category } = await params
  if (category !== 'campaign' && category !== 'outreach' && category !== 'research') notFound()
  return <CmsProgramRenderer document={editorialDemoDocuments[category]} />
}
