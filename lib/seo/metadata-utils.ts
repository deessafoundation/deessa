/**
 * SEO Metadata Utilities
 * 
 * Helper functions to generate consistent, SEO-optimized metadata across the site
 * Following Google SEO Starter Guide best practices
 */

import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deessafoundation.com'
const SITE_NAME = 'Deesha Foundation'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export interface SEOMetadataParams {
  title: string
  description: string
  path?: string
  image?: string
  imageAlt?: string
  keywords?: string[]
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  noIndex?: boolean
}

/**
 * Generate consistent, SEO-optimized metadata for any page
 */
export function generateSEOMetadata({
  title,
  description,
  path = '',
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  keywords = [],
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  noIndex = false,
}: SEOMetadataParams): Metadata {
  const pageUrl = `${SITE_URL}${path}`
  
  // Keep titles concise (under 60 characters preferred)
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  
  // Keep descriptions between 50-160 characters for optimal display
  const trimmedDescription = description.length > 160 
    ? description.substring(0, 157) + '...'
    : description

  const metadata: Metadata = {
    title: fullTitle,
    description: trimmedDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      type,
      locale: 'en_US',
      url: pageUrl,
      siteName: SITE_NAME,
      title: fullTitle,
      description: trimmedDescription,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt || title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: trimmedDescription,
      images: [image],
      creator: '@deessafoundation',
    },
    alternates: {
      canonical: pageUrl,
    },
  }

  // Add article-specific metadata
  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : ['Deesha Foundation'],
      section,
    }
  }

  // Add robots directive if noIndex is true
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    }
  }

  return metadata
}

/**
 * Extract meaningful excerpt from HTML content for meta descriptions
 */
export function extractExcerpt(htmlContent: string, maxLength: number = 160): string {
  // Remove HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) {
    return text
  }

  // Trim to maxLength and cut at last complete word
  const trimmed = text.substring(0, maxLength)
  const lastSpace = trimmed.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? trimmed.substring(0, lastSpace) + '...'
    : trimmed + '...'
}

/**
 * Generate keywords from content for SEO
 */
export function generateKeywords(category?: string, additionalKeywords: string[] = []): string[] {
  const baseKeywords = [
    'Nepal',
    'NGO',
    'social development',
    'education',
    'empowerment',
  ]

  const categoryKeywords: Record<string, string[]> = {
    'Education': ['education programs', 'schools', 'literacy', 'learning'],
    'Health': ['healthcare', 'medical support', 'health services'],
    'Autism': ['autism support', 'special education', 'disability rights', 'inclusive education'],
    'Empowerment': ['community empowerment', 'women empowerment', 'skill development'],
    'Environment': ['environmental conservation', 'sustainability', 'climate action'],
  }

  const keywords = [...baseKeywords, ...additionalKeywords]
  
  if (category && categoryKeywords[category]) {
    keywords.push(...categoryKeywords[category])
  }

  // Remove duplicates and return
  return [...new Set(keywords)]
}

/**
 * Validate and optimize page title for SEO
 * Titles should be 50-60 characters for optimal display
 */
export function optimizeTitle(title: string, siteName: string = SITE_NAME): string {
  // Remove site name if already included
  const cleanTitle = title.replace(new RegExp(`[\\s-|]+${siteName}$`, 'i'), '').trim()
  
  // Check if title is too long (over 60 chars with site name)
  const fullTitle = `${cleanTitle} | ${siteName}`
  
  if (fullTitle.length <= 60) {
    return fullTitle
  }

  // If too long, try without separator and site name in search results
  if (cleanTitle.length <= 60) {
    return cleanTitle
  }

  // If still too long, truncate the title
  const maxTitleLength = 50 // Leave room for " | SITE_NAME"
  return `${cleanTitle.substring(0, maxTitleLength)}... | ${siteName}`
}

/**
 * Generate Open Graph image URL with fallback
 */
export function getOGImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return DEFAULT_OG_IMAGE
  }

  // If it's already a full URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // If it's a relative path, make it absolute
  return `${SITE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}
