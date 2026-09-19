"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileJson,
} from "lucide-react"
import type { FormSchema } from "@/lib/types/conference-form-schema"
import { notifications } from "@/lib/notifications"

interface SchemaImportExportProps {
  schema: FormSchema
  onImport: (schema: FormSchema) => void
}

interface ImportData {
  deessa_form_schema?: boolean
  /**
   * Legacy marker from before the "Deesha" spelling was corrected. Still
   * accepted on import so schema files exported by older builds keep working.
   */
  deesha_form_schema?: boolean
  version?: number
  exportedAt?: string
  schema: FormSchema
}

export function SchemaImportExport({ schema, onImport }: SchemaImportExportProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importData, setImportData] = useState<ImportData | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const exportData = {
      deessa_form_schema: true,
      version: schema.version,
      exportedAt: new Date().toISOString(),
      schema,
    }

    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `form-schema-v${schema.version}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    notifications.showSuccess({
      title: "Schema Exported",
      description: "Form schema downloaded as JSON.",
    })
  }

  // ── Import ────────────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)
    setImportData(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ImportData

        // Validate. Accept the legacy marker so older exports still import.
        if (!data.deessa_form_schema && !data.deesha_form_schema) {
          setImportError("This is not a valid Deessa form schema file.")
          setImportDialogOpen(true)
          return
        }

        if (!data.schema?.steps || !Array.isArray(data.schema.steps)) {
          setImportError("Invalid schema structure: missing steps array.")
          setImportDialogOpen(true)
          return
        }

        if (data.schema.steps.length === 0) {
          setImportError("Schema has no steps. Import aborted.")
          setImportDialogOpen(true)
          return
        }

        setImportData(data)
        setImportDialogOpen(true)
      } catch {
        setImportError("Invalid JSON file. Please check the file format.")
      }
    }
    reader.readAsText(file)

    // Reset input
    e.target.value = ""
  }

  const handleConfirmImport = () => {
    if (!importData) return
    onImport(importData.schema)
    setImportDialogOpen(false)
    setImportData(null)

    notifications.showSuccess({
      title: "Schema Imported",
      description: `Loaded ${importData.schema.steps.length} steps with ${importData.schema.steps.reduce((n, s) => n + s.fields.length, 0)} fields.`,
    })
  }

  const totalFields = importData?.schema.steps.reduce((n, s) => n + s.fields.length, 0) ?? 0

  return (
    <>
      <div className="flex gap-1">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-black/50 hover:bg-gray-200 hover:text-black/70 transition-colors"
          title="Export schema as JSON"
        >
          <Download className="size-3.5" />
          Export
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-black/50 hover:bg-gray-200 hover:text-black/70 transition-colors"
          title="Import schema from JSON"
        >
          <Upload className="size-3.5" />
          Import
        </button>
      </div>

      {/* Import Confirmation Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="size-5" />
              Import Form Schema
            </DialogTitle>
            <DialogDescription>
              This will replace your current form schema.
            </DialogDescription>
          </DialogHeader>

          {importError ? (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Import Error</p>
                <p className="text-sm text-red-600 mt-1">{importError}</p>
              </div>
            </div>
          ) : importData ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Valid Schema</p>
                  <p className="text-sm text-green-600 mt-1">
                    Ready to import from version {importData.version ?? "?"}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-black">{importData.schema.steps.length}</p>
                  <p className="text-xs text-black/40">Steps</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-black">{totalFields}</p>
                  <p className="text-xs text-black/40">Fields</p>
                </div>
              </div>

              {importData.exportedAt && (
                <p className="text-[10px] text-black/30 text-center">
                  Exported {new Date(importData.exportedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={!importData}
            >
              Import Schema
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
