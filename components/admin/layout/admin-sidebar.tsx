"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { PanelLeftClose } from "lucide-react"
import { type AdminUser } from "@/lib/types/admin"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSidebar } from "@/contexts/SidebarContext"
import { adminNavSections, canAccessAdminNavItem } from "@/components/admin/layout/admin-nav-config"

interface AdminSidebarProps {
  adminUser: AdminUser
}

export function AdminSidebar({ adminUser }: AdminSidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [tooltipsReady, setTooltipsReady] = useState(false)

  useEffect(() => {
    setTooltipsReady(false)
  }, [isCollapsed])

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const shouldShowTooltips = isCollapsed && tooltipsReady

  const enableTooltips = () => {
    if (isCollapsed && !tooltipsReady) {
      setTooltipsReady(true)
    }
  }

  return (
    <TooltipProvider delayDuration={300} key={isCollapsed ? "collapsed" : "expanded"}>
      <aside 
        onClick={() => isCollapsed && setIsCollapsed(false)}
        onMouseMove={enableTooltips}
        onMouseLeave={() => setTooltipsReady(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden flex-col border-r bg-background transition-all duration-300 lg:flex",
          isCollapsed ? "w-16 cursor-pointer hover:bg-muted/30" : "w-64"
        )}
      >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Image 
            src="/favicon.png" 
            alt="deessa Foundation" 
            width={32} 
            height={32}
            className="flex-shrink-0"
          />
          <span className={cn(
            "font-semibold transition-all duration-200",
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            deessa Admin
          </span>
        </div>
        {!isCollapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsCollapsed(true)
            }}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav onClick={(e) => e.stopPropagation()} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-4 space-y-4">
        {adminNavSections.map((section) => {
          const items = section.items.filter((item) => canAccessAdminNavItem(adminUser.role, item))

          if (items.length === 0) return null

          return (
            <div
              key={section.label}
              className={cn(
                "space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-3",
                isCollapsed && "border-transparent bg-transparent p-0"
              )}
            >
              {isCollapsed ? (
                <div className="h-[20px] mb-1" aria-hidden="true" />
              ) : (
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{section.label}</p>
                  <span className="h-px flex-1 ml-3 bg-border/70" aria-hidden="true" />
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const link = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-xl py-2 text-sm font-medium transition-all duration-200 group relative border border-transparent",
                        isActive(item.href)
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md scale-[1.01] border-primary/30"
                          : "text-muted-foreground hover:bg-background/80 hover:text-primary hover:border-border/80 hover:scale-[1.01]",
                        isCollapsed ? "justify-center px-0 mx-auto w-10 h-10" : "gap-3 px-3"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 flex-shrink-0 transition-all",
                        isActive(item.href) && "animate-pulse"
                      )} />
                      <span className={cn(
                        "transition-all duration-200 font-semibold",
                        isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                      )}>
                        {item.name}
                      </span>
                      {isActive(item.href) && !isCollapsed && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100 animate-shimmer pointer-events-none" />
                      )}
                    </Link>
                  )

                  if (!shouldShowTooltips) {
                    return <div key={item.name}>{link}</div>
                  }

                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div onClick={(e) => e.stopPropagation()} className="border-t p-4">
        {shouldShowTooltips ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2 border border-border/70",
                isCollapsed && "justify-center"
              )}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground flex-shrink-0">
                  {adminUser.full_name.charAt(0)}
                </div>
                <div className={cn(
                  "flex-1 min-w-0 transition-all duration-200",
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}>
                  <p className="text-sm font-medium truncate">{adminUser.full_name}</p>
                  <p className="text-xs text-muted-foreground">{adminUser.role.replace("_", " ")}</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div>
                <p className="font-medium">{adminUser.full_name}</p>
                <p className="text-xs text-muted-foreground">{adminUser.role.replace("_", " ")}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className={cn(
            "flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2 border border-border/70",
            isCollapsed && "justify-center"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground flex-shrink-0">
              {adminUser.full_name.charAt(0)}
            </div>
            <div className={cn(
              "flex-1 min-w-0 transition-all duration-200",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}>
              <p className="text-sm font-medium truncate">{adminUser.full_name}</p>
              <p className="text-xs text-muted-foreground">{adminUser.role.replace("_", " ")}</p>
            </div>
          </div>
        )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
