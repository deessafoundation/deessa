import type { Metadata } from 'next'
import { OutreachDemo } from '@/components/programs/demo/ProgramDemos'

export const metadata: Metadata = {
  title: 'Outreach Design Preview - DEESSA Foundation',
  description: 'A sample community field journal exploring the Programs CMS design system.',
  robots: { index: false, follow: false },
}

export default function CommunityOutreachPage() { return <OutreachDemo /> }
