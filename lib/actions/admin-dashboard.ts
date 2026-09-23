"use server"

import { createClient } from "@/lib/supabase/server"
import { type AdminRole, hasPermission, canViewFinance } from "@/lib/types/admin"
import { getDateRange } from "@/lib/utils/date"

export async function getDashboardTrends(role: AdminRole, range: string = "30d") {
  const supabase = await createClient()
  const { start, end } = getDateRange(range)

  const prevEnd = new Date(start)
  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  const trends: Record<string, { current: number; previous: number; change: number }> = {}

  const entities = [
    { table: "projects", key: "projects", perm: "projects" },
    { table: "events", key: "events", perm: "events" },
    { table: "stories", key: "stories", perm: "stories" },
    { table: "team_members", key: "team", perm: "team" },
    { table: "partners", key: "partners", perm: "partners" },
    { table: "contact_submissions", key: "contacts", perm: "contacts" },
  ]

  for (const entity of entities) {
    if (!hasPermission(role, entity.perm)) continue

    const { count: current } = await supabase
      .from(entity.table)
      .select("*", { count: "exact", head: true })
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())

    const { count: previous } = await supabase
      .from(entity.table)
      .select("*", { count: "exact", head: true })
      .gte("created_at", prevStart.toISOString())
      .lt("created_at", start.toISOString())

    const c = current || 0
    const p = previous || 0
    trends[entity.key] = {
      current: c,
      previous: p,
      change: p > 0 ? Math.round(((c - p) / p) * 100) : c > 0 ? 100 : 0,
    }
  }

  if (canViewFinance(role)) {
    const { count: currentDonations } = await supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())

    const { count: previousDonations } = await supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", prevStart.toISOString())
      .lt("created_at", start.toISOString())

    const { data: currentAmounts } = await supabase
      .from("donations")
      .select("amount")
      .eq("payment_status", "completed")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())

    const { data: previousAmounts } = await supabase
      .from("donations")
      .select("amount")
      .eq("payment_status", "completed")
      .gte("created_at", prevStart.toISOString())
      .lt("created_at", start.toISOString())

    const currentTotal = currentAmounts?.reduce((s, d) => s + (d.amount || 0), 0) || 0
    const previousTotal = previousAmounts?.reduce((s, d) => s + (d.amount || 0), 0) || 0

    const dc = currentDonations || 0
    const dp = previousDonations || 0
    trends.donations = {
      current: dc,
      previous: dp,
      change: dp > 0 ? Math.round(((dc - dp) / dp) * 100) : dc > 0 ? 100 : 0,
    }
    trends.totalDonations = {
      current: currentTotal,
      previous: previousTotal,
      change: previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : currentTotal > 0 ? 100 : 0,
    }
  }

  if (hasPermission(role, "volunteers")) {
    const { count: current } = await supabase
      .from("volunteer_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    trends.pendingVolunteers = { current: current || 0, previous: 0, change: 0 }
  }

  if (hasPermission(role, "newsletters")) {
    const { count: current } = await supabase
      .from("newsletter_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    trends.subscribers = { current: current || 0, previous: 0, change: 0 }
  }

  return trends
}

export async function getDonationTrend(range: string = "30d") {
  const supabase = await createClient()
  const { start, end } = getDateRange(range)

  const { data } = await supabase
    .from("donations")
    .select("created_at, amount, payment_status")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: true })

  const dailyMap: Record<string, { amount: number; count: number }> = {}

  const current = new Date(start)
  while (current <= end) {
    const key = current.toISOString().split("T")[0]
    dailyMap[key] = { amount: 0, count: 0 }
    current.setDate(current.getDate() + 1)
  }

  for (const d of data || []) {
    const key = d.created_at.split("T")[0]
    if (dailyMap[key]) {
      dailyMap[key].count += 1
      if (d.payment_status === "completed") {
        dailyMap[key].amount += d.amount || 0
      }
    }
  }

  return Object.entries(dailyMap).map(([date, val]) => ({
    date,
    amount: val.amount,
    count: val.count,
  }))
}

