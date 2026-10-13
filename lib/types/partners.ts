// =============================================
// Universal Partners System — TypeScript Types
// =============================================
// These types mirror the database schema from:
//   - 070-universal-partners-system.sql (partner_categories, context_partners)
//   - 002-admin-schema.sql (partners table, updated)

// =============================================
// Context Types
// =============================================

export type ContextType =
  | "event"
  | "homepage"
  | "program"
  | "about"
  | "story"
  | "project";

// =============================================
// Partner Types
// =============================================

export type PartnerType = "partner" | "donor" | "sponsor";

export interface Partner {
  id: string;
  name: string;
  logo: string | null; // Legacy URL field (backward compatibility)
  logo_storage_path: string | null; // Path in storage bucket
  logo_uploaded_at: string | null;
  website: string | null;
  description: string | null;
  type: PartnerType;
  is_published: boolean;
  sort_order: number; // Legacy field (kept for backward compatibility)
  created_at: string;
  updated_at: string;
  // Context ownership (tracks where partner was created)
  created_context_type: ContextType | null;
  created_context_id: string | null;
}

// =============================================
// Category Types
// =============================================

export interface PartnerCategory {
  id: string;
  context_type: ContextType;
  context_id: string | null; // NULL for global contexts like 'homepage'
  category_key: string; // Programmatic key: 'organizers', 'sponsors', etc.
  category_label: string; // Display name: "Organizing Partners", "Sponsors"
  display_order: number; // Category ordering (lower = appears first)
  created_at: string;
  updated_at: string;
}

// =============================================
// Context Partners Types
// =============================================

export interface ContextPartner {
  id: string;
  context_type: ContextType;
  context_id: string | null;
  partner_id: string;
  category_key: string; // Must match a category_key in partner_categories
  display_order: number; // Partner ordering within category
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// Detailed View Types
// =============================================
// From context_partners_detailed view (denormalized for efficient querying)

export interface ContextPartnerDetailed {
  id: string;
  context_type: ContextType;
  context_id: string | null;
  partner_id: string;
  category_key: string;
  partner_display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;

  // Partner data
  partner_name: string;
  partner_logo: string | null;                // Legacy URL field
  partner_logo_storage_path: string | null;   // Storage bucket path
  partner_logo_uploaded_at: string | null;    // Upload timestamp
  partner_website: string | null;
  partner_description: string | null;
  partner_type: PartnerType;

  // Category data
  category_label: string;
  category_display_order: number;
}

// =============================================
// Grouped Partners Types
// =============================================
// For rendering: partners grouped by category with proper ordering

export interface PartnersByCategory {
  category_key: string;
  category_label: string;
  category_display_order: number;
  partners: ContextPartnerDetailed[];
}

export interface ContextPartnersData {
  context_type: ContextType;
  context_id: string | null;
  categories: PartnersByCategory[];
  total_partners: number;
}

// =============================================
// Input Types (for server actions)
// =============================================

export interface CreatePartnerInput {
  name: string;
  logo?: string; // Legacy URL
  website?: string;
  description?: string;
  type?: PartnerType;
  is_published?: boolean;
  sort_order?: number;
  // Context ownership (for event-specific partners)
  created_context_type?: ContextType | null;
  created_context_id?: string | null;
}

export interface UpdatePartnerInput extends Partial<CreatePartnerInput> {
  logo_storage_path?: string;
  logo_uploaded_at?: string;
}

export interface CreatePartnerCategoryInput {
  context_type: ContextType;
  context_id?: string | null;
  category_key: string;
  category_label: string;
  display_order?: number;
}

export interface UpdatePartnerCategoryInput {
  category_label?: string;
  display_order?: number;
}

export interface CreateContextPartnerInput {
  context_type: ContextType;
  context_id?: string | null;
  partner_id: string;
  category_key: string;
  display_order?: number;
  is_visible?: boolean;
}

export interface UpdateContextPartnerInput {
  category_key?: string;
  display_order?: number;
  is_visible?: boolean;
}

// Bulk operations (for admin efficiency)
export interface BulkCreateContextPartnersInput {
  context_type: ContextType;
  context_id?: string | null;
  partners: Array<{
    partner_id: string;
    category_key: string;
    display_order?: number;
    is_visible?: boolean;
  }>;
}

export interface ReorderCategoriesInput {
  context_type: ContextType;
  context_id?: string | null;
  category_orders: Array<{
    category_key: string;
    display_order: number;
  }>;
}

export interface ReorderPartnersInput {
  context_type: ContextType;
  context_id?: string | null;
  category_key: string;
  partner_orders: Array<{
    partner_id: string;
    display_order: number;
  }>;
}

// Logo upload input
export interface UploadPartnerLogoInput {
  partner_id: string;
  file: File;
}

// Copy categories from one context to another
export interface CopyCategoriesInput {
  source_context_type: ContextType;
  source_context_id?: string | null;
  target_context_type: ContextType;
  target_context_id?: string | null;
  include_partners?: boolean; // Also copy partner assignments
}

// =============================================
// Query Filter Types
// =============================================

export interface PartnerFilters {
  type?: PartnerType;
  is_published?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContextPartnerFilters {
  context_type: ContextType;
  context_id?: string | null;
  category_key?: string;
  is_visible?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// =============================================
// API Response Types
// =============================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================
// Helper Constants
// =============================================

export const CONTEXT_TYPE_LABELS: Record<ContextType, string> = {
  event: "Event",
  homepage: "Homepage",
  program: "Program",
  about: "About",
  story: "Story",
  project: "Project",
};

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  partner: "Partner",
  donor: "Donor",
  sponsor: "Sponsor",
};

// Default category structures
export const DEFAULT_EVENT_CATEGORIES: Array<{
  category_key: string;
  category_label: string;
  display_order: number;
}> = [
  { category_key: "organizers", category_label: "Organizing Partners", display_order: 0 },
  { category_key: "in_collaboration", category_label: "In Collaboration With", display_order: 1 },
  { category_key: "knowledge_partner", category_label: "Knowledge Partners", display_order: 2 },
  { category_key: "technical_partner", category_label: "Technical Partners", display_order: 3 },
  { category_key: "co_organizers", category_label: "Co-organizers", display_order: 4 },
];

export const DEFAULT_HOMEPAGE_CATEGORIES = DEFAULT_EVENT_CATEGORIES;

// Validation constants
export const MAX_LOGO_SIZE_MB = 2;
export const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;
export const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
export const ALLOWED_LOGO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg"];

// =============================================
// Utility Types
// =============================================

// For admin UI: category with partner count
export interface CategoryWithCount extends PartnerCategory {
  partner_count: number;
}

// For admin UI: partner with context info
export interface PartnerWithContexts extends Partner {
  contexts: Array<{
    context_type: ContextType;
    context_id: string | null;
    category_key: string;
    category_label: string;
  }>;
}
