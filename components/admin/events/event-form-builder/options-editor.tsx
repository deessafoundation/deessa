"use client"

import { useState } from "react"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { FieldOption } from "@/lib/types/conference-form-schema"

interface OptionsEditorProps {
  options: FieldOption[]
  onChange: (options: FieldOption[]) => void
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const [newLabel, setNewLabel] = useState("")

  function addOption() {
    const label = newLabel.trim()
    if (!label) return
    const value = slugify(label)
    // Check for duplicate value — if exists, append number
    let finalValue = value
    let counter = 1
    while (options.some((o) => o.value === finalValue)) {
      finalValue = `${value}_${counter}`
      counter++
    }
    onChange([...options, { value: finalValue, label }])
    setNewLabel("")
  }

  function updateOption(index: number, updates: Partial<FieldOption>) {
    onChange(
      options.map((o, i) => (i === index ? { ...o, ...updates } : o))
    )
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      addOption()
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-black/40 uppercase tracking-wider">
        Options
      </label>

      {/* Option list */}
      <div className="space-y-1">
        {options.map((option, index) => (
          <div
            key={option.value}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 py-1.5 group"
          >
            <GripVertical className="size-3.5 text-gray-300 shrink-0" />
            <input
              value={option.label}
              onChange={(e) => updateOption(index, { label: e.target.value })}
              className="flex-1 min-w-0 text-sm bg-transparent border-none p-0 focus:outline-none text-black"
            />
            <span className="text-[10px] text-black/25 font-mono shrink-0">
              {option.value}
            </span>
            <button
              onClick={() => removeOption(index)}
              className="shrink-0 flex size-5 items-center justify-center rounded bg-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add option */}
      <div className="flex gap-1.5">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New option..."
          className="h-8 rounded-lg text-xs"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 px-2.5 shrink-0"
          onClick={addOption}
          disabled={!newLabel.trim()}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
