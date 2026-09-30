// Shared artwork types and helpers (safe to import from client and server).

export const ARTWORKS_BUCKET = "site-assets"
export const ARTWORKS_STORAGE_PREFIX = "artworks/"
export const ARTWORK_COLLECTION_CREDIT = "Deetya & Marissa"
export const ARTWORK_MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const ARTWORK_MIN_DIMENSION = 400
export const ARTWORK_MAX_DIMENSION = 8000

export type ArtworkRow = {
  id: string
  title: string
  artist_credit: string | null
  description: string | null
  alt_text: string
  local_image_path: string | null
  storage_path: string | null
  width: number
  height: number
  display_order: number
  is_published: boolean
  is_featured: boolean
  source_filename: string | null
  created_at: string
  updated_at: string
}

/** Public-facing shape: image source already resolved. */
export type Artwork = {
  id: string
  title: string
  credit: string
  description: string | null
  alt: string
  src: string
  width: number
  height: number
  order: number
  isPublished: boolean
  isFeatured: boolean
  isUpload: boolean
}

export const ARTWORK_COLUMNS =
  "id, title, artist_credit, description, alt_text, local_image_path, storage_path, width, height, display_order, is_published, is_featured, source_filename, created_at, updated_at"

export function artworkStorageUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "")
  const encoded = path.split("/").map(encodeURIComponent).join("/")
  return `${base}/storage/v1/object/public/${ARTWORKS_BUCKET}/${encoded}`
}

export function toArtwork(row: ArtworkRow): Artwork | null {
  const src = row.storage_path
    ? artworkStorageUrl(row.storage_path)
    : row.local_image_path
  if (!src) return null
  return {
    id: row.id,
    title: row.title,
    credit: row.artist_credit?.trim() || ARTWORK_COLLECTION_CREDIT,
    description: row.description?.trim() || null,
    alt: row.alt_text,
    src,
    width: row.width,
    height: row.height,
    order: row.display_order,
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    isUpload: Boolean(row.storage_path),
  }
}

export function artworkAnchor(id: string): string {
  return `artwork-${id}`
}
