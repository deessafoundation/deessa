/**
 * Centralized SEO & Social Sharing Command Center
 * 
 * Route: /admin/seo
 * Allows administrators to manage search engine visibility, Google SERP snippets,
 * OpenGraph 1200x630 cards, and Twitter/X metadata for all 12 public pages.
 */

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { getAllPagesSEO } from "@/lib/data/seo-settings"
import SeoManagerClient from "@/components/admin/seo/seo-manager-client"

export const metadata = {
  title: "SEO & Social Sharing Hub | Admin",
  description: "Centralized search engine optimization and social preview management",
}

export default async function SeoAdminPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")

  if (!hasPermission(admin.role as AdminRole, "settings")) {
    redirect("/admin")
  }

  const pages = await getAllPagesSEO()

  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingState />}>
        <SeoManagerClient initialPages={pages} userId={admin.user_id} />
      </Suspense>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-3" />
        <p className="text-xs font-medium text-muted-foreground">Loading SEO & Social Sharing Hub...</p>
      </div>
    </div>
  )
}
