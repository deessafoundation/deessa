"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/admin/media/file-upload"
import {
  Palette,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Loader2,
  Eye,
  Globe,
  Share2,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import { updateSiteSetting } from "@/lib/actions/admin-settings"

interface BrandingSectionProps {
  initialBranding?: Record<string, string>
  siteName?: string
  siteDescription?: string
}

export function BrandingSection({
  initialBranding = {},
  siteName = "deessa Foundation",
  siteDescription = "Empowering communities, transforming lives.",
}: BrandingSectionProps) {
  const router = useRouter()

  const [branding, setBranding] = useState({
    primaryLogo: initialBranding.primaryLogo || "",
    darkLogo: initialBranding.darkLogo || "",
    favicon: initialBranding.favicon || "",
    ogImage: initialBranding.ogImage || "",
  })

  const [isSaving, setIsSaving] = useState(false)

  const isDirty =
    branding.primaryLogo !== (initialBranding.primaryLogo || "") ||
    branding.darkLogo !== (initialBranding.darkLogo || "") ||
    branding.favicon !== (initialBranding.favicon || "") ||
    branding.ogImage !== (initialBranding.ogImage || "")

  const handleReset = () => {
    setBranding({
      primaryLogo: initialBranding.primaryLogo || "",
      darkLogo: initialBranding.darkLogo || "",
      favicon: initialBranding.favicon || "",
      ogImage: initialBranding.ogImage || "",
    })
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const result = await updateSiteSetting("branding", branding)

      if (result?.error) {
        notifications.showError({
          title: "Save Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Branding Assets Saved",
          description: "Logos, favicon, and social card have been updated live across the site.",
        })
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to save branding assets.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Logos and Icons Card */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Brand Identity & Logos</CardTitle>
              <CardDescription>Primary vectors and icons used in navigation headers, footer, and browser tabs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Primary Logo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">Primary Brand Logo (Light Theme)</Label>
                <Badge variant="outline" className="text-[10px]">SVG / PNG • Max 2MB</Badge>
              </div>
              <FileUpload
                bucket="site-assets"
                currentUrl={branding.primaryLogo}
                onUpload={(url) => setBranding((prev) => ({ ...prev, primaryLogo: url }))}
                label="Upload Light Logo"
                maxSizeMB={2}
              />
              <p className="text-xs text-muted-foreground">
                Main logo rendered on white/light backgrounds in the desktop and mobile navigation header.
              </p>
            </div>

            {/* Dark Logo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">Dark Mode Logo (Optional)</Label>
                <Badge variant="outline" className="text-[10px]">White Variant</Badge>
              </div>
              <FileUpload
                bucket="site-assets"
                currentUrl={branding.darkLogo}
                onUpload={(url) => setBranding((prev) => ({ ...prev, darkLogo: url }))}
                label="Upload Dark Logo"
                maxSizeMB={2}
              />
              <p className="text-xs text-muted-foreground">
                Alternative white/contrasting logo variant shown when dark mode is enabled.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 pt-2 border-t">
            {/* Favicon */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">Browser Favicon</Label>
                <Badge variant="outline" className="text-[10px]">16×16 or 32×32 PNG / ICO</Badge>
              </div>
              <FileUpload
                bucket="site-assets"
                currentUrl={branding.favicon}
                onUpload={(url) => setBranding((prev) => ({ ...prev, favicon: url }))}
                label="Upload Favicon"
                maxSizeMB={1}
              />
              <p className="text-xs text-muted-foreground">
                Small square icon displayed on browser tabs, bookmarks, and shortcuts.
              </p>
            </div>

            {/* Favicon Browser Tab Simulator */}
            <div className="space-y-3">
              <Label className="font-semibold text-sm flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Browser Tab Preview
              </Label>
              <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-background border border-b-0 shadow-sm text-xs font-medium text-foreground max-w-full truncate">
                  {branding.favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={branding.favicon}
                      alt="Favicon preview"
                      className="h-4 w-4 object-contain rounded-sm"
                    />
                  ) : (
                    <Globe className="h-4 w-4 text-primary" />
                  )}
                  <span className="truncate">{siteName} — Official Portal</span>
                </div>
                <div className="h-8 rounded-b-lg bg-background border p-2 flex items-center text-[11px] text-muted-foreground">
                  https://deessa.org
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenGraph & Social Sharing Card */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Social Sharing Banner (Open Graph / Twitter Card)</CardTitle>
              <CardDescription>Default preview image shown when any page from this website is shared on social media</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">Open Graph Banner (1200×630px)</Label>
                <Badge variant="outline" className="text-[10px]">1.91:1 Ratio • Max 5MB</Badge>
              </div>
              <FileUpload
                bucket="og-images"
                currentUrl={branding.ogImage}
                onUpload={(url) => setBranding((prev) => ({ ...prev, ogImage: url }))}
                label="Upload 1200×630 OG Banner"
                maxSizeMB={5}
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Appears on LinkedIn, X/Twitter, WhatsApp, and Facebook link unfurls. High-contrast typography and centered artwork recommended.
              </p>
            </div>

            {/* Social Card Preview Simulator */}
            <div className="space-y-3">
              <Label className="font-semibold text-sm flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Live Social Card Simulator
              </Label>
              <div className="rounded-xl border overflow-hidden bg-card shadow-sm max-w-md">
                <div className="relative aspect-[1.91/1] bg-muted/60 flex items-center justify-center overflow-hidden">
                  {branding.ogImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={branding.ogImage}
                      alt="OG Share preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">No share image uploaded</p>
                      <p className="text-[10px] text-muted-foreground/60">Upload a 1200×630 image to preview</p>
                    </div>
                  )}
                </div>
                <div className="p-3.5 space-y-1 bg-muted/20 border-t">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">deessa.org</p>
                  <p className="text-sm font-bold text-foreground truncate">{siteName}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{siteDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Bar */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm">
        <div className="text-sm text-muted-foreground">
          {isDirty ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              You have unsaved changes in branding assets.
            </span>
          ) : (
            <span>All branding assets are saved.</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
            className="h-10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Discard
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="h-10 min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Assets
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
