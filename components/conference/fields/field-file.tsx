"use client"

import { FormField } from "@/lib/types/conference-form-schema"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X, File, FileCheck } from "lucide-react"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface FieldFileProps {
  field: FormField
  value: string | string[] // File URL(s) after upload
  onChange: (value: string | string[]) => void
  onBlur?: () => void
  error?: string
}

interface UploadedFile {
  name: string
  url: string
  size: number
  type: string
}

export function FieldFile({ field, value, onChange, onBlur, error }: FieldFileProps) {
  const { label, helpText, required, fileUploadConfig } = field
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Parse existing value into file objects
  const existingFiles: UploadedFile[] = Array.isArray(value)
    ? value.map((url) => ({
        name: url.split("/").pop() || "file",
        url,
        size: 0,
        type: "unknown",
      }))
    : value
    ? [
        {
          name: value.split("/").pop() || "file",
          url: value,
          size: 0,
          type: "unknown",
        },
      ]
    : []

  const config = {
    maxSizeMB: fileUploadConfig?.maxSizeMB || 5,
    allowedTypes: fileUploadConfig?.allowedTypes || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    multiple: fileUploadConfig?.multiple || false,
    storageBucket: fileUploadConfig?.storageBucket || "event-uploads",
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "Unknown size"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxBytes = config.maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      return `File size must be less than ${config.maxSizeMB}MB`
    }

    // Check file type
    if (config.allowedTypes.length > 0 && !config.allowedTypes.includes(file.type)) {
      const types = config.allowedTypes.map((t) => t.split("/")[1]).join(", ")
      return `File type not allowed. Allowed types: ${types}`
    }

    return null
  }

  const uploadFile = async (file: File): Promise<string> => {
    const supabase = createClient()
    
    // Generate unique file name
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const fileExt = file.name.split(".").pop()
    const fileName = `${timestamp}-${randomStr}.${fileExt}`
    const filePath = `conference-registrations/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(config.storageBucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      throw new Error(error.message)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(config.storageBucket)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadError(null)
    setUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of files) {
        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          setUploadError(validationError)
          setUploading(false)
          return
        }

        // Upload file
        const url = await uploadFile(file)
        uploadedUrls.push(url)
      }

      // Update value
      if (config.multiple) {
        const currentUrls = Array.isArray(value) ? value : value ? [value] : []
        onChange([...currentUrls, ...uploadedUrls])
      } else {
        onChange(uploadedUrls[0])
      }

      setUploading(false)

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
      setUploading(false)
    }
  }

  const handleRemoveFile = (urlToRemove: string) => {
    if (Array.isArray(value)) {
      const filtered = value.filter((url) => url !== urlToRemove)
      onChange(filtered.length > 0 ? filtered : "")
    } else {
      onChange("")
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const canAddMore = config.multiple || existingFiles.length === 0

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="space-y-3">
        {/* Upload Button */}
        {canAddMore && (
          <div>
            <input
              ref={fileInputRef}
              id={field.id}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              multiple={config.multiple}
              accept={config.allowedTypes.join(",")}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {config.multiple ? "Upload Files" : "Upload File"}
                </>
              )}
            </Button>
          </div>
        )}

        {/* File List */}
        {existingFiles.length > 0 && (
          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
              >
                <FileCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  {file.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file.url)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {helpText && !error && !uploadError && (
        <p className="text-sm text-muted-foreground">
          {helpText}
          {" • "}
          Max {config.maxSizeMB}MB
        </p>
      )}

      {uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}

      {error && (
        <p id={`${field.id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
