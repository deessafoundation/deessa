/**
 * Centralized Page SEO Data Layer
 * 
 * Provides server-side loaders and fallbacks for site-wide search and social metadata.
 * Queries the `page_seo` table with triple-layer resilient fallbacks.
 * 
 * @module lib/data/seo-settings
 */

import { createServiceRoleClient } from "@/lib/supabase/service"
import type { PageSEORecord, PageSEOUpdateInput } from "@/lib/types/page-seo"

/**
 * Default fallback definitions for all core public pages.
 * Ensures the website and search engines receive high-craft metadata
 * even if the database table has not yet been populated or is unreachable.
 */
export const DEFAULT_PAGE_SEO_MAP: Record<string, Omit<PageSEORecord, "id">> = {
  "/": {
    path: "/",
    page_name: "Homepage",
    category: "core",
    title: "deessa Foundation - Empowering Autistic Children & Families in Nepal",
    description:
      "A non-profit organization dedicated to autism support, neurodiversity acceptance, and inclusive education for autistic children and their families across Nepal.",
    keywords: [
      "Nepal NGO",
      "autism Nepal",
      "autism support Nepal",
      "autistic children Nepal",
      "neurodiversity Nepal",
      "inclusive education",
      "special education Nepal",
      "disability rights Nepal",
      "deessa Foundation",
    ],
    og_image: "/home/hero/art_banner.jpeg",
    og_image_alt: "Children collaborating in an inclusive learning environment at deessa Foundation",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/about": {
    path: "/about",
    page_name: "Who We Are",
    category: "core",
    title: "Who We Are - Our Mission for Neurodiversity in Nepal | deessa Foundation",
    description:
      "Learn about deessa Foundation, our origins from twin sisters Deetya and Marissa, our mission for autism inclusion, and our vision for an accessible Nepal.",
    keywords: [
      "about deessa",
      "autism charity Nepal",
      "neurodiversity mission",
      "Deetya and Marissa",
      "disability advocacy Nepal",
      "inclusive schools",
    ],
    og_image: "/home/story/two-paths-one-purpose.png",
    og_image_alt: "Illustration of two sisters following paths toward a welcoming school in Nepal",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/whatwedo": {
    path: "/whatwedo",
    page_name: "What We Do",
    category: "programs",
    title: "What We Do - 4 Pillars of Autism Inclusion | deessa Foundation",
    description:
      "We turn understanding into action through four core pillars: Awareness & Community Engagement, Professional Training, Accessible Resources, and Policy Advocacy.",
    keywords: [
      "autism awareness Nepal",
      "teacher training autism",
      "accessible autism resources",
      "inclusive policy advocacy",
      "special needs support Nepal",
    ],
    og_image: "/home/hero/inclusion-begins-at-home.jpg",
    og_image_alt: "Parent and child engaging in interactive developmental learning",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/donate": {
    path: "/donate",
    page_name: "Support Our Mission",
    category: "engagement",
    title: "Donate - Support Autistic Children & Families in Nepal | deessa Foundation",
    description:
      "Every donation provides autism therapies, accessible learning tools, teacher workshops, and direct family support across communities in Nepal.",
    keywords: [
      "donate Nepal",
      "autism donation Nepal",
      "support autistic children",
      "inclusive education donation",
      "NGO charity Nepal",
    ],
    og_image: "/home/hero/art_banner.jpeg",
    og_image_alt: "Children holding colorful creative artwork",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/arts": {
    path: "/arts",
    page_name: "Art & Expression Gallery",
    category: "media",
    title: "Art & Expression Gallery - Neurodivergent Voices | deessa Foundation",
    description:
      "Discover creative artworks and paintings made by children with autism and developmental disabilities in the deessa community, celebrating unique expression.",
    keywords: [
      "autism art gallery",
      "neurodivergent art",
      "children artwork Nepal",
      "creative therapy",
      "deessa art gallery",
    ],
    og_image: "/artWork/art_pic2.jpeg",
    og_image_alt: "Gallery wall of expressive paintings by children with autism",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/podcasts": {
    path: "/podcasts",
    page_name: "Living With Autism Podcast",
    category: "media",
    title: "Living With Autism Podcast - Real Stories & Voices | deessa Foundation",
    description:
      "Honest conversations about autism diagnosis, parenting journeys, inclusive education, and neurodiversity in Nepal, hosted by Sarita & Merina.",
    keywords: [
      "autism podcast Nepal",
      "Living with Autism",
      "neurodiversity podcast",
      "autism parenting stories",
      "Sarita and Merina podcast",
    ],
    og_image: "/podcast_banner.jpeg",
    og_image_alt: "Living With Autism podcast official studio banner",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/stories": {
    path: "/stories",
    page_name: "Stories of Change",
    category: "media",
    title: "Stories of Change - Voices of Resilience & Hope | deessa Foundation",
    description:
      "Real stories from children, parents, and educators navigating autism, breaking barriers, and shaping inclusive communities across Nepal.",
    keywords: [
      "autism stories Nepal",
      "lived experience autism",
      "inclusion success stories",
      "neurodiversity voices",
    ],
    og_image: "/home/hero/inclusion-begins-at-home.jpg",
    og_image_alt: "Parent leader speaking at a community inclusion session",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/events": {
    path: "/events",
    page_name: "Events & Workshops",
    category: "engagement",
    title: "Events & Workshops - Community Gatherings | deessa Foundation",
    description:
      "Join our upcoming autism awareness workshops, sensory-friendly family events, teacher training seminars, and inclusion conferences across Nepal.",
    keywords: [
      "autism workshops Nepal",
      "teacher training events",
      "inclusion conference Nepal",
      "sensory friendly events",
    ],
    og_image: "/home/hero/girls-leadership-football.jpg",
    og_image_alt: "Youth participating together in an outdoor community sports activity",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/contact": {
    path: "/contact",
    page_name: "Contact Us",
    category: "core",
    title: "Contact Us - Reach deessa Foundation in Kathmandu, Nepal",
    description:
      "Connect with our team for family guidance, school partnership inquiries, volunteer opportunities, or visits to our Kathmandu office.",
    keywords: [
      "contact deessa",
      "autism helpline Nepal",
      "Kathmandu NGO office",
      "deessa foundation phone",
      "partner with deessa",
    ],
    og_image: "/public/logo.png",
    og_image_alt: "Official deessa Foundation emblem",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/impact": {
    path: "/impact",
    page_name: "Impact & Results",
    category: "core",
    title: "Measuring What Matters - Our Field Impact | deessa Foundation",
    description:
      "Explore measurable change across Nepal: children supported, educators trained, community awareness reach, and resources distributed.",
    keywords: [
      "deessa impact",
      "autism metrics Nepal",
      "NGO transparency Nepal",
      "children supported autism",
    ],
    og_image: "/home/hero/art_banner.jpeg",
    og_image_alt: "Impact metric infographic highlighting community support",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/community": {
    path: "/community",
    page_name: "Community Feed",
    category: "engagement",
    title: "Community Live Feed - Social Updates & News | deessa Foundation",
    description:
      "Follow our real-time social feed featuring classroom moments, awareness campaigns, parent meetups, and grassroots community updates.",
    keywords: [
      "deessa community feed",
      "autism facebook updates",
      "community activities Nepal",
    ],
    og_image: "/home/hero/inclusion-begins-at-home.jpg",
    og_image_alt: "Community gathering of families and supporters",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
  "/our-story": {
    path: "/our-story",
    page_name: "Our Origin Story",
    category: "core",
    title: "Our Origin Story - The Journey of Deetya & Marissa | deessa Foundation",
    description:
      "How two twin sisters born with clubfoot and autism inspired a nationwide movement for disability inclusion and acceptance in Nepal.",
    keywords: [
      "deessa origin story",
      "Deetya and Marissa",
      "twin sisters story",
      "clubfoot autism Nepal",
    ],
    og_image: "/home/story/two-paths-one-purpose.png",
    og_image_alt: "Two sisters walking hand in hand toward a welcoming classroom",
    canonical_url: null,
    no_index: false,
    is_published: true,
    updated_by: null,
  },
}

/**
 * Fetch SEO settings for a specific page path.
 * Guarantees a valid PageSEORecord return value with zero possibility of undefined crashes.
 */
export async function getPageSEO(path: string): Promise<PageSEORecord> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const defaultFallback: PageSEORecord = {
    id: `default-${normalizedPath.replace(/[^a-z0-9]/gi, "-")}`,
    ...(DEFAULT_PAGE_SEO_MAP[normalizedPath] || {
      path: normalizedPath,
      page_name: normalizedPath.replace("/", "").replace(/-/g, " ") || "Page",
      category: "core",
      title: "deessa Foundation - Empowering Autistic Children & Families in Nepal",
      description:
        "A non-profit organization dedicated to autism support, neurodiversity acceptance, and inclusive education for autistic children and their families across Nepal.",
      keywords: ["deessa Foundation", "autism Nepal", "inclusive education"],
      og_image: "/home/hero/art_banner.jpeg",
      og_image_alt: "deessa Foundation emblem",
      canonical_url: null,
      no_index: false,
      is_published: true,
      updated_by: null,
    }),
  }

  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("page_seo")
      .select("*")
      .eq("path", normalizedPath)
      .maybeSingle()

    if (error || !data) {
      if (normalizedPath === "/") {
        try {
          const { getHomepageSEO } = await import("@/lib/data/homepage-settings")
          const hpSEO = await getHomepageSEO()
          if (hpSEO && (hpSEO.title || hpSEO.description)) {
            return {
              ...defaultFallback,
              title: hpSEO.title || defaultFallback.title,
              description: hpSEO.description || defaultFallback.description,
              keywords: hpSEO.keywords && hpSEO.keywords.length > 0 ? hpSEO.keywords : defaultFallback.keywords,
              og_image: hpSEO.ogImage || defaultFallback.og_image,
            }
          }
        } catch {
          // ignore fallback error
        }
      }
      return defaultFallback
    }

    return {
      ...defaultFallback,
      ...data,
      keywords: Array.isArray(data.keywords) ? data.keywords : defaultFallback.keywords,
    }
  } catch (error) {
    console.warn(`[page-seo] Failed to load SEO for ${normalizedPath}, using fallback:`, error)
    return defaultFallback
  }
}

