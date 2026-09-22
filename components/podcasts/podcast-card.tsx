"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, ExternalLink, Clock, Video, Music } from "lucide-react"
import { Youtube } from "@/components/social-icons"
import { cn } from "@/lib/utils"
import { Podcast } from "@/lib/types/podcast"

interface PodcastCardProps {
  podcast: Podcast
  variant?: "primary" | "secondary"
  showTopics?: boolean
  onPlay?: (podcast: Podcast) => void
  className?: string
}

export function PodcastCard({
  podcast,
  variant = "primary",
  showTopics = false,
  onPlay,
  className,
}: PodcastCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const isPrimary = variant === "primary"
  const formatIcon = podcast.format === 'video' ? Video : Music

  const openYouTube = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault()
    event.stopPropagation()
    window.open(`https://www.youtube.com/watch?v=${podcast.youtubeId}`, "_blank", "noopener,noreferrer")
  }

  return (
    <Link
      href={`/podcasts/${podcast.slug}`}
      className={cn(
        "podcast-card group relative flex flex-col rounded-xl overflow-hidden bg-white border border-border/40 shadow-lg transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:shadow-brand-primary/20 hover:border-brand-primary/50 hover:-translate-y-1.5 hover:scale-[1.02]",
        isPrimary ? "h-full" : "h-auto",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Container - Video Focused */}
      <div className="relative overflow-hidden aspect-video bg-gray-900">
        {/* Episode Badge - Always show */}
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-brand-primary text-white px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-lg">
            EP {podcast.episodeNumber || 'New'}
          </span>
        </div>

        {/* Duration Badge - Top Right */}
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-black/75 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-semibold">
            {podcast.duration} min
          </span>
        </div>

        {/* Loading Placeholder - Shows while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 z-0 bg-gray-300 animate-pulse" />
        )}

        {/* Thumbnail Image */}
        <div className={cn(
          "absolute inset-0 z-0 transition-opacity duration-500",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}>
          <Image
            src={podcast.thumbnailUrl}
            alt={podcast.title}
            fill
            className={cn(
              "object-cover transition-transform duration-700 ease-out",
              isHovered && "scale-110"
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>

        {/* Play Button Overlay */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onPlay?.(podcast)
          }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all duration-300"
          aria-label={`Play ${podcast.title}`}
        >
          <div
            className={cn(
              "w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-xl ring-2 ring-white/50 transition-all duration-300",
              isHovered ? "scale-110 bg-brand-primary ring-brand-primary/50" : "scale-100"
            )}
          >
            <Play 
              className={cn(
                "w-7 h-7 md:w-9 md:h-9 transition-colors duration-300 ml-1",
                isHovered ? "text-white" : "text-brand-primary"
              )} 
              fill="currentColor" 
            />
          </div>
        </button>

        {/* Gradient Overlay - Subtle */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10" />
      </div>

      {/* Content */}
      <div className={cn(
        "flex flex-col grow p-5 md:p-6",
        isPrimary ? "gap-3" : "gap-2"
      )}>
        {/* Topics */}
        {showTopics && podcast.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {podcast.topics.slice(0, 2).map((topic) => (
              <span
                key={topic}
                className="inline-block px-2 py-1 text-xs font-medium text-brand-primary rounded"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <h3 
          className={cn(
            "font-heading font-bold text-foreground leading-tight transition-colors duration-300 group-hover:text-brand-primary",
            isPrimary ? "text-lg md:text-xl" : "text-base"
          )}
        >
          {podcast.title}
        </h3>

        {isPrimary && (
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-2">
            {podcast.description}
          </p>
        )}

        {/* Actions */}
        <div className={cn(
          "flex items-center gap-3 mt-auto pt-2 border-t border-border/30",
          isPrimary ? "pt-4" : "pt-3"
        )}>
          <div className={cn(
            "flex items-center gap-2 font-semibold text-white bg-brand-primary px-3 py-1.5 rounded-lg transition-all duration-300",
            "group-hover:bg-brand-primary-dark group-hover:gap-3 group-hover:shadow-md",
            isPrimary ? "text-xs" : "text-xs"
          )}>
            <Play className="size-3.5" fill="currentColor" />
            Watch Episode
          </div>

          <span
            role="link"
            tabIndex={0}
            className={cn(
              "flex items-center gap-1.5 text-muted-foreground transition-all duration-300 hover:text-red-600 hover:scale-105",
              isPrimary ? "text-sm" : "text-xs"
            )}
            onClick={openYouTube}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openYouTube(event)
              }
            }}
          >
            <Youtube className="size-4" />
            <span className="font-medium">View on YouTube</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
