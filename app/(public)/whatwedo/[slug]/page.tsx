import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPublishedProgramBySlug, getRelatedPrograms } from "@/lib/programs/data"
import { sanitizeProgramContent } from "@/lib/sanitize/program-content"
import { CmsProgramRenderer } from "@/components/programs/CmsProgramRenderer"
import type { ProgramDocument } from "@/lib/programs/content"
import { WhatWeDoAreaDetail } from "@/components/what-we-do-area-detail"
import { getWhatWeDoArea, WHAT_WE_DO_AREA_IDS } from "@/lib/data/what-we-do-areas"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

async function sanitizeDocument(doc: ProgramDocument): Promise<ProgramDocument> {
  const sanitized = { ...doc, sections: [...doc.sections] }
  for (let i = 0; i < sanitized.sections.length; i++) {
    const section = sanitized.sections[i]
    // Sanitize rich_text body (dangerouslySetInnerHTML)
    if (section.content.type === "rich_text") {
      sanitized.sections[i] = {
        ...section,
        content: { ...section.content, body: await sanitizeProgramContent(section.content.body) },
      }
    }
    // Defense-in-depth: sanitize section headings and intros
    if (section.heading) {
      sanitized.sections[i] = { ...sanitized.sections[i], heading: await sanitizeProgramContent(section.heading) }
    }
    if (section.intro) {
      sanitized.sections[i] = { ...sanitized.sections[i], intro: await sanitizeProgramContent(section.intro) }
    }
  }
  return sanitized
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const area = getWhatWeDoArea(slug)

  if (area) {
    return generateSEOMetadata({
      title: `${area.label} | What We Do`,
      description: area.subtitle,
      path: `/whatwedo/${area.id}`,
      keywords: [area.label, "autism support Nepal", "inclusive education", "Deessa Foundation"],
    })
  }

  const program = await getPublishedProgramBySlug(slug)

  if (!program) {
    return { title: "Project Not Found" }
  }

  return { title: program.document.seo.title || `${program.document.title} | DEESSA Foundation`, description: program.document.seo.description || program.document.shortDescription, alternates: { canonical: `/whatwedo/${program.slug}` }, robots: { index: true, follow: true } }
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params
  const area = getWhatWeDoArea(slug)

  if (area) {
    return <WhatWeDoAreaDetail area={area} />
  }

  const program = await getPublishedProgramBySlug(slug)
  if (!program) notFound()
  const sanitizedDoc = await sanitizeDocument(program.document)

  // Fetch related programs if IDs are present
  const relatedIds = (program.document as any).relatedProgramIds as string[] | undefined
  const relatedPrograms = relatedIds?.length ? await getRelatedPrograms(relatedIds) : undefined

  return <CmsProgramRenderer document={sanitizedDoc} relatedPrograms={relatedPrograms} />
}
