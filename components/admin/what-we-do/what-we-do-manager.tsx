"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { whatWeDoSettingsSchema, type WhatWeDoSettings } from "@/lib/types/what-we-do-settings"

type Value = string | boolean | Value[] | { [key: string]: Value }
const immutable = new Set(["id", "slug", "labelClass", "icon", "color"])
const title = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, letter => letter.toUpperCase())

function Fields({ value, path, onChange }: { value: Value; path: string[]; onChange: (path: string[], value: Value) => void }) {
  const [picker, setPicker] = useState(false)
  const key = path.at(-1) || ""
  const id = `content-${path.join("-")}`
  if (immutable.has(key)) return null
  if (typeof value === "boolean") return <label className="flex items-center gap-3"><input type="checkbox" checked={value} onChange={event => onChange(path, event.target.checked)} />Show this section</label>
  if (typeof value === "string") {
    const media = /src$/i.test(key)
    const video = /video/i.test(key)
    return <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">{/^\d+$/.test(key) ? `Item ${Number(key) + 1}` : title(key)}</label>
      {/description|quote|introduction/i.test(key)
        ? <Textarea id={id} value={value} onChange={event => onChange(path, event.target.value)} />
        : <Input id={id} value={value} onChange={event => onChange(path, event.target.value)} />}
      {media && <><Button type="button" variant="outline" onClick={() => setPicker(true)}>Choose or upload {video ? "video" : "image"}</Button>
        <MediaPicker open={picker} onOpenChange={setPicker} onSelect={url => { onChange(path, url); setPicker(false) }} currentUrl={value} mediaType={video ? "video" : "image"} accept={video ? "video/mp4" : "image/*"} bucket={video ? "hero-videos" : "hero-images"} maxSizeMB={video ? 100 : 10} />
      </>}
    </div>
  }
  return <div className="space-y-5">{Object.entries(value).map(([child, entry]) => {
    const nested = typeof entry === "object"
    return nested ? <fieldset key={child} className="space-y-4 rounded-xl border p-4"><legend className="px-2 font-semibold">{Array.isArray(value) ? `Item ${Number(child) + 1}` : title(child)}</legend><Fields value={entry} path={[...path, child]} onChange={onChange} /></fieldset>
      : <Fields key={child} value={entry} path={[...path, child]} onChange={onChange} />
  })}</div>
}

export function WhatWeDoManager({ initialSettings }: { initialSettings: WhatWeDoSettings }) {
  const [settings, setSettings] = useState(initialSettings)
  const [saved, setSaved] = useState(initialSettings)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
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
  }
  async function save() {
    setError(""); setMessage("")
    const parsed = whatWeDoSettingsSchema.safeParse(settings)
    if (!parsed.success) { setError(parsed.error.issues.map(issue => `${issue.path.join(" → ")}: ${issue.message}`).join("; ")); return }
    setBusy(true)
    try {
      const response = await fetch("/api/admin/what-we-do-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: parsed.data }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to save.")
      setSettings(parsed.data); setSaved(parsed.data); setMessage("Saved. Refresh the public page to see your changes.")
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save. Please retry.") }
    finally { setBusy(false) }
  }
  return <div className="mx-auto max-w-5xl space-y-6 p-6">
    <header><h1 className="text-2xl font-bold">What We Do</h1><p className="mt-2 text-slate-600">Edit the main page and all four areas of work. Program listings are managed separately.</p></header>
    <div className="sticky top-16 z-20 flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
      <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save content"}</Button>
      <Button variant="outline" disabled={!dirty || busy} onClick={() => { setSettings(saved); setError(""); setMessage("") }}>Discard unsaved changes</Button>
      <a href="/whatwedo" target="_blank" rel="noreferrer" className="underline">View public page</a>
      {dirty && <span className="text-sm">Unsaved changes</span>}
    </div>
    {error && <p role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-red-800">{error}</p>}
    <p role="status">{message}</p>
    <fieldset disabled={busy} className="space-y-4">{Object.entries(settings).map(([key, value]) => <details key={key} className="rounded-xl border bg-white p-5"><summary className="cursor-pointer text-lg font-semibold">{title(key)}</summary><div className="mt-5"><Fields value={value as Value} path={[key]} onChange={update} /></div></details>)}</fieldset>
  </div>
}
