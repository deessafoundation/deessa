"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"

import {
  type StorageFileUsage,
  type StorageFile,
  type StorageBucketInfo,
  KNOWN_APPLICATION_BUCKETS,
  getMimeTypeFromExtension,
} from "@/lib/types/storage"

export type { StorageFileUsage, StorageFile, StorageBucketInfo }

/**
 * Recursively list all files in a folder up to maxDepth levels
 */
export async function listFilesRecursive(
  supabase: any,
  bucketName: string,
  folderPath: string = "",
  maxDepth: number = 4
): Promise<any[]> {
  if (maxDepth <= 0) return []
  const allFiles: any[] = []

  try {
    const { data: items, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 1000,
        sortBy: { column: "created_at", order: "desc" },
      })

    if (error) {
      console.warn(`[Storage Browser] Could not list ${bucketName}/${folderPath}:`, error.message)
      return allFiles
    }

    if (!items || items.length === 0) {
      return allFiles
    }

    for (const item of items) {
      if (!item.name || item.name === ".") continue

      const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name

      // Check if it is a directory
      // In Supabase Storage, directory entries have id === null or metadata === null or end with /
      const isFolder = item.id === null || item.metadata === null || item.name.endsWith("/")

      if (isFolder) {
        const subFiles = await listFilesRecursive(
          supabase,
          bucketName,
          fullPath.replace(/\/$/, ""),
          maxDepth - 1
        )
        allFiles.push(...subFiles)
      } else {
        allFiles.push({
          ...item,
          fullPath,
        })
      }
    }
  } catch (err: any) {
    console.error(`[Storage Browser] Exception listing ${bucketName}/${folderPath}:`, err)
  }

  return allFiles
}

/**
 * Get all available storage buckets (dynamic discovery + known application catalog)
 */
export async function getAvailableBuckets(): Promise<StorageBucketInfo[]> {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) return KNOWN_APPLICATION_BUCKETS

    const serviceClient = createServiceRoleClient()
    const { data: remoteBuckets, error } = await serviceClient.storage.listBuckets()

    if (error || !remoteBuckets) {
      return KNOWN_APPLICATION_BUCKETS
    }

    // Merge discovered buckets with known catalog metadata
    const catalogMap = new Map(KNOWN_APPLICATION_BUCKETS.map((b) => [b.id, b]))

    const mergedBuckets: StorageBucketInfo[] = remoteBuckets.map((rb: any) => {
      const known = catalogMap.get(rb.id)
      const isPublic = rb.public ?? known?.isPublic ?? true

      if (known) {
        return {
          ...known,
          isPublic,
        }
      }

      return {
        id: rb.id,
        name: rb.name || rb.id,
        label: rb.name ? rb.name.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : rb.id,
        category: (isPublic ? "content" : "sensitive") as any,
        isSensitive: !isPublic || rb.id.includes("proof") || rb.id.includes("support") || rb.id.includes("receipt"),
        isPublic,
      }
    })

    return mergedBuckets
  } catch (error) {
    console.error("[Storage Browser] Error getting buckets:", error)
    return KNOWN_APPLICATION_BUCKETS
  }
}

/**
 * Helper to extract embedded <img> src URLs from rich-text HTML content
 */
function extractUrlsFromHtml(html: string | null | undefined): string[] {
  if (!html || typeof html !== "string") return []
  const urls: string[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1]) urls.push(match[1])
  }
  return urls
}

/**
 * Helper to recursively extract all media path/URL strings from a JSON object
 */
function extractMediaReferencesFromJson(val: any, prefix: string = ""): Array<{ url: string; path: string }> {
  const references: Array<{ url: string; path: string }> = []
  function walk(current: any, currentPath: string) {
    if (!current) return
    if (typeof current === "string") {
      const lower = current.toLowerCase().trim()
      const isMediaExtension = /\.(jpg|jpeg|png|webp|gif|svg|avif|mp4|webm|pdf|mov)(\?.*)?$/i.test(lower)
      const isStoragePath =
        lower.includes("/storage/") ||
        lower.includes("supabase.co") ||
        lower.startsWith("/") ||
        lower.includes("hero-") ||
        lower.includes("assets")
      if (isMediaExtension || isStoragePath) {
        references.push({ url: current.trim(), path: currentPath })
      }
    } else if (Array.isArray(current)) {
      current.forEach((item, index) => walk(item, `${currentPath}[${index}]`))
    } else if (typeof current === "object") {
      for (const [key, value] of Object.entries(current)) {
        walk(value, currentPath ? `${currentPath}.${key}` : key)
      }
    }
  }
  walk(val, prefix)
  return references
}

