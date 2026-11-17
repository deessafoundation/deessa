"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  Palette,
  Building2,
  CreditCard,
  Sliders,
  Type,
  Accessibility,
  Video,
  ExternalLink,
  Home,
  ImageIcon,
  Search,
} from "lucide-react"
import { GeneralSection } from "./sections/general-section"
import { BrandingSection } from "./sections/branding-section"
import { OrganizationSection } from "./sections/organization-section"
import { PaymentsSection } from "./sections/payments-section"
import { FeaturesSection } from "./sections/features-section"
import { TypographyManager } from "./typography-manager"
import { AccessibilitySettingsManager } from "./accessibility-settings-manager"
import { IntroVideoManager } from "./intro-video-manager"
import { PhotoWallSection, type PhotoWallPanel } from "./sections/photo-wall-section"
import type { PaymentSettings, PaymentProvider } from "@/lib/payments/config"
import type { IntroVideoConfig } from "@/lib/types/intro-video"
import type { AccessibilityConfig } from "@/lib/types/accessibility-settings"
import type { TypographyConfig } from "@/lib/typography/types"
import { SITE_UI_FLAGS_KEY, type SiteUiFlags } from "@/lib/site-status/types"

interface SettingsHubProps {
  siteSettings: Record<string, Record<string, unknown>>
  paymentSettings: PaymentSettings
  envConfigured: Record<PaymentProvider, boolean>
  organizationDetails: Record<string, unknown> | null
  introVideoConfig?: IntroVideoConfig
  accessibilityConfig?: AccessibilityConfig
  typographyConfig?: TypographyConfig
  supportEnabled?: boolean
}

interface SettingsTab {
  id: string
  label: string
  description: string
  icon: React.ElementType
}

const SETTINGS_TABS: SettingsTab[] = [
  {
    id: "general",
    label: "General & Identity",
    description: "Site title, mission tagline, contact emails, phone, HQ address & social profiles",
    icon: Globe,
  },
  {
    id: "branding",
    label: "Brand & Assets",
    description: "Light and dark logos, favicon tab preview & 1200×630 OpenGraph social share card",
    icon: Palette,
  },
  {
    id: "organization",
    label: "Organization & Legal",
    description: "PAN/VAT, SWC ID, computerized donation receipt engine, digital signatory & official seal",
    icon: Building2,
  },
  {
    id: "payments",
    label: "Payments & Currencies",
    description: "Stripe, Khalti, and eSewa gateway rails, live API credential health & currency defaults",
    icon: CreditCard,
  },
  {
    id: "features",
    label: "Feature Flags",
    description: "Live visibility switches for Stories, Support portal, Dev popup, and Navbar Beta tag",
    icon: Sliders,
  },
  {
    id: "typography",
    label: "Typography & Fonts",
    description: "Global font theme pairings, weight scales & custom real-time phrase preview",
    icon: Type,
  },
  {
    id: "accessibility",
    label: "Accessibility Defaults",
    description: "Assistive screen reader player, contrast themes, dyslexia font & motion defaults",
    icon: Accessibility,
  },
  {
    id: "intro-video",
    label: "Intro Video",
    description: "Homepage greeting video popup, YouTube/Vimeo streams & cross-device simulator",
    icon: Video,
  },
  {
    id: "photo-wall",
    label: "Impact Photo Wall",
    description: "9-slot curated portrait photo wall rendered on /impact with focal alignment",
    icon: ImageIcon,
  },
]

