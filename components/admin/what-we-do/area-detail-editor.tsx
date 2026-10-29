"use client"

import type { ReactNode } from "react"
import { ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isWhatWeDoAreaPaused } from "@/lib/data/what-we-do-availability"
import type { WhatWeDoAreaId } from "@/lib/data/what-we-do-areas"
import type { WhatWeDoSettings } from "@/lib/types/what-we-do-settings"
import { cn } from "@/lib/utils"
import styles from "./what-we-do-manager.module.css"

const areas = [
  { id: "advocacy", label: "Advocacy" },
  { id: "awareness", label: "Awareness" },
  { id: "training", label: "Training" },
  { id: "resources", label: "Resources" },
] as const

export const AREA_DETAIL_GROUPS = [
  { id: "overview", label: "Page introduction", description: "Area name, headline, and introductory copy.", keys: ["label", "headline", "subtitle"] },
  { id: "video", label: "Video & poster", description: "Video source, cover image, and player labels.", keys: ["videoSrc", "posterSrc", "videoLabel", "playButtonLabel"] },
  { id: "purpose", label: "Purpose & highlights", description: "Explain the work and its main priorities.", keys: ["panelTitle", "description", "highlights"] },
  { id: "learning", label: "Learning & activities", description: "Section heading and the three learning items.", keys: ["learningTitle", "learningItems"] },
  { id: "audience", label: "Who this is for", description: "Audience heading, description, and list.", keys: ["audienceTitle", "audienceDescription", "audiences"] },
  { id: "actions", label: "Calls to action", description: "Introductory link and closing section with its action.", keys: ["ctaLabel", "ctaHref", "closingTitle", "closingDescription", "closingButtonLabel", "closingButtonHref"] },
] as const

export function AreaDetailEditor({ settings, selectedArea, onAreaChange, openSection, onSectionChange, errors, disabled, renderFields }: {
  settings: WhatWeDoSettings
  selectedArea: WhatWeDoAreaId
  onAreaChange: (area: WhatWeDoAreaId) => void
  openSection: string
  onSectionChange: (section: string) => void
  errors: Record<string, string>
  disabled: boolean
  renderFields: (value: unknown, path: string[]) => ReactNode
}) {
  const area = settings.areas[selectedArea]
  const paused = isWhatWeDoAreaPaused(selectedArea)
  const label = areas.find(entry => entry.id === selectedArea)?.label
  const modules = selectedArea === "advocacy" ? [
    { key: "animatedStory", label: "Animated story", description: "Video and conversation prompts. Display depends on media availability and duplicate-video checks." },
    { key: "inclusiveSchool", label: "Inclusive schools", description: "Image and message about belonging at school." },
  ] as const : selectedArea === "training" ? [
    { key: "inclusiveLearning", label: "Inclusive learning", description: "Saved Training module. It remains unpublished while the destination is coming soon." },
  ] as const : []
  const hasError = (prefix: string) => Object.keys(errors).some(path => path === prefix || path.startsWith(`${prefix}.`))

  return <div className="min-w-0 space-y-6">
    <Tabs value={selectedArea} className="min-w-0 gap-6" onValueChange={value => {
      const next = areas.find(entry => entry.id === value)
      if (next) onAreaChange(next.id)
    }}>
      <Card className="min-w-0">
        <CardContent className="overflow-x-auto p-4">
          <TabsList aria-label="Choose an area detail page" className={cn(styles.track, "flex h-auto w-full min-w-max gap-1 rounded-xl p-1")}>
            {areas.map(entry => <TabsTrigger key={entry.id} value={entry.id} className={cn(styles.tab, "h-auto gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap")} onFocus={event => event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })}>
              {entry.label}
              {(hasError(`areas.${entry.id}`) || (entry.id === "advocacy" && (hasError("animatedStory") || hasError("inclusiveSchool"))) || (entry.id === "training" && hasError("inclusiveLearning"))) && <span className="sr-only"> (needs attention)</span>}
            </TabsTrigger>)}
          </TabsList>
        </CardContent>
      </Card>
    <TabsContent value={selectedArea} className="min-w-0">
    <Card className="min-w-0">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3"><CardTitle><h2 className="text-xl">{label}</h2></CardTitle><Badge variant="outline">{paused ? "Coming soon" : "Live"}</Badge></div>
          <Button asChild variant="outline" size="sm"><a href={`/whatwedo/${selectedArea}`} target="_blank" rel="noopener noreferrer">View page<ExternalLink aria-hidden="true" className="size-4" /><span className="sr-only"> (opens in a new tab)</span></a></Button>
        </div>
        <CardDescription>{paused ? "The public destination currently shows a coming-soon page. Full-page copy is preserved here; saving does not activate the destination." : "Edit the live Advocacy page. Open the content group you want to change."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible value={openSection} onValueChange={onSectionChange}>
          {AREA_DETAIL_GROUPS.map(group => <AccordionItem key={group.id} value={group.id}>
            <AccordionTrigger className="py-5">
              <span className="space-y-1"><span className="block font-semibold">{group.label}{group.keys.some(key => hasError(`areas.${selectedArea}.${key}`)) && <span className="ml-2 text-destructive">Needs attention</span>}</span><span className="block font-normal leading-relaxed text-muted-foreground">{group.description}</span></span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              {group.id === "overview" && paused && <p className="mb-5 text-sm leading-relaxed text-muted-foreground">Area name and introduction affect page metadata and fallback copy. The introduction also describes this area's video in the live Advocacy gallery.</p>}
              {group.id === "video" && <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{paused ? "This area's video, poster, video label, and introductory copy also feed the live Advocacy gallery. Changes can affect Advocacy even while this destination is coming soon." : "This is Advocacy's lead video. The gallery also uses videos saved under the other three areas."}</p>}
              <fieldset disabled={disabled} className="min-w-0">{renderFields(Object.fromEntries(group.keys.map(key => [key, area[key]])), ["areas", selectedArea])}</fieldset>
            </AccordionContent>
          </AccordionItem>)}
          {modules.map(module => <AccordionItem key={module.key} value={module.key}>
            <AccordionTrigger className="py-5">
              <span className="space-y-1"><span className="block font-semibold">{module.label}{hasError(module.key) && <span className="ml-2 text-destructive">Needs attention</span>}</span><span className="block font-normal leading-relaxed text-muted-foreground">{module.description}</span></span>
            </AccordionTrigger>
            <AccordionContent className="pb-6"><fieldset disabled={disabled} className="min-w-0">{renderFields(settings[module.key], [module.key])}</fieldset></AccordionContent>
          </AccordionItem>)}
        </Accordion>
      </CardContent>
    </Card>
    </TabsContent>
    </Tabs>
  </div>
}
