"use server"

import { createClient } from "@/lib/supabase/server"
import { getCurrentAdmin } from "./admin-auth"
import {
  listFilesRecursive,
  getAvailableBuckets,
} from "./storage-browser"
import { getMimeTypeFromExtension } from "@/lib/types/storage"

/**
 * Sync storage files in a bucket to the media_assets table
 * Recursively scans all subfolders so user-uploaded files are never missed
 */
export async function syncStorageToMediaAssets(bucketName: string) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return { success: false, error: "Unauthorized", synced: 0 }
    }

    const supabase = await createClient()

    // Recursively list ALL files in the bucket, traversing all subfolders
    const files = await listFilesRecursive(supabase, bucketName)

    if (!files || files.length === 0) {
      return { success: true, error: null, synced: 0, skipped: 0, total: 0, message: "No files found in bucket" }
    }

    // Fetch existing tracked assets in this bucket in ONE query
    const { data: existingAssets } = await supabase
      .from("media_assets")
      .select("id, storage_path, filename")
      .eq("bucket", bucketName)

    const existingPathSet = new Set<string>()
    for (const a of existingAssets || []) {
      if (a.storage_path) existingPathSet.add(a.storage_path)
      if (a.filename) existingPathSet.add(a.filename)
    }

    let syncedCount = 0
    let skippedCount = 0
    const errors: string[] = []

    for (const file of files) {
      const filePath = file.fullPath || file.name
      if (!filePath) continue

      // Check if already tracked
      if (existingPathSet.has(filePath)) {
        skippedCount++
        continue
      }

      try {
        // Resolve public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        const mimeType = getMimeTypeFromExtension(filePath)
        const filenameOnly = filePath.split("/").pop() || filePath

        let type: "image" | "video" | "document" = "document"
        if (mimeType.startsWith("image/")) {
          type = "image"
        } else if (mimeType.startsWith("video/")) {
          type = "video"
        }

        const { error: insertError } = await supabase.from("media_assets").insert({
          filename: filenameOnly,
          bucket: bucketName,
          storage_path: filePath,
          url: urlData.publicUrl,
          type,
          mime_type: mimeType,
          size_bytes: file.metadata?.size || 0,
          uploaded_by: admin.id,
          created_at: file.created_at || new Date().toISOString(),
        })

        if (insertError) {
          console.warn(`[Sync Media] Insert error for ${filePath}:`, insertError.message)
          errors.push(`${filePath}: ${insertError.message}`)
        } else {
          existingPathSet.add(filePath)
          syncedCount++
        }
      } catch (fileErr: any) {
        console.error(`[Sync Media] Error processing file ${filePath}:`, fileErr)
        errors.push(`${filePath}: ${fileErr.message}`)
      }
    }

    return {
      success: true,
      error: null,
      synced: syncedCount,
      skipped: skippedCount,
      total: files.length,
      errors: errors.length > 0 ? errors : null,
      message: `Synced ${syncedCount} new files, skipped ${skippedCount} existing files`,
    }
  } catch (error: any) {
    console.error("[Sync Media] Error syncing storage to media assets:", error)
    return {
      success: false,
      error: error.message || "Failed to sync storage bucket",
      synced: 0,
      skipped: 0,
      total: 0,
    }
  }
}

/**
 * Sync all available application buckets
 */
export async function syncAllBuckets() {
  try {
    const buckets = await getAvailableBuckets()
    const results: Array<{
      bucket: string
      synced: number
      skipped: number
      total: number
      error?: string | null
    }> = []

    let totalSynced = 0
    let totalSkipped = 0

    for (const b of buckets) {
      const res = await syncStorageToMediaAssets(b.id)
      results.push({
        bucket: b.id,
        synced: res.synced || 0,
        skipped: res.skipped || 0,
        total: res.total || 0,
        error: res.error,
      })
      totalSynced += res.synced || 0
      totalSkipped += res.skipped || 0
    }

    return {
      success: true,
      totalSynced,
      totalSkipped,
      results,
    }
  } catch (error: any) {
    console.error("[Sync Media] Error syncing all buckets:", error)
    return {
      success: false,
      totalSynced: 0,
      totalSkipped: 0,
      error: error.message,
      results: [],
    }
  }
}
