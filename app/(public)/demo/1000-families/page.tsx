import type { Metadata } from 'next'
import { CampaignDemo } from '@/components/programs/demo/ProgramDemos'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Campaign Design Preview - DEESSA Foundation',
  description: 'A sample campaign page exploring the Programs CMS design system.',
  openGraph: {
    title: 'Campaign Design Preview - DEESSA Foundation',
    description: 'Join us in supporting 1000 families across Nepal. 82% complete!',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: '1000 Families Campaign',
      },
    ],
  },
}

export default function ThousandFamiliesCampaign() {
  return <CampaignDemo />
}
