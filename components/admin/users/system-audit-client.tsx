"use client"

import { useState, useMemo, useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  History,
  ShieldCheck,
  ShieldAlert,
  Shield,
  KeyRound,
  Trash2,
  UserPlus,
  UserCheck,
  Layers,
  Search,
  Download,
  RotateCcw,
  Loader2,
  Globe,
  User,
  ArrowLeft,
  Filter,
  Copy,
  Check,
  Code,
  LayoutList,
  Table as TableIcon,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Sparkles,
  LogOut,
  FileEdit,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Mail,
  CreditCard,
  Users,
  Send,
  Sliders,
} from "lucide-react"
import { getSystemAuditLogs, type SystemAuditLogItem } from "@/lib/actions/admin-users"
import { formatAuditLogToPlainLanguage } from "@/lib/utils/audit-formatter"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface SystemAuditClientProps {
  initialLogs: SystemAuditLogItem[]
  currentAdminId?: string
  currentAdminRole?: string
}

function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val)
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str
  return `"${sanitized.replace(/"/g, '""')}"`
}

export interface ActionTheme {
  label: string
  category: "destructive" | "alert" | "auth" | "create" | "security" | "role" | "status" | "bulk" | "export" | "update" | "system"
  badgeClass: string
  iconContainer: string
  borderAccent: string
  bannerBg: string
  dotColor: string
  icon: React.ElementType
}

export interface AuditDomain {
  id: string
  label: string
  badgeClass: string
  icon: React.ElementType
}

/**
 * Maps raw entity types and actions to executive foundation domains (WHERE).
 */
export function getAuditDomain(entityType?: string, action?: string): AuditDomain {
  const ent = (entityType || "").toLowerCase()
  const act = (action || "").toLowerCase()

  // 1. Identity & Access Management (IAM)
  if (
    ent.includes("user") ||
    ent.includes("admin") ||
    ent.includes("auth") ||
    ent.includes("password") ||
    ent.includes("setup") ||
    ent.includes("profile") ||
    act.includes("login") ||
    act.includes("password") ||
    act.includes("role")
  ) {
    return {
      id: "iam",
      label: "IAM & Security",
      badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25",
      icon: Shield,
    }
  }

  // 2. Inquiries & Contact Submissions
  if (ent.includes("contact") || ent.includes("support") || act.includes("contact") || act.includes("support")) {
    return {
      id: "inquiries",
      label: "Inquiries & Support",
      badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/25",
      icon: Mail,
    }
  }

  // 3. Finances & Donations
  if (ent.includes("donation") || ent.includes("payment") || ent.includes("receipt") || act.includes("donation")) {
    return {
      id: "finances",
      label: "Finances & Donations",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
      icon: CreditCard,
    }
  }

  // 4. Volunteers
  if (ent.includes("volunteer") || act.includes("volunteer")) {
    return {
      id: "volunteers",
      label: "Volunteers",
      badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/25",
      icon: UserCheck,
    }
  }

  // 5. Content & CMS: Stories, Programs, Events, Artworks, Media
  if (
    ent.includes("story") ||
    ent.includes("program") ||
    ent.includes("event") ||
    ent.includes("artwork") ||
    ent.includes("media")
  ) {
    return {
      id: "cms",
      label: "Content & CMS",
      badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25",
      icon: FileText,
    }
  }

  // 6. Community & Partners
  if (ent.includes("partner") || ent.includes("team")) {
    return {
      id: "community",
      label: "Partners & Team",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
      icon: Users,
    }
  }

  // 7. Newsletter & Outreach
  if (ent.includes("newsletter") || act.includes("newsletter") || act.includes("broadcast")) {
    return {
      id: "newsletter",
      label: "Newsletter & Outreach",
      badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25",
      icon: Send,
    }
  }

  // 8. Settings & Configuration
  if (ent.includes("setting") || ent.includes("seo") || ent.includes("stat")) {
    return {
      id: "settings",
      label: "Platform Settings",
      badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25",
      icon: Sliders,
    }
  }

  // Fallback
  return {
    id: "system",
    label: "System",
    badgeClass: "bg-muted text-muted-foreground border-border/80",
    icon: Activity,
  }
}

/**
 * Rich semantic action taxonomy for distinctive color-coding across the entire audit portal.
 * Correctly distinguishes general Status Updates from IAM Access Governance.
 */
