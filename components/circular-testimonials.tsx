"use client"

import React, { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  /** When false, hides the name/quote column and shows just the photo carousel. Defaults to true. */
  showContent?: boolean
  /** Height of the image stack. Defaults to "24rem". */
  imageHeight?: string
  /** Automatically start the active video. Audible autoplay may be blocked by the browser. */
  videoAutoplay?: boolean
}

function calculateGap(width: number) {
  const minWidth = 1024
  const maxWidth = 1456
  const minGap = 60
  const maxGap = 86
  if (width <= minWidth) return minGap
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth))
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
}

export const CircularTestimonials = ({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
  showContent = true,
  imageHeight = "24rem",
  videoAutoplay = true,
}: CircularTestimonialsProps) => {
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
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({})
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const resumeAutoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const testimonialsLength = useMemo(() => testimonials.length, [testimonials])
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials]
  )

  // Responsive gap calculation
  useLayoutEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth)
      }
    }
    handleResize()
    setIsReady(true)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Autoplay
  const startAutoplay = useCallback(() => {
    if (!autoplay || testimonialsLength === 0) {
      return
    }

    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current)
    }

    autoplayIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialsLength)
    }, 5000)
  }, [autoplay, testimonialsLength])

  const pauseAutoplayTemporarily = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current)
      autoplayIntervalRef.current = null
    }

    if (resumeAutoplayTimeoutRef.current) {
      clearTimeout(resumeAutoplayTimeoutRef.current)
      resumeAutoplayTimeoutRef.current = null
    }

    if (!autoplay || testimonialsLength === 0) {
      return
    }

    resumeAutoplayTimeoutRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialsLength)
      startAutoplay()
    }, 5000)
  }, [autoplay, testimonialsLength, startAutoplay])

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

  // Start the active speaker video. Browsers may reject autoplay with sound;
  // in that case, fall back to muted playback so the video still starts.
  useEffect(() => {
    if (!videoAutoplay) return

    const activeVideo = videoRefs.current[activeIndex]
    if (!activeVideo) return

    activeVideo.muted = false
    const playPromise = activeVideo.play()
    playPromise?.catch(() => {
      activeVideo.muted = true
      activeVideo.play().catch(() => undefined)
    })
  }, [activeIndex, videoAutoplay])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
    // eslint-disable-next-line
  }, [activeIndex, testimonialsLength])

  // Navigation handlers
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength)
    pauseAutoplayTemporarily()
  }, [testimonialsLength, pauseAutoplayTemporarily])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength)
    pauseAutoplayTemporarily()
  }, [testimonialsLength, pauseAutoplayTemporarily])

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
    <div className="testimonial-container">
      <div className={"testimonial-grid" + (showContent ? "" : " photo-only")}>
        {/* Images */}
        <div className="image-container" ref={imageContainerRef} style={{ height: imageHeight }}>
          {testimonials.map((testimonial, index) => {
            const isActive = index === activeIndex
            const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index
            const isRight = (activeIndex + 1) % testimonialsLength === index
            
            return (
              testimonial.video ? (
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
                  autoPlay={videoAutoplay && isActive}
                  muted={false}
                  playsInline
                  preload="metadata"
                  style={{
                    ...getImageStyle(index),
                    cursor: (isLeft || isRight) ? 'pointer' : 'default',
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
                    cursor: (isLeft || isRight) ? 'pointer' : 'default',
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
                style={{ color: colorName, fontSize: fontSizeName }}
              >
                {activeTestimonial.name}
              </h3>
              <p
                className="designation"
                style={{ color: colorDesignation, fontSize: fontSizeDesignation }}
              >
                {activeTestimonial.designation}
              </p>
              <motion.p
                className="quote"
                style={{ color: colorTestimony, fontSize: fontSizeQuote }}
              >
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

          <div className="arrow-buttons">
            <button
              className="arrow-button prev-button"
              onClick={handlePrev}
              style={{
                backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={28} color={colorArrowFg} />
            </button>
            <button
              className="arrow-button next-button"
              onClick={handleNext}
              style={{
                backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Next testimonial"
            >
              <ChevronRight size={28} color={colorArrowFg} />
            </button>
          </div>
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
          object-fit: cover;
          background: #0f172a;
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
        .arrow-buttons {
          display: flex;
          gap: 1.5rem;
          padding-top: 3rem;
        }
        .arrow-button {
          width: 2.7rem;
          height: 2.7rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s;
          border: none;
        }
        .word {
          display: inline-block;
        }
        @media (min-width: 768px) {
          .testimonial-grid {
            grid-template-columns: 1fr 1fr;
          }
          .arrow-buttons {
            padding-top: 0;
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
