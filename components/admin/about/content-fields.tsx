"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export function aboutFieldId(path: string) { return `about-${path.replace(/\./g, "-")}` }

export function ContentField({ path, label, value, onChange, multiline = false, error, help, type = "text" }: {
  path: string; label: string; value: string; onChange: (value: string) => void
  multiline?: boolean; error?: string; help?: string; type?: "text" | "color"
}) {
  const id = aboutFieldId(path)
  const props = {
    id, value, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    "aria-invalid": !!error, "aria-describedby": [error ? `${id}-error` : "", help ? `${id}-help` : ""].filter(Boolean).join(" ") || undefined,
    maxLength: 10000,
  }
  return <div className="min-w-0 space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {multiline ? <Textarea {...props} rows={3} /> : <Input {...props} type={type} className="min-h-11" />}
    {help && <p id={`${id}-help`} className="text-sm text-muted-foreground">{help}</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
  </div>
}

export function TextListEditor({ path, label, values, onChange, errors, onRemove }: {
  path: string; label: string; values: string[]; onChange: (values: string[]) => void; errors: Record<string, string>
  onRemove?: (index: number) => void
}) {
  const [newIndex, setNewIndex] = useState<number | null>(null)
  return <fieldset className="min-w-0 space-y-3">
    <legend className="mb-2 text-sm font-medium">{label}</legend>
    {values.map((value, index) => <div key={index} className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <ContentField path={`${path}.${index}`} label={`${label} ${index + 1}`} value={value}
          multiline={path === "intro.paragraphs"} error={errors[`${path}.${index}`]}
          onChange={(text) => onChange(values.map((item, itemIndex) => itemIndex === index ? text : item))} />
      </div>
      <Button type="button" size="icon" variant="ghost" className="mt-6 size-11 shrink-0 text-destructive"
        aria-label={`Remove ${label.toLowerCase()} ${index + 1}`} onClick={() => onRemove ? onRemove(index) : onChange(values.filter((_, itemIndex) => itemIndex !== index))}>
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </div>)}
    {errors[path] && <p role="alert" className="text-sm text-destructive">{errors[path]}</p>}
    <Button type="button" variant="outline" className="min-h-11" disabled={values.length >= 100}
      onClick={() => { setNewIndex(values.length); onChange([...values, ""]); requestAnimationFrame(() => document.getElementById(aboutFieldId(`${path}.${values.length}`))?.focus()) }}>
      <Plus className="size-4" aria-hidden="true" /> Add {label.toLowerCase()}
    </Button>
    {newIndex !== null && <span className="sr-only" role="status">A new {label.toLowerCase()} input was added.</span>}
  </fieldset>
}
