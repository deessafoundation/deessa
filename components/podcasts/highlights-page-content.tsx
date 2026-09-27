'use client';

import { useState, useMemo } from 'react';
import AllHighlightsCard from './all-highlights-card';
import type { HighlightWithEpisode } from '@/lib/data/podcasts';
import { Search, ArrowUpDown, Plus, X } from 'lucide-react';
import shared from './podcasts-page.module.css';
import styles from './highlights-page.module.css';

interface HighlightsPageContentProps {
  highlights: HighlightWithEpisode[];
}

type SortOption = 'latest' | 'oldest' | 'episode-asc' | 'episode-desc';

const ITEMS_PER_PAGE = 10;

export default function HighlightsPageContent({ highlights }: HighlightsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  // Get unique episodes for filter dropdown
  const episodes = useMemo(() => {
    const episodeMap = new Map<string, { id: string; number: number | null; title: string }>();
    highlights.forEach((h) => {
      const key = h.episodeId;
      if (!episodeMap.has(key)) {
        episodeMap.set(key, {
          id: h.episodeId,
          number: h.episodeNumber,
          title: h.episodeTitle,
        });
      }
    });
    return Array.from(episodeMap.values()).sort((a, b) => 
      (b.number || 0) - (a.number || 0)
    );
  }, [highlights]);

  // Filter and sort highlights
  const filteredHighlights = useMemo(() => {
    let filtered = [...highlights];

    // Filter by episode
    if (selectedEpisode !== 'all') {
      filtered = filtered.filter((h) => h.episodeId === selectedEpisode);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((h) =>
        h.episodeTitle.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'episode-asc':
          return (a.episodeNumber || 0) - (b.episodeNumber || 0);
        case 'episode-desc':
          return (b.episodeNumber || 0) - (a.episodeNumber || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [highlights, selectedEpisode, searchQuery, sortBy]);

  // Get visible highlights based on displayCount
  const visibleHighlights = useMemo(() => {
    return filteredHighlights.slice(0, displayCount);
  }, [filteredHighlights, displayCount]);

  const hasMore = displayCount < filteredHighlights.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleFilterChange = () => {
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const resetFilters = () => { setSelectedEpisode('all'); setSearchQuery(''); handleFilterChange(); };

  return (
    <section aria-label="Browse podcast highlights">
      <div className={styles.toolbar}>
        <div className={styles.controls}>
          <div className={styles.searchField}>
            <label htmlFor="highlight-search">Search Episodes</label>
            <div className={styles.searchInput}><Search size={18} aria-hidden="true" /><input aria-label="Search episodes" id="highlight-search" type="search" placeholder="Search by episode title..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); handleFilterChange(); }} /></div>
          </div>
          <div className={styles.field}>
            <label htmlFor="highlight-episode">Filter by Episode</label>
            <select id="highlight-episode" value={selectedEpisode} onChange={e => { setSelectedEpisode(e.target.value); handleFilterChange(); }}>
              <option value="all">All Episodes ({highlights.length} highlights)</option>
              {episodes.map(ep => <option key={ep.id} value={ep.id}>{ep.number ? `Ep ${String(ep.number).padStart(2, '0')}` : 'Episode'} · {ep.title}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="highlight-sort"><ArrowUpDown size={14} aria-hidden="true" />Sort By</label>
            <select id="highlight-sort" value={sortBy} onChange={e => { setSortBy(e.target.value as SortOption); handleFilterChange(); }}>
              <option value="latest">Latest First</option><option value="oldest">Oldest First</option><option value="episode-desc">Episode (High → Low)</option><option value="episode-asc">Episode (Low → High)</option>
            </select>
          </div>
        </div>
        <div className={styles.resultsBar}>
          <p role="status" aria-live="polite">Showing <strong>{visibleHighlights.length}</strong> of {filteredHighlights.length} highlights{filteredHighlights.length < highlights.length && ` (filtered from ${highlights.length})`}</p>
          {(selectedEpisode !== 'all' || searchQuery) && <button onClick={resetFilters} className={shared.textLink}><X size={16} aria-hidden="true" />Clear Filters</button>}
        </div>
      </div>
      {filteredHighlights.length > 0 ? <>
        <div className={styles.grid}>
          {visibleHighlights.map((highlight, index) => <AllHighlightsCard key={`${highlight.episodeId}-${highlight.highlightUrl}`} highlightUrl={highlight.highlightUrl} episodeNumber={highlight.episodeNumber} episodeTitle={highlight.episodeTitle} episodeSlug={highlight.episodeSlug} index={index + 1} />)}
        </div>
        {hasMore && <div className={styles.pagination}><p>Showing {visibleHighlights.length} of {filteredHighlights.length} highlights</p><button onClick={handleLoadMore} className={shared.primary}><Plus size={18} aria-hidden="true" />Load {Math.min(ITEMS_PER_PAGE, filteredHighlights.length - visibleHighlights.length)} More Highlights</button><p>{filteredHighlights.length - visibleHighlights.length} remaining</p></div>}
        {!hasMore && filteredHighlights.length > ITEMS_PER_PAGE && <p className={styles.pagination}>All highlights loaded! ({filteredHighlights.length} total)</p>}
      </> : <div className={styles.empty}><Search size={32} aria-hidden="true" /><h2 className={shared.sectionTitle}>No Highlights Found</h2><p>Try adjusting your filters or search terms to find what you&apos;re looking for</p><button onClick={resetFilters} className={shared.primary}>Reset All Filters</button></div>}
    </section>
  );
}
