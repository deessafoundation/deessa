"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(value || new Date())

  function handleSelect(date: Date | undefined) {
    if (!date) {
      onChange?.(null)
      setOpen(false)
      return
    }
    const newDate = new Date(date)
    if (value) {
      newDate.setHours(value.getHours(), value.getMinutes(), 0, 0)
    }
    onChange?.(newDate)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange?.(null)
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-accent/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
              {value ? (
                <span className="text-foreground font-medium">
                  {format(value, "MMM d, yyyy")}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export { DatePicker }
export type { DatePickerProps }
