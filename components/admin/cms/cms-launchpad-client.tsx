"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import {
  Home,
  Image,
  FileText,
  Calendar,
  Users,
  Building,
  BarChart3,
  FolderKanban,
  Newspaper,
  Settings as SettingsIcon,
  Podcast,
  ArrowRight,
  Search,
  Star,
  Plus,
  ExternalLink,
  Layers,
  BookOpen,
  Palette,
  MessageSquare,
  Info,
  X,
  Sparkles,
  LayoutGrid,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface CMSLiveCounts {
  events?: number
  projects?: number
  programs?: number
  stories?: number
  podcasts?: number
  team?: number
  partners?: number
  media?: number
  artworks?: number
  facebook_posts?: number
  newsletter?: number
  stats?: number
}

export interface CMSModuleItem {
  id: string
  title: string
  description: string
  category: "core" | "publishing" | "media" | "community" | "governance"
  categoryLabel: string
  icon: any
  href: string
  newHref?: string
  newLabel?: string
  permission: string
  colorBadge: string
  iconColor: string
  bgSoft: string
  countKey?: keyof CMSLiveCounts
  unit?: string
  keywords: string[]
}

interface CMSLaunchpadClientProps {
  adminRole: string
  initialCounts: CMSLiveCounts
  accessibleModuleIds: string[]
}

