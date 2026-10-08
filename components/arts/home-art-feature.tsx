import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Artwork } from "@/lib/arts/types"
import { DEFAULT_ARTS_CONTENT, type ArtsContent } from "@/lib/arts/content"
import {
  ART_COPY_BACKDROP_MOBILE,
  ART_COPY_PANEL_MOBILE,
  ART_HEADING_MOBILE,
  ART_SPLASH_MOBILE,
  ArtBadge,
  ArtColourDots,
  ArtCopyFrame,
  ArtDoodle,
  ArtHeadingUnderline,
  ArtPaperBackdrop,
} from "./art-decor"
import { ArtPhotoPolaroid, ArtworkPolaroid, pickCollagePieces } from "./art-frames"
import { HomeEyebrow } from "@/components/home/home-section-heading"
import { homeUi } from "@/components/home/home-ui"
import styles from "./arts.module.css"

const INTRO_PHOTO = {
  src: "/artWork/art_pic1.jpeg",
  alt: "A girl sitting on a pink exercise ball and making art on walls filled with her drawings.",
}

/** Mobile and tablet: the creative-space photo sits between the intro and the button. */
function ArtIntroPhoto() {
  return (
    <div className="relative mx-auto mt-9 w-[78%] max-w-[300px] xl:hidden">
      <ArtPhotoPolaroid src={INTRO_PHOTO.src} alt={INTRO_PHOTO.alt}
        sizes="(min-width: 768px) 300px, 75vw"
        className="-rotate-[2deg]" />
      <ArtDoodle kind="rays" className="absolute -left-7 -top-9 h-10 w-10 rotate-[-15deg] text-[#0B5F8A] sm:-left-9 sm:-top-11 sm:h-12 sm:w-12" />
    </div>
  )
}

function ArtworkCollage({ artworks, badge }: { artworks: Artwork[]; badge: string }) {
  const pieces = pickCollagePieces(artworks)
  return (
    <div className="relative mx-auto mt-12 grid w-full max-w-[730px] grid-cols-2 items-start gap-7 px-6 pb-8 sm:gap-10 md:mt-16 xl:contents max-md:mt-10 max-md:gap-x-4 max-md:gap-y-0 max-md:px-5 max-md:pb-6">
      <ArtPaperBackdrop part="gallery" className={cn("-inset-x-6 -inset-y-8 xl:hidden", ART_SPLASH_MOBILE)} />
      <div className="relative col-span-2 mx-auto w-[78%] max-w-[340px] xl:absolute xl:left-[49%] xl:top-[17%] xl:w-[21%] xl:max-w-none max-md:w-[70%] max-md:max-w-[280px]">
        {/* Below xl this photo moves into the copy panel, above the button (see ArtIntroPhoto). */}
        <div className="hidden xl:block">
          <ArtPhotoPolaroid src={INTRO_PHOTO.src} alt={INTRO_PHOTO.alt}
            sizes="(min-width: 1920px) 400px, 21vw"
            className="-rotate-[3deg]" />
        </div>
        <ArtBadge doodleClassName="max-md:h-6 max-md:w-6"
          className={cn("-ml-3 mt-4 w-[calc(100%+1.5rem)] rotate-[-4deg] text-[clamp(0.875rem,1.15vw,1.25rem)]",
            "max-md:ml-0 max-md:mt-5 max-md:w-full max-md:gap-1.5 max-md:px-2 max-md:py-2.5 max-md:text-center max-md:text-[0.8125rem] max-md:leading-tight")}>
          {badge}
        </ArtBadge>
        <ArtDoodle kind="rays" className="absolute -left-9 -top-12 hidden h-14 w-14 rotate-[-15deg] text-[#0B5F8A] xl:block" />
      </div>
      {pieces[0] && <div className="relative xl:absolute xl:right-[10%] xl:top-[7%] xl:w-[18%] max-md:mt-7">
        <ArtworkPolaroid artwork={pieces[0]} tape="yellow" className="-rotate-[2deg] xl:-rotate-[3deg]" />
        <ArtDoodle kind="sun" className="absolute -right-11 -top-2 hidden h-16 w-16 text-[#f4ba05] md:block xl:-right-20 xl:h-20 xl:w-20" />
        <ArtDoodle kind="leaf" className="absolute -right-12 bottom-5 hidden h-28 w-16 text-[#2798a0] md:block xl:-right-20" />
      </div>}
      {pieces[1] && <div className="relative mt-5 xl:absolute xl:right-[3%] xl:top-[50%] xl:mt-0 xl:w-[23%] max-md:mt-11">
        <ArtworkPolaroid artwork={pieces[1]} tape="blue" className="rotate-[3deg] xl:rotate-[5deg]" />
        <ArtDoodle kind="heart" className="absolute -left-9 top-4 h-11 w-9 rotate-[-12deg] text-[#8c9ac8] max-md:-left-6 max-md:top-2 max-md:h-8 max-md:w-7" />
        <ArtDoodle kind="star" className="absolute -left-10 bottom-0 h-10 w-10 text-[#739ebf] max-md:hidden" />
      </div>}
    </div>
  )
}

