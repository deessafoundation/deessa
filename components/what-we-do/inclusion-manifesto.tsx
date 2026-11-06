import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import styles from "./inclusion-manifesto.module.css"

export function InclusionManifesto() {
  return (
    <section
      id="inclusion-manifesto"
      aria-labelledby="inclusion-manifesto-heading"
      className={cn(styles.manifestoSection, "relative overflow-hidden py-16 sm:py-20 md:py-24 text-center")}
    >
      {/* Soft ambient background glows */}
      <div
        aria-hidden="true"
        className={cn(
          styles.decor,
          styles.glowLeft,
          "pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full blur-3xl opacity-60",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          styles.decor,
          styles.glowRight,
          "pointer-events-none absolute -bottom-16 -right-16 w-80 h-80 rounded-full blur-3xl opacity-60",
        )}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center justify-center mb-5 sm:mb-6">
          <span
            className={cn(
              styles.badge,
              "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-comic text-xs font-bold uppercase tracking-widest",
            )}
          >
            <Sparkles aria-hidden="true" className={cn(styles.badgeIcon, "size-3.5")} />
            <span>Our Shared Conviction</span>
          </span>
        </div>

        {/* Main Heading */}
        <h2
          id="inclusion-manifesto-heading"
          className={cn(
            styles.heading,
            "font-marissa text-[26px] sm:text-[34px] md:text-[44px] lg:text-[48px] leading-[1.2] mb-6 sm:mb-7",
          )}
        >
          <span className="block">Inclusion Is More Than a Belief.</span>
          <span className={cn(styles.headingAccent, "block mt-1")}>
            It Is a Collective Responsibility.
          </span>
        </h2>

        {/* Decorative Divider */}
        <div aria-hidden="true" className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <span className={cn(styles.dividerLine, "w-10 sm:w-16 h-px")} />
          <span className={cn(styles.dividerDot, "size-1.5 rounded-full")} />
          <span className={cn(styles.dividerLine, "w-10 sm:w-16 h-px")} />
        </div>

        {/* 3-Beat Journey Indicator */}
        <div className="max-w-2xl mx-auto mb-7 sm:mb-9">
          <div
            className={cn(
              styles.journeyTrack,
              "flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-[13px] font-comic font-bold",
            )}
          >
            <span className={cn(styles.journeyStep, styles.stepSky)}>
              Begins with Awareness
            </span>
            <span aria-hidden="true" className={styles.journeyArrow}>→</span>
            <span className={cn(styles.journeyStep, styles.stepMint)}>
              Grows through Understanding
            </span>
            <span aria-hidden="true" className={styles.journeyArrow}>→</span>
            <span className={cn(styles.journeyStep, styles.stepPurple)}>
              Becomes Reality through Action
            </span>
          </div>
        </div>

        {/* Manifesto Body Copy */}
        <div className="max-w-2xl mx-auto">
          <p
            className={cn(
              styles.bodyText,
              "font-comic text-base sm:text-lg md:text-[19px] leading-[1.8] sm:leading-[1.85]",
            )}
          >
            We believe meaningful inclusion begins with <strong className={styles.highlightText}>awareness</strong>, grows
            through <strong className={styles.highlightText}>understanding</strong>, and becomes reality through{" "}
            <strong className={styles.highlightText}>collective action</strong>.
          </p>
          <p
            className={cn(
              styles.conclusionText,
              "mt-3.5 font-comic text-base sm:text-lg md:text-[19px] leading-[1.8] sm:leading-[1.85]",
            )}
          >
            Together, we are working towards a future where{" "}
            <strong className={styles.belongText}>every child belongs</strong> and{" "}
            <strong className={styles.belongText}>every voice matters</strong>.
          </p>
        </div>
      </div>
    </section>
  )
}