const ALL_MODULES: CMSModuleItem[] = [
  // 1. Core Pages
  {
    id: "homepage",
    title: "Homepage Manager",
    description: "Hero banner, mission narrative, initiatives preview, and layout controls",
    category: "core",
    categoryLabel: "Core Pages",
    icon: Home,
    href: "/admin/homepage",
    permission: "settings",
    colorBadge: "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    iconColor: "text-sky-600 dark:text-sky-400",
    bgSoft: "bg-sky-50 dark:bg-sky-950/30",
    keywords: ["home", "banner", "hero", "layout", "cta", "landing"],
  },
  {
    id: "about",
    title: "Who We Are (About)",
    description: "Vision, mission, core values, organizational journey, and executive bio tabs",
    category: "core",
    categoryLabel: "Core Pages",
    icon: Info,
    href: "/admin/about",
    permission: "settings",
    colorBadge: "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    bgSoft: "bg-blue-50 dark:bg-blue-950/30",
    keywords: ["about", "mission", "vision", "values", "history", "who we are"],
  },
  {
    id: "what-we-do",
    title: "What We Do",
    description: "Core strategic pillars, foundational approaches, and public programmatic focus",
    category: "core",
    categoryLabel: "Core Pages",
    icon: Layers,
    href: "/admin/what-we-do",
    permission: "settings",
    colorBadge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bgSoft: "bg-indigo-50 dark:bg-indigo-950/30",
    keywords: ["pillars", "what we do", "programs", "strategy", "initiatives"],
  },
  {
    id: "settings",
    title: "Site Settings",
    description: "Global identity, branding, logos, contact info, typography, and site configuration",
    category: "core",
    categoryLabel: "Core Pages",
    icon: SettingsIcon,
    href: "/admin/settings",
    permission: "settings",
    colorBadge: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    iconColor: "text-slate-600 dark:text-slate-300",
    bgSoft: "bg-slate-50 dark:bg-slate-900/40",
    keywords: ["config", "branding", "settings", "footer", "typography", "logo"],
  },

  // 2. Publishing & Editorial
  {
    id: "events",
    title: "Events & Workshops",
    description: "Schedule conferences, gatherings, registrations, tickets, and partner summits",
    category: "publishing",
    categoryLabel: "Publishing",
    icon: Calendar,
    href: "/admin/events",
    newHref: "/admin/events/new",
    newLabel: "New Event",
    permission: "events",
    colorBadge: "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    iconColor: "text-orange-600 dark:text-orange-400",
    bgSoft: "bg-orange-50 dark:bg-orange-950/30",
    countKey: "events",
    unit: "events",
    keywords: ["event", "conference", "tickets", "registrations", "workshop", "calendar"],
  },
  {
    id: "programs",
    title: "Foundation Programs",
    description: "Strategic community programs, multi-stage frameworks, and impact tracks",
    category: "publishing",
    categoryLabel: "Publishing",
    icon: BookOpen,
    href: "/admin/programs",
    newHref: "/admin/programs/new",
    newLabel: "New Program",
    permission: "programs",
    colorBadge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgSoft: "bg-emerald-50 dark:bg-emerald-950/30",
    countKey: "programs",
    unit: "programs",
    keywords: ["program", "education", "advocacy", "curriculum", "courses"],
  },
  {
    id: "projects",
    title: "Community Projects",
    description: "Field projects, targeted initiatives, milestone timelines, and progress logs",
    category: "publishing",
    categoryLabel: "Publishing",
    icon: FolderKanban,
    href: "/admin/projects",
    newHref: "/admin/projects/new",
    newLabel: "New Project",
    permission: "projects",
    colorBadge: "bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300 border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    bgSoft: "bg-green-50 dark:bg-green-950/30",
    countKey: "projects",
    unit: "projects",
    keywords: ["project", "fieldwork", "initiatives", "campaigns", "milestones"],
  },
  {
    id: "stories",
    title: "Changemaker Stories",
    description: "Success chronicles, community voices, editorial articles, and testimonials",
    category: "publishing",
    categoryLabel: "Publishing",
    icon: FileText,
    href: "/admin/stories",
    newHref: "/admin/stories/new",
    newLabel: "New Story",
    permission: "stories",
    colorBadge: "bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    iconColor: "text-violet-600 dark:text-violet-400",
    bgSoft: "bg-violet-50 dark:bg-violet-950/30",
    countKey: "stories",
    unit: "stories",
    keywords: ["story", "article", "blog", "testimonial", "narrative", "case study"],
  },
  {
    id: "podcasts",
    title: "Podcasts & Media Audio",
    description: "Audio episodes, Spotify/YouTube links, guest bios, transcripts, and highlights",
    category: "publishing",
    categoryLabel: "Publishing",
    icon: Podcast,
    href: "/admin/podcasts",
    newHref: "/admin/podcasts/new",
    newLabel: "New Episode",
    permission: "stories",
    colorBadge: "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    iconColor: "text-rose-600 dark:text-rose-400",
    bgSoft: "bg-rose-50 dark:bg-rose-950/30",
    countKey: "podcasts",
    unit: "episodes",
    keywords: ["podcast", "audio", "episodes", "interview", "youtube", "spotify"],
  },

  // 3. Media & Assets
  {
    id: "media",
    title: "Media Asset Library",
    description: "Storage bucket browser, high-res photos, documents, and CDN asset management",
    category: "media",
    categoryLabel: "Media & Assets",
    icon: Image,
    href: "/admin/media",
    permission: "settings",
    colorBadge: "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    bgSoft: "bg-purple-50 dark:bg-purple-950/30",
    countKey: "media",
    unit: "assets",
    keywords: ["media", "images", "photos", "assets", "uploads", "storage"],
  },
  {
    id: "artworks",
    title: "Artworks Gallery",
    description: "Curate visual art pieces, artist acknowledgments, exhibits, and public gallery",
    category: "media",
    categoryLabel: "Media & Assets",
    icon: Palette,
    href: "/admin/artworks",
    permission: "settings",
    colorBadge: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/70 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
    bgSoft: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    countKey: "artworks",
    unit: "artworks",
    keywords: ["art", "artwork", "gallery", "exhibit", "artist", "creative"],
  },

  // 4. Community & Reach
  {
    id: "team",
    title: "Team & Leadership",
    description: "Executive leadership, trustees, board members, advisors, and staff portraits",
    category: "community",
    categoryLabel: "Community",
    icon: Users,
    href: "/admin/team",
    newHref: "/admin/team/new",
    newLabel: "New Member",
    permission: "team",
    colorBadge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    bgSoft: "bg-cyan-50 dark:bg-cyan-950/30",
    countKey: "team",
    unit: "members",
    keywords: ["team", "leadership", "board", "staff", "advisors", "people"],
  },
  {
    id: "partners",
    title: "Partners & Sponsors",
    description: "Strategic institutional partners, corporate sponsors, and allied organizations",
    category: "community",
    categoryLabel: "Community",
    icon: Building,
    href: "/admin/partners",
    newHref: "/admin/partners/new",
    newLabel: "New Partner",
    permission: "partners",
    colorBadge: "bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    iconColor: "text-teal-600 dark:text-teal-400",
    bgSoft: "bg-teal-50 dark:bg-teal-950/30",
    countKey: "partners",
    unit: "partners",
    keywords: ["partner", "sponsor", "alliances", "donors", "collaborators"],
  },
  {
    id: "community-posts",
    title: "Community Social Feed",
    description: "Curate live social broadcasts, Facebook embedded dispatches, and field updates",
    category: "community",
    categoryLabel: "Community",
    icon: MessageSquare,
    href: "/admin/community-posts",
    permission: "settings",
    colorBadge: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    bgSoft: "bg-amber-50 dark:bg-amber-950/30",
    countKey: "facebook_posts",
    unit: "posts",
    keywords: ["social", "facebook", "feed", "posts", "dispatches", "community"],
  },
  {
    id: "newsletter",
    title: "Newsletter Subscribers",
    description: "Subscriber database, audience segments, growth metrics, and CSV export",
    category: "community",
    categoryLabel: "Community",
    icon: Newspaper,
    href: "/admin/newsletter",
    permission: "newsletters",
    colorBadge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    bgSoft: "bg-yellow-50 dark:bg-yellow-950/30",
    countKey: "newsletter",
    unit: "subscribers",
    keywords: ["newsletter", "subscribers", "email", "campaign", "audience"],
  },

  // 5. Governance & Metrics
  {
    id: "stats",
    title: "Impact Statistics",
    description: "Public KPIs, live milestone numbers, community metrics, and counter highlights",
    category: "governance",
    categoryLabel: "Governance",
    icon: BarChart3,
    href: "/admin/stats",
    newHref: "/admin/stats/new",
    newLabel: "New Metric",
    permission: "stats",
    colorBadge: "bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    iconColor: "text-pink-600 dark:text-pink-400",
    bgSoft: "bg-pink-50 dark:bg-pink-950/30",
    countKey: "stats",
    unit: "metrics",
    keywords: ["stats", "impact", "numbers", "kpi", "metrics", "achievements"],
  },
]

