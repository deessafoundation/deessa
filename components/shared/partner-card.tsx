"use client"

import { useState } from "react"
import Image from "next/image"
import type { ContextPartnerDetailed } from "@/lib/types/partners"
import styles from "./partner-card.module.css"
import { cn } from "@/lib/utils"

interface PartnerCardProps {
  partner: ContextPartnerDetailed
  /**
   * Display variant: 'grid' for card-style grid layout, 'inline' for horizontal row layout
   * @default 'grid'
   */
  variant?: "grid" | "inline"
  /**
   * Size preset: 'sm' | 'md' | 'lg'
   * @default 'md'
   */
  size?: "sm" | "md" | "lg"
  /**
   * Whether to show partner description (if available)
   * @default false
   */
  showDescription?: boolean
  /**
   * Whether the logo is clickable (links to partner website)
   * @default true
   */
  clickable?: boolean
  /**
   * Custom class name for the wrapper
   */
  className?: string
}

export function PartnerCard({
  partner,
  variant = "grid",
  size = "md",
  showDescription = false,
  clickable = true,
  className,
}: PartnerCardProps) {
  const [imageError, setImageError] = useState(false)
  const hasWebsite = !!partner.partner_website
  const shouldLink = clickable && hasWebsite

  // Logo URL (prefer storage path, fallback to legacy logo field)
  const logoUrl = partner.partner_logo || "/images/placeholder-partner.svg"

  // Size mapping for logo dimensions
  const sizeMap = {
    sm: { width: 120, height: 60 },
    md: { width: 160, height: 80 },
    lg: { width: 200, height: 100 },
  }

  const dimensions = sizeMap[size]

  // Alt text: descriptive if meaningful, empty if decorative
  // Partners are identified by their logo, so we include the name
  const altText = `${partner.partner_name} logo`

  const logoElement = (
    <div className={styles.logoWrapper} data-size={size}>
      {!imageError ? (
        <Image
          src={logoUrl}
          alt={altText}
          width={dimensions.width}
          height={dimensions.height}
          className={styles.logo}
          onError={() => setImageError(true)}
          style={{
            objectFit: "contain",
            maxWidth: "100%",
            height: "auto",
          }}
        />
      ) : (
        <div className={styles.fallback} data-size={size}>
          <span className={styles.fallbackText}>{partner.partner_name}</span>
        </div>
      )}
    </div>
  )

  const content = (
    <>
      {logoElement}
      {showDescription && partner.partner_description && (
        <p className={styles.description}>{partner.partner_description}</p>
      )}
    </>
  )

  // Render as link if clickable and has website
  if (shouldLink) {
    return (
      <a
        href={partner.partner_website!}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(styles.card, styles[variant], className)}
        data-size={size}
        aria-label={`Visit ${partner.partner_name} website (opens in a new tab)`}
      >
        {content}
      </a>
    )
  }

  // Render as div if not clickable
  return (
    <div className={cn(styles.card, styles[variant], className)} data-size={size}>
      {content}
    </div>
  )
}
