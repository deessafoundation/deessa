/**
 * Page SEO Types & Interfaces
 * 
 * Supports the centralized SEO & Social Sharing Hub (/admin/seo).
 * Represents both the database entity in `page_seo` and the runtime config.
 * 
 * @module lib/types/page-seo
 */

export type PageSEOCategory = 'core' | 'programs' | 'engagement' | 'media'

export interface PageSEORecord {
  id: string
  path: string
  page_name: string
  category: PageSEOCategory
  title: string
  description: string
  keywords: string[]
  og_image: string | null
  og_image_alt: string | null
  canonical_url: string | null
  no_index: boolean
  is_published: boolean
  updated_by: string | null
  created_at?: string
  updated_at?: string
}

export type PageSEOUpdateInput = Partial<
  Pick<
    PageSEORecord,
    | 'title'
    | 'description'
    | 'keywords'
    | 'og_image'
    | 'og_image_alt'
    | 'canonical_url'
    | 'no_index'
    | 'is_published'
  >
>

export interface PageSEOWithMeta extends PageSEORecord {
  isCustomized?: boolean
  titleLength: number
  descLength: number
  isTitleOptimal: boolean
  isDescOptimal: boolean
}
