import { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllPodcastHighlights } from '@/lib/data/podcasts';
import HighlightsPageContent from '@/components/podcasts/highlights-page-content';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import shared from '@/components/podcasts/podcasts-page.module.css';
import styles from '@/components/podcasts/highlights-page.module.css';

export const metadata: Metadata = {
  title: 'Podcast Highlights - All Shorts | deessa Foundation',
  description: 'Watch all YouTube Shorts highlights from our podcast episodes. Key moments, insights, and stories.',
  openGraph: {
    title: 'Podcast Highlights - All Shorts | deessa Foundation',
    description: 'Watch all YouTube Shorts highlights from our podcast episodes. Key moments, insights, and stories.',
    type: 'website',
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function HighlightsPage() {
  // Fetch all highlights without limit
  const allHighlights = await getAllPodcastHighlights();

  return (
    <div className={shared.page}>
      <div className={`${shared.main} ${styles.layout}`}>
        <header className={styles.hero}>
          <Link href="/podcasts" className={shared.textLink}><ArrowLeft size={16} aria-hidden="true" />Back to Podcasts</Link>
          <div className={styles.heroHeading}>
            <div><p className={shared.eyebrow}><Sparkles size={16} aria-hidden="true" />Key Moments</p><h1 className={shared.heroTitle}>Podcast Highlights</h1></div>
            <span className={styles.collectionCount}>{allHighlights.length}<span>highlights</span></span>
          </div>
          <p className={styles.introduction}>Discover {allHighlights.length} impactful insights and inspiring stories from our podcast episodes. Each short captures the essence of meaningful conversations about autism, inclusion, and community impact.</p>
        </header>
        {allHighlights.length > 0 ? (
          <Suspense fallback={<div className={styles.empty}>Loading highlights...</div>}>
            <HighlightsPageContent highlights={allHighlights} />
          </Suspense>
        ) : (
          <div className={styles.empty}><Sparkles size={32} aria-hidden="true" /><h2 className={shared.sectionTitle}>No Highlights Available Yet</h2><p>Check back soon for exciting highlights from our podcast episodes!</p></div>
        )}
      </div>
    </div>
  );
}
