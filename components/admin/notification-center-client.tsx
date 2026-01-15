"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, CheckCheck, Trash2, Filter, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { notifications as toast } from "@/lib/notifications"

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
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'mention':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'reply':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'status_change':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'system':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            disabled={isLoading}
            variant="outline"
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {unreadCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {notifications.filter(n => n.type === 'assignment').length}
                </p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System</p>
                <p className="text-2xl font-bold text-slate-600">
                  {notifications.filter(n => n.type === 'system').length}
                </p>
              </div>
              <div className="text-3xl">⚙️</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter notifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="read">Read Only</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="mention">Mentions</SelectItem>
            <SelectItem value="reply">Replies</SelectItem>
            <SelectItem value="status_change">Status Changes</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No notifications found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter !== "all" ? "Try changing the filter" : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex gap-4 p-6 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.is_read ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="text-4xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base">
                          {notification.title}
                        </h3>
                        <Badge className={`text-xs ${getTypeBadgeColor(notification.type)}`}>
                          {notification.type.replace('_', ' ')}
                        </Badge>
                        {!notification.is_read && (
                          <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="h-8"
                          >
                            <Check className="h-4 w-4 mr-1" />
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
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDateTime(notification.created_at)}</span>
                      {notification.read_at && (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Read {formatDateTime(notification.read_at)}
                        </span>
                      )}
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
