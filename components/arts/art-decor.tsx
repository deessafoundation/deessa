import type { ReactNode } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import styles from "./arts.module.css"

// Shared art-section decor (homepage art feature and /arts). Every piece here is
// decorative or a styling wrapper: decor layers carry `styles.decor` + aria-hidden so
// contrast modes, forced colours, print and the page reader all skip them.

// Mobile (<768px) torn-paper copy card. Stretching the whole watercolor sheet over a tall,
// narrow card thickens and clips the frame, so phones swap the sheet for a 9-slice frame
// (ArtCopyFrame) whose border widths (--art-frame-*) also set the copy padding.
// Shared so /arts follows the same mobile pattern as the homepage.
export const ART_COPY_PANEL_MOBILE = cn(styles.copyCard,
  "max-md:w-full max-md:pt-[calc(var(--art-frame-t)+1.25rem)] max-md:pr-[calc(var(--art-frame-r)+0.5rem)]",
  "max-md:pb-[calc(var(--art-frame-b)+0.25rem)] max-md:pl-[calc(var(--art-frame-l)+0.75rem)]")
export const ART_COPY_BACKDROP_MOBILE = "max-md:hidden"
// Phone heading size: two-to-three comfortable lines inside the narrower card.
export const ART_HEADING_MOBILE = "max-md:text-[clamp(1.75rem,8.2vw,2.25rem)] max-md:[-webkit-text-stroke:1px_currentColor]"
// Fade the top/bottom of a splash layer on phones so its paper edge never shows as a seam.
export const ART_SPLASH_MOBILE =
  "max-md:[mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_88%,transparent)]"

// Same torn-paper card at every width (/arts hero). Pair with <ArtCopyFrame allWidths />.
export const ART_COPY_PANEL = cn(styles.copyCardAll,
  "pt-[calc(var(--art-frame-t)+1.25rem)] pr-[calc(var(--art-frame-r)+0.5rem)]",
  "pb-[calc(var(--art-frame-b)+0.25rem)] pl-[calc(var(--art-frame-l)+0.75rem)]",
  "sm:pt-[calc(var(--art-frame-t)+2rem)] sm:pr-[calc(var(--art-frame-r)+1.5rem)]",
  "sm:pb-[calc(var(--art-frame-b)+0.75rem)] sm:pl-[calc(var(--art-frame-l)+2rem)]")

export function ArtCopyFrame({ allWidths = false }: { allWidths?: boolean }) {
  return <span aria-hidden="true"
    className={cn(styles.decor, allWidths ? styles.copyFrameAll : cn(styles.copyFrame, "md:hidden"),
      "pointer-events-none absolute inset-0 -z-10 opacity-90")} />
}

// Yellow/pink/blue watercolor splashes with the paper keyed out, so they sit on any
// background without a paper-rectangle seam.
export function ArtSplash({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn(styles.decor, "pointer-events-none absolute -z-10 select-none", className)}>
    <Image src="/artWork/art-watercolor-splash.webp" alt="" fill sizes="(min-width: 768px) 640px, 100vw"
      className="object-fill" />
  </div>
}

// Only paper and watercolor are raster texture. All copy, artwork, framing,
// links and doodles remain independent, accessible HTML/SVG.
export function ArtPaperBackdrop({ part = "wall", className }: {
  part?: "wall" | "copy" | "gallery"
  className?: string
}) {
  const paper = "/artWork/art-watercolor-paper-no-shadow.png"

  return <div aria-hidden="true" className={cn(styles.decor,
    "pointer-events-none absolute -z-10 overflow-hidden select-none", className)}>
    {part === "wall" ? <Image src={paper} alt="" fill sizes="100vw"
      className="object-fill opacity-90" /> : <Image src={paper} alt=""
      width={1742} height={903} sizes="(min-width: 768px) 1400px, 900px"
      className={cn("absolute top-0 h-full max-w-none object-fill",
        part === "copy" ? "-left-[13%] w-[228%] opacity-85" : "-left-[150%] w-[250%] opacity-70")} />}
  </div>
}

const doodles = {
  heart: "M46 84C36 67 13 49 20 31C26 17 40 26 45 39C50 12 69 11 70 29C72 49 55 70 46 84Z",
  rays: "M22 54L7 43M42 39L30 15M61 31L64 4",
  sun: "M39 37C61 27 68 50 55 63C42 75 27 53 39 37ZM45 10L46 23M65 16L60 29M81 34L69 39M79 60L69 56M65 82L58 69M39 83L42 69M16 69L28 60M12 42L26 46M26 19L32 31",
  leaf: "M22 90C39 68 48 37 60 10C26 23 28 45 41 52M41 52L59 11M38 37L47 39M43 24L48 37M27 76C47 50 73 52 82 48C69 69 49 79 27 76ZM39 70L81 49M58 64L61 55",
  star: "M45 15L51 39L76 34L60 52L70 74L47 62L30 80L33 55L11 47L36 40Z",
  flower: "M48 46C21 45 16 28 26 25C39 19 45 37 48 46C28 17 42 4 49 16C56 26 51 38 48 46C56 15 74 18 67 32C63 40 55 44 48 46C75 33 88 48 70 54C59 58 52 52 48 46C64 63 56 80 47 63C41 56 45 49 48 46C35 72 18 67 26 55C32 48 42 47 48 46ZM48 49C53 61 56 76 48 95M53 77L35 65",
}

