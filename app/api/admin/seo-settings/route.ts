/**
 * API Route: Centralized Page SEO Management
 * 
 * GET /api/admin/seo-settings - List all page SEO records
 * POST /api/admin/seo-settings - Save single or batch page SEO settings
 */

import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { getAllPagesSEO } from "@/lib/data/seo-settings"
import type { PageSEORecord } from "@/lib/types/page-seo"

/**
 * Strip potential HTML tags and control characters to prevent stored XSS
 */
function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim()
}

export async function GET() {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    if (!hasPermission(currentAdmin.role as AdminRole, "settings")) {
      return NextResponse.json({ error: "Forbidden - Settings permission required" }, { status: 403 })
    }

    const pages = await getAllPagesSEO()
    return NextResponse.json({ pages })
  } catch (error) {
    console.error("Error fetching SEO settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    if (!hasPermission(currentAdmin.role as AdminRole, "settings")) {
      return NextResponse.json({ error: "Forbidden - Settings permission required" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const pagesToSave: PageSEORecord[] = Array.isArray(body.pages)
      ? body.pages
      : body.page
      ? [body.page]
      : []

    if (pagesToSave.length === 0) {
      return NextResponse.json({ error: "No page data provided" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const updatedPaths: string[] = []

    for (const page of pagesToSave) {
      if (!page.path || typeof page.path !== "string") continue

      const cleanPath = page.path.startsWith("/") ? page.path : `/${page.path}`
      const cleanTitle = sanitizeText(page.title).substring(0, 150)
      const cleanDesc = sanitizeText(page.description).substring(0, 350)
      const cleanKeywords = Array.isArray(page.keywords)
        ? page.keywords.map((k) => sanitizeText(k)).filter(Boolean).slice(0, 30)
        : []

      const payload = {
        path: cleanPath,
        page_name: sanitizeText(page.page_name) || "Page",
        category: ["core", "programs", "engagement", "media"].includes(page.category)
          ? page.category
          : "core",
        title: cleanTitle,
        description: cleanDesc,
        keywords: cleanKeywords,
        og_image: page.og_image?.trim() || null,
        og_image_alt: sanitizeText(page.og_image_alt) || null,
        canonical_url: page.canonical_url?.trim() || null,
        no_index: Boolean(page.no_index),
        is_published: page.is_published !== false,
        updated_by: currentAdmin.id,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("page_seo")
        .upsert(payload, { onConflict: "path" })

      if (error) {
        console.error(`Failed to upsert page_seo for ${cleanPath}:`, error)
        throw error
      }

      // If updating the homepage, also keep site_settings.homepage_seo in sync
      if (cleanPath === "/") {
        try {
          await supabase.from("site_settings").upsert(
            {
              key: "homepage_seo",
              value: {
                title: cleanTitle,
                description: cleanDesc,
                keywords: cleanKeywords,
                ogImage: page.og_image?.trim() || "",
              },
              updated_by: currentAdmin.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "key" }
          )
        } catch (syncErr) {
          console.warn("Failed to mirror homepage_seo to site_settings:", syncErr)
        }
      }

      updatedPaths.push(cleanPath)

      // Revalidate the public route so search engines and visitors see updates immediately
      try {
        revalidatePath(cleanPath)
      } catch (revError) {
        console.warn(`Failed to revalidate ${cleanPath}:`, revError)
      }
    }

    revalidatePath("/admin/seo")

    // Record in activity log
    try {
      await supabase.from("activity_logs").insert({
        user_id: currentAdmin.id,
        action: "UPDATE",
        entity_type: "page_seo",
        entity_id: null,
        new_data: { updated_paths: updatedPaths },
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      })
    } catch (logErr) {
      console.warn("Failed to write to activity_logs:", logErr)
    }

    return NextResponse.json({
      success: true,
      message: `Updated SEO settings for ${updatedPaths.length} page(s)`,
      updated: updatedPaths,
    })
  } catch (error) {
    console.error("Error saving page SEO settings:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save SEO settings" },
      { status: 500 }
    )
  }
}
