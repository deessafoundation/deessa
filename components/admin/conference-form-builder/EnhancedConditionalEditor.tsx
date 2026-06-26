"use client"

// ── Enhanced Conditional Logic Editor ───────────────────────────────────────
// Phase 4: Supports AND/OR operators, advanced comparison operators
// (contains, greaterThan, lessThan), and nested conditions.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FancySelect } from "@/components/ui/fancy-select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Zap, Info } from "lucide-react"
import {
  FormField,
  FieldConditional,
  ConditionalOperator,
} from "@/lib/types/conference-form-schema"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EnhancedConditionalEditorProps {
  field: FormField
  allFields: FormField[]
  onChange: (conditional: FieldConditional | undefined) => void
}

const OPERATOR_LABELS: Record<ConditionalOperator, string> = {
  equals: "Equals",
  notEquals: "Not Equals",
  isEmpty: "Is Empty",
  isNotEmpty: "Is Not Empty",
  contains: "Contains",
  notContains: "Does Not Contain",
  greaterThan: "Greater Than",
  lessThan: "Less Than",
  greaterThanOrEqual: "Greater Than or Equal",
  lessThanOrEqual: "Less Than or Equal",
}

const OPERATOR_DESCRIPTIONS: Record<ConditionalOperator, string> = {
  equals: "Field value exactly matches",
  notEquals: "Field value does not match",
  isEmpty: "Field is empty or not filled",
  isNotEmpty: "Field has any value",
  contains: "Field value includes (partial match)",
  notContains: "Field value does not include",
  greaterThan: "Numeric comparison: field > value",
  lessThan: "Numeric comparison: field < value",
  greaterThanOrEqual: "Numeric comparison: field ≥ value",
  lessThanOrEqual: "Numeric comparison: field ≤ value",
}

