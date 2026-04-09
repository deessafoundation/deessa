/**
 * API Route: Save Homepage Settings
 * 
 * POST /api/admin/homepage-settings
 * Saves all homepage settings to the database
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { HOMEPAGE_SETTINGS_KEYS } from "@/lib/types/homepage-settings"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, role")
      .eq("user_id", user.id)
      .single()

    if (!adminUser || !["super_admin", "admin", "editor"].includes(adminUser.role)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Parse request body
    const { settings, hero, heroCarousel, testimonials, timeline } = await request.json()

    if (!settings) {
      return NextResponse.json(
        { error: "Settings are required" },
        { status: 400 }
      )
    }

    // Update each setting in the database
    const updates = [
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

    // Perform all updates
    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          value: update.value,
          updated_by: adminUser.id,
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
          updated_by: adminUser.id,
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
      user_id: adminUser.id,
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
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

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
