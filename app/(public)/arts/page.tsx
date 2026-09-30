import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowDown, Palette } from "lucide-react"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"
import { getArtsContent, getPublishedArtworks } from "@/lib/data/artworks"
import { ArtsGallery } from "@/components/arts/arts-gallery"
import { cn } from "@/lib/utils"
import styles from "@/components/arts/arts.module.css"

// Artworks are managed in /admin/artworks; render from the live database so
// publishing, ordering and edits appear immediately (matches the homepage).
export const dynamic = "force-dynamic"

export const metadata: Metadata = generateSEOMetadata({
  title: "Art by Deetya & Marissa",
  description:
    "A collection of paintings and moments of expression by Deetya and Marissa. Take your time and see what each piece invites you to notice.",
  path: "/arts",
  image: "/artWork/art_pic2.jpeg",
  imageAlt: "A wall covered with children's paintings and drawings",
  keywords: ["children's art", "Deetya and Marissa", "art gallery", "creative expression", "Deessa Foundation"],
})

export default async function ArtsPage() {
  const [{ artworks, unavailable }, content] = await Promise.all([getPublishedArtworks(), getArtsContent()])
  const copy = content.gallery

  return (
    <>
      {/* Hero */}
      <section
        aria-labelledby="arts-hero-heading"
        className={cn(styles.section, "relative overflow-hidden bg-gradient-to-br from-[#fffaf2] via-white to-[#eef8fd]")}
      >
        <div aria-hidden="true" className={cn(styles.decor, "pointer-events-none absolute inset-0")}>
          <span className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#F7C52B]/15 blur-3xl" />
          <span className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#3FABDE]/12 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-14 pt-8 sm:px-8 md:pt-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-12 lg:pb-20">
          <div className="max-w-xl">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 font-comic text-[0.8125rem] text-[#1e293b]">
                <li>
                  <Link href="/" className="rounded-sm hover:text-[#0B5F8A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FABDE]">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li aria-current="page">Arts</li>
              </ol>
            </nav>
            <p className={cn(styles.eyebrow, "mb-3 font-comic text-xs font-bold uppercase tracking-[0.2em] text-[#15151c]")}>
              {copy.eyebrow}
            </p>
            <h1
              id="arts-hero-heading"
              className={cn(
                styles.heading,
                "font-marissa text-[2.5rem] leading-[1.12] text-[#0B5F8A] sm:text-5xl lg:text-[3.5rem]",
                "[-webkit-text-stroke:0.6px_currentColor]",
              )}
            >
              {copy.heading}{" "}
              <span className={cn(styles.accent, "relative inline-block text-[#3FABDE]")}>
                {copy.headingAccent}
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
            </h1>
            <p className={cn(styles.muted, "mt-6 font-comic text-base leading-relaxed text-slate-600 sm:text-lg")}>
              {copy.intro}
            </p>
            <a
              href="#collection"
              className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-sm border-b-2 border-[#3FABDE] font-comic text-base font-bold text-[#0B5F8A] transition-colors hover:border-[#0B5F8A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/45"
            >
              Explore the collection
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-[640px] pb-6">
            <figure
              className={cn(
                styles.frame,
                styles.tilt,
                "m-0 rotate-[1.25deg] rounded-[26px] border border-white bg-white p-2.5 shadow-[0_24px_50px_-20px_rgba(11,95,138,0.4)] sm:p-3",
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#f6f2ec]">
                <Image
                  src="/artWork/art_pic2.jpeg"
                  alt="A wall covered with children's paintings and drawings pinned up in a home creative space."
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 620px, 92vw"
                  className="object-cover"
                />
              </div>
            </figure>
            <p
              className={cn(
                styles.chip,
                "absolute bottom-0 left-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 font-comic text-sm font-bold text-[#0B5F8A] shadow-[0_10px_24px_-12px_rgba(26,26,46,0.3)] sm:left-8",
              )}
            >
              <Palette aria-hidden="true" className="h-4 w-4 text-[#D6336C]" />
              {copy.heroBadge}
            </p>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" aria-labelledby="collection-heading" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={cn(styles.eyebrow, "mb-3 font-comic text-xs font-bold uppercase tracking-[0.2em] text-[#15151c]")}>
                The Collection
              </p>
              <h2
                id="collection-heading"
                className={cn(
                  styles.heading,
                  "font-marissa text-[2rem] leading-tight text-[#1a1a2e] sm:text-[2.5rem] [-webkit-text-stroke:0.5px_currentColor]",
                )}
              >
                {copy.collectionHeading}{" "}<span className={cn(styles.accent, "text-[#0b76b7]")}>{copy.collectionAccent}</span>
              </h2>
            </div>
            <p className={cn(styles.muted, "max-w-sm font-comic text-base leading-relaxed text-slate-600")}>
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

          {artworks.length > 0 ? (
            <ArtsGallery artworks={artworks} />
          ) : (
            <div
              role="status"
              className={cn(
                styles.card,
                "mx-auto max-w-xl rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-[0_2px_16px_rgba(26,26,46,0.06)]",
              )}
            >
              <span aria-hidden="true" className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F6FC] text-[#0B5F8A]">
                <Palette className="h-7 w-7" />
              </span>
              <h3 className={cn(styles.heading, "font-marissa text-2xl text-[#1a1a2e]")}>
                {unavailable ? "The gallery is taking a short break." : "New artwork is on its way."}
              </h3>
              <p className={cn(styles.muted, "mt-3 font-comic text-base text-slate-600")}>
                {unavailable
                  ? "We couldn't load the collection just now. Please try again in a moment."
                  : "The collection is being hung. Check back soon to see the latest pieces."}
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-[#0B5F8A] px-6 font-comic font-bold text-white hover:bg-[#094E72] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/45"
              >
                Back to home
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
