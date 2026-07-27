/**
 * API Route: Save Homepage Settings
 * 
 * POST /api/admin/homepage-settings
 * Saves all homepage settings to the database
 */

import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
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

    // Check if user has permission (SUPER_ADMIN, ADMIN, or EDITOR)
    if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(currentAdmin.role)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Use service role client to bypass RLS for admin operations
    const supabase = createServiceRoleClient()

    // Parse request body
    const { settings, hero, heroCarousel, testimonials, timeline, story, whatWeDo } = await request.json()

    if (!settings) {
      return NextResponse.json(
        { error: "Settings are required" },
        { status: 400 }
      )
    }

    // Update each setting in the database
    const updates: { key: string; value: unknown }[] = [
      {
        key: HOMEPAGE_SETTINGS_KEYS.STATS,
        value: settings.stats,
      },
      {
        key: HOMEPAGE_SETTINGS_KEYS.PROGRAMS,
        value: settings.programs,
      },
      {
        key: HOMEPAGE_SETTINGS_KEYS.HERO_CTAS,
        value: settings.heroCTAs,
      },
      {
        key: HOMEPAGE_SETTINGS_KEYS.CTA_CARDS,
        value: settings.ctaCards,
      },
      {
        key: HOMEPAGE_SETTINGS_KEYS.BANNERS,
        value: settings.banners,
      },
      {
        key: HOMEPAGE_SETTINGS_KEYS.MARQUEE,
        value: settings.marquee,
      },
      {
        key: HOMEPAGE_SETTINGS_KEYS.SEO,
        value: settings.seo,
      },
      {
        key: HOMEPAGE_SETTINGS_KEYS.FLAGS,
        value: settings.flags,
      },
      {
        key: HOMEPAGE_SETTINGS_KEYS.TRUST_INDICATORS,
        value: settings.trustIndicators,
      },
      {
        key: HOMEPAGE_SETTINGS_KEYS.FEATURED_STORIES_RULES,
        value: settings.featuredStoriesRules,
      },
    ]

    // Add new settings if provided
    if (heroCarousel) {
      updates.push({
        key: HOMEPAGE_SETTINGS_KEYS.HERO_CAROUSEL,
        value: heroCarousel,
      })
    }

    if (testimonials) {
      updates.push({
        key: HOMEPAGE_SETTINGS_KEYS.TESTIMONIALS,
        value: testimonials,
      })
    }

    if (timeline) {
      updates.push({
        key: HOMEPAGE_SETTINGS_KEYS.TIMELINE,
        value: timeline,
      })
    }

    if (story) {
      updates.push({
        key: HOMEPAGE_SETTINGS_KEYS.STORY,
        value: story,
      })
    }

    if (whatWeDo) {
      updates.push({
        key: HOMEPAGE_SETTINGS_KEYS.WHAT_WE_DO,
        value: whatWeDo,
      })
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
    const updatedKeys = [...updates.map(u => u.key)]
    if (hero) updatedKeys.push("home_hero")
    
    await supabase.from("activity_logs").insert({
      user_id: currentAdmin.id,
      action: "update",
      entity_type: "homepage_settings",
      entity_id: null,
      new_data: { keys_updated: updatedKeys },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    })

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

export async function GET(request: NextRequest) {
  try {
    // Check authentication using the standard admin auth pattern
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
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
