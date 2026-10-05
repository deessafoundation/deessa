import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowDown } from "lucide-react"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"
import { getArtsContent, getPublishedArtworks } from "@/lib/data/artworks"
import { ArtsGallery } from "@/components/arts/arts-gallery"
import { ArtsHeroCollage } from "@/components/arts/arts-hero-collage"
import {
  ART_COPY_PANEL,
  ART_HEADING_MOBILE,
  ArtColourDots,
  ArtCopyFrame,
  ArtDoodle,
  ArtEyebrow,
  ArtHeadingUnderline,
  ArtSplash,
  ArtTape,
} from "@/components/arts/art-decor"
import { cn } from "@/lib/utils"
import styles from "@/components/arts/arts.module.css"

// Artworks are managed in /admin/artworks; render from the live database so
// publishing, ordering and edits appear immediately (matches the homepage).
export const dynamic = "force-dynamic"

export const metadata: Metadata = generateSEOMetadata({
  title: "Art & Expression",
  description:
    "Discover a growing collection of art by children and artists in the Deessa community, celebrating creativity, inclusion, and individual expression.",
  path: "/arts",
  image: "/artWork/art_pic2.jpeg",
  imageAlt: "A wall covered with children's paintings and drawings",
  keywords: ["children's art", "community art", "art gallery", "creative expression", "Deessa Foundation"],
})

// Same pill as the homepage "Explore Art" button.
const pillButton = cn(
  styles.primaryBtn,
  "group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#00678c] px-7 text-lg font-bold text-white sm:min-h-[58px] sm:px-8",
  "shadow-[0_10px_20px_-6px_rgba(0,91,123,0.35)] transition-[translate,background-color] duration-200 hover:-translate-y-px hover:bg-[#085674]",
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B5F8A] focus-visible:ring-offset-4 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
)

const paperShadow = "shadow-[inset_0_0_0_2px_#fff,inset_0_0_0_5px_#f1eae0,0_18px_25px_-12px_rgba(93,65,30,0.35)]"