export async function getContentActivity(range: string = "30d") {
  const supabase = await createClient()
  const { start, end } = getDateRange(range)

  const { data } = await supabase
    .from("activity_logs")
    .select("created_at, entity_type, action")
    .eq("action", "CREATE")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: true })

  const dailyMap: Record<string, { projects: number; events: number; stories: number }> = {}

  const current = new Date(start)
  while (current <= end) {
    const key = current.toISOString().split("T")[0]
    dailyMap[key] = { projects: 0, events: 0, stories: 0 }
    current.setDate(current.getDate() + 1)
  }

  for (const log of data || []) {
    const key = log.created_at.split("T")[0]
    if (dailyMap[key]) {
      const entity = log.entity_type.toLowerCase()
      if (entity === "project" || entity === "projects") dailyMap[key].projects++
      else if (entity === "event" || entity === "events") dailyMap[key].events++
      else if (entity === "story" || entity === "stories") dailyMap[key].stories++
    }
  }

  return Object.entries(dailyMap).map(([date, val]) => ({
    date,
    ...val,
  }))
}

export async function getDonationProviderBreakdown() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("donations")
    .select("provider, amount, payment_status")
    .eq("payment_status", "completed")

  const breakdown: Record<string, { count: number; amount: number }> = {}

  for (const d of data || []) {
    const provider = d.provider || "unknown"
    if (!breakdown[provider]) breakdown[provider] = { count: 0, amount: 0 }
    breakdown[provider].count++
    breakdown[provider].amount += d.amount || 0
  }

  const colors: Record<string, string> = {
    stripe: "#8b5cf6",
    khalti: "#6d28d9",
    esewa: "#16a34a",
    unknown: "#6b7280",
  }

  return Object.entries(breakdown).map(([provider, val]) => ({
    provider,
    count: val.count,
    amount: val.amount,
    fill: colors[provider] || colors.unknown,
  }))
}

export async function getPendingActions(role: AdminRole) {
  const supabase = await createClient()
  const actions: Array<{
    id: string
    type: "volunteer" | "contact" | "donation"
    title: string
    subtitle: string
    href: string
    priority: "high" | "medium" | "low"
    created_at: string
  }> = []

  if (hasPermission(role, "volunteers")) {
    const { data: volunteers } = await supabase
      .from("volunteer_applications")
      .select("id, full_name, applied_at")
      .eq("status", "pending")
      .order("applied_at", { ascending: false })
      .limit(5)

    for (const v of volunteers || []) {
      actions.push({
        id: v.id,
        type: "volunteer",
        title: v.full_name,
        subtitle: "Volunteer application pending review",
        href: "/admin/volunteers",
        priority: "medium",
        created_at: v.applied_at,
      })
    }
  }

  if (hasPermission(role, "contacts")) {
    const { data: contacts } = await supabase
      .from("contact_submissions")
      .select("id, name, subject, created_at")
      .order("created_at", { ascending: false })
      .limit(5)

    for (const c of contacts || []) {
      actions.push({
        id: c.id,
        type: "contact",
        title: c.name,
        subtitle: c.subject || "New contact submission",
        href: "/admin/contacts",
        priority: "low",
        created_at: c.created_at,
      })
    }
  }

  if (canViewFinance(role)) {
    const { data: pendingDonations } = await supabase
      .from("donations")
      .select("id, donor_name, amount, created_at")
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false })
      .limit(5)

    for (const d of pendingDonations || []) {
      actions.push({
        id: d.id,
        type: "donation",
        title: d.donor_name,
        subtitle: `₹${(d.amount || 0).toLocaleString()} donation pending`,
        href: "/admin/donations",
        priority: "high",
        created_at: d.created_at,
      })
    }
  }

  actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return actions.slice(0, 10)
}

export async function getFundraisingProgress() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("projects")
    .select("category, raised, goal, status")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  const categoryMap: Record<string, { raised: number; goal: number; count: number }> = {}

  for (const p of data || []) {
    const cat = p.category || "other"
    if (!categoryMap[cat]) categoryMap[cat] = { raised: 0, goal: 0, count: 0 }
    categoryMap[cat].raised += p.raised || 0
    categoryMap[cat].goal += p.goal || 0
    categoryMap[cat].count++
  }

  const categoryColors: Record<string, string> = {
    education: "#3b82f6",
    health: "#22c55e",
    empowerment: "#f59e0b",
    relief: "#ef4444",
    other: "#6b7280",
  }

  return Object.entries(categoryMap)
    .map(([category, val]) => ({
      category,
      raised: val.raised,
      goal: val.goal,
      count: val.count,
      progress: val.goal > 0 ? Math.min(Math.round((val.raised / val.goal) * 100), 100) : 0,
      fill: categoryColors[category] || categoryColors.other,
    }))
    .sort((a, b) => b.raised - a.raised)
}

