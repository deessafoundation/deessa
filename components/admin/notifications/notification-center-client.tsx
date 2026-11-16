"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  ExternalLink,
  RotateCcw,
  Search,
  X,
  RefreshCw,
  ClipboardList,
  AtSign,
  MessageSquare,
  Sliders,
  Inbox,
  MailCheck,
  Download,
  Volume2,
  VolumeX,
  Globe,
  User,
  Copy,
  Sparkles,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { FancySelect } from "@/components/ui/fancy-select"
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog"
import { notifications as toast } from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  user_id?: string
  type: string
  title: string
  message: string
  link?: string
  metadata?: Record<string, unknown>
  is_read: boolean
  created_at: string
  read_at?: string
}

interface NotificationCenterClientProps {
  currentUserId?: string
  currentUserRole?: string
  initialMyNotifications?: Notification[]
  initialAllNotifications?: Notification[]
  adminUsersMap?: Record<string, { full_name: string; email: string }>
  initialNotifications?: Notification[] // backward compatibility fallback
}

const FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "unread", label: "Unread Only" },
  { value: "read", label: "Read Only" },
  { value: "assignment", label: "Assignments" },
  { value: "mention", label: "Mentions" },
  { value: "reply", label: "Replies" },
  { value: "status_change", label: "Status Changes" },
  { value: "system", label: "System Alerts" },
]

interface TypeConfig {
  label: string
  icon: typeof Bell
  iconColor: string
  iconBg: string
  badgeClass: string
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  assignment: {
    label: "Assignment",
    icon: ClipboardList,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-500/10 border-sky-500/20",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900/50",
  },
  mention: {
    label: "Mention",
    icon: AtSign,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    badgeClass:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50",
  },
  reply: {
    label: "Reply",
    icon: MessageSquare,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50",
  },
  status_change: {
    label: "Status Change",
    icon: RefreshCw,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    badgeClass:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50",
  },
  system: {
    label: "System",
    icon: Sliders,
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-500/10 border-slate-500/20",
    badgeClass:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
}

function getTypeDetails(type: string): TypeConfig {
  return (
    TYPE_CONFIG[type] || {
      label: type.replace(/_/g, " "),
      icon: Bell,
      iconColor: "text-primary",
      iconBg: "bg-primary/10 border-primary/20",
      badgeClass:
        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    }
  )
}

// Subtle harmonic Web Audio chime
function playNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === "suspended") {
      void ctx.resume()
    }
    const now = ctx.currentTime

    // Dual-tone harmonic chime: G5 (784Hz) -> C6 (1046.5Hz)
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = "sine"
    osc1.frequency.setValueAtTime(784, now)
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12)

    osc2.type = "triangle"
    osc2.frequency.setValueAtTime(523.25, now)
    osc2.frequency.exponentialRampToValueAtTime(784, now + 0.12)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.5)
    osc2.stop(now + 0.5)
  } catch {
    // Suppressed or audio context not allowed yet
  }
}

