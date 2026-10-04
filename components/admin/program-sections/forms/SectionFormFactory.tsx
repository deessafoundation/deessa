"use client"

import type { ProgramCategory, ProgramSection } from "@/lib/programs/content"
import { RichTextSectionForm } from "./RichTextSectionForm"
import { StatsSectionForm } from "./StatsSectionForm"
import { GallerySectionForm } from "./GallerySectionForm"
import { FeaturesSectionForm } from "./FeaturesSectionForm"
import { StepsSectionForm } from "./StepsSectionForm"
import { QuoteSectionForm } from "./QuoteSectionForm"
import { FAQSectionForm } from "../../programs/sections/forms/faq-section-form"
import { ProgressTrackerSectionForm } from "./ProgressTrackerSectionForm"
import { CTASectionForm } from "../../programs/sections/forms/cta-section-form"
import { ActivitiesSectionForm } from "../../programs/sections/forms/activities-section-form"
import { ResourcesSectionForm } from "./ResourcesSectionForm"
import { WhoWeSupportSectionForm } from "./WhoWeSupportSectionForm"
import { FactsBarSectionForm } from "../../programs/sections/forms/facts-bar-section-form"
import { StorySectionForm } from "./StorySectionForm"

interface SectionFormFactoryProps {
  templateMode?: boolean
  category?: ProgramCategory
  section: ProgramSection
  onChange: (content: ProgramSection["content"]) => void
}

export function SectionFormFactory({ section, onChange, templateMode = false, category }: SectionFormFactoryProps) {
  const { content } = section

  switch (content.type) {
    case "rich_text":
      return <RichTextSectionForm content={content} onChange={onChange} />
    case "stats":
      return <StatsSectionForm hideAttribution={templateMode && section.presentation === "ribbon"} content={content} onChange={onChange} />
    case "gallery":
      return <GallerySectionForm fixedLayout={templateMode} content={content} onChange={onChange} />
    case "features":
      return <FeaturesSectionForm fixedLayout={templateMode} hideIcon={templateMode && category === "research"} hideNumber={templateMode && category === "campaign"} content={content} onChange={onChange} />
    case "how_it_works":
    case "timeline":
      return <StepsSectionForm content={content} onChange={onChange} />
    case "quote":
      return <QuoteSectionForm hideImage={templateMode && category === "outreach"} content={content} onChange={onChange} />
    case "faq":
      return <FAQSectionForm content={content} onChange={onChange} />
    case "progress_tracker":
      return <ProgressTrackerSectionForm content={content} onChange={onChange} />
    case "cta":
      return <CTASectionForm fixedLayout={templateMode} participationCards={category === "campaign"} content={content} onChange={onChange} />
    case "activities":
      return <ActivitiesSectionForm content={content} onChange={onChange} />
    case "resources":
      return <ResourcesSectionForm content={content} onChange={onChange} />
    case "who_we_support":
      return <WhoWeSupportSectionForm content={content} onChange={onChange} />
    case "facts_bar":
      return <FactsBarSectionForm content={content} onChange={onChange} />
    case "story":
      return <StorySectionForm content={content} onChange={onChange} />
    case "built_in_demo":
      return <div className="space-y-3">
        <p className="text-sm">Interactive communication board, using the Research demo design.</p>
        <label className="block text-sm">Checklist (one item per line)
          <textarea className="w-full rounded border p-2" rows={5} value={content.checklist?.join("\n") || ""} onChange={event => onChange({ ...content, checklist: event.target.value.split("\n").slice(0, 8) })} />
        </label>
        <label className="block text-sm">Concept disclaimer
          <textarea className="w-full rounded border p-2" maxLength={300} value={content.footnote || ""} onChange={event => onChange({ ...content, footnote: event.target.value })} />
        </label>
      </div>
    default:
      return (
        <div className="text-xs text-muted-foreground">
          Editor not implemented for this section type.
        </div>
      )
  }
}
