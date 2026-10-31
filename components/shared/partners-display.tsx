import React from "react"
import { getContextPartners } from "@/lib/data/context-partners"
import type { ContextType, ContextPartnerDetailed, CategoryKey } from "@/lib/types/partners"
import styles from "./partners-display.module.css"
import { cn } from "@/lib/utils"
import { CoOrganizerLogoImage, type LogoFitOverride } from "./co-organizer-logo-image"

export interface PartnersDisplayProps {
  /**
   * Context type (defaults to 'event')
   */
  contextType?: ContextType
  /**
   * Context ID (defaults to Nepal Accessibility Summit 2026 UUID: 52c72524-7cf7-4275-8739-30ea31119669)
   */
  contextId?: string | null
  eyebrow?: string
  titlePrefix?: string
  titleAccent?: string
  subtitle?: string
  coOrganizersTitle?: string
  coOrganizersSubtitle?: string
  showCoOrganizers?: boolean
  className?: string
  id?: string
}

// Editorial category title overrides matching the target mock design
const CATEGORY_TITLES: Record<string, string> = {
  organizers: "ORGANIZING PARTNERS",
  in_collaboration: "IN COLLABORATION WITH",
  in_collaboration_with: "IN COLLABORATION WITH",
  collaborating_partner: "IN COLLABORATION WITH",
  knowledge_partner: "KNOWLEDGE PARTNER",
  technical_partner: "TECHNICAL PARTNER",
  co_organizers: "CO-ORGANIZERS",
}

function getCategoryDisplayTitle(category?: { category_key: string; category_label?: string }, fallback = ""): string {
  if (!category) return fallback
  return CATEGORY_TITLES[category.category_key] || category.category_label?.toUpperCase() || fallback
}

// Clean partner display name (normalizes extra whitespace from DB)
function cleanPartnerName(name: string): string {
  return name.replace(/\s+/g, " ").trim()
}

// Fallback website registry ensuring every partner has an active link and pointer hand
const FALLBACK_WEBSITES: Record<string, string> = {
  "deessa foundation": "https://www.deessafoundation.com",
  "social artist": "https://socialartist.org.np",
  "social artist nepal": "https://socialartist.org.np",
  "giz": "https://www.giz.de/en",
  "ku school of education": "https://soed.ku.edu.np",
  "sdg studio": "https://sdgstudio.org",
  "byan": "https://byanepal.org",
  "cbm global": "https://cbm-global.org",
  "inf": "https://inf.org",
  "ndfn": "https://deafnepal.org.np",
  "nfdn": "https://www.nfdn.org.np",
  "tdh foundation": "https://www.tdh.de",
  "esewa": "https://esewa.com.np",
  "fairmed": "https://www.fairmed.org.np",
  "ndwa": "https://www.ndwa.org.np",
  "access planet": "https://accessplanet.org.np",
  "un global compact": "https://unglobalcompact.org",
}

function getPartnerWebsite(partner: ContextPartnerDetailed): string {
  if (partner.partner_website && partner.partner_website.trim().length > 0) {
    return partner.partner_website
  }
  const normalized = partner.partner_name.toLowerCase().replace(/\s+/g, " ").trim()
  return FALLBACK_WEBSITES[normalized] || "https://www.deessafoundation.com"
}

