"use client"

import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { WhatWeDoSettings } from "@/lib/types/what-we-do-settings"

const actionLabels = ["Donation", "Partnership", "Volunteering"] as const

export function SupportEditor({ support, selectedAction, onSelect, errors, disabled, onChange }: {
  support: WhatWeDoSettings["support"]
  selectedAction: number
  onSelect: (index: number) => void
  errors: Record<string, string>
  disabled: boolean
  onChange: (path: string[], value: string) => void
}) {
  const action = support.actions[selectedAction]
  const actionPath = ["support", "actions", String(selectedAction)]

  function field(path: string[], value: string, label: string, hint?: string, multiline = false) {
    const id = `content-${path.join("-")}`
    const error = errors[path.join(".")]
    const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined
    const props = { id, value, "aria-required": true as const, "aria-invalid": !!error, "aria-describedby": describedBy, onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(path, event.target.value) }

    return <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      {multiline ? <Textarea {...props} rows={4} /> : <Input {...props} />}
      {hint && <p id={`${id}-hint`} className="text-sm leading-relaxed text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-sm text-destructive">{error}</p>}
    </div>
  }

  return <fieldset disabled={disabled} className="min-w-0 space-y-8">
    <legend className="sr-only">Ways to Help content</legend>
    <section className="space-y-4" aria-labelledby="support-introduction-heading">
      <div><h3 id="support-introduction-heading" className="text-lg font-semibold">Section introduction</h3><p className="mt-1 text-sm text-muted-foreground">The heading and copy above the three action cards.</p></div>
      {field(["support", "label"], support.label, "Section label", "The small label above the heading.")}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(["support", "title"], support.title, "Heading beginning")}
        {field(["support", "titleAccent"], support.titleAccent, "Highlighted heading text")}
      </div>
      {field(["support", "description"], support.description, "Introduction", undefined, true)}
    </section>

    <section className="space-y-5 border-t pt-6" aria-labelledby="support-actions-heading">
      <div><h3 id="support-actions-heading" className="text-lg font-semibold">Ways people can help</h3><p className="mt-1 text-sm text-muted-foreground">Choose an action to edit its message and link.</p></div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a help action to edit">
        {support.actions.map((_, index) => {
          const hasError = Object.keys(errors).some(path => path.startsWith(`support.actions.${index}.`))
          return <Button key={index} type="button" variant={index === selectedAction ? "secondary" : "outline"} className="h-auto min-h-11 max-w-full whitespace-normal" aria-pressed={index === selectedAction} disabled={disabled} onClick={() => onSelect(index)}>
            {actionLabels[index]}{hasError && <span className="text-xs text-destructive">(Needs attention)</span>}
          </Button>
        })}
      </div>
      <fieldset className="min-w-0 space-y-5">
        <legend className="mb-4 text-base font-semibold">{actionLabels[selectedAction]} action</legend>
        {field([...actionPath, "title"], action.title, "Action title")}
        {field([...actionPath, "description"], action.description, "Action description", undefined, true)}
        <div className="grid gap-5 sm:grid-cols-2">
          {field([...actionPath, "cta"], action.cta, "Button text")}
          {field([...actionPath, "href"], action.href, "Destination URL", "Use a page path, an anchor, or a secure HTTPS URL.")}
        </div>
      </fieldset>
    </section>
  </fieldset>
}
