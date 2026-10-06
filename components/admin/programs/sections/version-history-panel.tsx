"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Loader2, History, ChevronDown, ChevronRight, RotateCcw,
  Eye, Clock, User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  getProgramVersions,
  getProgramVersion,
  restoreProgramVersion,
  type VersionRow,
} from "@/lib/actions/program-crud"
import { notifications } from "@/lib/notifications"

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ── Version Preview (separate component for type safety) ──

function VersionPreview({ data }: { data: { hero: unknown; sections: unknown; programData: unknown } }) {
  const hero = data.hero as Record<string, string> | null
  const heroImage = hero?.image as string | Record<string, string> | undefined
  const imageUrl = typeof heroImage === "string" ? heroImage : heroImage?.url
  const sections = Array.isArray(data.sections) ? data.sections as Record<string, unknown>[] : []

  return (
    <div className="space-y-4 text-sm">
      {hero && (
        <div className="rounded-lg border p-3 space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Hero</p>
          <p className="font-medium">{hero.title || "No title"}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {hero.description || "No description"}
          </p>
          {imageUrl && (
            <div className="mt-2 rounded-md overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="w-full h-32 object-cover" />
            </div>
          )}
        </div>
      )}

      {sections.length > 0 && (
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Sections ({sections.length})
          </p>
          {sections.map((s, i) => {
            const content = s.content as Record<string, string> | undefined
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="text-[9px] font-mono">{content?.type}</Badge>
                <span className="text-muted-foreground truncate">
                  {(s.heading as string) || (s.intro as string) || "No heading"}
                </span>
                {!s.enabled && (
                  <Badge variant="secondary" className="text-[9px]">disabled</Badge>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────

interface VersionHistoryPanelProps {
  programId: string
  currentRevision: number
  onRestored: (revision: number, hero: unknown, sections: unknown) => void
}

export function VersionHistoryPanel({ programId, currentRevision, onRestored }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<VersionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [previewVersion, setPreviewVersion] = useState<number | null>(null)
  const [previewData, setPreviewData] = useState<{ hero: unknown; sections: unknown; programData: unknown } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; version: number }>({
    open: false,
    version: 0,
  })
  const [restoring, setRestoring] = useState(false)

  const fetchVersions = useCallback(async () => {
    const data = await getProgramVersions(programId)
    setVersions(data)
    setLoading(false)
  }, [programId])

  useEffect(() => {
    if (open) fetchVersions()
  }, [open, fetchVersions])

  async function handlePreview(versionNumber: number) {
    setPreviewVersion(versionNumber)
    setPreviewLoading(true)
    const result = await getProgramVersion(programId, versionNumber)
    setPreviewLoading(false)
    if (result.ok) {
      setPreviewData(result.data)
    } else {
      notifications.showError({ description: result.error })
    }
  }

  async function handleRestore() {
    setRestoring(true)
    const result = await restoreProgramVersion(programId, restoreDialog.version)
    setRestoring(false)
    setRestoreDialog({ open: false, version: 0 })

    if (!result.ok) {
      notifications.showError({ title: "Restore failed", description: result.error })
      return
    }

    // Reload the version to get the restored content
    const versionResult = await getProgramVersion(programId, restoreDialog.version)
    if (versionResult.ok) {
      onRestored(result.data.revision, versionResult.data.hero, versionResult.data.sections)
    }
    notifications.showSuccess({ description: `Restored to version ${restoreDialog.version}` })
    fetchVersions()
  }

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <History className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="text-sm font-medium">Version History</span>
            {versions.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {versions.length} version{versions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t px-5 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No published versions yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Versions are created when you publish
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {versions.map((v) => {
                const isCurrent = false // A draft revision is not a published version number.
                return (
                  <div
                    key={v.id}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      isCurrent ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">v{v.version_number}</span>
                        {isCurrent && (
                          <Badge variant="default" className="text-[9px] px-1.5 py-0">current</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="size-2.5" />
                          {formatDate(v.created_at)}
                        </span>
                        {v.change_summary && (
                          <span className="truncate">— {v.change_summary}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(v.version_number)}
                        className="size-7"
                        title="Preview this version"
                      >
                        <Eye className="size-3" />
                      </Button>
                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setRestoreDialog({ open: true, version: v.version_number })}
                          className="size-7"
                          title="Restore this version"
                        >
                          <RotateCcw className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Version Preview Dialog */}
      <Dialog
        open={previewVersion !== null}
        onOpenChange={(o) => { if (!o) { setPreviewVersion(null); setPreviewData(null) } }}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version {previewVersion}</DialogTitle>
            <DialogDescription>
              Read-only preview of this version's content
            </DialogDescription>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : previewData ? (
            <VersionPreview data={previewData} />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreDialog.open}
        onOpenChange={(o) => !o && setRestoreDialog({ open: false, version: 0 })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore version {restoreDialog.version}?</DialogTitle>
            <DialogDescription>
              This will replace your current draft with the content from version {restoreDialog.version}.
              Unpublished edits will be replaced. Published version history remains available.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <strong>Unsaved and unpublished edits will be lost.</strong> Copy anything you need before restoring.
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setRestoreDialog({ open: false, version: 0 })}
              disabled={restoring}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestore}
              disabled={restoring}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {restoring && <Loader2 className="size-4 animate-spin" />}
              <RotateCcw className="size-3" />
              Restore version {restoreDialog.version}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
