import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

/**
 * Dynamic sitemap generation for Deesha Foundation
 * 
 * Includes:
 * - Static public pages (home, about, contact, etc.)
 * - Dynamic content from CMS (stories, programs/projects, podcasts, events)
 * 
 * Excludes:
 * - Admin routes (/admin/*)
 * - API routes (/api/*)
 * - Auth/login routes
 * - Internal tools (/demo, /test-cms)
 * - Payment callback routes
 * - Draft/unpublished content
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deessafoundation.com'
  
  // Static public pages that should be indexed
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/our-story`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/whatwedo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/podcasts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/podcasts/episodes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/podcasts/highlights`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/impact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/get-involved`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/press`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/newsletter-archive`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/conference`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Fetch dynamic content from database
  const dynamicRoutes = await getDynamicRoutes(baseUrl)

  return [...staticRoutes, ...dynamicRoutes]
}

/**
 * Fetch all published dynamic content (stories, programs, podcasts, events)
 * Uses service role client for build-time compatibility
 */
async function getDynamicRoutes(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Missing Supabase credentials for sitemap generation')
      return []
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const routes: MetadataRoute.Sitemap = []

    // Fetch published stories
    const { data: stories } = await supabase
      .from('stories')
      .select('slug, updated_at, published_at')
      .eq('is_published', true)

    if (stories) {
      stories.forEach((story) => {
        routes.push({
          url: `${baseUrl}/stories/${story.slug}`,
          lastModified: new Date(story.updated_at || story.published_at),
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      })
    }

    // Fetch published programs/projects
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, updated_at, created_at')
      .eq('is_published', true)

    if (projects) {
      projects.forEach((project) => {
        routes.push({
          url: `${baseUrl}/whatwedo/${project.slug}`,
          lastModified: new Date(project.updated_at || project.created_at),
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      })
    }

    // Fetch published podcasts
    const { data: podcasts } = await supabase
      .from('podcasts')
      .select('slug, updated_at, published_at')
      .eq('published', true)

    if (podcasts) {
      podcasts.forEach((podcast) => {
        routes.push({
          url: `${baseUrl}/podcasts/${podcast.slug}`,
          lastModified: new Date(podcast.updated_at || podcast.published_at),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      })
    }

    // Fetch published events with individual detail pages
    const { data: events } = await supabase
      .from('events')
      .select('slug, updated_at, event_date')
      .eq('status', 'published')

    if (events) {
      events.forEach((event) => {
        routes.push({
          url: `${baseUrl}/events/${event.slug}`,
          lastModified: new Date(event.updated_at || event.event_date),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      })
    }

    return routes
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error)
    return []
  }
}
