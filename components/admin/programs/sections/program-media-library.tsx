"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Loader2, Trash2, Pencil, Check, X, ImageIcon, HardDrive,
  ChevronDown, ChevronRight, ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  listProgramAssets,
  updateProgramAsset,
  deleteProgramAsset,
  type AssetRecord,
} from "@/lib/actions/program-assets"
import { notifications } from "@/lib/notifications"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const CLEARANCE_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
}

interface ProgramMediaLibraryProps {
  programId: string
}

export function ProgramMediaLibrary({ programId }: ProgramMediaLibraryProps) {
  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAlt, setEditAlt] = useState("")
  const [editCaption, setEditCaption] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; asset: AssetRecord | null }>({
    open: false,
    asset: null,
  })

  const fetchAssets = useCallback(async () => {
    const data = await listProgramAssets(programId)
    setAssets(data)
    setLoading(false)
  }, [programId])

  useEffect(() => {
    if (open) fetchAssets()
  }, [open, fetchAssets])

  function startEdit(asset: AssetRecord) {
    setEditingId(asset.id)
    setEditAlt(asset.alt_text || "")
    setEditCaption(asset.caption || "")
  }

  async function saveEdit(assetId: string) {
    const result = await updateProgramAsset(assetId, {
      altText: editAlt,
      caption: editCaption,
    })
    if (result.ok) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? { ...a, alt_text: editAlt || null, caption: editCaption || null }
            : a
        )
      )
      notifications.showSuccess({ description: "Asset updated" })
    } else {
      notifications.showError({ description: result.error })
    }
    setEditingId(null)
  }

  async function handleDelete() {
    if (!deleteDialog.asset) return
    const result = await deleteProgramAsset(deleteDialog.asset.id)
    if (result.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== deleteDialog.asset!.id))
      notifications.showSuccess({ description: "Asset deleted" })
    } else {
      notifications.showError({ description: result.error || "Delete failed" })
    }
    setDeleteDialog({ open: false, asset: null })
  }

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="text-sm font-medium">Uploaded Media</span>
            {assets.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {assets.length} file{assets.length !== 1 ? "s" : ""}
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
          ) : assets.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No uploaded assets</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Images uploaded via the editor will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="size-16 shrink-0 rounded-md overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.alt_text || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {editingId === asset.id ? (
                      <div className="space-y-1.5">
                        <Input
                          value={editAlt}
                          onChange={(e) => setEditAlt(e.target.value)}
                          placeholder="Alt text"
                          className="h-7 text-xs"
                        />
                        <Input
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          placeholder="Caption (optional)"
                          className="h-7 text-xs"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => saveEdit(asset.id)}
                            className="h-6 px-2 text-[10px] gap-1"
                          >
                            <Check className="size-2.5" /> Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="h-6 px-2 text-[10px] gap-1"
                          >
                            <X className="size-2.5" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-medium truncate">{asset.filename}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                          <span>{formatBytes(asset.file_size)}</span>
                          <span>{asset.mime_type.split("/")[1].toUpperCase()}</span>
                          {asset.width && asset.height && (
                            <span>{asset.width}x{asset.height}</span>
                          )}
                        </div>
                        {asset.alt_text && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            Alt: {asset.alt_text}
                          </p>
                        )}
                        {asset.caption && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            Caption: {asset.caption}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant="secondary"
                            className={`text-[9px] px-1.5 py-0 ${CLEARANCE_COLORS[asset.clearance_status] || ""}`}
                          >
                            {asset.clearance_status}
                          </Badge>
                          {asset.usage_type && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                              {asset.usage_type}
                            </Badge>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== asset.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(asset.url, "_blank")}
                        className="size-7"
                      >
                        <ExternalLink className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(asset)}
                        className="size-7"
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, asset })}
                        className="size-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(o) => !o && setDeleteDialog({ open: false, asset: null })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete asset?</DialogTitle>
            <DialogDescription>
              This will permanently remove the image from storage. If this image is used in any section, it will appear as broken.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, asset: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="size-3" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
