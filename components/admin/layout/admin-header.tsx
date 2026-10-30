"use client"

import { useState } from "react"
import { AdminLink as Link } from "@/components/admin/common/admin-navigation-guard"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, User, ExternalLink, ChevronRight } from "lucide-react"
import type { AdminUser } from "@/lib/types/admin"
import { adminLogout } from "@/lib/actions/admin-auth"
import { adminNavSections, canAccessAdminNavItem } from "@/components/admin/layout/admin-nav-config"
import NotificationBell from "@/components/admin/notifications/notification-bell"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
  adminUser: AdminUser
}

export function AdminHeader({ adminUser }: AdminHeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    if (href.includes("?")) {
      const [path] = href.split("?")
      return pathname.startsWith(path)
    }
    return pathname.startsWith(href)
  }

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/")
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    return { href, label }
  })

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-xs sm:w-80 p-0 flex flex-col h-full bg-background border-r"
        >
          {/* Mobile Drawer Header with Favicon */}
          <div className="flex h-16 shrink-0 items-center gap-2.5 border-b px-5 bg-card/60">
            <Image
              src="/favicon.png"
              alt="deessa Foundation"
              width={32}
              height={32}
              className="flex-shrink-0"
              priority
            />
            <span className="font-semibold text-foreground">
              deessa Admin
            </span>
          </div>

          {/* Truly Scrollable Nav Container */}
          <nav
            aria-label="Mobile admin navigation"
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 touch-pan-y scrollbar-hide"
          >
            {adminNavSections.map((section) => {
              const items = section.items.filter((item) => canAccessAdminNavItem(adminUser.role, item))

              if (items.length === 0) return null

              return (
                <div key={section.label} className="space-y-2 rounded-2xl border border-border/70 bg-muted/20 p-3">
                  <div className="flex items-center gap-3 px-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {section.label}
                    </p>
                    <span className="h-px flex-1 bg-border/70" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const active = isActive(item.href)
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center rounded-xl py-2 text-sm font-medium transition-all duration-200 group relative border border-transparent gap-3 px-3",
                            active
                              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md scale-[1.01] border-primary/30"
                              : "text-muted-foreground hover:bg-background/80 hover:text-primary hover:border-border/80 hover:scale-[1.01]",
                          )}
                          onClick={() => setMobileOpen(false)}
                        >
                          <item.icon className={cn(
                            "h-4 w-4 flex-shrink-0 transition-all",
                            active && "animate-pulse"
                          )} />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold block truncate leading-tight">
                              {item.name}
                            </span>
                            {item.description && (
                              <p className={cn(
                                "text-[11px] line-clamp-1 mt-0.5 font-normal",
                                active ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          {active && (
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100 animate-shimmer pointer-events-none" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* User Footer Profile & Mobile Actions */}
          <div className="shrink-0 border-t border-border p-4 bg-muted/30 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-card border border-border/80 p-2.5 shadow-2xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground flex-shrink-0">
                {adminUser.full_name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{adminUser.full_name}</p>
                <p className="text-[10px] text-muted-foreground capitalize truncate">{adminUser.role.replace("_", " ")}</p>
              </div>
              <form action={adminLogout} className="shrink-0">
                <button
                  type="submit"
                  className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground py-1 transition-colors"
            >
              <span>Visit Public Website</span>
              <ExternalLink className="size-3 opacity-70" />
            </a>
          </div>
        </SheetContent>
      </Sheet>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1 text-sm text-muted-foreground min-w-0 overflow-hidden">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1 min-w-0 shrink-0">
            {index > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-none">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[100px] sm:max-w-none">
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {/* View Site */}
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-xs">
          <Link href="/" target="_blank">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5 opacity-70" />
            View Site
          </Link>
        </Button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {adminUser.full_name.charAt(0)}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{adminUser.full_name}</p>
                <p className="text-xs text-muted-foreground">{adminUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={adminLogout}>
                <button type="submit" className="flex w-full items-center text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
