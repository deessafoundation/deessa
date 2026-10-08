import type { Metadata } from "next"
import Link from "next/link"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"
import { getArtsContent, getPublishedArtworks } from "@/lib/data/artworks"
import { ArtsGallery } from "@/components/arts/arts-gallery"
import { ArtsHero } from "@/components/arts/arts-hero"
import {
  ArtColourDots,
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
      <ArtsHero copy={copy} artworks={artworks} />

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
