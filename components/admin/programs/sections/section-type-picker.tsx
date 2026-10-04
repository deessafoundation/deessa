"use client"

import { useState } from "react"
import {
  FileText, BarChart3, Images, LayoutGrid, ListOrdered, Clock,
  Quote, HelpCircle, TrendingUp, MousePointerClick, Calendar,
  BookOpen, Users, Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SectionType } from "../../program-sections/types"
import { SECTION_CATEGORIES, SECTION_TYPE_MAP } from "../../program-sections/types"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, BarChart3, Images, LayoutGrid, ListOrdered, Clock,
  Quote, HelpCircle, TrendingUp, MousePointerClick, Calendar,
  BookOpen, Users,
}

interface SectionTypePickerProps {
  onAdd: (type: SectionType) => void
}

export function SectionTypePicker({ onAdd }: SectionTypePickerProps) {
  const [open, setOpen] = useState(false)

  function handleAdd(type: SectionType) {
    onAdd(type)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-2">
            {SECTION_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <p className="mb-2 px-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {cat.name}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {cat.types.map((type) => {
                    const config = SECTION_TYPE_MAP[type]
                    const Icon = ICON_MAP[config.icon]
                    return (
                      <button
                        key={type}
                        onClick={() => handleAdd(type)}
                        className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none">{config.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground leading-snug">{config.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
