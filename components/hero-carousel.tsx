"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface HeroSlide {
  image: string
  title: string
  subtitle: string
  cta: string
  ctaHref: string
  ctaVariant?: "primary" | "secondary"
}

interface HeroCarouselProps {
  slides: HeroSlide[]
  interval?: number
}

const NEWS_TICKER_ITEMS = [
  "New sustainability initiative launched",
  "Grant awarded for community project",
]

export function HeroCarousel({ slides, interval = 6000 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

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
    if (isPaused || prefersReducedMotion) return
    timerRef.current = setInterval(next, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, next, interval, prefersReducedMotion])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    },
    [next, prev],
  )

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative w-full h-[92svh] min-h-[540px] overflow-hidden bg-slate-900 md:h-[100svh] md:min-h-[620px]"
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slides.length}: ${slide.title}`}
          aria-hidden={i !== current}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out will-change-transform",
            getSlidePositionClass(i),
          )}
        >
          {/* Background image with subtle zoom */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt=""
              fill
              className={cn(
                "object-cover",
                !prefersReducedMotion && i === current && "animate-kenburns"
              )}
              priority={i === 0}
              sizes="100vw"
            />
          </div>
          {/* Gradient overlay - stronger for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-slate-900/30" />

          {/* Content - Improved typography and hierarchy */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl sm:max-w-2xl">
                {/* Pre-heading tag */}
                <div
                  className={cn(
                    "transition-all duration-500",
                    i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  )}
                >
                  <span className="inline-block px-3 py-1.5 mb-3 text-[10px] font-semibold text-white bg-white/20 backdrop-blur-sm rounded-full sm:px-4 sm:mb-4 sm:text-sm">
                    Supporting Children with Autism in Nepal
                  </span>
                </div>

                <h1
                  className={cn(
                    "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-5",
                    "transition-all duration-500 delay-100",
                    i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  )}
                >
                  {slide.title}
                </h1>
                <p
                  className={cn(
                    "text-base sm:text-lg md:text-xl text-white/85 leading-relaxed mb-6 sm:mb-8 max-w-lg sm:max-w-xl",
                    "transition-all duration-500 delay-200",
                    i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  )}
                >
                  {slide.subtitle}
                </p>
                <div
                  className={cn(
                    "flex flex-col gap-3 sm:flex-row sm:gap-4",
                    "transition-all duration-500 delay-300",
                    i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  )}
                >
                  <Button
                    asChild
                    size="lg"
                    className="h-12 w-full px-6 text-base font-semibold rounded-lg shadow-lg btn-shine sm:h-14 sm:w-auto sm:px-8"
                  >
                    <Link href={slide.ctaHref}>{slide.cta}</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 w-full px-6 text-base font-semibold rounded-lg border-2 border-white/50 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white sm:h-14 sm:w-auto sm:px-8"
                  >
                    <Link href="/whatwedo">Explore Programs</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrow navigation - Always visible on desktop, larger touch targets */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/20 text-white opacity-60 backdrop-blur-md transition-colors hover:bg-white/30 hover:opacity-100 focus:opacity-100 md:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/20 text-white opacity-60 backdrop-blur-md transition-colors hover:bg-white/30 hover:opacity-100 focus:opacity-100 md:flex"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scroll indicator - Only if motion is not reduced */}
      {!prefersReducedMotion && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-scroll-bounce md:bottom-24">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5">
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
                  <span key={`${text}-${idx}`} className="flex shrink-0 items-center gap-8 whitespace-nowrap text-sm text-white/90">
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 md:bottom-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current ? "true" : undefined}
            className={cn(
              "rounded-full transition-all duration-300",
              i === current
                ? "w-8 h-2.5 bg-white"
                : "w-2.5 h-2.5 bg-white/50 hover:bg-white/70",
            )}
          />
        ))}
        <button
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "Play carousel" : "Pause carousel"}
          className="ml-2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-colors"
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
