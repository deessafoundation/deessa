"use client"

import { useState, useRef, useCallback, useId } from "react"
import { X, Loader2, Upload, Link as LinkIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useProgramId } from "./program-id-context"
import { cn } from "@/lib/utils"
import { notifications } from "@/lib/notifications"
import { registerProgramAsset } from "@/lib/actions/program-assets"
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog"
import { imageRefSchema } from "@/lib/programs/content"

export interface AssetPick {
  assetId?: string
  url?: string
}

interface AssetPickerProps {
  assetId: string | null
  url?: string
  alt: string
  onPick: (pick: AssetPick) => void
  onClear: () => void
  label?: string
  className?: string
}

const BUCKET = "program-assets"
const MAX_SIZE_MB = 10
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"]

// Magic-byte verification (client-side)
function verifyMagicBytes(buffer: ArrayBuffer, claimedType: string): boolean {
  const b = new Uint8Array(buffer)
  switch (claimedType) {
    case "image/jpg":
    case "image/jpeg":
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
    case "image/png":
      return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
    case "image/webp":
      return (
        b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
      )
    case "image/avif":
      return (
        b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
        b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66
      )
    default:
      return false
  }
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Invalid file type. Accepted: PNG, JPG, WEBP, AVIF`
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File too large. Maximum size is ${MAX_SIZE_MB}MB`
  }
  return null
}

export function AssetPicker({ assetId, url, alt, onPick, onClear, label = "Image", className }: AssetPickerProps) {
  const programId = useProgramId()
  const inputId = useId()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useUrl, setUseUrl] = useState(false)
  const [urlValue, setUrlValue] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"replace" | "remove" | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File, isReplace: boolean): Promise<{ url: string } | null> => {
    const validationError = validateFile(file)
    if (validationError) {
      notifications.showError({ description: validationError })
      return null
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in")

      // Client-side magic byte verification
      const buffer = await file.arrayBuffer()
      if (!verifyMagicBytes(buffer, file.type)) {
        throw new Error("File content does not match claimed type")
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const filePath = programId
        ? `${programId}/${fileName}`
        : `${user.id}/${fileName}`

      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { cacheControl: "31536000", upsert: false })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(uploadError.message || "Upload failed. Check console for details.")
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path)

      // Register asset in DB so Media Library can track it
      if (programId) {
        const regResult = await registerProgramAsset(programId, data.path, publicUrl, file.name, file.type, file.size, {
          altText: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        })
        if (!regResult.ok) {
          throw new Error(`Image could not be registered: ${regResult.error}. Your previous image has been kept.`)
        }
      }

      notifications.showSuccess({ description: isReplace ? "Image replaced" : "Image uploaded" })
      return { url: publicUrl }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setError(message)
      notifications.showError({ description: message })
      return null
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }, [programId])

  const isReplace = !!(url || assetId)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await uploadFile(file, isReplace)
    if (result) onPick({ assetId: undefined, url: result.url })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file, isReplace).then((result) => {
        if (result) onPick({ assetId: undefined, url: result.url })
      })
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  function handleUrlSubmit() {
    if (!urlValue.trim()) return
    setError(null)
    try {
      imageRefSchema.parse({ url: urlValue.trim(), alt: "Image" })
      onPick({ assetId: undefined, url: urlValue.trim() })
      setUrlValue("")
    } catch {
      notifications.showError({ description: "Invalid URL format" })
    }
  }

  function handleClear() {
    onClear()
    setUrlValue("")
    setError(null)
    notifications.showSuccess({ description: "Image removed" })
  }

  const previewUrl = assetId ? `/api/assets/${assetId}` : url || null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={inputId} className="text-xs text-muted-foreground">{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setUseUrl(!useUrl)}
          className="h-auto py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <LinkIcon className="size-2.5 mr-1" />
          {useUrl ? "Upload File" : "Use URL"}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-md px-2 py-1">{error}</p>
      )}

      {useUrl ? (
        /* URL Input Mode */
        <div className="space-y-2">
          <div className="flex gap-1.5">
            <Input
              aria-label={`${label} URL`}
              type="text"
              placeholder="https://example.com/image.jpg"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlSubmit() } }}
              className="h-8 text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUrlSubmit}
              aria-label={`Apply ${label} URL`}
              disabled={!urlValue.trim() || uploading}
              className="h-8 px-2.5 text-xs shrink-0"
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
          {previewUrl && (
            <div className="relative group rounded-lg border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt={alt} className="w-full h-36 object-cover" />
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={() => setConfirmAction("remove")}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      ) : previewUrl ? (
        /* Preview Mode */
        <div className="relative group rounded-lg border overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={alt} className="w-full h-36 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button
              type="button"
              disabled={uploading}
              onClick={() => !uploading && setConfirmAction("replace")}
              className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-white transition-colors"
            >
              <Upload className="h-3 w-3" />
              Replace
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => setConfirmAction("remove")}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Upload Mode */
        <div
          role="button"
          tabIndex={uploading ? -1 : 0}
          aria-label={`Upload ${label}`}
          onKeyDown={event => { if (!uploading && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); inputRef.current?.click() } }}
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 cursor-pointer transition-colors",
            isDragOver
              ? "border-primary bg-primary/5"
              : "hover:bg-accent/50 hover:border-primary/50",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground mb-1.5" />
              <p className="text-xs text-muted-foreground text-center">
                <span className="font-medium">Click to upload</span> or drag & drop
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                PNG, JPG, WEBP, AVIF up to {MAX_SIZE_MB}MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        id={inputId}
        aria-label={label}
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleUpload}
        className="hidden"
      />

      {/* Replace Confirmation */}
      <ConfirmDialog
        open={confirmAction === "replace"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Replace image?"
        description="This will replace the current image with a new one."
        confirmLabel="Replace"
        onConfirm={() => {
          setConfirmAction(null)
          inputRef.current?.click()
        }}
      />

      {/* Remove Confirmation */}
      <ConfirmDialog
        open={confirmAction === "remove"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Remove image?"
        description="This will remove this image from the section."
        confirmLabel="Remove"
        onConfirm={() => {
          setConfirmAction(null)
          handleClear()
        }}
      />
    </div>
  )
}
