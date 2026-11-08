"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter, 
  Clock, 
  ExternalLink, 
  RotateCcw 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FancySelect } from "@/components/ui/fancy-select"
import { notifications as toast } from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  metadata?: any
  is_read: boolean
  created_at: string
  read_at?: string
}

interface NotificationCenterClientProps {
  initialNotifications: Notification[]
}

const FILTER_OPTIONS = [
  { value: "all", label: "All Notifications" },
  { value: "unread", label: "Unread Only" },
  { value: "read", label: "Read Only" },
  { value: "assignment", label: "Assignments" },
  { value: "mention", label: "Mentions" },
  { value: "reply", label: "Replies" },
  { value: "status_change", label: "Status Changes" },
  { value: "system", label: "System" },
]

export default function NotificationCenterClient({
  initialNotifications,
}: NotificationCenterClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [filter, setFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.is_read).length

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.is_read
    if (filter === "read") return n.is_read
    if (filter !== "all") return n.type === filter
    return true
  })

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
      })
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        )
        toast.showSuccess({
          title: "Marked as read",
          description: "Notification has been marked as read",
        })
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.showError({
        title: "Error",
        description: "Failed to mark notification as read",
      })
    }
  }

  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
      })
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        )
        toast.showSuccess({
          title: "All marked as read",
          description: "All notifications have been marked as read",
        })
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.showError({
        title: "Error",
        description: "Failed to mark all notifications as read",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
        toast.showSuccess({
          title: "Deleted",
          description: "Notification has been deleted",
        })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.showError({
        title: "Error",
        description: "Failed to delete notification",
      })
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return '📋'
      case 'mention':
        return '💬'
      case 'reply':
        return '✉️'
      case 'status_change':
        return '🔄'
      case 'system':
        return '⚙️'
      default:
        return '🔔'
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
      case 'mention':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'reply':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'status_change':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'system':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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

      if (seconds < 60) return 'Just now'
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            {unreadCount > 0 ? (
              <span>
                You have <span className="font-semibold text-foreground">{unreadCount}</span> unread notification{unreadCount > 1 ? 's' : ''}
              </span>
            ) : (
              'All caught up! No unread notifications'
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            disabled={isLoading}
            variant="outline"
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] gap-2 font-medium"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total */}
        <Card
          onClick={() => setFilter("all")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFilter("all")}
          className={cn(
            "cursor-pointer transition-all hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            filter === "all" ? "ring-2 ring-primary ring-offset-1 dark:ring-offset-card border-primary/50" : ""
          )}
        >
          <CardContent className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total</p>
                <p className="text-xl sm:text-2xl font-bold mt-0.5">{notifications.length}</p>
              </div>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unread */}
        <Card
          onClick={() => setFilter("unread")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFilter("unread")}
          className={cn(
            "cursor-pointer transition-all hover:border-blue-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            filter === "unread" ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-card border-blue-500/50" : ""
          )}
        >
          <CardContent className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Unread</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{unreadCount}</p>
              </div>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm flex-shrink-0">
                {unreadCount}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card
          onClick={() => setFilter("assignment")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFilter("assignment")}
          className={cn(
            "cursor-pointer transition-all hover:border-indigo-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            filter === "assignment" ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-card border-indigo-500/50" : ""
          )}
        >
          <CardContent className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Assignments</p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {notifications.filter(n => n.type === 'assignment').length}
                </p>
              </div>
              <div className="text-xl sm:text-2xl flex-shrink-0">📋</div>
            </div>
          </CardContent>
        </Card>

        {/* System */}
        <Card
          onClick={() => setFilter("system")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFilter("system")}
          className={cn(
            "cursor-pointer transition-all hover:border-slate-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500",
            filter === "system" ? "ring-2 ring-slate-500 ring-offset-1 dark:ring-offset-card border-slate-500/50" : ""
          )}
        >
          <CardContent className="p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">System</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {notifications.filter(n => n.type === 'system').length}
                </p>
              </div>
              <div className="text-xl sm:text-2xl flex-shrink-0">⚙️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Quick Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Quick pill tabs scrollable horizontally on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none snap-x touch-pan-x">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-8 px-3 text-xs rounded-full shrink-0"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="h-8 px-3 text-xs rounded-full shrink-0 gap-1.5"
          >
            Unread
            {unreadCount > 0 && (
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                filter === "unread" ? "bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400" : "bg-blue-500 text-white"
              )}>
                {unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant={filter === "read" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("read")}
            className="h-8 px-3 text-xs rounded-full shrink-0"
          >
            Read ({notifications.length - unreadCount})
          </Button>
        </div>

        {/* FancySelect dropdown & Reset */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
          <div className="w-full sm:w-[220px]">
            <FancySelect
              value={filter}
              onValueChange={setFilter}
              placeholder="Filter notifications"
              options={FILTER_OPTIONS}
              className="w-full"
              size="sm"
            />
          </div>
          {filter !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter("all")}
              className="h-8 px-2 text-xs shrink-0 text-muted-foreground hover:text-foreground"
              title="Reset filter to all"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter status line */}
      {filter !== "all" && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground">{filteredNotifications.length}</strong> of {notifications.length} notifications
          </span>
          <button 
            type="button" 
            onClick={() => setFilter("all")}
            className="text-primary hover:underline font-medium"
          >
            Show all
          </button>
        </div>
      )}

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/40 mb-3 sm:mb-4">
                <Bell className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <p className="text-base sm:text-lg font-semibold text-foreground">No notifications found</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
                {filter !== "all" 
                  ? "No notifications match the selected filter. Try switching back to all." 
                  : "You're all caught up! There are no notifications to display."}
              </p>
              {filter !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="mt-4 min-h-[38px] text-xs font-medium"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  View all notifications
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 cursor-pointer transition-colors hover:bg-muted/40",
                    !notification.is_read 
                      ? "bg-blue-50/40 dark:bg-blue-950/20 border-l-4 border-l-blue-500" 
                      : "border-l-4 border-l-transparent"
                  )}
                >
                  {/* Icon */}
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg sm:text-2xl flex-shrink-0 bg-muted/60 dark:bg-muted/40 border border-border/50">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    {/* Header: Title + Badges + Desktop Actions */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground break-words leading-snug">
                          {notification.title}
                        </h3>
                        <Badge variant="outline" className={cn("text-[10px] sm:text-xs py-0 px-2 font-medium capitalize", getTypeBadgeColor(notification.type))}>
                          {notification.type.replace('_', ' ')}
                        </Badge>
                        {!notification.is_read && (
                          <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs py-0 px-1.5 font-semibold">
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Desktop actions (aligned on the right of header) */}
                      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="h-8 px-2.5 text-xs font-medium hover:bg-background/80"
                            aria-label="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Notification Message */}
                    <p className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed mb-2.5">
                      {notification.message}
                    </p>

                    {/* Footer Row: Timestamp + Read Status + Mobile Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30 sm:border-0 sm:pt-0">
                      {/* Left: Metadata */}
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1" title={formatDateTime(notification.created_at)}>
                          <Clock className="h-3 w-3 opacity-70" />
                          <span>{formatTimeAgo(notification.created_at)}</span>
                          <span className="hidden md:inline text-muted-foreground/60">({formatDateTime(notification.created_at)})</span>
                        </span>
                        {notification.read_at && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCheck className="h-3 w-3" />
                            <span>Read</span>
                          </span>
                        )}
                        {notification.link && (
                          <span className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
                            <ExternalLink className="h-3 w-3" />
                            <span>Details</span>
                          </span>
                        )}
                      </div>

                      {/* Right: Mobile actions */}
                      <div className="flex sm:hidden items-center gap-1.5 flex-shrink-0">
                        {!notification.is_read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="h-8 px-2 text-xs gap-1 border-blue-200 dark:border-blue-800 bg-background/80"
                            aria-label="Mark notification as read"
                          >
                            <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Read</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
