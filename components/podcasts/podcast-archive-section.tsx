'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArchiveThumbnailImage } from './archive-thumbnail-image';
import styles from './archive-thumbnail.module.css';
import { Calendar, ArrowRight, Heart, Play, Share2, SlidersHorizontal } from 'lucide-react';
import styles from './podcasts-page.module.css';
import { Checkbox } from '@/components/ui/checkbox';
import { Podcast } from '@/lib/types/podcast';
import { formatDistanceToNow } from 'date-fns';

interface PodcastArchiveSectionProps {
  episodes: Podcast[];
  totalCount: number;
}

export default function PodcastArchiveSection({ episodes, totalCount }: PodcastArchiveSectionProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [shareStatus, setShareStatus] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);

  // Get unique topics from all episodes
  const allTopics = Array.from(
    new Set(episodes.flatMap((ep) => ep.topics))
  ).sort();

  // Filter episodes
  const filteredEpisodes = episodes.filter((episode) => {
    // Topics filter
    if (selectedTopics.length > 0) {
      if (!episode.topics.some((topic) => selectedTopics.includes(topic))) {
        return false;
      }
    }

    return true;
  });

  const displayedEpisodes = filteredEpisodes.slice(0, displayCount);
  const hasMore = displayCount < filteredEpisodes.length;

  const handleTopicToggle = (topic: string) => {
    setDisplayCount(12);
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const shareEpisode = async (episode: Podcast) => {
    const url = `${window.location.origin}/podcasts/${episode.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: episode.title, text: episode.description, url });
      else { await navigator.clipboard.writeText(url); setShareStatus('Episode link copied.'); }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) setShareStatus('Unable to share. Open the episode and copy its address.');
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={`${styles.sectionTitle} ${styles.underlined}`}>Episode Archive</h2>
        <Link href="/podcasts/episodes" className={styles.textLink}>Browse All Episodes<ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
      <div className={styles.archiveLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.filterPanel}>
            <button className={styles.filterToggle} aria-expanded={filtersOpen} aria-controls="podcast-topics" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18} aria-hidden="true" />Filter Library{selectedTopics.length > 0 && ` (${selectedTopics.length})`}</button>
            <h3 className={styles.desktopFilterTitle}>Filter Library</h3>
            <div id="podcast-topics" className={`${styles.filterOptions} ${filtersOpen ? styles.filterOptionsOpen : ''}`}>
              <p className={styles.filterLabel}>Topics</p>
              {allTopics.map(topic => <label key={topic} className={styles.topic}><Checkbox checked={selectedTopics.includes(topic)} onCheckedChange={() => handleTopicToggle(topic)} /><span>{topic}</span></label>)}
              {selectedTopics.length > 0 && <button className={styles.textLink} onClick={() => { setSelectedTopics([]); setDisplayCount(12); }}>Clear filters</button>}
            </div>
          </div>
          <div className={styles.supportCard}>
            <Heart size={24} aria-hidden="true" /><h3>Support Our Mission</h3>
            <p>Help us amplify voices and create positive change in our community.</p>
            <Link href="/donate" className={styles.primary}><Heart size={16} fill="currentColor" aria-hidden="true" />Donate Now</Link>
          </div>
        </aside>
        <div className={styles.archiveResults}>
          <p className={styles.resultCount} aria-live="polite">Showing {displayedEpisodes.length} of {selectedTopics.length ? filteredEpisodes.length : totalCount} episodes</p>
          <p className="sr-only" role="status">{shareStatus}</p>
          <div className={styles.episodeGrid}>
            {displayedEpisodes.map(episode => {
              const publishedDate = new Date(episode.publishedAt);
              const validDate = !Number.isNaN(publishedDate.getTime());
              return <article key={episode.id} className={styles.episodeCard}>
                <Link href={`/podcasts/${episode.slug}`} className={styles.episodeImage} aria-label={`Watch ${episode.title}`}>
                  <Image src={episode.thumbnailUrl || '/podcast_banner.png'} alt="" fill sizes="(max-width: 639px) 85vw, 150px" className="object-cover" />
                  <span className={styles.thumbnailPlay}><Play size={18} fill="currentColor" aria-hidden="true" /></span>
                </Link>
                <div className={styles.episodeContent}>
                  <div className={styles.episodeMeta}><strong>EP {episode.episodeNumber || (episodes.findIndex(item => item.id === episode.id) + 1)}</strong>{episode.duration && <span>{episode.duration}{episode.duration.includes(':') ? '' : ' min'}</span>}{episode.topics[0] && <span className={styles.topicBadge}>{episode.topics[0]}</span>}</div>
                  {validDate && <time className={styles.date} dateTime={publishedDate.toISOString()}><Calendar size={11} aria-hidden="true" />{formatDistanceToNow(publishedDate, { addSuffix: true })}</time>}
                  <h3 className={styles.episodeTitle}><Link href={`/podcasts/${episode.slug}`}>{episode.title}</Link></h3>
                  <p className={styles.episodeDescription}>{episode.description}</p>
                  <div className={styles.episodeActions}>
                    <Link href={`/podcasts/${episode.slug}`} className={styles.primary}><Play size={13} fill="currentColor" aria-hidden="true" />Watch Episode</Link>
                    <button onClick={() => shareEpisode(episode)} className={styles.secondary} aria-label={`Share ${episode.title}`}><Share2 size={14} aria-hidden="true" />Share</button>
                  </div>
                </div>
              </article>;
            })}
          </div>
          {hasMore && <div className={styles.loadMore}><button onClick={() => setDisplayCount(prev => prev + 12)} className={styles.secondary}>Load More Stories</button></div>}
          {filteredEpisodes.length === 0 && <p className={styles.empty}>No episodes found matching your filters.</p>}
        </div>
      </div>
    </div>
  );
}
