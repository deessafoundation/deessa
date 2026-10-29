"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Eye, RotateCcw, LayoutTemplate, PanelsTopLeft, HeartHandshake, BookOpen, Film, School, Lightbulb, ExternalLink } from "lucide-react"
import { CardsEditor } from "./cards-editor"
import { HeroEditor } from "./hero-editor"
import { SupportEditor } from "./support-editor"
import { cn } from "@/lib/utils"
import { whatWeDoSettingsSchema, type WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import styles from "./what-we-do-manager.module.css"
import { AreaDetailEditor, AREA_DETAIL_GROUPS } from "./area-detail-editor"
import type { WhatWeDoAreaId } from "@/lib/data/what-we-do-areas"

type Value = string | boolean | Value[] | { [key: string]: Value }
const immutable = new Set(["id", "slug", "labelClass", "icon", "color"])
const title = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, letter => letter.toUpperCase())
const areaFieldLabels: Record<string, string> = {
  label: "Area name", headline: "Page headline", subtitle: "Introduction",
  videoSrc: "Video URL", posterSrc: "Poster image URL", videoLabel: "Video title / accessible label", playButtonLabel: "Watch button label",
  panelTitle: "Section heading", learningTitle: "Learning section heading", learningItems: "Learning items",
  audienceTitle: "Audience section heading", audienceDescription: "Audience description", audiences: "Audience groups",
  ctaLabel: "Intro action label", ctaHref: "Intro action URL", closingTitle: "Closing heading", closingDescription: "Closing description",
  closingButtonLabel: "Closing button label", closingButtonHref: "Closing button URL",
  imageSrc: "Image URL", imageAlt: "Image description (alt text)", areaLabel: "Video badge label", listTitle: "List heading",
}
const introductionFieldLabels: Record<string, string> = { label: "Section label", title: "Heading beginning", titleAccent: "Highlighted heading text", description: "Introduction" }
const sections = [
  { key: "hero", label: "Hero", description: "Set the first impression: headline, photos, and calls to action.", icon: LayoutTemplate },
  { key: "cards", label: "Areas of Work", description: "Introduce your approach, then manage the area cards shown below it.", icon: PanelsTopLeft },
  { key: "areas", label: "Area detail pages", description: "Advocacy currently displays all area videos. Their existing video fields remain editable below; the other area pages currently show coming-soon states.", icon: BookOpen },
  { key: "animatedStory", label: "Animated story", description: "Choose your video and the conversation prompts alongside it.", icon: Film },
  { key: "inclusiveSchool", label: "Inclusive schools", description: "Manage the image and message about belonging at school.", icon: School },
  { key: "inclusiveLearning", label: "Inclusive learning", description: "Preserve your Training content for its coming-soon destination. Editing it does not activate the page.", icon: Lightbulb },
  { key: "support", label: "Ways to Help", description: "Edit the section introduction, then the donation, partnership, and volunteering actions.", icon: HeartHandshake },
  { key: "programs", label: "Programs", description: "Program listings are managed in the Programs manager.", icon: BookOpen },
] as const
type SectionKey = (typeof sections)[number]["key"]
const mainSections = sections.filter(entry => entry.key === "hero" || entry.key === "cards" || entry.key === "areas" || entry.key === "support" || entry.key === "programs")
const detailSections = sections.filter(entry => entry.key === "areas" || entry.key === "animatedStory" || entry.key === "inclusiveSchool" || entry.key === "inclusiveLearning")

function Fields({ value, path, errors, onChange }: { value: Value; path: string[]; errors: Record<string, string>; onChange: (path: string[], value: Value) => void }) {
  const [picker, setPicker] = useState(false)
  const key = path.at(-1) || ""
  const id = `content-${path.join("-")}`
  const error = errors[path.join(".")]
  const accessibility = { "aria-required": true, "aria-invalid": !!error, "aria-describedby": error ? `${id}-error` : undefined }
  const fieldTitle = (field: string) => path[0] === "introduction" ? introductionFieldLabels[field] || title(field) : detailSections.some(section => section.key === path[0]) ? areaFieldLabels[field] || title(field) : title(field)
  if (immutable.has(key)) return null
  if (typeof value === "boolean") return <label className="flex items-center gap-3"><input type="checkbox" checked={value} onChange={event => onChange(path, event.target.checked)} />Show this section</label>
  if (typeof value === "string") {
    const media = /src$/i.test(key)
    const video = /video/i.test(key)
    return <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">{/^\d+$/.test(key) ? `Item ${Number(key) + 1}` : fieldTitle(key)}</label>
      {/description|quote|introduction/i.test(key)
        ? <Textarea id={id} {...accessibility} value={value} onChange={event => onChange(path, event.target.value)} />
        : <Input id={id} {...accessibility} value={value} onChange={event => onChange(path, event.target.value)} />}
      {error && <p id={`${id}-error`} className="text-sm text-destructive">{error}</p>}
      {media && <><Button type="button" variant="outline" onClick={() => setPicker(true)}>Choose or upload {video ? "video" : "image"}</Button>
        <MediaPicker open={picker} onOpenChange={setPicker} onSelect={url => { onChange(path, url); setPicker(false) }} currentUrl={value} mediaType={video ? "video" : "image"} accept={video ? "video/mp4" : "image/*"} bucket={video ? "hero-videos" : "hero-images"} maxSizeMB={video ? 100 : 10} />
      </>}
    </div>
  }
  return <div className="grid gap-5 sm:grid-cols-2">{Object.entries(value).map(([child, entry]) => {
    const nested = typeof entry === "object"
    return nested ? <fieldset key={child} className="col-span-full min-w-0 space-y-4 rounded-xl border bg-muted/20 p-5"><legend className="px-2 text-sm font-semibold">{Array.isArray(value) ? `Item ${Number(child) + 1}` : fieldTitle(child)}</legend><Fields value={entry} path={[...path, child]} errors={errors} onChange={onChange} /></fieldset>
      : <div key={child} className={cn("min-w-0", /description|quote|introduction/i.test(child) && "sm:col-span-2")}><Fields value={entry} path={[...path, child]} errors={errors} onChange={onChange} /></div>
  })}</div>
}

