"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"
import { revalidatePath } from "next/cache"
import { checkRateLimit } from "@/lib/rate-limit"
import { hasPermission, ROLE_PERMISSIONS, type AdminRole } from "@/lib/types/admin"

// ─── Constants ──────────────────────────────────────────────

const BUCKET = "program-assets"
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB (matches DB constraint)
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const

// Magic-byte signatures for file-type verification
function verifyMagicBytes(buffer: ArrayBuffer, claimedType: string): boolean {
  const b = new Uint8Array(buffer)
  switch (claimedType) {
    case "image/jpeg":
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
    case "image/png":
      return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
    case "image/webp":
      return (
        b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
      )
    case "image/avif":
      return (
        b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
        b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66
      )
    default:
      return false
  }
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

// ─── Types ──────────────────────────────────────────────────

export type AssetResult =
  | { ok: true; asset: AssetRecord }
  | { ok: false; error: string }

export type AssetRecord = {
  id: string
  program_id: string
  storage_path: string
  url: string
  filename: string
  mime_type: string
  file_size: number
  width: number | null
  height: number | null
  alt_text: string | null
  caption: string | null
  usage_type: string | null
  processing_status: string
  clearance_status: string
  created_at: string
}

// ─── Helpers ────────────────────────────────────────────────

async function requireAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin?.is_active || !(admin.role in ROLE_PERMISSIONS) || !hasPermission(admin.role as AdminRole, "programs")) throw new Error("Unauthorized")
  return admin
}

function generateStoragePath(programId: string, filename: string): string {
  const ts = new Date().toISOString().replace(/[T:.]/g, "-").slice(0, 19)
  const rand = Math.random().toString(36).slice(2, 10)
  const ext = filename.split(".").pop() || "jpg"
  const safe = sanitizeFilename(filename.replace(/\.[^/.]+$/, ""))
  return `${programId}/${ts}_${rand}.${ext}`
}

// ─── Upload ─────────────────────────────────────────────────

export async function uploadProgramAsset(
  programId: string,
  file: File,
  opts: { altText: string; caption?: string; usageType?: string }
): Promise<AssetResult> {
  try {
    const admin = await requireAdmin()

    // Rate limit: 20 uploads per minute per admin
    const rl = await checkRateLimit({
      identifier: `program-upload:${admin.id}`,
      maxAttempts: 20,
      windowMinutes: 1,
    })
    if (!rl.allowed) {
      return { ok: false, error: "Too many upload requests. Please wait a moment." }
    }

    // --- Validate inputs ---
    if (!programId) return { ok: false, error: "Program ID is required" }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(programId)) return { ok: false, error: "Invalid program ID" }
    if (!file) return { ok: false, error: "No file provided" }
    if (!opts.altText?.trim()) return { ok: false, error: "Alt text is required" }

    // --- Check asset count quota (50 per program) ---
    const MAX_ASSETS_PER_PROGRAM = 50
    const supabaseCheck = await createClient()
    const { data: program, error: programError } = await supabaseCheck.from("programs").select("id").eq("id", programId).single()
    if (programError || !program) return { ok: false, error: "Program not found or access denied" }
    const { count, error: quotaError } = await supabaseCheck
      .from("program_assets")
      .select("id", { count: "exact", head: true })
      .eq("program_id", programId)
    if (quotaError) return { ok: false, error: "Unable to check the upload quota" }
    if (count && count >= MAX_ASSETS_PER_PROGRAM) {
      return { ok: false, error: `Program has reached the maximum of ${MAX_ASSETS_PER_PROGRAM} assets. Remove some before uploading more.` }
    }

    if (file.size > MAX_SIZE_BYTES) {
      return { ok: false, error: `File exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)` }
    }

    if (!ALLOWED_MIME.some(type => type === file.type)) {
      return { ok: false, error: "Only JPEG, PNG, WebP, and AVIF images are allowed" }
    }

    // --- Magic-byte verification ---
    const buffer = await file.arrayBuffer()
    if (!verifyMagicBytes(buffer, file.type)) {
      return { ok: false, error: "File content does not match claimed type" }
    }

    // --- Upload to storage ---
    const storagePath = generateStoragePath(programId, file.name)
    const serviceClient = createServiceRoleClient()
    const fileBuffer = Buffer.from(buffer)

    const { error: uploadError } = await serviceClient.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: "31536000",
      })

    if (uploadError) {
      console.error("Program asset upload error:", uploadError)
      return { ok: false, error: "Upload failed. Please try again." }
    }

    // --- Get public URL ---
    const { data: urlData } = serviceClient.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)

    // --- Insert asset record ---
    const supabase = await createClient()
    const { data: asset, error: insertError } = await supabase
      .from("program_assets")
      .insert({
        program_id: programId,
        storage_path: storagePath,
        url: urlData.publicUrl,
        filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        alt_text: opts.altText.trim(),
        caption: opts.caption?.trim() || null,
        usage_type: opts.usageType || null,
        processing_status: "ready",
        clearance_status: "pending",
        created_by: admin.user_id,
      })
      .select()
      .single()

    if (insertError) {
      // Clean up uploaded file if DB insert fails
      await serviceClient.storage.from(BUCKET).remove([storagePath]).catch(() => {})
      console.error("Program asset insert error:", insertError)
      return { ok: false, error: "Failed to save asset record" }
    }

    revalidatePath("/admin/programs")
    return { ok: true, asset: asset as AssetRecord }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" }
  }
}

// ─── Update metadata ────────────────────────────────────────

