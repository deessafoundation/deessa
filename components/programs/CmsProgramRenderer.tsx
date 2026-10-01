import type { ProgramDocument } from "@/lib/programs/content"
import { normalizeDocument } from "@/lib/programs/normalize"
import type { RelatedProgramCard } from "@/lib/programs/data"
import { CampaignTemplate, ServiceTemplate, OutreachTemplate, ResearchTemplate } from "./templates"
import { RelatedProgramsSection } from './sections/RelatedProgramsSection'
import { readEditorHero } from '@/lib/programs/editor-hero'

interface CmsProgramRendererProps {
  document: ProgramDocument
  relatedPrograms?: RelatedProgramCard[]
}

export function CmsProgramRenderer({ document, relatedPrograms }: CmsProgramRendererProps) {
  document = { ...document, hero: readEditorHero(document.hero, document.title, document.shortDescription) }
  const program = normalizeDocument(document)
  if (relatedPrograms && relatedPrograms.length > 0) {
    program.relatedPrograms = relatedPrograms
  }
  switch (document.category) {
    case "campaign":
      return <><CampaignTemplate document={document} />{relatedPrograms?.length ? <RelatedProgramsSection programs={relatedPrograms} /> : null}</>
    case "outreach":
      return <><OutreachTemplate document={document} />{relatedPrograms?.length ? <RelatedProgramsSection programs={relatedPrograms} /> : null}</>
    case "research":
      return <><ResearchTemplate document={document} />{relatedPrograms?.length ? <RelatedProgramsSection programs={relatedPrograms} /> : null}</>
    default:
      return <ServiceTemplate program={program} />
  }
}
