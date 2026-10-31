"use server"

import { getCurrentAdmin } from "./admin-auth"
import { deleteStorageFile, extractStoragePath } from "@/lib/storage-helpers"

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
  return { success }
}
