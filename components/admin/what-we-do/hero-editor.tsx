"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { isSafeContentUrl, type WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import { cn } from "@/lib/utils"

type Hero = WhatWeDoSettings["hero"]
type HeroTextKey = Exclude<keyof Hero, "photos">

const photoPositions = [
  { label: "Main photo", description: "The wide photo, also used as the Hero background.", crop: "object-[50%_35%]", caption: "Learning together" },
  { label: "Lower-left photo", description: "The small photo on the left.", crop: "object-[48%_55%]", caption: "Growing in confidence" },
  { label: "Lower-right photo", description: "The small photo on the right.", crop: "object-[40%_30%]", caption: "Making voices heard" },
] as const

function PhotoPreview({ src, index }: { src: string; index: number }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const canPreview = isSafeContentUrl(src) && !src.startsWith("#")
  const position = photoPositions[index]

  return <figure className="min-w-0 space-y-2">
    <div className={cn("overflow-hidden rounded-lg border bg-muted", index === 0 ? "aspect-video" : "aspect-[4/3]")}>
      {canPreview && failedSrc !== src
        ? <img key={src} src={src} alt="" width={640} height={index === 0 ? 360 : 480} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} className={cn("h-full w-full object-cover", position.crop)} />
        : <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
          <ImageIcon aria-hidden="true" className="size-6" />
          <p>{canPreview ? "Image unavailable. Check the URL or choose another image." : "Enter a valid image URL to preview."}</p>
        </div>}
    </div>
    <figcaption className="text-sm text-muted-foreground">Public caption: {position.caption}</figcaption>
  </figure>
}

export function HeroEditor({ hero, errors, disabled, onChange }: {
  hero: Hero
  errors: Record<string, string>
  disabled: boolean
  onChange: (path: string[], value: string) => void
}) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)
  const pickerButtons = useRef<Array<HTMLButtonElement | null>>([])

  function closePicker() {
    const index = pickerIndex
    setPickerIndex(null)
    if (index !== null) requestAnimationFrame(() => pickerButtons.current[index]?.focus({ preventScroll: true }))
  }

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

  const textField = (key: HeroTextKey, label: string, hint?: string, multiline = false) => field(["hero", key], hero[key], label, hint, multiline)

  return <>
    <fieldset disabled={disabled} className="min-w-0 space-y-8">
      <legend className="sr-only">Hero content</legend>
      <section className="space-y-4" aria-labelledby="hero-headline-heading">
        <div><h3 id="hero-headline-heading" className="text-lg font-semibold">Headline</h3><p className="mt-1 text-sm text-muted-foreground">The first two fields share a line. The next two appear on their own lines.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          {textField("headingStart", "First line · beginning")}
          {textField("headingEmphasis", "First line · ending")}
          {textField("headingEnd", "Second line")}
          {textField("headingAccent", "Highlighted line")}
        </div>
        <div className="grid gap-5 border-t pt-4 sm:grid-cols-2">
          {textField("breadcrumb", "Breadcrumb label", "Appears after Home in the page breadcrumb.")}
          {textField("eyebrow", "Label above the headline")}
        </div>
      </section>

      <section className="space-y-4 border-t pt-6" aria-labelledby="hero-copy-heading">
        <h3 id="hero-copy-heading" className="text-lg font-semibold">Supporting copy</h3>
        {textField("description", "Introduction", "The paragraph below the headline.", true)}
      </section>

      <section className="space-y-4 border-t pt-6" aria-labelledby="hero-buttons-heading">
        <div><h3 id="hero-buttons-heading" className="text-lg font-semibold">Buttons</h3><p className="mt-1 text-sm text-muted-foreground">Use a page path, an anchor such as #programs, or a secure HTTPS URL.</p></div>
        <div className="grid gap-6 lg:grid-cols-2">
          <fieldset className="min-w-0 space-y-4">
            <legend className="mb-3 text-sm font-semibold">Primary button</legend>
            {textField("primaryLabel", "Primary button text")}
            {textField("primaryHref", "Primary button URL")}
          </fieldset>
          <fieldset className="min-w-0 space-y-4">
            <legend className="mb-3 text-sm font-semibold">Secondary button</legend>
            {textField("secondaryLabel", "Secondary button text")}
            {textField("secondaryHref", "Secondary button URL")}
          </fieldset>
        </div>
      </section>

      <section className="space-y-6 border-t pt-6" aria-labelledby="hero-photos-heading">
        <div><h3 id="hero-photos-heading" className="text-lg font-semibold">Photos</h3><p className="mt-1 text-sm text-muted-foreground">Three fixed positions. Choose an image, then describe it for visitors using screen readers.</p></div>
        {hero.photos.map((photo, index) => <fieldset key={index} className={cn("min-w-0", index > 0 && "border-t pt-5")}>
          <legend className="mb-2 text-base font-semibold">{photoPositions[index].label}</legend>
          <p className="mb-4 text-sm text-muted-foreground">{photoPositions[index].description}</p>
          <div className="grid min-w-0 gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
            <PhotoPreview src={photo.src} index={index} />
            <div className="min-w-0 space-y-4">
              <div className="space-y-3">
                {field(["hero", "photos", String(index), "src"], photo.src, `${photoPositions[index].label} URL`)}
                <Button ref={button => { pickerButtons.current[index] = button }} type="button" variant="outline" onClick={() => setPickerIndex(index)}>Choose image<span className="sr-only"> for {photoPositions[index].label.toLowerCase()}</span></Button>
              </div>
              {field(["hero", "photos", String(index), "alt"], photo.alt, `${photoPositions[index].label} alt text`, "Describe what matters in the image. The public caption is separate from this description.")}
            </div>
          </div>
        </fieldset>)}
      </section>
    </fieldset>
    {pickerIndex !== null && <MediaPicker open onOpenChange={open => { if (!open) closePicker() }} onSelect={url => { onChange(["hero", "photos", String(pickerIndex), "src"], url); closePicker() }} currentUrl={hero.photos[pickerIndex].src} mediaType="image" accept="image/*" bucket="hero-images" maxSizeMB={10} title={`Choose ${photoPositions[pickerIndex].label.toLowerCase()}`} />}
  </>
}
