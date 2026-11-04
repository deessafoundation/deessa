"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  AlertCircle
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

type CategoryId = "showcase" | "content" | "social" | "engagement"

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
  const [activeCategory, setActiveCategory] = useState<CategoryId>("showcase")
  const [activeTab, setActiveTab] = useState<string>("hero-carousel")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Navigation taxonomy with real-time badges
  const categories: CategoryConfig[] = useMemo(
    () => [
      {
        id: "showcase",
        label: "Hero & Showcase",
        icon: Sparkles,
        description: "Homepage hero carousel, banner media, and initial CTA entry points",
        tabs: [
          {
            id: "hero-carousel",
            label: "Hero Carousel",
            shortLabel: "Carousel",
            icon: ImageIcon,
            description: "High-impact visual slides with dual-device image support",
            badge: heroCarousel.slides?.length ? `${heroCarousel.slides.length} slides` : undefined,
          },
          {
            id: "hero",
            label: "Classic Hero",
            shortLabel: "Hero Text",
            icon: Sparkles,
            description: "Title, subtitle, and badge headline configuration",
          },
          {
            id: "hero-ctas",
            label: "Hero Action Buttons",
            shortLabel: "Hero CTAs",
            icon: Target,
            description: "Direct action buttons overlaid on the hero banner",
            badge: settings.heroCTAs?.ctas?.length ? `${settings.heroCTAs.ctas.length}` : undefined,
          },
          {
            id: "marquee",
            label: "Partner Marquee",
            shortLabel: "Marquee",
            icon: SlidersHorizontal,
            description: "Auto-scrolling institutional alliance logo strip",
            badge: settings.marquee?.enabled ? "Active" : "Off",
          },
        ],
      },
      {
        id: "content",
        label: "Core Foundation",
        icon: BookOpen,
        description: "Foundational narrative, operational pillars, core programs, and milestones",
        tabs: [
          {
            id: "story",
            label: "Our Story",
            shortLabel: "Our Story",
            icon: BookOpen,
            description: "Narrative on how deessa Foundation started",
            badge: story.paragraphs?.length ? `${story.paragraphs.length} paragraphs` : undefined,
          },
          {
            id: "what-we-do",
            label: "What We Do",
            shortLabel: "Pillars",
            icon: Target,
            description: "Four core impact pillars with stats and themes",
            badge: whatWeDo.pillars?.length ? `${whatWeDo.pillars.length} pillars` : undefined,
          },
          {
            id: "programs",
            label: "Core Programs",
            shortLabel: "Programs",
            icon: Layers,
            description: "Featured program highlights with key metric bullets",
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
        ],
      },
      {
        id: "social",
        label: "Social Proof",
        icon: Award,
        description: "Impact metrics, beneficiary quotes, community stories, and credibility badges",
        tabs: [
          {
            id: "stats",
            label: "Impact Stats",
            shortLabel: "Stats",
            icon: BarChart3,
            description: "Numerical metrics displaying lives touched and communities served",
            badge: settings.stats?.stats?.length ? `${settings.stats.stats.length} stats` : undefined,
          },
          {
            id: "testimonials",
            label: "Testimonials",
            shortLabel: "Quotes",
            icon: MessageSquare,
            description: "Voices from partners, educators, and beneficiary families",
            badge: testimonials.testimonials?.length ? `${testimonials.testimonials.length}` : undefined,
          },
          {
            id: "stories",
            label: "Featured Stories",
            shortLabel: "Stories",
            icon: Star,
            description: "Editorial rules for highlighting changemaker stories",
            badge: settings.featuredStoriesRules?.mode === "manual" ? "Manual" : "Auto",
          },
          {
            id: "trust",
            label: "Trust Badges",
            shortLabel: "Trust",
            icon: Shield,
            description: "Verification seals, legal registration, and transparency signals",
            badge: settings.trustIndicators?.indicators?.length ? `${settings.trustIndicators.indicators.length}` : undefined,
          },
        ],
      },
      {
        id: "engagement",
        label: "Engagement & Global",
        icon: Settings,
        description: "Conversion cards, quote banners, search metadata, and runtime switches",
        tabs: [
          {
            id: "cta-cards",
            label: "Get Involved Cards",
            shortLabel: "CTA Cards",
            icon: CreditCard,
            description: "Action pathway cards (Volunteer, Partner, Donate)",
            badge: settings.ctaCards?.cards?.length ? `${settings.ctaCards.cards.length}` : undefined,
          },
          {
            id: "banners",
            label: "Quote Banners",
            shortLabel: "Banners",
            icon: Palette,
            description: "Brush-stroke statement blocks across the homepage",
            badge: settings.banners?.banners?.length ? `${settings.banners.banners.length}` : undefined,
          },
          {
            id: "seo",
            label: "SEO Metadata",
            shortLabel: "SEO",
            icon: Search,
            description: "Page titles, descriptions, and OpenGraph social tags",
          },
          {
            id: "flags",
            label: "Feature Flags",
            shortLabel: "Flags",
            icon: Settings,
            description: "Granular toggles to enable or hide homepage modules",
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
