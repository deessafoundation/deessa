"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"
import { programDocumentSchema, programDraftSchema, type ProgramDocument } from "@/lib/programs/content"
import { uniqueSlug } from "@/lib/programs/slug"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"
import { readEditorHero } from "@/lib/programs/editor-hero"
import { hasPermission, ROLE_PERMISSIONS, type AdminRole } from "@/lib/types/admin"

const BUCKET = "program-assets"

// Plain text is escaped by React when rendered. Do not store HTML entities:
// doing so double-encodes ampersands and apostrophes on every save.
function sanitizePlainText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // strip tags
    .trim()
}

// ─── Types ──────────────────────────────────────────────────

export type CrudResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

type ProgramRow = {
  id: string; slug: string; title: string; category: ProgramDocument["category"]; status: string
  short_description: string; eyebrow: string | null; tags: string[]
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
  if (!admin?.is_active || !(admin.role in ROLE_PERMISSIONS) || !hasPermission(admin.role as AdminRole, "programs")) throw new Error("Unauthorized")
  return admin
}

// ─── Hero normalizer (Zod document → DB draft JSONB) ────────

function heroForDraft(doc: ProgramDocument) {
  // Store the validated document shape, including image metadata and both actions.
  return doc.hero
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

    const parsed = programDraftSchema.safeParse(input.document)
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

    const parsed = programDraftSchema.safeParse(document)
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

    const { data: savedDraft, error: updateError } = await supabase
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
      .select("revision")
      .maybeSingle()

    if (updateError) {
      return { ok: false, error: updateError.message }
    }
    if (!savedDraft) return { ok: false, error: "Conflict: this draft changed while saving. Reload and try again." }

    // Also update master table fields
    const VALID_CATEGORIES = ["service", "outreach", "research", "campaign"]
    const category = VALID_CATEGORIES.includes(doc.category) ? doc.category : "service"

    const { error: masterError } = await supabase
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

    if (masterError) return { ok: false, error: "Content saved, but program details could not be saved. Reload before retrying: " + masterError.message }

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
  changeSummary?: string,
  expectedRevision?: number
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
    if (program.status === "archived") return { ok: false, error: "Restore the archived program before publishing." }
    if (expectedRevision !== undefined && draft.revision !== expectedRevision) return { ok: false, error: "Draft changed before publication. Reload and review the latest content." }

    const validated = programDocumentSchema.safeParse({ schemaVersion: 1, title: program.title, shortDescription: program.short_description, eyebrow: program.eyebrow || undefined, category: program.category, tags: program.tags || [], hero: readEditorHero(draft.hero, program.title, program.short_description || ""), seo: { title: draft.seo_title || undefined, description: draft.seo_description || undefined }, sections: draft.sections, relatedProgramIds: [] })
    if (!validated.success) return { ok: false, error: "Invalid draft: " + validated.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ') }

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
    const draftChanged = !alreadyPublished || draft.revision !== program.last_published_revision

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
          program_data: { title: program.title, category: program.category, slug: program.slug, shortDescription: program.short_description, eyebrow: program.eyebrow, tags: program.tags, seo: validated.data.seo },
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
    const document = validated.data

    const now = new Date().toISOString()

    // 3. Upsert publication
    const pubData: Record<string, unknown> = {
      id: programId,
      program_id: programId,
      slug: program.slug,
      category: program.category,
      title: program.title,
      short_description: program.short_description || "",
      tags: program.tags || [],
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
    const { data: published, error: statusErr } = await supabase
      .from("programs")
      .update({ status: "published", published_at: now, updated_by: admin.user_id, last_published_revision: draft.revision })
      .eq("id", programId)
      .eq("status", program.status) // prevent concurrent publish race
      .select("id")
      .maybeSingle()

    if (statusErr) {
      return { ok: false, error: `Status update failed: ${statusErr.message}` }
    }
    if (!published) return { ok: false, error: "Program status changed during publication. Reload to check its current state." }

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
    const { data: removed, error: removalError } = await supabase
      .from("program_publications")
      .delete()
      .eq("program_id", programId)
      .select("id")
    if (removalError) return { ok: false, error: removalError.message }
    if (!removed?.length)
      return {
        ok: false,
        error: "Publication row could not be removed (missing database permission). Apply P12 migration.",
      }

    // Update status
    const { data: changed, error: statusError } = await supabase
      .from("programs")
      .update({ status: "draft", published_at: null, updated_by: admin.user_id })
      .eq("id", programId)
      .eq("status", "published")
      .select("id").maybeSingle()
    if (statusError || !changed) return { ok: false, error: statusError?.message || "Program status changed. Reload before retrying." }

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
      const { data: removed, error } = await supabase
        .from("program_publications")
        .delete()
        .eq("program_id", programId)
        .select("id")
      if (error) return { ok: false, error: error.message }
      if (!removed?.length)
        return {
          ok: false,
          error: "Publication row could not be removed (missing database permission). Apply P12 migration.",
        }
    }

    const { data: changed, error: statusError } = await supabase
      .from("programs")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
        published_at: null,
        updated_by: admin.user_id,
      })
      .eq("id", programId)
      .eq("status", program.status)
      .select("id").maybeSingle()
    if (statusError || !changed) return { ok: false, error: statusError?.message || "Program status changed. Reload before retrying." }

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

    const { data: changed, error: statusError } = await supabase
      .from("programs")
      .update({ status: "draft", archived_at: null, updated_by: admin.user_id })
      .eq("id", programId)
      .eq("status", "archived")
      .select("id").maybeSingle()
    if (statusError || !changed) return { ok: false, error: statusError?.message || "Program status changed. Reload before retrying." }

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
    const { data: deleted, error } = await supabase.from("programs").delete().eq("id", programId).select("id")
    if (error) return { ok: false, error: error.message }
    if (!deleted?.length)
      return { ok: false, error: "Program could not be deleted (missing database permission). Apply P12 migration." }

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
    const pd = version.program_data as Record<string, unknown> | null
    const seo = pd?.seo as ProgramDocument['seo'] | undefined

    // Update the draft with the version's content
    const { data: restored, error: updateErr } = await supabase
      .from("program_drafts")
      .update({
        hero: version.hero,
        sections: version.sections,
        ...(seo ? { seo_title: seo.title || null, seo_description: seo.description || null } : {}),
        revision: newRevision,
        updated_at: new Date().toISOString(),
      })
      .eq("program_id", programId)
      .eq("revision", draft.revision) // optimistic concurrency check
      .select("revision").maybeSingle()

    if (updateErr) {
      if (updateErr.code === "23505") {
        return { ok: false, error: "Draft was modified since you loaded it. Reload and try again." }
      }
      return { ok: false, error: updateErr.message }
    }
    if (!restored) return { ok: false, error: "Draft changed while restoring. Reload before retrying." }

    // Sync master table fields from version's program_data
    if (pd) {
      const { error: metadataError } = await supabase
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
      if (metadataError) return { ok: false, error: "Content restored, but metadata could not be restored. Reload before retrying: " + metadataError.message }
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