export function SettingsHub({
  siteSettings,
  paymentSettings,
  envConfigured,
  organizationDetails,
  introVideoConfig,
  accessibilityConfig,
  typographyConfig,
  supportEnabled = true,
}: SettingsHubProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawParam = (searchParams.get("tab") || searchParams.get("section") || "general").toLowerCase()
  const normalizedSection = rawParam === "intro" ? "intro-video" : rawParam === "site" ? "general" : rawParam
  const activeTabId = SETTINGS_TABS.some((t) => t.id === normalizedSection) ? normalizedSection : "general"

  const handleSelectTab = (id: string) => {
    router.push(`/admin/settings?tab=${id}`, { scroll: false })
  }

  const activeTab = SETTINGS_TABS.find((t) => t.id === activeTabId) || SETTINGS_TABS[0]

  return (
    <div className="space-y-6">
      {/* Top Header Card with Section Summary & Content Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-gradient-to-r from-muted/40 via-muted/20 to-transparent">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Site Configuration
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-medium text-foreground">{activeTab.label}</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl">
            {activeTab.description}
          </p>
        </div>

        {/* Quick Jump to Dedicated Content Managers */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <span className="text-[11px] text-muted-foreground font-medium mr-1 hidden lg:inline">
            Content Managers:
          </span>
          <Link
            href="/admin/homepage"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-background hover:bg-muted text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5 text-blue-600" />
            <span>Homepage CMS</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </Link>
          <Link
            href="/admin/media"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-background hover:bg-muted text-foreground transition-colors"
          >
            <ImageIcon className="h-3.5 w-3.5 text-purple-600" />
            <span>Media Library</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </Link>
          <Link
            href="/admin/seo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-background hover:bg-muted text-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-emerald-600" />
            <span>SEO Center</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </Link>
        </div>
      </div>

      {/* Consistent Admin Tabs List (Matching Admin Dashboard & Module Pages) */}
      <Tabs value={activeTabId} onValueChange={handleSelectTab} className="space-y-6 w-full min-w-0">
        <div className="w-full max-w-full overflow-x-auto pb-1 scrollbar-none touch-pan-x border-b border-border/40">
          <TabsList
            aria-label="Site settings sections"
            className="h-auto bg-transparent border-0 p-0 gap-1.5 sm:gap-2 inline-flex w-auto justify-start min-w-full sm:min-w-0 pb-1.5"
          >
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="group relative flex items-center gap-2 py-2 px-3.5 sm:px-4 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap min-h-[38px] transition-all duration-200 border border-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-primary/30 data-[state=active]:font-semibold dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground overflow-hidden"
                >
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="font-semibold transition-all">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Tab Contents: Single Layer, Full Width */}
        <TabsContent value="general" className="space-y-6 focus-visible:outline-none w-full min-w-0 mt-6">
          <GeneralSection
            initialGeneral={(siteSettings.general || {}) as Record<string, string>}
            initialContact={(siteSettings.contact || {}) as Record<string, string>}
            initialSocial={(siteSettings.social || {}) as Record<string, string>}
          />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6 focus-visible:outline-none w-full min-w-0 mt-6">
          <BrandingSection
            initialBranding={(siteSettings.branding || {}) as Record<string, string>}
            siteName={(siteSettings.general?.siteName as string) || "deessa Foundation"}
            siteDescription={(siteSettings.general?.description as string) || ""}
          />
        </TabsContent>

        <TabsContent value="organization" className="space-y-6 focus-visible:outline-none w-full min-w-0 mt-6">
          <OrganizationSection initialData={organizationDetails} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6 focus-visible:outline-none w-full min-w-0 mt-6">
          <PaymentsSection settings={paymentSettings} envConfigured={envConfigured} />
        </TabsContent>

        <TabsContent value="features" className="space-y-6 focus-visible:outline-none w-full min-w-0 mt-6">
          <FeaturesSection
            initialFlags={
              siteSettings[SITE_UI_FLAGS_KEY]
                ? (siteSettings[SITE_UI_FLAGS_KEY] as Partial<SiteUiFlags>)
                : undefined
            }
            initialSupportEnabled={supportEnabled}
          />
        </TabsContent>

        <TabsContent value="typography" className="space-y-6 focus-visible:outline-none w-full min-w-0 mt-6">
          <TypographyManager initialConfig={typographyConfig} />
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6 focus-visible:outline-none w-full min-w-0 mt-6">
          <AccessibilitySettingsManager initialConfig={accessibilityConfig} />
        </TabsContent>

        <TabsContent value="intro-video" className="space-y-6 focus-visible:outline-none w-full min-w-0 mt-6">
          <IntroVideoManager initialConfig={introVideoConfig} />
        </TabsContent>

        <TabsContent value="photo-wall" className="space-y-6 focus-visible:outline-none w-full min-w-0 mt-6">
          <PhotoWallSection
            initialPanels={
              siteSettings.photo_wall_images as unknown as PhotoWallPanel[]
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
