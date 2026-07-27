"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Settings, FormInput } from "lucide-react"

const TABS = [
  {
    id: "general",
    label: "General Settings",
    icon: Settings,
    href: "/admin/conference/settings",
  },
  {
    id: "form-builder",
    label: "Form Builder",
    icon: FormInput,
    href: "/admin/conference/settings/form-builder",
  },
]

export default function ConferenceSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const getActiveTab = () => {
    if (pathname.includes("/form-builder")) return "form-builder"
    return "general"
  }

  const activeTab = getActiveTab()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/conference"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Conference
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Settings</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Settings className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conference Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure event details, payment, and registration form
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
