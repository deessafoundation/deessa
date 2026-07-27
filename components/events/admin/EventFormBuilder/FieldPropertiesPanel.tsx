"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2, ChevronDown, ChevronRight, GripVertical, Plus } from "lucide-react"
import { OptionsEditor } from "./OptionsEditor"
import { EnhancedConditionalEditor } from "@/components/admin/conference-form-builder/EnhancedConditionalEditor"
import type { FormField, FormStep, FieldConditional } from "@/lib/types/conference-form-schema"

interface FieldPropertiesPanelProps {
  field: FormField | null
  stepId: string | null
  steps: FormStep[]
  allFields: FormField[]
  onUpdate: (stepId: string, fieldId: string, updates: Partial<FormField>) => void
  onDelete: (stepId: string, fieldId: string) => void
}

export function FieldPropertiesPanel({
  field,
  stepId,
  steps,
  allFields,
  onUpdate,
  onDelete,
}: FieldPropertiesPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showConditional, setShowConditional] = useState(false)
  const [showFileConfig, setShowFileConfig] = useState(false)
  const [showDateConfig, setShowDateConfig] = useState(false)

  if (!field || !stepId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 mb-3">
          <span className="text-lg">👆</span>
        </div>
        <p className="text-sm font-medium text-black">Select a field</p>
        <p className="text-xs text-black/40 mt-1">
          Click any field in the canvas to edit its properties
        </p>
      </div>
    )
  }

  const isLocked = false
  const hasOptions = field.type === "select" || field.type === "radio" || field.type === "checkbox"
  const isInput = !["heading", "paragraph"].includes(field.type)
  const isDateField = field.type === "date" || field.type === "dateRange"

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <span className="text-xs font-bold uppercase tracking-wider text-black/30">
          {field.type}
        </span>
        {field.storage === "core" && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-black/25 bg-gray-100 px-1.5 py-0.5 rounded">
            core
          </span>
        )}
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-black/40">Label</Label>
        <Input
          value={field.label}
          onChange={(e) => onUpdate(stepId, field.id, { label: e.target.value })}
          className="h-9 rounded-lg text-sm"
          disabled={isLocked}
        />
      </div>

      {/* Options (for select/radio/checkbox) — shown early for visibility */}
      {hasOptions && (
        <OptionsEditor
          options={field.options || []}
          onChange={(options) => onUpdate(stepId, field.id, { options })}
        />
      )}

      {/* Required */}
      {isInput && (
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-black/40">Required</Label>
          <Switch
            checked={field.required}
            onCheckedChange={(checked) =>
              onUpdate(stepId, field.id, { required: checked })
            }
            disabled={isLocked}
          />
        </div>
      )}

      {/* Placeholder */}
      {isInput && field.type !== "toggle" && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-black/40">Placeholder</Label>
          <Input
            value={field.placeholder || ""}
            onChange={(e) =>
              onUpdate(stepId, field.id, { placeholder: e.target.value })
            }
            className="h-9 rounded-lg text-sm"
            placeholder="Enter placeholder text..."
          />
        </div>
      )}

      {/* Help Text */}
      {isInput && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-black/40">Help Text</Label>
          <Input
            value={field.helpText || ""}
            onChange={(e) =>
              onUpdate(stepId, field.id, { helpText: e.target.value })
            }
            className="h-9 rounded-lg text-sm"
            placeholder="Optional help text..."
          />
        </div>
      )}

      {/* Width */}
      {isInput && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-black/40">Width</Label>
          <div className="flex gap-1.5">
            {(["full", "half"] as const).map((w) => (
              <button
                key={w}
                onClick={() => onUpdate(stepId, field.id, { width: w })}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  field.width === w || (!field.width && w === "full")
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-gray-200 bg-white text-black/50 hover:border-gray-300"
                }`}
              >
                {w === "full" ? "Full Width" : "Half Width"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Min/Max selections for checkbox */}
      {field.type === "checkbox" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-black/40">Min Selections</Label>
            <Input
              type="number"
              min="0"
              value={field.minSelections ?? ""}
              onChange={(e) =>
                onUpdate(stepId, field.id, {
                  minSelections: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-9 rounded-lg text-sm"
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-black/40">Max Selections</Label>
            <Input
              type="number"
              min="0"
              value={field.maxSelections ?? ""}
              onChange={(e) =>
                onUpdate(stepId, field.id, {
                  maxSelections: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-9 rounded-lg text-sm"
              placeholder="Unlimited"
            />
          </div>
        </div>
      )}

      {/* File Upload Config */}
      {field.type === "file" && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowFileConfig(!showFileConfig)}
            className="flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black/60 transition-colors"
          >
            {showFileConfig ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            File Upload Settings
          </button>

          {showFileConfig && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Max Size (MB)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={field.fileUploadConfig?.maxSizeMB ?? 5}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value) || 5, 5)
                      onUpdate(stepId, field.id, {
                        fileUploadConfig: {
                          ...field.fileUploadConfig,
                          maxSizeMB: val,
                        },
                      })
                    }}
                    className="h-8 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Storage Bucket</Label>
                  <Input
                    value={field.fileUploadConfig?.storageBucket ?? "event-uploads"}
                    onChange={(e) =>
                      onUpdate(stepId, field.id, {
                        fileUploadConfig: {
                          ...field.fileUploadConfig,
                          storageBucket: e.target.value,
                        },
                      })
                    }
                    className="h-8 rounded-lg text-xs"
                    placeholder="event-uploads"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-semibold text-black/30">Allow Multiple Files</Label>
                <Switch
                  checked={field.fileUploadConfig?.multiple ?? false}
                  onCheckedChange={(checked) =>
                    onUpdate(stepId, field.id, {
                      fileUploadConfig: {
                        ...field.fileUploadConfig,
                        multiple: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-black/30">Allowed Types</Label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "Images", types: ["image/jpeg", "image/png", "image/gif", "image/webp"] },
                    { label: "PDFs", types: ["application/pdf"] },
                    { label: "Documents", types: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
                    { label: "Spreadsheets", types: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] },
                  ].map((group) => {
                    const currentTypes = field.fileUploadConfig?.allowedTypes ?? []
                    const isActive = group.types.every((t) => currentTypes.includes(t))
                    return (
                      <button
                        key={group.label}
                        onClick={() => {
                          const newTypes = isActive
                            ? currentTypes.filter((t) => !group.types.includes(t))
                            : [...currentTypes, ...group.types]
                          onUpdate(stepId, field.id, {
                            fileUploadConfig: {
                              ...field.fileUploadConfig,
                              allowedTypes: newTypes,
                            },
                          })
                        }}
                        className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${
                          isActive
                            ? "border-primary/40 bg-primary/5 text-primary"
                            : "border-gray-200 text-black/40 hover:border-gray-300"
                        }`}
                      >
                        {group.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date Validation Config */}
      {isDateField && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowDateConfig(!showDateConfig)}
            className="flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black/60 transition-colors"
          >
            {showDateConfig ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            Date Settings
          </button>

          {showDateConfig && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Min Date</Label>
                  <Input
                    value={field.dateValidation?.minDate ?? ""}
                    onChange={(e) =>
                      onUpdate(stepId, field.id, {
                        dateValidation: {
                          ...field.dateValidation,
                          minDate: e.target.value || undefined,
                        },
                      })
                    }
                    className="h-8 rounded-lg text-xs"
                    placeholder="today or 2026-01-01"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Max Date</Label>
                  <Input
                    value={field.dateValidation?.maxDate ?? ""}
                    onChange={(e) =>
                      onUpdate(stepId, field.id, {
                        dateValidation: {
                          ...field.dateValidation,
                          maxDate: e.target.value || undefined,
                        },
                      })
                    }
                    className="h-8 rounded-lg text-xs"
                    placeholder="today+365d or 2026-12-31"
                  />
                </div>
              </div>

              {field.type === "dateRange" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-black/30">Min Span (days)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={field.dateRangeConfig?.minSpan ?? ""}
                      onChange={(e) =>
                        onUpdate(stepId, field.id, {
                          dateRangeConfig: {
                            ...field.dateRangeConfig,
                            minSpan: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      className="h-8 rounded-lg text-xs"
                      placeholder="No minimum"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-black/30">Max Span (days)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={field.dateRangeConfig?.maxSpan ?? ""}
                      onChange={(e) =>
                        onUpdate(stepId, field.id, {
                          dateRangeConfig: {
                            ...field.dateRangeConfig,
                            maxSpan: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      className="h-8 rounded-lg text-xs"
                      placeholder="No maximum"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-black/30">Disabled Days of Week</Label>
                <div className="flex gap-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => {
                    const isDisabled = field.dateValidation?.disabledDaysOfWeek?.includes(idx) ?? false
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          const current = field.dateValidation?.disabledDaysOfWeek ?? []
                          const newDays = isDisabled
                            ? current.filter((d) => d !== idx)
                            : [...current, idx]
                          onUpdate(stepId, field.id, {
                            dateValidation: {
                              ...field.dateValidation,
                              disabledDaysOfWeek: newDays.length > 0 ? newDays : undefined,
                            },
                          })
                        }}
                        className={`flex size-7 items-center justify-center rounded-md text-[10px] font-medium transition-all ${
                          isDisabled
                            ? "bg-red-50 text-red-500 border border-red-200"
                            : "bg-gray-100 text-black/40 hover:bg-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating Config */}
      {field.type === "rating" && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowDateConfig(!showDateConfig)}
            className="flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black/60 transition-colors"
          >
            {showDateConfig ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            Rating Settings
          </button>

          {showDateConfig && (
            <div className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-black/30">Max Stars</Label>
                <div className="flex gap-1">
                  {[3, 4, 5, 7, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() =>
                        onUpdate(stepId, field.id, {
                          ratingConfig: { ...field.ratingConfig, maxStars: n },
                        })
                      }
                      className={`flex size-8 items-center justify-center rounded-md text-xs font-medium transition-all ${
                        (field.ratingConfig?.maxStars ?? 5) === n
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-gray-100 text-black/40 hover:bg-gray-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slider Config */}
      {field.type === "slider" && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowDateConfig(!showDateConfig)}
            className="flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black/60 transition-colors"
          >
            {showDateConfig ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            Slider Settings
          </button>

          {showDateConfig && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Min</Label>
                  <Input
                    type="number"
                    value={field.sliderConfig?.min ?? 0}
                    onChange={(e) =>
                      onUpdate(stepId, field.id, {
                        sliderConfig: { ...field.sliderConfig, min: Number(e.target.value) },
                      })
                    }
                    className="h-8 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Max</Label>
                  <Input
                    type="number"
                    value={field.sliderConfig?.max ?? 100}
                    onChange={(e) =>
                      onUpdate(stepId, field.id, {
                        sliderConfig: { ...field.sliderConfig, max: Number(e.target.value) },
                      })
                    }
                    className="h-8 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Step</Label>
                  <Input
                    type="number"
                    min="1"
                    value={field.sliderConfig?.step ?? 1}
                    onChange={(e) =>
                      onUpdate(stepId, field.id, {
                        sliderConfig: { ...field.sliderConfig, step: Number(e.target.value) || 1 },
                      })
                    }
                    className="h-8 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-black/30">Unit</Label>
                <Input
                  value={field.sliderConfig?.unit ?? ""}
                  onChange={(e) =>
                    onUpdate(stepId, field.id, {
                      sliderConfig: { ...field.sliderConfig, unit: e.target.value || undefined },
                    })
                  }
                  className="h-8 rounded-lg text-xs"
                  placeholder="e.g. %, days, km"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Repeating Config */}
      {field.type === "repeating" && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowDateConfig(!showDateConfig)}
            className="flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black/60 transition-colors"
          >
            {showDateConfig ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            Repeating Section Settings
          </button>

          {showDateConfig && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Min Entries</Label>
                  <Input
                    type="number"
                    min="0"
                    value={field.repeatingConfig?.minRows ?? 0}
                    onChange={(e) =>
                      onUpdate(stepId, field.id, {
                        repeatingConfig: { ...field.repeatingConfig, minRows: Number(e.target.value) },
                      })
                    }
                    className="h-8 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Max Entries</Label>
                  <Input
                    type="number"
                    min="1"
                    value={field.repeatingConfig?.maxRows ?? 10}
                    onChange={(e) =>
                      onUpdate(stepId, field.id, {
                        repeatingConfig: { ...field.repeatingConfig, maxRows: Number(e.target.value) || 10 },
                      })
                    }
                    className="h-8 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-black/30">Add Button Label</Label>
                <Input
                  value={field.repeatingConfig?.addLabel ?? ""}
                  onChange={(e) =>
                    onUpdate(stepId, field.id, {
                      repeatingConfig: { ...field.repeatingConfig, addLabel: e.target.value || undefined },
                    })
                  }
                  className="h-8 rounded-lg text-xs"
                  placeholder="Add another"
                />
              </div>

              {/* Sub-fields */}
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold text-black/30">Sub-fields</Label>
                <div className="space-y-2">
                  {(field.repeatingConfig?.fields ?? []).map((subField, idx) => (
                    <div key={subField.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/50 px-2 py-1.5">
                      <GripVertical className="size-3.5 text-gray-300 shrink-0" />
                      <input
                        value={subField.label}
                        onChange={(e) => {
                          const newFields = [...(field.repeatingConfig?.fields ?? [])]
                          newFields[idx] = { ...newFields[idx], label: e.target.value }
                          onUpdate(stepId, field.id, {
                            repeatingConfig: { ...field.repeatingConfig, fields: newFields },
                          })
                        }}
                        className="flex-1 min-w-0 text-xs bg-transparent border-none p-0 focus:outline-none text-black"
                      />
                      <button
                        onClick={() => {
                          const newFields = (field.repeatingConfig?.fields ?? []).filter((_, i) => i !== idx)
                          onUpdate(stepId, field.id, {
                            repeatingConfig: { ...field.repeatingConfig, fields: newFields },
                          })
                        }}
                        className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs border-dashed"
                  onClick={() => {
                    const newField = {
                      id: `sub_${Date.now()}`,
                      type: "text" as const,
                      label: "New Field",
                      required: false,
                      storage: "custom" as const,
                      order: (field.repeatingConfig?.fields?.length ?? 0),
                    }
                    onUpdate(stepId, field.id, {
                      repeatingConfig: {
                        ...field.repeatingConfig,
                        fields: [...(field.repeatingConfig?.fields ?? []), newField],
                      },
                    })
                  }}
                >
                  <Plus className="mr-1 size-3" />
                  Add Sub-field
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced section */}
      {isInput && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black/60 transition-colors"
          >
            {showAdvanced ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            Advanced
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3">
              {/* Validation */}
              {(field.type === "text" || field.type === "textarea") && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-black/30">Min Length</Label>
                    <Input
                      type="number"
                      min="0"
                      value={field.validation?.minLength ?? ""}
                      onChange={(e) =>
                        onUpdate(stepId, field.id, {
                          validation: {
                            ...field.validation,
                            minLength: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-black/30">Max Length</Label>
                    <Input
                      type="number"
                      min="0"
                      value={field.validation?.maxLength ?? ""}
                      onChange={(e) =>
                        onUpdate(stepId, field.id, {
                          validation: {
                            ...field.validation,
                            maxLength: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {field.type === "number" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-black/30">Min Value</Label>
                    <Input
                      type="number"
                      value={field.validation?.min ?? ""}
                      onChange={(e) =>
                        onUpdate(stepId, field.id, {
                          validation: {
                            ...field.validation,
                            min: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-black/30">Max Value</Label>
                    <Input
                      type="number"
                      value={field.validation?.max ?? ""}
                      onChange={(e) =>
                        onUpdate(stepId, field.id, {
                          validation: {
                            ...field.validation,
                            max: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Pattern (text fields) */}
              {(field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "url") && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-black/30">Pattern (Regex)</Label>
                  <Input
                    value={field.validation?.pattern ?? ""}
                    onChange={(e) =>
                      onUpdate(stepId, field.id, {
                        validation: {
                          ...field.validation,
                          pattern: e.target.value || undefined,
                        },
                      })
                    }
                    className="h-8 rounded-lg text-xs font-mono"
                    placeholder="e.g. ^[A-Z].*"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Conditional Logic */}
      {isInput && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowConditional(!showConditional)}
            className="flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black/60 transition-colors"
          >
            {showConditional ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            Conditional Logic
            {field.conditional && (
              <span className="ml-1 size-1.5 rounded-full bg-primary" />
            )}
          </button>

          {showConditional && (
            <div className="mt-3">
              <EnhancedConditionalEditor
                field={field}
                allFields={allFields}
                onChange={(conditional: FieldConditional | undefined) =>
                  onUpdate(stepId, field.id, { conditional })
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Field info */}
      <div className="border-t border-gray-100 pt-3 space-y-1">
        <p className="text-[10px] text-black/25 font-mono">ID: {field.id}</p>
        <p className="text-[10px] text-black/25">Type: {field.type} | Storage: {field.storage}</p>
      </div>

      {/* Delete */}
      {!isLocked && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => onDelete(stepId, field.id)}
        >
          <Trash2 className="mr-2 size-3.5" />
          Delete Field
        </Button>
      )}
    </div>
  )
}
