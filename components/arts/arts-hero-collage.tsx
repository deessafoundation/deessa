import type { Artwork } from "@/lib/arts/types"
import { ArtBadge, ArtDoodle, ArtSplash } from "./art-decor"
import { ArtPhotoPolaroid, ArtworkPolaroid, pickCollagePieces } from "./art-frames"
import { cn } from "@/lib/utils"

// Same photo the homepage art section uses; fills the first slot when nothing is published.
const FALLBACK_PHOTO = {
  src: "/artWork/art_pic1.jpeg",
  alt: "A girl sitting on a pink exercise ball and making art on walls filled with her drawings.",
}

/** /arts hero collage: the creative-space photo plus up to two published artworks, taped like the homepage. */
export function ArtsHeroCollage({ artworks, badge }: { artworks: Artwork[]; badge: string }) {
  // Featured pieces first, then the homepage's landscape-first ordering.
  const pieces = pickCollagePieces([...artworks.filter((a) => a.isFeatured), ...artworks.filter((a) => !a.isFeatured)])
  const pieceSizes = "(min-width: 1024px) 260px, (min-width: 768px) 300px, 42vw"

  return (
    <div className="relative mx-auto grid w-full max-w-[640px] grid-cols-2 items-start gap-x-4 gap-y-0 px-5 pb-10 sm:gap-x-8 sm:px-8 lg:px-2">
      <ArtSplash className="-inset-x-2 -inset-y-6 opacity-80 sm:-inset-x-6" />
      <div className="relative col-span-2 mx-auto w-[88%] sm:w-[80%]">
        <ArtPhotoPolaroid src="/artWork/art_pic2.jpeg"
          alt="A wall covered with children's paintings and drawings pinned up in a home creative space."
          sizes="(min-width: 1024px) 480px, 86vw" matClassName="aspect-[4/3]" imageClassName="object-cover"
          loading="eager" fetchPriority="high" className="rotate-[1.5deg]" />
        <ArtBadge doodleClassName="max-md:h-6 max-md:w-6"
          className={cn("mx-auto -mt-4 w-[86%] rotate-[-3deg] text-base lg:text-[clamp(0.9375rem,1.1vw,1.125rem)]",
            "max-md:w-[92%] max-md:gap-1.5 max-md:px-2 max-md:py-2.5 max-md:text-center max-md:text-[0.8125rem] max-md:leading-tight")}>
          {badge}
        </ArtBadge>
        <ArtDoodle kind="rays" className="absolute -left-7 -top-9 h-10 w-10 rotate-[-15deg] text-[#0B5F8A] sm:-left-9 sm:-top-12 sm:h-14 sm:w-14" />
      </div>
      {pieces[0] ? (
        <div className={cn("relative z-10 mt-8", pieces.length === 1 && "col-span-2 mx-auto w-[60%] max-w-[260px]")}>
          <ArtworkPolaroid artwork={pieces[0]} tape="yellow" className="-rotate-[3deg]" sizes={pieceSizes} />
          <ArtDoodle kind="sun" className="absolute -right-10 -top-4 hidden h-14 w-14 text-[#f4ba05] md:block" />
        </div>
      ) : (
        <div className="relative z-10 col-span-2 mx-auto mt-8 w-[60%] max-w-[260px]">
          <ArtPhotoPolaroid src={FALLBACK_PHOTO.src} alt={FALLBACK_PHOTO.alt} sizes={pieceSizes} tape="yellow"
            className="-rotate-[3deg]" />
        </div>
      )}
      {pieces[1] && (
        <div className="relative z-10 mt-14">
          <ArtworkPolaroid artwork={pieces[1]} tape="blue" className="rotate-[3deg]" sizes={pieceSizes} />
          <ArtDoodle kind="heart" className="absolute -left-6 top-2 h-8 w-7 rotate-[-12deg] text-[#8c9ac8] sm:-left-9 sm:top-4 sm:h-11 sm:w-9" />
          <ArtDoodle kind="star" className="absolute -bottom-6 -left-8 hidden h-10 w-10 text-[#739ebf] md:block" />
        </div>
      )}
    </div>
  )
}
