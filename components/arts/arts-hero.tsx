import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { artworkAnchor, type Artwork } from "@/lib/arts/types"
import type { ArtsContent } from "@/lib/arts/content"
import { ArtBadge, ArtDoodle, ArtEyebrow, ArtHeadingUnderline, ArtSplash } from "./art-decor"
import { ArtPhotoPolaroid } from "./art-frames"
import artStyles from "./arts.module.css"
import styles from "./arts-hero.module.css"

// /arts hero — "opening night": the latest pieces hang from a twine line with wooden
// pegs, the exhibition's title card hangs at the centre of the line (desktop), and the
// headline sits centred beneath, flanked on wide screens by photos of the creative space.
// Same palette, fonts and paper/tape/doodle vocabulary as the homepage art section.

const CREATIVE_SPACE = {
  artist: {
    src: "/artWork/art_pic1.jpeg",
    alt: "A girl sitting on a pink exercise ball and making art on walls filled with her drawings.",
    width: 960,
    height: 1280,
  },
  wall: {
    src: "/artWork/art_pic2.jpeg",
    alt: "A wall covered with children's paintings and drawings pinned up in a home creative space.",
    width: 1280,
    height: 960,
  },
}

type LineItem =
  | { kind: "art"; artwork: Artwork }
  | { kind: "photo"; src: string; alt: string; width: number; height: number }

const TILTS = ["-4deg", "3deg", "-2.5deg", "4deg"]
const TAG_TILT = "2deg"
const MOBILE_COUNT = 3
const TABLET_COUNT = 4

// The twine is a quadratic curve in a 1000×100 box, drawn 6% wider than the line on
// each side so its ends run off the edges. Returns the peg height (fraction of the box)
// at a column centre `f` (0–1 across the line).
const OVERHANG = 0.06
const ENDS_Y = 10
const CONTROL_Y = 100
const TWINE_PATH = `M0 ${ENDS_Y} Q500 ${CONTROL_Y} 1000 ${ENDS_Y}`
function pegHeight(index: number, columns: number) {
  const t = (OVERHANG + (index + 0.5) / columns) / (1 + 2 * OVERHANG)
  return Number(((ENDS_Y + 2 * t * (1 - t) * (CONTROL_Y - ENDS_Y)) / 100).toFixed(3))
}

// Featured first, then alternate wide and tall pieces so the line has rhythm.
function pickLinePieces(artworks: Artwork[], count = TABLET_COUNT) {
  const ordered = [...artworks.filter((a) => a.isFeatured), ...artworks.filter((a) => !a.isFeatured)]
  const wide = ordered.filter((a) => a.width >= a.height)
  const tall = ordered.filter((a) => a.width < a.height)
  const picked: Artwork[] = []
  while (picked.length < count && (wide.length || tall.length)) {
    const next = picked.length % 2 === 0 ? (wide.shift() ?? tall.shift()) : (tall.shift() ?? wide.shift())
    if (next) picked.push(next)
  }
  return picked
}

function Peg() {
  return <span aria-hidden="true" className={cn(styles.decor, styles.peg)} />
}

const LINE_SIZES = "(min-width: 1280px) 232px, (min-width: 1024px) 18vw, (min-width: 768px) 22vw, 30vw"

function HangingCard({ item }: { item: LineItem }) {
  if (item.kind === "photo") {
    return (
      <figure className={cn(styles.card, "m-0 p-1.5 sm:p-2 lg:p-3")}>
        <Peg />
        <span className={cn(styles.mat, "relative block overflow-hidden")}
          style={{ aspectRatio: item.width + " / " + item.height }}>
          <Image src={item.src} alt={item.alt} fill sizes={LINE_SIZES} className="object-contain" />
        </span>
      </figure>
    )
  }
  const { artwork } = item
  // Frame just the canvas in this photograph, as the homepage frames do.
  const canvasPhoto = artwork.src.includes("floral-canvas")
  return (
    // data-tts-ignore: the page reader skips artwork names; screen readers still get the label.
    <Link href={"/arts#" + artworkAnchor(artwork.id)} aria-label={"View “" + artwork.title + "” in the gallery"}
      data-tts-ignore="" className={cn(styles.card, "p-1.5 sm:p-2 lg:p-3")}>
      <Peg />
      <span className={cn(styles.mat, "relative block overflow-hidden", canvasPhoto && "aspect-square")}
        style={canvasPhoto ? undefined : { aspectRatio: artwork.width + " / " + artwork.height }}>
        <Image src={artwork.src} alt={artwork.alt}
          width={canvasPhoto ? artwork.width : undefined} height={canvasPhoto ? artwork.height : undefined}
          fill={!canvasPhoto} sizes={LINE_SIZES}
          className={canvasPhoto ? "absolute -left-[51%] -top-[5%] h-[114%] w-[169%] max-w-none object-fill" : "object-contain"} />
      </span>
    </Link>
  )
}

