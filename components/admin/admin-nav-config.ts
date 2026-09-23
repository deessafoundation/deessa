import {
  LayoutDashboard,
  Layers,
  FolderKanban,
  BookOpen,
  Calendar,
  FileText,
  Users,
  Building,
  BarChart3,
  CalendarRange,
  HandHeart,
  Receipt,
  Heart,
  MessageSquare,
  Bug,
  Newspaper,
  Settings,
  UserCog,
  Home,
  Image,
  Podcast,
  Bell,
  Info,
} from "lucide-react"
import { type AdminRole, hasPermission, canViewFinance, canManageUsers } from "@/lib/types/admin"

export type AdminNavItem = {
  name: string
  href: string
  icon: typeof LayoutDashboard
  permission: string | null
  requiresFinance?: boolean
  requiresAdmin?: boolean
  description?: string
}

export type AdminNavSection = {
  label: string
  items: AdminNavItem[]
}

export const adminNavSections: AdminNavSection[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: null },
      { name: "Notifications", href: "/admin/notifications", icon: Bell, permission: null, description: "View your notifications" },
      { name: "CMS", href: "/admin/cms", icon: Layers, permission: null, description: "Content Management" },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Homepage", href: "/admin/homepage", icon: Home, permission: "settings" },
      { name: "About Page", href: "/admin/about", icon: Info, permission: "settings" },
      { name: "Media Library", href: "/admin/media", icon: Image, permission: "settings" },
      { name: "Projects", href: "/admin/projects", icon: FolderKanban, permission: "projects" },
      { name: "Programs", href: "/admin/programs", icon: BookOpen, permission: "programs" },
      { name: "Events", href: "/admin/events", icon: Calendar, permission: "events" },
      { name: "Stories", href: "/admin/stories", icon: FileText, permission: "stories" },
      { name: "Podcasts", href: "/admin/podcasts", icon: Podcast, permission: "stories" },
      { name: "Team", href: "/admin/team", icon: Users, permission: "team" },
      { name: "Partners", href: "/admin/partners", icon: Building, permission: "partners" },
      { name: "Impact Stats", href: "/admin/stats", icon: BarChart3, permission: "stats" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { name: "Conference", href: "/admin/conference", icon: CalendarRange, permission: null },
      { name: "Donations", href: "/admin/donations", icon: HandHeart, permission: "donations", requiresFinance: true },
      { name: "Payments", href: "/admin/payments", icon: Receipt, permission: "donations", requiresFinance: true, description: "Receipt & Email Monitoring" },
      { name: "Volunteers", href: "/admin/volunteers", icon: Heart, permission: "volunteers" },
      { name: "Contact Messages", href: "/admin/contacts", icon: MessageSquare, permission: "contacts" },
      { name: "Support Reports", href: "/admin/support", icon: Bug, permission: "contacts", description: "Bug reports & suggestions" },
      { name: "Newsletter", href: "/admin/newsletter", icon: Newspaper, permission: "newsletters" },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Site Settings", href: "/admin/settings", icon: Settings, permission: "settings" },
      { name: "Admin Users", href: "/admin/users", icon: UserCog, permission: "users", requiresAdmin: true },
    ],
  },
]

export function canAccessAdminNavItem(adminRole: AdminRole, item: AdminNavItem): boolean {
  if (item.permission === null) return true
  if (item.requiresFinance && !canViewFinance(adminRole)) return false
  if (item.requiresAdmin && !canManageUsers(adminRole)) return false
  return hasPermission(adminRole, item.permission)
}
