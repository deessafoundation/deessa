"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Globe, Share2, ExternalLink, Sparkles } from "lucide-react"
import type { HomepageSEOSettings } from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://deessafoundation.com"

interface SEOManagerProps {
  seo: HomepageSEOSettings
  onChange: (seo: HomepageSEOSettings) => void
}

export default function SEOManager({ seo, onChange }: SEOManagerProps) {
  const [previewTab, setPreviewTab] = useState<"google" | "social">("google")

  const updateSEO = (updates: Partial<HomepageSEOSettings>) => {
    onChange({ ...seo, ...updates })
  }

  const updateKeywords = (value: string) => {
    const keywords = value
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k)
    updateSEO({ keywords })
  }

  const titleLength = (seo.title || "").length
  const descLength = (seo.description || "").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">
              Site-Wide SEO & Social Sharing Hub Available
            </p>
            <p className="text-[11px] text-muted-foreground">
              You can now manage metadata, Google SERP cards, and social share previews for all 12 public pages in one central place.
            </p>
          </div>
        </div>
        <Link
          href="/admin/seo"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium transition-colors hover:bg-primary/90 shrink-0"
        >
          <Globe className="w-3.5 h-3.5" />
          Open SEO Hub
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </Link>
      </div>

      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Homepage Search & Social Metadata
          </CardTitle>
          <CardDescription className="text-xs">
            Configure organic search metadata and OpenGraph social card previews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Page Meta Title</Label>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    titleLength > 60 ? "text-destructive font-semibold" : "text-muted-foreground"
                  )}
                >
                  {titleLength}/60 chars
                </span>
              </div>
              <Input
                value={seo.title || ""}
                onChange={(e) => updateSEO({ title: e.target.value })}
                placeholder="deessa Foundation - Empowering Autistic Children & Families in Nepal"
                className="mt-1.5 h-9 text-sm"
                maxLength={70}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Optimal length is 50-60 characters for Google SERP titles.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Meta Description</Label>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    descLength > 160 ? "text-destructive font-semibold" : "text-muted-foreground"
                  )}
                >
                  {descLength}/160 chars
                </span>
              </div>
              <Textarea
                value={seo.description || ""}
                onChange={(e) => updateSEO({ description: e.target.value })}
                rows={3}
                placeholder="A non-profit organization dedicated to autism support, neurodiversity acceptance, and inclusive education for autistic children and their families across Nepal..."
                className="mt-1.5 text-sm resize-none"
                maxLength={175}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Optimal length is 150-160 characters for search snippets. This directly controls what Google shows when searching for your organization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Meta Keywords (comma separated)</Label>
                <Input
                  value={(seo.keywords || []).join(", ")}
                  onChange={(e) => updateKeywords(e.target.value)}
                  placeholder="Nepal NGO, autism support, inclusive education"
                  className="mt-1.5 h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {(seo.keywords || []).length} keywords configured
                </p>
              </div>

              <div>
                <Label className="text-xs font-medium">Social Card Image URL (OG Image)</Label>
                <Input
                  value={seo.ogImage || ""}
                  onChange={(e) => updateSEO({ ogImage: e.target.value })}
                  placeholder="/home/hero/art_banner.jpeg or https://..."
                  className="mt-1.5 h-9 font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Recommended resolution: 1200 × 630 px
                </p>
              </div>
            </div>
          </div>

          {/* Search & Social Preview Box */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live Snippet Simulation
              </h4>
              <div className="flex items-center gap-1 bg-card border rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewTab("google")}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    previewTab === "google"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Globe className="w-3 h-3" />
                  Google SERP
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("social")}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    previewTab === "social"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Share2 className="w-3 h-3" />
                  Social Card
                </button>
              </div>
            </div>

            {previewTab === "google" ? (
              /* Google Search Simulation */
              <div className="p-4 rounded-xl bg-card border border-border/60 space-y-1.5 font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    D
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">deessa Foundation</p>
                    <p className="text-[11px] text-muted-foreground">{SITE_URL}</p>
                  </div>
                </div>
                <h3 className="text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer leading-snug">
                  {seo.title || "Homepage Title"}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {seo.description || "Homepage meta description snippet..."}
                </p>
              </div>
            ) : (
              /* Social OpenGraph Simulation */
              <div className="rounded-xl overflow-hidden border border-border/60 bg-card max-w-md">
                <div className="h-44 bg-muted flex items-center justify-center relative overflow-hidden">
                  {seo.ogImage ? (
                    <img
                      src={seo.ogImage}
                      alt="Social OpenGraph preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">1200 × 630 OG Image Preview</span>
                  )}
                </div>
                <div className="p-3 bg-card border-t border-border/60 space-y-1">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground font-mono">
                    {new URL(SITE_URL).hostname}
                  </p>
                  <p className="text-sm font-bold text-foreground line-clamp-1">{seo.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{seo.description}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
