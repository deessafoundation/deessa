"use client"

import * as React from "react"
import { Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

type ViewMode = "hours" | "minutes"

function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
  disabled = false,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [view, setView] = React.useState<ViewMode>("hours")
  const [isDragging, setIsDragging] = React.useState(false)
  const [hasDragged, setHasDragged] = React.useState(false)
  const clockRef = React.useRef<HTMLDivElement>(null)

  const hours = value ? value.getHours() : 9
  const minutes = value ? value.getMinutes() : 0
  const displayHours = hours % 12 || 12
  const period = hours >= 12 ? "PM" : "AM"

  const HOURS_12 = [
    { value: 12, angle: 0 },
    { value: 1, angle: 30 },
    { value: 2, angle: 60 },
    { value: 3, angle: 90 },
    { value: 4, angle: 120 },
    { value: 5, angle: 150 },
    { value: 6, angle: 180 },
    { value: 7, angle: 210 },
    { value: 8, angle: 240 },
    { value: 9, angle: 270 },
    { value: 10, angle: 300 },
    { value: 11, angle: 330 },
  ]

  const MINUTES_60 = Array.from({ length: 12 }, (_, i) => ({
    value: i * 5,
    angle: i * 30,
  }))

  function angleFromPosition(x: number, y: number, rect: DOMRect): number {
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = x - centerX
    const dy = y - centerY
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI)
    if (angle < 0) angle += 360
    return angle
  }

  function angleToHour(angle: number): number {
    const index = Math.round(angle / 30) % 12
    return HOURS_12[index].value
  }

  function angleToMinute(angle: number): number {
    const index = Math.round(angle / 30) % 12
    return MINUTES_60[index].value
  }

  function handleClockInteraction(clientX: number, clientY: number) {
    if (!clockRef.current) return
    const rect = clockRef.current.getBoundingClientRect()
    const angle = angleFromPosition(clientX, clientY, rect)

    if (view === "hours") {
      const hour = angleToHour(angle)
      const newDate = value ? new Date(value) : new Date()
      let hour24 = period === "PM" ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour)
      newDate.setHours(hour24, minutes, 0, 0)
      onChange?.(newDate)
    } else {
      const minute = angleToMinute(angle)
      const newDate = value ? new Date(value) : new Date()
      let hour24 = period === "PM" ? (displayHours === 12 ? 12 : displayHours + 12) : (displayHours === 12 ? 0 : displayHours)
      newDate.setHours(hour24, minute, 0, 0)
      onChange?.(newDate)
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true)
    setHasDragged(false)
    handleClockInteraction(e.clientX, e.clientY)
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return
    setHasDragged(true)
    handleClockInteraction(e.clientX, e.clientY)
  }

  function handleMouseUp() {
    // Only auto-switch to minutes if we dragged (not just clicked a number)
    if (isDragging && hasDragged && view === "hours") {
      setView("minutes")
    }
    setIsDragging(false)
    setHasDragged(false)
  }

  function handleTouchStart(e: React.TouchEvent) {
    setIsDragging(true)
    setHasDragged(false)
    const touch = e.touches[0]
    handleClockInteraction(touch.clientX, touch.clientY)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging) return
    setHasDragged(true)
    const touch = e.touches[0]
    handleClockInteraction(touch.clientX, touch.clientY)
  }

  function handleTouchEnd() {
    if (isDragging && hasDragged && view === "hours") {
      setView("minutes")
    }
    setIsDragging(false)
    setHasDragged(false)
  }

  React.useEffect(() => {
    if (isDragging) {
      function onMouseUp() {
        if (hasDragged && view === "hours") {
          setView("minutes")
        }
        setIsDragging(false)
        setHasDragged(false)
      }
      window.addEventListener("mouseup", onMouseUp)
      window.addEventListener("touchend", onMouseUp)
      return () => {
        window.removeEventListener("mouseup", onMouseUp)
        window.removeEventListener("touchend", onMouseUp)
      }
    }
  }, [isDragging])

  function setPeriod(p: "AM" | "PM") {
    if (!value) {
      const newDate = new Date()
      let hour = p === "PM" ? (displayHours === 12 ? 12 : displayHours + 12) : (displayHours === 12 ? 0 : displayHours)
      newDate.setHours(hour, minutes, 0, 0)
      onChange?.(newDate)
      return
    }
    const newDate = new Date(value)
    let hour = p === "PM" ? (displayHours === 12 ? 12 : displayHours + 12) : (displayHours === 12 ? 0 : displayHours)
    newDate.setHours(hour, minutes, 0, 0)
    onChange?.(newDate)
  }

  function setHour(h: number) {
    const newDate = value ? new Date(value) : new Date()
    let hour24 = period === "PM" ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h)
    newDate.setHours(hour24, minutes, 0, 0)
    onChange?.(newDate)
  }

  function setMinute(m: number) {
    const newDate = value ? new Date(value) : new Date()
    let hour24 = period === "PM" ? (displayHours === 12 ? 12 : displayHours + 12) : (displayHours === 12 ? 0 : displayHours)
    newDate.setHours(hour24, m, 0, 0)
    onChange?.(newDate)
  }

  const handAngle = view === "hours" ? (displayHours % 12) * 30 : (minutes / 5) * 30
  const handLength = view === "hours" ? 72 : 90

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setView("hours") }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-accent/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground shrink-0" />
              {value ? (
                <span className="text-foreground font-medium">
                  {String(displayHours).padStart(2, "0")}:{String(minutes).padStart(2, "0")} {period}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="size-4" />
          </button>
        </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <div className="p-4">
          {/* Header: Time Display + AM/PM */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Hour */}
            <button
              type="button"
              onClick={() => setView("hours")}
              className={cn(
                "rounded-xl px-3 py-2 text-2xl font-bold transition-all",
                view === "hours"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {String(displayHours).padStart(2, "0")}
            </button>
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            {/* Minute — editable input for any value 0-59 */}
            <input
              type="number"
              min={0}
              max={59}
              value={String(minutes).padStart(2, "0")}
              onChange={(e) => {
                const raw = parseInt(e.target.value, 10)
                if (!isNaN(raw) && raw >= 0 && raw <= 59) {
                  setMinute(raw)
                }
              }}
              onFocus={() => setView("minutes")}
              className={cn(
                "w-14 rounded-xl px-2 py-2 text-2xl font-bold text-center transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                view === "minutes"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted"
              )}
            />
            {/* AM/PM */}
            <div className="flex flex-col gap-0.5 ml-1">
              {(["AM", "PM"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                    period === p
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Clock Face */}
          <div className="flex justify-center">
            <div
              ref={clockRef}
              className="relative w-56 h-56 rounded-full border-2 border-border bg-card cursor-pointer select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-3 h-3 rounded-full bg-primary shadow-md" />
              </div>

              {/* Hand */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="absolute w-0.5 bg-primary rounded-full transition-transform duration-100"
                  style={{
                    height: `${handLength}px`,
                    transform: `rotate(${handAngle}deg)`,
                    transformOrigin: "bottom center",
                    bottom: "50%",
                  }}
                />
              </div>

              {/* Hour/Minute markers */}
              {view === "hours"
                ? HOURS_12.map(({ value: h, angle }) => {
                    const rad = (angle * Math.PI) / 180
                    const radius = 96
                    const x = Math.sin(rad) * radius
                    const y = -Math.cos(rad) * radius
                    const isSelected = displayHours === h
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setHour(h) }}
                        className={cn(
                          "absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all z-20",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-lg scale-110"
                            : "text-foreground hover:bg-muted"
                        )}
                        style={{
                          left: `calc(50% + ${x}px - 20px)`,
                          top: `calc(50% + ${y}px - 20px)`,
                        }}
                      >
                        {h}
                      </button>
                    )
                  })
                : MINUTES_60.map(({ value: m, angle }) => {
                    const rad = (angle * Math.PI) / 180
                    const radius = 96
                    const x = Math.sin(rad) * radius
                    const y = -Math.cos(rad) * radius
                    const isSelected = minutes === m
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMinute(m) }}
                        className={cn(
                          "absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all z-20",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-lg scale-110"
                            : "text-foreground hover:bg-muted"
                        )}
                        style={{
                          left: `calc(50% + ${x}px - 20px)`,
                          top: `calc(50% + ${y}px - 20px)`,
                        }}
                      >
                        {String(m).padStart(2, "0")}
                      </button>
                    )
                  })}

              {/* Clock tick marks */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 224 224">
                {Array.from({ length: 60 }, (_, i) => {
                  const angle = (i * 6 * Math.PI) / 180
                  const isHour = i % 5 === 0
                  const innerR = isHour ? 98 : 102
                  const outerR = 106
                  return (
                    <line
                      key={i}
                      x1={112 + Math.sin(angle) * innerR}
                      y1={112 - Math.cos(angle) * innerR}
                      x2={112 + Math.sin(angle) * outerR}
                      y2={112 - Math.cos(angle) * outerR}
                      stroke="currentColor"
                      strokeWidth={isHour ? 2 : 0.5}
                      className={isHour ? "text-border" : "text-muted-foreground/30"}
                    />
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-4">
            {["Now", "9:00 AM", "12:00 PM", "5:00 PM", "6:00 PM"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  if (preset === "Now") {
                    onChange?.(new Date())
                  } else {
                    const [time, per] = preset.split(" ")
                    const [h, m] = time.split(":").map(Number)
                    const newDate = value ? new Date(value) : new Date()
                    const hour24 = per === "PM" ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h)
                    newDate.setHours(hour24, m, 0, 0)
                    onChange?.(newDate)
                  }
                }}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
      </Popover>
      {value && (
        <button
          type="button"
          onClick={() => onChange?.(null)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export { TimePicker }
export type { TimePickerProps }
