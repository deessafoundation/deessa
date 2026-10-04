"use client"

import { X, Eye } from "lucide-react"
import type { FormSchema } from "@/lib/types/conference-form-schema"
import { DynamicFormRenderer } from "@/components/conference/dynamic-form-renderer"
import { Button } from "@/components/ui/button"

interface FormPreviewProps {
  schema: FormSchema
  onClose: () => void
}

export function FormPreview({ schema, onClose }: FormPreviewProps) {
  const handlePreviewSubmit = async (data: Record<string, unknown>) => {
    console.log("Preview form data:", data)
    alert("This is a preview. Form data logged to console.")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Eye className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Form Preview</h2>
              <p className="text-sm text-muted-foreground">
                See how registrants will experience this form
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            {schema.steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-lg font-medium text-foreground">No form to preview</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add fields to your form to see the preview
                </p>
              </div>
            ) : (
              <DynamicFormRenderer
                schema={schema}
                onSubmit={handlePreviewSubmit}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Preview mode — submissions are not saved
            </p>
            <Button onClick={onClose} variant="outline">
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
