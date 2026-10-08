import { cn } from "@/lib/utils"
import decorStyles from "./decor.module.css"

/** The hero eyebrow's hand-drawn blue brush bar. Decorative only; the caller sets size. */
export function BrushBar({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-tts-ignore=""
      viewBox="0 0 8 40"
      preserveAspectRatio="none"
      className={cn(decorStyles.decor, "pointer-events-none text-[#3FABDE]", className)}
    >
      <path
        d="M4.6 1.2C6.7 1.4 7.2 4 7 8.5c-.3 6.6.4 13 .1 19.6-.2 5.4-.5 10-3 10.7C1.6 39.4.9 35.6 1 30.5c.2-7.1-.4-14.2-.1-21.3C1.1 4.2 2 1 4.6 1.2Z"
        fill="currentColor"
      />
    </svg>
  )
}