/**
 * Build a global database usage reference map
 * Scans all tables that hold image and asset URLs
 */
async function buildGlobalUsageReferenceMap(supabase: any) {
  const usageMap = new Map<string, StorageFileUsage[]>()

  function registerUsage(rawUrlOrPath: string | null | undefined, usage: StorageFileUsage) {
    if (!rawUrlOrPath || typeof rawUrlOrPath !== "string") return
    const clean = rawUrlOrPath.trim()
    if (!clean) return

    // Extract filename and storage path
    const urlObj = clean.split("?")[0].split("#")[0]
    const filename = urlObj.split("/").pop() || ""

    // Index by full URL, storage path, relative path, and filename
    const keys = [clean, urlObj, filename]

    // Also extract relative path if URL is a Supabase public object URL
    const relativeMatch = clean.match(/\/object\/public\/[^/]+\/(.+)$/)
    if (relativeMatch && relativeMatch[1]) {
      keys.push(relativeMatch[1])
    }

    for (const k of keys) {
      if (!k) continue
      const existing = usageMap.get(k) || []
      if (!existing.some((u) => u.entityType === usage.entityType && u.title === usage.title && u.field === usage.field)) {
        existing.push(usage)
        usageMap.set(k, existing)
      }
    }
  }

  try {
    const [
      eventsRes,
      programsRes,
      programAssetsRes,
      projectsRes,
      storiesRes,
      podcastsRes,
      teamRes,
      partnersRes,
      artworksRes,
      settingsRes,
      donationsRes,
      contactsRes,
    ] = await Promise.allSettled([
      supabase.from("events").select("id, slug, title, banner_image_url, payment_qr_url, thumbnail_url"),
      supabase.from("programs").select("id, slug, title, featured_image"),
      supabase.from("program_assets").select("id, program_id, title, url, storage_path"),
      supabase.from("projects").select("id, slug, title, featured_image, images, long_description"),
      supabase.from("stories").select("id, slug, title, featured_image, author_avatar, content"),
      supabase.from("podcasts").select("id, slug, title, thumbnail_url"),
      supabase.from("team_members").select("id, full_name, image_url"),
      supabase.from("partners").select("id, name, logo_url"),
      supabase.from("artworks").select("id, title, storage_path, local_image_path"),
      supabase.from("site_settings").select("key, value"),
      supabase.from("donations").select("id, donor_name, amount, bank_proof_path"),
      supabase.from("contact_submissions").select("id, name, subject, screenshot_path"),
    ])

    // 1. Events
    if (eventsRes.status === "fulfilled" && eventsRes.value.data) {
      for (const ev of eventsRes.value.data) {
        if (ev.banner_image_url) {
          registerUsage(ev.banner_image_url, {
            entityType: "Event",
            title: ev.title,
            field: "Banner Image",
            href: `/admin/events/${ev.id}`,
            publicPath: `/events/${ev.slug || ev.id}`,
          })
        }
        if (ev.thumbnail_url) {
          registerUsage(ev.thumbnail_url, {
            entityType: "Event",
            title: ev.title,
            field: "Thumbnail",
            href: `/admin/events/${ev.id}`,
            publicPath: `/events/${ev.slug || ev.id}`,
          })
        }
        if (ev.payment_qr_url) {
          registerUsage(ev.payment_qr_url, {
            entityType: "Event",
            title: ev.title,
            field: "Payment QR Code",
            href: `/admin/events/${ev.id}`,
            publicPath: `/events/${ev.slug || ev.id}`,
          })
        }
      }
    }

    // 2. Programs & Program Assets
    if (programsRes.status === "fulfilled" && programsRes.value.data) {
      for (const pr of programsRes.value.data) {
        if (pr.featured_image) {
          registerUsage(pr.featured_image, {
            entityType: "Program",
            title: pr.title,
            field: "Featured Image",
            href: `/admin/programs/${pr.id}/edit`,
            publicPath: `/programs/${pr.slug || pr.id}`,
          })
        }
      }
    }
    if (programAssetsRes.status === "fulfilled" && programAssetsRes.value.data) {
      for (const pa of programAssetsRes.value.data) {
        registerUsage(pa.url, {
          entityType: "Program Asset",
          title: pa.title || "Curriculum Document",
          field: "Program Document",
          href: `/admin/programs/${pa.program_id}/edit`,
        })
        registerUsage(pa.storage_path, {
          entityType: "Program Asset",
          title: pa.title || "Curriculum Document",
          field: "Program Document",
          href: `/admin/programs/${pa.program_id}/edit`,
        })
      }
    }

    // 3. Projects
    if (projectsRes.status === "fulfilled" && projectsRes.value.data) {
      for (const pj of projectsRes.value.data) {
        if (pj.featured_image) {
          registerUsage(pj.featured_image, {
            entityType: "Project",
            title: pj.title,
            field: "Featured Image",
            href: `/admin/projects/${pj.id}`,
            publicPath: `/projects/${pj.slug || pj.id}`,
          })
        }
        if (Array.isArray(pj.images)) {
          for (const img of pj.images) {
            registerUsage(img, {
              entityType: "Project",
              title: pj.title,
              field: "Gallery Image",
              href: `/admin/projects/${pj.id}`,
              publicPath: `/projects/${pj.slug || pj.id}`,
            })
          }
        }
        if (pj.long_description) {
          const embedded = extractUrlsFromHtml(pj.long_description)
          for (const url of embedded) {
            registerUsage(url, {
              entityType: "Project",
              title: pj.title,
              field: "Article Embedded Image",
              href: `/admin/projects/${pj.id}`,
              publicPath: `/projects/${pj.slug || pj.id}`,
            })
          }
        }
      }
    }

    // 4. Stories
    if (storiesRes.status === "fulfilled" && storiesRes.value.data) {
      for (const st of storiesRes.value.data) {
        if (st.featured_image) {
          registerUsage(st.featured_image, {
            entityType: "Story",
            title: st.title,
            field: "Story Cover",
            href: `/admin/stories/${st.id}`,
            publicPath: `/stories/${st.slug || st.id}`,
          })
        }
        if (st.author_avatar) {
          registerUsage(st.author_avatar, {
            entityType: "Story",
            title: st.title,
            field: "Author Avatar",
            href: `/admin/stories/${st.id}`,
            publicPath: `/stories/${st.slug || st.id}`,
          })
        }
        if (st.content) {
          const embedded = extractUrlsFromHtml(st.content)
          for (const url of embedded) {
            registerUsage(url, {
              entityType: "Story",
              title: st.title,
              field: "Story Embedded Image",
              href: `/admin/stories/${st.id}`,
              publicPath: `/stories/${st.slug || st.id}`,
            })
          }
        }
      }
    }

    // 5. Podcasts
    if (podcastsRes.status === "fulfilled" && podcastsRes.value.data) {
      for (const pc of podcastsRes.value.data) {
        if (pc.thumbnail_url) {
          registerUsage(pc.thumbnail_url, {
            entityType: "Podcast",
            title: pc.title,
            field: "Cover Artwork",
            href: `/admin/podcasts/${pc.id}`,
            publicPath: `/podcasts/${pc.slug || pc.id}`,
          })
        }
      }
    }

    // 6. Team Members
    if (teamRes.status === "fulfilled" && teamRes.value.data) {
      for (const tm of teamRes.value.data) {
        if (tm.image_url) {
          registerUsage(tm.image_url, {
            entityType: "Team Member",
            title: tm.full_name,
            field: "Portrait",
            href: `/admin/team/${tm.id}`,
            publicPath: `/about#team`,
          })
        }
      }
    }

    // 7. Partners
    if (partnersRes.status === "fulfilled" && partnersRes.value.data) {
      for (const pt of partnersRes.value.data) {
        if (pt.logo_url) {
          registerUsage(pt.logo_url, {
            entityType: "Partner",
            title: pt.name,
            field: "Logo",
            href: `/admin/partners/${pt.id}`,
            publicPath: `/about#partners`,
          })
        }
      }
    }

    // 8. Artworks (Saved in site-assets/artworks/ or static local files)
    if (artworksRes.status === "fulfilled" && artworksRes.value.data) {
      for (const aw of artworksRes.value.data) {
        if (aw.storage_path) {
          registerUsage(aw.storage_path, {
            entityType: "Artwork",
            title: aw.title,
            field: "Gallery Piece",
            href: `/admin/artworks`,
            publicPath: `/arts`,
          })
        }
        if (aw.local_image_path) {
          registerUsage(aw.local_image_path, {
            entityType: "Artwork (Static)",
            title: aw.title,
            field: "Bundled Local Art",
            href: `/admin/artworks`,
            publicPath: `/arts`,
          })
        }
      }
    }

    // 9. Site Settings (JSONB key/value table)
    if (settingsRes.status === "fulfilled" && settingsRes.value.data) {
      for (const st of settingsRes.value.data) {
        if (!st.value) continue
        const refs = extractMediaReferencesFromJson(st.value, st.key)
        for (const ref of refs) {
          registerUsage(ref.url, {
            entityType: "Settings",
            title: `Setting: ${st.key}`,
            field: ref.path || "Configured Asset",
            href: `/admin/cms`,
            publicPath: `/`,
          })
        }
      }
    }

    // 10. Donations & Bank Transfer Proofs
    if (donationsRes.status === "fulfilled" && donationsRes.value.data) {
      for (const d of donationsRes.value.data) {
        if (d.bank_proof_path) {
          registerUsage(d.bank_proof_path, {
            entityType: "Donation Proof",
            title: `${d.donor_name || "Anonymous Donor"} ($${d.amount})`,
            field: "Bank Deposit Slip",
            href: `/admin/donations/${d.id}`,
            publicPath: `/donate`,
          })
        }
        // Match receipts by donation id
        registerUsage(d.id, {
          entityType: "Donation Receipt",
          title: `Receipt for ${d.donor_name || "Donor"} ($${d.amount})`,
          field: "Official Tax Receipt",
          href: `/admin/donations/${d.id}`,
          publicPath: `/verify/${d.id}`,
        })
      }
    }

    // 11. Contact Submissions & Support Screenshots
    if (contactsRes.status === "fulfilled" && contactsRes.value.data) {
      for (const c of contactsRes.value.data) {
        if (c.screenshot_path) {
          registerUsage(c.screenshot_path, {
            entityType: "Support Request",
            title: `${c.name}: ${c.subject}`,
            field: "User Issue Screenshot",
            href: `/admin/contacts`,
            publicPath: `/contact`,
          })
        }
      }
    }
  } catch (err) {
    console.error("[Storage Browser] Error scanning usage references:", err)
  }

  return usageMap
}

