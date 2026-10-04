"use client"

import React, { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccessibility, useOptionalAccessibility } from "@/lib/hooks/use-accessibility"

interface Testimonial {
  quote: string
  name: string
  designation: string
  src: string
  video?: string
  topic?: string
  caption?: string
}

interface Colors {
  name?: string
  designation?: string
  testimony?: string
  arrowBackground?: string
  arrowForeground?: string
  arrowHoverBackground?: string
}

interface FontSizes {
  name?: string
  designation?: string
  quote?: string
}

interface CircularTestimonialsProps {
  testimonials: Testimonial[]
  autoplay?: boolean
  colors?: Colors
  fontSizes?: FontSizes
  nameTextStroke?: string
  /** When false, hides the name/quote column and shows just the photo carousel. Defaults to true. */
  showContent?: boolean
  /** Height of the image stack. Defaults to "24rem". */
  imageHeight?: string
  /** Automatically start the active video once the section enters the viewport. */
  videoAutoplay?: boolean
}

function calculateGap(width: number) {
  const minWidth = 1024
  const maxWidth = 1456
  const minGap = 60
  const maxGap = 86
  if (width <= minWidth) return minGap
  if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth))
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
}

export const CircularTestimonials = ({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
  nameTextStroke,
  showContent = true,
  imageHeight = "24rem",
  videoAutoplay = true,
}: CircularTestimonialsProps) => {
  // While the screen reader (TTS) is reading, the testimonial video must stay
  // silent so it never talks over the spoken text. Read the shared TTS status;
  // the hook is optional so the carousel still works outside the provider.
  const accessibility = useOptionalAccessibility()
  const ttsStatus = accessibility?.status
  const isTtsActive =
    ttsStatus === "loading" || ttsStatus === "translating" || ttsStatus === "speaking" || ttsStatus === "paused"

  const { preferences } = useAccessibility()

  // Color & font config
  const colorName = colors.name ?? "#000"
  const colorDesignation = colors.designation ?? "#6b7280"
  const colorTestimony = colors.testimony ?? "#4b5563"
  const colorArrowBg = colors.arrowBackground ?? "#141414"
  const colorArrowFg = colors.arrowForeground ?? "#f1f1f7"
  const colorArrowHoverBg = colors.arrowHoverBackground ?? "#00a6fb"
  const fontSizeName = fontSizes.name ?? "1.5rem"
  const fontSizeDesignation = fontSizes.designation ?? "0.925rem"
  const fontSizeQuote = fontSizes.quote ?? "1.125rem"

  // State
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverPrev, setHoverPrev] = useState(false)
  const [hoverNext, setHoverNext] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)
  const [isReady, setIsReady] = useState(false)
  const [isInViewport, setIsInViewport] = useState(false)
  const testimonialContainerRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({})
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const resumeAutoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const testimonialsLength = useMemo(() => testimonials.length, [testimonials])
  const activeTestimonial = useMemo(() => testimonials[activeIndex], [activeIndex, testimonials])

  // Responsive gap calculation
  useLayoutEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth)
      }
    }
    const animationFrame = window.requestAnimationFrame(() => {
      handleResize()
      setIsReady(true)
    })
    window.addEventListener("resize", handleResize)
    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Wait to start the active video until this section is actually visible.
  useEffect(() => {
    const container = testimonialContainerRef.current
    if (!container) return

    const observer = new IntersectionObserver(([entry]) => setIsInViewport(entry.isIntersecting), { threshold: 0.45 })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Autoplay
  const startAutoplay = useCallback(() => {
    // Skip autoplay if accessibility preferences are enabled
    if (!autoplay || testimonialsLength === 0 || preferences.reduceMotion || preferences.sensoryFriendly) {
      return
    }

    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current)
    }

    autoplayIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialsLength)
    }, 5000)
  }, [autoplay, testimonialsLength, preferences.reduceMotion, preferences.sensoryFriendly])

  const pauseAutoplayTemporarily = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current)
      autoplayIntervalRef.current = null
    }

    if (resumeAutoplayTimeoutRef.current) {
      clearTimeout(resumeAutoplayTimeoutRef.current)
      resumeAutoplayTimeoutRef.current = null
    }

    // Skip resume if accessibility preferences are enabled
    if (!autoplay || testimonialsLength === 0 || preferences.reduceMotion || preferences.sensoryFriendly) {
      return
    }

    resumeAutoplayTimeoutRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialsLength)
      startAutoplay()
    }, 5000)
  }, [autoplay, testimonialsLength, startAutoplay, preferences.reduceMotion, preferences.sensoryFriendly])

  useEffect(() => {
    startAutoplay()
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
      if (resumeAutoplayTimeoutRef.current) clearTimeout(resumeAutoplayTimeoutRef.current)
    }
  }, [startAutoplay])

  // Keep testimonial videos mutually exclusive. This also stops a video when
  // carousel autoplay moves to the next speaker.
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (video && Number(index) !== activeIndex && !video.paused) {
        video.pause()
      }
    })
  }, [activeIndex])

  // Start the active speaker video only when this section is in view. Audio is
  // explicitly enabled, and every other video remains paused. While TTS is
  // reading, autoplay is suppressed and any playing video is paused so speech
  // is the only audio source.
  useEffect(() => {
    if (!isInViewport || isTtsActive) {
      Object.values(videoRefs.current).forEach((video) => video?.pause())
      return
    }

    if (!videoAutoplay) return

    const activeVideo = videoRefs.current[activeIndex]
    if (!activeVideo) return

    activeVideo.muted = false
    const playPromise = activeVideo.play()
    playPromise?.catch(() => undefined)
  }, [activeIndex, isInViewport, videoAutoplay, isTtsActive])

  // Navigation handlers
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength)
    pauseAutoplayTemporarily()
  }, [testimonialsLength, pauseAutoplayTemporarily])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength)
    pauseAutoplayTemporarily()
  }, [testimonialsLength, pauseAutoplayTemporarily])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleNext, handlePrev])

  // Compute transforms for each image (always show 3: left, center, right)
  function getImageStyle(index: number): React.CSSProperties {
    if (!isReady) {
      return {
        opacity: 0,
        pointerEvents: "none",
        transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)",
        transition: "none",
      }
    }

    const gap = calculateGap(containerWidth)
    const maxStickUp = gap * 0.8
    const isActive = index === activeIndex
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index
    const isRight = (activeIndex + 1) % testimonialsLength === index

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(0px) translateY(0px) scale(1) rotateY(0deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      }
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      }
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      }
    }
    // Hide all other images
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    }
  }

  // Framer Motion variants for quote
  const quoteVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div className="testimonial-container" ref={testimonialContainerRef}>
      <div className={"testimonial-grid" + (showContent ? "" : " photo-only")}>
        {/* Images */}
        <div className="image-container" ref={imageContainerRef} style={{ height: imageHeight }}>
          {testimonials.map((testimonial, index) => {
            const isActive = index === activeIndex
            const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index
            const isRight = (activeIndex + 1) % testimonialsLength === index

            return testimonial.video ? (
              <video
                key={index}
                src={testimonial.video}
                poster={testimonial.src || undefined}
                aria-label={`${testimonial.name}'s video message`}
                className="testimonial-media"
                data-index={index}
                ref={(video) => {
                  videoRefs.current[index] = video
                }}
                controls={isActive}
                playsInline
                preload="metadata"
                style={{
                  ...getImageStyle(index),
                  cursor: isLeft || isRight ? "pointer" : "default",
                }}
                onClick={() => {
                  if (isLeft) handlePrev()
                  if (isRight) handleNext()
                }}
                onPlay={() => {
                  setActiveIndex(index)
                  Object.entries(videoRefs.current).forEach(([otherIndex, otherVideo]) => {
                    if (otherVideo && Number(otherIndex) !== index && !otherVideo.paused) {
                      otherVideo.pause()
                    }
                  })
                }}
              />
            ) : (
              <img
                key={index}
                src={testimonial.src}
                alt={testimonial.name}
                className="testimonial-media"
                data-index={index}
                style={{
                  ...getImageStyle(index),
                  cursor: isLeft || isRight ? "pointer" : "default",
                }}
                loading="eager"
                width={400}
                height={400}
                onClick={() => {
                  if (isLeft) handlePrev()
                  if (isRight) handleNext()
                }}
              />
            )
          })}

          {/* Arrow Buttons Overlay */}
          <div className="image-arrows">
            <button
              className="image-arrow-button prev"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              style={{
                backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
            >
              <ChevronLeft size={24} color={colorArrowFg} />
            </button>
            <button
              className="image-arrow-button next"
              onClick={handleNext}
              aria-label="Next testimonial"
              style={{
                backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
            >
              <ChevronRight size={24} color={colorArrowFg} />
            </button>
          </div>
        </div>

        {/* Content */}
        {showContent && (
          <div className="testimonial-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                variants={quoteVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {activeTestimonial.topic && (
                  <p className="topic" style={{ color: colorDesignation }}>
                    {activeTestimonial.topic}
                  </p>
                )}
                <h3
                  className="name"
                  style={{ color: colorName, fontSize: fontSizeName, WebkitTextStroke: nameTextStroke }}
                >
                  {activeTestimonial.name}
                </h3>
                <p className="designation" style={{ color: colorDesignation, fontSize: fontSizeDesignation }}>
                  {activeTestimonial.designation}
                </p>
                <motion.p className="quote" style={{ color: colorTestimony, fontSize: fontSizeQuote }}>
                  {(activeTestimonial.caption || activeTestimonial.quote).split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{
                        filter: "blur(10px)",
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        filter: "blur(0px)",
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.22,
                        ease: "easeInOut",
                        delay: 0.025 * i,
                      }}
                      style={{ display: "inline-block" }}
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </motion.p>
              </motion.div>
            </AnimatePresence>

          </div>
        )}
      </div>

      <style jsx>{`
        .testimonial-container {
          width: 100%;
          max-width: 56rem;
          padding: 2rem;
        }
        .testimonial-grid {
          display: grid;
          gap: 5rem;
        }
        .image-container {
          position: relative;
          width: 100%;
          height: 24rem;
          perspective: 1000px;
        }
        .image-arrows {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 1rem;
          pointer-events: none;
          z-index: 10;
        }
        .image-arrow-button {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          pointer-events: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .image-arrow-button:hover {
          transform: scale(1.1);
        }
        .image-arrow-button:active {
          transform: scale(0.95);
        }
        .testimonial-media {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          will-change: transform, opacity;
          backface-visibility: hidden;
          background: #0f172a;
        }
        @media (min-width: 768px) {
          video.testimonial-media:fullscreen,
          video.testimonial-media:-webkit-full-screen {
            width: 100vw;
            height: 100vh;
            object-fit: contain;
            border-radius: 0;
            box-shadow: none;
            background: #000;
          }
        }
        .topic {
          margin: 0 0 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .testimonial-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .name {
          font-weight: bold;
          margin-bottom: 0.25rem;
        }
        .designation {
          margin-bottom: 2rem;
        }
        .quote {
          line-height: 1.75;
        }
        .word {
          display: inline-block;
        }
        @media (min-width: 768px) {
          .testimonial-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .testimonial-grid.photo-only {
          grid-template-columns: 1fr;
        }
        @media (max-width: 640px) {
          .testimonial-container {
            padding: 1rem;
          }
          .image-container {
            height: 16rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default CircularTestimonials