const CATEGORY_TABS = [
  { id: "all", label: "All Modules" },
  { id: "core", label: "Core Pages" },
  { id: "publishing", label: "Publishing" },
  { id: "media", label: "Media & Assets" },
  { id: "community", label: "Community" },
  { id: "governance", label: "Governance" },
]

export default function CMSLaunchpadClient({
  adminRole,
  initialCounts,
  accessibleModuleIds,
}: CMSLaunchpadClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter modules by user permission
  const accessibleModules = useMemo(() => {
    return ALL_MODULES.filter((m) => accessibleModuleIds.includes(m.id))
  }, [accessibleModuleIds])

  // Load pinned modules from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("deessa_admin_cms_pinned")
      if (stored) {
        setPinnedIds(JSON.parse(stored))
      } else {
        // Sensible default favorites
        setPinnedIds(["events", "projects", "stories", "media"])
      }
    } catch {
      setPinnedIds(["events", "projects", "stories", "media"])
    }
  }, [])

  // Toggle pinning
  const togglePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      try {
        localStorage.setItem("deessa_admin_cms_pinned", JSON.stringify(next))
      } catch (err) {
        console.error("Failed to save pinned modules:", err)
      }
      return next
    })
  }

  // Keyboard shortcut: Pressing '/' focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("")
        searchInputRef.current?.blur()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Filtered modules
  const filteredModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return accessibleModules.filter((module) => {
      // Category filter
      if (selectedCategory !== "all" && module.category !== selectedCategory) {
        return false
      }

      // Search filter
      if (!query) return true

      const inTitle = module.title.toLowerCase().includes(query)
      const inDesc = module.description.toLowerCase().includes(query)
      const inKeywords = module.keywords.some((kw) => kw.includes(query))
      const inCategory = module.categoryLabel.toLowerCase().includes(query)

      return inTitle || inDesc || inKeywords || inCategory
    })
  }, [accessibleModules, selectedCategory, searchQuery])

  // Pinned modules set
  const pinnedModules = useMemo(() => {
    return accessibleModules.filter((m) => pinnedIds.includes(m.id))
  }, [accessibleModules, pinnedIds])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: accessibleModules.length }
    for (const m of accessibleModules) {
      counts[m.category] = (counts[m.category] || 0) + 1
    }
    return counts
  }, [accessibleModules])

  // Top Operational Metrics Calculations
  const publishingTotal =
    (initialCounts.events || 0) +
    (initialCounts.projects || 0) +
    (initialCounts.programs || 0)

  const editorialTotal =
    (initialCounts.stories || 0) +
    (initialCounts.podcasts || 0)

  const communityTotal =
    (initialCounts.team || 0) +
    (initialCounts.partners || 0)

  const mediaTotal =
    (initialCounts.media || 0) +
    (initialCounts.artworks || 0)

  return (
    <div className="space-y-6">
      {/* 1. Executive Page Header */}
      <header className="rounded-2xl border border-border/70 bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Admin</span>
              <span>/</span>
              <span className="text-foreground font-semibold">CMS Launchpad</span>
              <span className="inline-block h-1 w-1 rounded-full bg-border" />
              <Badge variant="outline" className="text-[10px] py-0 px-2 font-normal capitalize">
                Role: {adminRole.replace("_", " ")}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Content Management Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Central operational launchpad for foundation programs, editorial publications, media assets, and governance.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 md:pt-0">
            {/* Direct Quick Create Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5 font-medium shadow-sm min-h-[38px] sm:min-h-[36px]">
                  <Plus className="h-4 w-4" />
                  <span>Quick Create</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs">Create New Entity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/events/new" className="cursor-pointer gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-orange-600" />
                    <span>New Event</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/programs/new" className="cursor-pointer gap-2 text-xs">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                    <span>New Program</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/projects/new" className="cursor-pointer gap-2 text-xs">
                    <FolderKanban className="h-3.5 w-3.5 text-green-600" />
                    <span>New Project</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/stories/new" className="cursor-pointer gap-2 text-xs">
                    <FileText className="h-3.5 w-3.5 text-violet-600" />
                    <span>New Story</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/podcasts/new" className="cursor-pointer gap-2 text-xs">
                    <Podcast className="h-3.5 w-3.5 text-rose-600" />
                    <span>New Podcast</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/team/new" className="cursor-pointer gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Add Team Member</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/partners/new" className="cursor-pointer gap-2 text-xs">
                    <Building className="h-3.5 w-3.5 text-teal-600" />
                    <span>Add Partner</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Live site link */}
            <Button variant="outline" size="sm" asChild className="gap-1.5 min-h-[38px] sm:min-h-[36px] text-xs">
              <Link href="/" target="_blank">
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                <span>Live Site</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Live Content Pulse (Operational Metrics - 2x2 on Mobile, 4x1 on Desktop) */}
      <section aria-label="CMS Summary Metrics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Publishing Velocity */}
          <Card
            onClick={() => setSelectedCategory("publishing")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedCategory("publishing")}
            className={cn(
              "cursor-pointer transition-all hover:border-orange-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
              selectedCategory === "publishing" ? "ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-card border-orange-500/50" : ""
            )}
          >
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Publishing & Programs</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">{publishingTotal}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate hidden sm:block">Events, projects & tracks</p>
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Editorial & Voices */}
          <Card
            onClick={() => setSelectedCategory("publishing")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedCategory("publishing")}
            className={cn(
              "cursor-pointer transition-all hover:border-violet-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              selectedCategory === "publishing" ? "ring-2 ring-violet-500 ring-offset-1 dark:ring-offset-card border-violet-500/50" : ""
            )}
          >
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Stories & Podcasts</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">{editorialTotal}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate hidden sm:block">Narratives & audio</p>
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Community & Reach */}
          <Card
            onClick={() => setSelectedCategory("community")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedCategory("community")}
            className={cn(
              "cursor-pointer transition-all hover:border-cyan-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
              selectedCategory === "community" ? "ring-2 ring-cyan-500 ring-offset-1 dark:ring-offset-card border-cyan-500/50" : ""
            )}
          >
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">People & Alliances</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">{communityTotal}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate hidden sm:block">Team & institutional partners</p>
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Media & Visuals */}
          <Card
            onClick={() => setSelectedCategory("media")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedCategory("media")}
            className={cn(
              "cursor-pointer transition-all hover:border-purple-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
              selectedCategory === "media" ? "ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-card border-purple-500/50" : ""
            )}
          >
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Media & Assets</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">{mediaTotal}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate hidden sm:block">Photos, docs & artworks</p>
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                  <Image className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Search & Interactive Filter Bar */}
      <section aria-label="CMS Module Controls" className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box with '/' keyboard shortcut */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules, sections, or tags..."
              aria-label="Search CMS modules"
              className="w-full h-10 pl-9 pr-9 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Clear search query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded pointer-events-none">
                /
              </kbd>
            )}
          </div>

          {/* Quick status summary */}
          <div className="text-xs text-muted-foreground flex items-center justify-between sm:justify-end gap-2 px-1">
            <span>
              Showing <strong className="text-foreground font-semibold">{filteredModules.length}</strong> of {accessibleModules.length} modules
            </span>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
                className="h-7 px-2 text-xs text-primary hover:text-primary/90"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Touch-Scroll on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none snap-x touch-pan-x">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id
            const count = categoryCounts[tab.id] || 0

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 snap-start",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-pressed={isActive}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background/80 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 4. Pinned Quick Access Section (If any pinned modules and no search active) */}
      {!searchQuery && selectedCategory === "all" && pinnedModules.length > 0 && (
        <section aria-label="Pinned Quick Access" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" aria-hidden="true" />
              <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase tracking-wider text-xs">
                Pinned Shortcuts
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">Click ⭐ to customize</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {pinnedModules.map((module) => {
              const Icon = module.icon
              const countVal = module.countKey ? initialCounts[module.countKey] : undefined

              return (
                <Link
                  key={`pinned-${module.id}`}
                  href={module.href}
                  className="group relative flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-border/50", module.bgSoft, module.iconColor)}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {module.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {countVal !== undefined ? `${countVal} ${module.unit}` : module.categoryLabel}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* 5. Main Bento Cards Grid */}
      <section aria-label="CMS Modules Directory">
        {filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border bg-card">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <Search className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No matching modules found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
              We couldn't find any CMS modules matching "{searchQuery}". Try searching with different keywords.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="mt-4 min-h-[38px] text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear search & filter</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredModules.map((module) => {
              const Icon = module.icon
              const isPinned = pinnedIds.includes(module.id)
              const countVal = module.countKey ? initialCounts[module.countKey] : undefined

              return (
                <div
                  key={module.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div>
                    {/* Card Top Row: Icon + Category Badge + Pin Button */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-border/50", module.bgSoft, module.iconColor)}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] py-0 px-2 font-medium shrink-0", module.colorBadge)}>
                          {module.categoryLabel}
                        </Badge>
                      </div>

                      {/* Pin to favorites toggle */}
                      <button
                        type="button"
                        onClick={(e) => togglePin(module.id, e)}
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          isPinned ? "text-amber-500" : "text-muted-foreground/40 hover:text-muted-foreground"
                        )}
                        aria-label={isPinned ? `Unpin ${module.title}` : `Pin ${module.title} to quick access`}
                        title={isPinned ? "Unpin shortcut" : "Pin to quick access"}
                      >
                        <Star className={cn("h-4 w-4", isPinned ? "fill-amber-500" : "")} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Module Title & Live Count */}
                    <div className="space-y-1 mb-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          <Link href={module.href} className="focus-visible:outline-none">
                            {module.title}
                          </Link>
                        </h2>
                        {countVal !== undefined && (
                          <span className="text-xs font-semibold tabular-nums text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded-md">
                            {countVal} {module.unit}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Primary CTA & Optional Direct "+ New" Shortcut */}
                  <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-border/50">
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs font-medium text-primary hover:text-primary/90 gap-1.5 -ml-1">
                      <Link href={module.href}>
                        <span>Manage</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                      </Link>
                    </Button>

                    {module.newHref && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 px-2.5 text-xs font-medium border-border/70 hover:border-primary/40 gap-1"
                      >
                        <Link href={module.newHref}>
                          <Plus className="h-3 w-3" aria-hidden="true" />
                          <span>{module.newLabel || "New"}</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
