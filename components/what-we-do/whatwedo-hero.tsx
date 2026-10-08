import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import type { WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import { cn } from "@/lib/utils"
import styles from "./whatwedo-hero.module.css"

const photoLayouts = [
  { frame: "col-span-2", crop: "object-[50%_35%]", label: "Learning together", sizes: "(min-width: 1280px) 560px, (min-width: 1024px) 46vw, 90vw" },
  { frame: "-rotate-3", crop: "object-[48%_55%]", label: "Growing in confidence", sizes: "(min-width: 1280px) 270px, (min-width: 1024px) 23vw, 44vw" },
  { frame: "rotate-3", crop: "object-[40%_30%]", label: "Making voices heard", sizes: "(min-width: 1280px) 270px, (min-width: 1024px) 23vw, 44vw" },
]

const buttonBase = "inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full border px-6 py-3 font-comic text-base font-bold transition-colors motion-reduce:transition-none"

export function WhatWeDoHero({ content }: { content: WhatWeDoSettings["hero"] }) {
  return (
    <section id="whatwedo-hero" aria-labelledby="whatwedo-hero-heading"
      className={cn(styles.hero, "relative isolate overflow-hidden")}>
      <div aria-hidden="true" className={cn(styles.decor, styles.backgroundPhoto, "pointer-events-none absolute inset-0")}>
        <Image src={content.photos[0].src} alt="" fill sizes="100vw"
          unoptimized={content.photos[0].src.startsWith("https://")}
          className="object-cover object-center" />
      </div>
      <div aria-hidden="true" className={cn(styles.decor, styles.photoVeil, "pointer-events-none absolute inset-0")} />
      <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 70" preserveAspectRatio="none"
        className={cn(styles.decor, styles.edge, "pointer-events-none absolute inset-x-0 bottom-0 h-8 w-full sm:h-12")}>
        <path d="M0 30Q180 65 360 35T720 34T1080 40T1440 24V70H0Z" fill="currentColor" />
      </svg>
      <div className="relative mx-auto max-w-[1360px] px-5 pb-16 pt-6 sm:px-8 sm:pb-20 lg:px-12 lg:pt-8 xl:px-16">
        <nav aria-label="Breadcrumb" className="mb-10 lg:mb-14">
          <ol className={cn(styles.breadcrumb, "flex flex-wrap items-center gap-2 font-comic text-sm")}>
            <li><Link href="/" className="inline-block rounded-sm py-3 hover:underline">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{content.breadcrumb}</li>
          </ol>
        </nav>

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-12 xl:gap-20">
          <div className="relative">
            <p className={cn(styles.eyebrow, "mb-5 flex items-center gap-3 font-comic text-xs font-bold uppercase tracking-[0.16em] leading-relaxed sm:text-sm")}>
              <span aria-hidden="true" className={cn(styles.decor, styles.eyebrowLine, "h-0.5 w-8 shrink-0")} />
              {content.eyebrow}
            </p>
            <h1 id="whatwedo-hero-heading"
              className={cn(styles.heading, "font-marissa text-[clamp(2.75rem,9vw,4rem)] leading-[1.1] break-words lg:text-[clamp(3.25rem,4.8vw,4.5rem)]")}>
              <span className="block">{content.headingStart} {content.headingEmphasis}</span>{" "}
              <span className="block">{content.headingEnd}</span>{" "}
              <span className={cn(styles.headingAccent, "relative inline-block pb-3")}>
                {content.headingAccent}
                <svg aria-hidden="true" focusable="false" viewBox="0 0 300 24" preserveAspectRatio="none"
                  className={cn(styles.decor, styles.underline, "pointer-events-none absolute bottom-0 left-0 h-4 w-full")}>
                  <path d="M5 14Q130 0 292 10M15 22Q150 9 280 17" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className={cn(styles.description, "mt-6 max-w-[33rem] font-comic text-base leading-[1.75] sm:text-lg")}>
              {content.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={content.primaryHref} data-slot="button" data-variant="default"
                className={cn(styles.primaryBtn, buttonBase)}>
                {content.primaryLabel}<ArrowDown aria-hidden="true" className="size-4 shrink-0" />
              </a>
              <Link href={content.secondaryHref} data-slot="button" data-variant="outline"
                className={cn(styles.secondaryBtn, buttonBase)}>
                {content.secondaryLabel}<ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[600px] px-2 pb-2 sm:px-3 lg:pt-2">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 90 70"
              className={cn(styles.decor, styles.rays, "pointer-events-none absolute -right-2 -top-7 h-14 w-16 sm:-right-5")}>
              <path d="M10 55L4 28M31 40L40 8M55 49L81 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div className="grid grid-cols-2 items-start gap-4 sm:gap-5">
              {photoLayouts.map((layout, index) => {
                const photo = content.photos[index]
                return (
                  <figure key={index} className={cn(styles.photo, "relative m-0 rounded-sm p-2 sm:p-3", layout.frame)}>
                    {index === 0 && <span aria-hidden="true" className={cn(styles.decor, styles.tape, "absolute -top-3 left-1/2 z-10 h-7 w-24 -translate-x-1/2 -rotate-3")} />}
                    <div className={cn(styles.photoMat, "relative overflow-hidden", index === 0 ? "aspect-[16/9]" : "aspect-[4/3]")}>
                      <Image src={photo.src} alt={photo.alt} fill sizes={layout.sizes}
                        unoptimized={photo.src.startsWith("https://")}
                        loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"}
                        className={cn("object-cover", layout.crop)} />
                    </div>
                    <figcaption className={cn(styles.caption, "px-1 pb-1 pt-3 text-center font-comic text-xs leading-relaxed sm:text-sm")}>
                      {layout.label}
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