function itemIsWide(item: LineItem) {
  return item.kind === "art" ? item.artwork.width >= item.artwork.height : item.width >= item.height
}

/** The clothesline: twine, pegged artworks and (desktop) the title card at the centre. */
function ArtsClothesline({ items, badge }: { items: LineItem[]; badge: string }) {
  const count = items.length
  const sm = Math.min(MOBILE_COUNT, count)
  const md = Math.min(TABLET_COUNT, count)
  const lg = count + 1
  const tagAt = Math.floor(count / 2)
  const gridVars = { "--cols-sm": sm, "--cols-md": md, "--cols-lg": lg } as CSSProperties

  const slots = items.map((item, i) => {
    const lgIndex = i < tagAt ? i : i + 1
    const vars = {
      "--y-sm": pegHeight(i, sm),
      "--y-md": pegHeight(i, md),
      "--y-lg": pegHeight(lgIndex, lg),
      "--tilt": TILTS[i % TILTS.length],
      "--i": lgIndex,
    } as CSSProperties
    return (
      <div key={item.kind === "art" ? item.artwork.id : item.src} style={vars}
        className={cn(styles.hang, i >= MOBILE_COUNT && "max-md:hidden", i >= TABLET_COUNT && "max-lg:hidden")}>
        <div className={cn(styles.swing, "mx-auto",
          itemIsWide(item) ? "w-[88%] max-w-[212px]" : "w-[66%] max-w-[156px]")}>
          <HangingCard item={item} />
        </div>
      </div>
    )
  })

  const tagVars = { "--y-lg": pegHeight(tagAt, lg), "--tilt": TAG_TILT, "--i": tagAt } as CSSProperties
  slots.splice(tagAt, 0,
    <div key="title-card" style={tagVars} className={cn(styles.hang, "hidden lg:block")}>
      <div className={cn(styles.swing, "mx-auto w-[94%] max-w-[270px]")}>
        <Peg />
        <ArtBadge doodleClassName="h-7 w-7"
          className="px-4 py-4 text-center text-[clamp(1rem,1.25vw,1.25rem)] leading-snug sm:py-5">
          {badge}
        </ArtBadge>
      </div>
    </div>,
  )

  return (
    <div className={cn(styles.line, "relative")} style={gridVars}>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 1000 100" preserveAspectRatio="none"
        className={cn(styles.decor, artStyles.decor, styles.twine)}>
        <path d={TWINE_PATH} fill="none" stroke="currentColor" strokeWidth={2.25}
          strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={TWINE_PATH} fill="none" stroke="#e8dcc6" strokeWidth={1} strokeDasharray="2 6"
          strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span aria-hidden="true" className={cn(styles.decor, artStyles.decor, styles.tail, styles.tailStart, "hidden lg:block")} />
      <span aria-hidden="true" className={cn(styles.decor, artStyles.decor, styles.tail, styles.tailEnd, "hidden lg:block")} />
      {slots}
    </div>
  )
}

/** Creative-space photo taped beside the headline (wide screens only). */
function SidePhoto({ photo, className, frameClassName, tape }: {
  photo: (typeof CREATIVE_SPACE)["artist"]
  className: string
  frameClassName: string
  tape: "cream" | "yellow" | "blue"
}) {
  return (
    <div className={cn("absolute hidden xl:block", className)}>
      <ArtPhotoPolaroid src={photo.src} alt={photo.alt} tape={tape} sizes="260px"
        matClassName={photo.width >= photo.height ? "aspect-[4/3]" : "aspect-[3/4]"}
        imageClassName="object-cover" className={frameClassName} />
    </div>
  )
}

