import { cn } from "@/lib/utils"
import type { HomeTone } from "./home-tone"
import styles from "./home-ui.module.css"

/** Pastel icon-circle fill + icon ink, matching the hero's benefit icons. */
export const HOME_TONES: Record<HomeTone, string> = {
  sky: "bg-[#E4F5FD] text-[#0B6FA4]",
  sunny: "bg-[#FFF6DF] text-[#9A6A00]",
  lavender: "bg-[#F3EEFF] text-[#6F3E96]",
  mint: "bg-[#E6F6F1] text-[#1F7A62]",
}

/** Soft tinted tiles (border + fill) for small stat blocks inside cards. */
export const HOME_TILE_TONES: Record<HomeTone, string> = {
  sky: "border-[#D7EEF9] bg-[#F2FAFE]",
  sunny: "border-[#F8E7B5] bg-[#FFFAEB]",
  lavender: "border-[#E6DDFB] bg-[#F8F5FF]",
  mint: "border-[#CDEEE4] bg-[#F1FBF7]",
}

/* Never use from-/via-/to-/bg-gradient/backdrop-blur here: app/globals.css repaints those in high contrast. */
export const homeUi = {
  surface: cn(styles.surface, "relative isolate overflow-hidden bg-white"),
  sectionY: "py-14 sm:py-20 lg:py-24",
  container: "relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12",
  heading: cn(styles.heading, "font-marissa text-[#063F5B] [-webkit-text-stroke:0.6px_currentColor] break-words"),
  accent: cn(styles.accent, "text-[#1A8AC2]"),
  /** Same accent blue, without the yellow paint underline. */
  accentInk: cn(styles.accentInk, "text-[#1A8AC2]"),
  body: cn(styles.body, "font-comic text-base leading-relaxed text-[#445E7B] sm:text-lg"),
  muted: cn(styles.muted, "font-comic text-[#4F6782]"),
  eyebrow: styles.eyebrow,
  inkVars: styles.inkVars,
  card: cn(styles.card, "rounded-3xl border border-[#E3F1F8] bg-white shadow-[0_8px_35px_rgba(52,112,150,0.08)]"),
  cardInteractive: cn(
    styles.lift,
    "transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#3FABDE]/45",
    "hover:shadow-[0_14px_40px_rgba(52,112,150,0.14)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/40",
  ),
  floatCard: cn(styles.floatCard, "rounded-[1.5rem] bg-white shadow-[0_8px_35px_rgba(52,112,150,0.10)]"),
  tile: cn(styles.tile, "rounded-2xl border"),
  iconCircle: cn(styles.iconCircle, "flex shrink-0 items-center justify-center rounded-full"),
  frame: cn(styles.frame, "relative isolate bg-white p-1.5 shadow-[0_18px_45px_-20px_rgba(52,112,150,0.35)] sm:p-2"),
  organicRadius: "[border-radius:12%_16%_13%_18%/15%_13%_17%_14%]",
  primaryButton: cn(
    styles.primaryBtn,
    "group inline-flex min-h-[3.375rem] items-center justify-center gap-3 rounded-[0.875rem] bg-[#006E9E] px-6 py-3",
    "font-comic text-[1.0625rem] font-bold leading-tight text-white transition-colors duration-200 hover:bg-[#094E72]",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/45 focus-visible:ring-offset-2",
  ),
  secondaryButton: cn(
    styles.secondaryBtn,
    "group inline-flex min-h-[3.375rem] items-center justify-center gap-3 rounded-[0.875rem] border-[1.5px] border-[#3FABDE]",
    "bg-white px-6 py-3 font-comic text-[1.0625rem] font-bold leading-tight text-[#006E9E] transition-colors duration-200",
    "hover:bg-[#E8F6FC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3FABDE]/45 focus-visible:ring-offset-2",
  ),
  buttonArrow: cn(
    styles.arrow,
    "size-[1.125rem] shrink-0 transition-transform duration-200 group-hover:translate-x-1",
    "motion-reduce:transition-none motion-reduce:group-hover:translate-x-0",
  ),
}
