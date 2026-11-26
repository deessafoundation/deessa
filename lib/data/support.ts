import { createServiceRoleClient } from "@/lib/supabase/service"

export interface SupportTicket {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  created_at: string
  issue_type: string
  page_url: string | null
  browser_info: string | null
  screenshot_path: string | null
  screenshot_name: string | null
  reviewed: boolean
  status: "open" | "in_progress" | "resolved" | "closed"
  assignee: string | null
  internal_notes: string | null
  archived: boolean
  last_reply_sent_at: string | null
}

export interface SupportStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  archived: number
  withScreenshot: number
  thisMonth: number
  unassigned: number
}

export interface SupportAssignee {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
}

export interface FetchSupportOptions {
  search?: string
  status?: string // 'all' | 'open' | 'in_progress' | 'resolved' | 'closed'
  issueType?: string // 'all' | 'Bug Report' | 'Feature Request' | etc.
  hasScreenshot?: boolean | "all"
  archived?: boolean | "all"
  assignee?: string
  page?: number
  pageSize?: number
  sortBy?: "created_at" | "name" | "status" | "issue_type"
  sortOrder?: "asc" | "desc"
}

export interface FetchSupportResult {
  tickets: SupportTicket[]
  stats: SupportStats
  assignees: SupportAssignee[]
  issueTypes: string[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

/**
 * Normalizes legacy hyphenated "in-progress" into standard "in_progress"
 */
export function normalizeSupportStatus(
  rawStatus: string | null | undefined
): SupportTicket["status"] {
  if (!rawStatus) return "open"
  const cleaned = rawStatus.toLowerCase().trim()
  if (cleaned === "in-progress" || cleaned === "in_progress") return "in_progress"
  if (cleaned === "resolved") return "resolved"
  if (cleaned === "closed") return "closed"
  return "open"
}

/**
 * Generates an on-demand signed URL for a screenshot in the private support-screenshots bucket.
 * Cached for 1 hour; executed only when viewing details to prevent N+1 SSR bottlenecks.
 */
export async function getSupportScreenshotSignedUrl(path: string): Promise<string | null> {
  if (!path) return null
  try {
    const serviceSupabase = createServiceRoleClient()
    const { data, error } = await serviceSupabase.storage
      .from("support-screenshots")
      .createSignedUrl(path, 3600)

    if (error) {
      console.error("[getSupportScreenshotSignedUrl] Storage error:", error)
      return null
    }
    return data?.signedUrl || null
  } catch (err) {
    console.error("[getSupportScreenshotSignedUrl] Exception:", err)
    return null
  }
}

/**
 * Fetch technical support bug reports with pagination, multi-facet search,
 * status normalization, dynamic stats, and team assignees.
 */
export async function fetchSupportTickets(
  options: FetchSupportOptions = {}
): Promise<FetchSupportResult> {
  const serviceSupabase = createServiceRoleClient()

  const page = Math.max(1, options.page || 1)
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 10))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const sortBy = options.sortBy || "created_at"
  const sortOrder = options.sortOrder || "desc"
  const isAscending = sortOrder === "asc"

  // Base filter for support tickets: must have issue_type, screenshot_path, or page_url
  const supportCondition = "issue_type.not.is.null,screenshot_path.not.is.null,page_url.not.is.null"

  // 1. Fetch Admin Assignees for Team Member Selection
  const assigneesPromise = serviceSupabase
    .from("admin_users")
    .select("id, user_id, email, full_name, role")
    .order("full_name", { ascending: true })

  // 2. Fetch Distinct Issue Types for Dynamic Filter Dropdown
  const issueTypesPromise = serviceSupabase
    .from("contact_submissions")
    .select("issue_type")
    .or(supportCondition)
    .not("issue_type", "is", null)

