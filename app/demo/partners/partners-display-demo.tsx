"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, SlidersHorizontal } from "lucide-react"
import styles from "./partners-display-demo.module.css"
import { cn } from "@/lib/utils"

export interface Partner {
  id?: string
  partner_id?: string
  partner_name: string
  partner_logo?: string | null
  partner_logo_storage_path?: string | null
  partner_logo_uploaded_at?: string | null
  partner_website?: string | null
  partner_description?: string | null
  partner_type?: string
  category_key?: string
  partner_display_order?: number
  is_visible?: boolean
  created_at?: string
  updated_at?: string
  context_type?: string
  context_id?: string
  category_label?: string
  category_display_order?: number
}

export interface Category {
  category_key: string
  category_label: string
  category_display_order: number
  partners: Partner[]
}

export interface PartnersData {
  context_type: string
  context_id: string | null
  categories: Category[]
  total_partners: number
}

interface PartnersDisplayDemoProps {
  data: PartnersData
  eventId?: string
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

type TitleFont = "montserrat" | "dm-sans" | "jakarta" | "outfit"

const FONT_OPTIONS: { id: TitleFont; label: string }[] = [
  { id: "montserrat", label: "Montserrat" },
  { id: "dm-sans", label: "DM Sans" },
  { id: "jakarta", label: "Jakarta" },
  { id: "outfit", label: "Outfit" },
]

type BgStyle = "glow" | "clean" | "dots" | "waves"

const BG_OPTIONS: { id: BgStyle; label: string }[] = [
  { id: "glow", label: "Soft Glow" },
  { id: "clean", label: "Clean" },
  { id: "dots", label: "Dot Grid" },
  { id: "waves", label: "Waves" },
]

function getCategoryDisplayTitle(category?: Category, fallback = ""): string {
  if (!category) return fallback
  return CATEGORY_TITLES[category.category_key] || category.category_label?.toUpperCase() || fallback
}

// Clean partner display name (normalizes double spaces from DB)
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

function getPartnerWebsite(partner: Partner): string {
  if (partner.partner_website && partner.partner_website.trim().length > 0) {
    return partner.partner_website
  }
  const normalized = partner.partner_name.toLowerCase().replace(/\s+/g, " ").trim()
  return FALLBACK_WEBSITES[normalized] || "https://www.deessafoundation.com"
}

// Helper function to resolve logo URL
export function getPartnerLogoUrl(partner: Partner): string | null {
  if (partner.partner_logo_storage_path) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/partner-logos/${partner.partner_logo_storage_path}`
    }
  }
  return partner.partner_logo || null
}

// Fallback demo co-organizers from target design
const DEMO_EXTRA_CO_ORGANIZERS: Partner[] = [
  {
    partner_name: "NDFN",
    partner_logo: "https://deafnepal.org.np/wp-content/uploads/2021/07/NDFN-Logo.png",
    partner_website: "https://deafnepal.org.np",
    category_key: "co_organizers",
  },
  {
    partner_name: "NFDN",
    partner_logo: "https://www.nfdn.org.np/wp-content/uploads/2020/03/logo-of-nfdn.png",
    partner_website: "https://www.nfdn.org.np",
    category_key: "co_organizers",
  },
  {
    partner_name: "TDH Foundation",
    partner_logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 48' fill='none'><path d='M12 36L26 12L40 36H12Z' fill='%230080C8'/><path d='M28 36L38 18L50 36H28Z' fill='%2350B6E8'/><text x='56' y='25' font-family='sans-serif' font-weight='800' font-size='14' fill='%230080C8'>TDH</text><text x='56' y='37' font-family='sans-serif' font-weight='600' font-size='11' fill='%234B5563'>Foundation</text></svg>",
    partner_website: "https://www.tdh.de",
    category_key: "co_organizers",
  },
  {
    partner_name: "eSewa",
    partner_logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 48' fill='none'><circle cx='22' cy='24' r='18' fill='%2360BB46'/><path d='M26 22H18C18.2 19 20.5 17 23 17C25.5 17 26.5 18.5 26.5 18.5L28 16.5C28 16.5 26.2 14.5 23 14.5C18.5 14.5 15 18 15 24C15 30 18.8 33.5 23.5 33.5C27.5 33.5 29 31 29 31L27.2 29C27.2 29 26 31 23.5 31C20 31 18.2 28.5 18.1 25.5H29C29 25.5 29.2 22 26 22ZM18.2 23.5C18.4 21.5 19.8 19 22.8 19C25.5 19 26.2 21.2 26.2 23.5H18.2Z' fill='white'/><text x='48' y='32' font-family='sans-serif' font-weight='700' font-size='22' fill='%23111827'>Sewa</text></svg>",
    partner_website: "https://esewa.com.np",
    category_key: "co_organizers",
  },
  {
    partner_name: "Fairmed",
    partner_logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 44' fill='none'><circle cx='14' cy='14' r='5' fill='%23E30613'/><circle cx='14' cy='30' r='5' fill='%23E30613'/><circle cx='6' cy='22' r='5' fill='%23E30613'/><circle cx='22' cy='22' r='5' fill='%23E30613'/><circle cx='14' cy='22' r='3' fill='white'/><text x='34' y='28' font-family='sans-serif' font-weight='700' font-size='20' fill='%23111827'>Fairmed</text></svg>",
    partner_website: "https://www.fairmed.org.np",
    category_key: "co_organizers",
  },
  {
    partner_name: "NDWA",
    partner_logo: "https://www.ndwa.org.np/wp-content/themes/ndwa-dp-theme/assets/images/ndwa.png",
    partner_website: "https://www.ndwa.org.np",
    category_key: "co_organizers",
  },
  {
    partner_name: "Access Planet",
    partner_logo: "https://accessplanet.org.np/wp-content/uploads/2021/01/logo.jpg",
    partner_website: "https://accessplanet.org.np",
    category_key: "co_organizers",
  },
  {
    partner_name: "UN Global Compact",
    partner_logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 170 48' fill='none'><circle cx='22' cy='24' r='16' stroke='%23003366' stroke-width='2' fill='none'/><ellipse cx='22' cy='24' rx='8' ry='15.5' stroke='%23003366' stroke-width='1.2' fill='none'/><line x1='6.5' y1='24' x2='37.5' y2='24' stroke='%23003366' stroke-width='1.5'/><text x='46' y='22' font-family='sans-serif' font-weight='800' font-size='10' fill='%23003366'>UN GLOBAL</text><text x='46' y='34' font-family='sans-serif' font-weight='700' font-size='10' fill='%23003366'>COMPACT</text></svg>",
    partner_website: "https://unglobalcompact.org",
    category_key: "co_organizers",
  },
]

export function PartnersDisplayDemo({
  data,
  eventId = "52c72524-7cf7-4275-8739-30ea31119669",
}: PartnersDisplayDemoProps) {
  // Mode toggle: "live" shows actual DB without extraneous notes; "mock" shows full 11 partners prototype
  const [viewMode, setViewMode] = useState<"live" | "mock">("live")
  // Category & co-organizers title font toggle
  const [titleFont, setTitleFont] = useState<TitleFont>("montserrat")
  // Subtle background atmosphere toggle
  const [bgStyle, setBgStyle] = useState<BgStyle>("glow")

  // Find categories from DB
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

  // Build co-organizers list based on view mode
  const dbCoOrganizers = coOrganizersCategory?.partners || []
  let allCoOrganizers: Partner[] = []

  if (viewMode === "live") {
    // Strictly live DB data
    allCoOrganizers = [...dbCoOrganizers]
  } else {
    // Design view: DB data + remaining mock partners for full 11 preview
    allCoOrganizers = [...dbCoOrganizers]
    const existingNames = new Set(dbCoOrganizers.map((p) => p.partner_name.toLowerCase().trim()))
    for (const demoPartner of DEMO_EXTRA_CO_ORGANIZERS) {
      if (!existingNames.has(demoPartner.partner_name.toLowerCase().trim())) {
        allCoOrganizers.push(demoPartner)
      }
    }
  }

  const isFewerCoOrganizers = allCoOrganizers.length <= 6
  const row1CoOrganizers = allCoOrganizers.slice(0, 6)
  const row2CoOrganizers = allCoOrganizers.slice(6)

  return (
    <div>
      {/* Top Demo Toolbar */}
      <nav className={styles.toolbar} aria-label="Demo Controls">
        <div className={styles.toolbarInner}>
          <div className={styles.toolbarLeft}>
            <Link href="/demo" className={styles.backLink}>
              <ArrowLeft className="h-4 w-4" />
              <span>Demos</span>
            </Link>
            <span className={styles.toolbarDivider}>/</span>
            <span className={styles.toolbarTitle}>Partners Display Preview</span>
          </div>

          <div className={styles.segmentedControl} role="tablist" aria-label="Preview Mode">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "live"}
              onClick={() => setViewMode("live")}
              className={cn(styles.segmentButton, viewMode === "live" && styles.segmentButtonActive)}
            >
              <span className={styles.liveDot} aria-hidden="true" />
              <span>Live DB (Actual)</span>
              <span className={styles.segmentBadge}>{dbCoOrganizers.length + 5} Active</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "mock"}
              onClick={() => setViewMode("mock")}
              className={cn(styles.segmentButton, viewMode === "mock" && styles.segmentButtonActive)}
            >
              <span>Design Prototype (11 Partners)</span>
            </button>
          </div>

          {/* Title Font Selector */}
          <div className={styles.fontControls} role="group" aria-label="Category Title Font">
            <span className={styles.fontControlsLabel}>Font:</span>
            <div className={styles.fontButtonGroup}>
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTitleFont(f.id)}
                  className={cn(styles.fontButton, titleFont === f.id && styles.fontButtonActive)}
                  title={`Use ${f.label} for category titles`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Style Selector */}
          <div className={styles.fontControls} role="group" aria-label="Background Atmosphere">
            <span className={styles.fontControlsLabel}>BG:</span>
            <div className={styles.fontButtonGroup}>
              {BG_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBgStyle(b.id)}
                  className={cn(styles.fontButton, bgStyle === b.id && styles.fontButtonActive)}
                  title={`Set background style to ${b.label}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.toolbarRight}>
            <Link
              href={`/admin/events/${eventId}/settings`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.adminLink}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Admin Event Settings</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Partners Section */}
      <section
        className={styles.section}
        data-title-font={titleFont}
        data-bg-style={bgStyle}
        aria-labelledby="partners-section-title"
      >
        {/* Subtle decorative waves when selected */}
        {bgStyle === "waves" && (
          <svg
            className={styles.bgWaveOverlay}
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M-100,180 C320,80 520,300 820,220 C1120,140 1320,280 1620,180"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 8"
            />
            <path
              d="M-100,460 C260,560 620,380 960,480 C1260,560 1420,410 1620,460"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M-100,720 C360,640 720,800 1060,700 C1360,620 1520,740 1620,710"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
          </svg>
        )}
        {/* Decorative leaf watermarks */}
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
            <div className={styles.eyebrowWrapper}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              <span className={styles.eyebrowText}>OUR PARTNERS &amp; COLLABORATORS</span>
              <span className={styles.eyebrowLine} aria-hidden="true" />
            </div>

            <h2 id="partners-section-title" className={styles.title}>
              Together for <span className={styles.titleAccent}>Greater Impact</span>
            </h2>

            <p className={styles.subtitle}>
              We are grateful to our partners and collaborators who stand with us in building a more inclusive and equitable future.
            </p>
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
                        <React.Fragment key={partner.id || partner.partner_name + index}>
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
                        key={partner.id || partner.partner_name}
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
                        key={partner.id || partner.partner_name}
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
                        key={partner.id || partner.partner_name}
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

          {/* Second Section: CO-ORGANIZERS */}
          {allCoOrganizers.length > 0 && (
            <div className={styles.coOrganizersSection}>
              {/* Divider with centered title */}
              <div className={styles.coOrganizersDividerWrapper}>
                <span className={styles.dividerLine} aria-hidden="true" />
                <h3 className={styles.coOrganizersTitle}>CO-ORGANIZERS</h3>
                <span className={styles.dividerLine} aria-hidden="true" />
              </div>

              <p className={styles.coOrganizersSubtitle}>
                Together with our co-organizers, we extend our reach and create lasting change.
              </p>

              {/* Render either balanced row (for fewer partners like 3 in Live DB) or 2-row grid */}
              {isFewerCoOrganizers ? (
                <div className={styles.coOrganizersBalancedRow}>
                  {allCoOrganizers.map((partner, index) => {
                    const logoUrl = getPartnerLogoUrl(partner)
                    const websiteUrl = getPartnerWebsite(partner)
                    const content = (
                      <>
                        <div className={styles.coOrganizerLogoWrapper}>
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={`${partner.partner_name} logo`}
                              className={styles.coOrganizerLogo}
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
                        key={partner.id || partner.partner_name + index}
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
              ) : (
                <>
                  {/* Row 1: Up to 6 Co-Organizers */}
                  {row1CoOrganizers.length > 0 && (
                    <div className={styles.coOrganizersGridRow1}>
                      {row1CoOrganizers.map((partner, index) => {
                        const logoUrl = getPartnerLogoUrl(partner)
                        const websiteUrl = getPartnerWebsite(partner)
                        const content = (
                          <>
                            <div className={styles.coOrganizerLogoWrapper}>
                              {logoUrl ? (
                                <img
                                  src={logoUrl}
                                  alt={`${partner.partner_name} logo`}
                                  className={styles.coOrganizerLogo}
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
                            key={partner.id || partner.partner_name + index}
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
                  )}

                  {/* Row 2: Remaining 5 Co-Organizers */}
                  {row2CoOrganizers.length > 0 && (
                    <div className={styles.coOrganizersGridRow2}>
                      {row2CoOrganizers.map((partner, index) => {
                        const logoUrl = getPartnerLogoUrl(partner)
                        const websiteUrl = getPartnerWebsite(partner)
                        const content = (
                          <>
                            <div className={styles.coOrganizerLogoWrapper}>
                              {logoUrl ? (
                                <img
                                  src={logoUrl}
                                  alt={`${partner.partner_name} logo`}
                                  className={styles.coOrganizerLogo}
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
                            key={partner.id || partner.partner_name + index}
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
                  )}
                </>
              )}
            </div>
          )}

          {/* Footnote note — only shown in mock design preview, hidden in live DB view */}
          {viewMode === "mock" && (
            <p className={styles.bottomNote}>
              Logos are shown in the order of contribution and may be updated as partnerships evolve.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
