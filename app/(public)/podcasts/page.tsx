import styles from '@/components/podcasts/podcasts-page.module.css';
import { Metadata } from 'next';
import PodcastSeriesIntro from '@/components/podcasts/podcast-series-intro';
import PodcastArchiveSection from '@/components/podcasts/podcast-archive-section';
import AllHighlightsSection from '@/components/podcasts/all-highlights-section';
import { getPublishedPodcasts, getAllPodcastHighlights } from '@/lib/data/podcasts';
import { generateSEOMetadata } from '@/lib/seo/metadata-utils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Podcasts - Living With Autism',
  description: 'Explore our podcast series featuring stories, insights, and conversations about autism, inclusion, and community impact in Nepal. Real voices, real experiences.',
  path: '/podcasts',
  keywords: [
    'autism podcast',
    'Nepal autism',
    'disability podcast',
    'inclusion stories',
    'autism awareness',
    'living with autism',
    'special needs Nepal',
  ],
});

export const revalidate = 3600; // Revalidate every hour

export default async function PodcastsPage() {
  // Fetch all data in parallel
  const [allPodcasts, allHighlights] = await Promise.all([
    getPublishedPodcasts(),
    getAllPodcastHighlights(10), // Limit to 10 latest highlights for main page
  ]);

  const latestEpisode = allPodcasts[0];

  // Archive includes all podcasts
  const archiveEpisodes = allPodcasts;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <PodcastSeriesIntro latestEpisode={latestEpisode} />

        {/* Archive Section with Filters - Show only if we have archive episodes */}
        {archiveEpisodes.length > 0 && (
          <section id="episodes" className="scroll-mt-40">
            <PodcastArchiveSection episodes={archiveEpisodes} totalCount={allPodcasts.length} />
          </section>
        )}

        {allHighlights.length > 0 && <AllHighlightsSection highlights={allHighlights} />}

        {archiveEpisodes.length === 0 && (
          <section id="episodes" className="scroll-mt-40 rounded-2xl border border-brand-primary/15 bg-white px-6 py-10 text-center">
            <h2 className="font-heading text-3xl text-text-main">Explore the conversations</h2>
            <p className="mt-3 text-text-muted">The episode library is unavailable right now. You can still watch the series on YouTube.</p>
            <a href="https://www.youtube.com/@deessaFoundation/videos" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand-primary px-6 py-3 font-bold text-white hover:bg-brand-primary-dark">Watch on YouTube<span className="sr-only"> (opens in a new tab)</span></a>
          </section>
        )}

        {/* Message when only 1 podcast exists */}
        {allPodcasts.length === 1 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">
              More episodes coming soon! Stay tuned for more inspiring stories.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