export function getActionTheme(action: string, entityType?: string): ActionTheme {
  const act = (action || "").toUpperCase()
  const ent = (entityType || "").toLowerCase()

  // 1. Destructive: DELETE, PURGE, REMOVE
  if (act.includes("DELETE") || act.includes("PURGE") || act.includes("REMOVE")) {
    return {
      label: "Deletion",
      category: "destructive",
      badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
      iconContainer: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
      borderAccent: "border-l-red-500",
      bannerBg: "from-red-500/15 via-red-500/5 to-transparent",
      dotColor: "bg-red-500",
      icon: Trash2,
    }
  }

  // 2. Authentication Failure / Security Alert: LOGIN_FAILED, UNAUTHORIZED, BLOCKED
  if (act.includes("FAILED") || act.includes("ALERT") || act.includes("BLOCKED")) {
    return {
      label: "Security Alert",
      category: "alert",
      badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/35",
      iconContainer: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      borderAccent: "border-l-rose-500",
      bannerBg: "from-rose-500/15 via-rose-500/5 to-transparent",
      dotColor: "bg-rose-500",
      icon: ShieldAlert,
    }
  }

  // 3. Authentication Success / Login
  if (act === "LOGIN" || act.includes("LOGIN_SUCCESS") || act.includes("SIGN_IN")) {
    return {
      label: "Authentication",
      category: "auth",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      iconContainer: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      borderAccent: "border-l-emerald-500",
      bannerBg: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
      icon: ShieldCheck,
    }
  }

  // 4. Logout / Session Exit
  if (act === "LOGOUT" || act.includes("SIGN_OUT")) {
    return {
      label: "Session Exit",
      category: "auth",
      badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30",
      iconContainer: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
      borderAccent: "border-l-slate-400",
      bannerBg: "from-slate-500/15 via-slate-500/5 to-transparent",
      dotColor: "bg-slate-400",
      icon: LogOut,
    }
  }

  // 5. Account Creation / Provisioning: CREATE, INVITE, PROVISION
  if (act.includes("CREATE") || act.includes("INVITE") || act.includes("PROVISION")) {
    return {
      label: "Creation",
      category: "create",
      badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
      iconContainer: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
      borderAccent: "border-l-sky-500",
      bannerBg: "from-sky-500/15 via-sky-500/5 to-transparent",
      dotColor: "bg-sky-500",
      icon: UserPlus,
    }
  }

  // 6. Security & Cryptographic Credentials: PASSWORD, RESET, LINK, RECOVERY
  if (act.includes("PASSWORD") || act.includes("RESET") || act.includes("LINK") || act.includes("CREDENTIAL")) {
    return {
      label: "Credential Reset",
      category: "security",
      badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
      iconContainer: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      borderAccent: "border-l-indigo-500",
      bannerBg: "from-indigo-500/15 via-indigo-500/5 to-transparent",
      dotColor: "bg-indigo-500",
      icon: KeyRound,
    }
  }

  // 7. Role & Privilege Escalation: ROLE, PERMISSION, CLEARANCE
  if (act.includes("ROLE") || act.includes("PERMISSION") || act.includes("CLEARANCE")) {
    return {
      label: "Role Clearance",
      category: "role",
      badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
      iconContainer: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
      borderAccent: "border-l-purple-500",
      bannerBg: "from-purple-500/15 via-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
      icon: Shield,
    }
  }

  // 8. Financial Verification / Receipt Approval
  if (
    (ent.includes("donation") || ent.includes("payment")) &&
    (act.includes("APPROVE") || act.includes("VERIFY") || act.includes("REVIEW"))
  ) {
    return {
      label: "Fiscal Verification",
      category: "security",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      iconContainer: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      borderAccent: "border-l-emerald-500",
      bannerBg: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
      icon: ShieldCheck,
    }
  }

  // 9. Status Toggle: STATUS, SUSPEND, ACTIVATE, RESOLVED, CLOSED
  if (
    act.includes("STATUS") ||
    act.includes("SUSPEND") ||
    act.includes("ACTIVATE") ||
    act.includes("RESOLVED") ||
    act.includes("CLOSED")
  ) {
    const isUserAuth = ent.includes("user") || ent.includes("admin") || ent.includes("auth") || ent.includes("profile")

    if (isUserAuth) {
      return {
        label: "Access Governance",
        category: "status",
        badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
        iconContainer: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        borderAccent: "border-l-amber-500",
        bannerBg: "from-amber-500/15 via-amber-500/5 to-transparent",
        dotColor: "bg-amber-500",
        icon: UserCheck,
      }
    }

    // For general operational modules (contacts, volunteers, donations, stories, etc.)
    return {
      label: "Status Update",
      category: "status",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
      iconContainer: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      borderAccent: "border-l-amber-500",
      bannerBg: "from-amber-500/15 via-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
      icon: RotateCcw,
    }
  }

  // 10. Editorial Publishing: PUBLISH, UNPUBLISH
  if (act.includes("PUBLISH")) {
    return {
      label: act.includes("UN") ? "Unpublished" : "Published",
      category: "update",
      badgeClass: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30",
      iconContainer: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
      borderAccent: "border-l-violet-500",
      bannerBg: "from-violet-500/15 via-violet-500/5 to-transparent",
      dotColor: "bg-violet-500",
      icon: FileText,
    }
  }

  // 11. Batch / Bulk Operations: BULK
  if (act.includes("BULK")) {
    return {
      label: "Bulk Action",
      category: "bulk",
      badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
      iconContainer: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
      borderAccent: "border-l-orange-500",
      bannerBg: "from-orange-500/15 via-orange-500/5 to-transparent",
      dotColor: "bg-orange-500",
      icon: Layers,
    }
  }

  // 12. Data Export / Exfiltration: EXPORT, DOWNLOAD
  if (act.includes("EXPORT") || act.includes("DOWNLOAD")) {
    return {
      label: "Data Export",
      category: "export",
      badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30",
      iconContainer: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
      borderAccent: "border-l-teal-500",
      bannerBg: "from-teal-500/15 via-teal-500/5 to-transparent",
      dotColor: "bg-teal-500",
      icon: Download,
    }
  }

  // 13. General Update / Mutation: UPDATE, EDIT, MODIFY, PATCH
  if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("MODIFY") || act.includes("PATCH")) {
    return {
      label: "Modification",
      category: "update",
      badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
      iconContainer: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      borderAccent: "border-l-blue-500",
      bannerBg: "from-blue-500/15 via-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
      icon: FileEdit,
    }
  }

  // 14. Fallback Default
  return {
    label: "System Event",
    category: "system",
    badgeClass: "bg-muted text-muted-foreground border-border/80",
    iconContainer: "bg-muted text-muted-foreground border-border/80",
    borderAccent: "border-l-muted-foreground/40",
    bannerBg: "from-muted/40 via-muted/10 to-transparent",
    dotColor: "bg-muted-foreground/60",
    icon: Activity,
  }
}

const subscribeNoop = () => () => {}

function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
}

