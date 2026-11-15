"use server"

import { getCurrentAdmin } from "./admin-auth"
import { deleteStorageFile, extractStoragePath } from "@/lib/storage-helpers"
import { logAdminActivity } from "@/lib/audit/audit-logger"

/**
 * Server action to delete an uploaded file from Supabase storage.
 * Requires authenticated admin session.
 */
export async function deleteStorageFileAction(bucket: string, fileUrlOrPath: string) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return { error: "Unauthorized" }
  }

  const success = await deleteStorageFile(bucket, fileUrlOrPath)
  if (success) {
    const path = extractStoragePath(fileUrlOrPath, bucket) || fileUrlOrPath
    void logAdminActivity({
      action: "STORAGE_FILE_DELETED",
      domain: "MEDIA",
      entityType: "storage_files",
      entityId: `${bucket}/${path}`,
      description: `Deleted file "${path}" from storage bucket "${bucket}"`,
      newData: { bucket, path },
      actorId: admin.id,
      actorEmail: admin.email,
    })
  }

  return { success }
}
