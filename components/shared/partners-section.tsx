import { getContextPartners } from "@/lib/data/context-partners"
import type { ContextType } from "@/lib/types/partners"
import { PartnerCard } from "./partner-card"
import styles from "./partners-section.module.css"
import { cn } from "@/lib/utils"

interface PartnersSectionProps {
  /**
   * Context type (event, homepage, program, etc.)
   */
  contextType: ContextType
  /**
   * Context ID (event ID, program ID, etc.) - null for global contexts like homepage
   */
  contextId?: string | null
  /**
   * Section title (e.g., "Partners & Collaborators")
   */
  title?: string
  /**
   * Section subtitle/description
   */
  subtitle?: string
  /**
   * Card variant: 'grid' or 'inline'
   * @default 'grid'
   */
  variant?: "grid" | "inline"
  /**
   * Card size: 'sm' | 'md' | 'lg'
   * @default 'md'
   */
  size?: "sm" | "md" | "lg"
  /**
   * Show partner descriptions
   * @default false
   */
  showDescriptions?: boolean
  /**
   * Show category labels as headings
   * @default true
   */
  showCategoryLabels?: boolean
  /**
   * Grid columns (for grid variant)
   * @default 4
   */
  columns?: 2 | 3 | 4 | 5 | 6
  /**
   * Custom class name for the section wrapper
   */
  className?: string
  /**
   * Custom class name for the section header
   */
  headerClassName?: string
  /**
   * Custom class name for each category group
   */
  categoryClassName?: string
}

export async function PartnersSection({
  contextType,
  contextId = null,
  title,
  subtitle,
  variant = "grid",
  size = "md",
  showDescriptions = false,
  showCategoryLabels = true,
  columns = 4,
  className,
  headerClassName,
  categoryClassName,
}: PartnersSectionProps) {
  // Fetch partners data
  const partnersData = await getContextPartners(contextType, contextId)

  // If no partners, don't render anything
  if (partnersData.total_partners === 0) {
    return null
  }

  return (
    <section className={cn(styles.section, className)} aria-labelledby={title ? "partners-title" : undefined}>
      {/* Section Header */}
      {(title || subtitle) && (
        <div className={cn(styles.header, headerClassName)}>
          {title && (
            <h2 id="partners-title" className={styles.title}>
              {title}
            </h2>
          )}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      {/* Partners grouped by category */}
      <div className={styles.categories}>
        {partnersData.categories.map((category) => (
          <div key={category.category_key} className={cn(styles.category, categoryClassName)}>
            {/* Category Label */}
            {showCategoryLabels && (
              <h3 className={styles.categoryLabel}>{category.category_label}</h3>
            )}

            {/* Partners Grid/List */}
            <div
              className={cn(styles.partnersGrid, styles[variant])}
              data-columns={variant === "grid" ? columns : undefined}
            >
              {category.partners.map((partner) => (
                <PartnerCard
                  key={partner.partner_id}
                  partner={partner}
                  variant={variant}
                  size={size}
                  showDescription={showDescriptions}
                  clickable={true}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
