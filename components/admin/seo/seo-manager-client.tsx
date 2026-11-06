"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import type { PageSEORecord, PageSEOCategory } from "@/lib/types/page-seo"
import { Twitter, Facebook } from "@/components/shared/icons/social-icons"
import {
  Search,
  Globe,
  Share2,
  MessageCircle,
  Save,
  RotateCcw,
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  X,
  ExternalLink,
  Shield,
  Layers,
  Smartphone,
  Laptop,
  Loader2,
  Check,
  Info,
  ChevronDown,
  ImageIcon,
  SlidersHorizontal,
  Copy,
  PenSquare,
  Eye,
  Plus,
} from "lucide-react"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://deessafoundation.com"
const SITE_DOMAIN = "deessafoundation.com"
const PRODUCTION_ORIGIN = "https://deessafoundation.com"

// Authoritative canonical root (always deessafoundation.com, never *.vercel.app preview domains)
const CANONICAL_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL &&
  !process.env.NEXT_PUBLIC_SITE_URL.includes("vercel.app") &&
  !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : PRODUCTION_ORIGIN

interface SeoManagerClientProps {
  initialPages: PageSEORecord[]
  userId: string
}

type PreviewTab = "google" | "social" | "twitter" | "chat"
type MobileViewMode = "editor" | "preview"

const CATEGORIES: { id: PageSEOCategory | "all"; label: string }[] = [
  { id: "all", label: "All Pages" },
  { id: "core", label: "Core Pages" },
  { id: "programs", label: "Programs" },
  { id: "engagement", label: "Engagement" },
  { id: "media", label: "Media & Stories" },
]

const QUICK_TAG_SUGGESTIONS = [
  "autism support",
  "neurodiversity",
  "Nepal NGO",
  "inclusive education",
  "children with disabilities",
  "special education",
  "community advocacy",
]

