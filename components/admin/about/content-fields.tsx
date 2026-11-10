"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Image as ImageIcon } from "lucide-react"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { cn } from "@/lib/utils"

export function aboutFieldId(path: string) { 
  return `about-${path.replace(/\./g, "-")}` 
}

export function ContentField({ 
  path, 
  label, 
  value, 
  onChange, 
  multiline = false, 
  error, 
  help, 
  type = "text" 
}: {
  path: string
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  error?: string
  help?: string
  type?: "text" | "color"
}) {
  const id = aboutFieldId(path)
  const props = {
    id,
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    "aria-invalid": !!error,
    "aria-describedby": [error ? `${id}-error` : "", help ? `${id}-help` : ""].filter(Boolean).join(" ") || undefined,
    maxLength: 10000,
  }

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
      {multiline ? (
        <Textarea {...props} rows={3} className="min-h-[100px] text-sm resize-y leading-relaxed p-3" />
      ) : (
        <Input {...props} type={type} className="h-11 sm:h-10 text-sm" />
      )}
      {help && <p id={`${id}-help`} className="text-xs text-muted-foreground">{help}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

export function ImageField({
  path,
  label,
  value,
  onChange,
  error,
  help,
  bucket = "site-assets",
}: {
  path: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  help?: string
  bucket?: string
}) {
  const [open, setOpen] = useState(false)
  const id = aboutFieldId(path)

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-9 px-3 text-xs sm:text-sm font-medium"
        >
          <ImageIcon className="mr-1.5 size-4 text-primary" />
          Browse Media
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or choose from media"
          className="h-11 sm:h-10 text-sm font-mono"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="h-11 sm:h-10 px-3 text-destructive hover:bg-destructive/10 text-sm font-medium shrink-0"
            title="Clear image"
          >
            Clear
          </Button>
        )}
      </div>

      {value && (
        <div className="relative h-24 w-36 rounded-lg border overflow-hidden bg-muted shadow-xs">
          <img src={value} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      {help && <p id={`${id}-help`} className="text-xs text-muted-foreground">{help}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">{error}</p>}

      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        onSelect={(url) => {
          onChange(url)
          setOpen(false)
        }}
        bucket={bucket}
        title={`Select ${label}`}
      />
    </div>
  )
}

const BRAND_PRESET_COLORS = [
  { name: "Brand Blue", hex: "#1D4ED8" },
  { name: "Sky Turquoise", hex: "#0284C7" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Warm Amber", hex: "#D97706" },
  { name: "Vibrant Purple", hex: "#7C3AED" },
  { name: "Coral Rose", hex: "#E11D48" },
  { name: "Slate Charcoal", hex: "#334155" },
]

export function ColorField({
  path,
  label,
  value,
  onChange,
  error,
  help,
}: {
  path: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  help?: string
}) {
  const id = aboutFieldId(path)

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Preset color swatches */}
        <div className="flex flex-wrap items-center gap-2">
          {BRAND_PRESET_COLORS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => onChange(preset.hex)}
              className={cn(
                "size-7 sm:size-8 rounded-full border border-black/20 dark:border-white/20 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                value.toLowerCase() === preset.hex.toLowerCase() && "ring-2 ring-primary ring-offset-2 scale-110"
              )}
              style={{ backgroundColor: preset.hex }}
              title={`${preset.name} (${preset.hex})`}
              aria-label={`Select ${preset.name}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Native color picker */}
          <input
            type="color"
            value={value.startsWith("#") && value.length === 7 ? value : "#1D4ED8"}
            onChange={(e) => onChange(e.target.value)}
            className="size-10 cursor-pointer rounded-lg border border-input p-1 bg-background shrink-0"
            title="Custom color picker"
          />
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#1D4ED8"
            maxLength={7}
            className="w-28 h-10 text-sm font-mono"
          />
        </div>
      </div>

      {help && <p id={`${id}-help`} className="text-xs text-muted-foreground">{help}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

export function TextListEditor({ 
  path, 
  label, 
  values, 
  onChange, 
  errors, 
  onRemove 
}: {
  path: string
  label: string
  values: string[]
  onChange: (values: string[]) => void
  errors: Record<string, string>
  onRemove?: (index: number) => void
}) {
  const [newIndex, setNewIndex] = useState<number | null>(null)

  return (
    <fieldset className="min-w-0 space-y-3">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-semibold text-foreground">{label}</legend>
        <span className="text-xs text-muted-foreground">{values.length} item{values.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-2.5">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2 p-2.5 rounded-xl border bg-card/40">
            <div className="min-w-0 flex-1">
              <ContentField 
                path={`${path}.${index}`} 
                label={`${label} ${index + 1}`} 
                value={value}
                multiline={path === "intro.paragraphs"} 
                error={errors[`${path}.${index}`]}
                onChange={(text) => onChange(values.map((item, itemIndex) => itemIndex === index ? text : item))} 
              />
            </div>
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="size-10 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`} 
              onClick={() => onRemove ? onRemove(index) : onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      {errors[path] && <p role="alert" className="text-xs font-medium text-destructive">{errors[path]}</p>}

      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        className="h-10 px-4 text-sm font-medium" 
        disabled={values.length >= 100}
        onClick={() => { 
          setNewIndex(values.length)
          onChange([...values, ""])
          requestAnimationFrame(() => document.getElementById(aboutFieldId(`${path}.${values.length}`))?.focus()) 
        }}
      >
        <Plus className="size-4 mr-1.5" aria-hidden="true" /> Add {label.toLowerCase()}
      </Button>
      {newIndex !== null && <span className="sr-only" role="status">A new {label.toLowerCase()} input was added.</span>}
    </fieldset>
  )
}
