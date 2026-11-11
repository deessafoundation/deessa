import { createServiceRoleClient } from "@/lib/supabase/service"

export interface VolunteerApplication {
  id: string
  full_name: string
  email: string
  phone: string
  occupation: string | null
  skills: string[] | null
  availability: string
  interests: string[] | null
  message: string | null
  applied_at: string
  status: "pending" | "approved" | "rejected"
  admin_notes?: string | null
  reviewed_at?: string | null
  reviewed_by?: string | null
  assigned_role?: string | null
}

export interface VolunteerStats {
  total: number
  pending: number
  approved: number
  rejected: number
  topSkill: { name: string; count: number } | null
  topInterest: { name: string; count: number } | null
}

export interface FetchVolunteersOptions {
  search?: string
  status?: string
  skill?: string
  availability?: string
  page?: number
  pageSize?: number
  sortBy?: "applied_at" | "full_name" | "status"
  sortOrder?: "asc" | "desc"
}

export interface FetchVolunteersResult {
  volunteers: VolunteerApplication[]
  stats: VolunteerStats
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

/**
 * Fetch unified volunteers with server-side filtering, text search, stats and activity audit notes
 */
export async function fetchVolunteers(
  options: FetchVolunteersOptions = {}
): Promise<FetchVolunteersResult> {
  const serviceSupabase = createServiceRoleClient()

  const page = Math.max(1, options.page || 1)
  const pageSize = Math.max(1, Math.min(100, options.pageSize || 20))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const sortBy = options.sortBy || "applied_at"
  const sortOrder = options.sortOrder || "desc"

  // 1. Fetch overall counts & stats (unfiltered by search/pagination for KPI strip)
  const [totalRes, pendingRes, approvedRes, rejectedRes, allRowsRes] = await Promise.all([
    serviceSupabase.from("volunteer_applications").select("id", { count: "exact", head: true }),
    serviceSupabase.from("volunteer_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    serviceSupabase.from("volunteer_applications").select("id", { count: "exact", head: true }).eq("status", "approved"),
    serviceSupabase.from("volunteer_applications").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    serviceSupabase.from("volunteer_applications").select("skills, interests"),
  ])

  // Compute top skill & interest frequencies
  const skillFreq: Record<string, number> = {}
  const interestFreq: Record<string, number> = {}

  for (const row of allRowsRes.data || []) {
    if (row.skills) {
      for (const s of row.skills) {
        skillFreq[s] = (skillFreq[s] || 0) + 1
      }
    }
    if (row.interests) {
      for (const i of row.interests) {
        interestFreq[i] = (interestFreq[i] || 0) + 1
      }
    }
  }

  let topSkill: { name: string; count: number } | null = null
  let topInterest: { name: string; count: number } | null = null

  for (const [name, count] of Object.entries(skillFreq)) {
    if (!topSkill || count > topSkill.count) topSkill = { name, count }
  }
  for (const [name, count] of Object.entries(interestFreq)) {
    if (!topInterest || count > topInterest.count) topInterest = { name, count }
  }

  const stats: VolunteerStats = {
    total: totalRes.count || 0,
    pending: pendingRes.count || 0,
    approved: approvedRes.count || 0,
    rejected: rejectedRes.count || 0,
    topSkill,
    topInterest,
  }

  // 2. Build filtered query for ledger records
  let query = serviceSupabase
    .from("volunteer_applications")
    .select("*", { count: "exact" })

  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status.toLowerCase())
  }

  if (options.availability && options.availability !== "all") {
    query = query.ilike("availability", `%${options.availability}%`)
  }

  if (options.skill && options.skill !== "all") {
    query = query.contains("skills", [options.skill])
  }

  if (options.search && options.search.trim()) {
    const s = options.search.trim()
    query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,occupation.ilike.%${s}%`)
  }

  query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, to)

  const { data: rows, count, error } = await query

  if (error) {
    console.error("[fetchVolunteers Error]:", error)
    return {
      volunteers: [],
      stats,
      pagination: {
        page,
        pageSize,
        totalCount: 0,
        totalPages: 1,
      },
    }
  }

  const totalCount = count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // 3. Fetch latest activity logs for audit notes on the returned records
  const volunteerIds = (rows || []).map((r) => r.id)
  let activityMap: Record<string, { notes?: string; assignedRole?: string; reviewedAt?: string; reviewedBy?: string }> = {}

  if (volunteerIds.length > 0) {
    const { data: logs } = await serviceSupabase
      .from("activity_logs")
      .select("entity_id, new_data, created_at, user_id")
      .eq("entity_type", "volunteer_application")
      .in("entity_id", volunteerIds)
      .order("created_at", { ascending: false })

    if (logs && logs.length > 0) {
      for (const log of logs) {
        if (!activityMap[log.entity_id]) {
          const newData = log.new_data as Record<string, any> | null
          activityMap[log.entity_id] = {
            notes: newData?.notes || null,
            assignedRole: newData?.assigned_role || null,
            reviewedAt: log.created_at,
            reviewedBy: newData?.reviewed_by || log.user_id,
          }
        }
      }
    }
  }

  // Combine rows with audit data
  const volunteers: VolunteerApplication[] = (rows || []).map((v) => {
    const audit = activityMap[v.id]
    return {
      id: v.id,
      full_name: v.full_name,
      email: v.email,
      phone: v.phone,
      occupation: v.occupation,
      skills: v.skills,
      availability: v.availability,
      interests: v.interests,
      message: v.message,
      applied_at: v.applied_at,
      status: v.status as "pending" | "approved" | "rejected",
      admin_notes: audit?.notes || null,
      reviewed_at: audit?.reviewedAt || null,
      reviewed_by: audit?.reviewedBy || null,
      assigned_role: audit?.assignedRole || null,
    }
  })

  return {
    volunteers,
    stats,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  }
}