function formatRelativeTime(timestamp: string, now: number): string {
  const diffMs = now - new Date(timestamp).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return "just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return new Date(timestamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function SystemAuditClient({
  initialLogs,
}: SystemAuditClientProps) {
  const [logs, setLogs] = useState<SystemAuditLogItem[]>(initialLogs)
  const [loading, setLoading] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [actionCategory, setActionCategory] = useState<string>("ALL")
  const [entityFilter, setEntityFilter] = useState<string>("ALL")
  const [dateFilter, setDateFilter] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline")

  // Selected Log for Deep Inspection Dialog
  const [selectedLog, setSelectedLog] = useState<SystemAuditLogItem | null>(null)
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [copiedLogId, setCopiedLogId] = useState(false)
  const [inspectorMode, setInspectorMode] = useState<"plain" | "json">("plain")

  // Feed data format display mode (Plain Language vs Raw JSON)
  const [dataDisplayMode, setDataDisplayMode] = useState<"plain" | "json">("plain")

  // Last refresh timestamp & current clock
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date())
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now())
  const isMounted = useIsMounted()

  // Keyboard shortcut: '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        document.getElementById("audit-search-input")?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const result = await getSystemAuditLogs({ limit: 150 })
      if (result.error) {
        notifications.showError({
          title: "Refresh Failed",
          description: result.error,
        })
      } else {
        setLogs(result.logs || [])
        setLastRefreshedAt(new Date())
        setCurrentTime(Date.now())
        notifications.showSuccess({
          title: "Ledger Synchronized",
          description: `Fetched ${result.logs?.length || 0} recent audit events.`,
        })
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to refresh audit log.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Action Category
      if (actionCategory !== "ALL") {
        const act = log.action.toUpperCase()
        const ent = (log.entity_type || "").toLowerCase()
        if (actionCategory === "STATUS" && !act.includes("STATUS") && !act.includes("SUSPEND") && !act.includes("ACTIVATE") && !act.includes("RESOLVED")) return false
        if (actionCategory === "INQUIRIES" && !ent.includes("contact") && !ent.includes("support") && !act.includes("CONTACT") && !act.includes("SUPPORT")) return false
        if (actionCategory === "FINANCES" && !ent.includes("donation") && !ent.includes("payment") && !ent.includes("receipt") && !act.includes("DONATION")) return false
        if (actionCategory === "VOLUNTEERS" && !ent.includes("volunteer") && !act.includes("VOLUNTEER")) return false
        if (actionCategory === "CMS" && !["story", "program", "event", "artwork", "media"].some((k) => ent.includes(k))) return false
        if (actionCategory === "LOGIN" && !act.includes("LOGIN") && !act.includes("SIGN_IN")) return false
        if (actionCategory === "USER" && !act.includes("USER") && !act.includes("ADMIN") && !act.includes("CREATE")) return false
        if (actionCategory === "SECURITY" && !act.includes("PASSWORD") && !act.includes("LINK") && !act.includes("AUTH") && !act.includes("FAILED")) return false
        if (actionCategory === "ROLE" && !act.includes("ROLE") && !act.includes("CLEARANCE") && !act.includes("PERMISSION")) return false
        if (actionCategory === "BULK" && !act.includes("BULK")) return false
        if (actionCategory === "DELETE" && !act.includes("DELETE") && !act.includes("REMOVE") && !act.includes("PURGE")) return false
      }

      // 2. Entity filter
      if (entityFilter !== "ALL") {
        if (log.entity_type.toLowerCase() !== entityFilter.toLowerCase()) return false
      }

      // 3. Date range
      if (dateFilter !== "ALL") {
        const eventTime = new Date(log.created_at).getTime()
        const diffHours = (currentTime - eventTime) / (1000 * 60 * 60)
        if (dateFilter === "24H" && diffHours > 24) return false
        if (dateFilter === "7D" && diffHours > 24 * 7) return false
        if (dateFilter === "30D" && diffHours > 24 * 30) return false
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesAction = log.action.toLowerCase().includes(q)
        const matchesEntity = log.entity_type.toLowerCase().includes(q)
        const matchesActorName = log.actor_name?.toLowerCase().includes(q)
        const matchesActorEmail = log.actor_email?.toLowerCase().includes(q)
        const ip = (log.new_data?.ip as string) || ""
        const matchesIp = ip.toLowerCase().includes(q)
        const matchesPayload = log.new_data ? JSON.stringify(log.new_data).toLowerCase().includes(q) : false

        if (!matchesAction && !matchesEntity && !matchesActorName && !matchesActorEmail && !matchesIp && !matchesPayload) {
          return false
        }
      }

      return true
    })
  }, [logs, actionCategory, entityFilter, dateFilter, searchQuery, currentTime])

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = logs.length
    const logins = logs.filter((l) => l.action.toUpperCase().includes("LOGIN")).length
    const failedLogins = logs.filter((l) => l.action.toUpperCase().includes("LOGIN_FAILED") || l.action.toUpperCase().includes("FAILED")).length
    const userMutations = logs.filter((l) => l.action.toUpperCase().includes("USER") || l.action.toUpperCase().includes("UPDATE") || l.action.toUpperCase().includes("CREATE")).length
    const securityEvents = logs.filter((l) => l.action.toUpperCase().includes("PASSWORD") || l.action.toUpperCase().includes("LINK") || l.action.toUpperCase().includes("AUTH") || l.action.toUpperCase().includes("ROLE")).length
    const destructive = logs.filter((l) => l.action.toUpperCase().includes("DELETE") || l.action.toUpperCase().includes("REMOVE")).length

    return { total, logins, failedLogins, userMutations, securityEvents, destructive }
  }, [logs])

  // Extract distinct entity types for selector
  const entityTypes = useMemo(() => {
    const set = new Set<string>()
    logs.forEach((l) => {
      if (l.entity_type) set.add(l.entity_type)
    })
    return Array.from(set).sort()
  }, [logs])

  // Export CSV with Formula Injection Sanitization
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      notifications.showWarning({ description: "No records found matching current filters to export." })
      return
    }

    const headers = [
      "Event ID",
      "Timestamp (ISO)",
      "Action",
      "Entity Type",
      "Entity ID",
      "Actor Name",
      "Actor Email",
      "IP Address",
      "Metadata JSON",
    ]

    const rows = filteredLogs.map((log) => [
      escapeCSVValue(log.id),
      escapeCSVValue(new Date(log.created_at).toISOString()),
      escapeCSVValue(log.action),
      escapeCSVValue(log.entity_type),
      escapeCSVValue(log.entity_id || ""),
      escapeCSVValue(log.actor_name || ""),
      escapeCSVValue(log.actor_email || ""),
      escapeCSVValue((log.new_data?.ip as string) || ""),
      escapeCSVValue(JSON.stringify(log.new_data || {})),
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `security-audit-ledger-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    notifications.showSuccess({
      title: "Audit Ledger Exported",
      description: `Downloaded ${filteredLogs.length} audit records.`,
    })
  }

  const handleCopyPayload = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
    notifications.showInfo({ description: "Event metadata JSON copied to clipboard." })
  }

  const handleCopyLogId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedLogId(true)
    setTimeout(() => setCopiedLogId(false), 2000)
    notifications.showInfo({ description: "Event UUID copied to clipboard." })
  }

  const isFiltersActive =
    actionCategory !== "ALL" || entityFilter !== "ALL" || dateFilter !== "ALL" || searchQuery.trim() !== ""

  // Pagination State (15 by default)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  // Reset to first page when search query, category, entity, date filter or page size changes
  const [filterKey, setFilterKey] = useState("")
  const currentFilterKey = `${searchQuery}|${actionCategory}|${entityFilter}|${dateFilter}|${pageSize}`
  if (filterKey !== currentFilterKey) {
    setFilterKey(currentFilterKey)
    setCurrentPage(1)
  }

  const totalItems = filteredLogs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, startIndex + pageSize)
  }, [filteredLogs, startIndex, pageSize])

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | "ellipsis")[] = [1]
    if (safeCurrentPage > 3) {
      pages.push("ellipsis")
    }
    const start = Math.max(2, safeCurrentPage - 1)
    const end = Math.min(totalPages - 1, safeCurrentPage + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (safeCurrentPage < totalPages - 2) {
      pages.push("ellipsis")
    }
    pages.push(totalPages)
    return pages
  }, [totalPages, safeCurrentPage])

  const handleResetFilters = () => {
    setSearchQuery("")
    setActionCategory("ALL")
    setEntityFilter("ALL")
    setDateFilter("ALL")
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <Link href="/admin/users" className="hover:text-foreground transition-colors">
              Admin Users
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-foreground font-semibold">Audit Trail</span>
          </nav>

          <div className="flex items-center gap-3 pt-1">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs shrink-0">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Security & Activity Audit Trail
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cryptographic immutable ledger recording authentication events, credential updates, and administrative operations.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <Link href="/admin/users">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold rounded-xl group transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-[0.98] shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Users</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-9 gap-1.5 text-xs font-semibold rounded-xl group transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-[0.98] shadow-2xs hover:shadow-xs cursor-pointer"
            title="Refresh logs from database"
          >
            <RotateCcw className={cn("h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180", loading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-1.5 text-xs font-semibold rounded-xl shadow-xs group transition-all duration-200 hover:shadow-sm active:scale-[0.98] cursor-pointer"
            title="Export filtered records as CSV"
          >
            <Download className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* 2. Executive Stat Cards (Interactive 1-Click Filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Events */}
        <button
          type="button"
          onClick={() => setActionCategory("ALL")}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs relative overflow-hidden group",
            actionCategory === "ALL"
              ? "border-primary/50 bg-card ring-2 ring-primary/20 shadow-sm"
              : "border-border/80 bg-card hover:bg-muted/30"
          )}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Logged Events
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-foreground">{stats.total}</span>
              <Activity className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:scale-110" />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {actionCategory === "ALL" ? "Active Filter (Showing All)" : "Click to view all events"}
            </p>
          </div>
        </button>

        {/* Card 2: Logins & Sessions */}
        <button
          type="button"
          onClick={() => setActionCategory(actionCategory === "LOGIN" ? "ALL" : "LOGIN")}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs relative overflow-hidden group",
            actionCategory === "LOGIN"
              ? "border-emerald-500/50 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-sm"
              : "border-border/80 bg-card hover:bg-emerald-500/[0.03] hover:border-emerald-500/30"
          )}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Logins & Sessions
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {stats.logins}
              </span>
              <ShieldCheck className="h-4 w-4 text-emerald-500 transition-transform group-hover:scale-110" />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {stats.failedLogins > 0 ? (
                <span className="text-rose-600 font-semibold">{stats.failedLogins} failed attempts</span>
              ) : (
                "Zero auth anomalies"
              )}
            </p>
          </div>
        </button>

        {/* Card 3: User Mutations */}
        <button
          type="button"
          onClick={() => setActionCategory(actionCategory === "USER" ? "ALL" : "USER")}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs relative overflow-hidden group",
            actionCategory === "USER"
              ? "border-sky-500/50 bg-sky-500/5 ring-2 ring-sky-500/20 shadow-sm"
              : "border-border/80 bg-card hover:bg-sky-500/[0.03] hover:border-sky-500/30"
          )}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">
              User Management
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">
                {stats.userMutations}
              </span>
              <UserPlus className="h-4 w-4 text-sky-500 transition-transform group-hover:scale-110" />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {actionCategory === "USER" ? "Filtered: User Changes" : "Click to filter users"}
            </p>
          </div>
        </button>

        {/* Card 4: Security & Credentials */}
        <button
          type="button"
          onClick={() => setActionCategory(actionCategory === "SECURITY" ? "ALL" : "SECURITY")}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs relative overflow-hidden group",
            actionCategory === "SECURITY"
              ? "border-indigo-500/50 bg-indigo-500/5 ring-2 ring-indigo-500/20 shadow-sm"
              : "border-border/80 bg-card hover:bg-indigo-500/[0.03] hover:border-indigo-500/30"
          )}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
              Credential Events
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {stats.securityEvents}
              </span>
              <KeyRound className="h-4 w-4 text-indigo-500 transition-transform group-hover:scale-110" />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {actionCategory === "SECURITY" ? "Filtered: Passwords & Links" : "Click to filter security"}
            </p>
          </div>
        </button>

        {/* Card 5: Deletions */}
        <button
          type="button"
          onClick={() => setActionCategory(actionCategory === "DELETE" ? "ALL" : "DELETE")}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs relative overflow-hidden group col-span-2 lg:col-span-1",
            actionCategory === "DELETE"
              ? "border-red-500/50 bg-red-500/5 ring-2 ring-red-500/20 shadow-sm"
              : "border-border/80 bg-card hover:bg-red-500/[0.03] hover:border-red-500/30"
          )}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider block">
              Deletions
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                {stats.destructive}
              </span>
              <Trash2 className="h-4 w-4 text-red-500 transition-transform group-hover:scale-110" />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {actionCategory === "DELETE" ? "Filtered: Removals" : "Click to filter deletions"}
            </p>
          </div>
        </button>
      </div>

      {/* 3. Comprehensive Search & Filter Suite */}
      <Card className="border border-border/80 shadow-xs bg-card rounded-2xl">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="audit-search-input"
                placeholder="Search audit trail by action, actor, email, IP address, or payload keywords... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-xs sm:text-sm bg-background rounded-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-2.5 text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Selectors & View Mode Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Entity Filter Dropdown */}
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger
                  aria-label="Filter by Entity"
                  className="h-10 px-3.5 rounded-xl border border-border/80 bg-background text-xs font-semibold hover:border-primary/40 hover:bg-muted/30 transition-all min-w-[145px] shadow-2xs cursor-pointer gap-2"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                    <SelectValue placeholder="All Entities" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border/80 shadow-lg text-xs">
                  <SelectItem value="ALL">All Entities</SelectItem>
                  {entityTypes.map((et) => (
                    <SelectItem key={et} value={et}>
                      Entity: {et}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Filter Dropdown */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger
                  aria-label="Filter by Date Window"
                  className="h-10 px-3.5 rounded-xl border border-border/80 bg-background text-xs font-semibold hover:border-primary/40 hover:bg-muted/30 transition-all min-w-[135px] shadow-2xs cursor-pointer gap-2"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                    <SelectValue placeholder="All Time" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border/80 shadow-lg text-xs">
                  <SelectItem value="ALL">All Time</SelectItem>
                  <SelectItem value="24H">Last 24 Hours</SelectItem>
                  <SelectItem value="7D">Last 7 Days</SelectItem>
                  <SelectItem value="30D">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Switcher */}
              <div className="flex items-center border rounded-xl p-0.5 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setViewMode("timeline")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                    viewMode === "timeline"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Timeline View"
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Timeline</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                    viewMode === "table"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Table View"
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>

              {/* Data Format Mode Switcher: Plain Language vs Raw JSON */}
              <div className="flex items-center border rounded-xl p-0.5 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setDataDisplayMode("plain")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                    dataDisplayMode === "plain"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Display plain human-readable descriptions (Default)"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Plain</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDataDisplayMode("json")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                    dataDisplayMode === "json"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Display raw JSON payloads"
                >
                  <Code className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Filter Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs border-t border-border/60 pt-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
                <Filter className="h-3 w-3" />
                Category:
              </span>
              {[
                { id: "ALL", label: "All Events" },
                { id: "STATUS", label: "Status Updates" },
                { id: "INQUIRIES", label: "Inquiries & Support" },
                { id: "FINANCES", label: "Finances & Donations" },
                { id: "VOLUNTEERS", label: "Volunteers" },
                { id: "CMS", label: "Content & CMS" },
                { id: "LOGIN", label: "Authentication" },
                { id: "USER", label: "IAM Users" },
                { id: "SECURITY", label: "Credentials & Auth" },
                { id: "DELETE", label: "Deletions" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActionCategory(cat.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer",
                    actionCategory === cat.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {isFiltersActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-primary hover:underline font-semibold whitespace-nowrap shrink-0 ml-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Active Results Counter with Quick Page Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</strong> of{" "}
            <strong>{totalItems}</strong> events
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          {totalPages > 1 && (
            <Badge variant="outline" className="text-[10px] font-mono px-2 py-0 border-border/80 bg-muted/40">
              Page {safeCurrentPage} of {totalPages}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Page Prev/Next on top bar so admin doesn't need to scroll down */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="h-7 w-7 p-0 rounded-lg shadow-2xs hover:bg-muted cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-[11px] font-mono px-1">
                {safeCurrentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="h-7 w-7 p-0 rounded-lg shadow-2xs hover:bg-muted cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <span className="text-[11px] font-mono text-muted-foreground/80 shrink-0" suppressHydrationWarning>
            Last sync: {isMounted ? lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
          </span>
        </div>
      </div>

      {/* 5. Main Feed: Timeline or Table */}
      {loading && logs.length === 0 ? (
        <Card className="p-16 text-center border-dashed rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Synchronizing audit logs...</p>
          <p className="text-xs text-muted-foreground">Decrypting and loading system records.</p>
        </Card>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-16 text-center border-dashed rounded-2xl">
          <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No matching audit events</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing active filters, or changing the selected date window.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="mt-4 h-9 text-xs rounded-xl"
          >
            Reset All Filters
          </Button>
        </Card>
      ) : viewMode === "timeline" ? (
        /* ── TIMELINE VIEW (Architectural Continuous Rail with Scroll Container) ── */
        <div className="max-h-[580px] overflow-y-auto scrollbar-thin pr-2 rounded-2xl">
          <div className="relative pl-6 sm:pl-8 space-y-3.5 before:absolute before:left-3 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-px before:bg-border/70">
            {paginatedLogs.map((log, idx) => {
              const globalIndex = startIndex + idx + 1
              const theme = getActionTheme(log.action, log.entity_type)
              const domain = getAuditDomain(log.entity_type, log.action)
              const Icon = theme.icon
              const DomainIcon = domain.icon
              const ip = (log.new_data?.ip as string) || null
              const plain = formatAuditLogToPlainLanguage(log)
              const relativeTime = formatRelativeTime(log.created_at, currentTime)

            return (
              <div key={log.id} className="relative group">
                {/* Node marker anchored precisely on the continuous rail */}
                <div
                  className={cn(
                    "absolute -left-6 sm:-left-8 top-3.5 h-6 w-6 sm:h-7 sm:w-7 rounded-full border bg-background flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform",
                    theme.badgeClass
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", theme.dotColor)} />
                </div>

                {/* Sleek Event Card */}
                <div
                  onClick={() => setSelectedLog(log)}
                  className="p-3.5 sm:p-4 rounded-2xl border border-border/75 bg-card hover:bg-muted/20 hover:border-primary/40 transition-all cursor-pointer shadow-2xs space-y-2.5"
                >
                  {/* Header Line: Actor + Dual Badges (Domain & Action) + Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
                        #{globalIndex}
                      </span>
                      <div className="flex items-center gap-1.5 font-medium text-xs text-foreground shrink-0">
                        <Avatar className="h-5 w-5 border text-[9px] shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-[9px]">
                            {log.actor_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-xs">{log.actor_name || "System"}</span>
                      </div>

                      {/* 1. Domain Badge (WHERE) */}
                      <span
                        className={cn(
                          "text-[11px] px-2.5 py-0.5 rounded-md font-semibold border inline-flex items-center gap-1.5 shrink-0 shadow-2xs",
                          domain.badgeClass
                        )}
                      >
                        <DomainIcon className="h-3 w-3 shrink-0" />
                        <span>{domain.label}</span>
                      </span>

                      {/* 2. Action Badge (WHAT) */}
                      <span
                        className={cn(
                          "text-[11px] px-2.5 py-0.5 rounded-md font-semibold border inline-flex items-center gap-1.5 shrink-0 shadow-2xs",
                          theme.badgeClass
                        )}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        <span>{theme.label}</span>
                      </span>

                      {/* 3. Raw technical action key (subtle monospace badge) */}
                      <span
                        className="text-[10.5px] font-mono text-muted-foreground/80 bg-muted/60 px-2 py-0.5 rounded border border-border/50 hidden md:inline truncate max-w-[200px]"
                        title={log.action}
                      >
                        {log.action}
                      </span>

                      {log.entity_id && (
                        <span className="text-[11px] font-mono text-muted-foreground/70 hidden lg:inline">
                          #{log.entity_id.slice(0, 8)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 self-start sm:self-auto">
                      <span
                        className="font-medium text-foreground text-[11px] sm:text-xs"
                        suppressHydrationWarning
                      >
                        {isMounted ? relativeTime : log.created_at.slice(0, 10)}
                      </span>
                      <span className="text-border">•</span>
                      <span
                        className="font-mono text-[10.5px] text-muted-foreground/80"
                        suppressHydrationWarning
                      >
                        {isMounted
                          ? new Date(log.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : log.created_at.slice(0, 16).replace("T", " ")}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {/* Human Narrative Sentence */}
                  <p className="text-xs sm:text-[13px] text-foreground/90 font-normal leading-relaxed">
                    {plain.narrative || plain.headline}
                  </p>

                  {/* Micro Metadata Line (attributes and IP) */}
                  {(plain.attributes.length > 0 || ip) && (
                    <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] border-t border-border/40">
                      {plain.attributes.slice(0, 3).map((attr, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 border border-border/50 text-[10.5px] font-mono text-muted-foreground"
                        >
                          <span className="text-muted-foreground/60 font-sans font-medium">{attr.label}:</span>
                          <span className="font-semibold text-foreground">{attr.value}</span>
                        </span>
                      ))}

                      {ip && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 border border-border/50 text-[10.5px] font-mono text-muted-foreground ml-auto">
                          <Globe className="h-2.5 w-2.5 text-muted-foreground/60" />
                          <span>{ip}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          </div>
        </div>
      ) : (
        /* ── TABLE VIEW (With S.No & Scroll Container after 10 rows) ── */
        <Card className="border border-border/80 overflow-hidden shadow-xs rounded-2xl">
          <div className="overflow-x-auto max-h-[580px] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="bg-muted/95 backdrop-blur-md sticky top-0 z-20 border-b border-border/80 shadow-2xs">
                <TableRow className="border-b border-border/80">
                  <TableHead className="w-[56px] text-center font-semibold text-foreground">S.No</TableHead>
                  <TableHead className="w-[170px] font-semibold text-foreground">Timestamp</TableHead>
                  <TableHead className="w-[200px] font-semibold text-foreground">Action</TableHead>
                  <TableHead className="w-[180px] font-semibold text-foreground">Domain & Entity</TableHead>
                  <TableHead className="font-semibold text-foreground">Actor</TableHead>
                  <TableHead className="w-[130px] font-semibold text-foreground">IP Address</TableHead>
                  <TableHead className="w-[90px] text-right font-semibold text-foreground">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log, idx) => {
                  const globalIndex = startIndex + idx + 1
                  const theme = getActionTheme(log.action, log.entity_type)
                  const domain = getAuditDomain(log.entity_type, log.action)
                  const Icon = theme.icon
                  const DomainIcon = domain.icon
                  const ip = (log.new_data?.ip as string) || "—"
                  const relativeTime = formatRelativeTime(log.created_at, currentTime)

                  return (
                    <TableRow
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-muted/30 cursor-pointer text-xs group"
                    >
                      <TableCell className="w-[56px] text-center font-mono text-xs text-muted-foreground font-medium select-none">
                        {globalIndex}
                      </TableCell>

                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground font-sans" suppressHydrationWarning>
                          {isMounted ? relativeTime : log.created_at.slice(0, 10)}
                        </p>
                        <p className="text-[11px] text-muted-foreground" suppressHydrationWarning>
                          {isMounted
                            ? new Date(log.created_at).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : log.created_at.slice(0, 16).replace("T", " ")}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg border shrink-0 shadow-2xs", theme.iconContainer)}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className={cn("text-[11px] px-2 py-0.5 rounded-md font-semibold border inline-flex items-center gap-1.5 truncate max-w-[170px] shadow-2xs", theme.badgeClass)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", theme.dotColor)} />
                            <span className="truncate">{theme.label}</span>
                          </span>
                          <p className="text-[10px] font-mono text-muted-foreground/80 truncate max-w-[170px] mt-0.5" title={log.action}>
                            {log.action}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <span className={cn("text-[11px] px-2 py-0.5 rounded-md font-semibold border inline-flex items-center gap-1.5 truncate max-w-[160px] shadow-2xs", domain.badgeClass)}>
                          <DomainIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{domain.label}</span>
                        </span>
                        <p className="text-[10px] font-mono text-muted-foreground/80 truncate max-w-[160px]">
                          {log.entity_type}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 border shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                            {log.actor_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-foreground truncate max-w-[180px]">
                            {log.actor_name || "System Automation"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[180px] font-mono">
                            {log.actor_email || "system@deessa.org"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Globe className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                        <span className="truncate">{ip}</span>
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs font-semibold text-muted-foreground group-hover:text-primary gap-1"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          </div>
        </Card>
      )}

      {/* 5. Comprehensive Pagination Controls (Bottom) */}
      {totalPages > 1 && (
        <Card className="p-3 sm:p-4 rounded-2xl border border-border/80 bg-card shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-20 text-xs bg-background border-border/80 shadow-2xs cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="hidden sm:inline text-muted-foreground/60">·</span>
              <span className="hidden sm:inline font-mono text-[11px]">
                {startIndex + 1}–{endIndex} of {totalItems} events
              </span>
            </div>

            {/* Numeric Page Buttons & Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage <= 1}
                className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/80 shadow-2xs hover:bg-muted cursor-pointer"
                title="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
                <span className="hidden md:inline text-[11px]">First</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/80 shadow-2xs hover:bg-muted cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden md:inline text-[11px]">Prev</span>
              </Button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {pageNumbers.map((p, i) =>
                  p === "ellipsis" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={safeCurrentPage === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(p as number)}
                      className={cn(
                        "h-8 w-8 p-0 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-all",
                        safeCurrentPage === p
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border-border/80 shadow-2xs hover:bg-muted"
                      )}
                    >
                      {p}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/80 shadow-2xs hover:bg-muted cursor-pointer"
                title="Next page"
              >
                <span className="hidden md:inline text-[11px]">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage >= totalPages}
                className="h-8 px-2.5 rounded-lg text-xs gap-1 border-border/80 shadow-2xs hover:bg-muted cursor-pointer"
                title="Last page"
              >
                <span className="hidden md:inline text-[11px]">Last</span>
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 6. Deep Inspector Modal (Refined & Elevated) */}
      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="w-[92vw] sm:max-w-2xl max-w-2xl max-h-[82vh] h-auto p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
          {selectedLog && (() => {
            const theme = getActionTheme(selectedLog.action, selectedLog.entity_type)
            const domain = getAuditDomain(selectedLog.entity_type, selectedLog.action)
            const ThemeIcon = theme.icon
            const DomainIcon = domain.icon
            const plainLog = formatAuditLogToPlainLanguage(selectedLog)
            const relativeTime = formatRelativeTime(selectedLog.created_at, currentTime)
            const ip = (selectedLog.new_data?.ip as string) || null

            return (
              <>
                {/* 1. Architectural Banner Header */}
                <DialogHeader className={cn("relative py-3.5 px-5 sm:px-6 border-b border-border/60 bg-gradient-to-r shrink-0", theme.bannerBg)}>
                  <div className="flex items-center justify-between gap-3 pr-7">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("p-2 rounded-xl border shadow-2xs shrink-0", theme.iconContainer)}>
                        <ThemeIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <DialogTitle className="text-lg sm:text-xl font-bold font-mono text-foreground truncate">
                            {selectedLog.action}
                          </DialogTitle>
                          {/* 1. Domain Badge */}
                          <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-md border inline-flex items-center gap-1.5 shrink-0 shadow-2xs", domain.badgeClass)}>
                            <DomainIcon className="h-3 w-3 shrink-0" />
                            <span>{domain.label}</span>
                          </span>
                          {/* 2. Action Badge */}
                          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border inline-flex items-center gap-1.5 shrink-0 shadow-2xs", theme.badgeClass)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", theme.dotColor)} />
                            <span>{theme.label}</span>
                          </span>
                        </div>
                        <DialogDescription className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span suppressHydrationWarning>
                            {isMounted
                              ? new Date(selectedLog.created_at).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : selectedLog.created_at.slice(0, 19).replace("T", " ")}
                          </span>
                          <span className="text-border">•</span>
                          <span className="font-semibold text-foreground/90" suppressHydrationWarning>
                            {isMounted ? relativeTime : ""}
                          </span>
                        </DialogDescription>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyPayload(selectedLog.new_data)}
                      className="h-7 text-xs gap-1.5 rounded-lg border-border/80 shrink-0"
                    >
                      {copiedPayload ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </Button>
                  </div>
                </DialogHeader>

                {/* 2. Scrollable Body: Compact Operator, Scope & Parameters */}
                <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto max-h-[calc(82vh-110px)]">
                  {/* Operator & Target Identity Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Operator */}
                    <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                          <User className="h-3 w-3 text-primary" />
                          Operator
                        </span>
                        {selectedLog.actor_name && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery(selectedLog.actor_name || "")
                              setSelectedLog(null)
                            }}
                            className="text-[10.5px] text-primary hover:underline font-semibold cursor-pointer"
                          >
                            Filter →
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border shadow-2xs shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {selectedLog.actor_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">
                            {selectedLog.actor_name || "System Automation"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate font-mono">
                            {selectedLog.actor_email || "system@deessa.org"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Target Resource */}
                    <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-primary" />
                          Target Resource
                        </span>
                        {selectedLog.entity_type && (
                          <button
                            type="button"
                            onClick={() => {
                              setEntityFilter(selectedLog.entity_type)
                              setSelectedLog(null)
                            }}
                            className="text-[10.5px] text-primary hover:underline font-semibold cursor-pointer"
                          >
                            Filter →
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[11px] font-mono font-bold">
                            {selectedLog.entity_type}
                          </Badge>
                          <span className="text-[11px] font-mono text-muted-foreground truncate">
                            {selectedLog.entity_id ? `#${selectedLog.entity_id.slice(0, 16)}` : "System Context"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact 4-Cell Context Bento */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {/* Network IP */}
                    <div className="p-2.5 rounded-xl border border-border/60 bg-card space-y-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Network IP</span>
                      <p className="font-mono text-[11px] font-bold text-foreground flex items-center gap-1 truncate">
                        <Globe className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                        {ip || "Internal"}
                      </p>
                    </div>

                    {/* UTC Time */}
                    <div className="p-2.5 rounded-xl border border-border/60 bg-card space-y-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">UTC Timestamp</span>
                      <p className="font-mono text-[11px] font-bold text-foreground truncate" title={new Date(selectedLog.created_at).toISOString()}>
                        {new Date(selectedLog.created_at).toISOString().slice(0, 10)} {new Date(selectedLog.created_at).toISOString().slice(11, 19)} UTC
                      </p>
                    </div>

                    {/* Impact */}
                    <div className="p-2.5 rounded-xl border border-border/60 bg-card space-y-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Impact</span>
                      <p className="text-[11px] font-bold truncate">
                        {theme.category === "destructive" ? (
                          <span className="text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> Critical
                          </span>
                        ) : theme.category === "security" || theme.category === "alert" ? (
                          <span className="text-amber-600 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3 shrink-0" /> Security
                          </span>
                        ) : (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 shrink-0" /> Normal
                          </span>
                        )}
                      </p>
                    </div>

                    {/* UUID */}
                    <div className="p-2.5 rounded-xl border border-border/60 bg-card space-y-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Log UUID</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLogId(selectedLog.id)}
                        className="font-mono text-[11px] font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 truncate text-left cursor-pointer"
                        title="Copy UUID"
                      >
                        <span>#{selectedLog.id.slice(0, 8)}...</span>
                        {copiedLogId ? <Check className="h-3 w-3 text-emerald-600 shrink-0" /> : <Copy className="h-2.5 w-2.5 opacity-50 shrink-0" />}
                      </button>
                    </div>
                  </div>

                  {/* Operational Narrative Card */}
                  <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/[0.03] space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {plainLog.headline}
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-foreground font-medium leading-relaxed">
                      {plainLog.narrative}
                    </p>
                  </div>

                  {/* Captured Properties Grid (if any) */}
                  {plainLog.attributes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Captured Event Attributes
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {plainLog.attributes.map((attr, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="text-muted-foreground text-[11px] font-medium">{attr.label}</span>
                            <span
                              className={cn(
                                "font-semibold font-mono text-[11px]",
                                attr.badge && "px-1.5 py-0.5 rounded text-[10px] font-sans",
                                attr.badgeVariant === "success" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
                                attr.badgeVariant === "destructive" && "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
                                attr.badgeVariant === "warning" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
                                attr.badgeVariant === "default" && "bg-primary/10 text-primary border border-primary/20"
                              )}
                            >
                              {attr.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payload Inspector with Toggle (Key-Values vs Raw JSON) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        {inspectorMode === "plain" ? <FileText className="h-3.5 w-3.5 text-primary" /> : <Code className="h-3.5 w-3.5 text-primary" />}
                        <span>{inspectorMode === "plain" ? "Payload Attributes" : "Raw JSON Structure"}</span>
                      </span>

                      <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
                        <button
                          type="button"
                          onClick={() => setInspectorMode("plain")}
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer",
                            inspectorMode === "plain" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Attributes
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectorMode("json")}
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer",
                            inspectorMode === "json" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          JSON
                        </button>
                      </div>
                    </div>

                    {inspectorMode === "plain" ? (
                      <div className="p-3 rounded-xl border border-border/70 bg-muted/20 text-xs font-mono space-y-1 max-h-[160px] overflow-y-auto">
                        {selectedLog.new_data && Object.keys(selectedLog.new_data).length > 0 ? (
                          Object.entries(selectedLog.new_data).map(([k, v]) => (
                            <div key={k} className="flex items-baseline gap-2 py-0.5 border-b border-border/40 last:border-0">
                              <span className="text-muted-foreground font-semibold shrink-0 min-w-[110px] text-[11px]">{k}:</span>
                              <span className="text-foreground truncate text-[11px]">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-[11px]">No payload attributes recorded for this event.</span>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-border/70 bg-muted/40 font-mono text-xs overflow-x-auto max-h-[160px]">
                        <pre className="text-foreground whitespace-pre-wrap leading-relaxed text-[11px]">
                          {JSON.stringify(selectedLog.new_data || {}, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Modal Compact Sticky Footer */}
                <div className="py-2.5 px-5 sm:px-6 border-t border-border/60 bg-muted/10 flex items-center justify-between shrink-0 text-xs">
                  <span className="font-mono text-muted-foreground text-[11px] truncate max-w-[260px]">
                    UUID: #{selectedLog.id.slice(0, 16)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLog(null)}
                    className="h-7 text-xs font-semibold px-3 rounded-lg"
                  >
                    Close
                  </Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
