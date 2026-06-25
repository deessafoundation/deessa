"use client"

import { FormField } from "@/lib/types/conference-form-schema"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { FIELD_REGISTRY, type FieldProps } from "./index"

interface FieldRepeatingProps {
  field: FormField
  value: Record<string, unknown>[]
  onChange: (value: Record<string, unknown>[]) => void
  error?: string
}

export function FieldRepeating({ field, value, onChange, error }: FieldRepeatingProps) {
  const config = field.repeatingConfig ?? {}
  const minRows = config.minRows ?? 0
  const maxRows = config.maxRows ?? 10
  const addLabel = config.addLabel ?? "Add another"
  const subFields = config.fields ?? []

  const rows = Array.isArray(value) ? value : []
  const canAdd = rows.length < maxRows
  const canRemove = rows.length > minRows

  const addRow = () => {
    if (!canAdd) return
    const newRow: Record<string, unknown> = {}
    subFields.forEach((sf) => {
      newRow[sf.id] = sf.defaultValue ?? (
        sf.type === "checkbox" ? [] :
        sf.type === "toggle" ? false :
        sf.type === "rating" ? null :
        sf.type === "slider" ? (sf.sliderConfig?.min ?? 0) :
        sf.type === "repeating" ? [] :
        ""
      )
    })
    onChange([...rows, newRow])
  }

  const removeRow = (index: number) => {
    if (!canRemove) return
    onChange(rows.filter((_, i) => i !== index))
  }

  const updateRow = (index: number, fieldId: string, fieldValue: unknown) => {
    const updated = rows.map((row, i) =>
      i === index ? { ...row, [fieldId]: fieldValue } : row
    )
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}

      <div className="space-y-3">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-300" />
                <span className="text-xs font-semibold text-black/40">
                  Entry {rowIndex + 1}
                </span>
              </div>
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(rowIndex)}
                  className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subFields.map((subField) => {
                const SubFieldComponent = FIELD_REGISTRY[subField.type]
                if (!SubFieldComponent) return null

                const fieldProps: FieldProps = {
                  field: subField,
                  value: row[subField.id] ?? subField.defaultValue ?? (
                    subField.type === "checkbox" ? [] :
                    subField.type === "toggle" ? false :
                    subField.type === "rating" ? null :
                    subField.type === "slider" ? (subField.sliderConfig?.min ?? 0) :
                    ""
                  ),
                  onChange: (val) => updateRow(rowIndex, subField.id, val),
                  onBlur: () => {},
                }

                return (
                  <div key={subField.id}>
                    <SubFieldComponent {...fieldProps} />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {canAdd && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      )}

      {rows.length > 0 && (
        <p className="text-[10px] text-black/30 text-center">
          {rows.length} of {maxRows} entries
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
