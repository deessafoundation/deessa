import { createServiceRoleClient } from "@/lib/supabase/service"

/**
 * Extracts the file path inside a Supabase storage bucket from a public or signed URL.
 * Example:
 *   "https://xyz.supabase.co/storage/v1/object/public/team-photos/user1/abc.jpg?t=123"
 *   -> "user1/abc.jpg"
 */
export function extractStoragePath(url: string | null | undefined, bucket: string): string | null {
  if (!url || typeof url !== "string") return null
  try {
    // Clean query parameters and fragments
    const cleanUrl = url.split("?")[0].split("#")[0]
    const escapedBucket = bucket.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    // Match /storage/v1/object/public/<bucket>/<path> or /storage/v1/object/sign/<bucket>/<path> or /storage/v1/object/<bucket>/<path>
    const regex = new RegExp(`/storage/v1/object/(?:public/|sign/)?${escapedBucket}/(.+)`)
    const match = cleanUrl.match(regex)
    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }
    // If it's already a relative path inside the bucket (e.g. "user1/abc.jpg")
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://") && !cleanUrl.startsWith("/")) {
      return cleanUrl
    }
  } catch (err) {
    console.error("Error extracting storage path:", err)
  }
  return null
}

/**
 * Permanently deletes a file from a Supabase storage bucket using the service role client.
 * Accepts either a full public/signed URL or a direct bucket path.
 */
export async function deleteStorageFile(bucket: string, urlOrPath: string): Promise<boolean> {
  if (!urlOrPath) return false
  const path = extractStoragePath(urlOrPath, bucket) || urlOrPath
  if (!path || path.startsWith("http")) {
    return false
  }

  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) {
      console.warn(`Failed to delete storage file from "${bucket}" at path "${path}":`, error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn(`Error during storage deletion in "${bucket}":`, err)
    return false
  }
}
