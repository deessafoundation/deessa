/**
 * Structured Data (Schema.org JSON-LD) Generators
 * 
 * These functions generate structured data to help search engines better understand
 * the website content and improve search result appearance.
 * 
 * Based on Google SEO Starter Guide best practices.
 */

/**
 * Schema.org type definitions for structured data
 */
type WithContext<T> = T & { '@context': 'https://schema.org' }

type Organization = {
  '@type': 'Organization'
  name: string
  alternateName?: string
  url: string
  logo?: string
  description?: string
  foundingDate?: string
  address?: PostalAddress
  sameAs?: string[]
  contactPoint?: ContactPoint
}

type WebSite = {
  '@type': 'WebSite'
  name: string
  url: string
  description?: string
  publisher?: Organization
  potentialAction?: SearchAction
}

type BreadcrumbList = {
  '@type': 'BreadcrumbList'
  itemListElement: ListItem[]
}

type ListItem = {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

type Article = {
  '@type': 'Article'
  headline: string
  description: string
  image: string
  datePublished: string
  dateModified: string
  author: Person | Organization
  publisher: Organization & { logo: ImageObject }
  mainEntityOfPage: WebPage
}

type Event = {
  '@type': 'Event'
  name: string
  description: string
  startDate: string
  endDate: string
  image: string
  organizer: Organization
  eventAttendanceMode?: string
  location?: Place
  url?: string
}

type Person = {
  '@type': 'Person'
  name: string
  jobTitle?: string
  description?: string
  image?: string
  affiliation?: Organization
  sameAs?: string[]
}

type PostalAddress = {
  '@type': 'PostalAddress'
  streetAddress?: string
  addressLocality?: string
  addressCountry: string
}

type ContactPoint = {
  '@type': 'ContactPoint'
  contactType: string
  url: string
}

type SearchAction = {
  '@type': 'SearchAction'
  target: EntryPoint
  'query-input': string
}

type EntryPoint = {
  '@type': 'EntryPoint'
  urlTemplate: string
}

type ImageObject = {
  '@type': 'ImageObject'
  url: string
}

type WebPage = {
  '@type': 'WebPage'
  '@id': string
}

type Place = {
  '@type': 'Place'
  name: string
  address?: PostalAddress
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deessafoundation.com'
const ORGANIZATION_NAME = 'Deesha Foundation'

/**
 * Organization structured data for the main website
 * Helps Google understand the organization and display rich results
 */
export function getOrganizationStructuredData(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORGANIZATION_NAME,
    alternateName: 'DEESSA Foundation',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description: 'A non-profit organization dedicated to sustainable development, quality education, and social upliftment for the most vulnerable in Nepal, with a special focus on children with disabilities and autism.',
    foundingDate: '2015',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
      addressLocality: 'Nepal',
    },
    sameAs: [
      // Add social media profiles when available
      // 'https://www.facebook.com/deessafoundation',
      // 'https://www.linkedin.com/company/deessa-foundation',
      // 'https://twitter.com/deessafoundation',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'General Inquiries',
      url: `${SITE_URL}/contact`,
    },
  }
}

/**
 * WebSite structured data with search functionality
 * Enables Google to show search box in search results
 */
export function getWebSiteStructuredData(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    description: 'Empowering Nepal through education, healthcare, and social development programs.',
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate breadcrumb structured data for navigation
 * Helps Google display breadcrumbs in search results
 */
export interface BreadcrumbItem {
  name: string
  url: string
}

export function getBreadcrumbStructuredData(items: BreadcrumbItem[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Article structured data for blog posts and stories
 * Improves how stories appear in search results
 */
export interface ArticleData {
  title: string
  description: string
  slug: string
  image?: string
  publishedAt: string
  updatedAt?: string
  author?: string
  category?: string
}

export function getArticleStructuredData(article: ArticleData): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || `${SITE_URL}/og-image.png`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Organization',
      name: article.author || ORGANIZATION_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/stories/${article.slug}`,
    },
  }
}

/**
 * Event structured data for conferences and events
 * Helps events appear in Google Events search results
 */
export interface EventData {
  title: string
  description: string
  slug: string
  startDate: string
  endDate?: string
  location?: {
    name: string
    address?: string
  }
  image?: string
  isOnline?: boolean
  registrationUrl?: string
}

export function getEventStructuredData(event: EventData): WithContext<Event> {
  const eventData: WithContext<Event> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    image: event.image || `${SITE_URL}/og-image.png`,
    organizer: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      url: SITE_URL,
    },
    eventAttendanceMode: event.isOnline 
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
  }

  if (event.location) {
    eventData.location = {
      '@type': 'Place',
      name: event.location.name,
      address: event.location.address ? {
        '@type': 'PostalAddress',
        streetAddress: event.location.address,
        addressCountry: 'NP',
      } : undefined,
    }
  }

  if (event.registrationUrl) {
    eventData.url = event.registrationUrl
  }

  return eventData
}

/**
 * Person structured data for team members
 */
export interface PersonData {
  name: string
  role: string
  bio?: string
  image?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    website?: string
  }
}

export function getPersonStructuredData(person: PersonData): WithContext<Person> {
  const personData: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.role,
    description: person.bio,
    image: person.image,
    affiliation: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
    },
  }

  if (person.socialLinks) {
    const sameAs: string[] = []
    if (person.socialLinks.linkedin) sameAs.push(person.socialLinks.linkedin)
    if (person.socialLinks.twitter) sameAs.push(person.socialLinks.twitter)
    if (person.socialLinks.website) sameAs.push(person.socialLinks.website)
    if (sameAs.length > 0) {
      personData.sameAs = sameAs
    }
  }

  return personData
}

/**
 * Helper to render structured data as a script tag
 */
export function renderStructuredData(data: WithContext<any>): string {
  return JSON.stringify(data, null, 0)
}
