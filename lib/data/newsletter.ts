import { createServiceRoleClient } from "@/lib/supabase/service"

export type SubscriberStatus = "active" | "unsubscribed" | "bounced"
export type CampaignStatus = "draft" | "sending" | "sent" | "cancelled"

export interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  status: SubscriberStatus
  is_active: boolean
  source: string
  unsubscribe_token: string
  subscribed_at: string
  unsubscribed_at: string | null
  last_emailed_at: string | null
  emails_sent_count: number
  created_at?: string
  updated_at?: string
}

export interface NewsletterCampaign {
  id: string
  title: string
  subject: string
  preview_text: string | null
  content_html: string
  status: CampaignStatus
  recipients_count: number
  success_count: number
  failure_count: number
  is_public: boolean
  sent_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface NewsletterStats {
  totalSubscribers: number
  activeSubscribers: number
  unsubscribedCount: number
  newThisMonth: number
  totalCampaigns: number
  sentCampaigns: number
  totalEmailsDelivered: number
}

export interface FetchSubscribersOptions {
  page?: number
  pageSize?: number
  search?: string
  status?: "all" | SubscriberStatus
  source?: string
  sortBy?: "subscribed_at" | "email" | "name"
  sortOrder?: "asc" | "desc"
}

export interface FetchSubscribersResult {
  subscribers: NewsletterSubscriber[]
  stats: NewsletterStats
  sources: string[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export interface FetchCampaignsOptions {
  page?: number
  pageSize?: number
  status?: "all" | CampaignStatus
  search?: string
  sortBy?: "created_at" | "sent_at"
  sortOrder?: "asc" | "desc"
}

export interface FetchCampaignsResult {
  campaigns: NewsletterCampaign[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

/**
 * Normalizes subscriber record to account for legacy boolean `is_active`
 */
export function normalizeSubscriber(sub: Record<string, unknown>): NewsletterSubscriber {
  const isActive = sub.is_active !== false && sub.status !== "unsubscribed"
  let status: SubscriberStatus = "active"
  if (sub.status === "bounced") {
    status = "bounced"
  } else if (!isActive || sub.status === "unsubscribed") {
    status = "unsubscribed"
  }

  return {
    id: String(sub.id),
    email: String(sub.email || ""),
    name: sub.name ? String(sub.name) : null,
    status,
    is_active: status === "active",
    source: String(sub.source || "footer"),
    unsubscribe_token: String(sub.unsubscribe_token || ""),
    subscribed_at: String(sub.subscribed_at || new Date().toISOString()),
    unsubscribed_at: sub.unsubscribed_at ? String(sub.unsubscribed_at) : null,
    last_emailed_at: sub.last_emailed_at ? String(sub.last_emailed_at) : null,
    emails_sent_count: Number(sub.emails_sent_count || 0),
    created_at: sub.created_at ? String(sub.created_at) : undefined,
    updated_at: sub.updated_at ? String(sub.updated_at) : undefined,
  }
}

/**
 * Fetch subscribers with pagination, search, status filters, and concurrent KPI aggregates
 */
export async function fetchNewsletterSubscribers(
  options: FetchSubscribersOptions = {}
): Promise<FetchSubscribersResult> {
  const serviceSupabase = createServiceRoleClient()

  const page = Math.max(1, options.page || 1)
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 15))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const sortBy = options.sortBy || "subscribed_at"
  const sortOrder = options.sortOrder || "desc"
  const isAscending = sortOrder === "asc"

  // 1. Fetch Aggregated Statistics
  const statsPromise = (async (): Promise<NewsletterStats> => {
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [
        totalRes,
        activeRes,
        unsubscribedRes,
        thisMonthRes,
        campaignsTotalRes,
        campaignsSentRes,
      ] = await Promise.all([
        serviceSupabase.from("newsletter_subscriptions").select("*", { count: "exact", head: true }),
        serviceSupabase
          .from("newsletter_subscriptions")
          .select("*", { count: "exact", head: true })
          .or("status.eq.active,is_active.eq.true"),
        serviceSupabase
          .from("newsletter_subscriptions")
          .select("*", { count: "exact", head: true })
          .or("status.eq.unsubscribed,is_active.eq.false"),
        serviceSupabase
          .from("newsletter_subscriptions")
          .select("*", { count: "exact", head: true })
          .gte("subscribed_at", firstDayOfMonth),
        serviceSupabase.from("newsletter_campaigns").select("*", { count: "exact", head: true }),
        serviceSupabase
          .from("newsletter_campaigns")
          .select("success_count")
          .eq("status", "sent"),
      ])

      const totalEmailsDelivered = (campaignsSentRes.data || []).reduce(
        (acc: number, curr: { success_count?: number | null }) => acc + (curr.success_count || 0),
        0
      )

      return {
        totalSubscribers: totalRes.count || 0,
        activeSubscribers: activeRes.count || 0,
        unsubscribedCount: unsubscribedRes.count || 0,
        newThisMonth: thisMonthRes.count || 0,
        totalCampaigns: campaignsTotalRes.count || 0,
        sentCampaigns: (campaignsSentRes.data || []).length,
        totalEmailsDelivered,
      }
    } catch (err) {
      console.error("[fetchNewsletterSubscribers] Error calculating stats:", err)
      return {
        totalSubscribers: 0,
        activeSubscribers: 0,
        unsubscribedCount: 0,
        newThisMonth: 0,
        totalCampaigns: 0,
        sentCampaigns: 0,
        totalEmailsDelivered: 0,
      }
    }
  })()

  // 2. Fetch Distinct Sources
  const sourcesPromise = (async (): Promise<string[]> => {
    try {
      const { data } = await serviceSupabase
        .from("newsletter_subscriptions")
        .select("source")
        .not("source", "is", null)
      const unique = Array.from(new Set((data || []).map((d) => d.source).filter(Boolean)))
      return unique.length > 0 ? unique : ["footer", "event_registration", "donation", "manual_admin"]
    } catch {
      return ["footer", "event_registration", "donation", "manual_admin"]
    }
  })()

  // 3. Build Main Query
  let query = serviceSupabase.from("newsletter_subscriptions").select("*", { count: "exact" })

  // Search filter
  if (options.search && options.search.trim()) {
    const term = options.search.trim()
    query = query.or(`email.ilike.%${term}%,name.ilike.%${term}%`)
  }

  // Status filter
  if (options.status && options.status !== "all") {
    if (options.status === "active") {
      query = query.or("status.eq.active,is_active.eq.true")
    } else if (options.status === "unsubscribed") {
      query = query.or("status.eq.unsubscribed,is_active.eq.false")
    } else {
      query = query.eq("status", options.status)
    }
  }

  // Source filter
  if (options.source && options.source !== "all") {
    query = query.eq("source", options.source)
  }

  // Order & Pagination
  query = query.order(sortBy, { ascending: isAscending }).range(from, to)

  const [mainRes, stats, sources] = await Promise.all([query, statsPromise, sourcesPromise])

  if (mainRes.error) {
    console.error("[fetchNewsletterSubscribers] Query error:", mainRes.error)
    return {
      subscribers: [],
      stats,
      sources,
      pagination: {
        page,
        pageSize,
        totalCount: 0,
        totalPages: 0,
      },
    }
  }

  const rawRows = mainRes.data || []
  const totalCount = mainRes.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  const subscribers = rawRows.map(normalizeSubscriber)

  return {
    subscribers,
    stats,
    sources,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  }
}

/**
 * Fetch newsletter campaigns with pagination and filtering
 */
export async function fetchNewsletterCampaigns(
  options: FetchCampaignsOptions = {}
): Promise<FetchCampaignsResult> {
  const serviceSupabase = createServiceRoleClient()

  const page = Math.max(1, options.page || 1)
  const pageSize = Math.min(50, Math.max(1, options.pageSize || 10))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const sortBy = options.sortBy || "created_at"
  const sortOrder = options.sortOrder || "desc"
  const isAscending = sortOrder === "asc"

  let query = serviceSupabase.from("newsletter_campaigns").select("*", { count: "exact" })

  if (options.search && options.search.trim()) {
    const term = options.search.trim()
    query = query.or(`title.ilike.%${term}%,subject.ilike.%${term}%`)
  }

  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status)
  }

