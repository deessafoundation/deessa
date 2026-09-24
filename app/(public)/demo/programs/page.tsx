import type { Metadata } from 'next'
import { ProgramDemoIndex } from '@/components/programs/demo/ProgramDemos'

export const metadata: Metadata = {
  title: 'Program Design Concepts - DEESSA Foundation',
  description: 'Compare four category designs with sample content.',
  robots: { index: false, follow: false },
}

export default function ProgramConceptsPage() { return <ProgramDemoIndex /> }
