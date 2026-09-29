import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { CmsProgramRenderer } from "@/components/programs/CmsProgramRenderer"
import { sanitizeProgramContent } from "@/lib/sanitize/program-content"
import type { ProgramDocument, ProgramSection } from "@/lib/programs/content"
import type { Metadata } from "next"
import { readEditorHero } from "@/lib/programs/editor-hero"

export const dynamic = "force-dynamic"
export const revalidate = 0

export function generateMetadata(): Metadata {
  return {
    title: "Draft Preview",
    robots: { index: false, noarchive: true, nosnippet: true },
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function getDraftDocument(programId: string): Promise<ProgramDocument | null> {
  const admin = await getCurrentAdmin()
  if (!admin) return null

  const supabase = await createClient()

  const [{ data: program }, { data: draft }] = await Promise.all([
    supabase.from("programs").select("*").eq("id", programId).single(),
    supabase.from("program_drafts").select("*").eq("program_id", programId).single(),
  ])

  if (!program || !draft) return null

  const hero = (draft as any).hero || {}

  return {
    schemaVersion: 1,
    title: program.title,
    shortDescription: (program as any).short_description || "",
    eyebrow: (program as any).eyebrow || undefined,
    category: (program as any).category || "service",
    tags: (program as any).tags || [],
    hero: readEditorHero(hero, program.title, (program as any).short_description || ""),
    seo: {
      title: (draft as any).seo_title || undefined,
      description: (draft as any).seo_description || undefined,
    },
    sections: ((draft as any).sections as ProgramSection[]) || [],
    relatedProgramIds: [],
  }
}

async function sanitizeDocument(doc: ProgramDocument): Promise<ProgramDocument> {
  const sanitized = { ...doc, sections: [...doc.sections] }
  for (let i = 0; i < sanitized.sections.length; i++) {
    const section = sanitized.sections[i]
    if (section.content.type === "rich_text") {
      sanitized.sections[i] = {
        ...section,
        content: { ...section.content, body: await sanitizeProgramContent(section.content.body) },
      }
    }
    if (section.heading) {
      sanitized.sections[i] = { ...sanitized.sections[i], heading: await sanitizeProgramContent(section.heading) }
    }
    if (section.intro) {
      sanitized.sections[i] = { ...sanitized.sections[i], intro: await sanitizeProgramContent(section.intro) }
    }
  }
  return sanitized
}

export default async function ProgramPreviewPage({ params }: PageProps) {
  const { id } = await params
  const doc = await getDraftDocument(id)

  if (!doc) notFound()

  const sanitizedDoc = await sanitizeDocument(doc)

  return (
    <div className="min-h-screen">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b bg-yellow-50 px-6 py-3 dark:bg-yellow-950/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/programs/${id}/edit`}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to editor
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            Draft Preview — not published
          </span>
        </div>
        <Button size="sm" asChild>
          <Link href={`/admin/programs/${id}/edit`}>
            Edit Program
          </Link>
        </Button>
      </div>

      {/* Program content */}
      <CmsProgramRenderer document={sanitizedDoc} />
    </div>
  )
}
