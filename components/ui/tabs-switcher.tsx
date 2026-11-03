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
    <div className="flex gap-1 rounded-xl bg-muted p-1 overflow-x-auto scrollbar-none snap-x touch-pan-x max-w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex shrink-0 sm:flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap snap-start",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
          )}
        >
          <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
