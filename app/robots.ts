import { MetadataRoute } from 'next'

/**
 * Robots.txt configuration for Deessa Foundation
 * 
 * Allows crawling of public marketing pages while explicitly disallowing:
 * - Admin panel (/admin/*)
 * - API routes (/api/*)
 * - Internal tools (/demo, /test-cms)
 * - Payment callback routes
 * - Email verification routes
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deessafoundation.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Admin panel - all routes under /admin
        '/admin/',
        '/admin/*',
        
        // API routes
        '/api/',
        '/api/*',
        
        // Internal tools and testing
        '/demo/',
        '/demo/*',
        '/test-cms/',
        '/test-cms/*',
        
        // Payment callback routes (not useful for search engines)
        '/complete-payment',
        '/donate/success',
        '/donate/cancel',
        '/payments/',
        '/payments/*',
        
        // Email/certificate verification (contains tokens in URL)
        '/verify/',
        '/verify/*',
        '/conference/register/',
        '/conference/register/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
