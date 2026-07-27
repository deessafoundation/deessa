"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface Tab {
  label: string
  id: string
  icon: LucideIcon
}

interface TabsSwitcherProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
}

export function TabsSwitcher({ tabs, activeTab, onTabChange }: TabsSwitcherProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}
