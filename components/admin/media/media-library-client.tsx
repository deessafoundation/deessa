"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import {
  Image as ImageIcon,
  Video,
  FileText,
  Search,
  Filter,
  Trash2,
  Download,
  MoreVertical,
  Upload,
  Loader2,
  HardDrive,
  Calendar,
  Eye,
  Copy,
  Check,
  RefreshCw,
  Grid3x3,
  List,
  ImagePlus,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  Zap,
  Lock,
  RotateCcw,
  Link2,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  browseAllBuckets,
  deleteStorageFile,
  bulkDeleteStorageFiles,
  trackStorageFile,
  getAvailableBuckets,
} from "@/lib/actions/storage-browser"
import {
  type StorageFile,
  type StorageBucketInfo,
  KNOWN_APPLICATION_BUCKETS,
} from "@/lib/types/storage"
import { syncAllBuckets } from "@/lib/actions/sync-media"
import { notifications } from "@/lib/notifications"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"

export function MediaLibraryClient() {
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([])
  const [buckets, setBuckets] = useState<StorageBucketInfo[]>(KNOWN_APPLICATION_BUCKETS)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "image" | "video" | "document" | "orphan">("all")
  const [selectedBucket, setSelectedBucket] = useState<string>("all")
  const [selectedEntity, setSelectedEntity] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Inspection Drawer / Dialog
  const [inspectedFile, setInspectedFile] = useState<StorageFile | null>(null)

  // Deletion Dialogs
  const [fileToDelete, setFileToDelete] = useState<StorageFile | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [showSyncDialog, setShowSyncDialog] = useState(false)

  // Direct Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadBucket, setUploadBucket] = useState<string>("hero-images")
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load storage files and buckets
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [filesRes, bucketsRes] = await Promise.all([
        browseAllBuckets(),
        getAvailableBuckets(),
      ])

      if (filesRes.error) throw new Error(filesRes.error)
      setStorageFiles(filesRes.data || [])
      setBuckets(bucketsRes)
    } catch (error: any) {
      notifications.showError({
        title: "Failed to load storage files",
        description: error.message || "Could not connect to Supabase storage.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter files based on search, type, and bucket
  const filteredFiles = useMemo(() => {
    let result = [...storageFiles]

    // Search query (filename, path, or usage title)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter((file) => {
        const inName = file.name.toLowerCase().includes(term)
        const inBucket = file.bucket.toLowerCase().includes(term)
        const inUsage = file.usageLocations?.some(
          (u) => u.title.toLowerCase().includes(term) || u.entityType.toLowerCase().includes(term)
        )
        return inName || inBucket || inUsage
      })
    }

    // Type filter or Space Saver / Orphan filter
    if (selectedType === "image") {
      result = result.filter((file) => file.mimeType.startsWith("image/"))
    } else if (selectedType === "video") {
      result = result.filter((file) => file.mimeType.startsWith("video/"))
    } else if (selectedType === "document") {
      result = result.filter((file) => !file.mimeType.startsWith("image/") && !file.mimeType.startsWith("video/"))
    } else if (selectedType === "orphan") {
      result = result.filter((file) => file.isOrphan)
    }

    // Bucket filter
    if (selectedBucket !== "all") {
      result = result.filter((file) => file.bucket === selectedBucket)
    }

    // Entity / Used-on-page filter
    if (selectedEntity !== "all") {
      if (selectedEntity === "unused") {
        result = result.filter((file) => file.isOrphan)
      } else {
        result = result.filter((file) =>
          file.usageLocations?.some((u) => u.entityType.toLowerCase() === selectedEntity.toLowerCase())
        )
      }
    }

    return result
  }, [storageFiles, searchTerm, selectedType, selectedBucket, selectedEntity])

  // Live Statistics Calculations
  const stats = useMemo(() => {
    const totalCount = storageFiles.length
    const totalBytes = storageFiles.reduce((acc, f) => acc + (f.size || 0), 0)
    const imagesCount = storageFiles.filter((f) => f.mimeType.startsWith("image/")).length
    const videosCount = storageFiles.filter((f) => f.mimeType.startsWith("video/")).length
    const documentsCount = storageFiles.filter((f) => !f.mimeType.startsWith("image/") && !f.mimeType.startsWith("video/")).length
    const orphanFiles = storageFiles.filter((f) => f.isOrphan)
    const orphanCount = orphanFiles.length
    const orphanBytes = orphanFiles.reduce((acc, f) => acc + (f.size || 0), 0)

    return {
      totalCount,
      totalBytes,
      imagesCount,
      videosCount,
      documentsCount,
      orphanCount,
      orphanBytes,
    }
  }, [storageFiles])

  // Helper to format bytes into readable units
  function formatBytes(bytes: number | null | undefined): string {
    if (!bytes || bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // Copy URL with toast and inline checkmark
  function copyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    notifications.showSuccess({
      title: "URL Copied",
      description: "Public media URL copied to clipboard.",
    })
  }

  // Toggle selection
  function toggleFileSelection(name: string) {
    setSelectedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  // Select all currently filtered files
  function selectAllFiltered() {
    const names = new Set(filteredFiles.map((f) => f.name))
    setSelectedFiles(names)
  }

  // Deselect all
  function clearSelection() {
    setSelectedFiles(new Set())
  }

  // Handle single file deletion
  async function handleDelete(file: StorageFile) {
    try {
      const { error } = await deleteStorageFile(file)
      if (error) throw new Error(error)

      notifications.showSuccess({
        title: "File Deleted",
        description: `Successfully deleted ${file.name.split("/").pop()} from ${file.bucket}.`,
      })

      // Update state in place
      setStorageFiles((prev) => prev.filter((f) => !(f.bucket === file.bucket && f.name === file.name)))
      if (inspectedFile?.name === file.name) setInspectedFile(null)
    } catch (error: any) {
      notifications.showError({
        title: "Failed to delete file",
        description: error.message || "An error occurred while deleting the file.",
      })
    } finally {
      setShowDeleteDialog(false)
      setFileToDelete(null)
    }
  }

  // Handle bulk file deletion
  async function handleBulkDelete() {
    try {
      const filesToDelete = storageFiles.filter((f) => selectedFiles.has(f.name))
      const { deletedCount, error } = await bulkDeleteStorageFiles(filesToDelete)

      if (error) throw new Error(error)

      notifications.showSuccess({
        title: "Files Deleted",
        description: `Permanently removed ${deletedCount} files from Supabase storage.`,
      })

      // Remove deleted files from state
      setStorageFiles((prev) => prev.filter((f) => !selectedFiles.has(f.name)))
      setSelectedFiles(new Set())
    } catch (error: any) {
      notifications.showError({
        title: "Bulk delete failed",
        description: error.message || "Could not delete selected files.",
      })
    } finally {
      setShowBulkDeleteDialog(false)
    }
  }

  // Handle storage sync across all buckets
  async function handleSyncStorage() {
    setIsSyncing(true)
    setShowSyncDialog(false)
    try {
      const result = await syncAllBuckets()

      notifications.showSuccess({
        title: "Storage Sync Complete",
        description: `Synced ${result.totalSynced} new files across ${result.results.length} buckets.`,
      })

      await loadData()
    } catch (error: any) {
      notifications.showError({
        title: "Sync Failed",
        description: error.message || "Could not synchronize storage with database.",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Handle tracking an untracked file
  async function handleTrackFile(file: StorageFile) {
    try {
      const { success, error } = await trackStorageFile(file)
      if (error || !success) throw new Error(error || "Tracking failed")

      notifications.showSuccess({
        title: "Asset Registered",
        description: `Registered ${file.name.split("/").pop()} into media_assets table.`,
      })

      setStorageFiles((prev) =>
        prev.map((f) => (f.bucket === file.bucket && f.name === file.name ? { ...f, isTracked: true } : f))
      )
      if (inspectedFile) setInspectedFile((prev) => (prev ? { ...prev, isTracked: true } : null))
    } catch (error: any) {
      notifications.showError({
        title: "Registration Failed",
        description: error.message,
      })
    }
  }

  // Direct File Upload into Selected Bucket
  async function handleDirectUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingFiles(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      notifications.showError({ title: "Authentication required", description: "Please sign in to upload files." })
      setUploadingFiles(false)
      return
    }

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`

      try {
        // Upload to selected storage bucket
        const { data, error: uploadError } = await supabase.storage.from(uploadBucket).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from(uploadBucket).getPublicUrl(data.path)

        // Automatically register in media_assets
        let type: "image" | "video" | "document" = "document"
        if (file.type.startsWith("image/")) type = "image"
        else if (file.type.startsWith("video/")) type = "video"

        await supabase.from("media_assets").insert({
          filename: file.name,
          bucket: uploadBucket,
          storage_path: filePath,
          url: publicUrl,
          type,
          mime_type: file.type || `application/${ext}`,
          size_bytes: file.size,
          uploaded_by: user.id,
        })

        successCount++
      } catch (err: any) {
        console.error("Upload error for file:", file.name, err)
        failCount++
      }
    }

    setUploadingFiles(false)
    setShowUploadModal(false)
    if (fileInputRef.current) fileInputRef.current.value = ""

    if (successCount > 0) {
      notifications.showSuccess({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} file${successCount > 1 ? "s" : ""} to ${uploadBucket}.`,
      })
      await loadData()
    }
    if (failCount > 0) {
      notifications.showError({
        title: "Upload Incomplete",
        description: `${failCount} file${failCount > 1 ? "s" : ""} failed to upload.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Executive Page Header */}
      <header className="rounded-2xl border border-border/70 bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Admin</span>
              <span>/</span>
              <span className="text-foreground font-semibold">Media Library</span>
              <span className="inline-block h-1 w-1 rounded-full bg-border" />
              <Badge variant="outline" className="text-[10px] py-0 px-2 font-normal">
                Supabase Storage Hub
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Storage & Media Command Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Inspect, track, and optimize all physical assets in Supabase Storage. Identify unused files to safely reclaim space.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 md:pt-0">
            {/* Space Saver Quick Pill */}
            {stats.orphanCount > 0 && (
              <Button
                variant={selectedType === "orphan" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(selectedType === "orphan" ? "all" : "orphan")}
                className={cn(
                  "gap-1.5 min-h-[38px] sm:min-h-[36px] text-xs font-semibold shadow-xs",
                  selectedType === "orphan"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Space Saver ({stats.orphanCount})</span>
              </Button>
            )}

            {/* Sync Storage Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSyncDialog(true)}
              disabled={isSyncing || isLoading}
              className="gap-1.5 min-h-[38px] sm:min-h-[36px] text-xs"
            >
              {isSyncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>Sync All</span>
            </Button>

            {/* Direct Upload Button */}
            <Button
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="gap-1.5 min-h-[38px] sm:min-h-[36px] text-xs font-medium shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Media</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Operational Metrics Cards (2x2 on Mobile, 5x1 on Desktop) */}
      <section aria-label="Storage Metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {/* Card 1: Total Storage */}
          <Card
            onClick={() => { setSelectedType("all"); setSelectedBucket("all"); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedType("all")}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selectedType === "all" && selectedBucket === "all" ? "ring-2 ring-primary ring-offset-1 dark:ring-offset-card border-primary/50" : ""
            )}
          >
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Files</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">{stats.totalCount}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{formatBytes(stats.totalBytes)}</p>
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <HardDrive className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Images */}
          <Card
            onClick={() => setSelectedType("image")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedType("image")}
            className={cn(
              "cursor-pointer transition-all hover:border-blue-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              selectedType === "image" ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-card border-blue-500/50" : ""
            )}
          >
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Images</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">{stats.imagesCount}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate hidden sm:block">Photos & graphics</p>
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Videos & Audio */}
          <Card
            onClick={() => setSelectedType("video")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedType("video")}
            className={cn(
              "cursor-pointer transition-all hover:border-purple-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
              selectedType === "video" ? "ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-card border-purple-500/50" : ""
            )}
          >
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Videos</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">{stats.videosCount}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate hidden sm:block">Video clips & media</p>
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Video className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Documents */}
          <Card
            onClick={() => setSelectedType("document")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedType("document")}
            className={cn(
              "cursor-pointer transition-all hover:border-green-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500",
              selectedType === "document" ? "ring-2 ring-green-500 ring-offset-1 dark:ring-offset-card border-green-500/50" : ""
            )}
          >
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Documents</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">{stats.documentsCount}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate hidden sm:block">PDFs, docs & assets</p>
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Space Saver (Orphaned / Unused Files) */}
          <Card
            onClick={() => setSelectedType(selectedType === "orphan" ? "all" : "orphan")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedType("orphan")}
            className={cn(
              "cursor-pointer transition-all hover:border-amber-400 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 col-span-2 sm:col-span-1",
              selectedType === "orphan" ? "ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-card border-amber-500/50 bg-amber-50/20" : ""
            )}
          >
            <CardContent className="p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400 truncate">Space Saver</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-0.5">
                    {stats.orphanCount} Unused
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">
                    {formatBytes(stats.orphanBytes)} recoverable
                  </p>
                </div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Space Saver Notification Banner (When in Space Saver Mode) */}
      {selectedType === "orphan" && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Space Saver Mode Active</p>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  Showing <strong>{filteredFiles.length} unused files</strong> ({formatBytes(stats.orphanBytes)} total).
                  None of these files are linked to any active event, program, story, team member, or site page. Safe to delete.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllFiltered}
                className="h-8 text-xs font-medium border-amber-300 dark:border-amber-700 bg-background/80"
              >
                Select All Unused ({filteredFiles.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType("all")}
                className="h-8 text-xs text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
              >
                Show All Files
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Controls, Search, and Category Pills */}
      <section aria-label="Media Filters & Controls" className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search filename, bucket, or linked entity..."
              aria-label="Search media files"
              className="w-full h-10 pl-9 pr-9 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Bucket Selector + Entity Selector + View Modes */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Used-On Page / Entity Selector */}
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by linked page or entity"
            >
              <option value="all">All Pages & Usages</option>
              <option value="Event">Events (/events)</option>
              <option value="Program">Programs (/programs)</option>
              <option value="Project">Projects (/projects)</option>
              <option value="Story">Stories (/stories)</option>
              <option value="Team Member">Team Members (/about#team)</option>
              <option value="Partner">Partners (/about#partners)</option>
              <option value="Artwork">Artworks (/arts)</option>
              <option value="Settings">Homepage & CMS (/)</option>
              <option value="Donation Receipt">Donation Receipts</option>
              <option value="Donation Proof">Bank Transfer Proofs</option>
              <option value="Support Request">Support Screenshots</option>
              <option value="unused">Unused / No Page</option>
            </select>

            {/* Dynamic Bucket Selector */}
            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filter by storage bucket"
            >
              <option value="all">All Buckets ({buckets.length})</option>
              {buckets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 rounded-lg"
                aria-label="Switch to grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 rounded-lg"
                aria-label="Switch to list view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none snap-x touch-pan-x">
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
              selectedType === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>All Files</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-background/60">
              {storageFiles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("image")}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
              selectedType === "image"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>Images</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-background/60">
              {stats.imagesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("video")}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
              selectedType === "video"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>Videos</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-background/60">
              {stats.videosCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("document")}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
              selectedType === "document"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>Documents</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-background/60">
              {stats.documentsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("orphan")}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
              selectedType === "orphan"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
            )}
          >
            <Zap className="h-3 w-3" />
            <span>Unused / Orphans</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-background/60">
              {stats.orphanCount}
            </span>
          </button>
        </div>

        {/* Selected Items Floating Action Bar */}
        {selectedFiles.size > 0 && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                {selectedFiles.size} Selected
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ({formatBytes(storageFiles.filter((f) => selectedFiles.has(f.name)).reduce((s, f) => s + f.size, 0))})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="h-8 text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
                className="h-8 text-xs"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* 5. Main Media Grid or List Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium text-foreground">Scanning storage buckets...</p>
          <p className="text-xs text-muted-foreground mt-0.5">Indexing physical files and cross-referencing database entities.</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border bg-card">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No files found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
            {searchTerm || selectedType !== "all" || selectedBucket !== "all"
              ? "No files match your current filters. Try resetting search or changing the bucket."
              : "No media files found in the storage buckets. Upload files to get started."}
          </p>
          <div className="flex items-center gap-2 mt-4">
            {(searchTerm || selectedType !== "all" || selectedBucket !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("all")
                  setSelectedBucket("all")
                }}
                className="min-h-[38px] text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="min-h-[38px] text-xs gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Media</span>
            </Button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Bento Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredFiles.map((file) => {
            const isSelected = selectedFiles.has(file.name)
            const isImage = file.mimeType.startsWith("image/")
            const isVideo = file.mimeType.startsWith("video/")
            const filenameOnly = file.name.split("/").pop() || file.name

            return (
              <div
                key={`${file.bucket}-${file.name}`}
                onClick={() => setInspectedFile(file)}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card overflow-hidden transition-all cursor-pointer hover:border-primary/50 hover:shadow-md",
                  isSelected ? "ring-2 ring-primary border-primary" : ""
                )}
              >
                {/* Media Preview Box */}
                <div className="aspect-square bg-muted/60 relative overflow-hidden flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={file.publicUrl}
                      alt={filenameOnly}
                      loading="lazy"
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback icon if image fails to load
                        (e.target as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : isVideo ? (
                    <div className="flex flex-col items-center justify-center text-purple-600 dark:text-purple-400 p-2 text-center">
                      <Video className="h-8 w-8 mb-1" />
                      <span className="text-[10px] font-mono">VIDEO</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-400 p-2 text-center">
                      <FileText className="h-8 w-8 mb-1" />
                      <span className="text-[10px] font-mono">{file.name.split(".").pop()?.toUpperCase()}</span>
                    </div>
                  )}

                  {/* Selection Checkbox (Touch Friendly & Visible on mobile) */}
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFileSelection(file.name)
                    }}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-md border flex items-center justify-center transition-all bg-background/90 shadow-sm",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border/80 text-transparent opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:border-primary"
                      )}
                      aria-label={isSelected ? `Deselect ${filenameOnly}` : `Select ${filenameOnly}`}
                    >
                      <Check className={cn("h-3.5 w-3.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                    </div>
                  </div>

                  {/* Action Menu (3 Dots) */}
                  <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7 rounded-md bg-background/90 shadow-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          aria-label={`Actions for ${filenameOnly}`}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuItem onClick={() => copyUrl(file.publicUrl, file.name)}>
                          {copiedId === file.name ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-2" />
                              <span>Copy Public URL</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(file.publicUrl, "_blank")}>
                          <Eye className="h-3.5 w-3.5 mr-2" />
                          <span>View Full Size</span>
                        </DropdownMenuItem>
                        {!file.isTracked && (
                          <DropdownMenuItem onClick={() => handleTrackFile(file)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-primary" />
                            <span>Track in Database</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setFileToDelete(file)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          <span>Delete File</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status Badges Overlay */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none">
                    {/* In Use vs Orphan Badge */}
                    {file.usageCount && file.usageCount > 0 ? (
                      <Badge className="bg-emerald-600/90 text-white text-[9px] py-0 px-1.5 font-semibold backdrop-blur-xs">
                        In Use ({file.usageCount})
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-500/90 text-white text-[9px] py-0 px-1.5 font-semibold backdrop-blur-xs">
                        Unused
                      </Badge>
                    )}

                    {file.isSensitive && (
                      <Badge variant="outline" className="bg-slate-900/80 text-white border-0 text-[9px] py-0 px-1.5 flex items-center gap-0.5">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Private</span>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card Meta Footer */}
                <div className="p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-foreground truncate" title={filenameOnly}>
                      {filenameOnly}
                    </p>
                    <span className="tabular-nums font-mono text-[10px] text-muted-foreground shrink-0">
                      {formatBytes(file.size)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate max-w-[90px] font-mono text-[10px]" title={file.bucket}>
                      {file.bucket}
                    </span>
                    {file.usageLocations && file.usageLocations.length > 0 && file.usageLocations[0].publicPath && (
                      <span className="text-[10px] text-primary/80 font-mono truncate max-w-[120px]" title={`Used on: ${file.usageLocations[0].publicPath}`}>
                        {file.usageLocations[0].publicPath}
                      </span>
                    )}
                  </div>

                  {/* Live Usage Snippet on Card */}
                  <div className="pt-1.5 border-t border-border/40 text-[11px]">
                    {file.usageLocations && file.usageLocations.length > 0 ? (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 truncate" title={`${file.usageLocations[0].entityType}: ${file.usageLocations[0].title} (${file.usageLocations[0].field})`}>
                        <Link2 className="h-3 w-3 shrink-0" />
                        <span className="font-semibold shrink-0">{file.usageLocations[0].entityType}:</span>
                        <span className="truncate text-foreground/85 font-medium">{file.usageLocations[0].title}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600/90 dark:text-amber-400/90 truncate">
                        <span className="truncate text-[10px]">Unused / Not linked to any page</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table / List View */
        <Card className="rounded-xl overflow-hidden border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredFiles.length > 0 && selectedFiles.size === filteredFiles.length}
                      onChange={(e) => {
                        if (e.target.checked) selectAllFiltered()
                        else clearSelection()
                      }}
                      className="rounded border-border"
                      aria-label="Select all files"
                    />
                  </th>
                  <th className="p-3">File Preview</th>
                  <th className="p-3">Name & Path</th>
                  <th className="p-3">Bucket</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Usage Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFiles.map((file) => {
                  const isSelected = selectedFiles.has(file.name)
                  const isImage = file.mimeType.startsWith("image/")
                  const filenameOnly = file.name.split("/").pop() || file.name

                  return (
                    <tr
                      key={`${file.bucket}-${file.name}`}
                      onClick={() => setInspectedFile(file)}
                      className={cn(
                        "hover:bg-muted/40 transition-colors cursor-pointer",
                        isSelected ? "bg-primary/5" : ""
                      )}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFileSelection(file.name)}
                          className="rounded border-border"
                          aria-label={`Select ${filenameOnly}`}
                        />
                      </td>
                      <td className="p-3 w-16">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                          {isImage ? (
                            <img src={file.publicUrl} alt={filenameOnly} className="object-cover w-full h-full" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-foreground max-w-xs truncate">
                        <p className="truncate" title={file.name}>{filenameOnly}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{file.name}</p>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {file.bucket}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono tabular-nums text-muted-foreground">
                        {formatBytes(file.size)}
                      </td>
                      <td className="p-3">
                        {file.usageLocations && file.usageLocations.length > 0 ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5">
                                In Use ({file.usageCount})
                              </Badge>
                              {file.usageLocations[0].publicPath && (
                                <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1 rounded">
                                  {file.usageLocations[0].publicPath}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-foreground truncate max-w-xs" title={`${file.usageLocations[0].entityType}: ${file.usageLocations[0].title} (${file.usageLocations[0].field})`}>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{file.usageLocations[0].entityType}:</span> {file.usageLocations[0].title}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <Badge variant="secondary" className="bg-amber-500/90 text-white text-[10px] py-0 px-1.5">
                              Unused
                            </Badge>
                            <p className="text-[10px] text-muted-foreground">Not linked to any page</p>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => copyUrl(file.publicUrl, file.name)}
                            aria-label="Copy URL"
                          >
                            {copiedId === file.name ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => {
                              setFileToDelete(file)
                              setShowDeleteDialog(true)
                            }}
                            aria-label="Delete file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 6. File Inspector Modal (Deep Details, Usage Links, Full Resolution) */}
      <Dialog open={!!inspectedFile} onOpenChange={(open) => !open && setInspectedFile(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {inspectedFile && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {inspectedFile.bucket}
                  </Badge>
                  {inspectedFile.usageCount && inspectedFile.usageCount > 0 ? (
                    <Badge className="bg-emerald-600 text-white text-xs">
                      In Use ({inspectedFile.usageCount})
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-600 text-white text-xs">
                      Unused / Safe to Delete
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-lg font-bold break-all mt-1">
                  {inspectedFile.name.split("/").pop()}
                </DialogTitle>
                <DialogDescription className="text-xs break-all">
                  Storage Path: {inspectedFile.bucket}/{inspectedFile.name}
                </DialogDescription>
              </DialogHeader>

              {/* Media Preview Box */}
              <div className="rounded-xl overflow-hidden bg-muted/60 border flex items-center justify-center min-h-[160px] max-h-[350px]">
                {inspectedFile.mimeType.startsWith("image/") ? (
                  <img
                    src={inspectedFile.publicUrl}
                    alt={inspectedFile.name}
                    className="object-contain max-h-[350px] w-full"
                  />
                ) : inspectedFile.mimeType.startsWith("video/") ? (
                  <video src={inspectedFile.publicUrl} controls className="max-h-[350px] w-full" />
                ) : inspectedFile.mimeType === "text/html" || inspectedFile.name.endsWith(".html") ? (
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="text-sm font-semibold text-foreground">Official HTML Receipt Document</p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">Donor transaction confirmation receipt</p>
                    <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                      <a href={inspectedFile.publicUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open Receipt Document</span>
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-primary mb-2" />
                    <p className="text-sm font-semibold text-foreground">{inspectedFile.name.split("/").pop()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">{inspectedFile.mimeType}</p>
                    <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                      <a href={inspectedFile.publicUrl} target="_blank" rel="noopener noreferrer" download>
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Document</span>
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Super Admin Private Access Banner */}
              {inspectedFile.isSensitive && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs">
                  <Lock className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>
                    <strong>Super Admin Secure Access:</strong> This file is stored in a private Supabase bucket. You are viewing it with an authorized temporary signed URL.
                  </span>
                </div>
              )}

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/40 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">FILE SIZE</span>
                  <span className="font-semibold font-mono tabular-nums">{formatBytes(inspectedFile.size)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">MIME TYPE</span>
                  <span className="font-semibold truncate block" title={inspectedFile.mimeType}>{inspectedFile.mimeType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">CREATED</span>
                  <span className="font-semibold truncate block">{format(new Date(inspectedFile.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">DATABASE SYNC</span>
                  <span className="font-semibold">
                    {inspectedFile.isTracked ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Tracked</span>
                    ) : (
                      <span className="text-amber-600">Storage Only</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Live Entity Usage Locations List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Referenced In Website Entities
                </h4>
                {inspectedFile.usageLocations && inspectedFile.usageLocations.length > 0 ? (
                  <div className="divide-y rounded-xl border bg-card">
                    {inspectedFile.usageLocations.map((u, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 text-xs gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[10px]">
                              {u.entityType}
                            </Badge>
                            <span className="font-semibold text-foreground">{u.title}</span>
                            <span className="text-muted-foreground text-[11px]">({u.field})</span>
                          </div>
                          {u.publicPath && (
                            <p className="text-[11px] text-muted-foreground font-mono">
                              Public page: <span className="text-foreground">{u.publicPath}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {u.publicPath && (
                            <Button variant="outline" size="sm" asChild className="h-7 text-xs gap-1">
                              <Link href={u.publicPath} target="_blank">
                                <Globe className="h-3 w-3" />
                                <span>Public Page</span>
                              </Link>
                            </Button>
                          )}
                          {u.href && (
                            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary gap-1">
                              <Link href={u.href} target="_blank">
                                <span>Edit Record</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed text-xs text-muted-foreground bg-muted/20">
                    <p className="font-medium text-foreground">Not referenced in any database records.</p>
                    <p className="mt-0.5">This file appears to be an orphaned or unused upload. You can safely delete it to free up storage space.</p>
                  </div>
                )}
              </div>

              {/* Public URL Box */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PUBLIC URL</span>
                <div className="flex items-center gap-2">
                  <Input value={inspectedFile.publicUrl} readOnly className="h-8 text-xs font-mono" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyUrl(inspectedFile.publicUrl, inspectedFile.name)}
                    className="h-8 text-xs shrink-0 gap-1"
                  >
                    {copiedId === inspectedFile.name ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy</span>
                  </Button>
                </div>
              </div>

              {/* Inspector Action Buttons */}
              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t">
                {!inspectedFile.isTracked && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTrackFile(inspectedFile)}
                    className="text-xs"
                  >
                    Track in Database
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs"
                >
                  <a href={inspectedFile.publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Open Full Size
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setFileToDelete(inspectedFile)
                    setShowDeleteDialog(true)
                  }}
                  className="text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete File
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 7. Single Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Delete Storage File?</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  Are you sure you want to permanently delete <strong>{fileToDelete?.name.split("/").pop()}</strong> from bucket <strong>{fileToDelete?.bucket}</strong>?
                </div>
                {fileToDelete?.usageCount && fileToDelete.usageCount > 0 ? (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    <strong>Warning:</strong> This file is currently used in <strong>{fileToDelete.usageCount} active website entity</strong> (e.g. {fileToDelete.usageLocations?.[0]?.title}). Deleting it will break that image on the live website!
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    This file is not referenced anywhere. Deleting it will safely reclaim {formatBytes(fileToDelete?.size)} of Supabase storage.
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && handleDelete(fileToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 8. Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Delete {selectedFiles.size} Files?</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  Are you sure you want to permanently delete <strong>{selectedFiles.size} selected files</strong>?
                </div>
                <div className="text-xs text-muted-foreground">
                  This action is irreversible and will permanently purge the files from Supabase storage buckets and the media library database.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedFiles.size} Files
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 9. Storage Sync Confirmation Dialog */}
      <AlertDialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span>Sync All Storage Buckets?</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  This will recursively scan all {buckets.length} storage buckets (including subfolders) and register any untracked files into the media library catalog.
                </div>
                <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/40 max-h-36 overflow-y-auto">
                  <strong>Buckets to index:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {buckets.map((b) => (
                      <li key={b.id}>{b.label} ({b.id})</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-muted-foreground">
                  Files already tracked will be preserved. This is safe to run anytime.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSyncStorage}>
              Run Sync
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 10. Direct File Upload Dialog */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload to Supabase Storage</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload files directly into any application storage bucket with automatic database registration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Storage Bucket</label>
              <select
                value={uploadBucket}
                onChange={(e) => setUploadBucket(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {buckets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label} ({b.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 text-center"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                {uploadingFiles ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {uploadingFiles ? "Uploading to storage..." : "Click or drag files here to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images (PNG, JPG, WEBP), Videos (MP4), or Documents (PDF) up to 25MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={handleDirectUpload}
                disabled={uploadingFiles}
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(false)}
              disabled={uploadingFiles}
              className="text-xs"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
