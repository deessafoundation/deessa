"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { sniffImage } from "@/lib/arts/image-meta"
import {
  ARTWORK_COLUMNS,
  ARTWORK_MAX_DIMENSION,
  ARTWORK_MAX_UPLOAD_BYTES,
  ARTWORK_MIN_DIMENSION,
  ARTWORKS_BUCKET,
  ARTWORKS_STORAGE_PREFIX,
  type ArtworkRow,
} from "@/lib/arts/types"
import { ARTS_CONTENT_KEY, ARTS_CONTENT_LIMITS, DEFAULT_ARTS_CONTENT, type ArtsContent } from "@/lib/arts/content"

type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string; fieldErrors?: Record<string, string> }

// ---------------------------------------------------------------------------
// Authorization: every exported action calls this first.
// ---------------------------------------------------------------------------
async function requireArtworkAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.is_active === false) return null
  if (!hasPermission(admin.role as AdminRole, "settings")) return null
  return admin as { id: string; role: AdminRole }
}

function revalidateArt() {
  revalidatePath("/")
  revalidatePath("/arts")
  revalidatePath("/admin/artworks")
}

async function logActivity(adminId: string, action: string, entityId: string | null, data: Record<string, unknown>) {
  try {
    await createServiceRoleClient().from("activity_logs").insert({
      user_id: adminId,
      action,
      entity_type: "artwork",
      entity_id: entityId,
      new_data: data,
    })
  } catch {
    // Logging must never block the content change.
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
type ArtworkFields = {
  title: string
  artist_credit: string | null
  description: string | null
  alt_text: string
}

function text(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : ""
}

function longText(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : ""
}

function validateFields(form: FormData): { fields?: ArtworkFields; fieldErrors?: Record<string, string> } {
  const title = text(form, "title")
  const credit = text(form, "artist_credit")
  const description = longText(form, "description")
  const alt = text(form, "alt_text")
  const errors: Record<string, string> = {}

  if (!title) errors.title = "Title is required."
  else if (title.length > 120) errors.title = "Keep the title under 120 characters."
  if (credit.length > 120) errors.artist_credit = "Keep the credit under 120 characters."
  if (description.length > 1200) errors.description = "Keep the description under 1,200 characters."
  if (alt.length < 5) errors.alt_text = "Describe the artwork for screen reader users (at least 5 characters)."
  else if (alt.length > 300) errors.alt_text = "Keep alt text under 300 characters."
  if (/^(image|photo|picture|artwork|painting)(\s+of)?$/i.test(alt)) {
    errors.alt_text = "Describe what the artwork shows, not just that it is an image."
  }

  if (Object.keys(errors).length) return { fieldErrors: errors }
  return {
    fields: {
      title,
      artist_credit: credit || null,
      description: description || null,
      alt_text: alt,
    },
  }
}

type UploadedImage = { storagePath: string; width: number; height: number; mime: string; size: number; filename: string }

async function uploadImage(file: File): Promise<{ image?: UploadedImage; error?: string }> {
  if (file.size === 0) return { error: "The selected file is empty." }
  if (file.size > ARTWORK_MAX_UPLOAD_BYTES) return { error: "Images must be 5 MB or smaller." }

  const bytes = new Uint8Array(await file.arrayBuffer())
  // Trust the file's real signature, not the browser-reported MIME type.
  const sniffed = sniffImage(bytes)
  if (!sniffed) return { error: "Upload a JPEG, PNG or WebP image." }
  if (Math.min(sniffed.width, sniffed.height) < ARTWORK_MIN_DIMENSION) {
    return { error: `Images must be at least ${ARTWORK_MIN_DIMENSION}px on the shortest side so they stay sharp.` }
  }
  if (Math.max(sniffed.width, sniffed.height) > ARTWORK_MAX_DIMENSION) {
    return { error: `Images must be at most ${ARTWORK_MAX_DIMENSION}px on the longest side.` }
  }

  // Collision-resistant, non-guessable object name; never uses the user's filename.
  const storagePath = `${ARTWORKS_STORAGE_PREFIX}${randomUUID()}.${sniffed.ext}`
  const supabase = createServiceRoleClient()
  const { error } = await supabase.storage.from(ARTWORKS_BUCKET).upload(storagePath, bytes, {
    contentType: sniffed.mime,
    cacheControl: "31536000",
    upsert: false,
  })
  if (error) return { error: `Upload failed: ${error.message}` }

  return {
    image: {
      storagePath,
      width: sniffed.width,
      height: sniffed.height,
      mime: sniffed.mime,
      size: file.size,
      filename: file.name.slice(0, 200),
    },
  }
}

async function recordMediaAsset(image: UploadedImage, altText: string, adminId: string) {
  // Keep the shared media library aware of the upload (best effort).
  try {
    const supabase = createServiceRoleClient()
    const { data } = supabase.storage.from(ARTWORKS_BUCKET).getPublicUrl(image.storagePath)
    await supabase.from("media_assets").insert({
      filename: image.filename,
      bucket: ARTWORKS_BUCKET,
      storage_path: image.storagePath,
      url: data.publicUrl,
      type: "image",
      mime_type: image.mime,
      size_bytes: image.size,
      dimensions: { width: image.width, height: image.height },
      alt_text: altText,
      tags: ["artwork"],
      uploaded_by: adminId,
      usage_locations: [{ type: "artwork" }],
    })
  } catch {
    // Non-critical.
  }
}

/** Delete a storage object only if no artwork still points at it. */
async function removeStorageIfUnused(storagePath: string | null) {
  if (!storagePath) return
  const supabase = createServiceRoleClient()
  const { count } = await supabase
    .from("artworks")
    .select("id", { count: "exact", head: true })
    .eq("storage_path", storagePath)
  if ((count ?? 0) > 0) return
  await supabase.storage.from(ARTWORKS_BUCKET).remove([storagePath])
  await supabase.from("media_assets").update({ is_deleted: true }).eq("bucket", ARTWORKS_BUCKET).eq("storage_path", storagePath)
}

function getFile(form: FormData): File | null {
  const value = form.get("image")
  return value instanceof File && value.size > 0 ? value : null
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export async function listAllArtworks(): Promise<ActionResult<ArtworkRow[]>> {
  const admin = await requireArtworkAdmin()
  if (!admin) return { ok: false, error: "You don't have permission to manage artworks." }
  const { data, error } = await createServiceRoleClient()
    .from("artworks")
    .select(ARTWORK_COLUMNS)
    .order("display_order", { ascending: true })
  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data ?? []) as ArtworkRow[] }
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export async function createArtwork(form: FormData): Promise<ActionResult<ArtworkRow>> {
  const admin = await requireArtworkAdmin()
  if (!admin) return { ok: false, error: "You don't have permission to manage artworks." }

  const { fields, fieldErrors } = validateFields(form)
  if (!fields) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors }

  const file = getFile(form)
  if (!file) return { ok: false, error: "Choose an image to upload.", fieldErrors: { image: "An image is required." } }

  const { image, error: uploadError } = await uploadImage(file)
  if (!image) return { ok: false, error: uploadError!, fieldErrors: { image: uploadError! } }

  const supabase = createServiceRoleClient()
  const { data: last } = await supabase
    .from("artworks")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await supabase
    .from("artworks")
    .insert({
      ...fields,
      storage_path: image.storagePath,
      width: image.width,
      height: image.height,
      source_filename: image.filename,
      display_order: (last?.display_order ?? 0) + 1,
      // New works start as drafts; publishing is a deliberate second step.
      is_published: false,
      is_featured: false,
    })
    .select(ARTWORK_COLUMNS)
    .single()

  if (error || !data) {
    await supabase.storage.from(ARTWORKS_BUCKET).remove([image.storagePath])
    return { ok: false, error: error?.message ?? "Could not save the artwork." }
  }

  await recordMediaAsset(image, fields.alt_text, admin.id)
  await logActivity(admin.id, "create", data.id, { title: fields.title })
  revalidateArt()
  return { ok: true, data: data as ArtworkRow }
}

export async function updateArtwork(id: string, form: FormData): Promise<ActionResult<ArtworkRow>> {
  const admin = await requireArtworkAdmin()
  if (!admin) return { ok: false, error: "You don't have permission to manage artworks." }
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Invalid artwork." }

  const { fields, fieldErrors } = validateFields(form)
  if (!fields) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors }

  const supabase = createServiceRoleClient()
  const { data: existing, error: readError } = await supabase
    .from("artworks")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle()
  if (readError || !existing) return { ok: false, error: "Artwork not found." }

  const update: Record<string, unknown> = { ...fields }
  const file = getFile(form)
  let uploaded: UploadedImage | undefined
  if (file) {
    const { image, error: uploadError } = await uploadImage(file)
    if (!image) return { ok: false, error: uploadError!, fieldErrors: { image: uploadError! } }
    uploaded = image
    Object.assign(update, {
      storage_path: image.storagePath,
      local_image_path: null,
      width: image.width,
      height: image.height,
      source_filename: image.filename,
    })
  }

  const { data, error } = await supabase.from("artworks").update(update).eq("id", id).select(ARTWORK_COLUMNS).single()
  if (error || !data) {
    if (uploaded) await supabase.storage.from(ARTWORKS_BUCKET).remove([uploaded.storagePath])
    return { ok: false, error: error?.message ?? "Could not save the artwork." }
  }

  if (uploaded) {
    await recordMediaAsset(uploaded, fields.alt_text, admin.id)
    await removeStorageIfUnused(existing.storage_path)
  }
  await logActivity(admin.id, "update", id, { title: fields.title, replacedImage: Boolean(uploaded) })
  revalidateArt()
  return { ok: true, data: data as ArtworkRow }
}