export default function SeoManagerClient({ initialPages }: SeoManagerClientProps) {
  const [pages, setPages] = useState<PageSEORecord[]>(initialPages)
  const [selectedPath, setSelectedPath] = useState<string>(initialPages[0]?.path || "/")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<PageSEOCategory | "all">("all")
  const [previewTab, setPreviewTab] = useState<PreviewTab>("google")
  const [googleDevice, setGoogleDevice] = useState<"desktop" | "mobile">("mobile")
  const [mobileView, setMobileView] = useState<MobileViewMode>("editor")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Current selected page
  const currentPage = useMemo(() => {
    return pages.find((p) => p.path === selectedPath) || pages[0]
  }, [pages, selectedPath])

  // Filtered pages for the category tabs and search
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        page.page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.title.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = activeCategory === "all" || page.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [pages, searchQuery, activeCategory])

  // Overall SEO Health Audit calculations
  const audit = useMemo(() => {
    const total = pages.length
    const optimalTitles = pages.filter((p) => p.title.length >= 40 && p.title.length <= 60).length
    const optimalDescs = pages.filter((p) => p.description.length >= 130 && p.description.length <= 160).length
    const withCustomImages = pages.filter((p) => Boolean(p.og_image)).length
    const indexed = pages.filter((p) => !p.no_index).length

    return { total, optimalTitles, optimalDescs, withCustomImages, indexed }
  }, [pages])

  // Keyboard shortcut: Cmd+S / Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        if (hasChanges && !isSaving) {
          handleSave()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasChanges, isSaving, currentPage])

  // Prevent accidental navigation when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasChanges])

  // Update current page field
  const updateCurrentPage = (field: keyof PageSEORecord, value: any) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.path === selectedPath) {
          return { ...p, [field]: value }
        }
        return p
      })
    )
    setHasChanges(true)
  }

  // Keywords management
  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim().toLowerCase()
    if (!trimmed) return
    const currentKeywords = currentPage.keywords || []
    if (!currentKeywords.includes(trimmed)) {
      updateCurrentPage("keywords", [...currentKeywords, trimmed])
    }
    setTagInput("")
  }

  const removeKeyword = (keyword: string) => {
    const currentKeywords = currentPage.keywords || []
    updateCurrentPage(
      "keywords",
      currentKeywords.filter((k) => k !== keyword)
    )
  }

  // Save handler
  const handleSave = async () => {
    setIsSaving(true)
    const toastId = notifications.showLoading({
      title: "Saving SEO settings...",
      description: `Publishing updates for ${currentPage.page_name}...`,
    })

    try {
      const response = await fetch("/api/admin/seo-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: currentPage }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save SEO settings")
      }

      notifications.dismiss(toastId)
      notifications.showSuccess({
        title: "SEO Saved Successfully",
        description: `Metadata for ${currentPage.page_name} has been published and cache revalidated.`,
      })
      setHasChanges(false)
    } catch (error) {
      notifications.dismiss(toastId)
      notifications.showError({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Could not save SEO settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset handler
  const handleReset = () => {
    setPages(initialPages)
    setHasChanges(false)
    notifications.showInfo({
      title: "Changes Discarded",
      description: "Restored all SEO settings to the last saved database state.",
    })
  }

  // Social banner image upload
  const handleFileUpload = async (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      notifications.showError({
        title: "Invalid Image Type",
        description: "Please upload a JPG, PNG, or WebP image.",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      notifications.showError({
        title: "File Too Large",
        description: "Image size must be smaller than 5MB.",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "homepage-hero")
      formData.append(
        "customName",
        `og-${currentPage.path.replace(/\//g, "-").replace(/^-|-$/g, "") || "home"}`
      )

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      updateCurrentPage("og_image", data.url)
      notifications.showSuccess({
        title: "Image Uploaded",
        description: "Social share card image updated.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      notifications.showError({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Could not upload image.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Copy SERP snippet to clipboard
  const handleCopySnippet = () => {
    const text = `${currentPage.title}\n${SITE_URL}${currentPage.path}\n${currentPage.description}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSnippet(true)
      setTimeout(() => setCopiedSnippet(false), 2000)
    })
  }

  // Character length calculations
  const titleLen = (currentPage.title || "").length
  const descLen = (currentPage.description || "").length

  // Health feedback status
  const titleStatus =
    titleLen >= 40 && titleLen <= 60
      ? { text: "Optimal Google SERP length", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", percent: (titleLen / 60) * 100 }
      : titleLen > 60
      ? { text: "Will be truncated by Google (exceeds 60 chars)", color: "text-destructive", bg: "bg-destructive", percent: 100 }
      : { text: "Too short (aim for 40–60 characters)", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", percent: (titleLen / 60) * 100 }

  const descStatus =
    descLen >= 130 && descLen <= 160
      ? { text: "Optimal snippet length", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", percent: (descLen / 160) * 100 }
      : descLen > 160
      ? { text: "Will be truncated on search results (exceeds 160 chars)", color: "text-destructive", bg: "bg-destructive", percent: 100 }
      : { text: "Too brief (aim for 130–160 characters)", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", percent: (descLen / 160) * 100 }

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-20 max-w-full overflow-x-hidden">
      {/* ─── Top Header & Global Actions Bar ─── */}
      <div className="flex flex-col gap-3 sm:gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
                SEO & Social Sharing Hub
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Configure organic search metadata, Google SERP appearance, and social cards across all public pages.
            </p>
          </div>

          {/* Action Buttons (Desktop inline, mobile compact full width) */}
          <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
            {hasChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="flex-1 sm:flex-none h-9 px-3 text-xs text-muted-foreground hover:text-foreground touch-manipulation"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentPage.path, "_blank")}
              className="flex-1 sm:flex-none h-9 px-3 text-xs touch-manipulation"
              title="Open selected public page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              <span>Visit Page</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 sm:flex-none h-9 px-4 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] touch-manipulation"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              <kbd className="hidden lg:inline-block ml-2 text-[10px] font-mono opacity-60 bg-primary-foreground/20 px-1 py-0.2 rounded">
                ⌘S
              </kbd>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Site-Wide SEO Health Bar (Fluid 2-col on Mobile, 4-col on Desktop) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-3.5 shadow-xs">
          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1.5 truncate">
            <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Monitored Pages</span>
          </p>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">{audit.total}</span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">public routes</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-3.5 shadow-xs">
          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1.5 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Titles in Sweet Spot</span>
          </p>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {audit.optimalTitles}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">/ {audit.total}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-3.5 shadow-xs">
          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1.5 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Snippets in Sweet Spot</span>
          </p>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {audit.optimalDescs}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">/ {audit.total}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-3.5 shadow-xs">
          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1.5 truncate">
            <Share2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Social Cards Active</span>
          </p>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-primary">{audit.withCustomImages}</span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">/ {audit.total} configured</span>
          </div>
        </div>
      </div>

      {/* ─── TAB-BASED PAGE SELECTOR & CATEGORY NAVIGATION ─── */}
      <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs">
        {/* Category Tabs & Quick Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-border/60 pb-3">
          {/* Category Tabs (Segmented control with horizontal scroll on mobile) */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 -mx-1 px-1 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const count =
                cat.id === "all"
                  ? pages.length
                  : pages.filter((p) => p.category === cat.id).length

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all touch-manipulation",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                      activeCategory === cat.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by page or route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-muted/40 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Page Dropdown Card (Quick touch selector on screens < 640px) */}
        <div className="sm:hidden pt-0.5">
          <div className="flex items-center justify-between mb-1 text-[11px] text-muted-foreground font-medium">
            <span>Currently Editing Page</span>
            <span className="font-mono text-[10px]">{filteredPages.length} available</span>
          </div>
          <div className="relative">
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="w-full appearance-none bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground pr-8 focus:outline-none focus:ring-1 focus:ring-primary touch-manipulation"
            >
              {filteredPages.map((page) => (
                <option key={page.path} value={page.path}>
                  {page.page_name} — ({page.path})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Horizontal Page Tabs / Pills Shelf (Scrollable on Tablet & Desktop, also visible as swipe row on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1 pt-1 -mx-1 px-1 sm:mx-0 sm:px-0">
          {filteredPages.map((page) => {
            const isSelected = page.path === selectedPath
            const tOptimal = page.title.length >= 40 && page.title.length <= 60
            const dOptimal = page.description.length >= 130 && page.description.length <= 160

            return (
              <button
                key={page.path}
                type="button"
                onClick={() => setSelectedPath(page.path)}
                className={cn(
                  "group relative shrink-0 text-left px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border transition-all flex flex-col gap-0.5 touch-manipulation",
                  isSelected
                    ? "bg-primary/10 border-primary ring-1 ring-primary/30 shadow-xs"
                    : "bg-card border-border/80 hover:border-border hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-semibold truncate max-w-[130px] sm:max-w-[150px]",
                      isSelected ? "text-primary" : "text-foreground group-hover:text-foreground"
                    )}
                  >
                    {page.page_name}
                  </span>
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      page.no_index
                        ? "bg-destructive"
                        : tOptimal && dOptimal
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    )}
                    title={
                      page.no_index
                        ? "NoIndex applied"
                        : tOptimal && dOptimal
                        ? "SEO optimal"
                        : "Needs text tuning"
                    }
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                  <span>{page.path}</span>
                  {page.no_index && (
                    <span className="text-[9px] text-destructive font-sans font-bold">NoIndex</span>
                  )}
                </div>
              </button>
            )
          })}

          {filteredPages.length === 0 && (
            <p className="text-xs text-muted-foreground py-2 italic">
              No pages match &quot;{searchQuery}&quot;.
            </p>
          )}
        </div>
      </div>

      {/* ─── Mobile View Mode Switcher (Editor vs Live Preview on screens < lg) ─── */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-muted rounded-xl border border-border/60">
        <button
          type="button"
          onClick={() => setMobileView("editor")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all touch-manipulation",
            mobileView === "editor"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PenSquare className="w-3.5 h-3.5" />
          <span>Edit Metadata</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all touch-manipulation",
            mobileView === "preview"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Previews</span>
          {currentPage.og_image && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      {/* ─── FULL-WIDTH RESPONSIVE WORKSPACE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* ── LEFT COLUMN: METADATA & CONTENT EDITOR (7 Cols on Desktop) ── */}
        <div
          className={cn(
            "lg:col-span-7 space-y-5 sm:space-y-6",
            mobileView === "preview" ? "hidden lg:block" : "block"
          )}
        >
          {/* Active Page Header Banner */}
          <div className="rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {currentPage.page_name}
                </h2>
                <Badge variant="outline" className="text-xs font-mono py-0.5 px-2 bg-muted">
                  {currentPage.path}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-wider py-0.5 px-1.5",
                    currentPage.category === "core" && "text-blue-600 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40",
                    currentPage.category === "programs" && "text-emerald-600 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40",
                    currentPage.category === "engagement" && "text-orange-600 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/40",
                    currentPage.category === "media" && "text-purple-600 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40"
                  )}
                >
                  {currentPage.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Configuring organic search metadata and social cards for <span className="font-mono text-foreground">{SITE_DOMAIN}{currentPage.path}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySnippet}
                className="h-8 px-2.5 text-xs touch-manipulation"
                title="Copy title and description"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy Snippet
                  </>
                )}
              </Button>

              {/* Mobile shortcut to jump to preview */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileView("preview")}
                className="lg:hidden h-8 px-2.5 text-xs text-primary hover:bg-primary/10 touch-manipulation"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Preview
              </Button>
            </div>
          </div>

          {/* Core Search & Meta Form */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3 p-4 sm:p-6 sm:pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Search className="w-4 h-4 text-primary shrink-0" />
                Google SERP & Search Engine Metadata
              </CardTitle>
              <CardDescription className="text-xs">
                Fine-tune the title and description indexed by search crawlers and shown to users on Google.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-4 sm:p-6 pt-0 sm:pt-0">
              {/* Meta Title Field */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Page Title
                    <span className="text-destructive">*</span>
                  </Label>
                  <span className={cn("text-[11px] font-mono font-medium", titleStatus.color)}>
                    {titleLen}/60 chars
                  </span>
                </div>

                <Input
                  value={currentPage.title}
                  onChange={(e) => updateCurrentPage("title", e.target.value)}
                  placeholder="e.g. deessa Foundation - Empowering Autistic Children in Nepal"
                  className="h-11 sm:h-10 text-base sm:text-sm"
                  maxLength={100}
                />

                {/* Character gauge bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-300", titleStatus.bg)}
                    style={{ width: `${Math.min(titleStatus.percent, 100)}%` }}
                  />
                </div>

                <p className={cn("text-[11px] font-medium flex items-center gap-1", titleStatus.color)}>
                  <Info className="w-3 h-3 shrink-0" />
                  {titleStatus.text}
                </p>
              </div>

              {/* Meta Description Field */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Search Snippet Description
                    <span className="text-destructive">*</span>
                  </Label>
                  <span className={cn("text-[11px] font-mono font-medium", descStatus.color)}>
                    {descLen}/160 chars
                  </span>
                </div>

                <Textarea
                  value={currentPage.description}
                  onChange={(e) => updateCurrentPage("description", e.target.value)}
                  rows={3}
                  placeholder="Write a clear, compelling summary of this page..."
                  className="text-base sm:text-sm resize-none min-h-[96px]"
                  maxLength={250}
                />

                {/* Character gauge bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-300", descStatus.bg)}
                    style={{ width: `${Math.min(descStatus.percent, 100)}%` }}
                  />
                </div>

                <p className={cn("text-[11px] font-medium flex items-center gap-1", descStatus.color)}>
                  <Info className="w-3 h-3 shrink-0" />
                  {descStatus.text}
                </p>
              </div>

              {/* Keyword Tags Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Keywords & Search Tags</Label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {(currentPage.keywords || []).length} tags
                  </span>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl border bg-muted/30 flex flex-wrap gap-1.5 items-center min-h-[46px] focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                  {(currentPage.keywords || []).map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-card border border-border text-foreground shadow-xs"
                    >
                      <span>{keyword}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-0.5 p-0.5 touch-manipulation"
                        aria-label={`Remove tag ${keyword}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Type tag & press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        addKeyword(tagInput)
                      }
                    }}
                    className="flex-1 min-w-[140px] text-base sm:text-xs bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground py-1"
                  />
                </div>

                {/* Suggested Quick Tags */}
                <div className="pt-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5">
                    Quick suggestions (tap to add):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TAG_SUGGESTIONS.filter(
                      (tag) => !(currentPage.keywords || []).includes(tag)
                    ).slice(0, 4).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addKeyword(tag)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/60 transition-colors touch-manipulation"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Share Banner (OG Image) */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <Label className="text-xs font-semibold">Social Share Banner</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Display card for Facebook, Twitter/X, LinkedIn, WhatsApp & iMessage.
                    </p>
                  </div>
                  {/* Segmented upload method toggle */}
                  <div className="flex rounded-lg border border-border/80 p-0.5 bg-muted/40 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setUploadMethod("upload")}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 touch-manipulation",
                        uploadMethod === "upload"
                          ? "bg-card text-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Upload className="w-3 h-3" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod("url")}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 touch-manipulation",
                        uploadMethod === "url"
                          ? "bg-card text-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LinkIcon className="w-3 h-3" />
                      Image URL
                    </button>
                  </div>
                </div>

                {uploadMethod === "upload" ? (
                  /* Interactive Drag-and-drop Dropzone */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center touch-manipulation",
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.005]"
                        : "border-border/80 hover:border-primary/50 hover:bg-muted/20 bg-muted/5",
                      isUploading && "pointer-events-none opacity-80"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file)
                        e.target.value = ""
                      }}
                      disabled={isUploading}
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 py-3 text-primary">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-xs font-semibold">Uploading banner to storage...</span>
                        <span className="text-[10px] text-muted-foreground">Saving image asset</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 py-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                          <Upload className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          Tap to select image or drag and drop here
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          SVG, PNG, JPG, or WebP up to 5MB • 1200 × 630 px (1.91 : 1) recommended
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Image URL input */
                  <div className="space-y-1.5">
                    <Input
                      type="url"
                      value={currentPage.og_image || ""}
                      onChange={(e) => updateCurrentPage("og_image", e.target.value)}
                      placeholder="https://example.org/images/banner.jpg or /home/hero/art_banner.jpeg"
                      className="h-11 sm:h-10 text-base sm:text-xs font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Direct link to hosted banner image or site-relative path (e.g. <code>/home/hero/art_banner.jpeg</code>).
                    </p>
                  </div>
                )}

                {/* Live Banner Preview Box (shows below upload dropzone/URL so user can see what is uploaded) */}
                {currentPage.og_image && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-muted/20 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                      <div className="relative flex h-14 w-24 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-neutral-100/90 dark:bg-neutral-800/90 overflow-hidden shadow-xs">
                        <img
                          src={currentPage.og_image}
                          alt="Current banner preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                            <Check className="h-3 w-3 text-emerald-500" />
                            Banner Ready
                          </span>
                          <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono bg-background">
                            1200×630 OG
                          </Badge>
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground truncate" title={currentPage.og_image}>
                          {currentPage.og_image}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Ready for search & social previews
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(currentPage.og_image, "_blank")}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground touch-manipulation"
                        title="Open image in new tab"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {uploadMethod === "upload" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="h-7 px-2.5 text-[11px] touch-manipulation"
                        >
                          Replace
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCurrentPage("og_image", null)}
                        className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 touch-manipulation"
                        title="Remove social banner"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Controls Toggle */}
              <div className="pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-primary transition-colors touch-manipulation"
                >
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Advanced Indexing & Canonical Controls
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      showAdvanced && "rotate-180"
                    )}
                  />
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-3 mt-2 border-t border-border/40 animate-in fade-in duration-200">
                    {/* Indexing Switch */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60 gap-3">
                      <div>
                        <Label className="text-xs font-semibold">Allow Search Engine Indexing</Label>
                        <p className="text-[11px] text-muted-foreground">
                          When disabled, search engines will be instructed not to index this page (<code>noindex, nofollow</code>).
                        </p>
                      </div>
                      <Switch
                        checked={!currentPage.no_index}
                        onCheckedChange={(checked) => updateCurrentPage("no_index", !checked)}
                      />
                    </div>

                    {/* Canonical URL Override */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Custom Canonical URL (Optional)</Label>
                      <Input
                        value={currentPage.canonical_url || ""}
                        onChange={(e) => updateCurrentPage("canonical_url", e.target.value)}
                        placeholder={`${CANONICAL_ORIGIN}${currentPage.path}`}
                        className="text-base sm:text-xs font-mono h-11 sm:h-9"
                      />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Default canonical URL: <code className="text-foreground">{CANONICAL_ORIGIN}{currentPage.path === "/" ? "" : currentPage.path}</code>
                        <span className="block text-[10px] text-muted-foreground/80 mt-0.5">
                          Tells Google this is the primary version to index. Leave blank unless this page is syndicated from an external publication.
                        </span>
                      </p>
                    </div>

                    {/* Image Alt Text */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Social Banner Accessibility Alt Text</Label>
                      <Input
                        value={currentPage.og_image_alt || ""}
                        onChange={(e) => updateCurrentPage("og_image_alt", e.target.value)}
                        placeholder="Descriptive text for visually impaired readers..."
                        className="text-base sm:text-xs h-11 sm:h-9"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT COLUMN: LIVE SEARCH & SOCIAL SIMULATION CANVAS (5 Cols on Desktop) ── */}
        <div
          className={cn(
            "lg:col-span-5 space-y-4 lg:sticky lg:top-6",
            mobileView === "editor" ? "hidden lg:block" : "block"
          )}
        >
          <Card className="border border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="p-3.5 sm:p-4 border-b border-border/60 bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  Live Snippet Simulation
                </CardTitle>

                {/* Simulation Platform Switcher Tabs */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-xl overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("google")}
                    title="Google Search Result"
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 touch-manipulation",
                      previewTab === "google"
                        ? "bg-card text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewTab("social")}
                    title="Facebook / LinkedIn Card"
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 touch-manipulation",
                      previewTab === "social"
                        ? "bg-card text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    <span>Social</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewTab("twitter")}
                    title="Twitter / X Card"
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 touch-manipulation",
                      previewTab === "twitter"
                        ? "bg-card text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>X</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewTab("chat")}
                    title="WhatsApp / Messaging"
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 touch-manipulation",
                      previewTab === "chat"
                        ? "bg-card text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3.5 sm:p-5 space-y-4">
              {/* ── GOOGLE SERP PREVIEW ── */}
              {previewTab === "google" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Google SERP Card</span>
                    <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setGoogleDevice("desktop")}
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-medium transition-colors touch-manipulation",
                          googleDevice === "desktop"
                            ? "bg-card text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground"
                        )}
                      >
                        <Laptop className="w-3 h-3 inline mr-1" /> Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoogleDevice("mobile")}
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-medium transition-colors touch-manipulation",
                          googleDevice === "mobile"
                            ? "bg-card text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground"
                        )}
                      >
                        <Smartphone className="w-3 h-3 inline mr-1" /> Mobile
                      </button>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "p-3.5 sm:p-4 rounded-xl bg-card border border-border/80 space-y-1.5 font-sans transition-all",
                      googleDevice === "mobile" ? "w-full max-w-sm mx-auto shadow-xs" : "w-full"
                    )}
                  >
                    {/* Google Favicon & Breadcrumb */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        D
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">deessa Foundation</p>
                        <p className="text-[11px] text-muted-foreground truncate font-mono">
                          {SITE_URL} {currentPage.path !== "/" ? `› ${currentPage.path.replace(/^\//, "")}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Google Blue Link Title */}
                    <h3 className="text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer leading-snug pt-0.5 break-words">
                      {currentPage.title || "Page Title Here"}
                    </h3>

                    {/* Google Snippet Text */}
                    <p className="text-xs text-muted-foreground line-clamp-3 sm:line-clamp-2 leading-relaxed break-words">
                      {currentPage.description || "Enter a meta description to see how it will render on Google search results..."}
                    </p>
                  </div>

                  <p className="text-[11px] text-muted-foreground italic text-center">
                    Simulates standard Google search engine ranking card appearance.
                  </p>
                </div>
              )}

              {/* ── FACEBOOK / LINKEDIN PREVIEW ── */}
              {previewTab === "social" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Facebook & LinkedIn Feed Card</span>
                    <span className="font-mono text-[10px]">1.91 : 1 ratio</span>
                  </div>

                  <div className="w-full rounded-xl overflow-hidden border border-border/80 bg-card shadow-xs">
                    <div className="aspect-[1.91/1] bg-muted flex items-center justify-center relative overflow-hidden">
                      {currentPage.og_image ? (
                        <img
                          src={currentPage.og_image}
                          alt="Social card preview"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">Upload 1200×630 banner to preview</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-muted/20 border-t border-border/60 space-y-1">
                      <p className="text-[10px] uppercase font-mono font-bold text-muted-foreground tracking-wider">
                        {SITE_DOMAIN}
                      </p>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1 break-words">
                        {currentPage.title || "Page Title"}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
                        {currentPage.description || "Page meta description summary..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TWITTER / X PREVIEW ── */}
              {previewTab === "twitter" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Twitter / X Summary Large Card</span>
                    <span className="font-mono text-[10px]">2 : 1 ratio</span>
                  </div>

                  <div className="w-full rounded-2xl overflow-hidden border border-border/80 bg-card shadow-xs">
                    <div className="aspect-[2/1] bg-muted flex items-center justify-center relative overflow-hidden">
                      {currentPage.og_image ? (
                        <img
                          src={currentPage.og_image}
                          alt="Twitter card preview"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Twitter className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">No banner set</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3.5 space-y-1 bg-card">
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {SITE_DOMAIN} • By @deessafoundation
                      </p>
                      <h4 className="text-sm font-bold text-foreground line-clamp-1 break-words">
                        {currentPage.title || "Page Title"}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                        {currentPage.description || "Page description..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CHAT (WHATSAPP / IMESSAGE) PREVIEW ── */}
              {previewTab === "chat" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">WhatsApp / Chat Bubble Unfurl</span>
                    <span className="font-mono text-[10px]">Chat Preview</span>
                  </div>

                  <div className="p-2 sm:p-3 rounded-2xl bg-muted/40 border border-border/80 w-full max-w-sm mx-auto">
                    <div className="rounded-xl overflow-hidden bg-card border border-border/60 shadow-xs">
                      {currentPage.og_image && (
                        <div className="aspect-[16/9] bg-muted">
                          <img
                            src={currentPage.og_image}
                            alt="Chat banner preview"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        </div>
                      )}
                      <div className="p-3 space-y-1">
                        <h4 className="text-xs font-bold text-foreground line-clamp-1 break-words">
                          {currentPage.title || "Page Title"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed break-words">
                          {currentPage.description || "Description preview..."}
                        </p>
                        <p className="text-[10px] text-primary font-mono pt-1">
                          {SITE_DOMAIN}{currentPage.path}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnostic Checklist */}
              <div className="rounded-xl border border-border/60 bg-muted/10 p-3 sm:p-3.5 space-y-2 pt-3">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  SEO Checklist for {currentPage.page_name}
                </p>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground truncate">Title length ({titleLen} chars)</span>
                    {titleLen >= 40 && titleLen <= 60 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Sweet spot
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium shrink-0">
                        {titleLen > 60 ? "Truncated" : "Short"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground truncate">Snippet length ({descLen} chars)</span>
                    {descLen >= 130 && descLen <= 160 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Sweet spot
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium shrink-0">
                        {descLen > 160 ? "Truncated" : "Short"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground truncate">1200×630 Social Banner</span>
                    {currentPage.og_image ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium shrink-0">Fallback</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground truncate">Search indexing</span>
                    {!currentPage.no_index ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Indexable
                      </span>
                    ) : (
                      <span className="text-destructive font-medium shrink-0">noindex</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Floating Unsaved Changes Bar (Mobile & Safe-Area Aware) ─── */}
      {hasChanges && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl bg-card/95 border border-primary/40 shadow-xl shadow-black/15 backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate">
                Unsaved: <span className="text-primary">{currentPage.page_name}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="h-8 px-2 sm:px-2.5 text-xs text-muted-foreground hover:text-foreground touch-manipulation"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 px-3 sm:px-3.5 text-xs font-semibold shadow-xs touch-manipulation"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
