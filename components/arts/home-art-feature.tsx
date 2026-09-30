import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { artworkAnchor, type Artwork } from "@/lib/arts/types"
import { DEFAULT_ARTS_CONTENT, type ArtsContent } from "@/lib/arts/content"
import styles from "./arts.module.css"

// Homepage-only art feature. Renders nothing when no artwork is published, so
// the homepage never shows placeholder or invented pieces.

const tilts = ["-rotate-[2deg]", "rotate-[1.5deg]", "-rotate-[1deg]"]

function FramedArtwork({ artwork, tilt, sizes, className }: { artwork: Artwork; tilt: string; sizes: string; className?: string }) {
  return (
    <Link
      href={`/arts#${artworkAnchor(artwork.id)}`}
      aria-label={`View “${artwork.title}” in the gallery`}
      className={cn(
        styles.frame,
        styles.tilt,
        "group block rounded-[22px] border border-white bg-white p-2 sm:p-2.5",
        "shadow-[0_18px_40px_-18px_rgba(11,95,138,0.35)] transition-[rotate,translate,box-shadow] duration-500 ease-out",
        "hover:rotate-0 hover:-translate-y-1 hover:shadow-[0_26px_50px_-18px_rgba(11,95,138,0.45)]",
        "focus-visible:rotate-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/50",
        "motion-reduce:transition-none",
        tilt,
        className,
      )}
    >
      {/* Natural aspect ratio: the painting itself is never cropped. */}
      <span
        className={cn(styles.mat, "relative block overflow-hidden rounded-[16px] bg-[#f6f2ec]")}
        style={{ aspectRatio: `${artwork.width} / ${artwork.height}` }}
      >
        <Image
          src={artwork.src}
          alt={artwork.alt}
          fill
          sizes={sizes}
          className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </span>
    </Link>
  )
}

function Collage({ artworks }: { artworks: Artwork[] }) {
  if (artworks.length === 1) {
    return (
      <div className="mx-auto w-full max-w-[460px]">
        <FramedArtwork artwork={artworks[0]} tilt={tilts[0]} sizes="(min-width: 1024px) 460px, 90vw" />
      </div>
    )
  }

  // The most portrait piece takes the tall slot; the rest stack beside it.
  const sorted = [...artworks]
  const tallIndex = sorted.reduce((best, a, i, arr) => (a.height / a.width > arr[best].height / arr[best].width ? i : best), 0)
  const [tall] = sorted.splice(tallIndex, 1)

  return (
    <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-3 sm:gap-5">
      <FramedArtwork artwork={tall} tilt={tilts[0]} sizes="(min-width: 1024px) 280px, 45vw" />
      <div className="flex flex-col gap-3 sm:gap-5">
        {sorted.map((artwork, i) => (
          <FramedArtwork
            key={artwork.id}
            artwork={artwork}
            tilt={tilts[i + 1]}
            sizes="(min-width: 1024px) 340px, 55vw"
          />
        ))}
      </div>
    </div>
  )
}

export function HomeArtFeature({
  artworks,
  content = DEFAULT_ARTS_CONTENT.home,
}: {
  artworks: Artwork[]
  content?: ArtsContent["home"]
}) {
  if (!artworks.length) return null

  return (
    <section
      id="art"
      aria-labelledby="home-art-heading"
      className={cn(
        styles.section,
        "relative overflow-hidden bg-gradient-to-br from-[#fffaf2] via-white to-[#eef8fd] py-14 sm:py-20 lg:py-24",
      )}
    >
      {/* Soft paint-dab decorations */}
      <div aria-hidden="true" className={cn(styles.decor, "pointer-events-none absolute inset-0")}>
        <span className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-[#F7C52B]/15 blur-3xl" />
        <span className="absolute right-[8%] top-0 h-64 w-64 rounded-full bg-[#3FABDE]/12 blur-3xl" />
        <span className="absolute bottom-0 right-[30%] h-48 w-48 rounded-full bg-[#D6336C]/[0.07] blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-12">
        {/* Copy */}
        <div className="max-w-xl">
          <span aria-hidden="true" className={cn(styles.decor, "mb-5 block h-1 w-10 rounded-full bg-[#3FABDE]")} />
          <p className={cn(styles.eyebrow, "mb-3 font-comic text-xs font-bold uppercase tracking-[0.2em] text-[#15151c]")}>
            {content.eyebrow}
          </p>
          <h2
            id="home-art-heading"
            className={cn(
              styles.heading,
              "font-marissa text-[2.25rem] leading-[1.15] text-[#0B5F8A] sm:text-5xl lg:text-[3.25rem]",
              "[-webkit-text-stroke:0.6px_currentColor]",
            )}
          >
            {content.heading}{" "}
            <span className={cn(styles.accent, "relative inline-block text-[#3FABDE]")}>
              {content.headingAccent}
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                className={cn(styles.decor, "pointer-events-none absolute -bottom-[0.14em] left-0 h-[0.2em] w-full")}
              >
                <path d="M4 14 C 50 6, 120 4, 196 10" fill="none" stroke="#F7C52B" strokeLinecap="round" strokeWidth="5" />
              </svg>
            </span>
          </h2>
          <p className={cn(styles.muted, "mt-6 font-comic text-base leading-relaxed text-slate-600 sm:text-lg")}>
            {content.intro}
          </p>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Link
              href="/arts"
              className={cn(
                styles.primaryBtn,
                "inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-[#0B5F8A] px-7 font-comic text-[1.0625rem] font-bold text-white",
                "shadow-[0_12px_24px_-12px_rgba(11,95,138,0.7)] transition-colors duration-200 hover:bg-[#094E72]",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/45 focus-visible:ring-offset-2",
              )}
            >
              {content.ctaLabel}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <p className={cn(styles.muted, "flex items-center gap-3 font-comic text-sm text-slate-600")}>
              <span aria-hidden="true" className={cn(styles.decor, "flex -space-x-1.5")}>
                <span className="h-4 w-4 rounded-full bg-[#F7C52B] ring-2 ring-white" />
                <span className="h-4 w-4 rounded-full bg-[#D6336C] ring-2 ring-white" />
                <span className="h-4 w-4 rounded-full bg-[#3FABDE] ring-2 ring-white" />
              </span>
              {content.creditLine}
            </p>
          </div>
        </div>

        {/* Collage */}
        <div className="relative mx-auto w-full max-w-[620px] pb-8">
          <Collage artworks={artworks} />
          <p
            className={cn(
              styles.chip,
              "absolute bottom-0 left-1/2 inline-flex w-max max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-center",
              "font-comic text-sm text-slate-600 shadow-[0_10px_24px_-12px_rgba(26,26,46,0.3)]",
            )}
          >
            <Sparkles aria-hidden="true" className="h-4 w-4 text-[#3FABDE]" />
            <span className="font-bold text-[#0B5F8A]">{content.badge}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
