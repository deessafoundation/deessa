import type { Metadata } from 'next'
import { ServiceDemo } from '@/components/programs/demo/ProgramDemos'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'AAC Communication Support - deessa Foundation',
  description: 'Supporting children and families through accessible communication tools and inclusive practices. Every mind is a gift.',
  openGraph: {
    title: 'AAC Communication Support - deessa Foundation',
    description: 'Supporting children and families through accessible communication tools and inclusive practices.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'AAC Communication Support Program',
      },
    ],
  },
}

export default function AACSupport() {
  return <ServiceDemo />
}
