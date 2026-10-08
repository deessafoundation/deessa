"use client"

import { useId } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import styles from "./puzzle-not-found.module.css"

export function PuzzleNotFound({ preview = false, standalone = false }: { preview?: boolean; standalone?: boolean }) {
  const headingId = useId()
  const Heading = preview ? "h2" : "h1"
  const Main = standalone && !preview ? "main" : "div"
  return (
    <div className={styles.page}>
      {standalone && <>
        {!preview && <a href="#puzzle-error-main" className={styles.skip}>Skip to main content</a>}
        <header className={cn(styles.header, "px-6 py-4 lg:px-12")}>
          <div className="mx-auto flex max-w-7xl items-center">
            <a href="/" aria-label="deessa Foundation home" className="shrink-0">
              <Image src="/logo.png" alt="" width={2421} height={818} loading="eager" unoptimized className="h-auto w-40 lg:w-48" />
            </a>
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
              <Image src="/errors/puzzle-hand.webp" alt="" width={1000} height={1250} unoptimized loading="eager" className="h-full w-full object-cover" />
            </div>
            <svg className={styles.leaves} viewBox="0 0 500 300" fill="none">
              <path d="M480 290C380 210 370 160 285 80" stroke="currentColor" strokeWidth="2" />
              <path d="M480 290C370 230 325 205 140 160C250 110 375 150 480 290" fill="currentColor" opacity=".2" />
              <path d="M480 290C430 200 400 120 300 100C280 170 370 260 480 290" fill="currentColor" opacity=".35" />
              <path d="M295 100C255 55 255 20 270 15C292 5 305 55 295 100" fill="currentColor" opacity=".65" />
            </svg>
            <p className={styles.note}>Different<br />perspectives,<br />brighter<br />tomorrows.</p>
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-20">
            <div className={cn(styles.copy, "min-w-0")}>
              <p className={styles.eyebrow}>Page not found</p>
              <div className={cn(styles.numerals, "relative mb-4 mt-8 max-w-xl")} aria-hidden="true">
                <Image src="/errors/puzzle-404.webp" alt="" width={1200} height={540} unoptimized loading="eager" className="h-auto w-full" />
              </div>
              <Heading id={headingId} className={styles.title}>This page doesn’t exist.</Heading>
              <p className={styles.subtitle}>But there’s always a way forward.</p>
              <p className={styles.message}>The page you’re looking for might have been moved, renamed, or doesn’t exist anymore. Let’s get you back on track.</p>
              <a href="/" className={cn(styles.home, "mt-8 inline-flex min-h-14 max-w-full items-center justify-center gap-6 rounded-full px-8 py-4 text-center font-bold")}>
                Find your way home <ArrowRight aria-hidden="true" className="size-6 shrink-0" />
              </a>
              <nav aria-label="More places to explore" className={cn(styles.links, "mt-7 flex flex-wrap gap-x-6 gap-y-2")}>
                <a href="/our-story">Our Story</a><a href="/whatwedo">What We Do</a><a href="/stories">Stories</a>
              </nav>
            </div>
          </div>
        </section>
      </Main>
    </div>
  )
}