// Helper to resolve partner logo URL from DB
function getPartnerLogoUrl(partner: ContextPartnerDetailed): string | null {
  if (partner.partner_logo_storage_path) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/partner-logos/${partner.partner_logo_storage_path}`
    }
  }
  return partner.partner_logo || null
}

export async function PartnersDisplay({
  contextType = "event",
  contextId = "52c72524-7cf7-4275-8739-30ea31119669",
  eyebrow = "OUR PARTNERS & COLLABORATORS",
  titlePrefix = "Together for",
  titleAccent = "Greater Impact",
  subtitle = "We are grateful to our partners and collaborators who stand with us in building a more inclusive and equitable future.",
  coOrganizersTitle = "CO-ORGANIZERS",
  coOrganizersSubtitle,
  showCoOrganizers = true,
  className,
  id = "partners-section",
}: PartnersDisplayProps) {
  // Fetch real partners data live from database
  const data = await getContextPartners(contextType, contextId)

  // If no partners configured in DB, render nothing
  if (!data || data.total_partners === 0) {
    return null
  }

  // Find categories from live DB
  const organizersCategory = data.categories.find(
    (c) => c.category_key === "organizers" || c.category_key.includes("organizer")
  )
  const collaboratingCategory = data.categories.find(
    (c) => c.category_key === "in_collaboration" || c.category_key.includes("collab")
  )
  const knowledgeCategory = data.categories.find(
    (c) => c.category_key === "knowledge_partner" || c.category_key.includes("knowledge")
  )
  const technicalCategory = data.categories.find(
    (c) => c.category_key === "technical_partner" || c.category_key.includes("tech")
  )
  const coOrganizersCategory = data.categories.find(
    (c) => c.category_key === "co_organizers" || c.category_key.includes("co_org")
  )

  const coOrganizers = coOrganizersCategory?.partners || []

  return (
    <section className={cn(styles.section, className)} aria-labelledby={`${id}-title`} id={id}>
      {/* Decorative corner leaves using deessa ocean blue */}
      <svg
        className={styles.cornerLeafTopLeft}
        viewBox="0 0 200 240"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0,0 C60,20 120,60 150,130 C170,180 150,220 120,240 C100,200 110,140 80,90 C50,50 10,20 0,0 Z" />
        <path d="M30,0 C80,30 140,80 160,160 C140,120 110,80 60,40 C30,20 10,10 30,0 Z" opacity="0.6" />
      </svg>
      <svg
        className={styles.cornerLeafBottomRight}
        viewBox="0 0 240 280"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M240,280 C180,260 120,220 90,150 C70,100 90,60 120,40 C140,80 130,140 160,190 C190,230 230,260 240,280 Z" />
        <path d="M210,280 C160,250 100,200 80,120 C100,160 130,200 180,240 C210,260 230,270 210,280 Z" opacity="0.6" />
      </svg>

      <div className={styles.container}>
        {/* Section Header */}
        <header className={styles.header}>
          {eyebrow && (
            <div className={styles.eyebrowWrapper}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              <span className={styles.eyebrowText}>{eyebrow}</span>
              <span className={styles.eyebrowLine} aria-hidden="true" />
            </div>
          )}

          <h2 id={`${id}-title`} className={styles.title}>
            {titlePrefix} <span className={styles.titleAccent}>{titleAccent}</span>
          </h2>

          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>

        {/* Top Row: 4 Category Columns */}
        <div className={styles.topGrid}>
          {/* Column 1: ORGANIZING PARTNERS */}
          <div className={styles.categoryColumn}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryTitle}>
                {getCategoryDisplayTitle(organizersCategory, "ORGANIZING PARTNERS")}
              </h3>
              <div className={styles.categoryUnderline} aria-hidden="true" />
            </div>

            <div className={styles.card}>
              <div className={styles.stackedCardContent}>
                {organizersCategory?.partners && organizersCategory.partners.length > 0 ? (
                  organizersCategory.partners.map((partner, index) => {
                    const logoUrl = getPartnerLogoUrl(partner)
                    const websiteUrl = getPartnerWebsite(partner)
                    const content = (
                      <>
                        <div className={styles.organizerLogoWrapper}>
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={`${partner.partner_name} logo`}
                              className={styles.organizerLogo}
                            />
                          ) : (
                            <div className={styles.logoFallback}>{cleanPartnerName(partner.partner_name)}</div>
                          )}
                        </div>
                        <p className={styles.partnerName}>{cleanPartnerName(partner.partner_name)}</p>
                      </>
                    )

                    return (
                      <React.Fragment key={partner.partner_id || partner.partner_name + index}>
                        {index > 0 && <div className={styles.stackedDivider} aria-hidden="true" />}
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.partnerItemLink}
                          aria-label={`Visit ${cleanPartnerName(partner.partner_name)} website`}
                        >
                          {content}
                        </a>
                      </React.Fragment>
                    )
                  })
                ) : (
                  <div className={styles.singleCardContent}>
                    <p className={styles.partnerName}>No organizing partners configured</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: IN COLLABORATION WITH */}
          <div className={styles.categoryColumn}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryTitle}>
                {getCategoryDisplayTitle(collaboratingCategory, "IN COLLABORATION WITH")}
              </h3>
              <div className={styles.categoryUnderline} aria-hidden="true" />
            </div>

            <div className={cn(styles.card, styles.interactiveCard)}>
              {collaboratingCategory?.partners && collaboratingCategory.partners.length > 0 ? (
                collaboratingCategory.partners.map((partner) => {
                  const logoUrl = getPartnerLogoUrl(partner)
                  const websiteUrl = getPartnerWebsite(partner)
                  const content = (
                    <>
                      <div className={styles.singleCardLogoWrapper}>
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={`${partner.partner_name} logo`}
                            className={styles.gizLogo}
                          />
                        ) : (
                          <div className={styles.logoFallback}>{cleanPartnerName(partner.partner_name)}</div>
                        )}
                      </div>
                      <p className={styles.partnerName}>{cleanPartnerName(partner.partner_name)}</p>
                    </>
                  )

                  return (
                    <a
                      key={partner.partner_id || partner.partner_name}
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.singleCardContent}
                      aria-label={`Visit ${cleanPartnerName(partner.partner_name)} website`}
                    >
                      {content}
                    </a>
                  )
                })
              ) : (
                <div className={styles.singleCardContent}>
                  <p className={styles.partnerName}>No collaborating partner configured</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: KNOWLEDGE PARTNER */}
          <div className={styles.categoryColumn}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryTitle}>
                {getCategoryDisplayTitle(knowledgeCategory, "KNOWLEDGE PARTNER")}
              </h3>
              <div className={styles.categoryUnderline} aria-hidden="true" />
            </div>

            <div className={cn(styles.card, styles.interactiveCard)}>
              {knowledgeCategory?.partners && knowledgeCategory.partners.length > 0 ? (
                knowledgeCategory.partners.map((partner) => {
                  const logoUrl = getPartnerLogoUrl(partner)
                  const websiteUrl = getPartnerWebsite(partner)
                  const content = (
                    <>
                      <div className={styles.singleCardLogoWrapper}>
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={`${partner.partner_name} logo`}
                            className={styles.kuLogo}
                          />
                        ) : (
                          <div className={styles.logoFallback}>{cleanPartnerName(partner.partner_name)}</div>
                        )}
                      </div>
                      <p className={styles.partnerName}>{cleanPartnerName(partner.partner_name)}</p>
                    </>
                  )

                  return (
                    <a
                      key={partner.partner_id || partner.partner_name}
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.singleCardContent}
                      aria-label={`Visit ${cleanPartnerName(partner.partner_name)} website`}
                    >
                      {content}
                    </a>
                  )
                })
              ) : (
                <div className={styles.singleCardContent}>
                  <p className={styles.partnerName}>No knowledge partner configured</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: TECHNICAL PARTNER */}
          <div className={styles.categoryColumn}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryTitle}>
                {getCategoryDisplayTitle(technicalCategory, "TECHNICAL PARTNER")}
              </h3>
              <div className={styles.categoryUnderline} aria-hidden="true" />
            </div>

            <div className={cn(styles.card, styles.interactiveCard)}>
              {technicalCategory?.partners && technicalCategory.partners.length > 0 ? (
                technicalCategory.partners.map((partner) => {
                  const logoUrl = getPartnerLogoUrl(partner)
                  const websiteUrl = getPartnerWebsite(partner)
                  const content = (
                    <>
                      <div className={styles.singleCardLogoWrapper}>
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={`${partner.partner_name} logo`}
                            className={styles.sdgLogo}
                          />
                        ) : (
                          <div className={styles.logoFallback}>{cleanPartnerName(partner.partner_name)}</div>
                        )}
                      </div>
                      <p className={styles.partnerName}>{cleanPartnerName(partner.partner_name)}</p>
                    </>
                  )

                  return (
                    <a
                      key={partner.partner_id || partner.partner_name}
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.singleCardContent}
                      aria-label={`Visit ${cleanPartnerName(partner.partner_name)} website`}
                    >
                      {content}
                    </a>
                  )
                })
              ) : (
                <div className={styles.singleCardContent}>
                  <p className={styles.partnerName}>No technical partner configured</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Co-Organizers Section */}
        {showCoOrganizers && coOrganizers.length > 0 && (
          <div className={styles.coOrganizersSection}>
            <div className={styles.coOrganizersDividerWrapper}>
              <div className={styles.dividerLine} aria-hidden="true" />
              <h3 className={styles.coOrganizersTitle}>{coOrganizersTitle}</h3>
              <div className={styles.dividerLine} aria-hidden="true" />
            </div>

            {coOrganizersSubtitle && (
              <p className={styles.coOrganizersSubtitle}>{coOrganizersSubtitle}</p>
            )}

            <div className={styles.coOrganizersGrid}>
              {coOrganizers.map((partner, index) => {
                const logoUrl = getPartnerLogoUrl(partner)
                const websiteUrl = getPartnerWebsite(partner)

                // Extract custom admin logoFit override if present
                let fitOverride: LogoFitOverride = "auto"
                if (partner.partner_description) {
                  try {
                    if (partner.partner_description.startsWith("{")) {
                      const parsed = JSON.parse(partner.partner_description)
                      if (parsed.logoFit) fitOverride = parsed.logoFit
                    } else if (partner.partner_description.includes("fit:")) {
                      const match = partner.partner_description.match(/fit:([a-z-]+)/)
                      if (match) fitOverride = match[1] as LogoFitOverride
                    }
                  } catch {}
                }

                const content = (
                  <>
                    <div className={styles.coOrganizerLogoWrapper}>
                      {logoUrl ? (
                        <CoOrganizerLogoImage
                          src={logoUrl}
                          alt={`${partner.partner_name} logo`}
                          className={styles.coOrganizerLogo}
                          partnerName={partner.partner_name}
                          fitOverride={fitOverride}
                        />
                      ) : (
                        <span className={styles.logoFallback}>{cleanPartnerName(partner.partner_name)}</span>
                      )}
                    </div>
                    <span className={styles.coOrganizerName}>{cleanPartnerName(partner.partner_name)}</span>
                  </>
                )

                return (
                  <a
                    key={partner.partner_id || partner.partner_name + index}
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.coOrganizerCard}
                    aria-label={`Visit ${cleanPartnerName(partner.partner_name)} website`}
                  >
                    {content}
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
