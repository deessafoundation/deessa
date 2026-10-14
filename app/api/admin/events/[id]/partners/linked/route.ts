import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceRoleClient()

    // For admin, fetch ALL linked partners (both visible and hidden)
    // Note: Do NOT use context_partners_detailed view here because it has WHERE is_visible = true
    const [rawPartnersRes, categoriesRes] = await Promise.all([
      supabase
        .from("context_partners")
        .select(`
          id,
          context_type,
          context_id,
          partner_id,
          category_key,
          display_order,
          is_visible,
          created_at,
          updated_at,
          partners (
            id,
            name,
            logo,
            website,
            description,
            type,
            logo_storage_path,
            logo_uploaded_at
          )
        `)
        .eq("context_type", "event")
        .eq("context_id", id)
        .order("display_order", { ascending: true }),
      supabase
        .from("partner_categories")
        .select("category_key, category_label, display_order")
        .eq("context_type", "event")
        .eq("context_id", id)
        .order("display_order", { ascending: true }),
    ])

    if (rawPartnersRes.error) {
      console.error("Error fetching linked partners:", rawPartnersRes.error)
      return NextResponse.json({ error: rawPartnersRes.error.message }, { status: 500 })
    }

    const categoryMap = new Map((categoriesRes.data || []).map((c) => [c.category_key, c]))

    // Map into standard ContextPartnerDetailed structure
    const partners = (rawPartnersRes.data || [])
      .filter((cp) => cp.partners) // Guard against dangling records
      .map((cp) => {
        const cat = categoryMap.get(cp.category_key)
        const p = Array.isArray(cp.partners) ? cp.partners[0] : cp.partners

        return {
          id: cp.id,
          context_type: cp.context_type,
          context_id: cp.context_id,
          partner_id: cp.partner_id,
          category_key: cp.category_key,
          partner_display_order: cp.display_order,
          is_visible: cp.is_visible,
          created_at: cp.created_at,
          updated_at: cp.updated_at,
          partner_name: p?.name || "",
          partner_logo: p?.logo || null,
          partner_logo_storage_path: p?.logo_storage_path || null,
          partner_logo_uploaded_at: p?.logo_uploaded_at || null,
          partner_website: p?.website || null,
          partner_description: p?.description || null,
          partner_type: p?.type || "partner",
          category_label: cat?.category_label || cp.category_key,
          category_display_order: cat?.display_order ?? 0,
        }
      })
      .sort((a, b) => {
        if (a.category_display_order !== b.category_display_order) {
          return a.category_display_order - b.category_display_order
        }
        return a.partner_display_order - b.partner_display_order
      })

    return NextResponse.json({ partners })
  } catch (error) {
    console.error("Error fetching linked partners:", error)
    return NextResponse.json({ error: "Failed to fetch linked partners" }, { status: 500 })
  }
}
