"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  ShieldAlert,
  UserCheck,
  UserX,
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Download,
  CheckCircle2,
  XCircle,
  Eye,
  Table as TableIcon,
  LayoutGrid,
  Shield,
  FileText,
  CreditCard,
  AlertCircle,
  HelpCircle,
  History,
  UserCog,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CreateAdminUserModal } from "./create-admin-user-modal"
import { UserDetailModal } from "./user-detail-modal"
import { RolePermissionsGuideModal } from "./role-permissions-guide-modal"
import { toggleAdminUserStatus, deleteAdminUser, bulkUpdateAdminUsers } from "@/lib/actions/admin-users"
import { notifications } from "@/lib/notifications"
import type { AdminUser, AdminRole } from "@/lib/types/admin"

interface AdminUsersClientProps {
  initialUsers: AdminUser[]
  currentAdminId: string
  currentAdminRole: AdminRole
}

const ROLE_THEMES: Record<
  AdminRole,
  {
    label: string
    badgeClass: string
    icon: React.ElementType
  }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: ShieldAlert,
  },
  ADMIN: {
    label: "Administrator",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: Shield,
  },
  EDITOR: {
    label: "Content Editor",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: FileText,
  },
  FINANCE: {
    label: "Finance Manager",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: CreditCard,
  },
}

function formatLastActive(lastSignInAt?: string | null, now?: number | null) {
  if (!lastSignInAt) {
    return {
      label: "Never signed in",
      status: "never" as const,
      badgeClass: "bg-muted text-muted-foreground border-border/80",
    }
  }
  const date = new Date(lastSignInAt)
  if (!now) {
    return {
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      status: "standard" as const,
      badgeClass: "bg-muted/80 text-muted-foreground border-border/60",
    }
  }
  const diffMs = now - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) {
    return {
      label: "Active just now",
      status: "online" as const,
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    }
  }
  if (diffHours < 24) {
    return {
      label: `${diffHours}h ago`,
      status: "recent" as const,
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    }
  }
  if (diffDays < 7) {
    return {
      label: `${diffDays}d ago`,
      status: "recent" as const,
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    }
  }
  if (diffDays >= 90) {
    return {
      label: `Dormant (${diffDays}d)`,
      status: "dormant" as const,
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    }
  }
  return {
    label: `${diffDays}d ago`,
    status: "standard" as const,
    badgeClass: "bg-muted/80 text-muted-foreground border-border/60",
  }
}

/**
 * Sanitizes and escapes values for CSV export to protect against
 * CSV Formula Injection / Spreadsheet Execution (CWE-1236).
 */
function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val)
  // Prefix formula trigger characters (=, +, -, @, \t, \r) with an apostrophe
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str
  return `"${sanitized.replace(/"/g, '""')}"`
}

