"use client"

import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  FileText,
  ImageIcon,
  MapPin,
  LayoutList,
  FormInput,
  CreditCard,
  Mail,
  Settings,
} from "lucide-react"
import { useCallback } from "react"

const tabs = [
  { label: "Registrations", href: "", icon: FileText },
  { label: "Details", href: "/details", icon: FileText },
  { label: "Media", href: "/media", icon: ImageIcon },
  { label: "Location", href: "/location", icon: MapPin },
  { label: "Agenda", href: "/agenda", icon: LayoutList },
  { label: "Tickets & Pricing", href: "/pricing", icon: CreditCard },
  { label: "Registration Form", href: "/form-builder", icon: FormInput },
  { label: "Email Templates", href: "/email-templates", icon: Mail },
  { label: "Settings", href: "/settings", icon: Settings },
]

interface EventTabsProps {
  eventId: string
}

export function EventSettingsTabs({ eventId }: EventTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const basePath = `/admin/events/${eventId}`

  const handleTabClick = useCallback(
    (href: string) => {
      const target = `${basePath}${href}`
      if (pathname !== target) {
        router.push(target)
      }
    },
    [basePath, pathname, router]
  )

  return (
    <div className="border-b">
      <nav className="flex overflow-x-auto -mb-px gap-1">
        {tabs.map((tab) => {
          const href = `${basePath}${tab.href}`
          const isActive =
            tab.href === ""
              ? pathname === basePath
              : pathname.startsWith(href)

          return (
            <button
              key={tab.label}
              onClick={() => handleTabClick(tab.href)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