export async function setArtworkFlags(
  id: string,
  flags: { is_published?: boolean; is_featured?: boolean },
): Promise<ActionResult<ArtworkRow>> {
  const admin = await requireArtworkAdmin()
  if (!admin) return { ok: false, error: "You don't have permission to manage artworks." }

  const update: Record<string, boolean> = {}
  if (typeof flags.is_published === "boolean") update.is_published = flags.is_published
  if (typeof flags.is_featured === "boolean") update.is_featured = flags.is_featured
  if (!Object.keys(update).length) return { ok: false, error: "Nothing to update." }

  const { data, error } = await createServiceRoleClient()
    .from("artworks")
    .update(update)
    .eq("id", id)
    .select(ARTWORK_COLUMNS)
    .single()
  if (error || !data) return { ok: false, error: error?.message ?? "Artwork not found." }

  await logActivity(admin.id, "update", id, update)
  revalidateArt()
  return { ok: true, data: data as ArtworkRow }
}

export async function reorderArtworks(orderedIds: string[]): Promise<ActionResult> {
  const admin = await requireArtworkAdmin()
  if (!admin) return { ok: false, error: "You don't have permission to manage artworks." }
  if (!Array.isArray(orderedIds) || new Set(orderedIds).size !== orderedIds.length) {
    return { ok: false, error: "Invalid order." }
  }

  // Single transaction with a deferred unique constraint: no order collisions.
  const { error } = await createServiceRoleClient().rpc("reorder_artworks", { p_ids: orderedIds })
  if (error) return { ok: false, error: "The list changed elsewhere. Refresh and try again." }

  await logActivity(admin.id, "reorder", null, { count: orderedIds.length })
  revalidateArt()
  return { ok: true }
}