export function WhatWeDoManager({ initialSettings }: { initialSettings: WhatWeDoSettings }) {
  const [settings, setSettings] = useState(initialSettings)
  const [saved, setSaved] = useState(initialSettings)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [active, setActive] = useState<SectionKey>("hero")
  const [selectedCard, setSelectedCard] = useState(initialSettings.cards[0]?.slug || "")
  const [selectedSupportAction, setSelectedSupportAction] = useState(0)
  const [selectedArea, setSelectedArea] = useState<WhatWeDoAreaId>("advocacy")
  const [detailSection, setDetailSection] = useState("overview")
  const root = useRef<HTMLDivElement>(null)
  const isDetail = detailSections.some(entry => entry.key === active)
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved)
  function navigate(value: string, focus = false) {
    const next = sections.find(entry => entry.key === value)
    if (!next) return
    setActive(next.key)
    if (next.key === "animatedStory" || next.key === "inclusiveSchool" || next.key === "inclusiveLearning") {
      setSelectedArea(next.key === "inclusiveLearning" ? "training" : "advocacy")
      setDetailSection(next.key)
    }
    if (focus) requestAnimationFrame(() => {
      root.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')?.focus({ preventScroll: true })
    })
  }
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = "" } }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
  function update(path: string[], value: Value) {
    setSettings(previous => {
      const next = structuredClone(previous)
      let target = next as unknown as Record<string, Value>
      for (const key of path.slice(0, -1)) target = target[key] as Record<string, Value>
      target[path[path.length - 1]] = value
      return next
    })
    setMessage("")
    setFieldErrors({})
    setError("")
  }
  async function save() {
    setError(""); setMessage(""); setFieldErrors({})
    const parsed = whatWeDoSettingsSchema.safeParse(settings)
    if (!parsed.success) {
      const firstKey = parsed.error.issues[0]?.path[0]
      if (firstKey === "support" && parsed.error.issues[0]?.path[1] === "actions") {
        const action = parsed.error.issues[0]?.path[2]
        if (typeof action === "number" && settings.support.actions[action]) setSelectedSupportAction(action)
      }
      if (firstKey === "areas") {
        const area = parsed.error.issues[0]?.path[1]
        if (area === "awareness" || area === "training" || area === "resources" || area === "advocacy") {
          setSelectedArea(area)
          const field = parsed.error.issues[0]?.path[2]
          setDetailSection(AREA_DETAIL_GROUPS.find(group => group.keys.some(key => key === field))?.id || "overview")
        }
      }
      const destination = firstKey === "cardsLayout" || firstKey === "introduction" ? "cards" : firstKey
      if (typeof destination === "string") navigate(destination, true)
      setFieldErrors(Object.fromEntries(parsed.error.issues.map(issue => [issue.path.join("."), issue.message])))
      setError(parsed.error.issues.map(issue => `${issue.path.join(" → ")}: ${issue.message}`).join("; "))
      return
    }
    setBusy(true)
    try {
      const response = await fetch("/api/admin/what-we-do-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: parsed.data }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to save.")
      setSettings(parsed.data); setSaved(parsed.data); setMessage("Saved. Refresh the public page to see your changes.")
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save. Please retry.") }
    finally { setBusy(false) }
  }
  function editor(entry: (typeof sections)[number]) {
    return <Card className="min-w-0 shadow-sm">
      <CardHeader className="border-b">
        <CardTitle><h2 className="text-xl">{entry.label}</h2></CardTitle>
        <CardDescription>{entry.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {entry.key === "programs" ? <div className="max-w-2xl space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">Create, edit, order, and publish programs in the existing Programs manager. Published programs appear on the What We Do page.</p>
          <Button asChild><a href="/admin/programs" target="_blank" rel="noopener noreferrer">Manage Programs<ExternalLink aria-hidden="true" className="size-4" /><span className="sr-only"> (opens in a new tab)</span></a></Button>
          <p className="text-sm text-muted-foreground">Opens in a new tab so your unsaved page edits stay here. Save &amp; publish on this page applies to page content; programs are published in their own manager.</p>
        </div> : entry.key === "cards" ? <div className="space-y-8">
          <section className="space-y-4" aria-labelledby="area-introduction-heading">
            <div><h3 id="area-introduction-heading" className="font-semibold">Section introduction</h3><p className="mt-1 text-sm text-muted-foreground">The heading and copy immediately above your area cards.</p></div>
            <fieldset disabled={busy}><Fields value={settings.introduction as Value} path={["introduction"]} errors={fieldErrors} onChange={update} /></fieldset>
          </section>
          <section className="space-y-4 border-t pt-6" aria-labelledby="area-cards-heading">
            <h3 id="area-cards-heading" className="font-semibold">Area cards</h3>
            <CardsEditor cards={settings.cards} layout={settings.cardsLayout} errors={fieldErrors} disabled={busy} selectedSlug={selectedCard} onSelect={setSelectedCard}
              onChange={cards => update(["cards"], cards)} onLayoutChange={layout => update(["cardsLayout"], layout)} />
          </section>
        </div> : entry.key === "hero" ? <HeroEditor hero={settings.hero} errors={fieldErrors} disabled={busy} onChange={update} /> : entry.key === "support" ? <SupportEditor support={settings.support} selectedAction={selectedSupportAction} onSelect={setSelectedSupportAction} errors={fieldErrors} disabled={busy} onChange={update} /> : <fieldset disabled={busy}>
          <Fields value={settings[entry.key] as Value} path={[entry.key]} errors={fieldErrors} onChange={update} />
        </fieldset>}
      </CardContent>
    </Card>
  }
  return <div ref={root} className={cn(styles.root, "min-w-0 space-y-6")}>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-3xl font-bold tracking-tight">What We Do</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Manage page content, area detail pages, and ways people can help.</p></div>
      <Button asChild variant="outline"><a href="/whatwedo" target="_blank" rel="noreferrer"><Eye aria-hidden="true" className="size-4" />View public page<span className="sr-only"> (opens in a new tab)</span></a></Button>
    </header>
    <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-center gap-3"><Badge variant={dirty ? "secondary" : "outline"}>{dirty ? "Unsaved changes" : "Up to date"}</Badge><span className="hidden text-sm text-muted-foreground sm:inline">Save publishes your changes.</span></div>
      <div className="flex flex-wrap gap-2"><Button variant="ghost" disabled={!dirty || busy} onClick={() => { if (window.confirm("Discard all unsaved changes?")) { setSettings(saved); setError(""); setFieldErrors({}); setMessage("") } }}><RotateCcw aria-hidden="true" className="size-4" />Discard</Button><Button onClick={save} disabled={!dirty || busy}><Save aria-hidden="true" className="size-4" />{busy ? "Saving…" : "Save & publish"}</Button></div>
    </div>
    {error && <p role="alert" className="rounded-xl border border-destructive bg-background p-4 text-sm text-destructive">{error}</p>}
    <p role="status" className={cn("text-sm text-muted-foreground", !message && "sr-only")}>{message}</p>
    <Tabs value={isDetail ? "areas" : active} className="min-w-0 gap-6" onValueChange={value => navigate(value)}>
      <Card className="min-w-0">
      <CardContent className="overflow-x-auto p-4">
      <TabsList aria-label="What We Do sections" className={cn(styles.track, "flex h-auto w-full min-w-max gap-1 rounded-xl p-1")}>
        {mainSections.map(entry => {
          const Icon = entry.icon
          return (
            <TabsTrigger key={entry.key} value={entry.key} className={cn(styles.tab, "h-auto gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap")} onFocus={event => event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })}>
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {entry.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
      </CardContent>
      </Card>
      {mainSections.map(entry => (
        <TabsContent key={entry.key} value={entry.key} className="min-w-0">
          {entry.key === "areas" ? <AreaDetailEditor settings={settings} selectedArea={selectedArea} onAreaChange={area => { setSelectedArea(area); setDetailSection("overview"); setActive("areas") }} openSection={detailSection} onSectionChange={setDetailSection} errors={fieldErrors} disabled={busy} renderFields={(value, path) => <Fields value={value as Value} path={path} errors={fieldErrors} onChange={update} />} /> : editor(entry)}
        </TabsContent>
      ))}
    </Tabs>
  </div>
}
