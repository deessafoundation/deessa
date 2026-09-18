import type { ProgramDocument } from "@/lib/programs/content"
import { normalizeDocument } from "@/lib/programs/normalize"
import type { RelatedProgramCard } from "@/lib/programs/data"
import { CampaignTemplate, ServiceTemplate, OutreachTemplate, ResearchTemplate } from "./templates"

interface CmsProgramRendererProps {
  document: ProgramDocument
  relatedPrograms?: RelatedProgramCard[]
}

export function CmsProgramRenderer({ document, relatedPrograms }: CmsProgramRendererProps) {
  const program = normalizeDocument(document)
  if (relatedPrograms && relatedPrograms.length > 0) {
    program.relatedPrograms = relatedPrograms
  }
  switch (document.category) {
    case "campaign":
      return <CampaignTemplate program={program} />
    case "outreach":
      return <OutreachTemplate program={program} />
    case "research":
      return <ResearchTemplate program={program} />
    default:
      return <ServiceTemplate program={program} />
  }
}
