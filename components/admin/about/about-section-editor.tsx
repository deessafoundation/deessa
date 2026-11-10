"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FancySelect } from "@/components/ui/fancy-select"
import { FileUpload } from "@/components/admin/media/file-upload"
import type { AboutPageSettings } from "@/lib/types/about-settings"
import { ABOUT_CATEGORY_ICONS, ABOUT_CATEGORY_TONES, ABOUT_FLOW_ICONS, ABOUT_FLOW_TONES } from "@/lib/types/about-sections"
import { ContentField, ImageField, ColorField, TextListEditor, aboutFieldId } from "./content-fields"
import { ChevronDown, ExternalLink, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type AboutSection = "hero" | "intro" | "howWeDoIt" | "governance" | "people" | "partnerSection" | "getInvolved" | "pageSettings"

const sectionNames: Record<AboutSection, string> = {
  hero: "Hero Section", 
  intro: "Who We Are", 
  howWeDoIt: "How We Do It", 
  governance: "Governance",
  people: "Our People", 
  partnerSection: "Partner Categories", 
  getInvolved: "Get Involved", 
  pageSettings: "Page Settings & SEO",
}

function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string
  description?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border bg-card/60 transition-all overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/30 transition-colors"
        aria-expanded={open}
      >
        <div className="space-y-0.5">
          <p className="text-base font-semibold text-foreground">{title}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-4 border-t p-4 sm:p-5 bg-background/50">{children}</div>}
    </div>
  )
}

