"use client"

import { useState, useEffect, useCallback, useRef, useId } from "react"
import Link from "next/link"
import artHero from "@/public/home/hero/art_banner.jpeg"
import podcastBanner from "@/public/podcast_banner.jpeg"
import inclusionAtHomeImage from "@/public/home/hero/inclusion-begins-at-home.jpg"
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Pause, Play, Sprout, Star, UsersRound } from "lucide-react"
import { HomepageImage } from "@/components/homepage-image"
import { useAccessibility, useOptionalAccessibility } from "@/lib/hooks/use-accessibility"
import { cn } from "@/lib/utils"
import { TTS_ATTRIBUTES, TTS_EVENTS } from "@/lib/tts/types"
import styles from "./hero-carousel.module.css"

// Palette: #FFFFFF · Pale Blue #E8F6FC · Ocean Blue #3FABDE · Deep Ocean #0B5F8A
// Charcoal #212529 · Muted #6C757D · accents Purple #6F3E96 / Yellow #F7C52B

export interface HeroSlide {
  id?: string
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

const EYEBROW = "A society where everyone is understood, celebrated, and empowered"

const NEWS_TICKER_ITEMS = [
  "Inclusion Begins at Home: real voices, real stories",
  "Girls' leadership and participation through sport",
]

// Safety net: normalize any CMS-provided image path so a value like
// "home\hero\img.jpg" can never crash next/image and take down the page.
function normalizeHeroImage(src: string) {
  if (!src || typeof src !== "string") return "/home/hero/real-voices-young-speaker.jpg"
  const trimmed = src.trim()
  // Replace only the superseded CMS uploads; future admin uploads remain authoritative.
  if (trimmed === "https://tqljblbdfhjfqnegjobi.supabase.co/storage/v1/object/public/hero-images/homepage-hero/hero-slide-2_2026-09-17_05-05-14_ev8e62b8.jpg") return inclusionAtHomeImage.src
  if (trimmed === "https://tqljblbdfhjfqnegjobi.supabase.co/storage/v1/object/public/hero-images/homepage-hero/hero-slide-4_2026-09-16_15-29-11_aarw2dxz.png") return podcastBanner.src
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed
  const forward = trimmed.replace(/\\/g, "/")
  const withSlash = forward.startsWith("/") ? forward : `/${forward}`
  // Resolve both saved filenames to the current asset; its content hash prevents stale caches.
  if (["/home/hero/inclusion-begins-at-home.jpg", "/home/hero/inclusion-begins-at-home-v2.jpg"].includes(withSlash.split("?")[0])) {
    return inclusionAtHomeImage.src
  }
  if (["/podcast_banner.jpeg", "/podcast_banner.png", "/home/podcast/deessa-podcast-studio.png"].includes(withSlash.split("?")[0])) {
    return podcastBanner.src
  }
  return withSlash
}

// Keep each speaker's full face inside the framed crop.
function getHeroImagePositionClass(slide: HeroSlide) {
  const image = normalizeHeroImage(slide.image)
  // Square photo in a 4:3 frame: keep both children's faces and most of the craft.
  if (image === artHero.src) return "object-[50%_30%]"
  if (slide.id === "slide-1" || image === "/home/hero/real-voices-young-speaker.jpg") return "object-[50%_28%]"
  if (image === inclusionAtHomeImage.src) return "object-[50%_25%]"
  if (slide.id === "slide-2" || /\/hero-slide-2(?:_|\.)/i.test(image)) {
    return "object-[62%_18%]"
  }
  return "object-[50%_40%]"
}

/**
 * Break a title into up to three intentional lines; the last line is the
 * Ocean Blue accent. Admins can force breaks with a line break or " | ".
 */
function splitTitle(title: string): string[] {
  const clean = title.trim()
  const explicit = clean.split(/\s*(?:\n|\|)\s*/).filter(Boolean)
  if (explicit.length > 1) return explicit
  if (clean === "Every child deserves space to thrive") return ["Every child deserves", "space to thrive"]
  const words = clean.split(/\s+/)
  if (words.length <= 2) return [clean]
  let tailCount = words.length >= 4 ? 2 : 1
  // Keep short joining words ("on", "the") with the accent line: "on the Field".
  while (tailCount < words.length - 1 && words[words.length - tailCount - 1].length <= 3) tailCount++
  const tail = words.slice(-tailCount).join(" ")
  const head = words.slice(0, -tailCount)
  // Short lead-ins stay on one line ("Living With / Autism").
  if (head.length === 1 || head.join(" ").length <= 16) return [head.join(" "), tail]
  let split = 1
  let widest = Infinity
  for (let i = 1; i < head.length; i++) {
    const w = Math.max(head.slice(0, i).join(" ").length, head.slice(i).join(" ").length)
    if (w < widest) {
      widest = w
      split = i
    }
  }
  return [head.slice(0, split).join(" "), head.slice(split).join(" "), tail]
}

function splitMobileTitle(title: string): string[] {
  const normalized = title.trim().replace(/\s+/g, " ").toLowerCase()
  if (normalized === "every child deserves space to thrive") return ["Every child deserves", "space to thrive"]
  if (normalized === "understanding begins with lived experience") {
    return ["Understanding Begins", "with Lived Experience"]
  }
  if (normalized === "parents turning experience into support") {
    return ["Parents Turning", "Experience into Support"]
  }
  if (normalized === "confidence and belonging on the field") {
    return ["Confidence and", "Belonging on the Field"]
  }
  return splitTitle(title)
}

const pad = (n: number) => String(n).padStart(2, "0")

const roundControl = cn(
  styles.control,
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#3FABDE]/45 bg-white text-[#0B5F8A] sm:h-14 sm:w-14",
  "transition-colors duration-200 hover:border-[#3FABDE] hover:bg-[#E8F6FC]",
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/40",
)

type HeroAction = { label: string; href: string }

// Buttons that match each slide's story. Keyed by the normalized slide title;
// any slide not listed here (e.g. a new CMS slide) keeps its CMS button plus
// the default "Explore Programs" secondary action.
const SLIDE_ACTIONS: Record<string, { primary: HeroAction; secondary: HeroAction }> = {
  "every child deserves space to thrive": {
    primary: { label: "Explore Their Art", href: "/arts" },
    secondary: { label: "Learn About deessa", href: "/about" },
  },
  "understanding begins with lived experience": {
    primary: { label: "Learn About deessa", href: "/about" },
    secondary: { label: "Explore Programs", href: "/whatwedo" },
  },
  "parents turning experience into support": {
    primary: { label: "Explore Autism Support", href: "/whatwedo" },
    secondary: { label: "Read Family Stories", href: "/stories" },
  },
  "confidence and belonging on the field": {
    primary: { label: "Read the Story", href: "/stories" },
    secondary: { label: "Explore Programs", href: "/whatwedo" },
  },
  "living with autism": {
    primary: { label: "Listen to the Podcast", href: "/podcasts" },
    secondary: { label: "Read Real Stories", href: "/stories" },
  },
}

function getSlideActions(slide: HeroSlide) {
  const key = slide.title.trim().replace(/\s+/g, " ").toLowerCase()
  return (
    SLIDE_ACTIONS[key] ?? {
      primary: { label: slide.cta, href: slide.ctaHref },
      secondary: { label: "Explore Programs", href: "/whatwedo" },
    }
  )
}

function HeroActions({ slide, className }: { slide: HeroSlide; className: string }) {
  const { primary, secondary } = getSlideActions(slide)
  return (
    <div className={cn("flex-col gap-3 sm:flex-row sm:gap-5", className)}>
      <Link
        href={primary.href}
        className={cn(
          styles.primaryBtn,
          "inline-flex min-h-[54px] flex-1 items-center justify-center gap-4 rounded-[14px] bg-[#006E9E] px-5 py-3 font-comic text-[17px] font-bold leading-tight text-white xl:min-h-[60px] xl:text-[19px]",
          "transition-colors duration-200 hover:bg-[#094E72]",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/45 focus-visible:ring-offset-2",
        )}
      >
        {primary.label}
        <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" />
      </Link>
      <Link
        href={secondary.href}
        className={cn(
          styles.secondaryBtn,
          "inline-flex min-h-[54px] flex-1 items-center justify-center gap-4 rounded-[14px] border-[1.5px] border-[#3FABDE] bg-white px-5 py-3 font-comic text-[17px] font-bold leading-tight text-[#006E9E] xl:min-h-[60px] xl:text-[19px]",
          "transition-colors duration-200 hover:bg-[#E8F6FC]",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/45 focus-visible:ring-offset-2",
        )}
      >
        {secondary.label}
        <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" />
      </Link>
    </div>
  )
}

function HeroBenefits({ className }: { className: string }) {
  const benefits = [
    { icon: UsersRound, title: "Real Voices", description: "Stronger Communities", color: "bg-[#E4F5FD] text-[#159ED6]" },
    { icon: Heart, title: "Greater Empathy", description: "Brighter Futures", color: "bg-[#FFF6DF] text-[#EEAB00]" },
    { icon: Sprout, title: "More Inclusion", description: "A Kinder Tomorrow", color: "bg-[#F3EEFF] text-[#8551AB]" },
  ]
  return (
    <div className={cn("grid grid-cols-3", className)}>
      {benefits.map(({ icon: Icon, title, description, color }, i) => (
        <div key={title} className={cn("relative flex min-w-0 flex-col items-center gap-2 px-2 text-center lg:flex-row lg:gap-3 lg:px-3 lg:text-left", i === 0 && "lg:pl-0", i === 2 && "lg:pr-0")}>
          {i > 0 && <span aria-hidden="true" className={cn(styles.decor, "absolute left-0 top-4 h-9 w-px bg-[#CDE5F3]")} />}
          <span className={cn(styles.benefitIcon, "flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 2xl:h-[62px] 2xl:w-[62px]", color)}>
            <Icon aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7 2xl:h-8 2xl:w-8" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 font-comic">
            <p className={cn(styles.body, "text-[13px] font-bold leading-tight text-[#304D6D] 2xl:text-[15px]")}>{title}</p>
            <p className={cn(styles.muted, "mt-1 text-[12px] leading-[1.3] text-[#657C97] xl:max-w-[105px] xl:text-[14px]")}>{description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function HeroSparkle({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 56 56" className={cn(styles.decor, "pointer-events-none", className)}>
      <g fill="none" stroke="#FFC931" strokeLinecap="round" strokeWidth="5">
        <path d="m13 26 3-22M24 33 43 15M30 44l21-2" />
      </g>
    </svg>
  )
}

export function HeroCarousel({ slides, interval = 6000 }: HeroCarouselProps) {
  const accessibility = useOptionalAccessibility()
  const isPageReading =
    accessibility?.status === "loading" ||
    accessibility?.status === "translating" ||
    accessibility?.status === "speaking" ||
    accessibility?.status === "paused"
  const { preferences } = useAccessibility()
  const [current, setCurrent] = useState(0)
  // "auto" = play unless reduced motion is preferred; an explicit choice wins.
  const [playPref, setPlayPref] = useState<"auto" | "playing" | "paused">("auto")
  const [isInteracting, setIsInteracting] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const photoClipId = useId()
  const total = slides.length

  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () =>
      setPrefersReducedMotion(mediaQuery.matches || preferences.reduceMotion || preferences.sensoryFriendly)
    const timer = setTimeout(update, 0)
    mediaQuery.addEventListener("change", update)
    return () => {
      clearTimeout(timer)
      mediaQuery.removeEventListener("change", update)
    }
  }, [preferences.reduceMotion, preferences.sensoryFriendly])

  const isPlaying = playPref === "playing" || (playPref === "auto" && !prefersReducedMotion)

  const goTo = useCallback((index: number) => setCurrent(((index % total) + total) % total), [total])
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total])

  // The page reader asks the carousel to show the slide it is reading.
  useEffect(() => {
    const carousel = sectionRef.current
    if (!carousel) return
    const activateSpokenSlide = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      const index = Number(target.getAttribute(TTS_ATTRIBUTES.carouselSlide))
      if (Number.isInteger(index) && index >= 0 && index < total) setCurrent(index)
    }
    carousel.addEventListener(TTS_EVENTS.activateCarouselSlide, activateSpokenSlide)
    return () => carousel.removeEventListener(TTS_EVENTS.activateCarouselSlide, activateSpokenSlide)
  }, [total])

  // Auto-advance
  useEffect(() => {
    if (!isPlaying || isInteracting || isPageReading || total < 2) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [isPlaying, isInteracting, isPageReading, next, interval, total])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev()
    else if (e.key === "ArrowRight") next()
  }

  if (!total) return null

  return (
    <>
      <section
        id="home-hero"
        ref={sectionRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured campaigns"
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        onFocus={() => setIsInteracting(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsInteracting(false)
        }}
        className={cn(styles.hero, "relative w-full overflow-hidden bg-white")}
      >
        {/* Latest updates ticker (same content and marquee as before, restyled for the light hero) */}
        <div className={cn(styles.updates, "relative z-10 border-b border-[#D7EAF4] bg-[#EEF8FD]")}>
          <div className="mx-auto flex w-full max-w-[1500px] items-center gap-4 px-5 py-2.5 sm:px-8 lg:px-12 xl:px-16">
            <span
              className={cn(
                styles.updatesLabel,
                "shrink-0 font-comic text-[10px] font-bold uppercase tracking-wider text-[#0B5F8A] sm:text-xs",
              )}
            >
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
                    aria-hidden={idx >= NEWS_TICKER_ITEMS.length || undefined}
                    className={cn(
                      styles.updatesLink,
                      "flex shrink-0 items-center gap-8 whitespace-nowrap font-comic text-sm text-[#212529]/85",
                    )}
                  >
                    <span>{text}</span>
                    <span className={cn(styles.divider, "text-[#3FABDE]/60")} aria-hidden>
                      |
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className={cn(styles.muted, "hidden shrink-0 text-[#6C757D] lg:block")} aria-hidden>
              ...
            </div>
          </div>
        </div>

        {/* Soft light wash behind the photo. Corner shapes were removed to keep the focus on content. */}
        <div
          aria-hidden="true"
          className={cn(
            styles.decor,
            "pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[62%]",
            "bg-[radial-gradient(ellipse_at_62%_42%,rgba(232,246,252,0.95)_0%,rgba(232,246,252,0.45)_38%,rgba(255,255,255,0)_68%)]",
          )}
        />

        <div
          className={cn(
            "relative mx-auto grid w-full max-w-[1680px] grid-cols-1 items-center gap-7 px-5 pb-20 pt-7 sm:gap-8 sm:px-8 sm:pt-8",
            "lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] lg:gap-9 lg:px-12 lg:pb-16 lg:pt-12 xl:gap-12 xl:px-20",
          )}
        >
          {/* ── Left: copy (slides stacked in one grid cell so height never jumps) ── */}
          <div className="min-w-0">
          <div className="grid">
            {slides.map((slide, i) => {
              const isActive = i === current
              const lines = splitTitle(slide.title)
              const mobileLines = splitMobileTitle(slide.title)
              const singleLineTitle = slide.title.trim().replace(/\s+/g, " ").toLowerCase() === "living with autism"
              return (
                <div
                  key={slide.id ?? i}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${total}: ${slide.title}`}
                  aria-hidden={!isActive}
                  inert={!isActive}
                  data-tts-carousel-slide={i}
                  data-tts-text={`${slide.title}. ${slide.subtitle}. ${getSlideActions(slide).primary.label}. ${getSlideActions(slide).secondary.label}.`}
                  className={cn(
                    "[grid-area:1/1] self-center transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none",
                    isActive ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
                  )}
                >
                  <div data-tts-highlight-target>
                    {/* Eyebrow with a narrow blue brush mark */}
                    <p className={cn(styles.eyebrow, "flex items-start gap-4 font-comic text-base leading-[1.4] text-[#445E7B] xl:text-[20px]")}>
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 8 40"
                        className={cn(styles.decor, "mt-0.5 h-[2.35rem] w-[7px] shrink-0")}
                      >
                        <path
                          d="M4.6 1.2C6.7 1.4 7.2 4 7 8.5c-.3 6.6.4 13 .1 19.6-.2 5.4-.5 10-3 10.7C1.6 39.4.9 35.6 1 30.5c.2-7.1-.4-14.2-.1-21.3C1.1 4.2 2 1 4.6 1.2Z"
                          fill="#3FABDE"
                        />
                      </svg>
                      <span className="max-w-[30rem]">{EYEBROW}</span>
                    </p>

                    <h1
                      className={cn(
                        styles.heading,
                        "mt-6 font-marissa text-[#063F5B]",
                        "text-[clamp(1.5rem,7.5vw,2.75rem)] sm:text-[3rem] lg:text-[clamp(2.5rem,4.1vw,4.25rem)]",
                        "leading-[1.12] [-webkit-text-stroke:0.7px_currentColor] lg:[-webkit-text-stroke:1px_currentColor]",
                      )}
                    >
                      {[
                        { lines: mobileLines, className: "block lg:hidden" },
                        { lines, className: "hidden lg:block" },
                      ].map((layout) => (
                      <span key={layout.className} className={layout.className}>
                      {layout.lines.map((line, li) => {
                        const isLast = li === layout.lines.length - 1 && layout.lines.length > 1
                        return (
                          <span key={li}>
                            {li > 0 && " "}
                            {isLast ? (
                              <span className={cn(styles.accent, "relative isolate inline-block text-[#3FABDE]", layout.lines === mobileLines && "whitespace-nowrap")}>
                                {line}
                                <HeroSparkle className="absolute -right-[0.55em] -top-[0.42em] hidden h-[0.8em] w-[0.8em] xl:block" />
                                {/* Hand-painted yellow underline. */}
                                <svg
                                  aria-hidden="true"
                                  focusable="false"
                                  viewBox="0 0 300 24"
                                  preserveAspectRatio="none"
                                  className={cn(styles.decor, "pointer-events-none absolute -bottom-[0.16em] left-0 -z-10 h-[0.18em] w-full")}
                                >
                                  <path
                                    d="M4 11.5C58 6.2 150 3.4 294 7.2c3.4.1 4.4 3.4 2.4 6-1.2 1.6-3.4 1.9-6 2-94 2.6-186 4.3-283 6.4-4.4.1-6.6-2.4-6.2-5.4.3-2.7 1.4-4.5 3-4.7Z"
                                    fill="#F7C52B"
                                    fillOpacity="0.9"
                                  />
                                </svg>
                              </span>
                            ) : (
                              <span className={cn(
                                singleLineTitle ? "inline" : "block",
                                layout.lines === mobileLines && "whitespace-nowrap",
                              )}>{line}</span>
                            )}
                          </span>
                        )
                      })}
                      </span>
                      ))}
                    </h1>

                    <p
                      className={cn(
                        styles.body,
                        "mt-6 font-comic text-[1.0625rem] text-[#445E7B] sm:text-[1.25rem]",
                        "leading-[1.45]",
                      )}
                    >
                      {slide.subtitle}
                    </p>

                    <HeroActions slide={slide} className="mt-7 hidden lg:flex" />
                  </div>
                </div>
              )
            })}
          </div>
          <HeroBenefits className="mt-6 hidden lg:grid" />
          </div>

          {/* ── Right: framed photograph + controls ── */}
          <div className="relative mx-auto w-full max-w-[780px] lg:mx-0 lg:justify-self-end">
            <div className="relative">
              {/* Separate translucent shapes give the white photo edge depth. */}
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 800 650"
                preserveAspectRatio="none"
                className={cn(styles.decor, "pointer-events-none absolute -left-[9%] -top-[4%] h-[108%] w-[117%]")}
              >
                <path d="M112 41C194-3 267 27 346 27 439 27 568-24 660 11c77 30 99 177 90 299-10 142-63 271-191 296-124 24-266 16-369-16C76 555 68 471 102 390c35-85 18-163-14-229C66 115 72 63 112 41Z" fill="#DFF3FF" />
                <path d="M647 244c129 5 175 99 147 199-27 100-168 194-290 182-102-10-84-88-20-175 38-53 67-209 163-206Z" fill="#EEE8FE" />
                <path d="M76 349c75-67 87-155 100-199 21-69 141-55 205 14 111 121 49 319-63 404C200 657 8 568 58 439c16-42 9-76 18-90Z" fill="#DFF3FF" fillOpacity=".65" />
                <path d="M30 113c44-52 107 40 78 91-19 33-80 10-97-32-11-26 1-42 19-59Z" fill="#EEF8FF" fillOpacity=".8" />
                <path d="M122 411c82 16 128 78 94 132-30 48-84 10-94-132Z" fill="#FFF0B5" />
              </svg>

              <HeroSparkle className="absolute -right-1 -top-7 h-11 w-11 sm:right-3 sm:-top-6 sm:h-14 sm:w-14" />
              <svg aria-hidden="true" focusable="false" viewBox="0 0 50 55" className={cn(styles.decor, "pointer-events-none absolute -left-[9%] top-[26%] hidden h-11 w-10 lg:block")}>
                <path d="M26 48C15 37-2 26 8 13c6-8 13-5 18 2 4-13 17-13 18-1 2 11-7 28-18 34Z" fill="none" stroke="#8551AB" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0">
                <defs>
                  <clipPath id={photoClipId} clipPathUnits="objectBoundingBox">
                    <path d="M.215 .065C.38 .042 .69-.025 .83 .01C.97 .045 1 .17 1 .4C1 .68 1 .83 .87 .92C.76 1 .49 1 .23 .992C.065 .987 .027 .91 .014 .74C.003 .59-.016 .35 .025 .23C.06 .124 .119 .08 .215 .065Z" />
                  </clipPath>
                </defs>
              </svg>
              {/* The same organic contour clips both the white rim and the photograph. */}
              <div
                className={cn(
                  styles.frame,
                  // Same 4:3 frame for every slide so the photo size never jumps between slides.
                  "aspect-[4/3]",
                  "relative isolate overflow-hidden bg-white p-[5px] [transform:translateZ(0)] sm:p-[7px]",
                )}
                style={{ clipPath: `url(#${photoClipId})` }}
              >
                <div className="relative h-full w-full overflow-hidden bg-[#E8F6FC]" style={{ clipPath: `url(#${photoClipId})` }}>
                {slides.map((slide, i) => (
                  <div
                    key={slide.id ?? i}
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
                      i === current ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <HomepageImage
                      src={normalizeHeroImage(slide.image)}
                      alt=""
                      fill
                      priority={i === 0}
                      sizes="(min-width: 1680px) 780px, (min-width: 1024px) 48vw, (min-width: 820px) 780px, calc(100vw - 40px)"
                      className={cn("object-cover", getHeroImagePositionClass(slide))}
                    />
                  </div>
                ))}
                </div>
              </div>

              {/* Desktop only: on smaller screens the photo is too narrow and the badge
                  covers faces (and crowds the accessibility launcher). */}
              <div className={cn(styles.storyCard, "absolute -right-12 top-[3%] hidden max-w-[240px] items-start gap-3 rounded-[24px] bg-white p-4 shadow-[0_8px_35px_rgba(52,112,150,0.06)] lg:flex xl:-right-16 xl:p-5")}>
                <span className={cn(styles.benefitIcon, "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF6DE] text-[#EDAC00] sm:h-14 sm:w-14")}>
                  <Star aria-hidden="true" className="h-5 w-5 fill-[#FFE28C] sm:h-8 sm:w-8" strokeWidth={1.8} />
                </span>
                <div className="font-comic">
                  <p className={cn(styles.body, "text-[12px] font-bold leading-[1.3] text-[#153E5A] sm:text-[17px]")}>Real Stories<br />Create Change</p>
                  <p className={cn(styles.muted, "mt-2 hidden text-[14px] leading-[1.35] text-[#6A7E9B] sm:block")}>Children. Families.<br />Stronger Communities.</p>
                </div>
              </div>

              {/* Purple fine-line arc */}
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className={cn(styles.decor, "pointer-events-none absolute -bottom-[1%] -right-[4%] h-[46%] w-[24%]")}
              >
                <path
                  d="M94 3C99 44 76 86 5 97"
                  fill="none"
                  stroke="#6F3E96"
                  strokeLinecap="round"
                  strokeWidth="2.4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <svg aria-hidden="true" focusable="false" viewBox="0 0 70 90" className={cn(styles.decor, "pointer-events-none absolute -bottom-[10%] -left-[4%] hidden h-20 w-16 lg:block")}>
                <g fill="#69C2F2">
                  <circle cx="24" cy="6" r="2.5" /><circle cx="6" cy="22" r="2" /><circle cx="28" cy="32" r="3" /><circle cx="50" cy="29" r="2.5" />
                  <circle cx="10" cy="44" r="2.5" /><circle cx="21" cy="57" r="3" /><circle cx="48" cy="51" r="2.5" /><circle cx="63" cy="60" r="2" />
                  <circle cx="42" cy="72" r="2.5" /><circle cx="33" cy="86" r="2.5" />
                </g>
              </svg>
            </div>

            {/* Carousel controls (not read aloud by the page reader) */}
            {total > 1 && (
              <div data-tts-ignore="" className="relative mt-4 flex w-full flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-4 xl:mt-3 xl:gap-6">
                <div className="flex min-w-0 max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  <p className={cn(styles.muted, "mr-2 whitespace-nowrap font-comic text-[17px] tabular-nums text-[#71819A] xl:text-[20px]")} aria-hidden="true">
                    {pad(current + 1)} / {pad(total)}
                  </p>
                  <div className="flex max-w-full flex-wrap items-center justify-center" role="group" aria-label="Choose slide">
                    {slides.map((slide, i) => (
                      <button
                        key={slide.id ?? i}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                        aria-current={i === current ? "true" : undefined}
                        className="group inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/40"
                      >
                        <span
                          className={cn(
                            styles.indicator,
                            "block h-[6px] rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none",
                            i === current
                              ? cn(styles.indicatorActive, "w-7 bg-[#3FABDE]")
                              : "w-5 bg-[#CFE7F4] group-hover:bg-[#9fd2ec]",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setPlayPref(isPlaying ? "paused" : "playing")}
                    aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
                    className={roundControl}
                  >
                    {isPlaying ? (
                      <Pause aria-hidden="true" className="h-4 w-4 fill-current" />
                    ) : (
                      <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                    )}
                  </button>
                  <button type="button" onClick={prev} aria-label="Previous slide" className={roundControl}>
                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={next} aria-label="Next slide" className={roundControl}>
                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            <HeroActions slide={slides[current]} className="mt-6 flex lg:hidden" />
            <HeroBenefits className="mt-6 lg:hidden" />
          </div>
        </div>

        {/* Live region for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Slide {current + 1} of {total}: {slides[current]?.title}
        </div>
      </section>

    </>
  )
}
