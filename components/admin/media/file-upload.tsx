"use client"

import { useEffect, useId, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { isSafeMediaUrl } from "@/lib/media-validation"

interface FileUploadProps {
  bucket: string
  onUpload: (url: string) => void
  accept?: string
  currentUrl?: string
  label?: string
  maxSizeMB?: number
  allowUrl?: boolean
  className?: string
  disabled?: boolean
  onBusyChange?: (busy: boolean) => void
  onErrorChange?: (error: string | null) => void
}

export function FileUpload({
  bucket, onUpload, accept = "image/*", currentUrl, label = "Upload File",
  maxSizeMB = 5, allowUrl = true, className, disabled = false, onBusyChange, onErrorChange,
}: FileUploadProps) {
  const id = useId()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || "")
  const [error, setError] = useState<string | null>(null)
  const [useUrl, setUseUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const busy = useRef(false)
  useEffect(() => { if (!busy.current) setPreview(currentUrl || "") }, [currentUrl])

  function reportError(message: string | null) {
    setError(message)
    onErrorChange?.(message)
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || busy.current || disabled) return
    reportError(null)
    if (file.size > maxSizeMB * 1024 * 1024) {
      reportError(`Choose a file smaller than ${maxSizeMB} MB.`)
      event.target.value = ""
      return
    }
    busy.current = true
    setUploading(true)
    onBusyChange?.(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sign in again before uploading.")
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin"
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600", upsert: false,
      })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
      if (!isSafeMediaUrl(publicUrl)) throw new Error("The uploaded file has an unsupported URL.")
      setPreview(publicUrl)
      onUpload(publicUrl)
    } catch (error) {
      console.error("Media upload failed", error)
      reportError("Could not upload the file. Your existing media has been kept; please try again.")
    } finally {
      busy.current = false
      setUploading(false)
      onBusyChange?.(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function handleRemove() {
    if (busy.current || disabled) return
    // A draft removal must never delete a file still referenced by saved content.
    setPreview("")
    onUpload("")
    reportError(null)
  }

  function handleUrlChange(value: string) {
    setPreview(value)
    const valid = value === "" || isSafeMediaUrl(value)
    reportError(valid ? null : "Use a local path or a secure HTTPS media URL.")
    if (valid) onUpload(value)
  }

  const isImage = accept.includes("image")
  const isVideo = accept.includes("video")
  const validPreview = isSafeMediaUrl(preview)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={useUrl ? `${id}-url` : `${id}-file`}>{label}</Label>
        {allowUrl && (
          <Button type="button" variant="ghost" className="min-h-11" disabled={disabled || uploading}
            onClick={() => setUseUrl(!useUrl)}>
            <ExternalLink className="size-4" aria-hidden="true" /> {useUrl ? "Upload file" : "Use URL"}
          </Button>
        )}
      </div>
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
      {error && <Button type="button" variant="outline" className="min-h-11" disabled={disabled || uploading}
        onClick={() => { setPreview(currentUrl || ""); reportError(null) }}>Keep current media</Button>}
      {useUrl && <Input id={`${id}-url`} type="text" value={preview} disabled={disabled || uploading}
        placeholder="/image.png or https://…" onChange={(event) => handleUrlChange(event.target.value)}
        className="min-h-11" maxLength={2048} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} />}
      {!useUrl && (
        <div className="space-y-2 rounded-lg border border-dashed p-4">
          <Input ref={fileInputRef} id={`${id}-file`} type="file" accept={accept}
            onChange={(event) => void handleUpload(event)} disabled={disabled || uploading}
            className="min-h-11" aria-invalid={!!error} aria-describedby={[`${id}-help`, error ? `${id}-error` : ""].filter(Boolean).join(" ")} />
          <p id={`${id}-help`} className="text-sm text-muted-foreground">Choose a file up to {maxSizeMB} MB.</p>
        </div>
      )}
      {uploading && <p role="status" className="flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Uploading…
      </p>}
      {validPreview && (isImage || isVideo) && (
        <div className="relative overflow-hidden rounded-lg border bg-muted">
          {isImage && <img src={preview} alt={`${label} preview`} className="h-48 w-full object-contain" />}
          {isVideo && <video src={preview} controls className="h-48 w-full object-contain">Your browser does not support video.</video>}
        </div>
      )}
      {preview && <Button type="button" variant="outline" className="min-h-11" disabled={disabled || uploading}
        onClick={handleRemove} aria-label={`Remove ${label} from this draft`}>
        <X className="size-4" aria-hidden="true" /> Remove from draft
      </Button>}
      {!preview && !uploading && <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Upload className="size-4" aria-hidden="true" /> No file selected.
      </p>}
    </div>
  )
}