export async function saveArtsContent(input: unknown): Promise<ActionResult<ArtsContent>> {
  const admin = await requireArtworkAdmin()
  if (!admin) return { ok: false, error: "You don't have permission to manage artworks." }

  const source = (input && typeof input === "object" ? input : {}) as Record<string, Record<string, unknown>>
  const fieldErrors: Record<string, string> = {}
  const clean = structuredClone(DEFAULT_ARTS_CONTENT) as Record<string, Record<string, string>>

  for (const group of Object.keys(ARTS_CONTENT_LIMITS) as (keyof ArtsContent)[]) {
    const limits = ARTS_CONTENT_LIMITS[group] as Record<string, number>
    for (const [key, max] of Object.entries(limits)) {
      const raw = source[group]?.[key]
      const value = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : ""
      if (!value) fieldErrors[`${group}.${key}`] = "This field can't be empty."
      else if (value.length > max) fieldErrors[`${group}.${key}`] = `Keep this under ${max} characters.`
      else clean[group][key] = value
    }
  }
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors }

  const { error } = await createServiceRoleClient()
    .from("site_settings")
    .upsert(
      { key: ARTS_CONTENT_KEY, value: clean, updated_by: admin.id, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    )
  if (error) return { ok: false, error: error.message }

  await logActivity(admin.id, "update", null, { key: ARTS_CONTENT_KEY })
  revalidateArt()
  return { ok: true, data: clean as unknown as ArtsContent }
}

export async function deleteArtwork(id: string): Promise<ActionResult> {
  const admin = await requireArtworkAdmin()
  if (!admin) return { ok: false, error: "You don't have permission to manage artworks." }

  const supabase = createServiceRoleClient()
  const { data: existing } = await supabase.from("artworks").select("id, title, storage_path").eq("id", id).maybeSingle()
  if (!existing) return { ok: false, error: "Artwork not found." }

  const { error } = await supabase.from("artworks").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }

  // Seeded /artWork/ files are part of the repo and are never deleted.
  await removeStorageIfUnused(existing.storage_path)
  await logActivity(admin.id, "delete", id, { title: existing.title })
  revalidateArt()
  return { ok: true }
}
