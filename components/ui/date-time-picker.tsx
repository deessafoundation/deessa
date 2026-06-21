"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"

interface DateTimePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  granularity?: "date" | "time" | "datetime"
}

function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled = false,
  className,
  granularity = "datetime",
}: DateTimePickerProps) {
  if (granularity === "date") {
    return (
      <DatePicker
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    )
  }

  if (granularity === "time") {
    return (
      <TimePicker
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    )
  }

  // DateTime mode - show both date and time side by side
  return (
    <div className={cn("flex gap-2", className)}>
      <DatePicker
        value={value}
        onChange={onChange}
        placeholder="Pick a date"
        disabled={disabled}
        className="flex-1"
      />
      <TimePicker
        value={value}
        onChange={onChange}
        placeholder="Pick a time"
        disabled={disabled}
        className="w-36"
      />
    </div>
  )
}

export { DateTimePicker }
export type { DateTimePickerProps }
