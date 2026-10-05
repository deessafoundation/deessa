import { cn } from "@/lib/utils"
import decorStyles from "./decor.module.css"

/* The hero's photo-backing cloud. The viewBox holds the path's full Bézier extent plus margin, so no curve is clipped. */
const CLOUD_VIEW_BOX = "0 -6 800 640"
const CLOUD_PATH =
  "M112 41C194-3 267 27 346 27 439 27 568-24 660 11c77 30 99 177 90 299-10 142-63 271-191 296-124 24-266 16-369-16C76 555 68 471 102 390c35-85 18-163-14-229C66 115 72 63 112 41Z"

/** Soft sky cloud from the hero, used behind a framed photo. Decorative only; the caller sets offsets and size. */
export function PastelBlob({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-tts-ignore=""
      viewBox={CLOUD_VIEW_BOX}
      className={cn(decorStyles.decor, "pointer-events-none absolute h-auto", className)}
    >
      <path d={CLOUD_PATH} fill="#DFF3FF" />
    </svg>
  )
}
