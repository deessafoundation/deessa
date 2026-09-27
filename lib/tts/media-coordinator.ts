// ── Audio Exclusivity Coordinator ───────────────────────────────────────────
// TTS and site media (video, podcasts) must never talk over each other. This
// tiny module-level bus keeps the two sides decoupled: media components
// announce playback, the accessibility provider listens and stops speech.

type MediaListener = () => void

const listeners = new Set<MediaListener>()

/**
 * Called by media components (including iframe-based players, which emit no
 * DOM `play` event) right before they start producing sound.
 */
export function notifyMediaPlaying(): void {
  for (const listener of Array.from(listeners)) {
    try {
      listener()
    } catch {
      /* a broken subscriber must not block media playback */
    }
  }
}

/** Subscribe to media-playback announcements. Returns an unsubscribe fn. */
export function onMediaPlaying(listener: MediaListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Pause every native media element on the page. Used before TTS starts so
 * speech is the only audio source. Iframe players cannot be paused from here,
 * which is why they call `notifyMediaPlaying()` instead.
 */
export function pauseAllNativeMedia(): void {
  if (typeof document === "undefined") return
  const media = document.querySelectorAll<HTMLMediaElement>("video, audio")
  media.forEach((element) => {
    if (!element.paused && !element.muted) {
      try {
        element.pause()
      } catch {
        /* no-op */
      }
    }
  })
}
