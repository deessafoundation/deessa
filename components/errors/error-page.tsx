"use client"

import { useId, useRef, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { comicNeue } from "@/lib/fonts"
import styles from "./error-page.module.css"

export type ErrorVariant = "not-found" | "server" | "generic" | "network" | "unauthorized" | "closed"

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
  onRetry?: () => void | Promise<void>
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
  showPrimary?: boolean
  showSecondary?: boolean
  standalone?: boolean
  preview?: boolean
}

const screens = {
  "not-found": {
    label: "Page not found", title: "This page doesn’t exist.", subtitle: "But there’s always a way forward.",
    message: "The page you’re looking for might have been moved, renamed, or doesn’t exist anymore. Let’s get you back on track.",
    art: "puzzle-404.webp", photo: "puzzle-hand.webp", note: "Different perspectives, brighter tomorrows.",
  },
  server: {
    label: "Internal server error", title: "Something went wrong on our side.", subtitle: "A pause. Then a way forward.",
    message: "We couldn’t load this page right now. Please try again in a moment, or head home to continue exploring.",
    art: "neurodiversity-500.webp", photo: "supported-bridge.webp", note: "One more try. A way forward.",
  },
  network: {
    label: "Connection interrupted", title: "Let’s reconnect.", subtitle: "A little pause. Our connection continues.",
    message: "We couldn’t reach the website. Check your Wi-Fi or mobile data, then try again when you’re ready.",
    art: "connection-infinity.webp", photo: "girl-connection-error.webp", note: "Different minds. Still connected.",
  },
  unauthorized: {
    label: "403 · Access restricted", title: "This space needs permission.", subtitle: "There’s still a way forward.",
    message: "This page is reserved for authorized team members. Sign in with an account that has access. If you’re already signed in, contact your administrator for help.",
    art: "permission-403.webp", photo: "permission-door.webp", note: "A little permission. An open door.",
  },
  generic: {
    label: "Unexpected error", title: "Something interrupted this page.", subtitle: "Let’s give it another try.",
    message: "We couldn’t finish loading this page. Please try again, or head home to find the information you need.",
    art: "unexpected-oops.webp", photo: "supported-bridge.webp", note: "A pause. Then another possibility.",
  },
  closed: {
    label: "Registration closed", title: "This registration has closed.", subtitle: "More moments to connect are ahead.",
    message: "Registration for this event is currently closed. Explore our other events, or contact the organizer if you need help with an existing registration.",
    art: "registration-calendar.webp", photo: "next-gathering.webp", note: "Every gathering starts a connection.",
  },
} as const