export async function getVolunteerSkills() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("volunteer_applications")
    .select("skills, interests, availability, status")

  const skillCounts: Record<string, number> = {}
  const interestCounts: Record<string, number> = {}
  const availabilityCounts: Record<string, number> = {}
  const statusCounts: Record<string, number> = {}

  for (const v of data || []) {
    if (v.skills) {
      for (const skill of v.skills) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      }
    }
    if (v.interests) {
      for (const interest of v.interests) {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1
      }
    }
    if (v.availability) {
      availabilityCounts[v.availability] = (availabilityCounts[v.availability] || 0) + 1
    }
    const status = v.status || "pending"
    statusCounts[status] = (statusCounts[status] || 0) + 1
  }

  const topSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([skill, count]) => ({ label: skill, value: count }))

  const topInterests = Object.entries(interestCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([interest, count]) => ({ label: interest, value: count }))

  const availability = Object.entries(availabilityCounts)
    .map(([label, value]) => ({ label, value }))

  const statusBreakdown = Object.entries(statusCounts)
    .map(([label, value]) => ({ label, value }))

  return { topSkills, topInterests, availability, statusBreakdown }
}

export async function getMonthlyVsOneTimeDonations() {
  const supabase = await createClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data } = await supabase
    .from("donations")
    .select("created_at, amount, is_monthly, payment_status")
    .eq("payment_status", "completed")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true })

  const monthlyMap: Record<string, { recurring: number; oneTime: number }> = {}

  const current = new Date(sixMonthsAgo)
  const now = new Date()
  while (current <= now) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`
    monthlyMap[key] = { recurring: 0, oneTime: 0 }
    current.setMonth(current.getMonth() + 1)
  }

  for (const d of data || []) {
    const date = new Date(d.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (monthlyMap[key]) {
      if (d.is_monthly) {
        monthlyMap[key].recurring += d.amount || 0
      } else {
        monthlyMap[key].oneTime += d.amount || 0
      }
    }
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return Object.entries(monthlyMap).map(([key, val]) => {
    const [year, month] = key.split("-")
    return {
      month: `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`,
      recurring: val.recurring,
      oneTime: val.oneTime,
      total: val.recurring + val.oneTime,
    }
  })
}

export async function getEventCapacityData() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, max_capacity, status")
    .eq("status", "published")
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true })
    .limit(8)

  if (!events || events.length === 0) return []

  const eventData = await Promise.all(
    events.map(async (event) => {
      const { count } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .neq("status", "cancelled")

      const registered = count || 0
      const capacity = event.max_capacity || 100
      const fillRate = Math.round((registered / capacity) * 100)

      return {
        title: event.title.length > 20 ? event.title.slice(0, 20) + "..." : event.title,
        registered,
        capacity,
        fillRate,
        date: event.event_date,
      }
    })
  )

  return eventData.sort((a, b) => b.fillRate - a.fillRate)
}

export async function getDonationByCategory() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from("projects")
    .select("id, category")

  if (!projects || projects.length === 0) return []

  const projectMap: Record<string, string[]> = {}
  for (const p of projects) {
    const cat = p.category || "other"
    if (!projectMap[cat]) projectMap[cat] = []
    projectMap[cat].push(p.id)
  }

  const results = await Promise.all(
    Object.entries(projectMap).map(async ([category, projectIds]) => {
      const { data: donations } = await supabase
        .from("donations")
        .select("amount")
        .eq("payment_status", "completed")
        .in("project_id", projectIds)

      const totalAmount = donations?.reduce((s, d) => s + (d.amount || 0), 0) || 0
      const count = donations?.length || 0

      return { category, amount: totalAmount, count }
    })
  )

  const categoryColors: Record<string, string> = {
    education: "#3b82f6",
    health: "#22c55e",
    empowerment: "#f59e0b",
    relief: "#ef4444",
    other: "#6b7280",
  }

  return results
    .map((r) => ({
      ...r,
      fill: categoryColors[r.category] || categoryColors.other,
    }))
    .filter((r) => r.amount > 0 || r.count > 0)
    .sort((a, b) => b.amount - a.amount)
}
