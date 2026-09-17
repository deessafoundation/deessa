"use client"

import type { ProgramSection } from "@/lib/programs/content"
import { RichTextSectionForm } from "./RichTextSectionForm"
import { StatsSectionForm } from "./StatsSectionForm"
import { GallerySectionForm } from "./GallerySectionForm"
import { FeaturesSectionForm } from "./FeaturesSectionForm"
import { StepsSectionForm } from "./StepsSectionForm"
import { QuoteSectionForm } from "./QuoteSectionForm"
import { FAQSectionForm } from "./FAQSectionForm"
import { ProgressTrackerSectionForm } from "./ProgressTrackerSectionForm"
import { CTASectionForm } from "./CTASectionForm"
import { ActivitiesSectionForm } from "./ActivitiesSectionForm"
import { ResourcesSectionForm } from "./ResourcesSectionForm"
import { WhoWeSupportSectionForm } from "./WhoWeSupportSectionForm"
import { FactsBarSectionForm } from "./FactsBarSectionForm"
import { StorySectionForm } from "./StorySectionForm"

interface SectionFormFactoryProps {
  section: ProgramSection
  onChange: (content: ProgramSection["content"]) => void
}

export function SectionFormFactory({ section, onChange }: SectionFormFactoryProps) {
  const { content } = section

  switch (content.type) {
    case "rich_text":
      return <RichTextSectionForm content={content} onChange={onChange} />
    case "stats":
      return <StatsSectionForm content={content} onChange={onChange} />
    case "gallery":
      return <GallerySectionForm content={content} onChange={onChange} />
    case "features":
      return <FeaturesSectionForm content={content} onChange={onChange} />
    case "how_it_works":
    case "timeline":
      return <StepsSectionForm content={content} onChange={onChange} />
    case "quote":
      return <QuoteSectionForm content={content} onChange={onChange} />
    case "faq":
      return <FAQSectionForm content={content} onChange={onChange} />
    case "progress_tracker":
      return <ProgressTrackerSectionForm content={content} onChange={onChange} />
    case "cta":
      return <CTASectionForm content={content} onChange={onChange} />
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
    default:
      return (
        <div className="text-xs text-muted-foreground">
          Editor not implemented for this section type.
        </div>
      )
  }
}