export function ErrorPage({ variant = "not-found", preview = false, standalone = false, onRetry, error,
  title, message, primaryHref, primaryLabel, secondaryHref, secondaryLabel, showPrimary = true, showSecondary = true,
}: ErrorPageProps) {
  const headingId = useId()
  const state = screens[variant]
  const recoverable = variant === "server" || variant === "network" || variant === "generic"
  const digest = error?.digest
  const [feedback, setFeedback] = useState("")
  const [retrying, setRetrying] = useState(false)
  const retryPending = useRef(false)
  const primaryTarget = primaryHref ?? (variant === "unauthorized" ? "/admin/login" : variant === "closed" ? "/events" : "/")
  const primaryText = primaryLabel ?? (variant === "unauthorized" ? "Team sign in" : variant === "closed" ? "Browse events" : "Find your way home")
  const secondaryTarget = secondaryHref ?? "/"
  const secondaryText = secondaryLabel ?? "Back to home"
  const customActions = Boolean(primaryHref || secondaryHref || primaryLabel || secondaryLabel)
  const Heading = preview ? "h2" : "h1"
  const Main = standalone && !preview ? "main" : "div"

  async function retry() {
    if (retryPending.current) return
    retryPending.current = true
    setRetrying(true)
    setFeedback(variant === "network" ? "Trying to reconnect…" : "Trying to load the page again…")
    try {
      if (onRetry) {
        await onRetry()
        setFeedback("Retry requested. If this page is still here, please try again in a moment.")
      } else window.location.reload()
    }
    catch { setFeedback("We still couldn’t load the page. Please try again in a moment.") }
    finally { retryPending.current = false; setRetrying(false) }
  }
  async function copyReference() {
    try { await navigator.clipboard.writeText(`deessa Foundation — ${state.label}\nReference: ${digest}`); setFeedback("Support reference copied.") }
    catch { setFeedback("Couldn’t copy the reference. Please select and copy it below.") }
  }

  return (
    <div className={cn(comicNeue.variable, styles.page)} data-server={variant === "server"}>
      {standalone && <>
        {!preview && <a href="#puzzle-error-main" className={styles.skip}>Skip to main content</a>}
        <header className={cn(styles.header, "px-6 py-4 lg:px-12")}>
          <div className="mx-auto flex max-w-7xl items-center">
            <Link href="/" prefetch={false} aria-label="deessa Foundation home" className="shrink-0">
              <Image src="/logo.png" alt="" width={2421} height={818} loading="eager" unoptimized className="h-auto w-40 lg:w-48" />
            </Link>
          </div>
        </header>
      </>}
      <Main id={standalone && !preview ? "puzzle-error-main" : undefined} tabIndex={standalone && !preview ? -1 : undefined}>
        <section aria-labelledby={headingId} className={cn(styles.scene, "relative isolate overflow-hidden")}>
          <div className={cn(styles.visual, "pointer-events-none")} aria-hidden="true">
            <svg width="0" height="0" className="absolute">
              <defs><clipPath id={`${headingId}-photo`} clipPathUnits="objectBoundingBox">
                <path d="M .48 .06 C .64 -.02 .84 .02 1 .10 V .39 C .96 .47 .89 .39 .84 .45 C .76 .51 .82 .68 .68 .84 C .56 .98 .46 1 .37 .96 C .28 .93 .28 .82 .20 .76 C .14 .71 .03 .68 .01 .53 C -.03 .38 .05 .24 .18 .22 C .36 .20 .36 .12 .48 .06 Z" />
              </clipPath></defs>
            </svg>
            <div className={cn(styles.photoShape, styles.creamShape)} style={{ clipPath: `url(#${headingId}-photo)` }} />
            <div className={styles.photoShape} style={{ clipPath: `url(#${headingId}-photo)` }}>
              <Image src={`/errors/${state.photo}`} alt="" width={variant === "network" ? 768 : 1000} height={variant === "network" ? 768 : 1250} unoptimized loading="eager" className="h-full w-full object-cover" />
            </div>
            {variant === "not-found" && <svg className={styles.leaves} viewBox="0 0 500 300" fill="none">
              <path d="M480 290C380 210 370 160 285 80" stroke="currentColor" strokeWidth="2" />
              <path d="M480 290C370 230 325 205 140 160C250 110 375 150 480 290" fill="currentColor" opacity=".2" />
              <path d="M480 290C430 200 400 120 300 100C280 170 370 260 480 290" fill="currentColor" opacity=".35" />
              <path d="M295 100C255 55 255 20 270 15C292 5 305 55 295 100" fill="currentColor" opacity=".65" />
            </svg>}
            <p className={styles.note}>{state.note}</p>
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-20">
            <div className={cn(styles.copy, "min-w-0")}>
              <p className={styles.eyebrow}>{state.label}</p>
              <div className={cn(styles.numerals, "relative mb-4 mt-8 max-w-xl")} aria-hidden="true">
                <Image src={`/errors/${state.art}`} alt="" width={1200} height={540} unoptimized loading="eager" className="h-auto w-full" />
              </div>
              <Heading id={headingId} className={styles.title}>{title ?? state.title}</Heading>
              <p className={styles.subtitle}>{state.subtitle}</p>
              <p className={styles.message}>{message ?? state.message}</p>
              {showPrimary && (recoverable ? <button type="button" onClick={retry} disabled={retrying} aria-busy={retrying} className={cn(styles.home, "mt-8 inline-flex min-h-14 max-w-full items-center justify-center gap-6 rounded-full px-8 py-4 text-center font-bold")}>{retrying ? "Trying again…" : "Try again"} <ArrowRight aria-hidden="true" className="size-6 shrink-0" /></button> : <Link href={primaryTarget} prefetch={false} className={cn(styles.home, "mt-8 inline-flex min-h-14 max-w-full items-center justify-center gap-6 rounded-full px-8 py-4 text-center font-bold")}>
                {primaryText} <ArrowRight aria-hidden="true" className="size-6 shrink-0" />
              </Link>)}
              {recoverable && <>
                <p role="status" className="mt-3">{feedback}</p>
                {digest && <details className="mt-3 break-all"><summary className="min-h-11 cursor-pointer py-3">Support reference</summary><code>{digest}</code><button type="button" onClick={copyReference} className="mt-2 block min-h-11 cursor-pointer underline underline-offset-4">Copy reference</button></details>}
              </>}
              {showSecondary && <nav aria-label="More places to explore" className={cn(styles.links, "mt-7 flex flex-wrap gap-x-6 gap-y-2")}>
                {variant === "not-found" && !customActions ? <><Link href="/our-story" prefetch={false}>Our Story</Link><Link href="/whatwedo" prefetch={false}>What We Do</Link><Link href="/stories" prefetch={false}>Stories</Link></> : <>
                  <Link href={secondaryTarget} prefetch={false}>{secondaryText}</Link>
                  <Link href={variant === "network" ? "mailto:deessa.social@gmail.com" : "/contact"} prefetch={false}>Get in touch</Link>
                </>}
              </nav>}
              {variant === "network" && <p className="mt-4 text-sm leading-relaxed">Other pages may be unavailable until you reconnect.</p>}
            </div>
          </div>
        </section>
      </Main>
    </div>
  )
}