export function HomeArtFeature({ artworks, content = DEFAULT_ARTS_CONTENT.home }: {
  artworks: Artwork[]
  content?: ArtsContent["home"]
}) {
  return (
    <section id="art" aria-labelledby="home-art-heading"
      className={cn(styles.section,
        "relative isolate overflow-hidden bg-white font-comic text-[#145879]")}>
      <div className="relative mx-auto max-w-[1920px] py-14 sm:py-20 xl:h-[clamp(720px,51.84vw,995px)] xl:py-0 max-md:pt-8 max-md:pb-10">
        <ArtPaperBackdrop className="inset-0 hidden xl:block [mask-image:linear-gradient(180deg,transparent,#000_7%,#000_93%,transparent)]" />
        <div className={cn("relative mx-auto w-[calc(100%-2rem)] max-w-[730px] px-5 py-8 sm:px-12 sm:py-12 xl:absolute xl:left-[4%] xl:top-[12%] xl:flex xl:h-[76%] xl:w-[42%] xl:max-w-none xl:flex-col xl:justify-center xl:pl-[4.5%] xl:pr-[2.5%] xl:py-10", ART_COPY_PANEL_MOBILE)}>
          <ArtPaperBackdrop part="copy" className={cn("-inset-x-[9%] -inset-y-[8%] xl:hidden", ART_COPY_BACKDROP_MOBILE)} />
          <ArtCopyFrame />
          <div className="relative z-10">
            <HomeEyebrow align="start" className="mb-5">{content.eyebrow}</HomeEyebrow>
            <h2 id="home-art-heading" className={cn(styles.heading,
              "font-marissa text-[clamp(2rem,7vw,3.5rem)] leading-[1.08] text-[#063F5B] [-webkit-text-stroke:1.25px_currentColor] xl:text-[clamp(2rem,3vw,3.6rem)] xl:[-webkit-text-stroke:1.8px_currentColor]", ART_HEADING_MOBILE)}>
              <span className="block">{content.heading}</span>{" "}
              <span className={cn(styles.accent, "relative mt-2 inline-block pb-4 text-[#1A8AC2]")}>
                {content.headingAccent}
                <ArtHeadingUnderline />
              </span>
            </h2>
            <p className={cn(styles.muted, "mt-5 max-w-[620px] text-base leading-[1.55] sm:text-lg xl:text-[clamp(1rem,1.1vw,1.25rem)] max-md:text-[0.9375rem] max-md:leading-[1.6]")}>{content.intro}</p>
            <ArtIntroPhoto />
            <Link href="/arts" className={cn(homeUi.primaryButton, "mt-6 w-full sm:w-auto")}>
              {content.ctaLabel}<ArrowRight aria-hidden="true" className={homeUi.buttonArrow} />
            </Link>
            <p className={cn(styles.muted, "mt-7 flex items-center gap-4 text-sm leading-snug sm:text-base xl:text-[clamp(0.875rem,1.1vw,1.25rem)] max-md:mt-6 max-md:items-start max-md:gap-3 max-md:text-pretty")}>
              <ArtColourDots className="max-md:mt-0.5" dotClassName="ring-white max-md:h-5 max-md:w-5" />
              <span className="min-w-0">{content.creditLine}</span>
            </p>
          </div>
          <ArtDoodle kind="rays" className="absolute right-4 top-[16%] hidden h-12 w-12 text-[#efb800] xl:block" />
          <ArtDoodle kind="heart" className="absolute bottom-[23%] right-0 hidden h-16 w-12 rotate-[8deg] text-[#ef8993] xl:block" />
          <ArtDoodle kind="sun" className="absolute -left-3 bottom-[14%] hidden h-16 w-16 text-[#f6c122] xl:block" />
        </div>
        <Image src="/artWork/babys-breath-left.png" alt="" width={1024} height={1536} sizes="(min-width: 1280px) 180px, 120px"
          className={cn(styles.decor, "pointer-events-none absolute -left-12 top-[25%] hidden w-[180px] -rotate-[12deg] select-none xl:block")} />
        <Image src="/artWork/babys-breath-center.png" alt="" width={1024} height={1536} sizes="(min-width: 1280px) 180px, 120px"
          className={cn(styles.decor, "pointer-events-none absolute left-[40%] top-[34%] z-10 hidden w-[13%] -rotate-[8deg] select-none xl:block")} />
        <ArtworkCollage artworks={artworks} badge={content.badge} />
      </div>
    </section>
  )
}
