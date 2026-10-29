"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  ContextType,
  Partner,
  PartnerCategory,
  ContextPartner,
  CreatePartnerInput,
  UpdatePartnerInput,
  CreatePartnerCategoryInput,
  UpdatePartnerCategoryInput,
  CreateContextPartnerInput,
  UpdateContextPartnerInput,
  BulkCreateContextPartnersInput,
  ReorderCategoriesInput,
  ReorderPartnersInput,
  ActionResult,
} from "@/lib/types/partners"

// =============================================
// Auth Guard
// =============================================
async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify admin status
  const { data: admin } = await supabase.from("admin_users").select("id, role").eq("user_id", user.id).single()

  if (!admin) {
    throw new Error("Unauthorized: Not an admin user")
  }

  return { supabase, admin }
}

// =============================================
// Partner CRUD (Master Directory)
// =============================================

/**
 * Create a new partner in the master directory
 */
export async function createPartner(input: CreatePartnerInput): Promise<ActionResult<Partner>> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { data, error } = await supabase
      .from("partners")
      .insert({
        name: input.name,
        logo: input.logo || null,
        website: input.website || null,
        description: input.description || null,
        type: input.type || "partner",
        is_published: input.is_published ?? true,
        sort_order: input.sort_order || 0,
        created_context_type: input.created_context_type || null,
        created_context_id: input.created_context_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create partner:", error)
      return { success: false, error: "Failed to create partner" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "CREATE",
      entity_type: "partner",
      entity_id: data.id,
      new_data: { 
        name: input.name,
        context_type: input.created_context_type,
        context_id: input.created_context_id,
      },
    })

    revalidatePath("/admin/partners")
    revalidatePath("/")

    return { success: true, data: data as Partner, message: "Partner created successfully" }
  } catch (err) {
    console.error("Error creating partner:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to create partner" }
  }
}

/**
 * Update an existing partner
 */
export async function updatePartner(partnerId: string, input: UpdatePartnerInput): Promise<ActionResult<Partner>> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { data, error } = await supabase
      .from("partners")
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.logo !== undefined && { logo: input.logo }),
        ...(input.website !== undefined && { website: input.website }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.is_published !== undefined && { is_published: input.is_published }),
        ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
        ...(input.logo_storage_path !== undefined && { logo_storage_path: input.logo_storage_path }),
        ...(input.logo_uploaded_at !== undefined && { logo_uploaded_at: input.logo_uploaded_at }),
      })
      .eq("id", partnerId)
      .select()
      .single()

    if (error) {
      console.error("Failed to update partner:", error)
      return { success: false, error: "Failed to update partner" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "UPDATE",
      entity_type: "partner",
      entity_id: partnerId,
    })

    revalidatePath("/admin/partners")
    revalidatePath("/")

    return { success: true, data: data as Partner, message: "Partner updated successfully" }
  } catch (err) {
    console.error("Error updating partner:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to update partner" }
  }
}

/**
 * Delete a partner (cascades to context_partners)
 */
export async function deletePartner(partnerId: string): Promise<ActionResult> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { error } = await supabase.from("partners").delete().eq("id", partnerId)

    if (error) {
      console.error("Failed to delete partner:", error)
      return { success: false, error: "Failed to delete partner" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "DELETE",
      entity_type: "partner",
      entity_id: partnerId,
    })

    revalidatePath("/admin/partners")
    revalidatePath("/")

    return { success: true, message: "Partner deleted successfully" }
  } catch (err) {
    console.error("Error deleting partner:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete partner" }
  }
}

/**
 * Upload partner logo to storage
 */
