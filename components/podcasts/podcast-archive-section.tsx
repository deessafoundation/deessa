"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArchiveThumbnailImage } from "./archive-thumbnail-image"
import thumbnailStyles from "./archive-thumbnail.module.css"
import { Calendar, ArrowRight, Heart, Play, Share2, SlidersHorizontal, Search, X } from "lucide-react"
import podcastStyles from "./podcasts-page.module.css"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Podcast } from "@/lib/types/podcast"
import { formatDistanceToNow } from "date-fns"

interface PodcastArchiveSectionProps {
  episodes: Podcast[]
  totalCount: number
}

const ITEMS_PER_PAGE = 12

export default function PodcastArchiveSection({ episodes, totalCount }: PodcastArchiveSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [shareStatus, setShareStatus] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)

  // Get unique topics from all episodes
  const allTopics = useMemo(() => {
    return Array.from(new Set(episodes.flatMap((ep) => ep.topics))).sort()
  }, [episodes])

  // Filter episodes by search and selected topics
  const filteredEpisodes = useMemo(() => {
    return episodes.filter((episode) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches =
          episode.title.toLowerCase().includes(q) ||
          episode.description.toLowerCase().includes(q) ||
          episode.guestName?.toLowerCase().includes(q)
        if (!matches) return false
      }

      // Topics filter
      if (selectedTopics.length > 0) {
        if (!episode.topics.some((topic) => selectedTopics.includes(topic))) {
          return false
        }
      }

      return true
    })
  }, [episodes, searchQuery, selectedTopics])

  const displayedEpisodes = filteredEpisodes.slice(0, displayCount)
  const hasMore = displayCount < filteredEpisodes.length

  const handleTopicToggle = (topic: string) => {
    setDisplayCount(ITEMS_PER_PAGE)
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

  const handleClearFilters = () => {
    setSelectedTopics([])
    setSearchQuery("")
    setDisplayCount(ITEMS_PER_PAGE)
  }

  const shareEpisode = async (episode: Podcast) => {
    const url = `${window.location.origin}/podcasts/${episode.slug}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: episode.title,
          text: episode.description,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setShareStatus("Episode link copied.")
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        setShareStatus("Unable to share. Open the episode and copy its address.")
      }
    }
  }

  const activeFiltersCount = selectedTopics.length + (searchQuery ? 1 : 0)

  return (
    <div>
      <div className={podcastStyles.sectionHeader}>
        <div>
          <h2 className={`${podcastStyles.sectionTitle} ${podcastStyles.underlined}`}>Episode Archive</h2>
          <p className="text-sm text-text-muted mt-2">
            Explore {totalCount} conversations on autism, lived experiences, and community inclusion.
          </p>
        </div>
        <Link href="/podcasts/episodes" className={podcastStyles.textLink}>
          Browse All Episodes
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className={podcastStyles.archiveLayout}>
        {/* Left Sidebar - Filters */}
        <aside className={podcastStyles.sidebar}>
          <div className={podcastStyles.filterPanel}>
            <button
              className={podcastStyles.filterToggle}
              aria-expanded={filtersOpen}
              aria-controls="podcast-topics"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={18} aria-hidden="true" />
              Filter Library{activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </button>

            <h3 className={podcastStyles.desktopFilterTitle}>Filter Library</h3>

            {/* Search Input */}
            <div className="relative my-3">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search episodes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setDisplayCount(ITEMS_PER_PAGE)
                }}
                className="w-full pl-8 pr-7 py-2 bg-white border border-gray-200 rounded-lg text-xs text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                aria-label="Search episodes by keyword or guest"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setDisplayCount(ITEMS_PER_PAGE)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div
              id="podcast-topics"
              className={`${podcastStyles.filterOptions} ${filtersOpen ? podcastStyles.filterOptionsOpen : ""}`}
            >
              <p className={podcastStyles.filterLabel}>Topics</p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {allTopics.map((topic) => (
                  <label key={topic} className={podcastStyles.topic}>
                    <Checkbox
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={() => handleTopicToggle(topic)}
                    />
                    <span className="text-xs">{topic}</span>
                  </label>
                ))}
              </div>

              {activeFiltersCount > 0 && (
                <button className={`${podcastStyles.textLink} mt-2.5 text-xs`} onClick={handleClearFilters}>
                  Clear all filters ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Support CTA */}
          <div className={podcastStyles.supportCard}>
            <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2.5">
              <Heart size={18} className="text-brand-primary" aria-hidden="true" />
            </div>
            <h3 className="font-heading font-bold text-base text-text-main mb-1">Support Our Mission</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Help us amplify voices and create positive change in our community.
            </p>
            <Button
              asChild
              size="sm"
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg h-8 text-xs font-semibold"
            >
              <Link href="/donate">Donate Now</Link>
            </Button>
          </div>
        </aside>

        {/* Right Content - Episodes Grid (3 in a row on desktop) */}
        <div className={podcastStyles.archiveResults}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className={podcastStyles.resultCount} aria-live="polite">
              Showing {displayedEpisodes.length} of {filteredEpisodes.length} episodes
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={handleClearFilters} className="text-xs font-semibold text-brand-primary hover:underline">
                Reset filters
              </button>
            )}
          </div>

          <p className="sr-only" role="status">
            {shareStatus}
          </p>

          {/* 3 Cards in a row on desktop (sm: 2, lg/xl: 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">
            {displayedEpisodes.map((episode) => {
              const publishedDate = new Date(episode.publishedAt)
              const validDate = !Number.isNaN(publishedDate.getTime())

              return (
                <article
                  key={episode.id}
                  className="podcast-card relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-brand-primary hover:-translate-y-1 transition-all duration-300 group h-full"
                >
                  {/* Thumbnail (16:9) with badges and play button */}
                  <div className={`${thumbnailStyles.thumbnail} relative aspect-video overflow-hidden bg-gray-900`}>
                    <ArchiveThumbnailImage
                      src={episode.thumbnailUrl}
                      youtubeId={episode.youtubeId}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      alt={episode.title}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Episode Number Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="bg-brand-primary text-white px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        EP {episode.episodeNumber || episodes.findIndex((item) => item.id === episode.id) + 1}
                      </span>
                    </div>

                    {/* Duration Badge */}
                    {episode.duration && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[11px] font-medium">
                          {episode.duration}
                          {episode.duration.includes(":") ? "" : " min"}
                        </span>
                      </div>
                    )}

                    {/* Centered Play Button Overlay */}
                    <div
                      className={`${thumbnailStyles.playOverlay} absolute inset-0 flex items-center justify-center transition-all`}
                    >
                      <div
                        className={`${thumbnailStyles.playCircle} w-11 h-11 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <Play
                          className={`${thumbnailStyles.playIcon} w-5 h-5 text-brand-primary ml-0.5`}
                          fill="currentColor"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Bottom gradient on image */}
                    <div
                      className={`${thumbnailStyles.gradient} absolute inset-x-0 bottom-0 h-16 pointer-events-none`}
                    />
                  </div>

                  {/* Card Content (compact for 3-column layout) */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Topic Badge + Date */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {episode.topics[0] && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-brand-primary bg-brand-primary/10 border border-brand-primary/20">
                          {episode.topics[0]}
                        </span>
                      )}
                      {validDate && (
                        <span className="flex items-center text-[11px] text-text-muted font-medium ml-auto">
                          <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                          {formatDistanceToNow(publishedDate, { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[15px] font-heading font-bold text-text-main mb-1.5 group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                      {episode.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-text-muted leading-relaxed mb-4 line-clamp-2">{episode.description}</p>

                    {/* Actions Row */}
                    <div className="mt-auto flex items-center gap-2">
                      <Link
                        href={`/podcasts/${episode.slug}`}
                        className="after:absolute after:inset-0 flex-1 inline-flex items-center justify-center text-xs font-bold text-white bg-brand-primary px-3 py-2 rounded-lg hover:bg-brand-primary-dark hover:shadow-xs transition-all duration-200 h-9 cursor-pointer"
                      >
                        Watch Episode<span className="sr-only">: {episode.title}</span>
                        <ArrowRight
                          className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform"
                          aria-hidden="true"
                        />
                      </Link>

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          shareEpisode(episode)
                        }}
                        className="relative z-10 flex items-center justify-center w-9 h-9 rounded-lg border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-xs transition-all duration-200 flex-shrink-0 cursor-pointer"
                        aria-label={`Share ${episode.title}`}
                        title="Share episode"
                      >
                        <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center py-8">
              <Button
                onClick={() => setDisplayCount((prev) => prev + ITEMS_PER_PAGE)}
                size="lg"
                variant="outline"
                className="min-w-[200px] border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-bold rounded-xl cursor-pointer text-sm h-11"
              >
                Load More Episodes
              </Button>
            </div>
          )}

          {/* Empty State */}
          {filteredEpisodes.length === 0 && (
            <div className="p-10 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 text-center my-6">
              <p className="text-base font-semibold text-text-main mb-1.5">No episodes found matching your filters.</p>
              <p className="text-xs text-text-muted mb-4">Try searching for a different topic, guest, or keyword.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white text-xs"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