export function ArtDoodle({ kind, className }: { kind: keyof typeof doodles; className?: string }) {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 100 100"
    className={cn(styles.decor, "pointer-events-none", className)} fill="none" stroke="currentColor"
    strokeWidth={kind === "rays" ? 7 : 3.5} strokeLinecap="round" strokeLinejoin="round">
    <path d={doodles[kind]} />
  </svg>
}

export type ArtTapeColor = "cream" | "yellow" | "blue"

// Torn washi tape stuck across the top edge of a polaroid frame.
export function ArtTape({ color, className }: { color: ArtTapeColor; className?: string }) {
  return <span aria-hidden="true" className={cn(styles.decor,
    "pointer-events-none absolute -top-5 left-1/2 z-10 h-9 w-[26%] -translate-x-1/2 rotate-[-18deg] opacity-85",
    "[clip-path:polygon(0_5%,8%_0,17%_7%,27%_1%,39%_5%,50%_0,64%_6%,76%_1%,88%_7%,100%_2%,97%_24%,100%_45%,96%_65%,100%_91%,89%_100%,75%_94%,62%_100%,48%_94%,33%_100%,19%_95%,2%_100%,5%_72%,0_48%,4%_25%)]",
    "bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,#ffffff30_4px)]",
    color === "cream" ? "bg-[#fae9bd]" : color === "yellow" ? "bg-[#f9ce55]" : "rotate-[12deg] bg-[#6cb2d3]",
    className,
  )} />
}

// Yellow hand-drawn underline for the blue accent line of an art heading.
export function ArtHeadingUnderline({ className }: { className?: string }) {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 500 24" preserveAspectRatio="none"
    className={cn(styles.decor, "pointer-events-none absolute bottom-0 left-0 h-[0.23em] w-full overflow-visible", className)}>
    <path d="M4 17C99 6 218 3 335 7C406 8 460 10 495 14C359 12 194 14 5 23Z" fill="#f7bd09" />
  </svg>
}

// Eyebrow with a highlighter swipe behind the first word and a short gradient bar.
export function ArtEyebrow({ text, className }: { text: string; className?: string }) {
  const [first, ...rest] = text.split(" ")
  return <p className={cn(styles.eyebrow, className)}>
    <span className="relative inline-block">
      <span aria-hidden="true" className={cn(styles.decor, "absolute -inset-x-1 inset-y-0 -rotate-[3deg] bg-[#86d1ec]/65 [clip-path:polygon(1%_15%,95%_0,100%_85%,0_100%)]")} />
      <span className="relative">{first}</span>
    </span>{" "}{rest.join(" ")}
    <span aria-hidden="true" className={cn(styles.decor, "mt-2 block h-1 w-16 -rotate-[2deg] rounded-full bg-gradient-to-r from-[#b2bec6] to-[#39afe0]")} />
  </p>
}

// Three overlapping paint dots (yellow, pink, blue).
export function ArtColourDots({ className, dotClassName }: { className?: string; dotClassName?: string }) {
  return <span aria-hidden="true" className={cn(styles.decor, "flex shrink-0 -space-x-2", className)}>
    <span className={cn("h-6 w-6 rounded-full bg-[#f8c612] ring-2 ring-[#fffcf6]", dotClassName)} />
    <span className={cn("h-6 w-6 rounded-full bg-[#ed4b88] ring-2 ring-[#fffcf6]", dotClassName)} />
    <span className={cn("h-6 w-6 rounded-full bg-[#3FABDE] ring-2 ring-[#fffcf6]", dotClassName)} />
  </span>
}

// Torn-paper label with a flower doodle, e.g. "Made with imagination and heart".
export function ArtBadge({ children, className, doodleClassName }: {
  children: ReactNode
  className?: string
  doodleClassName?: string
}) {
  return <p className={cn(styles.chip,
    "relative z-10 flex items-center justify-center gap-2 px-3 py-3 font-comic font-bold text-[#0B5F8A]",
    "shadow-[0_12px_20px_-8px_rgba(100,64,20,0.3)] sm:py-4", className)}>
    <span aria-hidden="true" className={cn(styles.decor, "pointer-events-none absolute -inset-y-1 inset-x-0 bg-[#fff9ee] [clip-path:polygon(0_6%,6%_0,12%_4%,19%_0,28%_6%,35%_0,45%_4%,56%_0,64%_5%,74%_0,82%_5%,92%_0,100%_4%,97%_18%,100%_35%,98%_52%,100%_70%,97%_88%,100%_100%,87%_94%,78%_100%,68%_95%,57%_100%,45%_95%,34%_100%,23%_94%,12%_100%,0_94%,3%_72%,0_56%,3%_35%)]")} />
    <ArtDoodle kind="flower" className={cn("relative h-8 w-8 shrink-0 text-[#0B5F8A]", doodleClassName)} />
    <span className="relative">{children}</span>
  </p>
}
