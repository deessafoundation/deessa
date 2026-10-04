import type { Metadata } from 'next'
import { ProgramDemoIndex } from '@/components/programs/demo/program-demos'

export const metadata: Metadata = {
  title: 'Program Design Concepts - deessa Foundation',
  description: 'Compare four category designs with sample content.',
  robots: { index: false, follow: false },
}

export default function ProgramConceptsPage() { return <ProgramDemoIndex /> }
