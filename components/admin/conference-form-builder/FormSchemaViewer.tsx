"use client"

import { X, Lock, Shuffle, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { FormSchema, FormField } from "@/lib/types/conference-form-schema"

interface FormSchemaViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schema: FormSchema | null
  eventName?: string
  submittedDate?: string
}

export function FormSchemaViewer({
  open,
  onOpenChange,
  schema,
  eventName,
  submittedDate,
}: FormSchemaViewerProps) {
  if (!schema) return null

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Text Input",
      email: "Email Input",
      tel: "Phone Input",
      number: "Number Input",
      textarea: "Text Area",
      select: "Dropdown",
      radio: "Radio Buttons",
      checkbox: "Checkboxes",
      toggle: "Toggle Switch",
      date: "Date Picker",
      url: "URL Input",
      file: "File Upload",
      heading: "Heading",
    }
    return labels[type] || type
  }

  const getFieldIcon = (field: FormField) => {
    if (field.storage === "core") {
      return <Lock className="size-3.5 text-blue-600" />
    }
    if (field.conditional) {
      return <Shuffle className="size-3.5 text-purple-600" />
    }
    return null
  }

  const formatConditionalLogic = (field: FormField) => {
    if (!field.conditional) return null

    const cond = field.conditional

    return (
      <div className="mt-2 rounded-md bg-purple-50 p-2 text-xs text-purple-900">
        <div className="font-medium mb-1">📋 Conditional Logic:</div>
        <div className="space-y-1">
          <div>
            Shows when <span className="font-mono bg-purple-100 px-1 rounded">{cond.dependsOn}</span>:
          </div>
          <div className="ml-2">
            • {cond.operator === "equals" && `equals "${cond.value}"`}
            {cond.operator === "notEquals" && `does not equal "${cond.value}"`}
            {cond.operator === "contains" && `contains "${cond.value}"`}
            {cond.operator === "isEmpty" && "is empty"}
            {cond.operator === "isNotEmpty" && "is not empty"}
            {cond.operator === "greaterThan" && `is greater than ${cond.value}`}
            {cond.operator === "lessThan" && `is less than ${cond.value}`}
          </div>
          {cond.conditions && cond.conditions.length > 0 && (
            <div className="ml-2 mt-1">
              <div className="text-purple-700 font-medium">{cond.logic?.toUpperCase() || "AND"} conditions:</div>
              {cond.conditions.map((nestedCond, idx) => (
                <div key={idx} className="ml-2">
                  • {nestedCond.dependsOn} {nestedCond.operator} "{nestedCond.value}"
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const totalFields = schema.steps.reduce((sum, step) => sum + step.fields.length, 0)
  const requiredFields = schema.steps.reduce(
    (sum, step) => sum + step.fields.filter((f) => f.required).length,
    0
  )
  const conditionalFields = schema.steps.reduce(
    (sum, step) => sum + step.fields.filter((f) => f.conditional).length,
    0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-xl">
                Form Schema — Version {schema.version}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {submittedDate
                  ? `This is the form that was active when the registration was submitted on ${submittedDate}.`
                  : "Read-only view of the form structure."}
                {eventName && (
                  <span className="block mt-1">
                    Event: <span className="font-medium text-foreground">{eventName}</span>
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Schema Stats */}
        <div className="flex flex-wrap gap-3 pb-4 border-b">
          <Badge variant="secondary" className="text-sm">
            {schema.steps.length} {schema.steps.length === 1 ? "step" : "steps"}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {totalFields} {totalFields === 1 ? "field" : "fields"}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <CheckCircle2 className="size-3 mr-1" />
            {requiredFields} required
          </Badge>
          {conditionalFields > 0 && (
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-sm">
              <Shuffle className="size-3 mr-1" />
              {conditionalFields} conditional
            </Badge>
          )}
        </div>

        {/* Steps and Fields */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {schema.steps.map((step, stepIndex) => (
              <Card key={step.id} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {stepIndex + 1}
                    </span>
                    {step.label}
                  </CardTitle>
                  {step.description && (
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {step.fields.map((field) => (
                    <div
                      key={field.id}
                      className="rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Field Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getFieldIcon(field)}
                            <span className="font-medium text-foreground">{field.label}</span>
                            {field.required && (
                              <Badge
                                variant="outline"
                                className="border-red-200 bg-red-50 text-red-700 text-xs"
                              >
                                Required
                              </Badge>
                            )}
                            {field.storage === "core" && (
                              <Badge
                                variant="outline"
                                className="border-blue-200 bg-blue-50 text-blue-700 text-xs"
                              >
                                🔒 Core Field
                              </Badge>
                            )}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Type: <span className="font-medium">{getFieldTypeLabel(field.type)}</span>
                          </div>

                          {field.placeholder && (
                            <div className="text-sm text-muted-foreground">
                              Placeholder: "{field.placeholder}"
                            </div>
                          )}

                          {field.helpText && (
                            <div className="text-sm text-muted-foreground">
                              Help: {field.helpText}
                            </div>
                          )}

                          {/* Options for select/radio/checkbox */}
                          {field.options && field.options.length > 0 && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Options:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {field.options.map((option, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {option.label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Validation Rules */}
                          {field.validation && Object.keys(field.validation).length > 0 && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Validation:</span>
                              <div className="mt-1 space-y-1">
                                {field.validation.minLength && (
                                  <div className="text-xs text-muted-foreground">
                                    • Min length: {field.validation.minLength}
                                  </div>
                                )}
                                {field.validation.maxLength && (
                                  <div className="text-xs text-muted-foreground">
                                    • Max length: {field.validation.maxLength}
                                  </div>
                                )}
                                {field.validation.min !== undefined && (
                                  <div className="text-xs text-muted-foreground">
                                    • Min value: {field.validation.min}
                                  </div>
                                )}
                                {field.validation.max !== undefined && (
                                  <div className="text-xs text-muted-foreground">
                                    • Max value: {field.validation.max}
                                  </div>
                                )}
                                {field.validation.pattern && (
                                  <div className="text-xs text-muted-foreground">
                                    • Pattern: <code className="bg-muted px-1 rounded">{field.validation.pattern}</code>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Conditional Logic */}
                          {formatConditionalLogic(field)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Info */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-blue-600" />
              <span>Core Field (cannot be modified)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shuffle className="size-3.5 text-purple-600" />
              <span>Conditional Field (shows/hides based on other answers)</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
