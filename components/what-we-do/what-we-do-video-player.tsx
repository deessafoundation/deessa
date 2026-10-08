"use client"

import { useRef, useState } from "react"
import { Play } from "lucide-react"

interface WhatWeDoVideoPlayerProps {
  src: string
  label: string
  areaLabel: string
  posterSrc: string
  playButtonLabel?: string
}

export function WhatWeDoVideoPlayer({
  src,
  label,
  areaLabel,
  posterSrc,
  playButtonLabel = "Watch video",
}: WhatWeDoVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const playVideo = async () => {
    const video = videoRef.current
    if (!video) return

    setHasStarted(true)
    video.currentTime = 0

    try {
      await video.play()
    } catch {
      // Native controls remain available if the browser blocks programmatic play.
    }
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full bg-black ${hasStarted ? "object-contain" : "object-cover"}`}
        controls={hasStarted}
        preload="metadata"
        playsInline
        poster={posterSrc}
        aria-label={label}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support HTML video.
      </video>

      {!hasStarted && (
        <button
          type="button"
          onClick={playVideo}
          className="group absolute inset-0 flex w-full items-center justify-center overflow-hidden bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-sky-950/20 text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-300"
          aria-label={`Play ${label}`}
        >
          <span className="absolute left-5 top-5 rounded-full border border-white/30 bg-slate-950/55 px-4 py-2 font-comic text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-sm sm:left-7 sm:top-7">
            {areaLabel}
          </span>

          <span className="flex size-20 items-center justify-center rounded-full border-2 border-white bg-slate-950/65 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 sm:size-24">
            <Play className="ml-1 size-9 fill-white text-white sm:size-11" aria-hidden="true" />
          </span>

          <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-left sm:inset-x-7 sm:bottom-7">
            <span className="max-w-[75%] font-marissa text-xl leading-tight drop-shadow-md sm:text-2xl">
              {label}
            </span>
            <span className="shrink-0 rounded-full bg-sky-500 px-4 py-2 font-comic text-xs font-bold shadow-lg transition-colors group-hover:bg-sky-400 sm:text-sm">
              {playButtonLabel}
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
