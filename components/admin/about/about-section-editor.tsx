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
import { ContentField, TextListEditor, aboutFieldId } from "./content-fields"

export type AboutSection = "hero" | "intro" | "howWeDoIt" | "governance" | "people" | "partnerSection" | "getInvolved" | "pageSettings"

const sectionNames: Record<AboutSection, string> = {
  hero: "Hero", intro: "Who We Are", howWeDoIt: "How We Do It", governance: "Governance",
  people: "Our People", partnerSection: "Partner categories", getInvolved: "Get Involved", pageSettings: "Page settings",
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
    return <div className="space-y-2"><Label htmlFor={aboutFieldId(path)}>{label}</Label>
      <FancySelect id={aboutFieldId(path)} className="min-h-11" value={value}
        onValueChange={onChange} options={options.map(option => ({ value: option, label: option.replace(/-/g, " ") }))}
        aria-invalid={!!errors[path]} aria-describedby={errors[path] ? `${aboutFieldId(path)}-error` : undefined} />
      {errors[path] && <p id={`${aboutFieldId(path)}-error`} role="alert" className="text-sm text-destructive">{errors[path]}</p>}
    </div>
  }
  function toggle(path: string, label: string, checked: boolean, onChange: (value: boolean) => void) {
    return <div className="flex min-h-11 items-center justify-between gap-4"><Label htmlFor={aboutFieldId(path)}>{label}</Label>
      <Switch id={aboutFieldId(path)} checked={checked} onCheckedChange={onChange} />
    </div>
  }
  function heading(key: "governance" | "people" | "partnerSection") {
    return <div className="space-y-4">
      {field(`${key}.label`, "Section label", settings[key].label, label => patch(key, { label }))}
      <div className="grid gap-4 sm:grid-cols-2">
        {field(`${key}.title`, "Heading", settings[key].title, title => patch(key, { title }))}
        {field(`${key}.accent`, "Highlighted phrase", settings[key].accent, accent => patch(key, { accent }))}
      </div>
      {field(`${key}.description`, "Description", settings[key].description, description => patch(key, { description }), true)}
    </div>
  }
  const list = section === "howWeDoIt" ? settings.howWeDoIt.steps : section === "governance" ? settings.governance.tiers : settings.partnerSection.categories
  const itemIndex = Math.min(selected, Math.max(0, list.length - 1))
  const chooser = <div className="space-y-2"><Label htmlFor={`about-${section}-chooser`}>Choose an item to edit</Label>
    <FancySelect id={`about-${section}-chooser`} className="min-h-11" value={String(itemIndex)} onValueChange={value => setSelected(Number(value))}
      options={list.map((item, index) => ({ value: String(index), label: `${index + 1}. ${"title" in item ? String(item.title) : String(item.label)}` }))} />
  </div>

  return <Card><CardHeader><CardTitle>{sectionNames[section]}</CardTitle>
    <CardDescription>{section === "hero" ? "Page introduction and actions. Photos come from published Team members in their saved order."
      : section === "partnerSection" ? "These six category tiles appear on the public About page. Organization records are managed separately in the Partner records panel."
      : section === "pageSettings" ? "Page metadata, section visibility, and retained content."
      : "Edit this section's public content, then publish page changes."}</CardDescription>
  </CardHeader><CardContent className="space-y-6">
    {section === "hero" && <>
      <Button asChild variant="outline" className="min-h-11"><a href="/admin/team" target="_blank" rel="noopener noreferrer">Manage Team photos <span className="sr-only">(opens in a new tab)</span></a></Button>
      {field("hero.breadcrumbLabel", "Breadcrumb label", settings.hero.breadcrumbLabel, breadcrumbLabel => patch("hero", { breadcrumbLabel }))}
      {field("hero.badge", "Photo caption", settings.hero.badge, badge => patch("hero", { badge }))}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("hero.headlineLine1", "Headline line 1", settings.hero.headlineLine1, headlineLine1 => patch("hero", { headlineLine1 }))}
        {field("hero.headlineLine2", "Headline line 2", settings.hero.headlineLine2, headlineLine2 => patch("hero", { headlineLine2 }), false, "The final two words are highlighted in the public design.")}
      </div>
      {field("hero.subtitle", "Introduction", settings.hero.subtitle, subtitle => patch("hero", { subtitle }), true)}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("hero.primaryCtaLabel", "Primary action label", settings.hero.primaryCtaLabel, primaryCtaLabel => patch("hero", { primaryCtaLabel }))}
        {field("hero.primaryCtaUrl", "Primary action destination", settings.hero.primaryCtaUrl, primaryCtaUrl => patch("hero", { primaryCtaUrl }), false, "The retained #journey link opens Our Story.")}
        {field("hero.secondaryCtaLabel", "Secondary action label", settings.hero.secondaryCtaLabel, secondaryCtaLabel => patch("hero", { secondaryCtaLabel }))}
        {field("hero.secondaryCtaUrl", "Secondary action destination", settings.hero.secondaryCtaUrl, secondaryCtaUrl => patch("hero", { secondaryCtaUrl }))}
      </div>
      <TextListEditor path="hero.trustBadges" label="Trust text" values={settings.hero.trustBadges} errors={errors} onChange={trustBadges => patch("hero", { trustBadges })} />
    </>}
    {section === "intro" && <>
      {field("intro.label", "Section label", settings.intro.label, label => patch("intro", { label }))}
      {field("intro.headline", "Headline", settings.intro.headline, headline => patch("intro", { headline }), true)}
      <TextListEditor path="intro.paragraphs" label="Paragraph" values={settings.intro.paragraphs} errors={errors} onChange={paragraphs => patch("intro", { paragraphs })} />
      {field("intro.quote", "Highlighted quote", settings.intro.quote, quote => patch("intro", { quote }), true)}
      <TextListEditor path="intro.flowSteps" label="Flow label" values={settings.intro.flowSteps} errors={errors}
        onChange={flowSteps => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, flowSteps,
          flowAppearance: flowSteps.map((_, index) => previous.intro.flowAppearance[index] || { icon: "heart", tone: "blue" }) } }))}
        onRemove={index => onUpdate(previous => ({ ...previous, intro: { ...previous.intro,
          flowSteps: previous.intro.flowSteps.filter((_, itemIndex) => itemIndex !== index),
          flowAppearance: previous.intro.flowSteps.map((_, itemIndex) => previous.intro.flowAppearance[itemIndex] || { icon: "heart" as const, tone: "blue" as const }).filter((_, itemIndex) => itemIndex !== index),
        } }))} />
      <details className="rounded-lg border p-4"><summary className="min-h-11 cursor-pointer font-medium">Flow icons and colors</summary><div className="space-y-4 pt-4">
        {settings.intro.flowSteps.map((text, index) => {
          const appearance = settings.intro.flowAppearance[index] || { icon: "heart" as const, tone: "blue" as const }
          const change = (value: Partial<typeof appearance>) => onUpdate(previous => {
            const flowAppearance = previous.intro.flowSteps.map((_, itemIndex) => previous.intro.flowAppearance[itemIndex] || { icon: "heart" as const, tone: "blue" as const })
            flowAppearance[index] = { ...flowAppearance[index], ...value }
            return { ...previous, intro: { ...previous.intro, flowAppearance } }
          })
          return <fieldset key={index} className="grid gap-4 sm:grid-cols-2"><legend className="mb-2 text-sm font-medium">{text || `Flow label ${index + 1}`}</legend>
            {select(`intro.flowAppearance.${index}.icon`, "Icon", appearance.icon, ABOUT_FLOW_ICONS, icon => change({ icon: icon as typeof appearance.icon }))}
            {select(`intro.flowAppearance.${index}.tone`, "Color", appearance.tone, ABOUT_FLOW_TONES, tone => change({ tone: tone as typeof appearance.tone }))}
          </fieldset>
        })}
      </div></details>
      <details className="rounded-lg border p-4"><summary className="min-h-11 cursor-pointer font-medium">Video and accessibility</summary><div className="space-y-4 pt-4">
        {field("intro.media.src", "Video URL", settings.intro.media.src, src => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, src } } })))}
        <FileUpload bucket="videos" accept="video/mp4,video/webm" maxSizeMB={100} allowUrl={false} label="Upload introduction video" currentUrl={settings.intro.media.src}
          onUpload={src => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, src } } }))}
          onBusyChange={busy => onUploadBusy("intro-video", busy)} onErrorChange={error => onUploadError("intro-video", error)} />
        {field("intro.media.title", "Accessible video title", settings.intro.media.title, title => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, title } } })))}
        {field("intro.media.poster", "Poster image URL (optional)", settings.intro.media.poster, poster => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, poster } } })))}
        {toggle("intro.media.autoPlay", "Autoplay muted video", settings.intro.media.autoPlay, autoPlay => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, autoPlay } } })))}
        <p className="text-sm text-muted-foreground">Autoplay and reveal motion are disabled for reduced-motion and sensory-friendly preferences.</p>
        {toggle("intro.media.hasSpeech", "This video contains speech", settings.intro.media.hasSpeech, hasSpeech => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, hasSpeech } } })))}
        {([ ["captionsSrc", "Captions URL (.vtt)"], ["captionsLanguage", "Caption language code"], ["captionsLabel", "Caption language label"], ["transcript", "Transcript / video description"] ] as const).map(([key, label]) => <div key={key}>{field(`intro.media.${key}`, label, settings.intro.media[key], value => onUpdate(previous => ({ ...previous, intro: { ...previous.intro, media: { ...previous.intro.media, [key]: value } } })), key === "transcript")}</div>)}
        <p className="text-sm text-muted-foreground">Provide an accurate transcript or video description. Videos with speech require captions; external caption files must permit cross-origin access.</p>
      </div></details>
    </>}
    {section === "howWeDoIt" && <>
      {field("howWeDoIt.label", "Section label", settings.howWeDoIt.label, label => patch("howWeDoIt", { label }))}
      {field("howWeDoIt.title", "Heading", settings.howWeDoIt.title, title => patch("howWeDoIt", { title }), true)}
      {field("howWeDoIt.subtitle", "Description", settings.howWeDoIt.subtitle, subtitle => patch("howWeDoIt", { subtitle }), true)}
      {chooser}
      {settings.howWeDoIt.steps[itemIndex] && ([ ["title", "Step title"], ["body", "Step description"], ["color", "Marker color"] ] as const).map(([key, label]) => <div key={key}>{field(`howWeDoIt.steps.${itemIndex}.${key}`, label, settings.howWeDoIt.steps[itemIndex][key], value => onUpdate(previous => ({ ...previous, howWeDoIt: { ...previous.howWeDoIt, steps: previous.howWeDoIt.steps.map((item, index) => index === itemIndex ? { ...item, [key]: value } : item) } })), key === "body", key === "color" ? "Use a three- or six-digit hex color." : undefined)}</div>)}
      {field("howWeDoIt.closingLine", "Closing sentence", settings.howWeDoIt.closingLine, closingLine => patch("howWeDoIt", { closingLine }), true)}
    </>}
    {section === "governance" && <>
      {heading("governance")}{chooser}
      {([ ["title", "Tier title"], ["subtitle", "Tier subtitle"], ["description", "Tier description"] ] as const).map(([key, label]) => <div key={key}>{field(`governance.tiers.${itemIndex}.${key}`, label, settings.governance.tiers[itemIndex][key], value => onUpdate(previous => ({ ...previous, governance: { ...previous.governance, tiers: previous.governance.tiers.map((item, index) => index === itemIndex ? { ...item, [key]: value } : item) } })), key === "description")}</div>)}
      {select(`governance.tiers.${itemIndex}.accent`, "Tier appearance", settings.governance.tiers[itemIndex].accent, ["vision", "board", "advisory", "assembly"], accent => onUpdate(previous => ({ ...previous, governance: { ...previous.governance, tiers: previous.governance.tiers.map((item, index) => index === itemIndex ? { ...item, accent: accent as typeof item.accent } : item) } })))}
      {field("governance.operationalTitle", "Operational group heading", settings.governance.operationalTitle, operationalTitle => patch("governance", { operationalTitle }))}
      {settings.governance.teams.map((team, index) => <fieldset key={team.id} className="space-y-4 border-t pt-4"><legend className="text-sm font-medium">{team.title}</legend>
        {field(`governance.teams.${index}.title`, "Team title", team.title, title => onUpdate(previous => ({ ...previous, governance: { ...previous.governance, teams: previous.governance.teams.map((item, i) => i === index ? { ...item, title } : item) } })))}
        {field(`governance.teams.${index}.description`, "Team description", team.description, description => onUpdate(previous => ({ ...previous, governance: { ...previous.governance, teams: previous.governance.teams.map((item, i) => i === index ? { ...item, description } : item) } })), true)}
      </fieldset>)}
    </>}
    {section === "people" && <>
      <Button asChild variant="outline" className="min-h-11"><a href="/admin/team" target="_blank" rel="noopener noreferrer">Manage Team records <span className="sr-only">(opens in a new tab)</span></a></Button>
      {heading("people")}
      {field("people.emptyMessage", "No published members message", settings.people.emptyMessage, emptyMessage => patch("people", { emptyMessage }))}
      {field("people.unavailableMessage", "Temporary loading error message", settings.people.unavailableMessage, unavailableMessage => patch("people", { unavailableMessage }))}
    </>}
    {section === "partnerSection" && <>
      {heading("partnerSection")}{chooser}
      {field(`partnerSection.categories.${itemIndex}.label`, "Category label", settings.partnerSection.categories[itemIndex].label, label => onUpdate(previous => ({ ...previous, partnerSection: { ...previous.partnerSection, categories: previous.partnerSection.categories.map((item, index) => index === itemIndex ? { ...item, label } : item) } })))}
      {select(`partnerSection.categories.${itemIndex}.icon`, "Category icon", settings.partnerSection.categories[itemIndex].icon, ABOUT_CATEGORY_ICONS, icon => onUpdate(previous => ({ ...previous, partnerSection: { ...previous.partnerSection, categories: previous.partnerSection.categories.map((item, index) => index === itemIndex ? { ...item, icon: icon as typeof item.icon } : item) } })))}
      {select(`partnerSection.categories.${itemIndex}.tone`, "Category color", settings.partnerSection.categories[itemIndex].tone, ABOUT_CATEGORY_TONES, tone => onUpdate(previous => ({ ...previous, partnerSection: { ...previous.partnerSection, categories: previous.partnerSection.categories.map((item, index) => index === itemIndex ? { ...item, tone: tone as typeof item.tone } : item) } })))}
    </>}
    {section === "getInvolved" && <>
      {([ ["title", "Heading"], ["description", "Description"], ["primaryLabel", "Primary action label"], ["primaryHref", "Primary action destination"], ["secondaryLabel", "Secondary action label"], ["secondaryHref", "Secondary action destination"] ] as const).map(([key, label]) => <div key={key}>{field(`getInvolved.${key}`, label, settings.getInvolved[key], value => patch("getInvolved", { [key]: value }), key === "description")}</div>)}
    </>}
    {section === "pageSettings" && <>
      {field("seo.title", "SEO title", settings.seo.title, title => patch("seo", { title }))}
      {field("seo.description", "SEO description", settings.seo.description, description => patch("seo", { description }), true, "Search descriptions use the first 160 characters. The canonical route remains /about.")}
      <TextListEditor path="seo.keywords" label="Keyword" values={settings.seo.keywords} errors={errors} onChange={keywords => patch("seo", { keywords })} />
      {field("seo.image", "Social preview image URL (optional)", settings.seo.image, image => patch("seo", { image }))}
      {field("seo.imageAlt", "Social preview image description", settings.seo.imageAlt, imageAlt => patch("seo", { imageAlt }))}
      {toggle("seo.noIndex", "Ask search engines not to index this page", settings.seo.noIndex, noIndex => patch("seo", { noIndex }))}
      <fieldset className="space-y-3 border-t pt-4"><legend className="mb-2 font-medium">Visible sections</legend>
        {([ ["intro", "Who We Are"], ["process", "How We Do It"], ["governance", "Governance"], ["people", "Our People"], ["partners", "Partners"], ["getInvolved", "Get Involved"] ] as const).map(([key, label]) => <div key={key}>{toggle(`visibility.${key}`, label, settings.visibility[key], visible => patch("visibility", { [key]: visible }))}</div>)}
        <p className="text-sm text-muted-foreground">Hiding a section also hides its content from visitors. Check any links to #team, #partners, and #organization. Hero remains visible so the page keeps its main heading.</p>
      </fieldset>
      <details className="rounded-lg border p-4"><summary className="min-h-11 cursor-pointer font-medium">Retained content — not shown publicly</summary><div className="space-y-4 pt-4">
        {field("intro.sinceBadge", "Legacy photo badge", settings.intro.sinceBadge, sinceBadge => patch("intro", { sinceBadge }))}
        {([ ["label", "Journey label"], ["title", "Journey title"], ["subtitle", "Journey description"] ] as const).map(([key, label]) => <div key={key}>{field(`journey.${key}`, label, settings.journey[key], value => patch("journey", { [key]: value }), key === "subtitle")}</div>)}
        {settings.journey.milestones.map((item, index) => <fieldset key={item.id} className="space-y-3 border-t pt-4"><legend className="text-sm font-medium">Milestone {index + 1}</legend>
          {([ ["year", "Year"], ["title", "Milestone title"], ["description", "Description"], ["image", "Image URL"], ["imageAlt", "Image description"], ["sourceUrl", "Source URL"] ] as const).map(([key, label]) => <div key={key}>{field(`journey.milestones.${index}.${key}`, label, item[key] || "", value => onUpdate(previous => ({ ...previous, journey: { ...previous.journey, milestones: previous.journey.milestones.map((entry, i) => i === index ? { ...entry, [key]: value } : entry) } })), key === "description")}</div>)}
          <Button type="button" variant="outline" className="min-h-11" onClick={() => onUpdate(previous => ({ ...previous, journey: { ...previous.journey, milestones: previous.journey.milestones.filter((_, i) => i !== index) } }))}>Remove milestone {index + 1}</Button>
        </fieldset>)}
        <Button type="button" variant="outline" className="min-h-11" disabled={settings.journey.milestones.length >= 100} onClick={() => onUpdate(previous => ({ ...previous, journey: { ...previous.journey, milestones: [...previous.journey.milestones, { id: `journey-${crypto.randomUUID()}`, year: String(new Date().getFullYear()), title: "New milestone", description: "Describe this milestone.", image: "", imageAlt: "", sourceUrl: "" }] } }))}>Add retained milestone</Button>
      </div></details>
    </>}
  </CardContent></Card>
}
