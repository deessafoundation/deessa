"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"
import { programDocumentSchema, type ProgramDocument } from "@/lib/programs/content"
import { uniqueSlug } from "@/lib/programs/slug"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"

const BUCKET = "program-assets"

// Strip HTML tags and encode special characters to prevent stored XSS
function sanitizePlainText(text: string): string {
  const escapeMap: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }
  return text
    .replace(/<[^>]*>/g, "") // strip tags
    .replace(/[&<>"']/g, (c) => escapeMap[c] || c)
    .trim()
}

// ─── Types ──────────────────────────────────────────────────

export type CrudResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

type ProgramRow = {
  id: string; slug: string; title: string; category: string; status: string
  display_order: number; created_at: string; updated_at: string
}

type DraftRow = {
  program_id: string; hero: unknown; sections: unknown
  seo_title: string | null; seo_description: string | null
  revision: number; updated_at: string
}

export type VersionRow = {
  id: string; version_number: number; change_summary: string | null
  created_by: string | null; created_at: string
}

type PublishResult = { versionNumber: number; publishedAt: string }

// ─── Auth helper ────────────────────────────────────────────

async function requireAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error("Unauthorized")
  return admin
}

// ─── Hero normalizer (Zod document → DB draft JSONB) ────────

function heroForDraft(doc: ProgramDocument) {
  const img = doc.hero.image
  const imageUrl = img?.assetId
    ? `/api/assets/${img.assetId}`
    : img?.url || ""
  return {
    eyebrow: doc.eyebrow,
    title: doc.hero.title,
    description: doc.hero.description,
    image: imageUrl,
    imageAlt: img?.alt || doc.hero.title,
    layout: "full_bleed",
    cta: doc.hero.actions?.[0]
      ? { label: doc.hero.actions[0].label, url: doc.hero.actions[0].url, variant: doc.hero.actions[0].variant }
      : undefined,
    secondaryCta: doc.hero.actions?.[1]
      ? { label: doc.hero.actions[1].label, url: doc.hero.actions[1].url }
      : undefined,
    note: doc.hero.note,
    sticker: doc.hero.sticker,
    photoNote: doc.hero.photoNote,
  }
}

function cardForPublication(doc: ProgramDocument) {
  const img = doc.hero.image
  const imageUrl = img?.assetId
    ? `/api/assets/${img.assetId}`
    : img?.url || ""
  return {
    title: doc.title,
    eyebrow: doc.eyebrow,
    shortDescription: doc.shortDescription,
    image: imageUrl,
    category: doc.category,
  }
}

// ─── CREATE ─────────────────────────────────────────────────

