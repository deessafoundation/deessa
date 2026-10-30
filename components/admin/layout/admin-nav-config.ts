import {
  LayoutDashboard,
  Layers,
  FolderKanban,
  BookOpen,
  Calendar,
  FileText,
  Users,
  BarChart3,
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
  Palette,
  Handshake,
  User,
} from "lucide-react"
import { type AdminRole, hasPermission, canViewFinance, canManageUsers } from "@/lib/types/admin"

export type AdminNavItem = {
  name: string
  href: string
  icon: typeof LayoutDashboard
  permission: string | null
  alternatePermission?: string
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
      { name: "Notifications", href: "/admin/notifications", icon: Bell, permission: null, description: "System & activity alerts" },
      { name: "CMS", href: "/admin/cms", icon: Layers, permission: null, description: "Content management" },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Homepage", href: "/admin/homepage", icon: Home, permission: "settings", description: "Banners, hero & layout" },
      { name: "Community Posts", href: "/admin/community-posts", icon: MessageSquare, permission: "settings", description: "Facebook live feed" },
      { name: "Who We Are", href: "/admin/about", icon: Info, permission: "settings", alternatePermission: "partners", description: "Mission, vision & stories" },
      { name: "What We Do", href: "/admin/what-we-do", icon: Info, permission: "settings", description: "Strategic pillars" },
      { name: "Media Library", href: "/admin/media", icon: Image, permission: "settings", description: "Photos & assets" },
      { name: "Artworks", href: "/admin/artworks", icon: Palette, permission: "settings", description: "Art gallery feature" },
      { name: "Projects", href: "/admin/projects", icon: FolderKanban, permission: "projects", description: "Active initiatives" },
      { name: "Programs", href: "/admin/programs", icon: BookOpen, permission: "programs", description: "Core foundation programs" },
      { name: "Events", href: "/admin/events", icon: Calendar, permission: "events", description: "Upcoming & past gatherings" },
      { name: "Stories", href: "/admin/stories", icon: FileText, permission: "stories", description: "Changemaker voices" },
      { name: "Podcasts", href: "/admin/podcasts", icon: Podcast, permission: "stories", description: "Audio episodes & series" },
      { name: "Team & Governance", href: "/admin/team", icon: Users, permission: "team", description: "Leadership tiers & hero portraits" },
      { name: "Partners", href: "/admin/about?tab=partners", icon: Handshake, permission: "partners", alternatePermission: "settings", description: "Supporters & institutional alliances" },
      { name: "Impact Stats", href: "/admin/stats", icon: BarChart3, permission: "stats", description: "Key performance indicators" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { name: "Donations", href: "/admin/donations", icon: HandHeart, permission: "donations", requiresFinance: true, description: "Direct contributions" },
      { name: "Payments", href: "/admin/payments", icon: Receipt, permission: "donations", requiresFinance: true, description: "Receipt & transaction logs" },
      { name: "Volunteers", href: "/admin/volunteers", icon: Heart, permission: "volunteers", description: "Sign-ups & outreach" },
      { name: "Contact Messages", href: "/admin/contacts", icon: MessageSquare, permission: "contacts", description: "Public inquiries" },
      { name: "Support Reports", href: "/admin/support", icon: Bug, permission: "contacts", description: "Suggestions & bug tickets" },
      { name: "Newsletter", href: "/admin/newsletter", icon: Newspaper, permission: "newsletters", description: "Subscriber list" },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Site Settings", href: "/admin/settings", icon: Settings, permission: "settings", description: "General configuration & fonts" },
      { name: "Admin Users", href: "/admin/users", icon: UserCog, permission: "users", requiresAdmin: true, description: "Roles & permissions" },
      { name: "My Profile", href: "/admin/profile", icon: User, permission: null, description: "Account credentials & security" },
    ],
  },
]

export function canAccessAdminNavItem(adminRole: AdminRole, item: AdminNavItem): boolean {
  if (item.permission === null) return true
  if (item.requiresFinance && !canViewFinance(adminRole)) return false
  if (item.requiresAdmin && !canManageUsers(adminRole)) return false
  return hasPermission(adminRole, item.permission) || Boolean(item.alternatePermission && hasPermission(adminRole, item.alternatePermission))
}