export default function NotificationCenterClient({
  currentUserId,
  currentUserRole,
  initialMyNotifications = [],
  initialAllNotifications = [],
  adminUsersMap = {},
  initialNotifications,
}: NotificationCenterClientProps) {
  const isSuperAdmin = currentUserRole === "SUPER_ADMIN"

  // Base list fallback
  const fallbackMy = initialMyNotifications.length > 0 ? initialMyNotifications : initialNotifications || []
  const fallbackAll = initialAllNotifications.length > 0 ? initialAllNotifications : fallbackMy

  // Scope: if Super Admin and My notifications is empty while All has items, default to "all"
  const defaultScope = isSuperAdmin && fallbackMy.length === 0 && fallbackAll.length > 0 ? "all" : "mine"
  const [scope, setScope] = useState<"mine" | "all">(defaultScope)

  const [myNotifications, setMyNotifications] = useState<Notification[]>(fallbackMy)
  const [allNotifications, setAllNotifications] = useState<Notification[]>(fallbackAll)

  // Active notifications based on current scope
  const notifications = scope === "all" ? allNotifications : myNotifications
  const setNotifications = (updater: (prev: Notification[]) => Notification[]) => {
    if (scope === "all") {
      setAllNotifications(updater)
    } else {
      setMyNotifications(updater)
    }
  }

  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [isClearingRead, setIsClearingRead] = useState(false)
  const [isSeedingSample, setIsSeedingSample] = useState(false)

  // Batch Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBatchBusy, setIsBatchBusy] = useState(false)
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false)

  // Audio Notification Sound State (persisted in localStorage)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false)

  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const prevNotificationIdsRef = useRef<Set<string>>(new Set(notifications.map((n) => n.id)))

  // Load sound setting from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_notification_sound_enabled")
      if (saved === "true") {
        setSoundEnabled(true)
      }
    } catch {
      // localStorage disabled or SSR
    }
  }, [])

  // Toggle audio chime
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem("admin_notification_sound_enabled", String(next))
      } catch {
        // ignore
      }
      if (next) {
        playNotificationChime()
        toast.showInfo({
          title: "Sound Enabled",
          description: "Audio chime will play when new notifications arrive.",
        })
      } else {
        toast.showInfo({
          title: "Sound Muted",
          description: "Audio chime muted.",
        })
      }
      return next
    })
  }

  // Keyboard navigation shortcuts: '/' for search, 'Escape' to clear search or selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)

      if (e.key === "/" && !isInput) {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === "Escape") {
        if (selectedIds.size > 0) {
          setSelectedIds(new Set())
        } else if (searchQuery) {
          setSearchQuery("")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIds.size, searchQuery])

  // Clear batch selection on scope or filter change
  useEffect(() => {
    setSelectedIds(new Set())
  }, [scope, filter])

  // Polling helper: fetch notifications silently in the background
  const fetchNotifications = useCallback(
    async (showIndicator = false) => {
      if (showIndicator) setIsRefreshing(true)
      try {
        const url =
          isSuperAdmin && scope === "all"
            ? "/api/admin/notifications?limit=200&scope=all"
            : "/api/admin/notifications?limit=100&scope=mine"

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data.notifications)) {
            const fetchedList = data.notifications as Notification[]

            // Check for newly arrived unread notifications
            const newUnread = fetchedList.filter(
              (n) => !prevNotificationIdsRef.current.has(n.id) && !n.is_read
            )
            if (newUnread.length > 0 && soundEnabled) {
              playNotificationChime()
            }

            prevNotificationIdsRef.current = new Set(fetchedList.map((n) => n.id))

            if (scope === "all") {
              setAllNotifications(fetchedList)
            } else {
              setMyNotifications(fetchedList)
            }
          }
        }
      } catch (err) {
        console.error("Error refreshing notifications:", err)
      } finally {
        if (showIndicator) setIsRefreshing(false)
      }
    },
    [isSuperAdmin, scope, soundEnabled]
  )

  // Auto-poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(false)
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Studio Metrics
  const stats = useMemo(() => {
    const total = notifications.length
    const unread = notifications.filter((n) => !n.is_read).length
    const read = total - unread
    const assignments = notifications.filter((n) => n.type === "assignment").length
    const system = notifications.filter((n) => n.type === "system").length
    const mentions = notifications.filter((n) => n.type === "mention" || n.type === "reply").length

    return { total, unread, read, assignments, system, mentions }
  }, [notifications])

  // Filtered and Searched Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Status / Type Filter
      if (filter === "unread" && n.is_read) return false
      if (filter === "read" && !n.is_read) return false
      if (filter !== "all" && filter !== "unread" && filter !== "read" && n.type !== filter) {
        return false
      }

      // 2. Keyword Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const titleMatch = (n.title || "").toLowerCase().includes(q)
        const messageMatch = (n.message || "").toLowerCase().includes(q)
        const typeMatch = (n.type || "").toLowerCase().includes(q)
        const recipientMatch =
          n.user_id && (adminUsersMap[n.user_id]?.full_name || "").toLowerCase().includes(q)
        return titleMatch || messageMatch || typeMatch || recipientMatch
      }

      return true
    })
  }, [notifications, filter, searchQuery, adminUsersMap])

  // Multi-Select Helpers
  const isAllFilteredSelected = useMemo(() => {
    if (filteredNotifications.length === 0) return false
    return filteredNotifications.every((n) => selectedIds.has(n.id))
  }, [filteredNotifications, selectedIds])

  const isSomeFilteredSelected = useMemo(() => {
    if (isAllFilteredSelected) return false
    return filteredNotifications.some((n) => selectedIds.has(n.id))
  }, [filteredNotifications, selectedIds, isAllFilteredSelected])

  const toggleSelectOne = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredNotifications.forEach((n) => next.delete(n.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredNotifications.forEach((n) => next.add(n.id))
        return next
      })
    }
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  // Copy previous system notification to current admin's personal inbox
  const copyToMyInbox = async (notif: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          link: notif.link,
          metadata: notif.metadata,
        }),
      })

      if (!res.ok) throw new Error("Failed to copy notification")
      const result = await res.json()

      if (result.notification) {
        setMyNotifications((prev) => [result.notification, ...prev])
        toast.showSuccess({
          title: "Added to My Notifications",
          description: "Notification copied to your personal inbox.",
        })
      }
    } catch (err) {
      console.error("Error copying notification:", err)
      toast.showError({
        title: "Action Failed",
        description: "Could not add notification to your inbox.",
      })
    }
  }

  // Quick helper to seed sample notifications for testing
  const handleSeedSample = async () => {
    setIsSeedingSample(true)
    try {
      const samples = [
        {
          type: "system",
          title: "System Security Audit Passed",
          message: "All database policies, credentials, and access rules were verified successfully.",
          link: "/admin",
        },
        {
          type: "assignment",
          title: "New Volunteer Review Assignment",
          message: "A new community volunteer application requires your review and approval.",
          link: "/admin/volunteers",
        },
      ]

      for (const sample of samples) {
        const res = await fetch("/api/admin/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUserId,
            ...sample,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.notification) {
            setMyNotifications((prev) => [data.notification, ...prev])
            setAllNotifications((prev) => [data.notification, ...prev])
          }
        }
      }

      toast.showSuccess({
        title: "Sample Notifications Created",
        description: "Added 2 new sample notifications to your inbox.",
      })
    } catch (err) {
      console.error("Error generating sample notifications:", err)
      toast.showError({
        title: "Error",
        description: "Failed to generate sample notifications.",
      })
    } finally {
      setIsSeedingSample(false)
    }
  }

  // Toggle single notification read / unread status
  const toggleReadStatus = async (id: string, currentReadState: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const targetState = !currentReadState

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              is_read: targetState,
              read_at: targetState ? new Date().toISOString() : undefined,
            }
          : n
      )
    )

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: targetState }),
      })
      if (!response.ok) throw new Error("Failed to update status")

      toast.showSuccess({
        title: targetState ? "Marked as read" : "Marked as unread",
        description: targetState ? "Notification marked as read." : "Notification moved back to unread.",
      })
    } catch (error) {
      console.error("Error updating notification read state:", error)
      toast.showError({
        title: "Error",
        description: "Failed to update notification state",
      })
      fetchNotifications(false)
    }
  }

  // Batch Operations
  const handleBatchSetRead = async (targetReadState: boolean) => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    setIsBatchBusy(true)
    const idSet = new Set(ids)
    const now = targetReadState ? new Date().toISOString() : undefined

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (idSet.has(n.id) ? { ...n, is_read: targetReadState, read_at: now } : n))
    )

    try {
      const res = await fetch("/api/admin/notifications/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: targetReadState ? "mark_read" : "mark_unread",
          ids,
        }),
      })

      if (!res.ok) throw new Error("Failed batch update")

      toast.showSuccess({
        title: targetReadState ? "Marked as read" : "Marked as unread",
        description: `${ids.length} notification${ids.length > 1 ? "s" : ""} updated.`,
      })
      setSelectedIds(new Set())
    } catch (error) {
      console.error("Batch update error:", error)
      toast.showError({
        title: "Batch Action Failed",
        description: "Could not update selected notifications.",
      })
      fetchNotifications(false)
    } finally {
      setIsBatchBusy(false)
    }
  }

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    setIsBatchBusy(true)
    const idSet = new Set(ids)

    // Optimistic update
    setNotifications((prev) => prev.filter((n) => !idSet.has(n.id)))

    try {
      const res = await fetch("/api/admin/notifications/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids }),
      })

      if (!res.ok) throw new Error("Failed batch delete")

      toast.showSuccess({
        title: "Deleted",
        description: `${ids.length} notification${ids.length > 1 ? "s" : ""} deleted.`,
      })
      setSelectedIds(new Set())
      setBatchDeleteDialogOpen(false)
    } catch (error) {
      console.error("Batch delete error:", error)
      toast.showError({
        title: "Batch Action Failed",
        description: "Could not delete selected notifications.",
      })
      fetchNotifications(false)
    } finally {
      setIsBatchBusy(false)
    }
  }

  // CSV Export
  const handleExportCSV = () => {
    const targetNotifications =
      selectedIds.size > 0
        ? notifications.filter((n) => selectedIds.has(n.id))
        : filteredNotifications

    if (targetNotifications.length === 0) {
      toast.showInfo({
        title: "Nothing to export",
        description: "No notifications match the current selection or filter.",
      })
      return
    }

    const headers = [
      "ID",
      "Recipient",
      "Type",
      "Title",
      "Message",
      "Link",
      "Status",
      "Created At",
      "Read At",
    ]
    const rows = targetNotifications.map((n) => {
      const recipientName = n.user_id ? adminUsersMap[n.user_id]?.full_name || "Admin" : "Admin"
      return [
        `"${n.id}"`,
        `"${recipientName.replace(/"/g, '""')}"`,
        `"${(n.type || "").replace(/"/g, '""')}"`,
        `"${(n.title || "").replace(/"/g, '""')}"`,
        `"${(n.message || "").replace(/"/g, '""')}"`,
        `"${(n.link || "").replace(/"/g, '""')}"`,
        `"${n.is_read ? "Read" : "Unread"}"`,
        `"${n.created_at || ""}"`,
        `"${n.read_at || ""}"`,
      ].join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `notifications-${scope}-${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.showSuccess({
      title: "Export Completed",
      description: `Exported ${targetNotifications.length} notification${targetNotifications.length === 1 ? "" : "s"} to CSV.`,
    })
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setIsLoading(true)
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    )

    try {
      const response = await fetch("/api/admin/notifications/mark-all-read", {
        method: "POST",
      })
      if (response.ok) {
        toast.showSuccess({
          title: "All marked as read",
          description: "All unread notifications have been marked as read",
        })
      } else {
        throw new Error("Failed to mark all as read")
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
      toast.showError({
        title: "Error",
        description: "Failed to mark all notifications as read",
      })
      fetchNotifications(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete single notification
  const deleteNotification = async (id: string) => {
    // Optimistic removal
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setSelectedIds((prev) => {
      if (prev.has(id)) {
        const next = new Set(prev)
        next.delete(id)
        return next
      }
      return prev
    })

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.showSuccess({
          title: "Deleted",
          description: "Notification removed",
        })
      } else {
        throw new Error("Failed to delete notification")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.showError({
        title: "Error",
        description: "Failed to delete notification",
      })
      fetchNotifications(false)
    }
  }

  // Clear all read notifications
  const handleClearRead = async () => {
    setIsClearingRead(true)
    try {
      const response = await fetch("/api/admin/notifications/clear-read", {
        method: "DELETE",
      })
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => !n.is_read))
        setSelectedIds((prev) => {
          const next = new Set<string>()
          prev.forEach((id) => {
            const notif = notifications.find((n) => n.id === id)
            if (notif && !notif.is_read) next.add(id)
          })
          return next
        })
        toast.showSuccess({
          title: "Cleared Read Notifications",
          description: "All read notifications have been removed",
        })
        setClearDialogOpen(false)
      } else {
        throw new Error("Failed to clear read notifications")
      }
    } catch (error) {
      console.error("Error clearing read notifications:", error)
      toast.showError({
        title: "Error",
        description: "Failed to clear read notifications",
      })
    } finally {
      setIsClearingRead(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      toggleReadStatus(notification.id, false)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (seconds < 60) return "Just now"
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
            {stats.unread > 0 && (
              <Badge className="bg-rose-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-2xs animate-pulse">
                {stats.unread} unread
              </Badge>
            )}

            {/* Scope Switcher for Super Admins */}
            {isSuperAdmin && (
              <div className="flex items-center bg-muted/80 p-0.5 rounded-full border border-border/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setScope("all")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5",
                    scope === "all"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="View all previous notifications across the entire system"
                >
                  <Globe className="size-3.5 text-primary" />
                  <span>All System ({allNotifications.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScope("mine")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5",
                    scope === "mine"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="View only notifications assigned to your account"
                >
                  <User className="size-3.5 text-muted-foreground" />
                  <span>My Inbox ({myNotifications.length})</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            {scope === "all" ? (
              <span>
                Viewing <strong className="text-foreground">all system & team notifications</strong> across
                the organization.
              </span>
            ) : stats.unread > 0 ? (
              <span>
                You have <strong className="text-rose-600 dark:text-rose-400">{stats.unread}</strong> unread
                notification{stats.unread > 1 ? "s" : ""} requiring attention.
              </span>
            ) : (
              "All caught up! No unread notifications in your personal inbox."
            )}
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
          {/* Sound Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSound}
            className={cn(
              "h-9 px-2.5 sm:px-3 text-xs gap-1.5 shadow-2xs transition-colors rounded-xl",
              soundEnabled
                ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={soundEnabled ? "Mute notification chime" : "Enable notification chime"}
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? (
              <Volume2 className="size-3.5 text-primary" />
            ) : (
              <VolumeX className="size-3.5 opacity-70" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? "Sound On" : "Muted"}</span>
          </Button>

          {/* CSV Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 px-2.5 sm:px-3 text-xs gap-1.5 shadow-2xs hover:bg-muted rounded-xl"
            title={
              selectedIds.size > 0
                ? `Export ${selectedIds.size} selected notifications to CSV`
                : "Export visible notifications to CSV"
            }
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
            {selectedIds.size > 0 && (
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded-full">
                {selectedIds.size}
              </span>
            )}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNotifications(true)}
            disabled={isRefreshing}
            className="h-9 px-2.5 sm:px-3 text-xs gap-1.5 shadow-2xs rounded-xl"
            title="Refresh notifications"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin text-primary")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Mark All Read */}
          {stats.unread > 0 && (
            <Button
              onClick={markAllAsRead}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-9 px-2.5 sm:px-3 text-xs gap-1.5 font-medium shadow-2xs hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/40 transition-colors rounded-xl"
            >
              <CheckCheck className="size-3.5" />
              <span>Mark all read</span>
            </Button>
          )}

          {/* Clear Read */}
          {stats.read > 0 && (
            <Button
              onClick={() => setClearDialogOpen(true)}
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              title="Clear all read notifications"
            >
              <Trash2 className="size-3.5 mr-1" />
              <span className="hidden sm:inline">Clear read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Symmetrical KPI Studio Cards with Cohesive Color Identities */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total */}
        <Card
          onClick={() => setFilter("all")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFilter("all")}
          className={cn(
            "p-0 py-0 gap-0 cursor-pointer transition-all border shadow-2xs hover:shadow-xs rounded-2xl",
            filter === "all"
              ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20"
              : "border-border/80 hover:border-primary/40 hover:bg-muted/20"
          )}
        >
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {scope === "all" ? "Total System" : "Total Inbox"}
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-0.5 tracking-tight">{stats.total}</p>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Bell className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Unread (Rose Red) */}
        <Card
          onClick={() => setFilter("unread")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFilter("unread")}
          className={cn(
            "p-0 py-0 gap-0 cursor-pointer transition-all border shadow-2xs hover:shadow-xs rounded-2xl",
            filter === "unread"
              ? "border-rose-500 bg-rose-500/10 text-foreground ring-1 ring-rose-500/20"
              : "border-border/80 hover:border-rose-400 hover:bg-rose-500/[0.04]"
          )}
        >
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Unread
                </p>
                <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 tracking-tight">
                  {stats.unread}
                </p>
              </div>
              <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 font-semibold">
                <Inbox className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Read (Emerald Green) */}
        <Card
          onClick={() => setFilter("read")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFilter("read")}
          className={cn(
            "p-0 py-0 gap-0 cursor-pointer transition-all border shadow-2xs hover:shadow-xs rounded-2xl",
            filter === "read"
              ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/20"
              : "border-border/80 hover:border-emerald-400 hover:bg-emerald-500/[0.04]"
          )}
        >
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Read
                </p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight">
                  {stats.read}
                </p>
              </div>
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <MailCheck className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Assignments (Sky Cyan) */}
        <Card
          onClick={() => setFilter("assignment")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFilter("assignment")}
          className={cn(
            "p-0 py-0 gap-0 cursor-pointer transition-all border shadow-2xs hover:shadow-xs rounded-2xl",
            filter === "assignment"
              ? "border-sky-500 bg-sky-500/10 text-foreground ring-1 ring-sky-500/20"
              : "border-border/80 hover:border-sky-400 hover:bg-sky-500/[0.04]"
          )}
        >
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Assignments
                </p>
                <p className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 mt-0.5 tracking-tight">
                  {stats.assignments}
                </p>
              </div>
              <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                <ClipboardList className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Search title, message or recipient… (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9.5 pl-9 pr-14 text-sm rounded-xl"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground p-0.5"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] font-mono font-medium text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded border border-border/80">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Quick Category Tabs & Type Dropdown (Generous vertical padding prevents chopped lower border) */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none snap-x">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-8.5 px-3 text-xs rounded-full shrink-0 shadow-2xs transition-all"
          >
            All ({stats.total})
          </Button>

          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className={cn(
              "h-8.5 px-3 text-xs rounded-full shrink-0 gap-1.5 shadow-2xs transition-all",
              filter === "unread"
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "hover:border-rose-300 dark:hover:border-rose-800"
            )}
          >
            <span>Unread</span>
            {stats.unread > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-bold leading-none",
                  filter === "unread" ? "bg-white text-rose-600" : "bg-rose-600 text-white"
                )}
              >
                {stats.unread}
              </span>
            )}
          </Button>

          <Button
            variant={filter === "read" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("read")}
            className={cn(
              "h-8.5 px-3 text-xs rounded-full shrink-0 shadow-2xs transition-all",
              filter === "read"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "hover:border-emerald-300 dark:hover:border-emerald-800"
            )}
          >
            <span>Read</span>
            <span className="text-[10px] opacity-75 font-mono ml-1">({stats.read})</span>
          </Button>

          {/* Type Dropdown */}
          <div className="w-[150px] sm:w-[170px] shrink-0">
            <FancySelect
              value={filter}
              onValueChange={setFilter}
              placeholder="All Types"
              options={FILTER_OPTIONS}
              className="w-full h-8.5 text-xs rounded-full"
              size="sm"
            />
          </div>

          {(filter !== "all" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter("all")
                setSearchQuery("")
              }}
              className="h-8.5 px-2 text-xs shrink-0 text-muted-foreground hover:text-foreground rounded-full"
              title="Reset all filters"
            >
              <RotateCcw className="size-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter Status Summary */}
      {(filter !== "all" || searchQuery) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground">{filteredNotifications.length}</strong> of {stats.total}{" "}
            notification{stats.total === 1 ? "" : "s"}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          <button
            type="button"
            onClick={() => {
              setFilter("all")
              setSearchQuery("")
            }}
            className="text-primary hover:underline font-medium"
          >
            Show all
          </button>
        </div>
      )}

      {/* Selection Control Bar & Header */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 rounded-xl border border-border/70 bg-muted/40 text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-2.5">
            <Checkbox
              checked={isAllFilteredSelected ? true : isSomeFilteredSelected ? "indeterminate" : false}
              onCheckedChange={toggleSelectAllFiltered}
              aria-label="Select all notifications in current view"
            />
            <span className="font-medium text-foreground text-xs">
              {selectedIds.size > 0 ? (
                <span>
                  <strong className="text-primary">{selectedIds.size}</strong> selected
                </span>
              ) : (
                <span>Select all in view ({filteredNotifications.length})</span>
              )}
            </span>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBatchSetRead(true)}
                disabled={isBatchBusy}
                className="h-7 px-2 text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <Check className="size-3.5" />
                <span className="hidden sm:inline">Mark Read</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBatchSetRead(false)}
                disabled={isBatchBusy}
                className="h-7 px-2 text-xs gap-1 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
              >
                <EyeOff className="size-3.5" />
                <span className="hidden sm:inline">Mark Unread</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBatchDeleteDialogOpen(true)}
                disabled={isBatchBusy}
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-7 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="Clear selection"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Notifications Feed: Individual Elevated Modern Cards */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-0 py-0 gap-0 border border-border/80 shadow-2xs overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-14 sm:py-18 px-4 text-center">
              <div className="size-14 sm:size-16 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/50 mb-3.5 shadow-inner">
                <Bell className="size-7" />
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {scope === "mine" ? "Your inbox is empty" : "No notifications found"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
                {filter !== "all" || searchQuery
                  ? "No notifications match your current filter or search criteria. Try resetting filters."
                  : scope === "mine" && allNotifications.length > 0
                  ? "You have no personal notifications assigned yet. You can switch to 'All System' to view previous platform notifications."
                  : "You're all caught up! There are no notifications to display."}
              </p>

              <div className="flex items-center gap-2.5 mt-5 flex-wrap justify-center">
                {isSuperAdmin && scope === "mine" && allNotifications.length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setScope("all")}
                    className="h-9 text-xs font-semibold gap-1.5 rounded-xl shadow-xs"
                  >
                    <Globe className="size-3.5" />
                    View All Previous Notifications ({allNotifications.length})
                  </Button>
                )}

                {/* Generate sample notification for testing */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeedSample}
                  disabled={isSeedingSample}
                  className="h-9 text-xs font-medium gap-1.5 rounded-xl shadow-2xs"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  <span>{isSeedingSample ? "Generating..." : "Generate Test Notification"}</span>
                </Button>

                {(filter !== "all" || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilter("all")
                      setSearchQuery("")
                    }}
                    className="h-9 text-xs font-medium rounded-xl"
                  >
                    <RotateCcw className="size-3.5 mr-1.5" />
                    Reset filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const typeConfig = getTypeDetails(notification.type)
            const Icon = typeConfig.icon
            const isSelected = selectedIds.has(notification.id)
            const recipientInfo = notification.user_id ? adminUsersMap[notification.user_id] : null
            const isMyNotif = notification.user_id === currentUserId
            const isUnread = !notification.is_read

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer group relative",
                  isSelected
                    ? "ring-2 ring-primary border-primary bg-primary/[0.04] dark:bg-primary/[0.08]"
                    : isUnread
                    ? "border-rose-500/35 dark:border-rose-500/40 bg-gradient-to-r from-rose-500/[0.04] via-card to-card dark:from-rose-500/[0.08] hover:border-rose-500/60"
                    : "border-border/80 bg-card hover:bg-muted/30 hover:border-border"
                )}
              >
                {/* Left Colored Accent Strip Indicator */}
                <div
                  className={cn(
                    "absolute left-0 inset-y-3 w-1.5 rounded-r-full transition-colors",
                    isSelected
                      ? "bg-primary"
                      : isUnread
                      ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                      : "bg-emerald-500/40 dark:bg-emerald-500/30"
                  )}
                />

                <div className="flex items-start gap-3 sm:gap-4 pl-1">
                  {/* Row Multi-Select Checkbox */}
                  <div
                    className="pt-1 sm:pt-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectOne(notification.id)}
                      aria-label={`Select notification: ${notification.title}`}
                    />
                  </div>

                  {/* Themed Icon Badge */}
                  <div
                    className={cn(
                      "size-10 sm:size-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs",
                      typeConfig.iconBg
                    )}
                  >
                    <Icon className={cn("size-5", typeConfig.iconColor)} />
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 min-w-0">
                    {/* Header: Title + Status Badge (Green/Red) + Category + Recipient + Actions */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        {/* Status Badge: Vibrant Red with Pulse Dot for Unread vs Emerald Green for Read */}
                        {isUnread ? (
                          <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-900/50 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                            <span className="size-2 rounded-full bg-rose-500 ring-2 ring-rose-500/30 animate-pulse" />
                            <span>Unread</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/50 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <Check className="size-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                            <span>Read</span>
                          </Badge>
                        )}

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] sm:text-xs py-0.5 px-2 font-semibold capitalize shadow-2xs rounded-full",
                            typeConfig.badgeClass
                          )}
                        >
                          {typeConfig.label}
                        </Badge>

                        {/* Recipient Badge in Global/System View */}
                        {scope === "all" && recipientInfo && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] sm:text-xs py-0.5 px-2 font-medium border-border/80 shadow-2xs rounded-full",
                              isMyNotif
                                ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                                : "bg-muted/60 text-muted-foreground"
                            )}
                            title={recipientInfo.email}
                          >
                            {isMyNotif ? "Assigned to You" : `To: ${recipientInfo.full_name}`}
                          </Badge>
                        )}

                        <h3
                          className={cn(
                            "text-sm sm:text-base break-words leading-snug transition-colors ml-1",
                            isUnread
                              ? "font-bold text-foreground"
                              : "font-semibold text-foreground/85 group-hover:text-primary"
                          )}
                        >
                          {notification.title}
                        </h3>
                      </div>

                      {/* Desktop Action Buttons with Tactile Micro-interactions */}
                      <div className="hidden sm:flex items-center gap-1 shrink-0 ml-2">
                        {/* Copy to My Inbox (if viewing all system notifications and not already mine) */}
                        {scope === "all" && !isMyNotif && currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => copyToMyInbox(notification, e)}
                            className="size-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group/btn"
                            title="Copy to my personal notifications"
                            aria-label="Copy to my notifications"
                          >
                            <Copy className="size-4 transition-transform duration-200 group-hover/btn:scale-110" />
                          </Button>
                        )}

                        {/* Toggle Read / Unread Status Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => toggleReadStatus(notification.id, notification.is_read, e)}
                          className={cn(
                            "size-8 p-0 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group/btn",
                            isUnread
                              ? "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
                              : "text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                          )}
                          title={isUnread ? "Mark as read" : "Mark as unread"}
                          aria-label={isUnread ? "Mark as read" : "Mark as unread"}
                        >
                          {isUnread ? (
                            <Check className="size-4 transition-transform duration-200 group-hover/btn:scale-110" />
                          ) : (
                            <EyeOff className="size-4 transition-transform duration-200 group-hover/btn:scale-110" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="size-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group/btn"
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="size-4 transition-transform duration-200 group-hover/btn:scale-110" />
                        </Button>
                      </div>
                    </div>

                    {/* Notification Message */}
                    <p className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed mb-2.5">
                      {notification.message}
                    </p>

                    {/* Footer Row: Timestamp + Read Indicator + Link + Mobile Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                      {/* Left: Metadata */}
                      <div className="flex items-center flex-wrap gap-x-3.5 gap-y-1 text-xs text-muted-foreground">
                        <span
                          className="flex items-center gap-1 font-mono text-[11px]"
                          title={formatDateTime(notification.created_at)}
                        >
                          <Clock className="size-3.5 opacity-70" />
                          <span>{formatTimeAgo(notification.created_at)}</span>
                          <span className="hidden md:inline text-muted-foreground/60">
                            ({formatDateTime(notification.created_at)})
                          </span>
                        </span>

                        {notification.read_at && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                            <MailCheck className="size-3.5" />
                            <span>Read {formatTimeAgo(notification.read_at)}</span>
                          </span>
                        )}

                        {notification.link && (
                          <span className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-xs">
                            <ExternalLink className="size-3.5" />
                            <span>View details</span>
                          </span>
                        )}
                      </div>

                      {/* Right: Mobile Action Buttons */}
                      <div className="flex sm:hidden items-center gap-1 shrink-0">
                        {scope === "all" && !isMyNotif && currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => copyToMyInbox(notification, e)}
                            className="size-7.5 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            aria-label="Copy to my inbox"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => toggleReadStatus(notification.id, notification.is_read, e)}
                          className={cn(
                            "h-7 px-2 text-xs gap-1 rounded-lg",
                            isUnread
                              ? "border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 bg-rose-50/50"
                              : "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50"
                          )}
                          aria-label={isUnread ? "Mark as read" : "Mark as unread"}
                        >
                          {isUnread ? (
                            <>
                              <Check className="size-3.5" />
                              <span>Read</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="size-3.5" />
                              <span>Unread</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating Bottom Action Toolbar when Items are Selected */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 bg-neutral-900 text-white dark:bg-card dark:text-foreground border border-neutral-800 dark:border-border/80 px-3.5 sm:px-4 py-2 rounded-full shadow-2xl backdrop-blur-md">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 dark:bg-primary/20 text-current">
              {selectedIds.size} selected
            </span>

            <div className="h-4 w-px bg-white/20 dark:bg-border" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleBatchSetRead(true)}
              disabled={isBatchBusy}
              className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-full"
            >
              <CheckCheck className="size-3.5" />
              <span>Mark Read</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleBatchSetRead(false)}
              disabled={isBatchBusy}
              className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 rounded-full"
            >
              <EyeOff className="size-3.5" />
              <span>Mark Unread</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setBatchDeleteDialogOpen(true)}
              disabled={isBatchBusy}
              className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full"
            >
              <Trash2 className="size-3.5" />
              <span>Delete</span>
            </Button>

            <div className="h-4 w-px bg-white/20 dark:bg-border" />

            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="size-7 p-0 text-white/70 hover:text-white hover:bg-white/10 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-muted rounded-full"
              title="Deselect all (Esc)"
              aria-label="Deselect all"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Clearing Read Notifications */}
      <ConfirmDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title="Clear All Read Notifications?"
        description="This will permanently remove all read notifications from your current view. This action cannot be undone."
        confirmLabel="Clear Read"
        loading={isClearingRead}
        onConfirm={handleClearRead}
      />

      {/* Confirmation Dialog for Batch Deleting Notifications */}
      <ConfirmDialog
        open={batchDeleteDialogOpen}
        onOpenChange={setBatchDeleteDialogOpen}
        title={`Delete ${selectedIds.size} Selected Notification${selectedIds.size > 1 ? "s" : ""}?`}
        description={`This will permanently remove the ${selectedIds.size} selected notification${selectedIds.size > 1 ? "s" : ""} from the notification center. This action cannot be undone.`}
        confirmLabel="Delete Selected"
        loading={isBatchBusy}
        onConfirm={handleBatchDelete}
      />
    </div>
  )
}