/**
 * Fast Batch Browser across all storage buckets
 * Eliminates N+1 query storm with single-query in-memory indexing
 * Cross-references live entity usage
 */
export async function browseAllBuckets(targetBucketId?: string) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return { data: null, error: "Unauthorized" }
    }

    const supabase = await createClient()
    const serviceClient = createServiceRoleClient()

    // 1. Get all accessible buckets
    const allBuckets = await getAvailableBuckets()
    const bucketsToScan = targetBucketId && targetBucketId !== "all"
      ? allBuckets.filter((b) => b.id === targetBucketId)
      : allBuckets

    // 2. Single-batch database fetch for all tracked media assets (eliminates N+1 storm)
    const { data: dbAssets, error: dbError } = await supabase
      .from("media_assets")
      .select("id, filename, bucket, storage_path, url, size_bytes, usage_locations, is_deleted, created_at")
      .eq("is_deleted", false)

    if (dbError) {
      console.warn("[Storage Browser] Warning: Could not fetch media_assets table:", dbError.message)
    }

    // O(1) in-memory lookup map by "bucket/storage_path" and "bucket/filename"
    const assetMap = new Map<string, any>()
    for (const asset of dbAssets || []) {
      assetMap.set(`${asset.bucket}/${asset.storage_path}`, asset)
      assetMap.set(`${asset.bucket}/${asset.filename}`, asset)
      if (asset.url) assetMap.set(asset.url, asset)
    }

    // 3. Single-batch database fetch for entity usage references (Events, Programs, Stories, Team, Partners)
    const usageReferenceMap = await buildGlobalUsageReferenceMap(supabase)

    const allFiles: StorageFile[] = []

    // 4. Scan buckets recursively using service role client to ensure RLS bypass
    for (const bucketInfo of bucketsToScan) {
      const files = await listFilesRecursive(serviceClient, bucketInfo.id)

      for (const file of files) {
        const filePath = file.fullPath || file.name

        // Public or Signed URL resolution:
        // For private or sensitive buckets, generate a 24-hour signed URL so authenticated admins can view & preview the file!
        let publicUrl = ""
        const isPrivateBucket = bucketInfo.isPublic === false || bucketInfo.isSensitive === true

        if (isPrivateBucket) {
          try {
            const { data: signData, error: signError } = await serviceClient.storage
              .from(bucketInfo.id)
              .createSignedUrl(filePath, 86400) // 24 hours

            if (!signError && signData?.signedUrl) {
              publicUrl = signData.signedUrl
            }
          } catch (err) {
            console.warn(`[Storage Browser] Could not sign URL for ${bucketInfo.id}/${filePath}:`, err)
          }
        }

        // Fall back to getPublicUrl for public buckets
        if (!publicUrl) {
          const { data: urlData } = serviceClient.storage
            .from(bucketInfo.id)
            .getPublicUrl(filePath)
          publicUrl = urlData.publicUrl
        }

        // O(1) in-memory check for tracked media_assets record
        const trackedAsset =
          assetMap.get(`${bucketInfo.id}/${filePath}`) ||
          assetMap.get(`${bucketInfo.id}/${file.name}`) ||
          assetMap.get(publicUrl)

        // Check live usage across platform
        const filenameOnly = filePath.split("/").pop() || filePath
        let liveUsages =
          usageReferenceMap.get(publicUrl) ||
          usageReferenceMap.get(filePath) ||
          usageReferenceMap.get(filenameOnly) ||
          []

        // Match receipts by donation id prefix (e.g. 02722d11-...-RCP-2026-...)
        if (liveUsages.length === 0 && bucketInfo.id === "receipts") {
          const donationIdMatch = filenameOnly.match(/^([a-f0-9-]+)-RCP-/i)
          if (donationIdMatch && donationIdMatch[1]) {
            const donationUsages = usageReferenceMap.get(donationIdMatch[1])
            if (donationUsages && donationUsages.length > 0) {
              liveUsages = donationUsages
            }
          }
        }

        // Fall back to trackedAsset.usage_locations if present
        if (liveUsages.length === 0 && trackedAsset?.usage_locations && Array.isArray(trackedAsset.usage_locations)) {
          for (const u of trackedAsset.usage_locations) {
            liveUsages.push({
              entityType: u.page || "Page",
              title: u.section || "Content Block",
              field: u.field || "Media Field",
            })
          }
        }

        const mimeType = getMimeTypeFromExtension(filePath)
        const isOrphan = liveUsages.length === 0

        const storageFile: StorageFile = {
          name: filePath,
          bucket: bucketInfo.id,
          size: file.metadata?.size || 0,
          mimeType,
          createdAt: file.created_at || new Date().toISOString(),
          publicUrl,
          isTracked: !!trackedAsset,
          assetId: trackedAsset?.id,
          usageCount: liveUsages.length,
          usageLocations: liveUsages,
          isOrphan,
          isSensitive: bucketInfo.isSensitive,
        }

        allFiles.push(storageFile)
      }
    }

    return { data: allFiles, error: null }
  } catch (error: any) {
    console.error("[Storage Browser] Error browsing storage buckets:", error)
    return { data: null, error: error.message || "Failed to browse storage buckets" }
  }
}

