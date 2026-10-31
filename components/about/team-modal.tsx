"use client"

import { useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Quote, ShieldCheck } from "lucide-react"
import { isSafeMediaUrl, isSafeWebsiteUrl } from "@/lib/media-validation"
import { TEAM_TIER_DETAILS, type TeamTier } from "@/lib/types/team-input"
import type { AboutTeamMember } from "./team-card"
import { cn } from "@/lib/utils"
import styles from "./team-modal.module.css"

const socialPaths: Record<string, string> = {
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  twitter: "M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.22-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.72 6.24 5.44-6.24zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z",
  linkedin: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  tiktok: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.18z",
  whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
}

export interface TeamMemberModalProps {
  member: AboutTeamMember | null
  allMembers: AboutTeamMember[]
  onClose: () => void
  onSelectMember: (member: AboutTeamMember) => void
}

export function TeamMemberModal({
  member,
  allMembers,
  onClose,
  onSelectMember,
}: TeamMemberModalProps) {
  const currentIndex = member ? allMembers.findIndex((m) => (m.id && m.id === member.id) || m.name === member.name) : -1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < allMembers.length - 1

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onSelectMember(allMembers[currentIndex - 1])
    }
  }, [hasPrev, currentIndex, allMembers, onSelectMember])

  const handleNext = useCallback(() => {
    if (hasNext) {
      onSelectMember(allMembers[currentIndex + 1])
    }
  }, [hasNext, currentIndex, allMembers, onSelectMember])

  // Keyboard navigation: ArrowLeft / ArrowRight
  useEffect(() => {
    if (!member) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrev()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [member, handlePrev, handleNext])

  if (!member) return null

  const tierKey = (member.tier as TeamTier) || "vision"
  const tierMeta = TEAM_TIER_DETAILS[tierKey] || TEAM_TIER_DETAILS.vision

  // Split bio into distinct paragraphs
  const paragraphs = member.bio
    ? member.bio
        .split(/\n\s*\n|\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : []

  const socialKeys = member.social_links ? (Object.keys(member.social_links) as (keyof typeof socialPaths)[]) : []
  const hasSocials = socialKeys.some((k) => member.social_links?.[k] && isSafeWebsiteUrl(member.social_links[k]))

  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          styles.modalContent,
          "p-0 w-[95vw] sm:!max-w-2xl md:!max-w-3xl lg:!max-w-4xl xl:!max-w-[980px] max-h-[90vh] overflow-hidden rounded-3xl border border-border/80 shadow-2xl flex flex-col focus:outline-none"
        )}
      >
        {/* Top Control Bar: Context breadcrumb, counter & circular navigation */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 border-b border-border/70 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold whitespace-nowrap shadow-2xs",
                tierMeta.badgeTone
              )}
            >
              {tierMeta.label}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline truncate">
              • {tierMeta.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {allMembers.length > 1 && (
              <>
                <span className="text-xs text-muted-foreground font-mono tabular-nums px-2.5 py-1 rounded-full bg-muted border border-border/60">
                  {currentIndex + 1} of {allMembers.length}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    className="size-8 rounded-full border-border/70 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label={hasPrev ? `Previous member: ${allMembers[currentIndex - 1]?.name}` : "No previous member"}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    disabled={!hasNext}
                    className="size-8 rounded-full border-border/70 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label={hasNext ? `Next member: ${allMembers[currentIndex + 1]?.name}` : "No next member"}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <div className="h-4 w-px bg-border/80 mx-1" aria-hidden="true" />
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Close member biography dialog"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Modal Body: Balanced 2-Column Editorial Magazine Spread */}
        <div className={cn(styles.scrollArea, "flex-1 overflow-y-auto")}>
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-full">
            {/* Left Column: Generous Portrait & Verified Leadership Card */}
            <div className="md:col-span-5 lg:col-span-5 bg-muted/20 p-6 sm:p-7 lg:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-border/70">
              <div className="w-full aspect-[4/4.8] sm:aspect-[4/5] rounded-2xl overflow-hidden border border-border/80 shadow-md bg-muted relative">
                {member.image && isSafeMediaUrl(member.image) ? (
                  <img
                    src={member.image}
                    alt={`Portrait of ${member.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-6xl font-bold font-sans">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Social Channels if present */}
              {hasSocials && (
                <div className="mt-5 w-full">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {socialKeys.map((platform) => {
                      const href = member.social_links?.[platform]
                      if (!href || !isSafeWebsiteUrl(href)) return null
                      return (
                        <a
                          key={platform}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on ${platform} (opens in a new tab)`}
                          className={styles.socialBtn}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true">
                            <path d={socialPaths[platform]} />
                          </svg>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Institutional Governance Card (Eliminates empty space and gives institutional credibility) */}
              <div className="mt-5 w-full rounded-2xl bg-card border border-border/70 p-4 text-left shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-primary">
                  <ShieldCheck className="size-4 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Foundation Governance
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {tierMeta.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {tierMeta.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Role, and High-Craft Editorial Biography */}
            <div className="md:col-span-7 lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-start">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  {tierMeta.subtitle}
                </span>

                {/* Name: Crisp, Authoritative Sans-Serif Typography (No Marissa handwriting font) */}
                <DialogTitle className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-1.5 tracking-tight leading-tight">
                  {member.name}
                </DialogTitle>

                <DialogDescription className="text-sm sm:text-base font-semibold text-primary/90 mt-1">
                  {member.role}
                </DialogDescription>
              </div>

              <div className="h-px bg-gradient-to-r from-border via-border/60 to-transparent my-5" aria-hidden="true" />

              {/* Formatted Full Biography */}
              <div className="space-y-4 text-foreground/85 text-sm sm:text-[15px] leading-relaxed">
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, idx) => {
                    // Highlight the concluding mission/vision statement if multi-paragraph
                    const isConclusion = paragraphs.length >= 3 && idx === paragraphs.length - 1
                    if (isConclusion) {
                      return (
                        <blockquote
                          key={idx}
                          className="rounded-2xl border-l-3 border-primary bg-primary/5 p-4 sm:p-5 italic text-foreground/90 text-sm sm:text-[15px] leading-relaxed my-3"
                        >
                          <Quote className="size-4 text-primary mb-1 opacity-70" />
                          "{p}"
                        </blockquote>
                      )
                    }

                    // Lead paragraph gets slightly larger, confident presence
                    const isLead = idx === 0
                    return (
                      <p
                        key={idx}
                        className={cn(
                          "font-sans leading-relaxed",
                          isLead ? "text-foreground font-normal text-sm sm:text-base" : "text-muted-foreground"
                        )}
                      >
                        {p}
                      </p>
                    )
                  })
                ) : (
                  <p className="font-sans italic text-muted-foreground">
                    Biography details for {member.name} will be added soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