export async function uploadPartnerLogo(partnerId: string, file: File): Promise<ActionResult<string>> {
  try {
    const { supabase } = await requireAdmin()

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed." }
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      return { success: false, error: "File size exceeds 2MB limit." }
    }

    // Generate storage path
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const storagePath = `${partnerId}/${timestamp}.${extension}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage.from("partner-logos").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Failed to upload logo:", uploadError)
      return { success: false, error: "Failed to upload logo" }
    }

    // Update partner record
    const { error: updateError } = await supabase
      .from("partners")
      .update({
        logo_storage_path: storagePath,
        logo_uploaded_at: new Date().toISOString(),
      })
      .eq("id", partnerId)

    if (updateError) {
      console.error("Failed to update partner with logo path:", updateError)
      return { success: false, error: "Logo uploaded but failed to update partner record" }
    }

    revalidatePath("/admin/partners")
    revalidatePath("/")

    return { success: true, data: storagePath, message: "Logo uploaded successfully" }
  } catch (err) {
    console.error("Error uploading partner logo:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to upload logo" }
  }
}

// =============================================
// Partner Category CRUD
// =============================================

/**
 * Create a new category for a context
 */
export async function createPartnerCategory(
  input: CreatePartnerCategoryInput
): Promise<ActionResult<PartnerCategory>> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { data, error } = await supabase
      .from("partner_categories")
      .insert({
        context_type: input.context_type,
        context_id: input.context_id || null,
        category_key: input.category_key,
        category_label: input.category_label,
        display_order: input.display_order || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create category:", error)
      return { success: false, error: "Failed to create category" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "CREATE",
      entity_type: "partner_category",
      entity_id: data.id,
      new_data: { context_type: input.context_type, category_key: input.category_key },
    })

    revalidatePath("/admin/partners")

    return { success: true, data: data as PartnerCategory, message: "Category created successfully" }
  } catch (err) {
    console.error("Error creating category:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to create category" }
  }
}

/**
 * Update a category
 */
export async function updatePartnerCategory(
  categoryId: string,
  input: UpdatePartnerCategoryInput
): Promise<ActionResult<PartnerCategory>> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { data, error } = await supabase
      .from("partner_categories")
      .update({
        ...(input.category_label !== undefined && { category_label: input.category_label }),
        ...(input.display_order !== undefined && { display_order: input.display_order }),
      })
      .eq("id", categoryId)
      .select()
      .single()

    if (error) {
      console.error("Failed to update category:", error)
      return { success: false, error: "Failed to update category" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "UPDATE",
      entity_type: "partner_category",
      entity_id: categoryId,
    })

    revalidatePath("/admin/partners")

    return { success: true, data: data as PartnerCategory, message: "Category updated successfully" }
  } catch (err) {
    console.error("Error updating category:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to update category" }
  }
}

/**
 * Delete a category (also removes all partner links in this category)
 */
export async function deletePartnerCategory(categoryId: string): Promise<ActionResult> {
  try {
    const { supabase, admin } = await requireAdmin()

    // First, get the category to remove associated context_partners
    const { data: category } = await supabase.from("partner_categories").select("*").eq("id", categoryId).single()

    if (category) {
      // Delete all context_partners in this category
      await supabase
        .from("context_partners")
        .delete()
        .eq("context_type", category.context_type)
        .eq("category_key", category.category_key)
    }

    // Delete the category
    const { error } = await supabase.from("partner_categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Failed to delete category:", error)
      return { success: false, error: "Failed to delete category" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "DELETE",
      entity_type: "partner_category",
      entity_id: categoryId,
    })

    revalidatePath("/admin/partners")

    return { success: true, message: "Category deleted successfully" }
  } catch (err) {
    console.error("Error deleting category:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete category" }
  }
}

/**
 * Reorder categories for a context
 */
export async function reorderCategories(input: ReorderCategoriesInput): Promise<ActionResult> {
  try {
    const { supabase, admin } = await requireAdmin()

    // Update each category's display_order
    for (const { category_key, display_order } of input.category_orders) {
      const { error } = await supabase
        .from("partner_categories")
        .update({ display_order })
        .eq("context_type", input.context_type)
        .eq("category_key", category_key)

      if (input.context_id) {
        await supabase
          .from("partner_categories")
          .update({ display_order })
          .eq("context_type", input.context_type)
          .eq("context_id", input.context_id)
          .eq("category_key", category_key)
      } else {
        await supabase
          .from("partner_categories")
          .update({ display_order })
          .eq("context_type", input.context_type)
          .is("context_id", null)
          .eq("category_key", category_key)
      }

      if (error) {
        console.error("Failed to reorder category:", error)
      }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "UPDATE",
      entity_type: "partner_categories",
      entity_id: input.context_type,
      new_data: { context_type: input.context_type, action: "reorder" },
    })

    revalidatePath("/admin/partners")

    return { success: true, message: "Categories reordered successfully" }
  } catch (err) {
    console.error("Error reordering categories:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to reorder categories" }
  }
}

// =============================================
// Context Partner CRUD (Junction Table)
// =============================================

/**
 * Link a partner to a context with category
 */
export async function createContextPartner(
  input: CreateContextPartnerInput
): Promise<ActionResult<ContextPartner>> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { data, error } = await supabase
      .from("context_partners")
      .insert({
        context_type: input.context_type,
        context_id: input.context_id || null,
        partner_id: input.partner_id,
        category_key: input.category_key,
        display_order: input.display_order || 0,
        is_visible: input.is_visible ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to link partner:", error)
      
      // Handle specific error cases
      if (error.code === "23505") {
        // Unique constraint violation
        return { success: false, error: "This partner is already added to this event" }
      }
      
      if (error.code === "23503") {
        // Foreign key violation
        return { success: false, error: "Partner not found or category doesn't exist" }
      }
      
      return { success: false, error: `Failed to link partner: ${error.message}` }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "CREATE",
      entity_type: "context_partner",
      entity_id: data.id,
      new_data: { context_type: input.context_type, partner_id: input.partner_id },
    })

    revalidatePath("/admin/partners")
    revalidatePath("/")

    return { success: true, data: data as ContextPartner, message: "Partner linked successfully" }
  } catch (err) {
    console.error("Error linking partner:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to link partner" }
  }
}

/**
 * Update a context partner link
 */
export async function updateContextPartner(
  linkId: string,
  input: UpdateContextPartnerInput
): Promise<ActionResult<ContextPartner>> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { data, error } = await supabase
      .from("context_partners")
      .update({
        ...(input.category_key !== undefined && { category_key: input.category_key }),
        ...(input.display_order !== undefined && { display_order: input.display_order }),
        ...(input.is_visible !== undefined && { is_visible: input.is_visible }),
      })
      .eq("id", linkId)
      .select()
      .single()

    if (error) {
      console.error("Failed to update context partner:", error)
      return { success: false, error: "Failed to update partner link" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "UPDATE",
      entity_type: "context_partner",
      entity_id: linkId,
    })

    revalidatePath("/admin/partners")
    revalidatePath("/")

    return { success: true, data: data as ContextPartner, message: "Partner link updated successfully" }
  } catch (err) {
    console.error("Error updating context partner:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to update partner link" }
  }
}

/**
 * Remove a partner from a context
 */
export async function deleteContextPartner(linkId: string): Promise<ActionResult> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { error } = await supabase.from("context_partners").delete().eq("id", linkId)

    if (error) {
      console.error("Failed to remove partner link:", error)
      return { success: false, error: "Failed to remove partner from context" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "DELETE",
      entity_type: "context_partner",
      entity_id: linkId,
    })

    revalidatePath("/admin/partners")
    revalidatePath("/")

    return { success: true, message: "Partner removed from context successfully" }
  } catch (err) {
    console.error("Error removing partner link:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to remove partner" }
  }
}

/**
 * Bulk create context partner links
 */
export async function bulkCreateContextPartners(input: BulkCreateContextPartnersInput): Promise<ActionResult> {
  try {
    const { supabase, admin } = await requireAdmin()

    const records = input.partners.map((p) => ({
      context_type: input.context_type,
      context_id: input.context_id || null,
      partner_id: p.partner_id,
      category_key: p.category_key,
      display_order: p.display_order || 0,
      is_visible: p.is_visible ?? true,
    }))

    const { error } = await supabase.from("context_partners").insert(records)

    if (error) {
      console.error("Failed to bulk create partner links:", error)
      return { success: false, error: "Failed to link partners to context" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "CREATE",
      entity_type: "context_partners_bulk",
      entity_id: input.context_type,
      new_data: { context_type: input.context_type, count: input.partners.length },
    })

    revalidatePath("/admin/partners")
    revalidatePath("/")

    return { success: true, message: `${input.partners.length} partner(s) linked successfully` }
  } catch (err) {
    console.error("Error bulk creating partner links:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to link partners" }
  }
}

/**
 * Reorder partners within a category
 */
export async function reorderPartners(input: ReorderPartnersInput): Promise<ActionResult> {
  try {
    const { supabase, admin } = await requireAdmin()

    // Update each partner's display_order
    for (const { partner_id, display_order } of input.partner_orders) {
      let query = supabase
        .from("context_partners")
        .update({ display_order })
        .eq("context_type", input.context_type)
        .eq("category_key", input.category_key)
        .eq("partner_id", partner_id)

      if (input.context_id) {
        query = query.eq("context_id", input.context_id)
      } else {
        query = query.is("context_id", null)
      }

      const { error } = await query

      if (error) {
        console.error("Failed to reorder partner:", error)
      }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "UPDATE",
      entity_type: "context_partners",
      entity_id: `${input.context_type}_${input.category_key}`,
      new_data: { context_type: input.context_type, category_key: input.category_key, action: "reorder" },
    })

    revalidatePath("/admin/partners")
    revalidatePath("/")

    return { success: true, message: "Partners reordered successfully" }
  } catch (err) {
    console.error("Error reordering partners:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to reorder partners" }
  }
}
