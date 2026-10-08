"use client"

import { useId, useState, useSyncExternalStore, type CSSProperties } from "react"
import Image from "next/image"
import { ArrowRight, Compass, Copy, House, LockKeyhole, RefreshCw, WifiOff, Wrench, MessageCircle, Heart, Star, Users, BookOpen, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import styles from "./error-page.module.css"
import { PuzzleNotFound } from "./puzzle-not-found"

export type ErrorVariant = "not-found" | "server" | "generic" | "network" | "unauthorized" | "closed"
const actionLayout = "inline-flex min-h-12 max-w-full items-center justify-center gap-2.5 rounded-full border-2 px-5 py-3 text-center font-bold leading-snug whitespace-normal"

const content = {
  "not-found": {
    code: "404", label: "Page not found", title: "We couldn’t find that page.",
    message: "A missing page shouldn’t stop a connection. The link may have changed—let’s find the information or support you need.",
    image: "girl-not-found.webp", caption: "Let’s find the information you need.", icon: Compass,
  },
  server: {
    code: "500", label: "Website unavailable", title: "Something isn’t working.",
    message: "We couldn’t load the website right now. Please try again in a moment, or return to the homepage.",
    image: "girl-server-error.webp", caption: "A little patience. Then another try.", icon: Wrench,
  },
  generic: {
    code: "Oops", label: "Something went wrong", title: "We couldn’t load this page.",
    message: "Something unexpected interrupted this page. Please try again, or choose another place to continue.",
    image: "girl-server-error.webp", caption: "A little patience. Then another try.", icon: Wrench,
  },
  network: {
    code: "Offline", label: "Connection interrupted", title: "Let’s reconnect.",
    message: "We couldn’t connect to the website. Check your connection and try again when you’re ready.",
    image: "girl-connection-error.webp", caption: "We’re here when you reconnect.", icon: WifiOff,
  },
  unauthorized: {
    code: "403", label: "Access restricted", title: "This space needs permission.",
    message: "This page is reserved for authorized team members. Sign in with an account that has access, or return to the homepage.",
    image: null, caption: "A little permission opens the conversation.", icon: LockKeyhole,
  },
  closed: {
    code: "Closed", label: "Registration closed", title: "Registration is closed.",
    message: "Registration for this event is currently closed. Browse other events, or get in touch with the organizer for help.",
    image: "girl-not-found.webp", caption: "More chances to connect are coming.", icon: Compass,
  },
} as const

function subscribeToConnection(callback: () => void) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

export function useIsOffline() {
  return useSyncExternalStore(subscribeToConnection, () => !navigator.onLine, () => false)
}

export interface ErrorPageProps {
  variant?: ErrorVariant
  title?: string
  message?: string
  error?: Error & { digest?: string }
  onRetry?: () => void
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
  showPrimary?: boolean
  showSecondary?: boolean
  standalone?: boolean
  preview?: boolean
}

export function ErrorPage({
  variant = "not-found", title, message, error, onRetry, primaryHref, primaryLabel,
  secondaryHref, secondaryLabel, showPrimary = true, showSecondary = true, standalone = false, preview = false,
}: ErrorPageProps) {
  const state = content[variant]
  const Icon = state.icon
  const headingId = useId()
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const [paused, setPaused] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const retries = variant === "generic" || variant === "server" || variant === "network"
  const firstHref = primaryHref ?? (variant === "unauthorized" ? "/admin/login" : "/")
  const firstLabel = primaryLabel ?? (variant === "unauthorized" ? "Team sign in" : "Back to home")
  const secondHref = secondaryHref ?? (variant === "not-found" ? "/whatwedo" : "/")
  const secondLabel = secondaryLabel ?? (variant === "not-found" ? "Explore our programs" : "Back to home")
  const Heading = preview ? "h2" : "h1"
  const Main = preview ? "div" : "main"

  function retry() {
    setFeedback("Trying to reconnect and load the page…")
    try {
      if (onRetry) onRetry()
      else window.location.reload()
    } catch {
      setFeedback("We still couldn’t load the page. Please try again in a moment.")
    }
  }

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(`deessa Foundation — ${state.label}\nReference: ${error?.digest}`)
      setFeedback("Support reference copied.")
    } catch {
      setFeedback("Couldn’t copy the reference. You can select and copy the text below.")
    }
  }

  if (variant === "not-found" && !title && !message && !primaryHref && !secondaryHref && showPrimary && showSecondary) {
    return <PuzzleNotFound preview={preview} standalone={standalone} />
  }

  const screen = (
    <section aria-labelledby={headingId} data-paused={paused} className={cn(styles.page, "relative px-5 py-10 sm:px-8 sm:py-14")}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className={cn(styles.copy, "relative min-w-0")}>
            <p className={cn(styles.eyebrow, "mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold")}>
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {state.label}
            </p>
            <Heading id={headingId} className={cn(styles.title, "max-w-xl text-balance text-4xl leading-tight sm:text-5xl")}>
              {title ?? state.title}
            </Heading>
            <p className={cn(styles.message, "mt-5 max-w-lg text-base leading-relaxed sm:text-lg")}>
              {message ?? state.message}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {showPrimary && (retries ? (
                <button type="button" data-error-action="primary" className={cn(styles.action, actionLayout)} onClick={retry}>
                  <RefreshCw aria-hidden="true" className="size-4 shrink-0" /> Try again
                </button>
              ) : (
                <a href={firstHref} data-error-action="primary" className={cn(styles.action, actionLayout)}>
                  {variant === "unauthorized" ? <LockKeyhole aria-hidden="true" className="size-4 shrink-0" /> : <House aria-hidden="true" className="size-4 shrink-0" />}
                  {firstLabel}
                </a>
              ))}
              {showSecondary && (
                <a href={secondHref} data-error-action="secondary" className={cn(styles.action, actionLayout)}>
                  {secondLabel}<ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                </a>
              )}
            </div>
            <p role="status" aria-live="polite" className={cn(styles.feedback, "mt-3 text-sm")}>{feedback}</p>
            {error?.digest && (
              <details className={cn(styles.reference, "mt-5 text-sm")}>
                <summary className="cursor-pointer py-3 font-bold">Support reference</summary>
                <p className="mb-2 leading-relaxed">If you contact us, include this reference so we can look into the issue.</p>
                <code className="block break-all">{error.digest}</code>
                <button type="button" className={cn(styles.textLink, "mt-3 inline-flex min-h-11 items-center gap-2")} onClick={copyReference}>
                  <Copy aria-hidden="true" className="size-4" />Copy reference
                </button>
              </details>
            )}
          </div>
          <div className="relative min-w-0">
          <div aria-hidden="true" className={cn(styles.art, "relative mx-auto w-full max-w-lg")}
            onPointerMove={(event) => {
              if (event.pointerType !== "mouse" || paused) return
              const rect = event.currentTarget.getBoundingClientRect()
              setTilt({ x: (event.clientX - rect.left) / rect.width - 0.5, y: (event.clientY - rect.top) / rect.height - 0.5 })
            }} onPointerLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ "--art-x": `${tilt.x * 12}px`, "--art-y": `${tilt.y * 12}px` } as CSSProperties}>
            <div className={cn(styles.artSurface, "absolute inset-4 rounded-[3rem]")} />
            <p className={cn(styles.code, "absolute -left-3 -top-6 z-20 rounded-2xl px-5 py-3 leading-none")}>
              {[...state.code].map((letter, index) => <span key={index}>{letter}</span>)}
            </p>
            <span className={cn(styles.orbit, styles.orbitOne, "absolute left-0 top-1/3 z-20 flex size-14 items-center justify-center rounded-2xl")}><MessageCircle className="size-7" /></span>
            <span className={cn(styles.orbit, styles.orbitTwo, "absolute right-2 top-10 z-20 flex size-12 items-center justify-center rounded-full")}><Star className="size-6" /></span>
            <span className={cn(styles.orbit, styles.orbitThree, "absolute bottom-12 right-0 z-20 flex size-14 items-center justify-center rounded-2xl")}><Heart className="size-7" /></span>
            {state.image && failedImage !== state.image ? (
              <Image key={state.image} src={`/errors/${state.image}`} alt="" width={768} height={768} unoptimized loading="eager"
                className={cn(styles.illustration, "relative z-10 h-auto w-full rounded-[2rem] object-cover")} onError={() => setFailedImage(state.image)} />
            ) : (
              <div className="relative flex aspect-square items-center justify-center">
                <Icon className={cn(styles.artIcon, "size-28 sm:size-36")} strokeWidth={1} />
              </div>
            )}
            <p className={cn(styles.caption, "relative z-20 mx-auto -mt-6 w-fit max-w-full rounded-full border px-5 py-3 text-center text-base")}><span>{state.caption}</span></p>
          </div>
          <button type="button" aria-pressed={paused} className={cn(styles.motionControl, "mx-auto mt-5 flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-bold")} onClick={() => {setPaused(!paused); setTilt({x:0,y:0})}}>
            {paused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}{paused ? "Resume animation" : "Pause animation"}
          </button>
          </div>
        </div>
        <div className={cn(styles.help, "mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm")}>
          <p>Need a hand? <a className={cn(styles.textLink, "inline-flex min-h-11 items-center")} href={variant === "network" ? "mailto:deessa.social@gmail.com" : "/contact"}>Get in touch</a></p>
          {variant === "not-found" && <span className={cn(styles.belonging, "inline-flex items-center gap-2 font-bold")}><Heart aria-hidden="true" className="size-4" />Every voice matters. Everyone belongs.</span>}
          {variant === "network" && <p className="max-w-md">You may need to reconnect before opening another page.</p>}
        </div>
        {(variant === "not-found" || variant === "closed") && <nav aria-label="Helpful places to continue" className="mt-6 grid gap-3 sm:grid-cols-3">
          {[{ href: "/whatwedo", label: "Our programs", text: "Support, learning & inclusion", icon: BookOpen },
            { href: "/about", label: "Meet deessa", text: "People behind the purpose", icon: Users },
            { href: "/events", label: "Join a conversation", text: "Events that bring us together", icon: MessageCircle }].map((item) => {
              const CardIcon = item.icon
              return <a key={item.href} href={item.href} className={cn(styles.resource, "flex min-w-0 items-center gap-3 rounded-2xl border p-4")}>
                <span className={cn(styles.resourceIcon, "flex size-11 shrink-0 items-center justify-center rounded-xl")}><CardIcon aria-hidden="true" className="size-5" /></span>
                <span className="min-w-0 flex-1"><strong className="block">{item.label}</strong><span className={cn(styles.resourceText, "mt-1 block text-sm")}>{item.text}</span></span>
                <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
              </a>
            })}
        </nav>}
      </div>
    </section>
  )

  if (!standalone) return screen

  return (
    <div className={cn(styles.shell, "flex flex-col", !preview && "min-h-svh")}>
      {!preview && <a href="#error-main-content" className={styles.skip}>Skip to main content</a>}
      <header className={cn(styles.header, "px-5 py-6 sm:px-8")}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <a href="/" className={cn(styles.brand, "inline-flex min-h-11 items-center gap-3")} aria-label="deessa Foundation home">
            <Image src="/logo.png" alt="" width={2421} height={818} unoptimized loading="eager" className="h-auto w-40 object-contain" />
          </a>
          <a href="/contact" className={cn(styles.textLink, "inline-flex min-h-11 items-center")}>Contact us <ArrowRight aria-hidden="true" className="ml-2 size-4" /></a>
        </div>
      </header>
      <Main id={preview ? undefined : "error-main-content"} tabIndex={preview ? undefined : -1} className="flex flex-1 flex-col justify-center" data-tts-root="">{screen}</Main>
      <footer className={cn(styles.footer, "px-5 py-5 text-center text-sm")}>Different ways of thinking. Equal space to belong.</footer>
    </div>
  )
}



