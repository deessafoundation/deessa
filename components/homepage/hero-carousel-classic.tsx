"use client"

/**
 * Classic homepage hero — the full-bleed dark banner slideshow that ran on the
 * homepage before commit d65d669 replaced it with the light editorial layout.
 *
 * The client asked for the earlier design back, so this file is a hand-ported
 * copy of the pre-rewrite implementation (source snapshot:
 * `components/hero-carousel.tsx` @ d70c35a, the parent of d65d669). No revert
 * or reset was used: the code was read from the old revision and re-created
 * here against the current module paths and assets.
 *
 * Deliberate adaptations from the original (see
 * docs/in-progress/homepage-hero-classic/README.md for the full list):
 * - `HomepageImage` now lives in `components/homepage/homepage-image.tsx`.
 * - The high-contrast rules moved into a co-located CSS module.
 * - The superseded `inclusion-begins-at-home-v2.jpg` reference points at the
 *   bundled asset instead of a file that no longer exists.
 * - The `btn-shine` utility no longer exists anywhere in the codebase, so the
 *   class was dropped rather than kept as dead markup.
 * - Empty slides return `null` instead of rendering an empty banner.
 *
 * The editorial design is untouched in `components/homepage/hero-carousel.tsx`.
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { HomepageImage } from "@/components/homepage/homepage-image"
import styles from "./hero-carousel-classic.module.css"
import inclusionAtHomeImage from "@/public/home/hero/inclusion-begins-at-home.jpg"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAccessibility, useOptionalAccessibility } from "@/lib/hooks/use-accessibility"
import { cn } from "@/lib/utils"
import { TTS_ATTRIBUTES, TTS_EVENTS } from "@/lib/tts/types"

export interface HeroSlide {
  id?: string
  image: string
  title: string
  subtitle: string
  cta: string
  ctaHref: string
  ctaVariant?: "primary" | "secondary"
}

interface HeroCarouselClassicProps {
  slides: HeroSlide[]
  interval?: number
}

const NEWS_TICKER_ITEMS = ["Inclusion Begins at Home: real voices, real stories"]

// Safety net: normalize any CMS-provided image path so a value like
// "home\hero\img.jpg" can never crash next/image and take down the page.
function normalizeHeroImage(src: string) {
  if (!src || typeof src !== "string") return "/home/hero/real-voices-young-speaker.jpg"
  const trimmed = src.trim()
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed
  const forward = trimmed.replace(/\\/g, "/")
  let withSlash = forward.startsWith("/") ? forward : `/${forward}`
  // Both saved filenames resolve to the bundled photo; its content hash
  // busts stale caches the way the old "-v2" rename used to.
  const path = withSlash.split("?")[0]
  if (path === "/home/hero/inclusion-begins-at-home.jpg" || path === "/home/hero/inclusion-begins-at-home-v2.jpg") {
    return inclusionAtHomeImage.src
  }
  return withSlash
}

function getHeroImagePositionClass(slide: HeroSlide) {
  const image = normalizeHeroImage(slide.image)

  if (image === "/home/hero/real-voices-young-speaker.jpg") {
    return "md:object-[50%_23%]"
  }

  // This slide can use either the bundled image or an uploaded Supabase URL.
  // Match its stable CMS id as well as both URL shapes so localhost and the
  // deployed site keep the speaker's face in the same crop.
  if (
    slide.id === "slide-2" ||
    image === inclusionAtHomeImage.src ||
    /\/hero-slide-2(?:_|\.)/i.test(image)
  ) {
    return "object-[62%_18%]"
  }

  return undefined
}

export function HeroCarouselClassic({ slides, interval = 6000 }: HeroCarouselClassicProps) {
  const accessibility = useOptionalAccessibility()
  const isPageReading =
    accessibility?.status === "loading" ||
    accessibility?.status === "translating" ||
    accessibility?.status === "speaking" ||
    accessibility?.status === "paused"
  const { preferences } = useAccessibility()
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Check for reduced motion preference (system OR app preference)
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const timer = setTimeout(() => {
      setPrefersReducedMotion(mediaQuery.matches || preferences.reduceMotion || preferences.sensoryFriendly)
    }, 0)

    const handleChange = (e: MediaQueryListEvent) => {
      // Re-check app preferences when system preference changes
      const shouldReduceMotion = e.matches || preferences.reduceMotion || preferences.sensoryFriendly
      setPrefersReducedMotion(shouldReduceMotion)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => {
      clearTimeout(timer)
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [preferences.reduceMotion, preferences.sensoryFriendly])

  const goTo = useCallback(
    (index: number, dir?: "next" | "prev") => {
      setDirection(dir ?? (index > current ? "next" : "prev"))
      setCurrent(index)
    },
    [current],
  )

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, "next")
  }, [current, slides.length, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, "prev")
  }, [current, slides.length, goTo])

  useEffect(() => {
    const carousel = sectionRef.current
    if (!carousel) return

    const activateSpokenSlide = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      const slideIndex = target.getAttribute(TTS_ATTRIBUTES.carouselSlide)
      if (slideIndex === null) return
      const index = Number(slideIndex)
      if (Number.isInteger(index) && index >= 0 && index < slides.length && index !== current) {
        goTo(index)
      }
    }

    carousel.addEventListener(TTS_EVENTS.activateCarouselSlide, activateSpokenSlide)
    return () => carousel.removeEventListener(TTS_EVENTS.activateCarouselSlide, activateSpokenSlide)
  }, [current, goTo, slides.length])

  const getSlidePositionClass = (index: number) => {
    if (index === current) return "translate-x-0 opacity-100 z-20"

    const previousIndex = (current - 1 + slides.length) % slides.length
    const nextIndex = (current + 1) % slides.length

    if (direction === "next") {
      if (index === previousIndex) return "-translate-x-full opacity-100 z-10"
      return "translate-x-full opacity-0 z-0"
    }

    if (index === nextIndex) return "translate-x-full opacity-100 z-10"
    return "-translate-x-full opacity-0 z-0"
  }

  // Auto-advance
  useEffect(() => {
    if (isPaused || isPageReading || prefersReducedMotion) return
    timerRef.current = setInterval(next, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, isPageReading, next, interval, prefersReducedMotion])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    },
    [next, prev],
  )

  if (!slides.length) return null

  return (
    <section
      id="home-hero"
      ref={sectionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={cn(
        styles.hero,
        "relative h-[92svh] min-h-[540px] w-full overflow-hidden bg-slate-900 md:h-[100svh] md:min-h-[620px]",
      )}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id ?? i}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slides.length}: ${slide.title}`}
          aria-hidden={i !== current}
          data-tts-carousel-slide={i}
          data-tts-text={`${slide.title}. ${slide.subtitle}. ${slide.cta}. Explore Programs.`}
          inert={i !== current}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out will-change-transform",
            getSlidePositionClass(i),
          )}
        >
          {/* Background image with subtle zoom */}
          <div className="absolute inset-0">
            <HomepageImage
              src={normalizeHeroImage(slide.image)}
              alt=""
              fill
              className={cn(
                "object-cover",
                getHeroImagePositionClass(slide),
                !prefersReducedMotion && i === current && "animate-kenburns",
              )}
              priority={i === 0}
              sizes="100vw"
            />
          </div>
          {/* Gradient overlay - stronger for better text readability */}
          <div
            data-hero-shade="horizontal"
            className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/30"
          />
          <div
            data-hero-shade="vertical"
            className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-slate-900/30"
          />

          {/* Content - Improved typography and hierarchy */}
          <div className="relative z-10 flex h-full items-center">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div data-tts-highlight-target className="max-w-xl sm:max-w-2xl">
                {/* Pre-heading tag */}
                <div
                  className={cn(
                    "transition-all duration-500",
                    i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  )}
                >
                  <span
                    data-hero-control
                    className="inline-block rounded-full bg-white/20 px-3 py-1.5 mb-3 text-[10px] font-semibold text-white backdrop-blur-sm sm:px-4 sm:mb-4 sm:text-sm"
                  >
                    A society where everyone is understood, celebrated, and empowered
                  </span>
                </div>

                <h1
                  className={cn(
                    "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-5",
                    "transition-all duration-500 delay-100",
                    i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  )}
                >
                  {slide.title}
                </h1>
                <p
                  className={cn(
                    "text-base sm:text-lg md:text-xl text-white/85 leading-relaxed mb-6 sm:mb-8 max-w-lg sm:max-w-xl",
                    "transition-all duration-500 delay-200",
                    i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  )}
                >
                  {slide.subtitle}
                </p>
                <div
                  className={cn(
                    "flex flex-col gap-3 sm:flex-row sm:gap-4",
                    "transition-all duration-500 delay-300",
                    i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  )}
                >
                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      "h-12 w-full rounded-lg px-6 text-base font-semibold shadow-lg sm:h-14 sm:w-auto sm:px-8",
                      styles.primaryCta
                    )}
                  >
                    <Link href={slide.ctaHref} data-hero-control>{slide.cta}</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 w-full rounded-lg border-2 border-white/50 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:border-white sm:h-14 sm:w-auto sm:px-8"
                  >
                    <Link href="/whatwedo" data-hero-control>
                      Explore Programs
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrow navigation - Always visible on desktop, larger touch targets */}
      {/* data-tts-ignore: these are navigation controls, not page content. */}
      <button
        type="button"
        onClick={prev}
        data-hero-control
        data-tts-ignore=""
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition-colors hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white md:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={next}
        data-hero-control
        data-tts-ignore=""
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition-colors hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white md:flex"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scroll indicator - Only if motion is not reduced */}
      {!prefersReducedMotion && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-scroll-bounce md:bottom-24">
          <div className="flex w-6 h-10 items-start justify-center rounded-full border-2 border-white/40 p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-white/70" />
          </div>
        </div>
      )}

      {/* News ticker overlay (transparent, slight opacity) */}
      <div className="absolute top-3 left-0 right-0 z-20 px-2 sm:top-4 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4 rounded-2xl px-4 py-2.5 text-white">
            <span className="shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 sm:text-xs">
              LATEST UPDATES
            </span>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div
                className="flex w-max gap-8 py-0.5 nav-news-marquee-track animate-marquee"
                style={{ animationDuration: "16s" }}
              >
                {[...NEWS_TICKER_ITEMS, ...NEWS_TICKER_ITEMS].map((text, idx) => (
                  <span
                    key={`${text}-${idx}`}
                    className="flex shrink-0 items-center gap-8 whitespace-nowrap text-sm text-white/90"
                  >
                    <span>{text}</span>
                    <span className="text-white/35" aria-hidden>
                      |
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden shrink-0 text-white/50 lg:block" aria-hidden>
              ...
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls: dots + pause */}
      {/* data-tts-ignore on the container covers every dot ("Go to slide N")
          and the play/pause button, so the reader never announces them. */}
      <div
        data-tts-ignore=""
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 md:bottom-6"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current ? "true" : undefined}
            className={cn(
              "rounded-full transition-all duration-300",
              i === current ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/70",
            )}
          />
        ))}
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          data-hero-control
          aria-label={isPaused ? "Play carousel" : "Pause carousel"}
          className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>

      {/* Live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {current + 1} of {slides.length}: {slides[current]?.title}
      </div>
    </section>
  )
}