export async function updateProgramAsset(
  assetId: string,
  fields: { altText?: string; caption?: string; usageType?: string; clearanceStatus?: string }
): Promise<AssetResult> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const updates: Record<string, unknown> = {}
    if (fields.altText !== undefined) updates.alt_text = fields.altText.trim()
    if (fields.caption !== undefined) updates.caption = fields.caption.trim() || null
    if (fields.usageType !== undefined) updates.usage_type = fields.usageType
    if (fields.clearanceStatus !== undefined) updates.clearance_status = fields.clearanceStatus

    if (Object.keys(updates).length === 0) {
      return { ok: false, error: "No fields to update" }
    }

    const { data, error } = await supabase
      .from("program_assets")
      .update(updates)
      .eq("id", assetId)
      .select()
      .single()

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath("/admin/programs")
    return { ok: true, asset: data as AssetRecord }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Update failed" }
  }
}

// ─── Delete ─────────────────────────────────────────────────

export async function deleteProgramAsset(assetId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const serviceClient = createServiceRoleClient()

    // Fetch asset with program association
    const { data: asset, error: fetchError } = await supabase
      .from("program_assets")
      .select("storage_path, program_id, url")
      .eq("id", assetId)
      .single()

    if (fetchError || !asset) {
      return { ok: false, error: "Asset not found" }
    }

    // URL-based picks and published snapshots must receive the same protection as IDs.
    const assetUrl = asset.url
    const refs = new Set([assetId, assetUrl, `/api/assets/${assetId}`])
    function usesAsset(value: unknown): boolean {
      if (typeof value === "string") return refs.has(value) || (!!assetUrl && value.includes(assetUrl))
      if (Array.isArray(value)) return value.some(usesAsset)
      if (value && typeof value === "object") return Object.values(value).some(usesAsset)
      return false
    }
    for (const [table, columns] of [["program_drafts", "hero, sections"], ["program_publications", "document"], ["program_versions", "hero, sections"]]) {
      const { data, error } = await supabase.from(table).select(columns)
      if (error) return { ok: false, error: "Unable to verify image references. Nothing was deleted." }
      if (usesAsset(data)) return { ok: false, error: "Cannot delete: this image is referenced by a draft, publication or saved version." }
    }

    // Delete from storage
    const { error: storageError } = await serviceClient.storage.from(BUCKET).remove([asset.storage_path])
    if (storageError) return { ok: false, error: "Image could not be removed from storage. Nothing was removed from the media library." }

    // Delete record
    const { error: deleteError } = await supabase
      .from("program_assets")
      .delete()
      .eq("id", assetId)

    if (deleteError) {
      return { ok: false, error: deleteError.message }
    }

    revalidatePath("/admin/programs")
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed" }
  }
}

// ─── List assets for a program ──────────────────────────────

export async function listProgramAssets(programId: string): Promise<AssetRecord[]> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("program_assets")
      .select("*")
      .eq("program_id", programId)
      .order("created_at", { ascending: true })

    if (error) return []
    return (data ?? []) as AssetRecord[]
  } catch {
    return []
  }
}

// ─── Register an already-uploaded asset (client upload → DB record) ──

export async function registerProgramAsset(
  programId: string,
  storagePath: string,
  url: string,
  filename: string,
  mimeType: string,
  fileSize: number,
  opts: { altText: string; caption?: string; usageType?: string }
): Promise<AssetResult> {
  try {
    const admin = await requireAdmin()
    if (!programId) return { ok: false, error: "Program ID is required" }

    // Validate programId is a UUID
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_RE.test(programId)) return { ok: false, error: "Invalid program ID" }

    // Validate storage path starts with programId (prevent path traversal)
    if (!storagePath.startsWith(`${programId}/`) || storagePath.split('/').some(part => !part || part === '.' || part === '..') || /[\\\u0000-\u0020]/.test(storagePath)) {
      return { ok: false, error: "Storage path must belong to this program" }
    }

    // Validate MIME type is an allowed image type
    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    if (!ALLOWED_MIME.includes(mimeType)) {
      return { ok: false, error: "Only JPEG, PNG, WebP, and AVIF images are allowed" }
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024
    if (!Number.isInteger(fileSize) || fileSize <= 0 || fileSize > MAX_SIZE) {
      return { ok: false, error: "File size must be under 10MB" }
    }

    const supabase = await createClient()
    const { data: program, error: programError } = await supabase.from("programs").select("id").eq("id", programId).single()
    if (programError || !program) return { ok: false, error: "Program not found or access denied" }
    const storage = supabase.storage.from(BUCKET)
    const { data: uploaded, error: downloadError } = await storage.download(storagePath)
    if (downloadError || !uploaded || uploaded.size !== fileSize || !verifyMagicBytes(await uploaded.arrayBuffer(), mimeType)) return { ok: false, error: "Uploaded image could not be verified" }
    const { data: canonical } = storage.getPublicUrl(storagePath)
    if (url !== canonical.publicUrl) return { ok: false, error: "Image URL does not match its storage path" }
    const { data: asset, error: insertError } = await supabase
      .from("program_assets")
      .insert({
        program_id: programId,
        storage_path: storagePath,
        url,
        filename,
        mime_type: mimeType,
        file_size: fileSize,
        alt_text: opts.altText.trim(),
        caption: opts.caption?.trim() || null,
        usage_type: opts.usageType || null,
        processing_status: "ready",
        clearance_status: "pending",
        created_by: admin.user_id,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Program asset register error:", insertError)
      return { ok: false, error: "Failed to save asset record" }
    }

    revalidatePath("/admin/programs")
    return { ok: true, asset: asset as AssetRecord }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Register failed" }
  }
}
