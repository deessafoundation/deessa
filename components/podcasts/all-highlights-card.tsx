'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, Play, X } from 'lucide-react';
import Link from 'next/link';
import shared from './podcasts-page.module.css';
import styles from './highlights-page.module.css';
import { useVideoModal } from '@/contexts/VideoModalContext';

interface AllHighlightsCardProps {
  highlightUrl: string;
  episodeNumber: number | null;
  episodeTitle: string;
  episodeSlug: string;
  index: number;
}

interface VideoMetadata {
  title?: string;
  thumbnailUrl?: string;
}

export default function AllHighlightsCard({ 
  highlightUrl, 
  episodeNumber, 
  episodeTitle,
  episodeSlug, 
  index 
}: AllHighlightsCardProps) {
  const { activeInlineId, setActiveInlineId } = useVideoModal();
  const [isPlaying, setIsPlaying] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata>({});
  const [imageError, setImageError] = useState(false);

  // Extract YouTube Shorts ID from various URL formats
  const getYouTubeShortId = (url: string) => {
    const patterns = [
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
      /youtu\.be\/([a-zA-Z0-9_-]+)/,
      /[?&]v=([a-zA-Z0-9_-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const shortId = getYouTubeShortId(highlightUrl);

  const thumbnailUrl = shortId ? `https://i.ytimg.com/vi/${shortId}/hqdefault.jpg` : '';
  const fallbackThumbnail = shortId ? `https://i.ytimg.com/vi/${shortId}/mqdefault.jpg` : '';
  const embedUrl = shortId ? `https://www.youtube.com/embed/${shortId}` : '';

  // Stop this card if another video (inline or modal) becomes active
  useEffect(() => {
    if (shortId && activeInlineId !== shortId) {
      setIsPlaying(false);
    }
  }, [activeInlineId, shortId]);

  // Fetch video metadata on mount via internal proxy (avoids browser CORS errors)
  useEffect(() => {
    if (!shortId) return;
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/youtube/oembed?id=${encodeURIComponent(shortId)}`);
        if (response.ok) {
          const data = await response.json();
          setMetadata({ title: data.title, thumbnailUrl: data.thumbnail_url });
        }
      } catch {
        // metadata is optional — silently skip
      }
    };
    fetchMetadata();
  }, [shortId]);

  if (!shortId) return null;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {!isPlaying ? <>
          <img src={imageError ? fallbackThumbnail : thumbnailUrl} alt="" aria-hidden="true" className={styles.mediaBackdrop} />
          <img src={imageError ? fallbackThumbnail : thumbnailUrl} alt={metadata.title || episodeTitle} onError={() => setImageError(true)} className={styles.thumbnail} />
          <Link href={`/podcasts/${episodeSlug}`} className={styles.episodeBadge}>{episodeNumber ? `Ep ${String(episodeNumber).padStart(2, '0')}` : 'Episode'}</Link>
          <button onClick={() => { setActiveInlineId(shortId); setIsPlaying(true); }} className={styles.playButton} aria-label={`Play highlight ${index}: ${metadata.title || episodeTitle}`}><span><Play size={24} fill="currentColor" aria-hidden="true" /></span><span className={styles.playLabel}>Watch highlight</span></button>
        </> : <>
          <iframe src={`${embedUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} title={metadata.title || episodeTitle} className={styles.player} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          <button onClick={() => { setIsPlaying(false); setActiveInlineId(null); }} className={styles.stopButton} aria-label="Stop video"><X size={20} aria-hidden="true" /></button>
        </>}
      </div>
      <div className={styles.cardBody}>
        <span className={styles.shortLabel}>Short</span>
        <h2 className={styles.cardTitle}>{metadata.title || episodeTitle}</h2>
        {metadata.title && <p className={styles.episodeAssociation}>{episodeTitle}</p>}
        <div className={styles.cardActions}>
          <Link href={`/podcasts/${episodeSlug}`} className={shared.textLink}>Full episode<ArrowRight size={14} aria-hidden="true" /></Link>
          <a href={highlightUrl} target="_blank" rel="noopener noreferrer" className={shared.secondary}><ExternalLink size={14} aria-hidden="true" />YouTube<span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      </div>
    </article>
  );
}
