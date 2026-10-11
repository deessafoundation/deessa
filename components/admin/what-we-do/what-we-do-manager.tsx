"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Eye, RotateCcw, LayoutTemplate, PanelsTopLeft, HeartHandshake, BookOpen, Film, School, Lightbulb } from "lucide-react"
import { CardsEditor } from "./cards-editor"
import { cn } from "@/lib/utils"
import { whatWeDoSettingsSchema, type WhatWeDoSettings } from "@/lib/types/what-we-do-settings"

type Value = string | boolean | Value[] | { [key: string]: Value }
const immutable = new Set(["id", "slug", "labelClass", "icon", "color"])
const title = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, letter => letter.toUpperCase())
const sections = [
  { key: "hero", label: "Hero & images", description: "Set the first impression: headline, photos, and calls to action.", icon: LayoutTemplate },
  { key: "introduction", label: "Introduction", description: "Introduce your approach and the areas of work below.", icon: BookOpen },
  { key: "cards", label: "Areas of work", description: "Manage the content, appearance, and order of your area cards.", icon: PanelsTopLeft },
  { key: "areas", label: "Area detail pages", description: "Advocacy currently displays all area videos. Their existing video fields remain editable below; the other area pages currently show coming-soon states.", icon: BookOpen },
  { key: "animatedStory", label: "Animated story", description: "Choose your video and the conversation prompts alongside it.", icon: Film },
  { key: "inclusiveSchool", label: "Inclusive schools", description: "Manage the image and message about belonging at school.", icon: School },
  { key: "inclusiveLearning", label: "Inclusive learning", description: "Share your approach to different ways of learning.", icon: Lightbulb },
  { key: "support", label: "Ways to help", description: "Guide visitors towards donations, partnerships, and volunteering.", icon: HeartHandshake },
] as const

function Fields({ value, path, errors, onChange }: { value: Value; path: string[]; errors: Record<string, string>; onChange: (path: string[], value: Value) => void }) {
  const [picker, setPicker] = useState(false)
  const key = path.at(-1) || ""
  const id = `content-${path.join("-")}`
  const error = errors[path.join(".")]
  const accessibility = { "aria-required": true, "aria-invalid": !!error, "aria-describedby": error ? `${id}-error` : undefined }
  if (immutable.has(key)) return null
  if (typeof value === "boolean") return <label className="flex items-center gap-3"><input type="checkbox" checked={value} onChange={event => onChange(path, event.target.checked)} />Show this section</label>
  if (typeof value === "string") {
    const media = /src$/i.test(key)
    const video = /video/i.test(key)
    return <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">{/^\d+$/.test(key) ? `Item ${Number(key) + 1}` : title(key)}</label>
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
    return nested ? <fieldset key={child} className="col-span-full min-w-0 space-y-4 rounded-xl border bg-muted/20 p-5"><legend className="px-2 text-sm font-semibold">{Array.isArray(value) ? `Item ${Number(child) + 1}` : title(child)}</legend><Fields value={entry} path={[...path, child]} errors={errors} onChange={onChange} /></fieldset>
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
  const [active, setActive] = useState<(typeof sections)[number]["key"]>("cards")
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved)
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
      const firstSection = sections.find(entry => entry.key === (firstKey === "cardsLayout" ? "cards" : firstKey))
      if (firstSection) setActive(firstSection.key)
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
  return <div className="mx-auto max-w-screen-2xl space-y-6 p-4 md:p-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Website content</p><h1 className="text-3xl font-bold tracking-tight">What We Do</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Shape the main page and your area detail pages. Program listings are managed separately.</p></div>
      <Button asChild variant="outline"><a href="/whatwedo" target="_blank" rel="noreferrer"><Eye aria-hidden="true" className="size-4" />View public page<span className="sr-only"> (opens in a new tab)</span></a></Button>
    </header>
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-center gap-3"><Badge variant={dirty ? "secondary" : "outline"}>{dirty ? "Unsaved changes" : "Up to date"}</Badge><span className="hidden text-sm text-muted-foreground sm:inline">Save publishes your changes.</span></div>
      <div className="flex gap-2"><Button variant="ghost" disabled={!dirty || busy} onClick={() => { if (window.confirm("Discard all unsaved changes?")) { setSettings(saved); setError(""); setFieldErrors({}); setMessage("") } }}><RotateCcw aria-hidden="true" className="size-4" />Discard</Button><Button onClick={save} disabled={!dirty || busy}><Save aria-hidden="true" className="size-4" />{busy ? "Saving…" : "Save changes"}</Button></div>
    </div>
    {error && <p role="alert" className="rounded-xl border border-destructive bg-background p-4 text-sm text-destructive">{error}</p>}
    <p role="status" className={cn("text-sm text-muted-foreground", !message && "sr-only")}>{message}</p>
    <Tabs value={active} className="min-w-0 gap-6" onValueChange={value => {
      const next = sections.find(entry => entry.key === value)
      if (next) setActive(next.key)
    }}>
      <TabsList aria-label="Content sections" className="grid h-auto w-full grid-cols-2 gap-2 p-2 sm:grid-cols-4 xl:grid-cols-8">
        {sections.map(entry => {
          const Icon = entry.icon
          return (
            <TabsTrigger key={entry.key} value={entry.key} className="min-h-11 gap-2 whitespace-normal px-3 py-3">
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {entry.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
      {sections.map(entry => (
        <TabsContent key={entry.key} value={entry.key} className="min-w-0">
          <Card className="min-w-0 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle><h2 className="text-xl">{entry.label}</h2></CardTitle>
              <CardDescription>{entry.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {entry.key === "cards" ? (
                <CardsEditor cards={settings.cards} layout={settings.cardsLayout} errors={fieldErrors} disabled={busy}
                  onChange={cards => update(["cards"], cards)} onLayoutChange={layout => update(["cardsLayout"], layout)} />
              ) : (
                <fieldset disabled={busy}>
                  <Fields value={settings[entry.key] as Value} path={[entry.key]} errors={fieldErrors} onChange={update} />
                </fieldset>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  </div>
}
