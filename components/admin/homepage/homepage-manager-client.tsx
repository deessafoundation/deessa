"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { notifications } from "@/lib/notifications"
import { 
  Save, 
  RotateCcw, 
  Eye, 
  BarChart3, 
  BookOpen, 
  Target, 
  CreditCard, 
  Palette,
  Settings, 
  Shield, 
  Star, 
  Search, 
  Image as ImageIcon, 
  MessageSquare, 
  Clock, 
  Sparkles,
  Layers,
  Award,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Compass,
  ExternalLink,
  ArrowRight,
  Info,
  Users
} from "lucide-react"
import type { HomepageSettings } from "@/lib/types/homepage-settings"
import type { HomeHeroSettings } from "@/lib/data/site-settings"
import type {
  HomepageHeroCarouselSettings,
  HomepageTestimonialsSettings,
  HomepageTimelineSettings,
  HomepageStorySettings,
  HomepageWhatWeDoSettings,
} from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

import StatsManager from "./components/stats-manager"
import StoryManager from "./components/story-manager"
import WhatWeDoManager from "./components/what-we-do-manager"
import ProgramsManager from "./components/programs-manager"
import HeroManager from "./components/hero-manager"
import HeroCarouselManager from "./components/hero-carousel-manager"
import HeroCTAsManager from "./components/hero-ctas-manager"
import CTACardsManager from "./components/cta-cards-manager"
import BannersManager from "./components/banners-manager"
import MarqueeManager from "./components/marquee-manager"
import SEOManager from "./components/seo-manager"
import FlagsManager from "./components/flags-manager"
import TrustIndicatorsManager from "./components/trust-indicators-manager"
import FeaturedStoriesManager from "./components/featured-stories-manager"
import TestimonialsManager from "./components/testimonials-manager"
import TimelineManager from "./components/timeline-manager"

interface HomepageManagerClientProps {
  initialSettings: HomepageSettings
  initialHero: HomeHeroSettings
  initialHeroCarousel: HomepageHeroCarouselSettings
  initialTestimonials: HomepageTestimonialsSettings
  initialTimeline: HomepageTimelineSettings
  initialStory: HomepageStorySettings
  initialWhatWeDo: HomepageWhatWeDoSettings
  userId: string
}

type CategoryId = "live" | "overview" | "secondary"

interface SubTab {
  id: string
  label: string
  shortLabel: string
  icon: typeof ImageIcon
  description: string
  badge?: string | number
}

interface CategoryConfig {
  id: CategoryId
  label: string
  icon: typeof Layers
  description: string
  tabs: SubTab[]
}

