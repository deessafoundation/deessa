"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { isSafeMediaUrl, isSafeWebsiteUrl } from "@/lib/media-validation"
import styles from "./team-card.module.css"

const socialPaths = {
  "facebook": "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  "twitter": "M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.22-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.72 6.24 5.44-6.24zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z",
  "linkedin": "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z",
  "instagram": "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  "tiktok": "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.18z",
  "whatsapp": "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
}

export interface AboutTeamMember {
  id?: string
  name: string
  role: string
  tier?: string | null
  is_featured?: boolean
  bio: string | null
  image: string | null
  social_links?: Partial<Record<keyof typeof socialPaths, string | null>> | null
}

function TeamPortrait({ src, name, active }: { src: string | null; name: string; active: boolean }) {
  const [attempt, setAttempt] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) setAttempt((value) => value + 1)
  }, [])
  if (!src || !isSafeMediaUrl(src) || attempt >= 2)
    return (
      <div className={cn(styles.fallback, "flex h-full w-full items-center justify-center")}>
        <span className="font-marissa text-6xl font-medium" aria-hidden="true">
          {name.charAt(0)}
        </span>
      </div>
    )
  return (
    <img
      ref={imgRef}
      src={attempt ? `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}` : src}
      alt={`Portrait of ${name}`}
      decoding="async"
      onError={() => setAttempt((value) => value + 1)}
      className={cn(
        "h-full w-full object-cover transition-all duration-700",
        active ? "scale-105 saturate-100" : "scale-100 saturate-0 group-hover:scale-105 group-hover:saturate-100"
      )}
    />
  )
}

export function TeamCard({
  member,
  index,
  active,
  onActivate,
  onSelect,
  reduced,
}: {
  member: AboutTeamMember
  index: number
  active: boolean
  onActivate: (active: boolean) => void
  onSelect?: (member: AboutTeamMember) => void
  reduced: boolean
}) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)")
    const sync = () => setMobile(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])
  const profileId = `about-team-profile-${member.id || index}`

  const handleCardClick = () => {
    onActivate(!active)
    onSelect?.(member)
  }

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : index * 0.12 }}
      className={cn(
        styles.card,
        "team-card group relative aspect-[4/5.2] w-full overflow-hidden rounded-2xl bg-muted shadow-xs border border-border/70 transition-all duration-300 hover:shadow-xl hover:border-primary/40 cursor-pointer"
      )}
      onClick={handleCardClick}
      onMouseEnter={() => onActivate(true)}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement)) onActivate(false)
      }}
      onFocusCapture={() => onActivate(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onActivate(false)
      }}
    >
      {/* Full Photo Background */}
      <TeamPortrait key={member.image} src={member.image} name={member.name} active={active || mobile} />

      {/* Accessible Click Target / Focus Outline for Screen Readers */}
      <button
        type="button"
        aria-label={`${active ? "Hide" : "View"} ${member.name}'s profile`}
        aria-expanded={active}
        aria-controls={profileId}
        onClick={(e) => {
          e.stopPropagation()
          handleCardClick()
        }}
        className="absolute inset-0 z-10 hidden min-h-11 w-full cursor-pointer rounded-2xl focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-white sm:block"
      />

      {/* Mobile-Only Default Label (Subtle bottom gradient showing name & role) */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent sm:hidden">
        <h3 className="font-comic text-base font-bold text-white leading-tight">{member.name}</h3>
        <p className="font-dm-sans text-xs text-white/80 mt-0.5">{member.role}</p>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white mt-1.5 underline decoration-white/50">
          Read bio <span aria-hidden="true">→</span>
        </span>
      </div>

      {/* Desktop Hover & Mobile Active Slide-Up Overlay */}
      <div
        id={profileId}
        inert={!active && !mobile}
        className={cn(
          styles.overlay,
          "absolute inset-x-0 bottom-0 z-20 transition-all duration-400 ease-out max-sm:translate-y-0",
          active
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100"
        )}
      >
        <div className="p-5 pt-8 sm:p-6 sm:pt-10 flex flex-col justify-end text-left">
          <h3 className="font-comic text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
            {member.name}
          </h3>
          <p className="font-dm-sans text-xs sm:text-sm font-medium text-white/85 mt-0.5">
            {member.role}
          </p>

          {member.bio && (
            <p className="font-sans text-xs leading-relaxed text-white/80 line-clamp-3 mt-2.5">
              {member.bio}
            </p>
          )}

          {/* Action Row: Read More & Social Channels */}
          <div className="mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:underline underline-offset-2">
              Read more <span aria-hidden="true">→</span>
            </span>

            {/* Social Icons (stop propagation so clicking social doesn't open modal) */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {(Object.keys(socialPaths) as (keyof typeof socialPaths)[]).map((platform) => {
                const href = member.social_links?.[platform]
                if (!href || !isSafeWebsiteUrl(href)) return null
                return (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on ${platform} (opens in a new tab)`}
                    className={cn(
                      styles.social,
                      "inline-flex size-8 items-center justify-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    )}
                    data-platform={platform}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true">
                      <path d={socialPaths[platform]} />
                    </svg>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