  // 3. Fetch Aggregated Statistics across all support tickets
  const statsPromise = (async (): Promise<SupportStats> => {
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [
        totalRes,
        openRes,
        inProgressRes,
        resolvedRes,
        closedRes,
        archivedRes,
        withScreenshotRes,
        thisMonthRes,
        unassignedRes,
      ] = await Promise.all([
        // Active non-archived total support tickets
        serviceSupabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .or(supportCondition)
          .eq("archived", false),
        // Open
        serviceSupabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .or(supportCondition)
          .eq("status", "open")
          .eq("archived", false),
        // In Progress (handles both in_progress and legacy in-progress)
        serviceSupabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .or(supportCondition)
          .or("status.eq.in_progress,status.eq.in-progress")
          .eq("archived", false),
        // Resolved
        serviceSupabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .or(supportCondition)
          .eq("status", "resolved")
          .eq("archived", false),
        // Closed
        serviceSupabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .or(supportCondition)
          .eq("status", "closed")
          .eq("archived", false),
        // Archived
        serviceSupabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .or(supportCondition)
          .eq("archived", true),
        // With Screenshots attached
        serviceSupabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .or(supportCondition)
          .not("screenshot_path", "is", null)
          .eq("archived", false),
        // This Month
        serviceSupabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .or(supportCondition)
          .gte("created_at", firstDayOfMonth),
        // Unassigned
        serviceSupabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .or(supportCondition)
          .is("assignee", null)
          .eq("archived", false),
      ])

      return {
        total: totalRes.count || 0,
        open: openRes.count || 0,
        inProgress: inProgressRes.count || 0,
        resolved: resolvedRes.count || 0,
        closed: closedRes.count || 0,
        archived: archivedRes.count || 0,
        withScreenshot: withScreenshotRes.count || 0,
        thisMonth: thisMonthRes.count || 0,
        unassigned: unassignedRes.count || 0,
      }
    } catch (err) {
      console.error("[fetchSupportTickets] Error aggregating stats:", err)
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        archived: 0,
        withScreenshot: 0,
        thisMonth: 0,
        unassigned: 0,
      }
    }
  })()

  // 4. Build Main Paginated Query
  let query = serviceSupabase
    .from("contact_submissions")
    .select("*", { count: "exact" })
    .or(supportCondition)

  // Archived Filter
  if (options.archived === true) {
    query = query.eq("archived", true)
  } else if (options.archived !== "all") {
    query = query.eq("archived", false)
  }

  // Status Filter (handles both in_progress and in-progress seamlessly)
  if (options.status && options.status !== "all") {
    if (options.status === "in_progress" || options.status === "in-progress") {
      query = query.or("status.eq.in_progress,status.eq.in-progress")
    } else {
      query = query.eq("status", options.status)
    }
  }

  // Issue Type Filter
  if (options.issueType && options.issueType !== "all") {
    query = query.eq("issue_type", options.issueType)
  }

  // Has Screenshot Filter
  if (options.hasScreenshot === true) {
    query = query.not("screenshot_path", "is", null)
  } else if (options.hasScreenshot === false) {
    query = query.is("screenshot_path", null)
  }

  // Assignee Filter
  if (options.assignee) {
    if (options.assignee === "unassigned") {
      query = query.is("assignee", null)
    } else {
      query = query.eq("assignee", options.assignee)
    }
  }

  // Full-Text Search across Reporter, Email, Issue Type, Page URL, Subject, and Message
  if (options.search && options.search.trim()) {
    const term = options.search.trim()
    query = query.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,issue_type.ilike.%${term}%,page_url.ilike.%${term}%,subject.ilike.%${term}%,message.ilike.%${term}%`
    )
  }

  // Sorting and Pagination
  query = query
    .order(sortBy, { ascending: isAscending })
    .range(from, to)

  const [mainResult, statsResult, assigneesResult, issueTypesResult] = await Promise.all([
    query,
    statsPromise,
    assigneesPromise,
    issueTypesPromise,
  ])

  if (mainResult.error) {
    console.error("[fetchSupportTickets] Query error:", mainResult.error)
  }

  const rawTickets = (mainResult.data || []) as Partial<SupportTicket>[]
  const totalCount = mainResult.count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Map and normalize records
  const tickets: SupportTicket[] = rawTickets.map((c) => ({
    id: c.id || "",
    name: c.name || "Anonymous Reporter",
    email: c.email || "",
    phone: c.phone || null,
    subject: c.subject || c.issue_type || "Technical Support Report",
    message: c.message || "",
    created_at: c.created_at || new Date().toISOString(),
    issue_type: c.issue_type || "Bug Report",
    page_url: c.page_url || null,
    browser_info: c.browser_info || null,
    screenshot_path: c.screenshot_path || null,
    screenshot_name: c.screenshot_name || null,
    reviewed: Boolean(c.reviewed),
    status: normalizeSupportStatus(c.status),
    assignee: c.assignee || null,
    internal_notes: c.internal_notes || null,
    archived: Boolean(c.archived),
    last_reply_sent_at: c.last_reply_sent_at || null,
  }))

  const assignees: SupportAssignee[] = (assigneesResult.data || []).map((a) => ({
    id: a.id,
    user_id: a.user_id,
    email: a.email,
    full_name: a.full_name || a.email.split("@")[0],
    role: a.role,
  }))

  // Extract unique issue types from database records
  const rawTypes = ((issueTypesResult.data || []) as { issue_type?: string | null }[])
    .map((r) => r.issue_type)
    .filter(Boolean) as string[]
  const issueTypes = Array.from(
    new Set(["Bug Report", "Feature Request", "Content Issue", "Accessibility Issue", ...rawTypes])
  )

  return {
    tickets,
    stats: statsResult,
    assignees,
    issueTypes,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  }
}

/**
 * Fetch a single support ticket by ID with on-demand signed screenshot URL
 */
export async function fetchSupportTicketById(id: string): Promise<{
  ticket: SupportTicket | null
  screenshotUrl: string | null
}> {
  try {
    const serviceSupabase = createServiceRoleClient()
    const { data, error } = await serviceSupabase
      .from("contact_submissions")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return { ticket: null, screenshotUrl: null }
    }

    const ticket: SupportTicket = {
      id: data.id,
      name: data.name || "Anonymous Reporter",
      email: data.email || "",
      phone: data.phone || null,
      subject: data.subject || data.issue_type || "Technical Support Report",
      message: data.message || "",
      created_at: data.created_at || new Date().toISOString(),
      issue_type: data.issue_type || "Bug Report",
      page_url: data.page_url || null,
      browser_info: data.browser_info || null,
      screenshot_path: data.screenshot_path || null,
      screenshot_name: data.screenshot_name || null,
      reviewed: Boolean(data.reviewed),
      status: normalizeSupportStatus(data.status),
      assignee: data.assignee || null,
      internal_notes: data.internal_notes || null,
      archived: Boolean(data.archived),
      last_reply_sent_at: data.last_reply_sent_at || null,
    }

    let screenshotUrl: string | null = null
    if (ticket.screenshot_path) {
      screenshotUrl = await getSupportScreenshotSignedUrl(ticket.screenshot_path)
    }

    return { ticket, screenshotUrl }
  } catch (err) {
    console.error("[fetchSupportTicketById] Error:", err)
    return { ticket: null, screenshotUrl: null }
  }
}
