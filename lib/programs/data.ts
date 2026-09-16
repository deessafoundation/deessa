import { createClient } from "@/lib/supabase/server"
import type { ProgramDocument } from "./content"
import type { ProgramCategory } from "@/lib/types/program-prototype"

export type PublishedProgram = { id: string; slug: string; category: string; publishedAt: string; document: ProgramDocument }

export async function getPublishedProgramBySlug(slug: string): Promise<PublishedProgram | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("program_publications").select("id, slug, category, published_at, document").eq("slug", slug).maybeSingle()
  if (error) {
    const code = "code" in error ? error.code : undefined
    if (code === "42P01" || code === "PGRST205") return null
    throw new Error("Unable to load this program")
  }
  if (!data) return null
  return { id: data.id, slug: data.slug, category: data.category, publishedAt: data.published_at, document: data.document as ProgramDocument }
}

export async function getPublishedProgramCards() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("program_publications").select("id, slug, category, title, short_description, card, published_at, display_order").order("display_order", { ascending: true }).order("published_at", { ascending: false })
  if (error) {
    const code = "code" in error ? error.code : undefined
    if (code === "42P01" || code === "PGRST205") return []
    throw new Error("Unable to load programs")
  }
  return data ?? []
}

export type RelatedProgramCard = {
  id: string
  slug: string
  title: string
  shortDescription: string
  category: ProgramCategory
  image: string
}

export async function getRelatedPrograms(ids: string[]): Promise<RelatedProgramCard[]> {
  if (!ids.length) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("program_publications")
    .select("id, slug, category, title, short_description, card")
    .in("id", ids)
    .limit(6)

  if (error || !data) return []

  return data.map((row) => {
    const card = row.card as Record<string, unknown> | null
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      shortDescription: row.short_description,
      category: row.category as ProgramCategory,
      image: (card?.image as string) || "",
    }
  })
}
