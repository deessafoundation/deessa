import "server-only"

import { createClient as createAnonClient } from "@/lib/supabase/static"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { ARTWORK_COLUMNS, toArtwork, type Artwork, type ArtworkRow } from "@/lib/arts/types"
import { SHARED_ARTWORKS, mergeSharedArtworks } from "@/lib/arts/drive-collection"
import { ARTS_CONTENT_KEY, DEFAULT_ARTS_CONTENT, normalizeArtsContent, type ArtsContent } from "@/lib/arts/content"

/**
 * Section copy for the homepage feature and /arts. Read with the service
 * client, like the other homepage CMS settings, and fall back to defaults so a
 * missing row never breaks the page.
 */
export async function getArtsContent(): Promise<ArtsContent> {
  try {
    const { data, error } = await createServiceRoleClient()
      .from("site_settings")
      .select("value")
      .eq("key", ARTS_CONTENT_KEY)
      .maybeSingle()
    if (error || !data?.value) return DEFAULT_ARTS_CONTENT
    return normalizeArtsContent(data.value)
  } catch {
    return DEFAULT_ARTS_CONTENT
  }
}

// Public reads use the anon key: RLS only ever returns published rows, and the
// explicit filter below keeps that true even if a policy is changed later.

function mapRows(rows: ArtworkRow[] | null): Artwork[] {
  return (rows ?? []).map(toArtwork).filter((a): a is Artwork => a !== null)
}

export type ArtworksResult = { artworks: Artwork[]; unavailable: boolean }

/** Published CMS artworks plus unique pieces from the curated shared collection. */
export async function getPublishedArtworks(): Promise<ArtworksResult> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from("artworks")
      .select(ARTWORK_COLUMNS)
      .eq("is_published", true)
      .order("display_order", { ascending: true })

    if (error) {
      if (process.env.NODE_ENV === "development") console.warn("[artworks] read failed:", error.message)
      return { artworks: SHARED_ARTWORKS, unavailable: false }
    }
    return { artworks: mergeSharedArtworks(mapRows(data as ArtworkRow[])), unavailable: false }
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.warn("[artworks] read failed:", error)
    return { artworks: SHARED_ARTWORKS, unavailable: false }
  }
}

/**
 * Up to three works for the homepage feature: featured + published first,
 * topped up with other published works if fewer than three are featured.
 * Never pads with placeholders.
 */
export async function getHomepageArtworks(limit = 3): Promise<Artwork[]> {
  const { artworks } = await getPublishedArtworks()
  const featured = artworks.filter((a) => a.isFeatured)
  const rest = artworks.filter((a) => !a.isFeatured)
  return [...featured, ...rest].slice(0, limit)
}
