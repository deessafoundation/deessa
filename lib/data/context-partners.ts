// =============================================
// Universal Partners System — Data Layer
// =============================================
// Server-side data fetching functions for the partners system.
// These functions query the context_partners_detailed view with proper
// ordering and grouping for efficient rendering.

import { createClient } from "@/lib/supabase/server"
import type {
  ContextType,
  ContextPartnerDetailed,
  PartnersByCategory,
  ContextPartnersData,
  PartnerCategory,
  Partner,
  ContextPartner,
} from "@/lib/types/partners"

// =============================================
// Context Partners (for public display)
// =============================================

/**
 * Get all partners for a specific context, grouped by category.
 * Uses the context_partners_detailed view for efficient querying.
 * Handles both specific contexts (e.g., event_id) and global contexts (e.g., homepage).
 */
export async function getContextPartners(
  contextType: ContextType,
  contextId?: string | null
): Promise<ContextPartnersData> {
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from("context_partners_detailed")
    .select("*")
    .eq("context_type", contextType)
    .eq("is_visible", true)

  // Handle context_id (NULL for global contexts like homepage)
  if (contextId) {
    query = query.eq("context_id", contextId)
  } else {
    query = query.is("context_id", null)
  }

  // Order by category first, then partner within category
  query = query.order("category_display_order", { ascending: true })
  query = query.order("partner_display_order", { ascending: true })
  query = query.order("partner_name", { ascending: true }) // Tertiary sort for consistency

  const { data, error } = await query

  if (error) {
    console.error("Error fetching context partners:", error)
    return {
      context_type: contextType,
      context_id: contextId || null,
      categories: [],
      total_partners: 0,
    }
  }

  // Group partners by category
  const groupedByCategory = groupPartnersByCategory(data || [])

  return {
    context_type: contextType,
    context_id: contextId || null,
    categories: groupedByCategory,
    total_partners: data?.length || 0,
  }
}

/**
 * Get partners for a specific category within a context.
 * Useful for rendering individual category sections.
 */
export async function getContextPartnersByCategory(
  contextType: ContextType,
  categoryKey: string,
  contextId?: string | null
): Promise<ContextPartnerDetailed[]> {
  const supabase = await createClient()

  let query = supabase
    .from("context_partners_detailed")
    .select("*")
    .eq("context_type", contextType)
    .eq("category_key", categoryKey)
    .eq("is_visible", true)

  if (contextId) {
    query = query.eq("context_id", contextId)
  } else {
    query = query.is("context_id", null)
  }

  query = query.order("partner_display_order", { ascending: true })
  query = query.order("partner_name", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching category partners:", error)
    return []
  }

  return data || []
}

/**
 * Get homepage partners (convenience function)
 */
export async function getHomepagePartners(): Promise<ContextPartnersData> {
  return getContextPartners("homepage", null)
}

/**
 * Get event partners (convenience function)
 */
export async function getEventPartners(eventId: string): Promise<ContextPartnersData> {
  return getContextPartners("event", eventId)
}

// =============================================
// Categories (for admin and public display)
// =============================================

/**
 * Get all categories for a specific context.
 * Used by admin panel to display/manage categories.
 */
export async function getContextCategories(
  contextType: ContextType,
  contextId?: string | null
): Promise<PartnerCategory[]> {
  const supabase = await createClient()

  let query = supabase
    .from("partner_categories")
    .select("*")
    .eq("context_type", contextType)

  if (contextId) {
    query = query.eq("context_id", contextId)
  } else {
    query = query.is("context_id", null)
  }

  query = query.order("display_order", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching context categories:", error)
    return []
  }

  return data || []
}

/**
 * Get a single category by key
 */
export async function getContextCategory(
  contextType: ContextType,
  categoryKey: string,
  contextId?: string | null
): Promise<PartnerCategory | null> {
  const supabase = await createClient()

  let query = supabase
    .from("partner_categories")
    .select("*")
    .eq("context_type", contextType)
    .eq("category_key", categoryKey)

  if (contextId) {
    query = query.eq("context_id", contextId)
  } else {
    query = query.is("context_id", null)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error("Error fetching category:", error)
    return null
  }

  return data
}

// =============================================
// Partners (master directory)
// =============================================

/**
 * Get all published partners (for admin selection UI)
 */
export async function getPublishedPartners(): Promise<Partner[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("is_published", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching published partners:", error)
    return []
  }

  return data || []
}

/**
 * Get all partners (admin only, includes unpublished)
 */
export async function getAllPartners(): Promise<Partner[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching all partners:", error)
    return []
  }

  return data || []
}

/**
 * Get a single partner by ID
 */
export async function getPartnerById(partnerId: string): Promise<Partner | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("id", partnerId)
    .single()

  if (error) {
    console.error("Error fetching partner:", error)
    return null
  }

  return data
}

/**
 * Get partners that are NOT linked to a specific context.
 * Useful for admin UI to show "available partners to add".
 */
