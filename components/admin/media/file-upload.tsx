"use client"

import { useEffect, useId, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  UploadCloud,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  Film,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isSafeMediaUrl } from "@/lib/media-validation"
import { deleteStorageFileAction } from "@/lib/actions/storage"

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
  bucket,
  onUpload,
  accept = "image/*",
  currentUrl,
  label = "Upload File",
  maxSizeMB = 5,
  allowUrl = true,
  className,
  disabled = false,
  onBusyChange,
  onErrorChange,
}: FileUploadProps) {
  const id = useId()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [preview, setPreview] = useState(currentUrl || "")
  const [previewError, setPreviewError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useUrl, setUseUrl] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const busy = useRef(false)

  // Track draft files uploaded in this session so we can delete them if replaced before save
  const sessionUploadsRef = useRef<string[]>([])

  useEffect(() => {
    if (!busy.current) {
      setPreview(currentUrl || "")
      setPreviewError(false)
    }
  }, [currentUrl])

  useEffect(() => {
    setPreviewError(false)
  }, [preview])

  function reportError(message: string | null) {
    setError(message)
    onErrorChange?.(message)
  }

  const processFile = useCallback(
    async (file: File) => {
      if (!file || busy.current || disabled) return
      reportError(null)

      if (file.size > maxSizeMB * 1024 * 1024) {
        reportError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is ${maxSizeMB} MB.`)
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }

      busy.current = true
      setUploading(true)
      setUploadProgress(20)
      onBusyChange?.(true)

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("Please sign in again before uploading.")

        const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin"
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

        setUploadProgress(50)
        const { data, error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })
        if (uploadError) throw uploadError

        setUploadProgress(85)
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path)

        if (!isSafeMediaUrl(publicUrl)) {
          throw new Error("The uploaded file returned an invalid or unsafe URL.")
        }

        // Clean up any previously uploaded file from this session that was replaced
        if (sessionUploadsRef.current.length > 0) {
          const oldSessionFile = sessionUploadsRef.current[sessionUploadsRef.current.length - 1]
          if (oldSessionFile && oldSessionFile !== publicUrl) {
            deleteStorageFileAction(bucket, oldSessionFile).catch((e) =>
              console.warn("Could not clean up prior draft upload:", e)
            )
          }
        }

        sessionUploadsRef.current.push(publicUrl)
        setUploadProgress(100)
        setPreview(publicUrl)
        onUpload(publicUrl)
      } catch (err: any) {
        console.error("Media upload failed:", err)
        reportError(err?.message || "Could not upload file. Your previous media was kept.")
      } finally {
        busy.current = false
        setUploading(false)
        setUploadProgress(null)
        onBusyChange?.(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    },
    [bucket, disabled, maxSizeMB, onBusyChange, onUpload]
  )

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) void processFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !uploading) setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled || uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) void processFile(file)
  }

  async function handleRemove() {
    if (busy.current || disabled) return

    // If removing a file uploaded in this session, delete it from storage immediately
    if (preview && sessionUploadsRef.current.includes(preview)) {
      deleteStorageFileAction(bucket, preview).catch((e) =>
        console.warn("Could not delete removed session file:", e)
      )
    }

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

  function copyToClipboard() {
    if (!preview) return
    navigator.clipboard.writeText(preview).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const isVideo = accept.includes("video") || /\.(mp4|webm|mov|mkv)$/i.test(preview)
  const isImage = !isVideo && (accept.includes("image") || /\.(jpe?g|png|webp|svg|gif|avif)$/i.test(preview) || !preview.includes("."))
  const validPreview = isSafeMediaUrl(preview)

  const fileName = preview ? preview.split("/").pop()?.split("?")[0] || "media-file" : ""
  const extension = fileName.includes(".") ? fileName.split(".").pop()?.toUpperCase() : ""

  const fileTypesText = accept.includes("video")
    ? "MP4, WebM"
    : accept.includes("image")
    ? "SVG, PNG, JPG, or WebP"
    : "Supported media files"

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header Label and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={`${id}-file`} className="text-sm font-medium text-foreground flex items-center gap-1.5">
          {label}
        </Label>
        {allowUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            disabled={disabled || uploading}
            onClick={() => setUseUrl(!useUrl)}
          >
            {useUrl ? (
              <>
                <UploadCloud className="size-3.5" aria-hidden="true" />
                Upload File instead
              </>
            ) : (
              <>
                <Link2 className="size-3.5" aria-hidden="true" />
                Use Direct URL
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center justify-between gap-2"
        >
          <span>{error}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-destructive hover:bg-destructive/20"
            onClick={() => {
              setPreview(currentUrl || "")
              reportError(null)
            }}
          >
            Reset
          </Button>
        </div>
      )}

      {/* Upload Dropzone OR Direct URL Input */}
      {useUrl ? (
        <div className="space-y-1.5">
          <Input
            id={`${id}-url`}
            type="text"
            value={preview}
            disabled={disabled || uploading}
            placeholder="https://example.org/images/photo.png or /photos/cover.jpg"
            onChange={(e) => handleUrlChange(e.target.value)}
            className="h-10 text-sm font-mono"
            maxLength={2048}
          />
          <p className="text-xs text-muted-foreground">
            Paste a direct HTTPS image or video URL to use as reference.
          </p>
        </div>
      ) : (
        /* Interactive Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled && !uploading) {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          tabIndex={disabled || uploading ? -1 : 0}
          role="button"
          aria-label={`Upload media for ${label}`}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all duration-200 cursor-pointer outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20",
            preview && validPreview ? "p-4 sm:p-5" : "p-6 sm:p-8",
            isDragging
              ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]"
              : "border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/40",
            (disabled || uploading) && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            /* Uploading Progress State */
            <div className="flex flex-col items-center space-y-3 py-2">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <Loader2 className="size-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  Uploading to secure storage...
                </p>
                <p className="text-xs text-muted-foreground">
                  Optimizing and linking to {bucket}
                </p>
              </div>
              <div className="w-48 sm:w-56 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress || 60}%` }}
                />
              </div>
            </div>
          ) : (
            /* Default Dropzone Prompt */
            <>
              <div className="mb-2.5 flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-200">
                <UploadCloud className="size-5 sm:size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-foreground">
                  {preview && validPreview ? (
                    <>
                      Drag and drop to <span className="text-primary underline underline-offset-2">replace file</span>, or browse
                    </>
                  ) : (
                    <>
                      Drag and drop file here, or{" "}
                      <span className="text-primary underline underline-offset-2">browse files</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports {fileTypesText} up to {maxSizeMB} MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Live Preview Box Below (Just like in Event Partners tab) */}
      {preview && validPreview && (
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 sm:p-3.5 shadow-2xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Thumbnail & Meta */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Thumbnail with neutral checkerboard background */}
              <div className="relative flex h-14 w-20 sm:h-16 sm:w-24 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-neutral-100 dark:bg-neutral-800 p-1 overflow-hidden shadow-2xs">
                {isImage && !previewError && (
                  <img
                    src={preview}
                    alt="File preview"
                    className="h-full w-full object-contain"
                    onError={() => setPreviewError(true)}
                  />
                )}
                {isVideo && !previewError && (
                  <video
                    src={preview}
                    className="h-full w-full object-cover"
                    muted
                    preload="metadata"
                    onError={() => setPreviewError(true)}
                  />
                )}
                {previewError && (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-1 text-center">
                    <ImageIcon className="size-4 opacity-50 mb-0.5" />
                    <span className="text-[9px]">Preview error</span>
                  </div>
                )}
                <span className="absolute bottom-1 right-1 rounded-md bg-black/75 p-1 text-white shadow-2xs">
                  {isVideo ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
                </span>
              </div>

              {/* Information */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-foreground">
                    {isVideo ? "Video Ready" : "File Ready"}
                  </span>
                  {extension && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground uppercase">
                      {extension}
                    </span>
                  )}
                </div>
                <span
                  className="text-xs font-mono text-muted-foreground truncate block max-w-[200px] sm:max-w-[280px] md:max-w-[380px]"
                  title={preview}
                >
                  {fileName}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                onClick={copyToClipboard}
                title="Copy media URL to clipboard"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy URL"}</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => window.open(preview, "_blank", "noopener,noreferrer")}
                title="Open original media in new tab"
                aria-label="Open original media in new tab"
              >
                <ExternalLink className="size-3.5" />
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                title="Replace file"
              >
                <RefreshCw className="size-3" />
                <span className="hidden sm:inline">Replace</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                onClick={handleRemove}
                disabled={disabled || uploading}
                title="Remove file"
              >
                <Trash2 className="size-3.5" />
                <span>Remove</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Real accessible file input */}
      <input
        ref={fileInputRef}
        id={`${id}-file`}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="sr-only"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
  )
}