export function ArtsHero({ copy, artworks }: { copy: ArtsContent["gallery"]; artworks: Artwork[] }) {
  const pieces = pickLinePieces(artworks)
  const items: LineItem[] = pieces.length
    ? pieces.map((artwork) => ({ kind: "art", artwork }))
    : [{ kind: "photo", ...CREATIVE_SPACE.artist }, { kind: "photo", ...CREATIVE_SPACE.wall }]

  return (
    <section aria-labelledby="arts-hero-heading"
      className={cn(styles.hero, "relative isolate overflow-hidden font-comic")}>
      <ArtSplash className="-right-28 -top-24 h-[360px] w-[min(90vw,460px)] opacity-40" />
      <ArtSplash className="-left-32 top-[38%] hidden h-[420px] w-[420px] -scale-x-100 opacity-30 md:block" />
      <Image src="/artWork/babys-breath-left.png" alt="" width={1024} height={1536} sizes="170px"
        className={cn(artStyles.decor, "pointer-events-none absolute -bottom-6 -left-10 hidden w-[130px] rotate-[10deg] select-none md:block lg:w-[170px]")} />
      <Image src="/artWork/babys-breath-center.png" alt="" width={1024} height={1536} sizes="150px"
        className={cn(artStyles.decor, "pointer-events-none absolute -bottom-8 -right-6 hidden w-[110px] -rotate-[14deg] -scale-x-100 select-none md:block lg:w-[150px]")} />

      <div className="relative mx-auto max-w-[1440px] px-4 pb-14 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-12 lg:pb-20 xl:px-16">
        <nav aria-label="Breadcrumb" className="mb-8 lg:mb-6">
          <ol className={cn(styles.crumbs, "flex items-center gap-2 text-[0.8125rem]")}>
            <li>
              <Link href="/" className={cn(styles.crumbLink, "-my-3 inline-block py-3")}>Home</Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">Arts</li>
          </ol>
        </nav>

        <ArtsClothesline items={items} badge={copy.heroBadge} />

        <div className="relative mt-10 sm:mt-12 lg:mt-9">
          {pieces.length > 0 && <>
            <SidePhoto photo={CREATIVE_SPACE.artist} tape="yellow" frameClassName="-rotate-[5deg]"
              className="left-0 top-[2%] w-[15%] max-w-[230px]" />
            <SidePhoto photo={CREATIVE_SPACE.wall} tape="blue" frameClassName="rotate-[4deg]"
              className="right-0 top-[14%] w-[19%] max-w-[290px]" />
            <ArtDoodle kind="rays" className="absolute left-[16%] -top-2 hidden h-12 w-12 -rotate-[20deg] text-[#0B5F8A] xl:block" />
            <ArtDoodle kind="leaf" className="absolute bottom-[4%] right-[7%] hidden h-24 w-14 text-[#2798a0] xl:block" />
          </>}

          <div className="relative mx-auto max-w-[720px] text-center">
            <ArtSplash className="-inset-x-10 -inset-y-12 opacity-45 sm:-inset-x-20" />
            <ArtEyebrow text={copy.eyebrow}
              className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#172e49] sm:text-sm [&>span:last-child]:mx-auto" />
            <h1 id="arts-hero-heading"
              className={cn(artStyles.heading, "text-balance font-marissa text-[clamp(2.125rem,9vw,3.25rem)] leading-[1.06] text-[#063F5B]",
                "[-webkit-text-stroke:1.25px_currentColor] md:text-[clamp(3rem,4.6vw,4.25rem)] md:[-webkit-text-stroke:1.8px_currentColor]")}>
              <span className="block">{copy.heading}</span>{" "}
              <span className={cn(artStyles.accent, "relative mt-1 inline-block pb-4 text-[#1A8AC2]")}>
                {copy.headingAccent}
                <ArtHeadingUnderline />
              </span>
            </h1>
            <p className={cn(artStyles.muted, "mx-auto mt-4 max-w-[600px] text-balance lg:max-w-[660px] text-[0.9375rem] leading-[1.65] sm:text-lg sm:leading-[1.6]")}>
              {copy.intro}
            </p>
            <div className="mt-8 flex flex-col items-center gap-6 lg:mt-7">
              <a href="#collection" data-a11y-control=""
                className={cn(styles.cta, "inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full px-6 text-base font-bold sm:min-h-[58px] sm:px-8 sm:text-lg")}>
                Explore the collection
                <ArrowDown aria-hidden="true" className={cn(styles.ctaIcon, "h-5 w-5")} />
              </a>
              <ArtBadge doodleClassName="h-6 w-6"
                className="w-fit max-w-[92%] rotate-[-2deg] px-5 text-[0.9375rem] leading-tight sm:text-base lg:hidden">
                {copy.heroBadge}
              </ArtBadge>
            </div>
            <ArtDoodle kind="sun" className="absolute -right-1 -top-3 h-9 w-9 text-[#f4ba05] sm:-right-6 sm:h-14 sm:w-14" />
            <ArtDoodle kind="heart" className="absolute -left-2 top-[46%] hidden h-12 w-10 -rotate-[10deg] text-[#ef8993] md:block lg:-left-10" />
            <ArtDoodle kind="star" className="absolute -right-4 bottom-[18%] hidden h-10 w-10 text-[#739ebf] md:block lg:-right-12" />
          </div>
        </div>
      </div>
    </section>
  )
}
