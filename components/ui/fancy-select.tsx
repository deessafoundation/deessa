"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface FancySelectOption {
  value: string
  label: string
  disabled?: boolean
}

type FancySelectSize = "sm" | "default" | "lg"
type FancySelectVariant = "default" | "toolbar"

interface FancySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options: FancySelectOption[]
  disabled?: boolean
  className?: string
  size?: FancySelectSize
  variant?: FancySelectVariant
  name?: string
  defaultValue?: string
}

const sizeStyles: Record<FancySelectSize, string> = {
  sm: "h-9 px-3 text-xs gap-2",
  default: "h-14 px-4 text-base gap-3",
  lg: "h-14 px-4 text-base gap-3",
}

const variantStyles: Record<FancySelectVariant, string> = {
  default: "",
  toolbar: "!border-0 !shadow-none bg-transparent px-1",
}

const optionStyles: Record<FancySelectSize, string> = {
  sm: "px-2.5 py-1.5 text-xs rounded-md",
  default: "px-3 py-2.5 text-sm rounded-lg",
  lg: "px-3 py-2.5 text-sm rounded-lg",
}

const iconStyles: Record<FancySelectSize, string> = {
  sm: "size-4",
  default: "size-5",
  lg: "size-5",
}

export function FancySelect({
  value,
  onValueChange,
  placeholder = "Select an option...",
  options,
  disabled = false,
  className,
  size = "default",
  variant = "default",
  name,
  defaultValue,
}: FancySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  const [internalValue, setInternalValue] = useState(defaultValue ?? "")
  const currentValue = value !== undefined ? value : internalValue

  const selectedOption = options.find((opt) => opt.value === currentValue)

  const scrollToIndex = useCallback((index: number) => {
    if (itemsRef.current[index]) {
      itemsRef.current[index]?.scrollIntoView({ block: "nearest" })
    }
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [])

  const selectOption = useCallback(
    (option: FancySelectOption) => {
      if (option.disabled) return
      if (value === undefined) setInternalValue(option.value)
      onValueChange?.(option.value)
      requestAnimationFrame(() => {
        close()
        triggerRef.current?.focus()
      })
    },
    [onValueChange, close, value]
  )

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const enabledOptions = options.filter((o) => !o.disabled)

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) => {
            const next = prev < options.length - 1 ? prev + 1 : 0
            scrollToIndex(next)
            return next
          })
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : options.length - 1
            scrollToIndex(next)
            return next
          })
          break
        case "Enter":
        case " ":
          e.preventDefault()
          if (highlightedIndex >= 0 && !options[highlightedIndex]?.disabled) {
            selectOption(options[highlightedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          close()
          break
        case "Home":
          e.preventDefault()
          setHighlightedIndex(0)
          scrollToIndex(0)
          break
        case "End":
          e.preventDefault()
          setHighlightedIndex(options.length - 1)
          scrollToIndex(options.length - 1)
          break
        case "Tab":
          close()
          break
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        !triggerRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        close()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, options, highlightedIndex, selectOption, close, scrollToIndex])

  return (
    <div className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen)
        }}
        className={cn(
          "group flex w-full items-center justify-between rounded-xl border-2 bg-background text-foreground transition-all duration-200",
          "hover:border-primary/40 hover:shadow-[0_0_0_3px_rgba(63,171,222,0.08)]",
          "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(63,171,222,0.15)]",
          isOpen && "border-primary shadow-[0_0_0_3px_rgba(63,171,222,0.15)]",
          disabled && "cursor-not-allowed opacity-50",
          !selectedOption && "text-muted-foreground",
          sizeStyles[size],
          variantStyles[variant]
        )}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-200",
            "group-hover:text-primary",
            isOpen && "rotate-180 text-primary",
            iconStyles[size]
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Options"
          className={cn(
            "absolute z-50 mt-2 w-full overflow-hidden rounded-xl border-2 border-border bg-card shadow-xl",
            "max-h-60 overflow-y-auto",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2"
          )}
          data-state={isOpen ? "open" : "closed"}
        >
          <div className="p-1.5">
            {options.map((option, index) => {
              const isSelected = option.value === currentValue
              const isHighlighted = index === highlightedIndex

              return (
                <div
                  key={option.value}
                  ref={(el) => { itemsRef.current[index] = el }}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onMouseEnter={() => {
                    if (!option.disabled) setHighlightedIndex(index)
                  }}
                  onMouseLeave={() => {
                    if (!option.disabled) setHighlightedIndex(-1)
                  }}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 font-medium transition-all duration-100",
                    option.disabled && "cursor-not-allowed opacity-40",
                    !option.disabled && !isSelected && !isHighlighted && "text-foreground",
                    !option.disabled && isHighlighted && !isSelected && "bg-primary/8 text-primary",
                    isSelected && "bg-primary/10 text-primary",
                    !option.disabled && isHighlighted && isSelected && "bg-primary/15 text-primary",
                    optionStyles[size]
                  )}
                >
                  {isSelected && (
                    <Check className="size-4 shrink-0 text-primary" strokeWidth={3} />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
