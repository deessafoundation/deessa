import { notFound } from 'next/navigation'
import { ProgramEditorDemo } from '@/components/admin/programs/demo/program-editor-demo'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Program editor check', robots: { index: false, follow: false } }
export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <ProgramEditorDemo />
}

