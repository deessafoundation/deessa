import type React from "react"
import { cn } from "@/lib/utils"
import { BrushBar } from "@/components/decor/brush-bar"
import { homeUi } from "./home-ui"

type Align = "center" | "start" | "responsive"

const ALIGN_TEXT: Record<Align, string> = {
  center: "text-center",
  start: "text-left",
  responsive: "text-center md:text-left",
}

/** Hero-style eyebrow: comic font with a hand-drawn blue brush bar. */
export function HomeEyebrow({
  children,
  align = "center",
  className,
}: {
  children: React.ReactNode
  align?: Align
  className?: string
}) {
  return (
    <p
      className={cn(
        homeUi.eyebrow,
        "flex items-center gap-3 font-comic text-base leading-snug text-[#445E7B] sm:text-lg",
        align === "center" && "justify-center",
        align === "responsive" && "justify-center md:justify-start",
        className,
      )}
    >
      <BrushBar className="h-[1.6em] w-[6px] shrink-0" />
      <span>{children}</span>
    </p>
  )
}

/**
 * Section header in the hero's language: navy Marissa heading with one highlighted phrase in accent blue.
 * `underline` adds the hero's yellow paint stroke under the accent (on by default).
 * The literal space between `title` and `accent` keeps the heading's textContent (and TTS digests) unchanged.
 */
export function HomeSectionHeading({
  eyebrow,
  title,
  accent,
  underline = true,
  intro,
  align = "center",
  id,
  className,
  titleClassName,
}: {
  eyebrow?: string
  title?: React.ReactNode
  accent?: string
  underline?: boolean
  intro?: React.ReactNode
  align?: Align
  id?: string
  className?: string
  titleClassName?: string
}) {
  return (
    <div className={cn(ALIGN_TEXT[align], className)}>
      {eyebrow?.trim() ? <HomeEyebrow align={align}>{eyebrow}</HomeEyebrow> : null}
      <h2
        id={id}
        className={cn(
          homeUi.heading,
          "mt-4 text-[1.875rem] leading-[1.15] sm:text-[2.5rem] lg:text-[3.25rem]",
          titleClassName,
        )}
      >
        {title}
        {accent ? (
          <>
            {title ? " " : null}
            <span className={underline ? homeUi.accent : homeUi.accentInk}>{accent}</span>
          </>
        ) : null}
      </h2>
      {intro ? (
        <p
          className={cn(
            homeUi.body,
            "mt-4 max-w-2xl",
            align === "center" && "mx-auto",
            align === "responsive" && "mx-auto md:mx-0",
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  )
}
