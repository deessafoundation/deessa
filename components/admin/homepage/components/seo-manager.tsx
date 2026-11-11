"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Globe, Share2, ExternalLink, Sparkles, ArrowRight, ShieldCheck, ImageIcon } from "lucide-react"
import type { HomepageSEOSettings } from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://deessafoundation.com"

interface SEOManagerProps {
  seo: HomepageSEOSettings
  onChange?: (seo: HomepageSEOSettings) => void
}

export default function SEOManager({ seo }: SEOManagerProps) {
  const [previewTab, setPreviewTab] = useState<"google" | "social">("google")

  const titleLength = (seo.title || "").length
  const descLength = (seo.description || "").length

  return (
    <div className="space-y-6">
      {/* Centralized SEO Hub Announcement Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                Homepage SEO is Centrally Managed
              </p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Single Source of Truth
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Google SERP snippets, OpenGraph 1200×630 share cards, Twitter cards, and canonical safeguards are managed in the central SEO & Social Hub.
            </p>
          </div>
        </div>
        <Link
          href="/admin/seo?page=/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all shrink-0 w-full sm:w-auto"
        >
          <Search className="w-3.5 h-3.5" />
          Edit Homepage in SEO Hub
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>

      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Live Homepage Snippet & Social Overview
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Current search and social card representation for <span className="font-mono text-foreground font-semibold">https://deessafoundation.com/</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/seo?page=/"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                <span>Full SEO Editor</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-5">
          {/* Metadata Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">SERP Meta Title</span>
              <p className="text-sm font-semibold text-foreground truncate">{seo.title || "Not configured"}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span>Length: {titleLength} chars</span>
                <span className={cn("font-medium", titleLength >= 40 && titleLength <= 65 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600")}>
                  {titleLength >= 40 && titleLength <= 65 ? "Optimal" : "Check length"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Google Meta Description</span>
              <p className="text-sm font-semibold text-foreground truncate">{seo.description || "Not configured"}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span>Length: {descLength} chars</span>
                <span className={cn("font-medium", descLength >= 120 && descLength <= 165 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600")}>
                  {descLength >= 120 && descLength <= 165 ? "Optimal" : "Check length"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Social Share Card (OG)</span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs font-semibold text-foreground truncate">{seo.ogImage ? "Custom Image Set" : "Default Image"}</p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span>{(seo.keywords || []).length} keywords</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
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
                    {SITE_URL.replace(/^https?:\/\//, "")}
                  </p>
                  <p className="text-sm font-bold text-foreground line-clamp-1">{seo.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{seo.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Canonical URL protected: https://deessafoundation.com/
            </span>
            <Link
              href="/admin/seo?page=/"
              className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
            >
              Open SEO Hub to change title, snippet, or image →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
