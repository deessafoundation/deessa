"use client";

import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useVideoModal } from '@/contexts/VideoModalContext';
import type { HighlightWithEpisode } from '@/lib/data/podcasts';
import styles from './podcasts-page.module.css';

export default function AllHighlightsSection({ highlights }: { highlights: HighlightWithEpisode[] }) {
  const track = useRef<HTMLDivElement>(null);
  const { openVideoModal } = useVideoModal();
  const scroll = (direction: number) => {
    if (!track.current) return;
    track.current.scrollBy({ left: direction * track.current.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  if (!highlights.length) return null;
  return <section aria-labelledby="podcast-highlights-title">
    <div className={styles.sectionHeader}>
      <h2 id="podcast-highlights-title" className={`${styles.sectionTitle} ${styles.underlined}`}>Podcast Highlights</h2>
      <Link href="/podcasts/highlights" className={styles.textLink}>Watch All Highlights<ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
    <div className={styles.highlightTrack} ref={track} id="podcast-highlights-track" tabIndex={0} aria-label="Podcast highlights">
      {highlights.map((highlight, index) => {
        const videoId = highlight.highlightUrl.match(/(?:shorts\/|youtu\.be\/|[?&]v=)([\w-]+)/)?.[1];
        return <article key={`${highlight.episodeId}-${index}`} className={styles.highlightCard}>
          {videoId ? <button onClick={() => openVideoModal(videoId, highlight.episodeTitle)} className={styles.highlightImage} aria-label={`Play highlight ${index + 1}: ${highlight.episodeTitle}`}><Image src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" fill sizes="90px" unoptimized className="object-cover" /><span className={styles.thumbnailPlay}><Play size={16} fill="currentColor" aria-hidden="true" /></span></button> : <a href={highlight.highlightUrl} target="_blank" rel="noopener noreferrer" className={styles.highlightImage} aria-label="Watch highlight on YouTube"><ExternalLink aria-hidden="true" /></a>}
          <div className={styles.highlightContent}>
            <span className={styles.latestLabel}>{highlight.episodeNumber ? `Ep ${String(highlight.episodeNumber).padStart(2, '0')}` : 'Episode'}</span>
            <Link href={`/podcasts/${highlight.episodeSlug}`} className={styles.highlightTitle}>{highlight.episodeTitle}</Link>
            <div className={styles.highlightLinks}><span>Short</span><a href={highlight.highlightUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} aria-hidden="true" />YouTube<span className="sr-only"> (opens in a new tab)</span></a></div>
          </div>
        </article>;
      })}
    </div>
    <div className={styles.carouselControls}>
      <button className={styles.carouselArrow} onClick={() => scroll(-1)} aria-label="Previous highlights" aria-controls="podcast-highlights-track"><ChevronLeft size={20} /></button>
      <span>{highlights.length} highlights</span>
      <button className={styles.carouselArrow} onClick={() => scroll(1)} aria-label="Next highlights" aria-controls="podcast-highlights-track"><ChevronRight size={20} /></button>
    </div>
  </section>;
}