  query = query.order(sortBy, { ascending: isAscending }).range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error("[fetchNewsletterCampaigns] Error:", error)
    return {
      campaigns: [],
      pagination: { page, pageSize, totalCount: 0, totalPages: 0 },
    }
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    campaigns: (data || []) as NewsletterCampaign[],
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  }
}

/**
 * Fetch a single campaign by ID
 */
export async function fetchNewsletterCampaignById(id: string): Promise<NewsletterCampaign | null> {
  try {
    const serviceSupabase = createServiceRoleClient()
    const { data, error } = await serviceSupabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return data as NewsletterCampaign
  } catch (err) {
    console.error("[fetchNewsletterCampaignById] Error:", err)
    return null
  }
}

/**
 * Fetch public campaigns for the public archive page
 */
export async function fetchPublicNewsletterArchive(limit = 20): Promise<NewsletterCampaign[]> {
  try {
    const serviceSupabase = createServiceRoleClient()
    const { data, error } = await serviceSupabase
      .from("newsletter_campaigns")
      .select("id, title, subject, preview_text, content_html, sent_at, created_at")
      .eq("status", "sent")
      .eq("is_public", true)
      .order("sent_at", { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data as NewsletterCampaign[]
  } catch (err) {
    console.error("[fetchPublicNewsletterArchive] Error:", err)
    return []
  }
}

/**
 * Fetch a subscriber by their secure unsubscribe token
 */
export async function getSubscriberByToken(token: string): Promise<NewsletterSubscriber | null> {
  try {
    const serviceSupabase = createServiceRoleClient()
    const { data, error } = await serviceSupabase
      .from("newsletter_subscriptions")
      .select("*")
      .eq("unsubscribe_token", token)
      .single()

    if (error || !data) return null
    return normalizeSubscriber(data)
  } catch (err) {
    console.error("[getSubscriberByToken] Error:", err)
    return null
  }
}