export function AdminUsersClient({
  initialUsers,
  currentAdminId,
  currentAdminRole,
}: AdminUsersClientProps) {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Multi-select bulk state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  // Modal & Drawer state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [roleGuideOpen, setRoleGuideOpen] = useState(false)

  const selectedUser = useMemo(() => {
    return initialUsers.find((u) => u.id === selectedUserId) || null
  }, [initialUsers, selectedUserId])

  // Quick action state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [mountedTime, setMountedTime] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMountedTime(Date.now())
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Metrics
  const stats = useMemo(() => {
    const total = initialUsers.length
    const superAdmins = initialUsers.filter((u) => u.role === "SUPER_ADMIN").length
    const active = initialUsers.filter((u) => u.is_active).length
    const inactive = total - active
    const dormant = initialUsers.filter((u) => {
      if (!u.last_sign_in_at) return true
      if (!mountedTime) return false
      const diffMs = mountedTime - new Date(u.last_sign_in_at).getTime()
      return diffMs > 90 * 24 * 60 * 60 * 1000
    }).length

    return { total, superAdmins, active, inactive, dormant }
  }, [initialUsers, mountedTime])

  // Filtering
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        user.full_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.is_active) ||
        (statusFilter === "INACTIVE" && !user.is_active)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [initialUsers, searchQuery, roleFilter, statusFilter])

  // Bulk Selection Logic
  const eligibleUsers = useMemo(() => {
    return filteredUsers.filter((u) => u.id !== currentAdminId)
  }, [filteredUsers, currentAdminId])

  const allEligibleSelected = useMemo(() => {
    return (
      eligibleUsers.length > 0 &&
      eligibleUsers.every((u) => selectedUserIds.includes(u.id))
    )
  }, [eligibleUsers, selectedUserIds])

  const someEligibleSelected = useMemo(() => {
    return eligibleUsers.some((u) => selectedUserIds.includes(u.id))
  }, [eligibleUsers, selectedUserIds])

  const handleToggleSelectAll = () => {
    if (allEligibleSelected) {
      const eligibleIds = new Set(eligibleUsers.map((u) => u.id))
      setSelectedUserIds((prev) => prev.filter((id) => !eligibleIds.has(id)))
    } else {
      const eligibleIds = eligibleUsers.map((u) => u.id)
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...eligibleIds])))
    }
  }

  const handleToggleSelectUser = (userId: string, selected: boolean) => {
    if (userId === currentAdminId) return
    setSelectedUserIds((prev) =>
      selected ? [...prev, userId] : prev.filter((id) => id !== userId)
    )
  }

  const handleOpenDetail = (user: AdminUser) => {
    setSelectedUserId(user.id)
    setDetailModalOpen(true)
  }

  const handleToggleStatus = async (user: AdminUser, e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (user.id === currentAdminId) {
      notifications.showWarning({
        title: "Action Not Permitted",
        description: "You cannot deactivate your own administrator account.",
      })
      return
    }

    setUpdatingUserId(user.id)
    const nextStatus = !user.is_active

    try {
      const result = await toggleAdminUserStatus(user.id, nextStatus)

      if (result.error) {
        notifications.showError({
          title: "Update Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: nextStatus ? "Account Activated" : "Account Suspended",
          description: `${user.full_name}'s account has been ${nextStatus ? "activated" : "suspended"}.`,
        })
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to toggle status.",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDeleteUser = async (user: AdminUser, e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (user.id === currentAdminId) {
      notifications.showWarning({
        title: "Action Not Permitted",
        description: "You cannot delete your own account.",
      })
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete administrator ${user.full_name} (${user.email})?`
    )
    if (!confirmed) return

    setUpdatingUserId(user.id)

    try {
      const result = await deleteAdminUser(user.id)

      if (result.error) {
        notifications.showError({
          title: "Delete Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "User Deleted",
          description: `${user.full_name} has been removed from administrator users.`,
        })
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to delete user.",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Bulk Actions
  const handleBulkActivate = async () => {
    if (selectedUserIds.length === 0) return
    setIsBulkUpdating(true)
    try {
      const res = await bulkUpdateAdminUsers(selectedUserIds, "activate")
      if (res.error) {
        notifications.showError({ title: "Bulk Activation Failed", description: res.error })
      } else {
        notifications.showSuccess({
          title: "Accounts Activated",
          description: `Successfully activated ${res.count ?? selectedUserIds.length} administrator account(s).`,
        })
        setSelectedUserIds([])
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to activate accounts.",
      })
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleBulkSuspend = async () => {
    if (selectedUserIds.length === 0) return
    setIsBulkUpdating(true)
    try {
      const res = await bulkUpdateAdminUsers(selectedUserIds, "suspend")
      if (res.error) {
        notifications.showError({ title: "Bulk Suspension Failed", description: res.error })
      } else {
        notifications.showSuccess({
          title: "Accounts Suspended",
          description: `Successfully suspended ${res.count ?? selectedUserIds.length} administrator account(s).`,
        })
        setSelectedUserIds([])
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to suspend accounts.",
      })
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleBulkSetRole = async (newRole: AdminRole) => {
    if (selectedUserIds.length === 0) return
    setIsBulkUpdating(true)
    try {
      const res = await bulkUpdateAdminUsers(selectedUserIds, "set_role", newRole)
      if (res.error) {
        notifications.showError({ title: "Bulk Role Assignment Failed", description: res.error })
      } else {
        notifications.showSuccess({
          title: "Role Updated",
          description: `Assigned role ${ROLE_THEMES[newRole].label} to ${res.count ?? selectedUserIds.length} administrator account(s).`,
        })
        setSelectedUserIds([])
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update roles.",
      })
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleExportSelectedCSV = () => {
    const selectedUsers = initialUsers.filter((u) => selectedUserIds.includes(u.id))
    if (selectedUsers.length === 0) {
      notifications.showWarning({ description: "No selected users to export." })
      return
    }

    const headers = ["ID", "Full Name", "Email", "Role", "Status", "Last Sign In", "Created At"]
    const rows = selectedUsers.map((u) => [
      escapeCSVValue(u.id),
      escapeCSVValue(u.full_name),
      escapeCSVValue(u.email),
      escapeCSVValue(u.role),
      escapeCSVValue(u.is_active ? "Active" : "Suspended"),
      escapeCSVValue(u.last_sign_in_at ? new Date(u.last_sign_in_at).toISOString() : "Never"),
      escapeCSVValue(new Date(u.created_at).toISOString()),
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `admin-users-selected-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    notifications.showSuccess({
      title: "Export Successful",
      description: `Exported ${selectedUsers.length} selected accounts to CSV.`,
    })
  }

  const hasActiveFilters = searchQuery !== "" || roleFilter !== "ALL" || statusFilter !== "ALL"

  const handleResetFilters = () => {
    setSearchQuery("")
    setRoleFilter("ALL")
    setStatusFilter("ALL")
  }

  const handleExportCSV = () => {
    if (initialUsers.length === 0) {
      notifications.showWarning({ description: "No admin users available to export." })
      return
    }

    const headers = ["ID", "Full Name", "Email", "Role", "Status", "Last Sign In", "Created At"]
    const rows = initialUsers.map((u) => [
      escapeCSVValue(u.id),
      escapeCSVValue(u.full_name),
      escapeCSVValue(u.email),
      escapeCSVValue(u.role),
      escapeCSVValue(u.is_active ? "Active" : "Suspended"),
      escapeCSVValue(u.last_sign_in_at ? new Date(u.last_sign_in_at).toISOString() : "Never"),
      escapeCSVValue(new Date(u.created_at).toISOString()),
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `admin-users-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    notifications.showSuccess({
      title: "Export Successful",
      description: `Exported ${initialUsers.length} admin accounts to CSV.`,
    })
  }

  const isSuperAdmin = currentAdminRole === "SUPER_ADMIN"

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage system access, privileged roles, security policies, and team credentials
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setRoleGuideOpen(true)}
            className="h-10 gap-1.5 font-medium shadow-2xs group transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/5 hover:text-purple-700 dark:hover:text-purple-300 active:scale-[0.98] cursor-pointer hover:shadow-xs"
            title="Interactive Role Capabilities & Permissions Matrix"
          >
            <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden sm:inline">Role Guide</span>
          </Button>

          <Link href="/admin/users/audit">
            <Button
              variant="outline"
              className="h-10 gap-1.5 font-medium shadow-2xs group transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-[0.98] cursor-pointer hover:shadow-xs"
              title="Open Dedicated Security Audit Trail Ledger"
            >
              <History className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform duration-300 group-hover:-rotate-45" />
              <span className="hidden sm:inline">Audit Trail</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-10 gap-2 font-medium shadow-xs group transition-all duration-200 hover:border-teal-500/50 hover:bg-teal-500/5 hover:text-teal-700 dark:hover:text-teal-400 active:scale-[0.98] cursor-pointer hover:shadow-xs"
            title="Export user directory as CSV"
          >
            <Download className="h-4 w-4 text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          {isSuperAdmin && (
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="h-10 gap-2 font-medium shadow-sm group transition-all duration-200 hover:shadow active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              <span>Add Administrator</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. KPI Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Admins */}
        <Card className="border border-border/80 shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Users
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Super Admins */}
        <Card className="border border-border/80 shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Super Admins
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{stats.superAdmins}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Active Accounts */}
        <Card className="border border-border/80 shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Accounts
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{stats.active}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Suspended & Dormant */}
        <Card className="border border-border/80 shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Suspended / Dormant
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-2xl font-bold text-foreground">{stats.inactive}</h3>
                <span className="text-xs text-muted-foreground font-medium">
                  ({stats.dormant} dormant)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search and Filter Toolbar */}
      <Card className="border border-border/80 shadow-xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground px-2">Role:</span>
              {[
                { value: "ALL", label: "All" },
                { value: "SUPER_ADMIN", label: "Super Admin" },
                { value: "ADMIN", label: "Admin" },
                { value: "EDITOR", label: "Editor" },
                { value: "FINANCE", label: "Finance" },
              ].map((rf) => (
                <button
                  key={rf.value}
                  type="button"
                  onClick={() => setRoleFilter(rf.value)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    roleFilter === rf.value
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground px-2">Status:</span>
              {[
                { value: "ALL", label: "All" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Suspended" },
              ].map((sf) => (
                <button
                  key={sf.value}
                  type="button"
                  onClick={() => setStatusFilter(sf.value)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    statusFilter === sf.value
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Filter Summary & Icon-only View Switcher */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong>{filteredUsers.length}</strong> of {initialUsers.length} administrators
            </span>
            {hasActiveFilters && (
              <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                Filtered
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Reset filters
              </button>
            )}

            {/* Icon-only View Mode Toggle */}
            <div className="flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/30 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table View"
                aria-label="Table View"
                className={cn(
                  "p-1.5 rounded-md transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TableIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                title="Cards View"
                aria-label="Cards View"
                className={cn(
                  "p-1.5 rounded-md transition-all cursor-pointer",
                  viewMode === "cards"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Main Views: Table or Cards */}
      {viewMode === "table" ? (
        <Card className="border border-border/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  {isSuperAdmin && (
                    <TableHead className="w-[40px] text-center px-3">
                      <Checkbox
                        checked={
                          allEligibleSelected
                            ? true
                            : someEligibleSelected
                            ? "indeterminate"
                            : false
                        }
                        onCheckedChange={handleToggleSelectAll}
                        aria-label="Select all eligible administrators"
                        disabled={eligibleUsers.length === 0}
                      />
                    </TableHead>
                  )}
                  <TableHead className="w-[50px] text-center">S.No</TableHead>
                  <TableHead className="min-w-[240px]">User & Identity</TableHead>
                  <TableHead className="w-[160px]">Role & Access</TableHead>
                  <TableHead className="w-[150px]">Account Status</TableHead>
                  <TableHead className="w-[140px]">Last Active</TableHead>
                  <TableHead className="w-[130px]">Created Date</TableHead>
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 8 : 7} className="h-44 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                        <p className="text-sm font-semibold text-foreground">No administrators found</p>
                        <p className="text-xs text-muted-foreground">
                          No user accounts match the current search query or filter criteria.
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                            className="mt-2 h-8 text-xs"
                          >
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => {
                    const isSelf = user.id === currentAdminId
                    const roleTheme = ROLE_THEMES[user.role] || ROLE_THEMES.EDITOR
                    const RoleIcon = roleTheme.icon
                    const isUpdating = updatingUserId === user.id
                    const isSelected = selectedUserIds.includes(user.id)
                    const activeInfo = formatLastActive(user.last_sign_in_at, mountedTime)

                    return (
                      <TableRow
                        key={user.id}
                        onClick={() => handleOpenDetail(user)}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors group",
                          isSelected && "bg-primary/5 hover:bg-primary/10"
                        )}
                      >
                        {/* Checkbox Column */}
                        {isSuperAdmin && (
                          <TableCell
                            className="w-[40px] text-center px-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isSelf}
                              onCheckedChange={(checked) => handleToggleSelectUser(user.id, !!checked)}
                              aria-label={`Select ${user.full_name}`}
                            />
                          </TableCell>
                        )}

                        {/* S.No Column */}
                        <TableCell className="text-center font-mono text-xs text-muted-foreground font-medium">
                          {index + 1}
                        </TableCell>

                        {/* User Column */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border shadow-2xs">
                              {user.avatar_url && (
                                <AvatarImage
                                  src={user.avatar_url}
                                  alt={user.full_name}
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {user.full_name?.charAt(0) || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                  {user.full_name}
                                </span>
                                {isSelf && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold px-1.5 py-0"
                                  >
                                    You
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role Column */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs px-2.5 py-0.5 font-medium flex items-center gap-1.5 w-fit ${roleTheme.badgeClass}`}
                          >
                            <RoleIcon className="h-3.5 w-3.5" />
                            <span>{roleTheme.label}</span>
                          </Badge>
                        </TableCell>

                        {/* Status Column with Inline Switch */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.is_active}
                              disabled={isSelf || !isSuperAdmin || isUpdating}
                              onCheckedChange={() => handleToggleStatus(user)}
                              aria-label={`Toggle active status for ${user.full_name}`}
                            />
                            <span
                              className={`text-xs font-medium ${
                                user.is_active
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {user.is_active ? "Active" : "Suspended"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Last Active Column */}
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border font-mono",
                              activeInfo.badgeClass
                            )}
                            title={
                              user.last_sign_in_at
                                ? new Date(user.last_sign_in_at).toLocaleString()
                                : "Never authenticated"
                            }
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                activeInfo.status === "online" || activeInfo.status === "recent"
                                  ? "bg-emerald-500 animate-pulse"
                                  : activeInfo.status === "dormant"
                                  ? "bg-amber-500"
                                  : "bg-muted-foreground/40"
                              )}
                            />
                            <span className="truncate">{activeInfo.label}</span>
                          </span>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs">Account Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleOpenDetail(user)}
                                className="cursor-pointer text-xs"
                              >
                                <Eye className="h-3.5 w-3.5 mr-2" />
                                <span>View & Edit Details</span>
                              </DropdownMenuItem>
                              {isSuperAdmin && !isSelf && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleStatus(user)}
                                    className="cursor-pointer text-xs"
                                  >
                                    {user.is_active ? (
                                      <>
                                        <XCircle className="h-3.5 w-3.5 mr-2 text-amber-600" />
                                        <span>Suspend Account</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                                        <span>Activate Account</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-destructive focus:text-destructive cursor-pointer text-xs"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    <span>Delete User</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* Cards View (Responsive Grid) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <Card className="col-span-full border border-border/80 p-12 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No administrators found</p>
              <p className="text-xs text-muted-foreground">
                No user accounts match the current search query or filter criteria.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-2 h-8 text-xs"
                >
                  Clear all filters
                </Button>
              )}
            </Card>
          ) : (
            filteredUsers.map((user, index) => {
              const isSelf = user.id === currentAdminId
              const roleTheme = ROLE_THEMES[user.role] || ROLE_THEMES.EDITOR
              const RoleIcon = roleTheme.icon
              const isSelected = selectedUserIds.includes(user.id)
              const activeInfo = formatLastActive(user.last_sign_in_at, mountedTime)

              return (
                <Card
                  key={user.id}
                  onClick={() => handleOpenDetail(user)}
                  className={cn(
                    "p-4 border shadow-xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group flex flex-col justify-between gap-4",
                    isSelected
                      ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/80"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {isSuperAdmin && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0"
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isSelf}
                              onCheckedChange={(checked) => handleToggleSelectUser(user.id, !!checked)}
                              aria-label={`Select ${user.full_name}`}
                            />
                          </div>
                        )}
                        <Avatar className="h-10 w-10 border shadow-2xs shrink-0">
                          {user.avatar_url && (
                            <AvatarImage
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {user.full_name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {user.full_name}
                            </h4>
                            {isSelf && (
                              <Badge
                                variant="outline"
                                className="text-[9px] bg-primary/10 text-primary border-primary/20 px-1 py-0 font-semibold"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[190px]">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono text-[11px] text-muted-foreground shrink-0 bg-muted/60 px-1.5 py-0.5 rounded">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 font-medium flex items-center gap-1.5 ${roleTheme.badgeClass}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        <span>{roleTheme.label}</span>
                      </Badge>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border font-mono",
                          activeInfo.badgeClass
                        )}
                        title={
                          user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleString()
                            : "Never authenticated"
                        }
                      >
                        <span
                          className={cn(
                            "h-1 w-1 rounded-full shrink-0",
                            activeInfo.status === "online" || activeInfo.status === "recent"
                              ? "bg-emerald-500"
                              : activeInfo.status === "dormant"
                              ? "bg-amber-500"
                              : "bg-muted-foreground/40"
                          )}
                        />
                        <span className="truncate">{activeInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs mt-auto">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switch
                        checked={user.is_active}
                        disabled={isSelf || !isSuperAdmin}
                        onCheckedChange={() => handleToggleStatus(user)}
                        aria-label={`Toggle active status for ${user.full_name}`}
                      />
                      <span
                        className={
                          user.is_active
                            ? "text-emerald-600 dark:text-emerald-400 font-medium text-xs"
                            : "text-muted-foreground text-xs"
                        }
                      >
                        {user.is_active ? "Active" : "Suspended"}
                      </span>
                    </div>

                    <span className="text-[11px] text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString(undefined, {
                        dateStyle: "short",
                      })}
                    </span>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* 5. Floating Bulk Actions Dock Bar */}
      {selectedUserIds.length > 0 && isSuperAdmin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[92vw] sm:w-auto bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl p-2.5 px-4 flex items-center justify-between sm:justify-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 pr-2 border-r border-border/60 shrink-0">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {selectedUserIds.length}
            </span>
            <span className="text-xs font-medium text-foreground hidden sm:inline">
              Selected
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkUpdating}
              onClick={handleBulkActivate}
              className="h-8 text-xs gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Activate</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isBulkUpdating}
              onClick={handleBulkSuspend}
              className="h-8 text-xs gap-1 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <XCircle className="h-3.5 w-3.5 text-amber-600" />
              <span>Suspend</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isBulkUpdating}
                  className="h-8 text-xs gap-1"
                >
                  <UserCog className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Set Role</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-44">
                <DropdownMenuLabel className="text-xs">Assign Role to Selected</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["SUPER_ADMIN", "ADMIN", "EDITOR", "FINANCE"] as AdminRole[]).map((r) => {
                  const roleTheme = ROLE_THEMES[r]
                  const RoleIcon = roleTheme.icon
                  return (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => handleBulkSetRole(r)}
                      className="text-xs cursor-pointer flex items-center gap-2"
                    >
                      <RoleIcon className="h-3.5 w-3.5" />
                      <span>{roleTheme.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              variant="outline"
              disabled={isBulkUpdating}
              onClick={handleExportSelectedCSV}
              className="h-8 text-xs gap-1 hidden md:inline-flex"
              title="Export selected rows as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              disabled={isBulkUpdating}
              onClick={() => setSelectedUserIds([])}
              className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:inline text-xs">Clear</span>
            </Button>
          </div>

          {isBulkUpdating && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-2 border-l border-border/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="hidden sm:inline">Updating...</span>
            </div>
          )}
        </div>
      )}

      {/* 6. Modals & Drawers */}
      <CreateAdminUserModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <UserDetailModal
        key={selectedUser?.id || "empty"}
        user={selectedUser}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        currentAdminId={currentAdminId}
        currentAdminRole={currentAdminRole}
      />

      <RolePermissionsGuideModal
        open={roleGuideOpen}
        onOpenChange={setRoleGuideOpen}
      />
    </div>
  )
}
