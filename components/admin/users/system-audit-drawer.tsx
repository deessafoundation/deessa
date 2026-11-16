"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  History,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  FileEdit,
  Trash2,
  UserPlus,
  Layers,
  Search,
  Download,
  RotateCcw,
  Loader2,
  Clock,
  Globe,
  User,
} from "lucide-react"
import { getSystemAuditLogs, type SystemAuditLogItem } from "@/lib/actions/admin-users"
import { notifications } from "@/lib/notifications"

interface SystemAuditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val)
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str
  return `"${sanitized.replace(/"/g, '""')}"`
}

export function SystemAuditDrawer({ open, onOpenChange }: SystemAuditDrawerProps) {
  const [logs, setLogs] = useState<SystemAuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("ALL")

  useEffect(() => {
    let ignore = false
    if (open) {
      getSystemAuditLogs({ limit: 100 })
        .then((res) => {
          if (!ignore) {
            setLogs(res.logs || [])
            setLoading(false)
          }
        })
        .catch((err) => {
          if (!ignore) {
            setLogs([])
            setLoading(false)
            notifications.showError({
              title: "Failed to Load Audit Logs",
              description: err instanceof Error ? err.message : "Failed to load audit history.",
            })
          }
        })
    }
    return () => {
      ignore = true
    }
  }, [open])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const result = await getSystemAuditLogs({ limit: 100 })
      if (result.error) {
        notifications.showError({
          title: "Failed to Load Audit Logs",
          description: result.error,
        })
      } else {
        setLogs(result.logs || [])
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to load audit history.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter logs by action pill and search query
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction =
        actionFilter === "ALL" || log.action.toUpperCase().includes(actionFilter.toUpperCase())

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        log.actor_name?.toLowerCase().includes(q) ||
        log.actor_email?.toLowerCase().includes(q) ||
        (log.new_data && JSON.stringify(log.new_data).toLowerCase().includes(q))

      return matchesAction && matchesSearch
    })
  }, [logs, actionFilter, searchQuery])

  // Quick stats
  const stats = useMemo(() => {
    const total = logs.length
    const logins = logs.filter((l) => l.action.includes("LOGIN")).length
    const updates = logs.filter((l) => l.action.includes("UPDATE") || l.action.includes("BULK")).length
    const security = logs.filter((l) => l.action.includes("PASSWORD") || l.action.includes("LINK")).length

    return { total, logins, updates, security }
  }, [logs])

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      notifications.showWarning({ description: "No logs matching current filter to export." })
      return
    }

    const headers = ["Timestamp", "Action", "Entity Type", "Actor Name", "Actor Email", "Details"]
    const rows = filteredLogs.map((l) => [
      escapeCSVValue(new Date(l.created_at).toISOString()),
      escapeCSVValue(l.action),
      escapeCSVValue(l.entity_type),
      escapeCSVValue(l.actor_name),
      escapeCSVValue(l.actor_email),
      escapeCSVValue(JSON.stringify(l.new_data || {})),
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `security-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    notifications.showSuccess({
      title: "Audit Log Exported",
      description: `Downloaded ${filteredLogs.length} audit records to CSV.`,
    })
  }

  const getActionTheme = (action: string) => {
    const act = action.toUpperCase()
    if (act.includes("LOGIN_FAILED")) {
      return {
        icon: ShieldAlert,
        color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
      }
    }
    if (act.includes("LOGIN")) {
      return {
        icon: ShieldCheck,
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      }
    }
    if (act.includes("PASSWORD") || act.includes("LINK")) {
      return {
        icon: KeyRound,
        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      }
    }
    if (act.includes("CREATE")) {
      return {
        icon: UserPlus,
        color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
      }
    }
    if (act.includes("BULK")) {
      return {
        icon: Layers,
        color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
      }
    }
    if (act.includes("DELETE")) {
      return {
        icon: Trash2,
        color: "text-destructive bg-destructive/10 border-destructive/20",
      }
    }
    return {
      icon: FileEdit,
      color: "text-muted-foreground bg-muted border-border",
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full p-0 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <SheetHeader className="p-6 border-b bg-muted/20 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <History className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <SheetTitle className="text-xl font-bold text-foreground">
                  System Security Audit Trail
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Real-time ledger of authentication events, credential changes, and admin operations.
                </SheetDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-8 text-xs gap-1.5 shrink-0 shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 pt-4">
            <div className="p-2.5 rounded-lg border bg-card text-center">
              <span className="text-[10px] text-muted-foreground block font-medium">Total Events</span>
              <span className="text-base font-bold text-foreground font-mono">{stats.total}</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-card text-center">
              <span className="text-[10px] text-muted-foreground block font-medium">Logins</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">{stats.logins}</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-card text-center">
              <span className="text-[10px] text-muted-foreground block font-medium">Updates</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">{stats.updates}</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-card text-center">
              <span className="text-[10px] text-muted-foreground block font-medium">Credentials</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">{stats.security}</span>
            </div>
          </div>
        </SheetHeader>

        {/* Toolbar & Filters */}
        <div className="p-4 border-b bg-card space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by action, email, actor, or detail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Refresh logs"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Action Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "ALL", label: "All Events" },
              { id: "LOGIN", label: "Logins" },
              { id: "UPDATE", label: "Updates" },
              { id: "CREATE", label: "Created" },
              { id: "PASSWORD", label: "Passwords" },
              { id: "BULK", label: "Bulk" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActionFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all text-[11px] whitespace-nowrap ${
                  actionFilter === tab.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && logs.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">Loading system audit trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center space-y-2 border border-dashed rounded-xl p-8">
              <History className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-sm font-semibold text-foreground">No matching audit events</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search terms or filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const theme = getActionTheme(log.action)
                const Icon = theme.icon
                const ip = (log.new_data?.ip as string) || null

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/20 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg border ${theme.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {log.action}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {log.entity_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <User className="h-3 w-3 text-muted-foreground/70" />
                            <span>{log.actor_name || log.actor_email || "System Service"}</span>
                            {ip && (
                              <>
                                <span className="text-border">•</span>
                                <Globe className="h-3 w-3 text-muted-foreground/70" />
                                <span className="font-mono">{ip}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-mono">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(log.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Metadata details if present */}
                    {log.new_data && typeof log.new_data === "object" && Object.keys(log.new_data).length > 0 && (
                      <div className="p-2 rounded-lg bg-muted/40 font-mono text-[10px] text-muted-foreground break-all">
                        {JSON.stringify(log.new_data)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
