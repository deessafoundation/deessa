"use client"

import { useRef, useState } from "react"
import { Play } from "lucide-react"
import styles from "./what-we-do-video-player.module.css"

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
  const [failed, setFailed] = useState(false)

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
    <div className={`${styles.player} relative aspect-video overflow-hidden rounded-3xl border shadow-sm`}>
      {failed ? <div role="status" className={`${styles.unavailable} flex h-full flex-col items-center justify-center gap-3 p-6 text-center`}>
        <p className="font-comic font-bold">This video is currently unavailable.</p>
        <p className="font-comic text-sm">{label}</p>
      </div> : <>
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full bg-black ${hasStarted ? "object-contain" : "object-cover"}`}
        controls={hasStarted}
        preload="none"
        data-what-we-do-video
        onError={() => setFailed(true)}
        onPlay={event => {
          // A gallery should never play competing soundtracks at the same time.
          document.querySelectorAll<HTMLVideoElement>("video[data-what-we-do-video]").forEach(video => {
            if (video !== event.currentTarget) video.pause()
          })
        }}
        playsInline
        poster={posterSrc}
        aria-label={label}
      >
        <source src={src} type="video/mp4" onError={() => setFailed(true)} />
        <track kind="captions" src="/captions/empty.vtt" srcLang="en" label="English" default />
        Your browser does not support HTML video.
      </video>

      {!hasStarted && (
        <button
          type="button"
          onClick={playVideo}
          className={`${styles.playButton} group absolute inset-0 flex w-full items-center justify-center overflow-hidden focus-visible:outline-none`}
          aria-label={`Play ${label}`}
        >
          <span className={`${styles.badge} absolute left-4 top-4 rounded-full border px-3 py-2 font-comic text-xs font-bold uppercase tracking-widest`}>
            {areaLabel}
          </span>

          <span className={`${styles.playCircle} flex size-14 items-center justify-center rounded-full border-2 sm:size-20`}>
            <Play className="ml-1 size-6 sm:size-9" aria-hidden="true" />
          </span>

          <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-left">
            <span className="max-w-[75%] font-marissa text-sm leading-tight sm:text-lg">
              {label}
            </span>
            <span className={`${styles.watchLabel} hidden shrink-0 rounded-full px-3 py-2 font-comic text-xs font-bold lg:inline`}>
              {playButtonLabel}
            </span>
          </span>
        </button>
      )}
      </>}
    </div>
  )
}
