import { createServiceRoleClient } from "@/lib/supabase/service"

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  created_at: string
  issue_type?: string | null
  page_url?: string | null
  browser_info?: string | null
  screenshot_path?: string | null
  screenshot_name?: string | null
  reviewed: boolean
  status: "open" | "in_progress" | "resolved" | "closed"
  assignee?: string | null
  internal_notes?: string | null
  archived: boolean
  last_reply_sent_at?: string | null
}

export interface ContactStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  archived: number
  thisMonth: number
  unassigned: number
}

export interface AdminAssignee {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
}

export interface FetchContactsOptions {
  type?: "all" | "general" | "support"
  search?: string
  status?: string // 'all' | 'open' | 'in_progress' | 'resolved' | 'closed'
  archived?: boolean | "all"
  assignee?: string
  page?: number
  pageSize?: number
  sortBy?: "created_at" | "name" | "status"
  sortOrder?: "asc" | "desc"
}

export interface FetchContactsResult {
  contacts: ContactSubmission[]
  stats: ContactStats
  assignees: AdminAssignee[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

/**
 * Fetch unified contacts with server-side filtering, multi-facet text search,
 * comprehensive stats calculation, and team assignee lookup.
 */
export async function fetchContacts(
  options: FetchContactsOptions = {}
): Promise<FetchContactsResult> {
  const serviceSupabase = createServiceRoleClient()

  const page = Math.max(1, options.page || 1)
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 10))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const sortBy = options.sortBy || "created_at"
  const sortOrder = options.sortOrder || "desc"
  const isAscending = sortOrder === "asc"

  // 1. Fetch Admin Assignees for Team Member Selection
  const assigneesPromise = serviceSupabase
    .from("admin_users")
    .select("id, user_id, email, full_name, role")
    .order("full_name", { ascending: true })

  // 2. Fetch Aggregated Statistics across contact submissions
  const statsPromise = (async (): Promise<ContactStats> => {
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const applyTypeFilter = <T extends { is: (...args: unknown[]) => T; or: (...args: unknown[]) => T }>(
        q: T
      ): T => {
        if (options.type === "general") {
          return q.is("issue_type", null).is("screenshot_path", null)
        }
        if (options.type === "support") {
          return q.or("issue_type.not.is.null,screenshot_path.not.is.null,page_url.not.is.null")
        }
        return q
      }

      const [
        totalRes,
        openRes,
        inProgressRes,
        resolvedRes,
        closedRes,
        archivedRes,
        thisMonthRes,
        unassignedRes,
      ] = await Promise.all([
        // Active non-archived total
        applyTypeFilter(
          serviceSupabase
            .from("contact_submissions")
            .select("*", { count: "exact", head: true })
            .eq("archived", false)
        ),
        // Open
        applyTypeFilter(
          serviceSupabase
            .from("contact_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "open")
            .eq("archived", false)
        ),
        // In Progress
        applyTypeFilter(
          serviceSupabase
            .from("contact_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "in_progress")
            .eq("archived", false)
        ),
        // Resolved
        applyTypeFilter(
          serviceSupabase
            .from("contact_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "resolved")
            .eq("archived", false)
        ),
        // Closed
        applyTypeFilter(
          serviceSupabase
            .from("contact_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "closed")
            .eq("archived", false)
        ),
        // Archived
        applyTypeFilter(
          serviceSupabase
            .from("contact_submissions")
            .select("*", { count: "exact", head: true })
            .eq("archived", true)
        ),
        // This Month
        applyTypeFilter(
          serviceSupabase
            .from("contact_submissions")
            .select("*", { count: "exact", head: true })
            .gte("created_at", firstDayOfMonth)
        ),
        // Unassigned
        applyTypeFilter(
          serviceSupabase
            .from("contact_submissions")
            .select("*", { count: "exact", head: true })
            .is("assignee", null)
            .eq("archived", false)
        ),
      ])

      return {
        total: totalRes.count || 0,
        open: openRes.count || 0,
        inProgress: inProgressRes.count || 0,
        resolved: resolvedRes.count || 0,
        closed: closedRes.count || 0,
        archived: archivedRes.count || 0,
        thisMonth: thisMonthRes.count || 0,
        unassigned: unassignedRes.count || 0,
      }
    } catch (err) {
      console.error("[fetchContacts] Error aggregating stats:", err)
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        archived: 0,
        thisMonth: 0,
        unassigned: 0,
      }
    }
  })()

  // 3. Build Main Paginated Query
  let query = serviceSupabase
    .from("contact_submissions")
    .select("*", { count: "exact" })

  // Type Filter (General Contact vs Technical Support Report)
  if (options.type === "general") {
    query = query.is("issue_type", null).is("screenshot_path", null)
  } else if (options.type === "support") {
    query = query.or("issue_type.not.is.null,screenshot_path.not.is.null,page_url.not.is.null")
  }

  // Archived Filter
  if (options.archived === true) {
    query = query.eq("archived", true)
  } else if (options.archived !== "all") {
    query = query.eq("archived", false)
  }

  // Status Filter
  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status)
  }

  // Assignee Filter
  if (options.assignee) {
    if (options.assignee === "unassigned") {
      query = query.is("assignee", null)
    } else {
      query = query.eq("assignee", options.assignee)
    }
  }

  // Full-Text Search
  if (options.search && options.search.trim()) {
    const term = options.search.trim()
    query = query.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,subject.ilike.%${term}%,message.ilike.%${term}%`
    )
  }

  // Sorting and Pagination
  query = query
    .order(sortBy, { ascending: isAscending })
    .range(from, to)

  const [mainResult, statsResult, assigneesResult] = await Promise.all([
    query,
    statsPromise,
    assigneesPromise,
  ])

  if (mainResult.error) {
    console.error("[fetchContacts] Query error:", mainResult.error)
  }

  const rawContacts = (mainResult.data || []) as Partial<ContactSubmission>[]
  const totalCount = mainResult.count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Map and normalize records
  const contacts: ContactSubmission[] = rawContacts.map((c) => ({
    id: c.id,
    name: c.name || "Anonymous",
    email: c.email || "",
    phone: c.phone || null,
    subject: c.subject || "No Subject",
    message: c.message || "",
    created_at: c.created_at || new Date().toISOString(),
    issue_type: c.issue_type || null,
    page_url: c.page_url || null,
    browser_info: c.browser_info || null,
    screenshot_path: c.screenshot_path || null,
    screenshot_name: c.screenshot_name || null,
    reviewed: Boolean(c.reviewed),
    status: (c.status || "open") as ContactSubmission["status"],
    assignee: c.assignee || null,
    internal_notes: c.internal_notes || null,
    archived: Boolean(c.archived),
    last_reply_sent_at: c.last_reply_sent_at || null,
  }))

  const assignees: AdminAssignee[] = (assigneesResult.data || []).map((a) => ({
    id: a.id,
    user_id: a.user_id,
    email: a.email,
    full_name: a.full_name || a.email.split("@")[0],
    role: a.role,
  }))

  return {
    contacts,
    stats: statsResult,
    assignees,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  }
}