export default function HomepageManagerClient({
  initialSettings,
  initialHero,
  initialHeroCarousel,
  initialTestimonials,
  initialTimeline,
  initialStory,
  initialWhatWeDo,
  userId,
}: HomepageManagerClientProps) {
  const [settings, setSettings] = useState<HomepageSettings>(initialSettings)
  const [hero, setHero] = useState<HomeHeroSettings>(initialHero)
  const [heroCarousel, setHeroCarousel] = useState<HomepageHeroCarouselSettings>(initialHeroCarousel)
  const [testimonials, setTestimonials] = useState<HomepageTestimonialsSettings>(initialTestimonials)
  const [timeline, setTimeline] = useState<HomepageTimelineSettings>(initialTimeline)
  const [story, setStory] = useState<HomepageStorySettings>(initialStory)
  const [whatWeDo, setWhatWeDo] = useState<HomepageWhatWeDoSettings>(initialWhatWeDo)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Navigation state: Category + Active Tab
  const [activeCategory, setActiveCategory] = useState<CategoryId>("live")
  const [activeTab, setActiveTab] = useState<string>("hero-carousel")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Navigation taxonomy with real-time badges
  const categories: CategoryConfig[] = useMemo(
    () => [
      {
        id: "live",
        label: "Live Homepage Content",
        icon: Sparkles,
        description: "Core sections currently rendered live on the public homepage & search engines",
        tabs: [
          {
            id: "hero-carousel",
            label: "Hero Carousel",
            shortLabel: "Carousel",
            icon: ImageIcon,
            description: "High-impact visual banner slides with dual-device responsive image support",
            badge: heroCarousel.slides?.length ? `${heroCarousel.slides.length} slides` : undefined,
          },
          {
            id: "story",
            label: "Our Story",
            shortLabel: "Our Story",
            icon: BookOpen,
            description: "Founding journey of twin daughters Deetya & Marissa that started deessa Foundation",
            badge: story.paragraphs?.length ? `${story.paragraphs.length} paras` : undefined,
          },
          {
            id: "what-we-do",
            label: "What We Do (4 Pillars)",
            shortLabel: "Pillars",
            icon: Target,
            description: "Four impact pillars: Awareness & Engagement, Training, Resources, and Advocacy",
            badge: whatWeDo.pillars?.length ? `${whatWeDo.pillars.length} pillars` : undefined,
          },
          {
            id: "testimonials",
            label: "Global Voices (Testimonials)",
            shortLabel: "Testimonials",
            icon: MessageSquare,
            description: "Video testimonials and reflections on inclusion and acceptance",
            badge: testimonials.testimonials?.length ? `${testimonials.testimonials.length} quotes` : undefined,
          },
          {
            id: "seo",
            label: "Google Search & SEO",
            shortLabel: "Google & SEO",
            icon: Search,
            description: "Meta title, Google SERP snippet description, keywords, and OpenGraph social preview",
            badge: "Live SERP",
          },
        ],
      },
      {
        id: "overview",
        label: "Sections Map & Guide",
        icon: Compass,
        description: "Visual roadmap of all 10 live homepage sections and quick links to connected managers",
        tabs: [
          {
            id: "overview",
            label: "All 10 Homepage Sections",
            shortLabel: "Sections Map",
            icon: Layers,
            description: "Interactive directory of every live homepage section and where its content is managed",
            badge: "10 Sections",
          },
        ],
      },
      {
        id: "secondary",
        label: "Impact Page & Secondary Content",
        icon: Settings,
        description: "Settings for /impact page (Stats, Programs) and legacy homepage archive modules",
        tabs: [
          {
            id: "stats",
            label: "Impact Stats (Used on /impact)",
            shortLabel: "Impact Stats",
            icon: BarChart3,
            description: "Numerical metrics displaying lives touched and communities served on /impact",
            badge: settings.stats?.stats?.length ? `${settings.stats.stats.length} stats` : undefined,
          },
          {
            id: "programs",
            label: "Core Programs (Used on /impact)",
            shortLabel: "Impact Programs",
            icon: Layers,
            description: "Featured program highlight blocks displayed on the /impact page",
            badge: settings.programs?.programs?.length ? `${settings.programs.programs.length}` : undefined,
          },
          {
            id: "timeline",
            label: "Milestone Timeline",
            shortLabel: "Timeline",
            icon: Clock,
            description: "Historical chronology of growth and field milestones",
            badge: timeline.milestones?.length ? `${timeline.milestones.length}` : undefined,
          },
          {
            id: "marquee",
            label: "Partner Marquee (Legacy)",
            shortLabel: "Marquee",
            icon: SlidersHorizontal,
            description: "Legacy partner logo strip (public homepage now uses dynamic Partners table)",
            badge: "Legacy",
          },
          {
            id: "hero",
            label: "Classic Hero Text (Legacy)",
            shortLabel: "Classic Hero",
            icon: Sparkles,
            description: "Static headline text replaced by the interactive Carousel",
            badge: "Legacy",
          },
          {
            id: "hero-ctas",
            label: "Hero Action Buttons (Legacy)",
            shortLabel: "Hero CTAs",
            icon: Target,
            description: "Overlay action buttons replaced by Carousel slide buttons",
            badge: "Legacy",
          },
          {
            id: "cta-cards",
            label: "Get Involved Cards (Legacy)",
            shortLabel: "CTA Cards",
            icon: CreditCard,
            description: "Action pathway cards (Volunteer, Partner, Donate)",
            badge: "Legacy",
          },
          {
            id: "banners",
            label: "Quote Banners (Legacy)",
            shortLabel: "Banners",
            icon: Palette,
            description: "Brush-stroke statement blocks across early homepage designs",
            badge: "Legacy",
          },
          {
            id: "trust",
            label: "Trust Badges (Legacy)",
            shortLabel: "Trust",
            icon: Shield,
            description: "Verification seals, legal registration, and transparency signals",
            badge: "Legacy",
          },
          {
            id: "stories",
            label: "Featured Stories (Legacy)",
            shortLabel: "Stories",
            icon: Star,
            description: "Editorial rules for highlighting changemaker stories",
            badge: "Legacy",
          },
          {
            id: "flags",
            label: "Feature Flags (Legacy)",
            shortLabel: "Flags",
            icon: Settings,
            description: "Granular toggles from earlier experimental homepage modules",
            badge: "Legacy",
          },
        ],
      },
    ],
    [heroCarousel, settings, story, whatWeDo, timeline, testimonials]
  )

  // Quick lookup of tab -> category
  const tabToCategoryMap = useMemo(() => {
    const map: Record<string, CategoryId> = {}
    categories.forEach((cat) => {
      cat.tabs.forEach((t) => {
        map[t.id] = cat.id
      })
    })
    return map
  }, [categories])

  const selectTab = useCallback((tabId: string) => {
    const catId = tabToCategoryMap[tabId]
    if (catId) {
      setActiveCategory(catId)
    }
    setActiveTab(tabId)
  }, [tabToCategoryMap])

  const selectCategory = (catId: CategoryId) => {
    setActiveCategory(catId)
    const targetCat = categories.find((c) => c.id === catId)
    if (targetCat && targetCat.tabs.length > 0) {
      // If current active tab is already in this category, keep it; else choose the first tab
      const isAlreadyInCategory = targetCat.tabs.some((t) => t.id === activeTab)
      if (!isAlreadyInCategory) {
        setActiveTab(targetCat.tabs[0].id)
      }
    }
  }

  // Filtered tabs for instant search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return categories
      .flatMap((c) => c.tabs.map((t) => ({ ...t, categoryLabel: c.label })))
      .filter((t) => t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }, [categories, searchQuery])

  // Save handler
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const loadingToast = notifications.showLoading({
      title: "Saving...",
      description: "Writing changes to foundation database...",
      duration: 0,
    })

    try {
      const response = await fetch("/api/admin/homepage-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          hero,
          heroCarousel,
          testimonials,
          timeline,
          story,
          whatWeDo,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save settings")
      }

      notifications.dismiss(loadingToast)
      notifications.showSuccess({
        title: "Saved successfully",
        description: "Homepage content has been updated and caches revalidated.",
        duration: 4000,
      })

      setHasChanges(false)
    } catch (error) {
      notifications.dismiss(loadingToast)
      notifications.showError({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save homepage settings. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }, [settings, hero, heroCarousel, testimonials, timeline, story, whatWeDo, userId])

  // Reset handler
  const handleReset = () => {
    setSettings(initialSettings)
    setHero(initialHero)
    setHeroCarousel(initialHeroCarousel)
    setTestimonials(initialTestimonials)
    setTimeline(initialTimeline)
    setStory(initialStory)
    setWhatWeDo(initialWhatWeDo)
    setHasChanges(false)

    notifications.showInfo({
      title: "Changes discarded",
      description: "All unsaved modifications have been reset to current database state.",
      duration: 3000,
    })
  }

  // Keyboard shortcut: Ctrl+S / Cmd+S to save
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
  }, [hasChanges, isSaving, handleSave])

  // Prompt on browser close when unsaved changes exist
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

  // Updaters
  const updateSettings = <K extends keyof HomepageSettings>(key: K, value: HomepageSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateHero = (newHero: HomeHeroSettings) => {
    setHero(newHero)
    setHasChanges(true)
  }

  const updateHeroCarousel = (newHeroCarousel: HomepageHeroCarouselSettings) => {
    setHeroCarousel(newHeroCarousel)
    setHasChanges(true)
  }

  const updateTestimonials = (newTestimonials: HomepageTestimonialsSettings) => {
    setTestimonials(newTestimonials)
    setHasChanges(true)
  }

  const updateTimeline = (newTimeline: HomepageTimelineSettings) => {
    setTimeline(newTimeline)
    setHasChanges(true)
  }

  const updateStory = (newStory: HomepageStorySettings) => {
    setStory(newStory)
    setHasChanges(true)
  }

  const updateWhatWeDo = (newWhatWeDo: HomepageWhatWeDoSettings) => {
    setWhatWeDo(newWhatWeDo)
    setHasChanges(true)
  }

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0]
  const currentTab = categories.flatMap((c) => c.tabs).find((t) => t.id === activeTab) || currentCategory.tabs[0]

  return (
    <div className="space-y-6">
      {/* ─── Sticky Action Header (Docked smoothly under AdminHeader with top-16) ─── */}
      <div className="sticky top-16 z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3.5 bg-background/90 backdrop-blur-md border-b border-border/80 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Title & Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg lg:text-xl font-bold tracking-tight text-foreground">
                  Homepage CMS Manager
                </h1>
                {hasChanges ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50 flex items-center gap-1.5 py-0.5 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved edits
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-border text-[11px] py-0 px-2 font-normal hidden sm:inline-flex">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                    In sync
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Edit and preview public homepage sections • Changes publish instantly upon saving
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {hasChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                title="Discard unsaved changes"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/", "_blank")}
              className="h-9 px-3 text-xs"
              title="Open public website in new tab"
            >
              <Eye className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Live Preview</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="h-9 px-4 text-xs font-medium shadow-sm transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              <kbd className="hidden lg:inline-block ml-2 text-[10px] font-mono opacity-60 bg-primary-foreground/20 px-1 py-0.2 rounded">
                ⌘S
              </kbd>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Search / Filter Bar (Quick Navigation) ─── */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search any homepage section (e.g. 'Carousel', 'Stats', 'SEO', 'Pillars')..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted"
            >
              Clear
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {searchQuery.trim() !== "" && (
          <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-card rounded-xl border shadow-lg z-40 max-h-72 overflow-y-auto space-y-1">
            {searchResults.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 text-center">
                No sections matched &ldquo;{searchQuery}&rdquo;.
              </p>
            ) : (
              searchResults.map((result) => {
                const ResultIcon = result.icon
                return (
                  <button
                    key={result.id}
                    onClick={() => {
                      selectTab(result.id)
                      setSearchQuery("")
                    }}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-muted text-primary">
                        <ResultIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{result.label}</p>
                        <p className="text-xs text-muted-foreground">{result.description}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {result.categoryLabel}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* ─── OPTION A: Categorized Segmented Navigation ─── */}
      <div className="space-y-3">
        {/* Tier 1: Category Selector (Responsive: Scrollable on mobile, flex on desktop) */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 border border-border/60 rounded-2xl overflow-x-auto scrollbar-none touch-pan-x">
          {categories.map((cat) => {
            const CatIcon = cat.icon
            const isCatActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all outline-none",
                  isCatActive
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                )}
              >
                <CatIcon className={cn("w-4 h-4 shrink-0", isCatActive ? "text-primary" : "text-muted-foreground")} />
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "text-[10px] tabular-nums rounded-full px-1.5 py-0.2",
                    isCatActive ? "bg-primary/10 text-primary font-bold" : "bg-muted text-muted-foreground"
                  )}
                >
                  {cat.tabs.length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tier 2: Sub-Tab Pills within the active Category */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 touch-pan-x">
          {currentCategory.tabs.map((tab) => {
            const TabIcon = tab.icon
            const isTabActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0",
                  isTabActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border/80 hover:text-foreground hover:border-border hover:bg-muted/50"
                )}
              >
                <TabIcon className={cn("w-3.5 h-3.5 shrink-0", isTabActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={cn(
                      "text-[10px] rounded-full px-1.5 py-0.2 tabular-nums",
                      isTabActive
                        ? "bg-primary-foreground/20 text-primary-foreground font-semibold"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Active Section Description Bar ─── */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{currentTab.label}</span>
          <span>•</span>
          <span>{currentTab.description}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px]">
          <span>Section {currentCategory.tabs.findIndex((t) => t.id === activeTab) + 1} of {currentCategory.tabs.length}</span>
        </div>
      </div>

      {/* ─── Main Content Canvas ─── */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-sm p-4 sm:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* HOMEPAGE SECTIONS ROADMAP */}
          <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
            <HomepageSectionsHub onSelectTab={selectTab} />
          </TabsContent>

          {/* HERO & SHOWCASE */}
          <TabsContent value="hero-carousel" className="mt-0 focus-visible:outline-none">
            <HeroCarouselManager heroCarousel={heroCarousel} onChange={updateHeroCarousel} />
          </TabsContent>

          <TabsContent value="hero" className="mt-0 focus-visible:outline-none">
            <HeroManager hero={hero} onChange={updateHero} />
          </TabsContent>

          <TabsContent value="hero-ctas" className="mt-0 focus-visible:outline-none">
            <HeroCTAsManager
              heroCTAs={settings.heroCTAs || { ctas: [] }}
              onChange={(heroCTAs) => updateSettings("heroCTAs", heroCTAs)}
            />
          </TabsContent>

          <TabsContent value="marquee" className="mt-0 focus-visible:outline-none">
            <MarqueeManager
              marquee={settings.marquee}
              onChange={(marquee) => updateSettings("marquee", marquee)}
            />
          </TabsContent>

          {/* CORE FOUNDATION */}
          <TabsContent value="story" className="mt-0 focus-visible:outline-none">
            <StoryManager story={story} onChange={updateStory} />
          </TabsContent>

          <TabsContent value="what-we-do" className="mt-0 focus-visible:outline-none">
            <WhatWeDoManager whatWeDo={whatWeDo} onChange={updateWhatWeDo} />
          </TabsContent>

          <TabsContent value="programs" className="mt-0 focus-visible:outline-none">
            <ProgramsManager
              programs={settings.programs}
              onChange={(programs) => updateSettings("programs", programs)}
            />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
            <TimelineManager timeline={timeline} onChange={updateTimeline} />
          </TabsContent>

          {/* SOCIAL PROOF */}
          <TabsContent value="stats" className="mt-0 focus-visible:outline-none">
            <StatsManager
              stats={settings.stats}
              onChange={(stats) => updateSettings("stats", stats)}
            />
          </TabsContent>

          <TabsContent value="testimonials" className="mt-0 focus-visible:outline-none">
            <TestimonialsManager testimonials={testimonials} onChange={updateTestimonials} />
          </TabsContent>

          <TabsContent value="stories" className="mt-0 focus-visible:outline-none">
            <FeaturedStoriesManager
              featuredStoriesRules={settings.featuredStoriesRules}
              onChange={(featuredStoriesRules) => updateSettings("featuredStoriesRules", featuredStoriesRules)}
            />
          </TabsContent>

          <TabsContent value="trust" className="mt-0 focus-visible:outline-none">
            <TrustIndicatorsManager
              trustIndicators={settings.trustIndicators}
              onChange={(trustIndicators) => updateSettings("trustIndicators", trustIndicators)}
            />
          </TabsContent>

          {/* ENGAGEMENT & GLOBAL */}
          <TabsContent value="cta-cards" className="mt-0 focus-visible:outline-none">
            <CTACardsManager
              ctaCards={settings.ctaCards}
              onChange={(ctaCards) => updateSettings("ctaCards", ctaCards)}
            />
          </TabsContent>

          <TabsContent value="banners" className="mt-0 focus-visible:outline-none">
            <BannersManager
              banners={settings.banners}
              onChange={(banners) => updateSettings("banners", banners)}
            />
          </TabsContent>

          <TabsContent value="seo" className="mt-0 focus-visible:outline-none">
            <SEOManager seo={settings.seo} onChange={(seo) => updateSettings("seo", seo)} />
          </TabsContent>

          <TabsContent value="flags" className="mt-0 focus-visible:outline-none">
            <FlagsManager flags={settings.flags} onChange={(flags) => updateSettings("flags", flags)} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Mobile Floating Save Bar (Shown only when changes exist on mobile) ─── */}
      {hasChanges && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden z-50 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-medium text-foreground">Unsaved modifications</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="h-8 px-2.5 text-xs"
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 px-3 text-xs font-semibold shadow-md"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface HomepageSectionsHubProps {
  onSelectTab: (tabId: string) => void
}

function HomepageSectionsHub({ onSelectTab }: HomepageSectionsHubProps) {
  const sections = [
    {
      num: "01",
      title: "Hero Banner Carousel",
      location: "Top of Page",
      status: "Managed in this CMS",
      statusColor: "emerald" as const,
      description: "Full-width rotating banners with dual-device responsive images, autism inclusion headlines, and call-to-action buttons.",
      actionLabel: "Edit Carousel Slides",
      tabId: "hero-carousel",
      icon: ImageIcon,
    },
    {
      num: "02",
      title: "Institutional Partners Strip",
      location: "Below Hero",
      status: "Managed in Partners DB",
      statusColor: "blue" as const,
      description: "Auto-scrolling logo strip of partner organizations, inclusive schools, and community health allies.",
      actionLabel: "Open Partners Manager",
      href: "/admin/partners",
      icon: Users,
    },
    {
      num: "03",
      title: "Our Story: How deessa Started",
      location: "Section 3",
      status: "Managed in this CMS",
      statusColor: "emerald" as const,
      description: "The founding origin narrative of twin daughters born with clubfoot and autism, inspiring the creation of deessa Foundation.",
      actionLabel: "Edit Our Story",
      tabId: "story",
      icon: BookOpen,
    },
    {
      num: "04",
      title: "Mission, Vision & Objectives",
      location: "Section 4",
      status: "Core Foundation Charter",
      statusColor: "purple" as const,
      description: "Permanent foundation statements: acceptance for all, embracing neurodiversity, fundamental rights, and community empowerment.",
      actionLabel: "Foundation Charter",
      icon: Target,
    },
    {
      num: "05",
      title: "What We Do: 4 Impact Pillars",
      location: "Section 5",
      status: "Managed in this CMS",
      statusColor: "emerald" as const,
      description: "The four operational pillars: Awareness & Community Engagement, Training, Accessible Resources, and Policy Advocacy.",
      actionLabel: "Edit Impact Pillars",
      tabId: "what-we-do",
      icon: Target,
    },
    {
      num: "06",
      title: "Autism Art Showcase Feature",
      location: "Section 6",
      status: "Managed in Artworks CMS",
      statusColor: "blue" as const,
      description: "Curated gallery highlight of creative expressions made by autistic children and youth.",
      actionLabel: "Open Artworks Manager",
      href: "/admin/artworks",
      icon: Palette,
    },
    {
      num: "07",
      title: "Living With Autism Podcast Studio",
      location: "Section 7",
      status: "Podcast Media",
      statusColor: "amber" as const,
      description: "Podcast series hosted by Sarita & Merina, exploring real lived experiences, diagnosis stories, and neurodivergent voices.",
      actionLabel: "Open Site Settings",
      href: "/admin/settings",
      icon: Sparkles,
    },
    {
      num: "08",
      title: "Global Voices (Video Testimonials)",
      location: "Section 8",
      status: "Managed in this CMS",
      statusColor: "emerald" as const,
      description: "Video testimonials and reflections from educators, international advocates (Soyun Kim, Chris Liu, Blair Chen, Marcus Brand), and parents.",
      actionLabel: "Edit Testimonials",
      tabId: "testimonials",
      icon: MessageSquare,
    },
    {
      num: "09",
      title: "Community Social Feed",
      location: "Section 9",
      status: "Managed in Facebook Feed CMS",
      statusColor: "blue" as const,
      description: "Real-time curated feed of Facebook posts, awareness events, workshops, and family gatherings.",
      actionLabel: "Curate Community Posts",
      href: "/admin/facebook-posts",
      icon: Award,
    },
    {
      num: "10",
      title: "Contact & Headquarters Office",
      location: "Section 10",
      status: "Managed in Settings",
      statusColor: "slate" as const,
      description: "Kathmandu office contact details, phone number (+977-9841026085), official inquiry email, and visit information.",
      actionLabel: "Edit Organization Info",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      num: "SEO",
      title: "Google Search SERP & Social Sharing",
      location: "Meta Tags / SEO",
      status: "Managed in this CMS",
      statusColor: "emerald" as const,
      description: "Directly controls what Google displays in search results (title, snippet description) and Facebook/Twitter OpenGraph cards.",
      actionLabel: "Edit Google Search Snippet",
      tabId: "seo",
      icon: Search,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Homepage Layout Architecture & Management Hub
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The public homepage at <span className="font-semibold text-foreground">deessafoundation.com</span> is composed of 10 modular sections plus Google Search metadata.
              Sections labeled <span className="font-semibold text-emerald-600 dark:text-emerald-400">Managed in this CMS</span> can be edited right here.
              For sections connected to other databases (Partners, Artworks, Community Posts), use the 1-click links below.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <div
              key={section.num}
              className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                      {section.num}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {section.location}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0 px-2 font-medium",
                      section.statusColor === "emerald" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
                      section.statusColor === "blue" && "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800",
                      section.statusColor === "purple" && "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800",
                      section.statusColor === "amber" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800",
                      section.statusColor === "slate" && "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {section.status}
                  </Badge>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted text-primary shrink-0 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {section.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-border/60">
                {section.tabId ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectTab(section.tabId!)}
                    className="w-full text-xs h-8 flex items-center justify-between"
                  >
                    <span>{section.actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                  </Button>
                ) : section.href ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full text-xs h-8 flex items-center justify-between"
                  >
                    <Link href={section.href}>
                      <span>{section.actionLabel}</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                    </Link>
                  </Button>
                ) : (
                  <div className="text-[11px] text-muted-foreground text-center py-1">
                    Charter statement is maintained in source code
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