/**
 * Fetch all page SEO records for the /admin/seo dashboard.
 * Merges existing database rows with default templates so any un-saved
 * page is still visible and editable.
 */
export async function getAllPagesSEO(): Promise<PageSEORecord[]> {
  const allDefaultPaths = Object.keys(DEFAULT_PAGE_SEO_MAP)
  const defaultList: PageSEORecord[] = allDefaultPaths.map((path) => ({
    id: `default-${path.replace(/[^a-z0-9]/gi, "-")}`,
    ...DEFAULT_PAGE_SEO_MAP[path],
  }))

  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("page_seo")
      .select("*")
      .order("path", { ascending: true })

    if (error || !data || data.length === 0) {
      return defaultList
    }

    // Merge database rows with default definitions
    const dbMap = new Map<string, PageSEORecord>()
    data.forEach((row) => dbMap.set(row.path, row as PageSEORecord))

    const merged = allDefaultPaths.map((path) => {
      const dbRow = dbMap.get(path)
      const defaultRow = DEFAULT_PAGE_SEO_MAP[path]
      if (dbRow) {
        return {
          ...defaultRow,
          ...dbRow,
          keywords: Array.isArray(dbRow.keywords) ? dbRow.keywords : defaultRow.keywords,
        } as PageSEORecord
      }
      return {
        id: `default-${path.replace(/[^a-z0-9]/gi, "-")}`,
        ...defaultRow,
      } as PageSEORecord
    })

    // Include any additional custom pages present in DB not in default map
    data.forEach((row) => {
      if (!allDefaultPaths.includes(row.path)) {
        merged.push(row as PageSEORecord)
      }
    })

    return merged
  } catch (error) {
    console.warn("[page-seo] Failed to load all pages SEO, using defaults:", error)
    return defaultList
  }
}
