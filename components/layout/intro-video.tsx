"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Volume2, VolumeX, FastForward } from "lucide-react"
import { useAccessibility } from "@/lib/hooks/use-accessibility"
import {
  DEFAULT_INTRO_VIDEO_CONFIG,
  type IntroVideoConfig,
} from "@/lib/types/intro-video"
import styles from "./intro-video.module.css"

interface IntroVideoProps {
  /** Dynamic configuration loaded from site_settings */
  config?: IntroVideoConfig
}

/** Removes the pre-paint gate class from <html> */
function releaseIntroGate() {
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("intro-pending")
  }
}

export function IntroVideo({ config = DEFAULT_INTRO_VIDEO_CONFIG }: IntroVideoProps) {
  const pathname = usePathname()
  const { preferences } = useAccessibility()

  const [showIntro, setShowIntro] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [animateLogo, setAnimateLogo] = useState(false)
  const [fadeBackground, setFadeBackground] = useState(false)
  const [logoStyle, setLogoStyle] = useState<React.CSSProperties>({})
  const [isMuted, setIsMuted] = useState(config.behavior.mutedByDefault)
  const [canShowSkip, setCanShowSkip] = useState(config.behavior.skipDelaySeconds === 0)
  const [isMobile, setIsMobile] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasDismissedRef = useRef(false)

  // Track viewport mode
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Complete cleanup and dismiss
  const dismissIntro = useCallback(() => {
    if (hasDismissedRef.current) return
    hasDismissedRef.current = true

    if (videoRef.current) {
      videoRef.current.pause()
    }

    // Persist frequency tracking
    try {
      const now = Date.now().toString()
      localStorage.setItem("introShown", "true")
      localStorage.setItem("introLastShown", now)
      sessionStorage.setItem("introSessionShown", "true")
      localStorage.setItem("introEverShown", "true")
    } catch {
      // Storage access blocked / incognito safeguard
    }

    releaseIntroGate()
    setShowIntro(false)
    window.dispatchEvent(new CustomEvent("intro-animation-complete"))
  }, [])

  // Check eligibility on mount
  useEffect(() => {
    // If master switch disabled, bypass immediately
    if (!config.enabled) {
      releaseIntroGate()
      window.dispatchEvent(new CustomEvent("intro-animation-complete"))
      return
    }

    // Skip on demo routes
    if (pathname?.startsWith("/demo")) {
      releaseIntroGate()
      return
    }

    // If restricted to homepage only
    if (config.behavior.homepageOnly && pathname !== "/") {
      releaseIntroGate()
      window.dispatchEvent(new CustomEvent("intro-animation-complete"))
      return
    }

    // Accessibility check: Skip intro if user prefers reduced motion or sensory-friendly mode
    if (preferences.reduceMotion || preferences.sensoryFriendly) {
      releaseIntroGate()
      window.dispatchEvent(new CustomEvent("intro-animation-complete"))
      return
    }

    // Frequency evaluation
    try {
      const { frequency, cooldownMinutes } = config.behavior
      if (frequency === "every_visit") {
        setShowIntro(true)
        return
      }

      if (frequency === "session") {
        const sessionShown = sessionStorage.getItem("introSessionShown")
        if (sessionShown) {
          releaseIntroGate()
          window.dispatchEvent(new CustomEvent("intro-animation-complete"))
          return
        }
        setShowIntro(true)
        return
      }

      if (frequency === "once_ever") {
        const everShown = localStorage.getItem("introEverShown")
        if (everShown) {
          releaseIntroGate()
          window.dispatchEvent(new CustomEvent("intro-animation-complete"))
          return
        }
        setShowIntro(true)
        return
      }

      // Default: cooldown period
      const lastShown = localStorage.getItem("introLastShown")
      const now = Date.now()
      const cooldownMs = (cooldownMinutes || 30) * 60 * 1000

      if (!lastShown || now - parseInt(lastShown, 10) > cooldownMs) {
        setShowIntro(true)
      } else {
        releaseIntroGate()
        window.dispatchEvent(new CustomEvent("intro-animation-complete"))
      }
    } catch {
      // Fallback
      setShowIntro(true)
    }
  }, [pathname, preferences.reduceMotion, preferences.sensoryFriendly, config])

  // Skip delay timer
  useEffect(() => {
    if (!showIntro || config.behavior.skipDelaySeconds === 0) return
    const timer = setTimeout(() => {
      setCanShowSkip(true)
    }, config.behavior.skipDelaySeconds * 1000)
    return () => clearTimeout(timer)
  }, [showIntro, config.behavior.skipDelaySeconds])

  // Keyboard accessibility: Escape key skips intro
  useEffect(() => {
    if (!showIntro) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        dismissIntro()
        // Focus main landmark for keyboard navigation
        const main = document.getElementById("main-content")
        main?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showIntro, dismissIntro])

  // Failsafe timer: release gate if video fails to start within 3.5s
  useEffect(() => {
    if (!showIntro) return
    const failsafe = setTimeout(() => {
      if (videoRef.current && videoRef.current.currentTime === 0) {
        console.warn("Intro video playback stalled; auto-releasing gate.")
        dismissIntro()
      }
    }, 3500)
    return () => clearTimeout(failsafe)
  }, [showIntro, dismissIntro])

  // Autoplay handler
  useEffect(() => {
    if (showIntro && videoRef.current) {
      const video = videoRef.current
      video.muted = isMuted

      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name === "AbortError") {
            setTimeout(() => video.play().catch(() => {}), 150)
          } else if (err.name === "NotAllowedError") {
            // If sound was enabled and autoplay was blocked, fallback to muted autoplay
            video.muted = true
            setIsMuted(true)
            video.play().catch(() => {})
          }
        })
      }
    }
  }, [showIntro, isMuted])

  // Sound toggle handler
  const toggleSound = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted
      videoRef.current.muted = nextMuted
      setIsMuted(nextMuted)
    }
  }

  // Handle Outro & Flying Logo Effect
  const handleVideoEnd = () => {
    setVideoEnded(true)
    releaseIntroGate()

    // If flying logo transition is disabled or user prefers reduced motion
    if (!config.transition.enableLogoFlyTransition || preferences.reduceMotion || preferences.sensoryFriendly) {
      setFadeBackground(true)
      window.dispatchEvent(new CustomEvent("intro-animation-complete"))
      setTimeout(dismissIntro, 600)
      return
    }

    // Measure target navbar logo position
    requestAnimationFrame(() => {
      const navbarTarget =
        (document.querySelector("[data-navbar-logo-target]") as HTMLElement) ||
        (document.querySelector("[data-navbar-logo]") as HTMLElement)
      const navbarImg = navbarTarget?.querySelector("img") as HTMLImageElement

      if (navbarTarget && logoRef.current) {
        const targetRect = navbarImg?.getBoundingClientRect() || navbarTarget.getBoundingClientRect()
        const logoRect = logoRef.current.getBoundingClientRect()

        // Calculate optical centers
        const targetCenterX = targetRect.left + targetRect.width / 2
        const targetCenterY = targetRect.top + targetRect.height / 2
        const logoCenterX = logoRect.left + logoRect.width / 2
        const logoCenterY = logoRect.top + logoRect.height / 2

        const deltaX = targetCenterX - logoCenterX
        const deltaY = targetCenterY - logoCenterY

        // Dimension scale
        const scaleX = (targetRect.width || 48) / (logoRect.width || 240)
        const scaleY = (targetRect.height || 48) / (logoRect.height || 240)
        const scale = Math.min(scaleX, scaleY)

        setLogoStyle({
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`,
        })

        // Notify navbar to hide its stationary logo
        window.dispatchEvent(new CustomEvent("intro-logo-flying"))
        setAnimateLogo(true)

        const flightDuration = 1800
        setTimeout(() => {
          setFadeBackground(true)
          // Navbar reveals its stationary logo
          window.dispatchEvent(new CustomEvent("intro-logo-landed"))
          // Notify subsequent modals / hero animations
          window.dispatchEvent(new CustomEvent("intro-animation-complete"))

          setTimeout(dismissIntro, config.transition.fadeDurationMs || 1000)
        }, flightDuration)
      } else {
        // Fallback if navbar target not found
        setFadeBackground(true)
        window.dispatchEvent(new CustomEvent("intro-animation-complete"))
        setTimeout(dismissIntro, 800)
      }
    })
  }

  // Handle video error (graceful fallback)
  const handleVideoError = () => {
    console.error("Intro video failed to load or decode.")
    dismissIntro()
  }

  // Always ensure cleanup
  useEffect(() => releaseIntroGate, [])

  if (!showIntro) return null

  const logoSource = config.transition.logoUrl || "/logo.png"
  const activePoster = isMobile
    ? config.media.mobilePosterUrl || config.media.desktopPosterUrl
    : config.media.desktopPosterUrl

  return (
    <div
      ref={containerRef}
      data-intro-video=""
      className={`${styles.overlay} ${fadeBackground ? styles.overlayHidden : ""}`}
      style={{ "--fade-duration": `${config.transition.fadeDurationMs || 1000}ms` } as React.CSSProperties}
      aria-label="Website intro video presentation"
      role="region"
    >
      {/* Top Controls: Audio Unmute Button */}
      {!videoEnded && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            onTouchEnd={toggleSound}
            className={styles.controlButton}
            aria-label={isMuted ? "Unmute intro video audio" : "Mute intro video audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4" aria-hidden="true" />
                <span>Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-green-400" aria-hidden="true" />
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Bottom Controls: Accessible Skip Button */}
      {config.behavior.allowSkip && canShowSkip && !videoEnded && (
        <div className="absolute bottom-6 right-6 z-20">
          <button
            type="button"
            onClick={dismissIntro}
            onTouchEnd={dismissIntro}
            className={styles.controlButton}
            aria-label="Skip intro video and go to homepage"
          >
            <span>Skip</span>
            <FastForward className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Video Surface */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-700 ease-out ${
          animateLogo ? "opacity-0" : "opacity-100"
        }`}
      >
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted={isMuted}
          preload="auto"
          poster={activePoster}
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
          onError={handleVideoError}
        >
          {/* Mobile vertical source for phones (<768px) */}
          {config.media.mobileVideoUrl && (
            <source src={config.media.mobileVideoUrl} media="(max-width: 767px)" type="video/mp4" />
          )}

          {/* Desktop widescreen source */}
          {config.media.desktopVideoUrl && (
            <source src={config.media.desktopVideoUrl} media="(min-width: 768px)" type="video/mp4" />
          )}

          {/* Fallback source */}
          <source src={config.media.desktopVideoUrl} type="video/mp4" />
          <track kind="captions" src="/captions/intro.vtt" srcLang="en" label="English" default />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Flying Logo Outro Surface */}
      {videoEnded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            ref={logoRef}
            className={styles.flyingLogo}
            style={animateLogo ? logoStyle : { transform: "none" }}
          >
            <Image
              src={logoSource}
              alt="deessa Foundation"
              width={400}
              height={400}
              className="object-contain drop-shadow-2xl max-w-[280px] max-h-[280px] sm:max-w-[400px] sm:max-h-[400px]"
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}
