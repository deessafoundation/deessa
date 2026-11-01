/**
 * API Route: Save Homepage Settings
 * 
 * POST /api/admin/homepage-settings
 * Saves all homepage settings to the database
 */

import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { HOMEPAGE_SETTINGS_KEYS } from "@/lib/types/homepage-settings"

export async function POST(request: NextRequest) {
  try {
    // Check authentication using the standard admin auth pattern
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // Check if user has permission for settings
    if (!hasPermission(currentAdmin.role as AdminRole, "settings")) {
      return NextResponse.json(
        { error: "Forbidden - Settings permission required" },
        { status: 403 }
      )
    }

    // Use service role client to bypass RLS for admin operations
    const supabase = createServiceRoleClient()

    // Parse request body
    const { settings, hero, heroCarousel, testimonials, timeline, story, whatWeDo } = await request.json()

    if (!settings && !hero && !heroCarousel && !testimonials && !timeline && !story && !whatWeDo) {
      return NextResponse.json(
        { error: "At least one settings payload is required" },
        { status: 400 }
      )
    }

    // Update each setting in the database
    const updates: { key: string; value: unknown }[] = []

    if (settings) {
      if (settings.stats !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.STATS, value: settings.stats })
      }
      if (settings.programs !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.PROGRAMS, value: settings.programs })
      }
      if (settings.heroCTAs !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.HERO_CTAS, value: settings.heroCTAs })
      }
      if (settings.ctaCards !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.CTA_CARDS, value: settings.ctaCards })
      }
      if (settings.banners !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.BANNERS, value: settings.banners })
      }
      if (settings.marquee !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.MARQUEE, value: settings.marquee })
      }
      if (settings.seo !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.SEO, value: settings.seo })
      }
      if (settings.flags !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.FLAGS, value: settings.flags })
      }
      if (settings.trustIndicators !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.TRUST_INDICATORS, value: settings.trustIndicators })
      }
      if (settings.featuredStoriesRules !== undefined) {
        updates.push({ key: HOMEPAGE_SETTINGS_KEYS.FEATURED_STORIES_RULES, value: settings.featuredStoriesRules })
      }
    }

    if (heroCarousel !== undefined) {
      updates.push({ key: HOMEPAGE_SETTINGS_KEYS.HERO_CAROUSEL, value: heroCarousel })
    }

    if (testimonials !== undefined) {
      updates.push({ key: HOMEPAGE_SETTINGS_KEYS.TESTIMONIALS, value: testimonials })
    }

    if (timeline !== undefined) {
      updates.push({ key: HOMEPAGE_SETTINGS_KEYS.TIMELINE, value: timeline })
    }

    if (story !== undefined) {
      updates.push({ key: HOMEPAGE_SETTINGS_KEYS.STORY, value: story })
    }

    if (whatWeDo !== undefined) {
      updates.push({ key: HOMEPAGE_SETTINGS_KEYS.WHAT_WE_DO, value: whatWeDo })
    }

    // Perform all updates
    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          value: update.value,
          updated_by: currentAdmin.id,
          updated_at: new Date().toISOString(),
        })
        .eq("key", update.key)

      if (error) {
        console.error(`Error updating ${update.key}:`, error)
        throw error
      }
    }

    // Update hero settings if provided
    if (hero) {
      const { error: heroError } = await supabase
        .from("site_settings")
        .update({
          value: hero,
          updated_by: currentAdmin.id,
          updated_at: new Date().toISOString(),
        })
        .eq("key", "home_hero")

      if (heroError) {
        console.error("Error updating home_hero:", heroError)
        throw heroError
      }
    }

    // Log activity
    const updatedKeys = [...updates.map((u) => u.key)]
    if (hero) updatedKeys.push("home_hero")
    
    await supabase.from("activity_logs").insert({
      user_id: currentAdmin.id,
      action: "UPDATE",
      entity_type: "homepage_settings",
      entity_id: null,
      new_data: { keys_updated: updatedKeys },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    })

    // The public homepage reads these CMS values. Clear its route cache right
    // after a save so the next visit receives the updated carousel.
    revalidatePath("/")
    revalidatePath("/admin/homepage")

    return NextResponse.json({
      success: true,
      message: "Homepage settings updated successfully",
    })
  } catch (error) {
    console.error("Error saving homepage settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check authentication using the standard admin auth pattern
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // Check if user has permission for settings
    if (!hasPermission(currentAdmin.role as AdminRole, "settings")) {
      return NextResponse.json(
        { error: "Forbidden - Settings permission required" },
        { status: 403 }
      )
    }

    // Use service role client to bypass RLS for admin operations
    const supabase = createServiceRoleClient()

    // Fetch all homepage settings
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value, updated_at")
      .like("key", "homepage_%")

    if (error) throw error

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error("Error fetching homepage settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
