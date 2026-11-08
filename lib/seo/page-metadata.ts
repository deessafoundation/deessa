/**
 * Unified Public Page Metadata Loader
 * 
 * Provides a simple one-line helper for any Next.js public route:
 * ```tsx
 * export async function generateMetadata(): Promise<Metadata> {
 *   return getPageMetadata("/whatwedo")
 * }
 * ```
 * 
 * Automatically resolves CMS overrides from `page_seo` with resilient fallbacks,
 * OpenGraph 1200x630 cards, Twitter large cards, and canonical links.
 * 
 * @module lib/seo/page-metadata
 */

import type { Metadata } from "next"
import { getPageSEO } from "@/lib/data/seo-settings"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

export async function getPageMetadata(path: string): Promise<Metadata> {
  const seo = await getPageSEO(path)

  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    path: seo.canonical_url && seo.canonical_url.trim() ? seo.canonical_url.trim() : seo.path,
    image: seo.og_image || undefined,
    imageAlt: seo.og_image_alt || seo.title,
    keywords: seo.keywords && seo.keywords.length > 0 ? seo.keywords : undefined,
    noIndex: seo.no_index,
  })
}