export function EnhancedConditionalEditor({
  field,
  allFields,
  onChange,
}: EnhancedConditionalEditorProps) {
  // Filter: only fields from earlier steps can be dependencies
  // (This requires step context - simplified here to all fields except self)
  const availableFields = allFields.filter((f) => f.id !== field.id)

  const [enabled, setEnabled] = useState(!!field.conditional)
  const [useAdvancedLogic, setUseAdvancedLogic] = useState(
    !!(field.conditional?.conditions && field.conditional.conditions.length > 0)
  )

  // Simple mode (single condition)
  const [dependsOn, setDependsOn] = useState(
    field.conditional?.dependsOn || ""
  )
  const [operator, setOperator] = useState<ConditionalOperator>(
    field.conditional?.operator || "equals"
  )
  const [value, setValue] = useState(field.conditional?.value || "")

  // Advanced mode (multiple conditions with AND/OR)
  const [logic, setLogic] = useState<"and" | "or">(
    field.conditional?.logic || "and"
  )
  const [conditions, setConditions] = useState<FieldConditional[]>(
    field.conditional?.conditions || []
  )

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked)
    if (!checked) {
      onChange(undefined)
    } else {
      // Initialize with simple condition
      onChange({
        dependsOn: availableFields[0]?.id || "",
        operator: "equals",
        value: "",
      })
    }
  }

  const handleSimpleConditionChange = () => {
    if (!enabled) return

    onChange({
      dependsOn,
      operator,
      value,
    })
  }

  const handleAdvancedConditionChange = () => {
    if (!enabled) return

    onChange({
      dependsOn: "", // Not used in advanced mode
      operator: "equals", // Not used in advanced mode
      value: "", // Not used in advanced mode
      logic,
      conditions,
    })
  }

  const handleAddCondition = () => {
    const newCondition: FieldConditional = {
      dependsOn: availableFields[0]?.id || "",
      operator: "equals",
      value: "",
    }
    const updated = [...conditions, newCondition]
    setConditions(updated)
    onChange({
      dependsOn: "",
      operator: "equals",
      value: "",
      logic,
      conditions: updated,
    })
  }

  const handleUpdateCondition = (
    index: number,
    updates: Partial<FieldConditional>
  ) => {
    const updated = [...conditions]
    updated[index] = { ...updated[index], ...updates }
    setConditions(updated)
    onChange({
      dependsOn: "",
      operator: "equals",
      value: "",
      logic,
      conditions: updated,
    })
  }

  const handleRemoveCondition = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index)
    setConditions(updated)

    if (updated.length === 0) {
      // Switch back to simple mode
      setUseAdvancedLogic(false)
      onChange({
        dependsOn: availableFields[0]?.id || "",
        operator: "equals",
        value: "",
      })
    } else {
      onChange({
        dependsOn: "",
        operator: "equals",
        value: "",
        logic,
        conditions: updated,
      })
    }
  }

  const handleSwitchToAdvanced = () => {
    setUseAdvancedLogic(true)
    // Convert current simple condition to advanced
    const firstCondition: FieldConditional = {
      dependsOn,
      operator,
      value,
    }
    setConditions([firstCondition])
    onChange({
      dependsOn: "",
      operator: "equals",
      value: "",
      logic: "and",
      conditions: [firstCondition],
    })
  }

  const handleSwitchToSimple = () => {
    setUseAdvancedLogic(false)
    // Use first condition as simple
    if (conditions.length > 0) {
      const first = conditions[0]
      setDependsOn(first.dependsOn)
      setOperator(first.operator)
      setValue(first.value || "")
      onChange(first)
    } else {
      onChange({
        dependsOn: availableFields[0]?.id || "",
        operator: "equals",
        value: "",
      })
    }
  }

  // Get options for a field
  const getFieldOptions = (fieldId: string): string[] => {
    const depField = allFields.find((f) => f.id === fieldId)
    if (!depField?.options) return []
    return depField.options.map((opt) => opt.value)
  }

  const needsValue = (op: ConditionalOperator): boolean => {
    return !["isEmpty", "isNotEmpty"].includes(op)
  }

  if (availableFields.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
        <Info className="h-4 w-4 inline mr-2" />
        No fields available for conditional logic. Add fields to earlier steps
        first.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Conditional Visibility</Label>
          <p className="text-sm text-muted-foreground">
            Show this field only when certain conditions are met
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleEnabledChange} />
      </div>

      {enabled && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/20">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between">
            <Badge variant={useAdvancedLogic ? "default" : "secondary"}>
              {useAdvancedLogic ? "Advanced Mode" : "Simple Mode"}
            </Badge>
            {!useAdvancedLogic ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSwitchToAdvanced}
              >
                <Zap className="h-4 w-4 mr-2" />
                Use Advanced Logic
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSwitchToSimple}
              >
                Switch to Simple
              </Button>
            )}
          </div>

          {/* Simple Mode */}
          {!useAdvancedLogic && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>When field</Label>
                <FancySelect
                  value={dependsOn}
                  onValueChange={(val) => {
                    setDependsOn(val)
                    setTimeout(handleSimpleConditionChange, 0)
                  }}
                  placeholder="Select field"
                  options={availableFields.map((f) => ({ value: f.id, label: f.label }))}
                  size="sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Operator</Label>
                <FancySelect
                  value={operator}
                  onValueChange={(val) => {
                    setOperator(val as ConditionalOperator)
                    setTimeout(handleSimpleConditionChange, 0)
                  }}
                  options={Object.entries(OPERATOR_LABELS).map(([op, label]) => ({ value: op, label }))}
                  size="sm"
                />
              </div>

              {needsValue(operator) && (
                <div className="space-y-2">
                  <Label>Value</Label>
                  {getFieldOptions(dependsOn).length > 0 ? (
                    <FancySelect
                      value={value}
                      onValueChange={(val) => {
                        setValue(val)
                        setTimeout(handleSimpleConditionChange, 0)
                      }}
                      placeholder="Select value"
                      options={getFieldOptions(dependsOn).map((opt) => ({ value: opt, label: opt }))}
                      size="sm"
                    />
                  ) : (
                    <Input
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value)
                        setTimeout(handleSimpleConditionChange, 0)
                      }}
                      placeholder="Enter value"
                    />
                  )}
                </div>
              )}

              {/* Summary */}
              <Card className="bg-muted/50">
                <CardContent className="p-3 text-sm">
                  <p className="font-medium mb-1">Show this field when:</p>
                  <p className="text-muted-foreground">
                    {availableFields.find((f) => f.id === dependsOn)?.label ||
                      "field"}{" "}
                    <span className="font-medium">
                      {OPERATOR_LABELS[operator].toLowerCase()}
                    </span>
                    {needsValue(operator) && value && (
                      <span> &quot;{value}&quot;</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Advanced Mode */}
          {useAdvancedLogic && (
            <div className="space-y-4">
              {/* Logic Operator */}
              <div className="flex items-center gap-3">
                <Label>Logic:</Label>
                <FancySelect
                  value={logic}
                  onValueChange={(val) => {
                    setLogic(val as "and" | "or")
                    setTimeout(handleAdvancedConditionChange, 0)
                  }}
                  options={[
                    { value: "and", label: "AND" },
                    { value: "or", label: "OR" },
                  ]}
                  className="w-[120px]"
                  size="sm"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        {logic === "and"
                          ? "ALL conditions must be true"
                          : "ANY condition can be true"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Conditions List */}
              <div className="space-y-3">
                {conditions.map((cond, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Condition {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCondition(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Field Select */}
                      <FancySelect
                        value={cond.dependsOn}
                        onValueChange={(val) =>
                          handleUpdateCondition(index, { dependsOn: val })
                        }
                        placeholder="Select field"
                        options={availableFields.map((f) => ({ value: f.id, label: f.label }))}
                        size="sm"
                      />

                      {/* Operator Select */}
                      <FancySelect
                        value={cond.operator}
                        onValueChange={(val) =>
                          handleUpdateCondition(index, { operator: val as ConditionalOperator })
                        }
                        options={Object.entries(OPERATOR_LABELS).map(([op, label]) => ({ value: op, label }))}
                        size="sm"
                      />

                      {/* Value Input */}
                      {needsValue(cond.operator) && (
                        <>
                          {getFieldOptions(cond.dependsOn).length > 0 ? (
                            <FancySelect
                              value={cond.value}
                              onValueChange={(val) =>
                                handleUpdateCondition(index, { value: val })
                              }
                              placeholder="Select value"
                              options={getFieldOptions(cond.dependsOn).map((opt) => ({ value: opt, label: opt }))}
                              size="sm"
                            />
                          ) : (
                            <Input
                              value={cond.value || ""}
                              onChange={(e) =>
                                handleUpdateCondition(index, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="Enter value"
                            />
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Condition Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCondition}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>

              {/* Summary */}
              <Card className="bg-muted/50">
                <CardContent className="p-3 text-sm">
                  <p className="font-medium mb-2">Show this field when:</p>
                  <div className="space-y-1 text-muted-foreground">
                    {conditions.map((cond, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {index > 0 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            {logic.toUpperCase()}
                          </Badge>
                        )}
                        <span>
                          {availableFields.find((f) => f.id === cond.dependsOn)
                            ?.label || "field"}{" "}
                          <span className="font-medium">
                            {OPERATOR_LABELS[cond.operator].toLowerCase()}
                          </span>
                          {needsValue(cond.operator) && cond.value && (
                            <span> &quot;{cond.value}&quot;</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
