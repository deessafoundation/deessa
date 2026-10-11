"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MAX_WHAT_WE_DO_CARDS, PILLAR_ACCENTS, PILLAR_ARROW_NAMES, PILLAR_ICON_NAMES, type WhatWeDoCard, type PillarLayout } from "@/lib/types/what-we-do-settings"
import { PILLAR_ICONS } from "@/components/what-we-do/pillar-icons"
import { WhatWeDoPillars } from "@/components/what-we-do/whatwedo-pillars"
import { cn } from "@/lib/utils"

export function CardsEditor({ cards, layout, errors, onChange, onLayoutChange, disabled }: { cards: WhatWeDoCard[]; layout: PillarLayout; errors: Record<string, string>; onChange: (cards: WhatWeDoCard[]) => void; onLayoutChange: (layout: PillarLayout) => void; disabled: boolean }) {
  const [selected, setSelected] = useState(cards[0]?.slug || "")
  const index = Math.max(0, cards.findIndex(card => card.slug === selected))
  const card = cards[index]
  function update(patch: Partial<WhatWeDoCard>) {
    onChange(cards.map((entry, position) => position === index ? { ...entry, ...patch } : entry))
  }
  function move(offset: number) {
    const next = [...cards]
    next.splice(index + offset, 0, next.splice(index, 1)[0])
    setSelected(card.slug)
    onChange(next)
  }
  function add() {
    const slug = `card-${crypto.randomUUID()}`
    onChange([...cards, { slug, title: "New area of work", tag: "Community", description: "Describe this area of your work.", buttonLabel: "Explore this area", href: "/whatwedo", icon: "users", accent: "sky", arrow: "arrow-right", enabled: false, showIcon: true, showArrow: true, showDecoration: true }])
    setSelected(slug)
  }
  return <div className="space-y-6">
    <p className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">Temporary rollout: Advocacy appears first. Awareness, Training, and Resources open coming-soon pages for now; their saved content is preserved.</p>
    <fieldset disabled={disabled} className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">
      <div className="space-y-2"><label id="card-columns-label" className="text-sm font-medium">Desktop columns</label><Select value={layout.columns} disabled={disabled} onValueChange={columns => onLayoutChange({ ...layout, columns: columns as PillarLayout["columns"] })}><SelectTrigger aria-labelledby="card-columns-label" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{(["1", "2", "3", "4"] as const).map(value => <SelectItem key={value} value={value}>{value} {value === "1" ? "column" : "columns"}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><label id="card-spacing-label" className="text-sm font-medium">Card spacing</label><Select value={layout.spacing} disabled={disabled} onValueChange={spacing => onLayoutChange({ ...layout, spacing: spacing as PillarLayout["spacing"] })}><SelectTrigger aria-labelledby="card-spacing-label" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="comfortable">Comfortable</SelectItem><SelectItem value="compact">Compact</SelectItem></SelectContent></Select></div>
      <p className="text-xs text-muted-foreground sm:col-span-2">The grid adapts to smaller screens automatically.</p>
    </fieldset>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{cards.filter(entry => entry.enabled).length} visible · {cards.length} total · Up to {MAX_WHAT_WE_DO_CARDS} cards</p>
      <Button variant="outline" onClick={add} disabled={disabled || cards.length >= MAX_WHAT_WE_DO_CARDS}><Plus aria-hidden="true" className="size-4" />Add card</Button>
    </div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a card to edit">
      {cards.map((entry, position) => {
        const Icon = PILLAR_ICONS[entry.icon]
        const hasError = Object.keys(errors).some(path => path.startsWith(`cards.${position}.`))
        return <Button key={entry.slug} variant={position === index ? "secondary" : "outline"} aria-pressed={position === index} disabled={disabled} onClick={() => setSelected(entry.slug)} className="h-auto min-h-11 max-w-full whitespace-normal text-left">
          <Icon aria-hidden="true" className="size-4 shrink-0" /><span>{entry.title || "Untitled card"}</span>{!entry.enabled && <span className="text-xs">(Hidden)</span>}
          {hasError && <span className="text-xs text-destructive">(Needs attention)</span>}
        </Button>
      })}
    </div>
    {!card ? <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No cards yet. Add a card to introduce an area of work.</div> : <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <fieldset disabled={disabled} className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
          <label className="flex items-center gap-3 text-sm font-medium"><Switch checked={card.enabled} onCheckedChange={enabled => update({ enabled })} />Visible on the public page</label>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" aria-label="Move card earlier" disabled={disabled || index === 0} onClick={() => move(-1)}><ArrowUp className="size-4" /></Button>
            <Button size="icon" variant="ghost" aria-label="Move card later" disabled={disabled || index === cards.length - 1} onClick={() => move(1)}><ArrowDown className="size-4" /></Button>
            <Button size="icon" variant="ghost" aria-label={`Remove ${card.title}`} disabled={disabled} onClick={() => { if (window.confirm(`Remove “${card.title}”? This takes effect when you save.`)) onChange(cards.filter((_, position) => position !== index)) }}><Trash2 className="size-4 text-destructive" /></Button>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {([['title', 'Title'], ['tag', 'Badge text'], ['buttonLabel', 'Link label'], ['href', 'Destination URL']] as const).map(([key, label]) => <div key={key} className="space-y-2">
            <label htmlFor={`card-${key}`} className="text-sm font-medium">{label}</label><Input id={`card-${key}`} value={card[key]} aria-required={key !== "tag"} aria-invalid={!!errors[`cards.${index}.${key}`]} aria-describedby={errors[`cards.${index}.${key}`] ? `card-${key}-error` : undefined} onChange={event => update({ [key]: event.target.value })} />
            {errors[`cards.${index}.${key}`] && <p id={`card-${key}-error`} className="text-sm text-destructive">{errors[`cards.${index}.${key}`]}</p>}
            {key === "tag" && <p className="text-xs text-muted-foreground">Leave empty to hide the badge.</p>}
            {key === "href" && <p className="text-xs text-muted-foreground">Link to an existing page, an anchor, or an HTTPS address.</p>}
          </div>)}
        </div>
        <div className="space-y-2"><label htmlFor="card-description" className="text-sm font-medium">Description</label><Textarea id="card-description" rows={4} aria-required="true" aria-invalid={!!errors[`cards.${index}.description`]} aria-describedby={errors[`cards.${index}.description`] ? "card-description-error" : undefined} value={card.description} onChange={event => update({ description: event.target.value })} />{errors[`cards.${index}.description`] && <p id="card-description-error" className="text-sm text-destructive">{errors[`cards.${index}.description`]}</p>}</div>
        <div className="space-y-4 border-t pt-6"><h3 className="font-semibold">Appearance</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {([['icon', 'Icon', PILLAR_ICON_NAMES], ['accent', 'Color theme', PILLAR_ACCENTS], ['arrow', 'Link arrow', PILLAR_ARROW_NAMES]] as const).map(([key, label, options]) => <div key={key} className="space-y-2">
              <label id={`card-${key}-label`} className="text-sm font-medium">{label}</label>
              <Select value={card[key]} disabled={disabled} onValueChange={value => update({ [key]: value })}><SelectTrigger aria-labelledby={`card-${key}-label`} className="w-full"><SelectValue /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option.replaceAll("-", " ")}</SelectItem>)}</SelectContent></Select>
            </div>)}
          </div>
          <div className="flex flex-wrap gap-6">{([['showIcon', 'Show icon'], ['showArrow', 'Show link arrow'], ['showDecoration', 'Show corner decoration']] as const).map(([key, label]) => <label key={key} className="flex items-center gap-3 text-sm"><Switch checked={card[key]} disabled={disabled} onCheckedChange={value => update({ [key]: value })} />{label}</label>)}</div>
        </div>
      </fieldset>
      <aside className="space-y-3 xl:sticky xl:top-28" aria-label="Card preview">
        <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Live preview</h3><span className={cn("rounded-full bg-muted px-2.5 py-1 text-xs", !card.enabled && "text-muted-foreground")}>{card.enabled ? "Visible" : "Hidden"}</span></div>
        <div inert><WhatWeDoPillars cards={[card]} preview /></div>
        <p className="text-xs leading-relaxed text-muted-foreground">Changes appear here immediately. Save to publish. Adding a card does not create a new destination page.</p>
      </aside>
    </div>}
  </div>
}
