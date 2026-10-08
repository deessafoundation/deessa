import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { artworkAnchor, type Artwork } from "@/lib/arts/types"
import { ArtTape, type ArtTapeColor } from "./art-decor"
import styles from "./arts.module.css"

const DEFAULT_ARTWORK_SIZES = "(min-width: 1920px) 440px, (min-width: 1280px) 24vw, (min-width: 768px) 340px, 75vw"

// Landscape pieces first, then portrait, so a collage opens with a wide frame.
export function pickCollagePieces(artworks: Artwork[], count = 2) {
  return [...artworks.filter((artwork) => artwork.width >= artwork.height),
    ...artworks.filter((artwork) => artwork.width < artwork.height)].slice(0, count)
}

// Taped polaroid linking to the artwork's lightbox on /arts.
export function ArtworkPolaroid({ artwork, tape, className, sizes = DEFAULT_ARTWORK_SIZES }: {
  artwork: Artwork
  tape: ArtTapeColor
  className?: string
  sizes?: string
}) {
  // Frame just the canvas in this photograph, retaining the original image.
  const canvasPhoto = artwork.src.includes("floral-canvas")
  return (
    // data-tts-ignore: the page reader skips the artwork names; screen readers still get the label.
    <Link href={"/arts#" + artworkAnchor(artwork.id)} aria-label={"View “" + artwork.title + "” in the gallery"}
      data-tts-ignore=""
      className={cn(styles.frame, styles.tilt,
        "group relative block rounded-[2px] border-2 border-[#e5ded3] bg-[#fffdf8] p-2.5 sm:p-3 xl:p-[14px]",
        "shadow-[inset_0_0_0_2px_#fff,inset_0_0_0_5px_#f1eae0,0_18px_25px_-12px_rgba(93,65,30,0.35),-5px_5px_12px_rgba(93,65,30,0.1)]",
        "transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_22px_30px_-12px_rgba(93,65,30,0.4)]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B5F8A] focus-visible:ring-offset-4",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0", className)}>
      <ArtTape color={tape} />
      <span className={cn(styles.mat, "relative block overflow-hidden border border-[#d8d2c5] bg-[#f5f0e7]", canvasPhoto && "aspect-square")}
        style={canvasPhoto ? undefined : { aspectRatio: artwork.width + " / " + artwork.height }}>
        <Image src={artwork.src} alt={artwork.alt}
          width={canvasPhoto ? artwork.width : undefined} height={canvasPhoto ? artwork.height : undefined}
          fill={!canvasPhoto} sizes={sizes}
          className={canvasPhoto ? "absolute -left-[51%] -top-[5%] h-[114%] w-[169%] max-w-none object-fill" : "object-contain"} />
      </span>
    </Link>
  )
}

// Taped polaroid for a static photo (not linked to the gallery).
export function ArtPhotoPolaroid({ src, alt, sizes, tape = "cream", className, matClassName = "aspect-[3/4]",
  imageClassName = "object-contain", loading, fetchPriority }: {
  src: string
  alt: string
  sizes: string
  tape?: ArtTapeColor
  className?: string
  matClassName?: string
  imageClassName?: string
  loading?: "eager" | "lazy"
  fetchPriority?: "high" | "low" | "auto"
}) {
  return <figure className={cn(styles.frame, styles.tilt,
    "relative m-0 rounded-[2px] border-2 border-[#e5ded3] bg-[#fffdf8] p-2.5 sm:p-3 xl:p-[14px]",
    "shadow-[inset_0_0_0_2px_#fff,inset_0_0_0_5px_#f1eae0,0_18px_25px_-12px_rgba(93,65,30,0.35)]", className)}>
    <ArtTape color={tape} />
    <div className={cn(styles.mat, "relative overflow-hidden border border-[#d8d2c5] bg-[#f5f0e7]", matClassName)}>
      <Image src={src} alt={alt} fill sizes={sizes} loading={loading} fetchPriority={fetchPriority}
        className={imageClassName} />
    </div>
  </figure>
}