export async function getAvailablePartners(
  contextType: ContextType,
  contextId?: string | null
): Promise<Partner[]> {
  const supabase = await createClient()

  // Get all published partners
  const allPartners = await getPublishedPartners()

  // Get partners already linked to this context
  let linkedQuery = supabase
    .from("context_partners")
    .select("partner_id")
    .eq("context_type", contextType)

  if (contextId) {
    linkedQuery = linkedQuery.eq("context_id", contextId)
  } else {
    linkedQuery = linkedQuery.is("context_id", null)
  }

  const { data: linkedPartners, error: linkedError } = await linkedQuery

  if (linkedError) {
    console.error("Error fetching linked partners:", error)
    return allPartners // Return all on error
  }

  // Filter out already-linked partners
  const linkedPartnerIds = new Set((linkedPartners || []).map((p) => p.partner_id))
  return allPartners.filter((p) => !linkedPartnerIds.has(p.id))
}

// =============================================
// Context Partners (admin junction table queries)
// =============================================

/**
 * Get context partner links for admin management.
 * Returns raw junction table data (not the detailed view).
 */
export async function getContextPartnerLinks(
  contextType: ContextType,
  contextId?: string | null
): Promise<ContextPartner[]> {
  const supabase = await createClient()

  let query = supabase
    .from("context_partners")
    .select("*")
    .eq("context_type", contextType)

  if (contextId) {
    query = query.eq("context_id", contextId)
  } else {
    query = query.is("context_id", null)
  }

  query = query.order("display_order", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching context partner links:", error)
    return []
  }

  return data || []
}

/**
 * Get a single context partner link
 */
export async function getContextPartnerLink(
  contextType: ContextType,
  partnerId: string,
  contextId?: string | null
): Promise<ContextPartner | null> {
  const supabase = await createClient()

  let query = supabase
    .from("context_partners")
    .select("*")
    .eq("context_type", contextType)
    .eq("partner_id", partnerId)

  if (contextId) {
    query = query.eq("context_id", contextId)
  } else {
    query = query.is("context_id", null)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error("Error fetching context partner link:", error)
    return null
  }

  return data
}

// =============================================
// Helper Functions
// =============================================

/**
 * Group partners by category for rendering.
 * Maintains category order and partner order within each category.
 */
function groupPartnersByCategory(
  partners: ContextPartnerDetailed[]
): PartnersByCategory[] {
  // Group by category_key
  const grouped = new Map<string, PartnersByCategory>()

  for (const partner of partners) {
    if (!grouped.has(partner.category_key)) {
      grouped.set(partner.category_key, {
        category_key: partner.category_key,
        category_label: partner.category_label,
        category_display_order: partner.category_display_order,
        partners: [],
      })
    }

    grouped.get(partner.category_key)!.partners.push(partner)
  }

  // Convert to array and sort by category_display_order
  const result = Array.from(grouped.values())
  result.sort((a, b) => a.category_display_order - b.category_display_order)

  return result
}

/**
 * Check if a context has any partners.
 * Useful for conditional rendering.
 */
export async function contextHasPartners(
  contextType: ContextType,
  contextId?: string | null
): Promise<boolean> {
  const supabase = await createClient()

  let query = supabase
    .from("context_partners")
    .select("id", { count: "exact", head: true })
    .eq("context_type", contextType)
    .eq("is_visible", true)

  if (contextId) {
    query = query.eq("context_id", contextId)
  } else {
    query = query.is("context_id", null)
  }

  const { count, error } = await query

  if (error) {
    console.error("Error checking context partners:", error)
    return false
  }

  return (count || 0) > 0
}

/**
 * Get partner count by category for a context.
 * Useful for admin UI to show counts.
 */
export async function getPartnerCountsByCategory(
  contextType: ContextType,
  contextId?: string | null
): Promise<Record<string, number>> {
  const partners = await getContextPartnerLinks(contextType, contextId)
  
  const counts: Record<string, number> = {}
  for (const partner of partners) {
    if (partner.is_visible) {
      counts[partner.category_key] = (counts[partner.category_key] || 0) + 1
    }
  }

  return counts
}

// =============================================
// Storage Helpers
// =============================================

/**
 * Get public URL for a partner logo from storage.
 * Returns null if no storage path or on error.
 */
export async function getPartnerLogoUrl(
  storagePath: string | null
): Promise<string | null> {
  if (!storagePath) return null

  const supabase = await createClient()
  
  const { data } = supabase.storage
    .from("partner-logos")
    .getPublicUrl(storagePath)

  return data.publicUrl || null
}

/**
 * Get the logo URL for a partner from ContextPartnerDetailed data.
 * Prioritizes storage path over legacy URL field.
 */
export function getPartnerLogoUrlFromDetailed(partner: ContextPartnerDetailed): string | null {
  // First, try storage path
  if (partner.partner_logo_storage_path) {
    // Construct public URL for Supabase storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/partner-logos/${partner.partner_logo_storage_path}`
    }
  }

  // Fall back to legacy URL field
  return partner.partner_logo || null
}

/**
 * Get the logo URL for a partner (prefers storage, falls back to legacy URL)
 */
export async function getPartnerLogo(partner: Partner): Promise<string | null> {
  // Prefer storage path
  if (partner.logo_storage_path) {
    return getPartnerLogoUrl(partner.logo_storage_path)
  }

  // Fall back to legacy URL field
  return partner.logo || null
}
