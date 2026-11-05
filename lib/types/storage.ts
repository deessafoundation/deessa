export interface StorageFileUsage {
  entityType: string
  title: string
  field: string
  href?: string
  publicPath?: string
}

export interface StorageFile {
  name: string
  bucket: string
  size: number
  mimeType: string
  createdAt: string
  publicUrl: string
  isTracked: boolean // Whether it exists in media_assets table
  assetId?: string // If tracked, the media_asset id
  usageCount?: number
  usageLocations?: StorageFileUsage[]
  isOrphan?: boolean
  isSensitive?: boolean
}

export interface StorageBucketInfo {
  id: string
  name: string
  label: string
  category: "public" | "content" | "editorial" | "sensitive"
  isSensitive?: boolean
  isPublic?: boolean
  fileCount?: number
  totalBytes?: number
}

// Master Application Catalog of Buckets (All 19 Real Supabase Storage Buckets)
export const KNOWN_APPLICATION_BUCKETS: StorageBucketInfo[] = [
  // Public & Visual Buckets
  { id: "hero-images", name: "hero-images", label: "Hero Images", category: "public", isPublic: true },
  { id: "hero-videos", name: "hero-videos", label: "Hero Videos", category: "public", isPublic: true },
  { id: "site-assets", name: "site-assets", label: "Site Assets & Artworks", category: "public", isPublic: true },
  { id: "press-gallery", name: "press-gallery", label: "Press Gallery", category: "public", isPublic: true },
  { id: "og-images", name: "og-images", label: "Social OG Images", category: "public", isPublic: true },
  { id: "project-images", name: "project-images", label: "Project Photos", category: "content", isPublic: true },
  { id: "story-images", name: "story-images", label: "Story Photos", category: "content", isPublic: true },
  { id: "team-photos", name: "team-photos", label: "Team Portraits", category: "content", isPublic: true },
  { id: "event-images", name: "event-images", label: "Event Images & QR", category: "content", isPublic: true },
  { id: "partner-logos", name: "partner-logos", label: "Partner & Sponsor Logos", category: "content", isPublic: true },
  { id: "program-assets", name: "program-assets", label: "Program Assets & PDFs", category: "content", isPublic: true },
  { id: "testimonials", name: "testimonials", label: "Testimonials", category: "content", isPublic: true },
  { id: "conference-uploads", name: "conference-uploads", label: "Conference Uploads", category: "content", isPublic: true },
  { id: "event-uploads", name: "event-uploads", label: "Event Uploads", category: "content", isPublic: true },
  { id: "videos", name: "videos", label: "Videos", category: "content", isPublic: true },
  { id: "intro-videos", name: "intro-videos", label: "Intro Videos", category: "content", isPublic: true },

  // Sensitive & Transactional Buckets (Private)
  { id: "bank-transfer-proofs", name: "bank-transfer-proofs", label: "Bank Transfer Proofs", category: "sensitive", isSensitive: true, isPublic: false },
  { id: "event-payment-screenshots", name: "event-payment-screenshots", label: "Event Payment Screenshots", category: "sensitive", isSensitive: true, isPublic: false },
  { id: "support-screenshots", name: "support-screenshots", label: "Support Screenshots", category: "sensitive", isSensitive: true, isPublic: false },
  { id: "receipts", name: "receipts", label: "Donation Receipts", category: "sensitive", isSensitive: true, isPublic: false },
]

/**
 * Get mime type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || ""

  // Images
  if (["jpg", "jpeg"].includes(ext)) return "image/jpeg"
  if (ext === "png") return "image/png"
  if (ext === "gif") return "image/gif"
  if (ext === "webp") return "image/webp"
  if (ext === "svg") return "image/svg+xml"
  if (ext === "ico") return "image/x-icon"
  if (ext === "bmp") return "image/bmp"
  if (ext === "tiff" || ext === "tif") return "image/tiff"
  if (ext === "avif") return "image/avif"

  // Videos
  if (ext === "mp4") return "video/mp4"
  if (ext === "webm") return "video/webm"
  if (ext === "mov") return "video/quicktime"
  if (ext === "avi") return "video/x-msvideo"
  if (ext === "mkv") return "video/x-matroska"
  if (ext === "flv") return "video/x-flv"
  if (ext === "wmv") return "video/x-ms-wmv"

  // Documents
  if (ext === "pdf") return "application/pdf"
  if (ext === "doc") return "application/msword"
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  if (ext === "xls") return "application/vnd.ms-excel"
  if (ext === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  if (ext === "html" || ext === "htm") return "text/html"

  return "application/octet-stream"
}