/**
 * Single bucket browser (convenience wrapper)
 */
export async function browseStorageBucket(bucketName: string) {
  return browseAllBuckets(bucketName)
}

/**
 * Track an untracked storage file in media_assets table
 */
export async function trackStorageFile(file: StorageFile) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return { success: false, error: "Unauthorized" }
    }

    const supabase = await createClient()

    let type: "image" | "video" | "document" = "document"
    if (file.mimeType.startsWith("image/")) type = "image"
    else if (file.mimeType.startsWith("video/")) type = "video"

    const filenameOnly = file.name.split("/").pop() || file.name

    const { data, error } = await supabase
      .from("media_assets")
      .insert({
        filename: filenameOnly,
        bucket: file.bucket,
        storage_path: file.name,
        url: file.publicUrl,
        type,
        mime_type: file.mimeType,
        size_bytes: file.size,
        uploaded_by: admin.id,
        usage_locations: file.usageLocations || [],
        created_at: file.createdAt || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, error: null, data }
  } catch (error: any) {
    console.error("[Storage Browser] Error tracking storage file:", error)
    return { success: false, error: error.message, data: null }
  }
}

/**
 * Delete a file permanently from storage and media_assets
 * Uses Service Role client for physical storage removal to guarantee permissions
 */
export async function deleteStorageFile(file: StorageFile) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return { success: false, error: "Unauthorized" }
    }

    // 1. Remove physical file from Supabase storage using service role client
    const serviceClient = createServiceRoleClient()
    const { error: storageError } = await serviceClient.storage
      .from(file.bucket)
      .remove([file.name])

    if (storageError) {
      console.warn(`[Storage Browser] Storage removal warning for ${file.bucket}/${file.name}:`, storageError.message)
    }

    // 2. If tracked, remove record from media_assets table
    const supabase = await createClient()
    if (file.assetId) {
      await supabase.from("media_assets").delete().eq("id", file.assetId)
    } else {
      // Also try cleaning up by storage_path and bucket in case assetId wasn't populated
      await supabase
        .from("media_assets")
        .delete()
        .eq("bucket", file.bucket)
        .eq("storage_path", file.name)
    }

    return { success: true, error: null }
  } catch (error: any) {
    console.error("[Storage Browser] Error deleting storage file:", error)
    return { success: false, error: error.message || "Failed to delete file" }
  }
}

