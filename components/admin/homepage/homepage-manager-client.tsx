"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { notifications } from "@/lib/notifications"
import { Badge } from "@/components/ui/badge"
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
  Sparkles
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

export default function HomepageManagerClient({
  initialSettings,
  initialHero,
  initialHeroCarousel,
  initialTestimonials,
  initialTimeline,
  initialStory,
  initialWhatWeDo,
  userId
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

  const handleSave = async () => {
    setIsSaving(true)
    
    // Show loading notification
    const loadingToast = notifications.showLoading({
      title: "Saving...",
      description: "Updating homepage settings...",
      duration: 0, // Don't auto-dismiss
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
          userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save settings")
      }

      // Dismiss loading toast
      notifications.dismiss()
      
      // Show success
      notifications.showSuccess({
        title: "✅ Saved successfully",
        description: "Homepage settings have been updated.",
        duration: 4000,
      })
      
      // Reset hasChanges flag
      setHasChanges(false)
    } catch (error) {
      // Dismiss loading toast
      notifications.dismiss()
      
      // Show error
      notifications.showError({
        title: "❌ Save failed",
        description: error instanceof Error ? error.message : "Could not save homepage settings. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

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
      title: "🔄 Changes discarded",
      description: "All unsaved changes have been reset to the last saved state.",
      duration: 3000,
    })
  }

  const updateSettings = <K extends keyof HomepageSettings>(
    key: K,
    value: HomepageSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Homepage Manager</h1>
                <p className="text-sm text-slate-600">
                  Manage all homepage content in one place
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
                  Unsaved changes
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
                className="hidden sm:flex"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/", "_blank")}
              >
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
              >
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="hero-carousel" className="space-y-8">
          {/* Organized Tab Groups */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 bg-transparent h-auto p-0">
              <TabsTrigger value="hero-carousel" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Carousel</span>
              </TabsTrigger>
              <TabsTrigger value="hero" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Hero</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="story" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Our Story</span>
              </TabsTrigger>
              <TabsTrigger value="what-we-do" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">What We Do</span>
              </TabsTrigger>
              <TabsTrigger value="programs" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Programs</span>
              </TabsTrigger>
              <TabsTrigger value="hero-ctas" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Hero CTAs</span>
              </TabsTrigger>
              <TabsTrigger value="cta-cards" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">CTA Cards</span>
              </TabsTrigger>
              <TabsTrigger value="banners" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Banners</span>
              </TabsTrigger>
              <TabsTrigger value="marquee" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Marquee</span>
              </TabsTrigger>
              <TabsTrigger value="trust" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Trust</span>
              </TabsTrigger>
              <TabsTrigger value="stories" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Stories</span>
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Testimonials</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">SEO</span>
              </TabsTrigger>
              <TabsTrigger value="flags" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Flags</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content with better spacing */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <TabsContent value="hero-carousel" className="mt-0">
              <HeroCarouselManager
                heroCarousel={heroCarousel}
                onChange={updateHeroCarousel}
              />
            </TabsContent>

            <TabsContent value="hero" className="mt-0">
              <HeroManager
                hero={hero}
                onChange={updateHero}
              />
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              <StatsManager
                stats={settings.stats}
                onChange={(stats) => updateSettings("stats", stats)}
              />
            </TabsContent>

            <TabsContent value="story" className="mt-0">
              <StoryManager
                story={story}
                onChange={updateStory}
              />
            </TabsContent>

            <TabsContent value="what-we-do" className="mt-0">
              <WhatWeDoManager
                whatWeDo={whatWeDo}
                onChange={updateWhatWeDo}
              />
            </TabsContent>

            <TabsContent value="programs" className="mt-0">
              <ProgramsManager
                programs={settings.programs}
                onChange={(programs) => updateSettings("programs", programs)}
              />
            </TabsContent>

            <TabsContent value="hero-ctas" className="mt-0">
              <HeroCTAsManager
                heroCTAs={settings.heroCTAs}
                onChange={(heroCTAs) => updateSettings("heroCTAs", heroCTAs)}
              />
            </TabsContent>

            <TabsContent value="cta-cards" className="mt-0">
              <CTACardsManager
                ctaCards={settings.ctaCards}
                onChange={(ctaCards) => updateSettings("ctaCards", ctaCards)}
              />
            </TabsContent>

            <TabsContent value="banners" className="mt-0">
              <BannersManager
                banners={settings.banners}
                onChange={(banners) => updateSettings("banners", banners)}
              />
            </TabsContent>

            <TabsContent value="marquee" className="mt-0">
              <MarqueeManager
                marquee={settings.marquee}
                onChange={(marquee) => updateSettings("marquee", marquee)}
              />
            </TabsContent>

            <TabsContent value="trust" className="mt-0">
              <TrustIndicatorsManager
                trustIndicators={settings.trustIndicators}
                onChange={(trustIndicators) => updateSettings("trustIndicators", trustIndicators)}
              />
            </TabsContent>

            <TabsContent value="stories" className="mt-0">
              <FeaturedStoriesManager
                featuredStoriesRules={settings.featuredStoriesRules}
                onChange={(featuredStoriesRules) => updateSettings("featuredStoriesRules", featuredStoriesRules)}
              />
            </TabsContent>

            <TabsContent value="testimonials" className="mt-0">
              <TestimonialsManager
                testimonials={testimonials}
                onChange={updateTestimonials}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <TimelineManager
                timeline={timeline}
                onChange={updateTimeline}
              />
            </TabsContent>

            <TabsContent value="seo" className="mt-0">
              <SEOManager
                seo={settings.seo}
                onChange={(seo) => updateSettings("seo", seo)}
              />
            </TabsContent>

            <TabsContent value="flags" className="mt-0">
              <FlagsManager
                flags={settings.flags}
                onChange={(flags) => updateSettings("flags", flags)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
