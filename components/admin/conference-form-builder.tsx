"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Eye, Clock, AlertTriangle, AlertCircle } from "lucide-react"
import type { FormSchema } from "@/lib/types/conference-form-schema"
import type { Event } from "@/lib/actions/events"
import { updateFormSchema } from "@/lib/actions/conference-form-schema"
import { validateFormSchema, formatValidationErrors, type ValidationResult } from "@/lib/validation/schema-validation"
import { notifications } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import { FormFieldPalette } from "./form-field-palette"
import { FormCanvas } from "./form-canvas"
import { FormFieldEditor } from "./form-field-editor"
import { FormPreview } from "./form-preview"
import { EventSelector } from "./conference-form-builder/EventSelector"

interface ConferenceFormBuilderProps {
  initialSchema: FormSchema
  events: Event[]
  selectedEventId: string | null
}

export function ConferenceFormBuilder({ initialSchema, events, selectedEventId: initialEventId }: ConferenceFormBuilderProps) {
  const router = useRouter()
  const [schema, setSchema] = useState<FormSchema>(initialSchema)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(initialEventId)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  // Handle event change - navigate to new URL
  const handleEventChange = (newEventId: string) => {
    setSelectedEventId(newEventId)
    router.push(`/admin/conference/settings/form-builder?event=${newEventId}`)
  }

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(schema) !== JSON.stringify(initialSchema)
    setHasUnsavedChanges(hasChanges)

    // Validate schema on change
    if (hasChanges) {
      const result = validateFormSchema(schema)
      setValidationResult(result)
    } else {
      setValidationResult(null)
    }
  }, [schema, initialSchema])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleSave = async (publish: boolean) => {
    // Validate before save
    const validation = validateFormSchema(schema)
    
    if (!validation.valid) {
      const errorMessage = formatValidationErrors(validation)
      notifications.showError({
        title: "Validation Failed",
        description: "Please fix the errors before saving:\n" + errorMessage,
      })
      return
    }

    // Show warnings but allow save
    if (validation.warnings.length > 0) {
      const warningMessage = formatValidationErrors(validation)
      const proceed = confirm(
        `The following warnings were found:\n\n${warningMessage}\n\nDo you want to continue saving?`
      )
      if (!proceed) return
    }

    // Ensure we have an event_id
    if (!selectedEventId) {
      notifications.showError({
        title: "No Event Selected",
        description: "Please select an event before saving.",
      })
      return
    }

    setIsSaving(true)
    
    try {
      const result = await updateFormSchema(schema, selectedEventId, publish)
      
      if (result.success) {
        setHasUnsavedChanges(false)
        setValidationResult(null)
        notifications.showSuccess({
          title: publish ? "Form Published ✓" : "Draft Saved ✓",
          description: publish
            ? "Your form is now live for registrants."
            : "Changes saved as draft. Publish to make them live.",
        })
      } else {
        notifications.showError({
          title: "Save Failed",
          description: result.error || "Please try again.",
        })
      }
    } catch (error) {
      notifications.showError({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getSelectedField = () => {
    if (!selectedFieldId) return null
    
    for (const step of schema.steps) {
      const field = step.fields.find((f) => f.id === selectedFieldId)
      if (field) return field
    }
    
    return null
  }

  const selectedField = getSelectedField()

  return (
    <>
      <div className="space-y-4">
        {/* Event Selector */}
        {events.length > 0 && (
          <EventSelector
            events={events}
            selectedEventId={selectedEventId}
            onEventChange={handleEventChange}
            activeSchemaVersion={schema.version}
            lastUpdated={schema.metadata?.updatedAt || undefined}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Version {schema.version}
              </span>
            </div>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                <AlertTriangle className="size-3.5" />
                <span className="text-xs font-semibold">Unsaved Changes</span>
              </div>
            )}
            {validationResult && !validationResult.valid && (
              <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-red-800">
                <AlertCircle className="size-3.5" />
                <span className="text-xs font-semibold">
                  {validationResult.errors.length} Error{validationResult.errors.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            {validationResult && validationResult.valid && validationResult.warnings.length > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
                <AlertTriangle className="size-3.5" />
                <span className="text-xs font-semibold">
                  {validationResult.warnings.length} Warning{validationResult.warnings.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="gap-2"
            >
              <Eye className="size-4" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving || !hasUnsavedChanges}
              className="gap-2"
            >
              <Save className="size-4" />
              Save Draft
            </Button>

            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving || !hasUnsavedChanges || !!(validationResult && !validationResult.valid)}
              className="gap-2"
            >
              <Save className="size-4" />
              {isSaving ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>

        {/* Three-Panel Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel: Field Palette */}
          <div className="col-span-3">
            <FormFieldPalette schema={schema} onSchemaChange={setSchema} />
          </div>

          {/* Center Panel: Form Canvas */}
          <div className="col-span-6">
            <FormCanvas
              schema={schema}
              selectedFieldId={selectedFieldId}
              onSchemaChange={setSchema}
              onFieldSelect={setSelectedFieldId}
            />
          </div>

          {/* Right Panel: Field Properties */}
          <div className="col-span-3">
            {selectedField ? (
              <FormFieldEditor
                field={selectedField}
                schema={schema}
                onSchemaChange={setSchema}
                onClose={() => setSelectedFieldId(null)}
              />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-center text-sm text-muted-foreground">
                  Select a field to edit its properties
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <FormPreview
          schema={schema}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}