export function AboutSectionEditor({ section, settings, onUpdate, errors, focusPath, onUploadBusy, onUploadError }: {
  section: AboutSection; settings: AboutPageSettings
  onUpdate: (updater: (previous: AboutPageSettings) => AboutPageSettings) => void
  errors: Record<string, string>; focusPath?: string
  onUploadBusy: (key: string, busy: boolean) => void
  onUploadError: (key: string, error: string | null) => void
}) {
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    const index = focusPath?.match(/^(?:howWeDoIt\.steps|governance\.tiers|partnerSection\.categories)\.(\d+)/)?.[1]
    if (index !== undefined) setSelected(Number(index))
  }, [focusPath])

  function patch<K extends keyof AboutPageSettings>(key: K, value: Partial<AboutPageSettings[K]>) {
    onUpdate(previous => ({ ...previous, [key]: { ...previous[key], ...value } }))
  }

  function field(path: string, label: string, value: string, onChange: (value: string) => void, multiline = false, help?: string, type?: "text" | "color") {
    return <ContentField path={path} label={label} value={value} onChange={onChange} multiline={multiline} help={help} type={type} error={errors[path]} />
  }

  function select(path: string, label: string, value: string, options: readonly string[], onChange: (value: string) => void) {
    return (
      <div className="space-y-2">
        <Label htmlFor={aboutFieldId(path)} className="text-sm font-medium text-foreground">{label}</Label>
        <FancySelect 
          id={aboutFieldId(path)} 
          className="h-11 sm:h-10 text-sm" 
          value={value}
          onValueChange={onChange} 
          options={options.map(option => ({ value: option, label: option.replace(/-/g, " ") }))}
          aria-invalid={!!errors[path]} 
          aria-describedby={errors[path] ? `${aboutFieldId(path)}-error` : undefined} 
        />
        {errors[path] && <p id={`${aboutFieldId(path)}-error`} role="alert" className="text-xs font-medium text-destructive">{errors[path]}</p>}
      </div>
    )
  }

  function toggle(path: string, label: string, checked: boolean, onChange: (value: boolean) => void) {
    return (
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border bg-card/40">
        <Label htmlFor={aboutFieldId(path)} className="text-sm font-medium cursor-pointer text-foreground">{label}</Label>
        <Switch id={aboutFieldId(path)} checked={checked} onCheckedChange={onChange} />
      </div>
    )
  }

  function heading(key: "governance" | "people" | "partnerSection") {
    return (
      <div className="space-y-3">
        {field(`${key}.label`, "Section Badge Label", settings[key].label, label => patch(key, { label }))}
        <div className="grid gap-3 sm:grid-cols-2">
          {field(`${key}.title`, "Main Heading", settings[key].title, title => patch(key, { title }))}
          {field(`${key}.accent`, "Highlighted Phrase", settings[key].accent, accent => patch(key, { accent }))}
        </div>
        {field(`${key}.description`, "Section Overview Description", settings[key].description, description => patch(key, { description }), true)}
      </div>
    )
  }

  const list = section === "howWeDoIt" ? settings.howWeDoIt.steps : section === "governance" ? settings.governance.tiers : settings.partnerSection.categories
  const itemIndex = Math.min(selected, Math.max(0, list.length - 1))

  function moveItem(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= list.length) return
    if (section === "howWeDoIt") {
      const copy = [...settings.howWeDoIt.steps]
      const temp = copy[index]
      copy[index] = copy[target]
      copy[target] = temp
      patch("howWeDoIt", { steps: copy })
      setSelected(target)
    } else if (section === "governance") {
      const copy = [...settings.governance.tiers]
      const temp = copy[index]
      copy[index] = copy[target]
      copy[target] = temp
      patch("governance", { tiers: copy })
      setSelected(target)
    } else if (section === "partnerSection") {
      const copy = [...settings.partnerSection.categories]
      const temp = copy[index]
      copy[index] = copy[target]
      copy[target] = temp
      patch("partnerSection", { categories: copy })
      setSelected(target)
    }
  }

  // Visual Bento Strip Chooser with Up/Down buttons
  const chooser = (
    <div className="space-y-2.5 pt-3 border-t">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground">
          Select {section === "howWeDoIt" ? "Step" : section === "governance" ? "Tier" : "Category"} to edit:
        </Label>
        <span className="text-xs text-muted-foreground">{list.length} total items</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {list.map((item, idx) => {
          const isCurrent = idx === itemIndex
          const title = "title" in item ? String(item.title) : String(item.label)
          const color = "color" in item ? String(item.color) : undefined
          return (
            <div
              key={idx}
              className={cn(
                "group relative flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer select-none",
                isCurrent
                  ? "bg-primary/10 border-primary ring-1 ring-primary shadow-xs"
                  : "bg-card hover:bg-muted/40 border-border/80"
              )}
              onClick={() => setSelected(idx)}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {color ? (
                  <span
                    className="size-4 rounded-full shrink-0 border border-black/20"
                    style={{ backgroundColor: color }}
                  />
                ) : (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                )}
                <span className={cn("text-sm font-medium truncate", isCurrent ? "text-primary font-semibold" : "text-foreground")}>
                  {title || `Item ${idx + 1}`}
                </span>
              </div>

              {/* Move up / down arrows */}
              <div className="flex items-center gap-1 shrink-0 ml-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, "up")}
                  className={cn(
                    "p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
                    idx === 0 && "opacity-20 pointer-events-none"
                  )}
                  title="Move earlier"
                  aria-label={`Move item ${idx + 1} up`}
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5" aria-hidden="true">
                    <path d="M8 4.5l4.5 5.5h-9l4.5-5.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  disabled={idx === list.length - 1}
                  onClick={() => moveItem(idx, "down")}
                  className={cn(
                    "p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
                    idx === list.length - 1 && "opacity-20 pointer-events-none"
                  )}
                  title="Move later"
                  aria-label={`Move item ${idx + 1} down`}
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5" aria-hidden="true">
                    <path d="M8 11.5l-4.5-5.5h9l-4.5 5.5z" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">{sectionNames[section]}</CardTitle>
        <CardDescription className="text-sm">
          {section === "hero" ? "Configure the Hero title, CTAs, and trust metrics. Photos come from published Team members."
            : section === "partnerSection" ? "Configure the partner category tiles shown on the public page. Organization records are managed under the Partner Records tab."
            : section === "pageSettings" ? "Manage SEO metadata, section visibility toggles, and retained legacy milestones."
            : "Edit this section's public content, then publish your changes."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* HERO SECTION */}
        {section === "hero" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border bg-muted/20">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Hero Collage Photos</p>
                <p className="text-xs text-muted-foreground">Photos are pulled automatically from published Team members with Hero enabled.</p>
              </div>
              <Button asChild variant="outline" className="h-9 px-3.5 text-sm font-medium shrink-0 self-start sm:self-auto">
                <a href="/admin/team" target="_blank" rel="noopener noreferrer">
                  Manage Team Photos <ExternalLink className="ml-1.5 size-3.5" />
                </a>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {field("hero.breadcrumbLabel", "Breadcrumb Label", settings.hero.breadcrumbLabel, breadcrumbLabel => patch("hero", { breadcrumbLabel }))}
              {field("hero.badge", "Photo Collage Caption", settings.hero.badge, badge => patch("hero", { badge }))}
            </div>

            <div className="space-y-2 rounded-xl border p-3.5 bg-card/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                Main Headline Configuration
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {field("hero.headlineLine1", "Headline Line 1", settings.hero.headlineLine1, headlineLine1 => patch("hero", { headlineLine1 }))}
                {field("hero.headlineLine2", "Headline Line 2", settings.hero.headlineLine2, headlineLine2 => patch("hero", { headlineLine2 }), false, "The final two words are highlighted in the public design.")}
              </div>
            </div>

            {field("hero.subtitle", "Introduction Paragraph", settings.hero.subtitle, subtitle => patch("hero", { subtitle }), true)}

            <div className="grid gap-3 sm:grid-cols-2">
              {field("hero.primaryCtaLabel", "Primary Action Label", settings.hero.primaryCtaLabel, primaryCtaLabel => patch("hero", { primaryCtaLabel }))}
              {field("hero.primaryCtaUrl", "Primary Action Destination", settings.hero.primaryCtaUrl, primaryCtaUrl => patch("hero", { primaryCtaUrl }), false, "Use #journey to scroll to Our Story, or /donate.")}
              {field("hero.secondaryCtaLabel", "Secondary Action Label", settings.hero.secondaryCtaLabel, secondaryCtaLabel => patch("hero", { secondaryCtaLabel }))}
              {field("hero.secondaryCtaUrl", "Secondary Action Destination", settings.hero.secondaryCtaUrl, secondaryCtaUrl => patch("hero", { secondaryCtaUrl }))}
            </div>

            <TextListEditor 
              path="hero.trustBadges" 
              label="Trust Badges" 
              values={settings.hero.trustBadges} 
              errors={errors} 
              onChange={trustBadges => patch("hero", { trustBadges })} 
            />
          </>
        )}

        {/* INTRO SECTION (WHO WE ARE) */}
        {section === "intro" && (
          <>
            {field("intro.label", "Badge Label", settings.intro.label, label => patch("intro", { label }))}
            {field("intro.headline", "Section Headline", settings.intro.headline, headline => patch("intro", { headline }), true)}
            <TextListEditor path="intro.paragraphs" label="Story Paragraph" values={settings.intro.paragraphs} errors={errors} onChange={paragraphs => patch("intro", { paragraphs })} />
            {field("intro.quote", "Featured Callout Quote", settings.intro.quote, quote => patch("intro", { quote }), true)}

            <TextListEditor 
              path="intro.flowSteps" 
              label="Process Flow Label" 
              values={settings.intro.flowSteps} 
              errors={errors}
              onChange={flowSteps => onUpdate(previous => ({ 
                ...previous, 
                intro: { 
                  ...previous.intro, 
                  flowSteps,
                  flowAppearance: flowSteps.map((_, index) => previous.intro.flowAppearance[index] || { icon: "heart", tone: "blue" }) 
                } 
              }))}
              onRemove={index => onUpdate(previous => ({ 
                ...previous, 
                intro: { 
                  ...previous.intro,
                  flowSteps: previous.intro.flowSteps.filter((_, itemIndex) => itemIndex !== index),
                  flowAppearance: previous.intro.flowSteps.map((_, itemIndex) => previous.intro.flowAppearance[itemIndex] || { icon: "heart" as const, tone: "blue" as const }).filter((_, itemIndex) => itemIndex !== index),
                } 
              }))} 
            />

            {/* Modern Accordion: Flow Icons and Colors */}
            <CollapsibleSection title="Flow Icons & Visual Tones" description="Customize icons and color tokens for each flow label">
              <div className="space-y-4">
                {settings.intro.flowSteps.map((text, index) => {
                  const appearance = settings.intro.flowAppearance[index] || { icon: "heart" as const, tone: "blue" as const }
                  const change = (value: Partial<typeof appearance>) => onUpdate(previous => {
                    const flowAppearance = previous.intro.flowSteps.map((_, itemIndex) => previous.intro.flowAppearance[itemIndex] || { icon: "heart" as const, tone: "blue" as const })
                    flowAppearance[index] = { ...flowAppearance[index], ...value }
                    return { ...previous, intro: { ...previous.intro, flowAppearance } }
                  })
                  return (
                    <fieldset key={index} className="grid gap-3 sm:grid-cols-2 p-3 rounded-lg border bg-card/30">
                      <legend className="px-1 text-xs font-semibold text-primary">{text || `Step ${index + 1}`}</legend>
                      {select(`intro.flowAppearance.${index}.icon`, "Icon Style", appearance.icon, ABOUT_FLOW_ICONS, icon => change({ icon: icon as typeof appearance.icon }))}
                      {select(`intro.flowAppearance.${index}.tone`, "Color Accent", appearance.tone, ABOUT_FLOW_TONES, tone => change({ tone: tone as typeof appearance.tone }))}
                    </fieldset>
                  )
                })}
              </div>
            </CollapsibleSection>

            {/* Modern Accordion: Video and Accessibility */}
            <CollapsibleSection title="Introduction Video & Accessibility Captions" description="Upload intro video, poster image, and accessibility transcripts">
              <div className="space-y-4">
                {field("intro.media.src", "Video URL", settings.intro.media.src, src => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, src } } })))}
                <FileUpload 
                  bucket="videos" 
                  accept="video/mp4,video/webm" 
                  maxSizeMB={100} 
                  allowUrl={false} 
                  label="Upload Introduction Video" 
                  currentUrl={settings.intro.media.src}
                  onUpload={src => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, src } } }))}
                  onBusyChange={busy => onUploadBusy("intro-video", busy)} 
                  onErrorChange={error => onUploadError("intro-video", error)} 
                />
                
                {field("intro.media.title", "Accessible Video Title", settings.intro.media.title, title => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, title } } })))}
                
                {/* MediaPicker for Video Poster Image */}
                <ImageField
                  path="intro.media.poster"
                  label="Poster Image (Shown before playback)"
                  value={settings.intro.media.poster || ""}
                  onChange={poster => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, poster } } }))}
                  error={errors["intro.media.poster"]}
                  help="Optional high-resolution still image."
                  bucket="site-assets"
                />

                {toggle("intro.media.autoPlay", "Autoplay Muted Video", settings.intro.media.autoPlay, autoPlay => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, autoPlay } } })))}
                {toggle("intro.media.hasSpeech", "Video Contains Spoken Audio", settings.intro.media.hasSpeech, hasSpeech => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, hasSpeech } } })))}
                
                {([ ["captionsSrc", "Captions URL (.vtt)"], ["captionsLanguage", "Caption Language Code (e.g. en)"], ["captionsLabel", "Caption Language Label"], ["transcript", "Full Transcript / Description"] ] as const).map(([key, label]) => (
                  <div key={key}>
                    {field(`intro.media.${key}`, label, settings.intro.media[key], value => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, [key]: value } } })), key === "transcript")}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </>
        )}

        {/* HOW WE DO IT SECTION */}
        {section === "howWeDoIt" && (
          <>
            {field("howWeDoIt.label", "Section Badge Label", settings.howWeDoIt.label, label => patch("howWeDoIt", { label }))}
            {field("howWeDoIt.title", "Main Heading", settings.howWeDoIt.title, title => patch("howWeDoIt", { title }), true)}
            {field("howWeDoIt.subtitle", "Section Description", settings.howWeDoIt.subtitle, subtitle => patch("howWeDoIt", { subtitle }), true)}
            
            {chooser}

            {settings.howWeDoIt.steps[itemIndex] && (
              <div className="space-y-4 p-4 sm:p-5 rounded-xl border bg-card/50">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-mono">
                    {itemIndex + 1}
                  </span>
                  <h4 className="font-semibold text-base">Editing Step {itemIndex + 1}: {settings.howWeDoIt.steps[itemIndex].title}</h4>
                </div>

                {field(
                  `howWeDoIt.steps.${itemIndex}.title`, 
                  "Step Title", 
                  settings.howWeDoIt.steps[itemIndex].title, 
                  title => onUpdate(previous => ({ 
                    ...previous, 
                    howWeDoIt: { 
                      ...previous.howWeDoIt, 
                      steps: previous.howWeDoIt.steps.map((item, index) => index === itemIndex ? { ...item, title } : item) 
                    } 
                  }))
                )}

                {field(
                  `howWeDoIt.steps.${itemIndex}.body`, 
                  "Step Description", 
                  settings.howWeDoIt.steps[itemIndex].body, 
                  body => onUpdate(previous => ({ 
                    ...previous, 
                    howWeDoIt: { 
                      ...previous.howWeDoIt, 
                      steps: previous.howWeDoIt.steps.map((item, index) => index === itemIndex ? { ...item, body } : item) 
                    } 
                  })), 
                  true
                )}

                {/* ColorField with preset swatches */}
                <ColorField
                  path={`howWeDoIt.steps.${itemIndex}.color`}
                  label="Marker Accent Color"
                  value={settings.howWeDoIt.steps[itemIndex].color}
                  onChange={color => onUpdate(previous => ({ 
                    ...previous, 
                    howWeDoIt: { 
                      ...previous.howWeDoIt, 
                      steps: previous.howWeDoIt.steps.map((item, index) => index === itemIndex ? { ...item, color } : item) 
                    } 
                  }))}
                  error={errors[`howWeDoIt.steps.${itemIndex}.color`]}
                  help="Select a brand preset color or choose a custom hex value."
                />
              </div>
            )}

            {field("howWeDoIt.closingLine", "Closing Statement Line", settings.howWeDoIt.closingLine, closingLine => patch("howWeDoIt", { closingLine }), true)}
          </>
        )}

        {/* GOVERNANCE SECTION */}
        {section === "governance" && (
          <>
            {heading("governance")}
            {chooser}

            {settings.governance.tiers[itemIndex] && (
              <div className="space-y-4 p-4 sm:p-5 rounded-xl border bg-card/50">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-mono">
                    {itemIndex + 1}
                  </span>
                  <h4 className="font-semibold text-base">Editing Tier {itemIndex + 1}: {settings.governance.tiers[itemIndex].title}</h4>
                </div>

                {([ ["title", "Tier Title"], ["subtitle", "Tier Subtitle"], ["description", "Tier Description"] ] as const).map(([key, label]) => (
                  <div key={key}>
                    {field(
                      `governance.tiers.${itemIndex}.${key}`, 
                      label, 
                      settings.governance.tiers[itemIndex][key], 
                      value => onUpdate(previous => ({ 
                        ...previous, 
                        governance: { 
                          ...previous.governance, 
                          tiers: previous.governance.tiers.map((item, index) => index === itemIndex ? { ...item, [key]: value } : item) 
                        } 
                      })), 
                      key === "description"
                    )}
                  </div>
                ))}

                {select(
                  `governance.tiers.${itemIndex}.accent`, 
                  "Tier Appearance Theme", 
                  settings.governance.tiers[itemIndex].accent, 
                  ["vision", "board", "advisory", "assembly"], 
                  accent => onUpdate(previous => ({ 
                    ...previous, 
                    governance: { 
                      ...previous.governance, 
                      tiers: previous.governance.tiers.map((item, index) => index === itemIndex ? { ...item, accent: accent as typeof item.accent } : item) 
                    } 
                  }))
                )}
              </div>
            )}

            <div className="space-y-4 pt-3 border-t">
              {field("governance.operationalTitle", "Operational Group Heading", settings.governance.operationalTitle, operationalTitle => patch("governance", { operationalTitle }))}
              
              <div className="space-y-3">
                {settings.governance.teams.map((team, index) => (
                  <div key={team.id} className="space-y-3 p-4 rounded-xl border bg-card/30">
                    <p className="text-sm font-semibold text-primary">Team {index + 1}: {team.title}</p>
                    {field(`governance.teams.${index}.title`, "Team Title", team.title, title => onUpdate(previous => ({ ...previous, governance: { ...previous.governance, teams: previous.governance.teams.map((item, i) => i === index ? { ...item, title } : item) } })))}
                    {field(`governance.teams.${index}.description`, "Team Description", team.description, description => onUpdate(previous => ({ ...previous, governance: { ...previous.governance, teams: previous.governance.teams.map((item, i) => i === index ? { ...item, description } : item) } })), true)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* PEOPLE SECTION */}
        {section === "people" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border bg-muted/20">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Team Members Data</p>
                <p className="text-xs text-muted-foreground">Manage individual people, biographies, and leadership tiers under the Team section.</p>
              </div>
              <Button asChild variant="outline" className="h-9 px-3.5 text-sm font-medium shrink-0 self-start sm:self-auto">
                <a href="/admin/team" target="_blank" rel="noopener noreferrer">
                  Manage Team Records <ExternalLink className="ml-1.5 size-3.5" />
                </a>
              </Button>
            </div>
            {heading("people")}
            {field("people.emptyMessage", "Empty State Message", settings.people.emptyMessage, emptyMessage => patch("people", { emptyMessage }))}
            {field("people.unavailableMessage", "Loading Error Message", settings.people.unavailableMessage, unavailableMessage => patch("people", { unavailableMessage }))}
          </>
        )}

        {/* PARTNER SECTION */}
        {section === "partnerSection" && (
          <>
            {heading("partnerSection")}
            {chooser}

            {settings.partnerSection.categories[itemIndex] && (
              <div className="space-y-4 p-4 sm:p-5 rounded-xl border bg-card/50">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-mono">
                    {itemIndex + 1}
                  </span>
                  <h4 className="font-semibold text-base">Editing Category: {settings.partnerSection.categories[itemIndex].label}</h4>
                </div>

                {field(
                  `partnerSection.categories.${itemIndex}.label`, 
                  "Category Label", 
                  settings.partnerSection.categories[itemIndex].label, 
                  label => onUpdate(previous => ({ 
                    ...previous, 
                    partnerSection: { 
                      ...previous.partnerSection, 
                      categories: previous.partnerSection.categories.map((item, index) => index === itemIndex ? { ...item, label } : item) 
                    } 
                  }))
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {select(
                    `partnerSection.categories.${itemIndex}.icon`, 
                    "Category Icon", 
                    settings.partnerSection.categories[itemIndex].icon, 
                    ABOUT_CATEGORY_ICONS, 
                    icon => onUpdate(previous => ({ 
                      ...previous, 
                      partnerSection: { 
                        ...previous.partnerSection, 
                        categories: previous.partnerSection.categories.map((item, index) => index === itemIndex ? { ...item, icon: icon as typeof item.icon } : item) 
                      } 
                    }))
                  )}

                  {select(
                    `partnerSection.categories.${itemIndex}.tone`, 
                    "Color Tone", 
                    settings.partnerSection.categories[itemIndex].tone, 
                    ABOUT_CATEGORY_TONES, 
                    tone => onUpdate(previous => ({ 
                      ...previous, 
                      partnerSection: { 
                        ...previous.partnerSection, 
                        categories: previous.partnerSection.categories.map((item, index) => index === itemIndex ? { ...item, tone: tone as typeof item.tone } : item) 
                      } 
                    }))
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* GET INVOLVED SECTION */}
        {section === "getInvolved" && (
          <div className="space-y-3">
            {field("getInvolved.title", "Heading", settings.getInvolved.title, title => patch("getInvolved", { title }))}
            {field("getInvolved.description", "Description", settings.getInvolved.description, description => patch("getInvolved", { description }), true)}
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t">
              {field("getInvolved.primaryLabel", "Primary Action Label", settings.getInvolved.primaryLabel, primaryLabel => patch("getInvolved", { primaryLabel }))}
              {field("getInvolved.primaryHref", "Primary Destination URL", settings.getInvolved.primaryHref, primaryHref => patch("getInvolved", { primaryHref }))}
              {field("getInvolved.secondaryLabel", "Secondary Action Label", settings.getInvolved.secondaryLabel, secondaryLabel => patch("getInvolved", { secondaryLabel }))}
              {field("getInvolved.secondaryHref", "Secondary Destination URL", settings.getInvolved.secondaryHref, secondaryHref => patch("getInvolved", { secondaryHref }))}
            </div>
          </div>
        )}

        {/* PAGE SETTINGS & SEO */}
        {section === "pageSettings" && (
          <>
            <div className="space-y-3">
              {field("seo.title", "SEO Meta Title", settings.seo.title, title => patch("seo", { title }))}
              {field("seo.description", "SEO Meta Description", settings.seo.description, description => patch("seo", { description }), true, "Search engines use the first 160 characters. Route canonical is /about.")}
              <TextListEditor path="seo.keywords" label="SEO Keyword" values={settings.seo.keywords} errors={errors} onChange={keywords => patch("seo", { keywords })} />
              
              {/* MediaPicker for Social Share Image */}
              <ImageField
                path="seo.image"
                label="Social Share Image (OpenGraph / Twitter)"
                value={settings.seo.image || ""}
                onChange={image => patch("seo", { image })}
                error={errors["seo.image"]}
                help="Recommended resolution: 1200x630. Displayed when sharing on social media."
                bucket="site-assets"
              />
              {field("seo.imageAlt", "Social Image Description", settings.seo.imageAlt, imageAlt => patch("seo", { imageAlt }))}
              {toggle("seo.noIndex", "Exclude from Search Engines (noindex)", settings.seo.noIndex, noIndex => patch("seo", { noIndex }))}
            </div>

            {/* Section Visibility Toggles */}
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold">Section Visibility</h4>
                <p className="text-xs text-muted-foreground">Toggle sections on or off. Hiding a section cleanly removes it from public view.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {([ ["intro", "Who We Are Section"], ["process", "How We Do It Section"], ["governance", "Governance Section"], ["people", "Our People Section"], ["partners", "Partners Section"], ["getInvolved", "Get Involved Section"] ] as const).map(([key, label]) => (
                  <div key={key}>
                    {toggle(`visibility.${key}`, label, settings.visibility[key], visible => patch("visibility", { [key]: visible }))}
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible: Retained Legacy Milestones */}
            <CollapsibleSection title="Retained Legacy Content (Our Story Milestones)" description="Preserved historical milestones for reference or future reactivation">
              <div className="space-y-4">
                {field("intro.sinceBadge", "Legacy Photo Badge", settings.intro.sinceBadge, sinceBadge => patch("intro", { sinceBadge }))}
                {field("journey.label", "Journey Label", settings.journey.label, label => patch("journey", { label }))}
                {field("journey.title", "Journey Title", settings.journey.title, title => patch("journey", { title }))}
                {field("journey.subtitle", "Journey Description", settings.journey.subtitle, subtitle => patch("journey", { subtitle }), true)}

                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Historical Milestones</p>
                    <span className="text-xs text-muted-foreground">{settings.journey.milestones.length} milestones</span>
                  </div>

                  {settings.journey.milestones.map((item, index) => (
                    <div key={item.id} className="space-y-3 p-4 rounded-xl border bg-card/40">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary font-mono">Milestone {index + 1} ({item.year || "Year"})</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                          onClick={() => onUpdate(previous => ({ ...previous, journey: { ...previous.journey, milestones: previous.journey.milestones.filter((_, i) => i !== index) } }))}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {field(`journey.milestones.${index}.year`, "Year", item.year || "", value => onUpdate(previous => ({ ...previous, journey: { ...previous.journey, milestones: previous.journey.milestones.map((entry, i) => i === index ? { ...entry, year: value } : entry) } })))}
                        {field(`journey.milestones.${index}.title`, "Milestone Title", item.title, value => onUpdate(previous => ({ ...previous, journey: { ...previous.journey, milestones: previous.journey.milestones.map((entry, i) => i === index ? { ...entry, title: value } : entry) } })))}
                      </div>

                      {field(`journey.milestones.${index}.description`, "Description", item.description, value => onUpdate(previous => ({ ...previous, journey: { ...previous.journey, milestones: previous.journey.milestones.map((entry, i) => i === index ? { ...entry, description: value } : entry) } })), true)}

                      <ImageField
                        path={`journey.milestones.${index}.image`}
                        label="Milestone Image"
                        value={item.image || ""}
                        onChange={image => onUpdate(previous => ({ ...previous, journey: { ...previous.journey, milestones: previous.journey.milestones.map((entry, i) => i === index ? { ...entry, image } : entry) } }))}
                        error={errors[`journey.milestones.${index}.image`]}
                        bucket="site-assets"
                      />
                    </div>
                  ))}

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-10 px-4 text-sm font-medium" 
                    disabled={settings.journey.milestones.length >= 100} 
                    onClick={() => onUpdate(previous => ({ 
                      ...previous, 
                      journey: { 
                        ...previous.journey, 
                        milestones: [
                          ...previous.journey.milestones, 
                          { id: `journey-${crypto.randomUUID()}`, year: String(new Date().getFullYear()), title: "New Milestone", description: "Describe this milestone.", image: "", imageAlt: "", sourceUrl: "" }
                        ] 
                      } 
                    }))}
                  >
                    + Add Retained Milestone
                  </Button>
                </div>
              </div>
            </CollapsibleSection>
          </>
        )}
      </CardContent>
    </Card>
  )
}