export async function createProgram(input: {
  title: string
  category: string
  document: ProgramDocument
}): Promise<CrudResult<{ id: string; slug: string }>> {
  try {
    const admin = await requireAdmin()
    const supabase = await createClient()

    const parsed = programDocumentSchema.safeParse(input.document)
    if (!parsed.success) {
      return { ok: false, error: `Invalid document: ${parsed.error.issues[0]?.message}` }
    }
    const doc = parsed.data

    const slug = await uniqueSlug(supabase, input.title)

    const VALID_CATEGORIES = ["service", "outreach", "research", "campaign"]
    if (!VALID_CATEGORIES.includes(input.category)) {
      return { ok: false, error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` }
    }

    const { data: program, error: programError } = await supabase
      .from("programs")
      .insert({
        slug,
        title: sanitizePlainText(input.title),
        category: input.category,
        theme: "warm",
        short_description: sanitizePlainText(doc.shortDescription),
        eyebrow: doc.eyebrow ? sanitizePlainText(doc.eyebrow) : null,
        tags: doc.tags,
        status: "draft",
        display_order: 0,
        created_by: admin.user_id,
        updated_by: admin.user_id,
      })
      .select("id, slug")
      .single()

    if (programError) {
      return { ok: false, error: programError.message }
    }

    const { error: draftError } = await supabase
      .from("program_drafts")
      .insert({
        program_id: program.id,
        schema_version: 1,
        hero: heroForDraft(doc),
        sections: doc.sections as unknown as Record<string, unknown>[],
        seo_title: doc.seo?.title || null,
        seo_description: doc.seo?.description || null,
        revision: 1,
        updated_by: admin.user_id,
      })

    if (draftError) {
      // Rollback: delete the program row
      await supabase.from("programs").delete().eq("id", program.id)
      return { ok: false, error: draftError.message }
    }

    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "CREATE",
      entity_type: "program",
      entity_id: program.id,
      new_data: { title: input.title, category: input.category, slug },
    })

    revalidatePath("/admin/programs")
    return { ok: true, data: { id: program.id, slug: program.slug } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Create failed" }
  }
}

// ─── UPDATE DRAFT ───────────────────────────────────────────

export async function updateProgramDraft(
  programId: string,
  document: ProgramDocument,
  expectedRevision: number,
  changeSummary?: string
): Promise<CrudResult<{ revision: number }>> {
  try {
    const admin = await requireAdmin()
    const supabase = await createClient()

    const parsed = programDocumentSchema.safeParse(document)
    if (!parsed.success) {
      return { ok: false, error: `Invalid document: ${parsed.error.issues[0]?.message}` }
    }
    const doc = parsed.data

    // Optimistic concurrency: only update if revision matches
    const { data: draft, error: fetchError } = await supabase
      .from("program_drafts")
      .select("revision")
      .eq("program_id", programId)
      .eq("revision", expectedRevision)
      .single()

    if (fetchError || !draft) {
      return { ok: false, error: "Conflict: this draft was modified since you last loaded it. Reload and try again." }
    }

    const newRevision = expectedRevision + 1

    const { error: updateError } = await supabase
      .from("program_drafts")
      .update({
        hero: heroForDraft(doc),
        sections: doc.sections as unknown as Record<string, unknown>[],
        seo_title: doc.seo?.title ? sanitizePlainText(doc.seo.title) : null,
        seo_description: doc.seo?.description ? sanitizePlainText(doc.seo.description) : null,
        revision: newRevision,
        updated_by: admin.user_id,
      })
      .eq("program_id", programId)
      .eq("revision", expectedRevision)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    // Also update master table fields
    const VALID_CATEGORIES = ["service", "outreach", "research", "campaign"]
    const category = VALID_CATEGORIES.includes(doc.category) ? doc.category : "service"

    await supabase
      .from("programs")
      .update({
        title: sanitizePlainText(doc.title),
        short_description: sanitizePlainText(doc.shortDescription),
        eyebrow: doc.eyebrow ? sanitizePlainText(doc.eyebrow) : null,
        category,
        tags: doc.tags,
        updated_by: admin.user_id,
      })
      .eq("id", programId)

    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "UPDATE",
      entity_type: "program",
      entity_id: programId,
      new_data: { revision: newRevision, change_summary: changeSummary },
    })

    revalidatePath("/admin/programs")
    return { ok: true, data: { revision: newRevision } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Update failed" }
  }
}

// ─── PUBLISH ────────────────────────────────────────────────

export async function publishProgram(
  programId: string,
  changeSummary?: string
): Promise<CrudResult<PublishResult>> {
  try {
    const admin = await requireAdmin()

    // Rate limit: 10 publishes per minute per admin
    const rl = await checkRateLimit({
      identifier: `program-publish:${admin.id}`,
      maxAttempts: 10,
      windowMinutes: 1,
    })
    if (!rl.allowed) {
      return { ok: false, error: "Too many publish requests. Please wait a moment." }
    }

    const supabase = await createClient()

    // Fetch program + draft
    const [{ data: program, error: pErr }, { data: draft, error: dErr }] = await Promise.all([
      supabase.from("programs").select("id, slug, title, category, status, display_order, short_description, eyebrow, tags, last_published_revision").eq("id", programId).single(),
      supabase.from("program_drafts").select("hero, sections, revision, schema_version, seo_title, seo_description").eq("program_id", programId).single(),
    ])

    if (pErr || !program) return { ok: false, error: "Program not found" }
    if (dErr || !draft) return { ok: false, error: "Draft not found. Save the draft before publishing." }

    // Check if draft has changed since last publish
    const { data: lastVersion } = await supabase
      .from("program_versions")
      .select("version_number")
      .eq("program_id", programId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle()

    // If already published and draft hasn't changed since last publish, skip version creation
    const alreadyPublished = program.status === "published"
    const draftChanged = !alreadyPublished || draft.revision !== (program as any).last_published_revision

    let versionNumber: number
    let versionId: string | null = null

    if (!draftChanged) {
      // Re-publish without changes — reuse last version, just update published_at
      versionNumber = lastVersion?.version_number ?? 1
    } else {
      // New version snapshot
      versionNumber = (lastVersion?.version_number ?? 0) + 1

      const { data: version, error: vErr } = await supabase
        .from("program_versions")
        .insert({
          program_id: programId,
          version_number: versionNumber,
          schema_version: draft.schema_version,
          program_data: { title: program.title, category: program.category, slug: program.slug },
          hero: draft.hero,
          sections: draft.sections,
          change_summary: changeSummary || null,
          created_by: admin.user_id,
        })
        .select("id")
        .single()

      if (vErr || !version) {
        return { ok: false, error: `Failed to create version: ${vErr?.message}` }
      }
      versionId = version.id
    }

    // 2. Build publication document
    const draftSeo = {
      title: (draft as any).seo_title || undefined,
      description: (draft as any).seo_description || undefined,
    }
    const document = {
      schemaVersion: 1 as const,
      title: program.title,
      shortDescription: (program as any).short_description,
      eyebrow: (program as any).eyebrow,
      category: program.category,
      tags: (program as any).tags || [],
      hero: draft.hero,
      seo: {
        title: draftSeo.title || (program as any).meta_title || undefined,
        description: draftSeo.description || (program as any).meta_description || undefined,
      },
      sections: draft.sections,
      relatedProgramIds: [],
    }

    const now = new Date().toISOString()

    // 3. Upsert publication
    const pubData: Record<string, unknown> = {
      id: programId,
      program_id: programId,
      slug: program.slug,
      category: program.category,
      title: program.title,
      short_description: (program as any).short_description || "",
      tags: (program as any).tags || [],
      card: cardForPublication(document as unknown as ProgramDocument),
      document: document as unknown as Record<string, unknown>,
      display_order: program.display_order,
      published_at: now,
      first_published_at: alreadyPublished ? undefined : now,
    }
    if (versionId) {
      pubData.version_id = versionId
    }

    const { error: pubErr } = await supabase
      .from("program_publications")
      .upsert(pubData, { onConflict: "id" })

    if (pubErr) {
      return { ok: false, error: `Failed to publish: ${pubErr.message}` }
    }

    // 4. Update program status (with concurrency guard)
    const { error: statusErr } = await supabase
      .from("programs")
      .update({ status: "published", published_at: now, updated_by: admin.user_id, last_published_revision: draft.revision })
      .eq("id", programId)
      .eq("status", program.status) // prevent concurrent publish race

    if (statusErr) {
      return { ok: false, error: `Status update failed: ${statusErr.message}` }
    }

    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "PUBLISH",
      entity_type: "program",
      entity_id: programId,
      new_data: { version: versionNumber, slug: program.slug },
    })

    revalidatePath("/admin/programs")
    revalidatePath(`/whatwedo/${program.slug}`)
    revalidatePath("/whatwedo")

    return { ok: true, data: { versionNumber, publishedAt: now } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Publish failed" }
  }
}

// ─── UNPUBLISH ──────────────────────────────────────────────

export async function unpublishProgram(
  programId: string
): Promise<CrudResult<null>> {
  try {
    const admin = await requireAdmin()
    const supabase = await createClient()

    const { data: program, error: pErr } = await supabase
      .from("programs")
      .select("id, slug, status")
      .eq("id", programId)
      .single()

    if (pErr || !program) return { ok: false, error: "Program not found" }
    if (program.status !== "published") return { ok: false, error: "Program is not published" }

    // Remove publication
    await supabase.from("program_publications").delete().eq("program_id", programId)

    // Update status
    await supabase
      .from("programs")
      .update({ status: "draft", published_at: null, updated_by: admin.user_id })
      .eq("id", programId)

    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "UNPUBLISH",
      entity_type: "program",
      entity_id: programId,
    })

    revalidatePath("/admin/programs")
    revalidatePath(`/whatwedo/${program.slug}`)
    revalidatePath("/whatwedo")

    return { ok: true, data: null }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unpublish failed" }
  }
}

// ─── ARCHIVE ────────────────────────────────────────────────

export async function archiveProgram(
  programId: string
): Promise<CrudResult<null>> {
  try {
    const admin = await requireAdmin()
    const supabase = await createClient()

    const { data: program } = await supabase
      .from("programs")
      .select("id, slug, status")
      .eq("id", programId)
      .single()

    if (!program) return { ok: false, error: "Program not found" }
    if (program.status === "archived") return { ok: false, error: "Already archived" }

    // Unpublish first if published
    if (program.status === "published") {
      await supabase.from("program_publications").delete().eq("program_id", programId)
    }

    await supabase
      .from("programs")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
        published_at: null,
        updated_by: admin.user_id,
      })
      .eq("id", programId)

    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "ARCHIVE",
      entity_type: "program",
      entity_id: programId,
    })

    revalidatePath("/admin/programs")
    revalidatePath(`/whatwedo/${program.slug}`)
    revalidatePath("/whatwedo")

    return { ok: true, data: null }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Archive failed" }
  }
}

// ─── RESTORE ────────────────────────────────────────────────

export async function restoreProgram(
  programId: string
): Promise<CrudResult<null>> {
  try {
    const admin = await requireAdmin()
    const supabase = await createClient()

    const { data: program } = await supabase
      .from("programs")
      .select("id, status")
      .eq("id", programId)
      .single()

    if (!program) return { ok: false, error: "Program not found" }
    if (program.status !== "archived") return { ok: false, error: "Only archived programs can be restored" }

    await supabase
      .from("programs")
      .update({ status: "draft", archived_at: null, updated_by: admin.user_id })
      .eq("id", programId)

    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "RESTORE",
      entity_type: "program",
      entity_id: programId,
    })

    revalidatePath("/admin/programs")
    return { ok: true, data: null }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Restore failed" }
  }
}

// ─── DELETE (drafts only) ───────────────────────────────────

export async function deleteProgram(
  programId: string
): Promise<CrudResult<null>> {
  try {
    const admin = await requireAdmin()
    const supabase = await createClient()
    const serviceClient = createServiceRoleClient()

    const { data: program } = await supabase
      .from("programs")
      .select("id, slug, status")
      .eq("id", programId)
      .single()

    if (!program) return { ok: false, error: "Program not found" }
    if (program.status === "published") {
      return { ok: false, error: "Unpublish before deleting" }
    }

    // Clean up storage files before DB cascade delete
    const { data: assets } = await supabase
      .from("program_assets")
      .select("storage_path")
      .eq("program_id", programId)

    if (assets && assets.length > 0) {
      const paths = assets.map((a) => a.storage_path).filter(Boolean)
      if (paths.length > 0) {
        const { error: storageErr } = await serviceClient.storage.from(BUCKET).remove(paths)
        if (storageErr) {
          console.error("Storage cleanup failed:", storageErr)
          return { ok: false, error: "Failed to clean up storage files. Delete aborted to prevent orphaned files." }
        }
      }
    }

    // Hard delete (cascade removes drafts, versions, assets, sections)
    const { error } = await supabase.from("programs").delete().eq("id", programId)
    if (error) return { ok: false, error: error.message }

    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "DELETE",
      entity_type: "program",
      entity_id: programId,
      old_data: { slug: program.slug },
    })

    revalidatePath("/admin/programs")
    return { ok: true, data: null }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed" }
  }
}

// ─── VERSION HISTORY ────────────────────────────────────────

export async function getProgramVersions(
  programId: string
): Promise<VersionRow[]> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("program_versions")
      .select("id, version_number, change_summary, created_by, created_at")
      .eq("program_id", programId)
      .order("version_number", { ascending: false })

    if (error) return []
    return (data ?? []) as VersionRow[]
  } catch {
    return []
  }
}

export async function getProgramVersion(
  programId: string,
  versionNumber: number
): Promise<CrudResult<{ version: VersionRow; hero: unknown; sections: unknown; programData: unknown }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("program_versions")
      .select("*")
      .eq("program_id", programId)
      .eq("version_number", versionNumber)
      .single()

    if (error || !data) return { ok: false, error: "Version not found" }
    return {
      ok: true,
      data: {
        version: data as VersionRow,
        hero: data.hero,
        sections: data.sections,
        programData: data.program_data,
      },
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to load version" }
  }
}

export async function restoreProgramVersion(
  programId: string,
  versionNumber: number
): Promise<CrudResult<{ revision: number }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Fetch the version
    const { data: version, error: vErr } = await supabase
      .from("program_versions")
      .select("hero, sections, program_data")
      .eq("program_id", programId)
      .eq("version_number", versionNumber)
      .single()

    if (vErr || !version) return { ok: false, error: "Version not found" }

    // Fetch current draft to get revision
    const { data: draft, error: dErr } = await supabase
      .from("program_drafts")
      .select("revision")
      .eq("program_id", programId)
      .single()

    if (dErr || !draft) return { ok: false, error: "Draft not found" }

    const newRevision = draft.revision + 1

    // Update the draft with the version's content
    const { error: updateErr } = await supabase
      .from("program_drafts")
      .update({
        hero: version.hero,
        sections: version.sections,
        revision: newRevision,
        updated_at: new Date().toISOString(),
      })
      .eq("program_id", programId)
      .eq("revision", draft.revision) // optimistic concurrency check

    if (updateErr) {
      if (updateErr.code === "23505") {
        return { ok: false, error: "Draft was modified since you loaded it. Reload and try again." }
      }
      return { ok: false, error: updateErr.message }
    }

    // Sync master table fields from version's program_data
    const pd = version.program_data as Record<string, unknown> | null
    if (pd) {
      await supabase
        .from("programs")
        .update({
          title: pd.title,
          category: pd.category,
          short_description: pd.shortDescription,
          eyebrow: pd.eyebrow,
          tags: pd.tags,
          updated_at: new Date().toISOString(),
        })
        .eq("id", programId)
    }

    revalidatePath("/admin/programs")
    return { ok: true, data: { revision: newRevision } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Restore failed" }
  }
}

// ─── GET DRAFT (for editor) ────────────────────────────────

export async function getProgramDraft(
  programId: string
): Promise<CrudResult<{ program: ProgramRow; draft: DraftRow }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const [{ data: program, error: pErr }, { data: draft, error: dErr }] = await Promise.all([
      supabase.from("programs").select("*").eq("id", programId).single(),
      supabase.from("program_drafts").select("*").eq("program_id", programId).single(),
    ])

    if (pErr || !program) return { ok: false, error: "Program not found" }
    if (dErr || !draft) return { ok: false, error: "Draft not found" }

    return { ok: true, data: { program: program as ProgramRow, draft: draft as DraftRow } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to load draft" }
  }
}
