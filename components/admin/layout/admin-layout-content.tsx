"use client"

import { AdminSidebar } from "@/components/admin/layout/admin-sidebar"
import { AdminHeader } from "@/components/admin/layout/admin-header"
import { AdminNavigationGuard } from "@/components/admin/common/admin-navigation-guard"
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"
import type { AdminUser } from "@/lib/types/admin"
import { cn } from "@/lib/utils"

interface AdminLayoutContentProps {
  adminUser: AdminUser
  children: React.ReactNode
}

function AdminLayoutInner({ adminUser, children }: AdminLayoutContentProps) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Accessible skip link for keyboard & assistive technology */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      <AdminSidebar adminUser={adminUser} />
      <div 
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <AdminHeader adminUser={adminUser} />
        <main id="main-content" tabIndex={-1} className="p-4 lg:p-6 focus:outline-none">{children}</main>
      </div>
    </div>
  )
}

export function AdminLayoutContent({ adminUser, children }: AdminLayoutContentProps) {
  return (
    <SidebarProvider><AdminNavigationGuard>
      <AdminLayoutInner adminUser={adminUser}>
        {children}
      </AdminLayoutInner>
    </AdminNavigationGuard></SidebarProvider>
  )
}