/**
 * Bulk delete files permanently from storage and media_assets
 */
export async function bulkDeleteStorageFiles(files: StorageFile[]) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return { success: false, error: "Unauthorized", deletedCount: 0 }
    }

    const serviceClient = createServiceRoleClient()
    const supabase = await createClient()

    let deletedCount = 0

    // Group by bucket for bulk storage removal
    const bucketGroups = new Map<string, string[]>()
    const assetIdsToDelete: string[] = []

    for (const f of files) {
      const paths = bucketGroups.get(f.bucket) || []
      paths.push(f.name)
      bucketGroups.set(f.bucket, paths)

      if (f.assetId) {
        assetIdsToDelete.push(f.assetId)
      }
    }

    // Remove from physical storage in bucket batches
    for (const [bucket, paths] of bucketGroups.entries()) {
      const { error: storageError } = await serviceClient.storage
        .from(bucket)
        .remove(paths)

      if (!storageError) {
        deletedCount += paths.length
      } else {
        console.warn(`[Storage Browser] Bulk removal error in ${bucket}:`, storageError.message)
      }
    }

    // Remove from media_assets table
    if (assetIdsToDelete.length > 0) {
      await supabase.from("media_assets").delete().in("id", assetIdsToDelete)
    }

    return { success: true, error: null, deletedCount }
  } catch (error: any) {
    console.error("[Storage Browser] Error bulk deleting storage files:", error)
    return { success: false, error: error.message, deletedCount: 0 }
  }
}
