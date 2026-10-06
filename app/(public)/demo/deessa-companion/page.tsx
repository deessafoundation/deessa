import type { Metadata } from 'next'
import { ResearchDemo } from '@/components/programs/demo/program-demos'

export const metadata: Metadata = {
  title: 'Research Design Preview - deessa Foundation',
  description: 'An interactive sample research page exploring the Programs CMS design system.',
  robots: { index: false, follow: false },
}

export default function DeessaCompanionPage() { return <ResearchDemo /> }