export default async function ArtsPage() {
  const [{ artworks, unavailable }, content] = await Promise.all([getPublishedArtworks(), getArtsContent()])
  const copy = content.gallery

  return (
    <>
      {/* Hero */}
      <section
        aria-labelledby="arts-hero-heading"
        className={cn(styles.section, "relative isolate overflow-hidden bg-[#fffcf6] font-comic text-[#145879]")}
      >
        <Image
          src="/artWork/babys-breath-left.png"
          alt=""
          width={1024}
          height={1536}
          sizes="150px"
          className={cn(
            styles.decor,
            "pointer-events-none absolute -left-12 top-[28%] hidden w-[150px] -rotate-[12deg] select-none xl:block",
          )}
        />
        <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 pb-10 pt-8 sm:gap-14 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6 lg:px-10 xl:px-16">
          <div className={cn("relative mx-auto w-full max-w-[730px] sm:w-[calc(100%-2rem)] lg:mx-0 lg:w-full", ART_COPY_PANEL)}>
            <ArtCopyFrame allWidths />
            <div className="relative z-10">
              <nav aria-label="Breadcrumb" className="mb-5">
                <ol className="flex items-center gap-2 font-comic text-[0.8125rem] text-[#145879]">
                  <li>
                    <Link
                      href="/"
                      className="rounded-sm hover:text-[#0B5F8A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FABDE]"
                    >
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">›</li>
                  <li aria-current="page">Arts</li>
                </ol>
              </nav>
              <ArtEyebrow
                text={copy.eyebrow}
                className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#172e49] sm:text-sm"
              />
              <h1
                id="arts-hero-heading"
                className={cn(
                  styles.heading,
                  "font-marissa text-[clamp(2rem,7vw,3.5rem)] leading-[1.08] text-[#084e70] [-webkit-text-stroke:1.25px_currentColor]",
                  "lg:text-[clamp(2.25rem,3.4vw,3.6rem)] lg:[-webkit-text-stroke:1.8px_currentColor]",
                  ART_HEADING_MOBILE,
                )}
              >
                <span className="block">{copy.heading}</span>{" "}
                <span className={cn(styles.accent, "relative mt-2 inline-block pb-4 text-[#3FABDE]")}>
                  {copy.headingAccent}
                  <ArtHeadingUnderline />
                </span>
              </h1>
              <p
                className={cn(
                  styles.muted,
                  "mt-5 max-w-[620px] text-base leading-[1.55] sm:text-lg lg:text-[clamp(1rem,1.1vw,1.25rem)]",
                  "max-md:text-[0.9375rem] max-md:leading-[1.6]",
                )}
              >
                {copy.intro}
              </p>
              <a href="#collection" className={cn(pillButton, "mt-7 max-md:flex max-md:w-full")}>
                Explore the collection
                <ArrowDown
                  aria-hidden="true"
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                />
              </a>
            </div>
            <ArtDoodle kind="rays" className="absolute right-6 top-[14%] hidden h-12 w-12 text-[#efb800] lg:block" />
            <ArtDoodle kind="heart" className="absolute bottom-[18%] right-2 hidden h-14 w-11 rotate-[8deg] text-[#ef8993] lg:block" />
            <ArtDoodle kind="sun" className="absolute -left-2 bottom-[8%] hidden h-14 w-14 text-[#f6c122] lg:block" />
          </div>

          <ArtsHeroCollage artworks={artworks} badge={copy.heroBadge} />
        </div>
      </section>

      {/* Collection */}
      <section
        id="collection"
        aria-labelledby="collection-heading"
        className={cn(
          styles.section,
          "relative isolate scroll-mt-24 overflow-hidden bg-[#fffcf6] py-14 font-comic text-[#145879] sm:py-20",
        )}
      >
        <ArtSplash className="-right-16 -top-10 h-[420px] w-[min(80vw,380px)] opacity-45" />
        <ArtSplash className="-bottom-16 -left-20 h-[420px] w-[min(80vw,380px)] -scale-x-100 opacity-40" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="relative">
              <ArtEyebrow
                text="The Collection"
                className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#172e49] sm:text-sm"
              />
              <h2
                id="collection-heading"
                className={cn(
                  styles.heading,
                  "font-marissa text-[clamp(1.875rem,5vw,2.75rem)] leading-tight text-[#084e70] [-webkit-text-stroke:1px_currentColor]",
                )}
              >
                {copy.collectionHeading}{" "}
                <span className={cn(styles.accent, "relative inline-block pb-3 text-[#3FABDE]")}>
                  {copy.collectionAccent}
                  <ArtHeadingUnderline />
                </span>
              </h2>
              <ArtDoodle kind="sun" className="absolute -right-16 -top-4 hidden h-14 w-14 text-[#f6c122] sm:block" />
            </div>
            <div className="flex max-w-sm items-start gap-3">
              <ArtColourDots className="mt-1" dotClassName="h-5 w-5" />
              <p className={cn(styles.muted, "min-w-0 font-comic text-base leading-relaxed text-[#145879]")}>
                {copy.collectionIntro}
                {artworks.length > 0 && (
                  <>
                    {" "}
                    <span className="font-bold text-[#0B5F8A]">
                      {artworks.length} {artworks.length === 1 ? "piece" : "pieces"}
                    </span>{" "}
                    · select any to view it in full.
                  </>
                )}
              </p>
            </div>
          </div>

          {artworks.length > 0 ? (
            <ArtsGallery artworks={artworks} />
          ) : (
            <div
              role="status"
              className={cn(
                styles.card,
                "relative mx-auto mt-6 max-w-xl rounded-[2px] border-2 border-[#e5ded3] bg-[#fffdf8] px-6 py-12 text-center",
                paperShadow,
              )}
            >
              <ArtTape color="yellow" />
              <span
                aria-hidden="true"
                className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3d6]"
              >
                <ArtDoodle kind="flower" className="h-9 w-9 text-[#0B5F8A]" />
              </span>
              <h3 className={cn(styles.heading, "font-marissa text-2xl text-[#084e70]")}>
                {unavailable ? "The gallery is taking a short break." : "New artwork is on its way."}
              </h3>
              <p className={cn(styles.muted, "mt-3 font-comic text-base text-slate-600")}>
                {unavailable
                  ? "We couldn't load the collection just now. Please try again in a moment."
                  : "The collection is being hung. Check back soon to see the latest pieces."}
              </p>
              <Link href="/" className={cn(pillButton, "mt-6")}>
                Back to home
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
