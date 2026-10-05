'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { Youtube } from '@/components/shared/icons/social-icons';
import { Button } from '@/components/ui/button';
import { Podcast } from '@/lib/types/podcast';
import { useVideoModal } from '@/contexts/VideoModalContext';

interface PodcastMainHeroProps {
  episodes: Podcast[];
}

export default function PodcastMainHero({ episodes }: PodcastMainHeroProps) {
  const { openVideoModal } = useVideoModal();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const episode = episodes[currentIndex];
  const hasMultipleEpisodes = episodes.length > 1;

  // Auto-rotate through featured episodes every 60 seconds
  useEffect(() => {
    if (!hasMultipleEpisodes || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % episodes.length);
    }, 60000);

    return () => clearInterval(interval);
  }, [episodes.length, hasMultipleEpisodes, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 15000); // Resume after 15s
  };

  return (
    <>
      <section id="episodes" className="scroll-mt-28 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-primary mb-4">Featured conversations</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-6">Real experiences. Shared understanding.</h2>
            
            <p className="text-lg text-text-muted leading-relaxed mb-8">
              Hear from parents, professionals, and advocates sharing lived experiences and insights about autism, acceptance, and inclusion.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Button
                size="lg"
                onClick={() => openVideoModal(episode.youtubeId, episode.title)}
                className="bg-brand-primary hover:bg-brand-primary-dark text-white px-8 py-6 text-lg font-semibold"
              >
                <Play className="w-5 h-5 mr-2" fill="currentColor" />
                Watch Episode {episode.episodeNumber}
              </Button>

              <a href="https://www.youtube.com/@deessaFoundation/videos" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-primary font-semibold"><Youtube className="w-5 h-5" />Watch on YouTube</a>
            </div>
          </div>

          {/* Right Column - Video Thumbnail with Play Overlay */}
          <div className="relative">
            <div
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black cursor-pointer group/hero"
              onClick={() => openVideoModal(episode.youtubeId, episode.title)}
            >
              {/* Thumbnail */}
              <Image
                key={episode.id}
                src={episode.thumbnailUrl || `https://i.ytimg.com/vi/${episode.youtubeId}/maxresdefault.jpg`}
                alt={episode.title}
                fill
                className="object-cover transition-transform duration-500 group-hover/hero:scale-105"
                unoptimized
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover/hero:bg-black/40 transition-colors duration-300" />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/90 group-hover/hero:bg-white flex items-center justify-center shadow-2xl transform group-hover/hero:scale-110 transition-all duration-300">
                  <Play className="w-9 h-9 text-brand-primary ml-1" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Carousel Indicators - Only show if multiple episodes */}
            {hasMultipleEpisodes && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {episodes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-brand-primary'
                        : 'w-2 bg-border hover:bg-text-muted'
                    }`}
                    aria-label={`Go to episode ${episodes[index].episodeNumber}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
