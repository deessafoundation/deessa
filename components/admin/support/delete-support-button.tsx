"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Archive, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { notifications } from "@/lib/notifications"

interface DeleteSupportButtonProps {
  reportId: string
  reportSummary: string
  isArchived?: boolean
  onArchive: () => Promise<void>
}

export default function DeleteSupportButton({
  reportId,
  reportSummary,
  isArchived = false,
  onArchive,
}: DeleteSupportButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/support/${reportId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete support report")
      }

      // Close modal after successful deletion
      setOpen(false)
      
      // Show success notification
      notifications.showSuccess({
        title: "Support report deleted",
        description: "The support report and all related data have been permanently deleted.",
      })
      
      // Redirect to support list page
      router.push('/admin/support')
      router.refresh()
    } catch (error) {
      console.error("Error deleting support report:", error)
      notifications.showError({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete support report",
      })
      setIsDeleting(false)
    }
  }

  const handleArchiveInstead = async () => {
    setIsArchiving(true)

    try {
      await onArchive()
      setOpen(false)
    } catch (error) {
      console.error("Error archiving support report:", error)
      notifications.showError({
        title: "Archive failed",
        description: "Failed to archive support report",
      })
      setIsArchiving(false)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete Report
      </Button>

      <AlertDialog open={open} onOpenChange={(newOpen) => {
        // Only allow closing if not currently deleting or archiving
        if (!newOpen && (isDeleting || isArchiving)) {
          return
        }
        setOpen(newOpen)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this support report?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  This action cannot be undone. This will permanently delete the support report{" "}
                  <span className="font-semibold text-foreground">&quot;{reportSummary}&quot;</span>, 
                  including all screenshots, notes, and activity history.
                </div>
                {!isArchived && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-500">
                    💡 Tip: Consider archiving instead. You can hide it from the active list while keeping the data for future reference.
                  </div>
                )}
                {isArchived && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
                    ℹ️ This report is already archived. You can proceed with permanent deletion.
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isDeleting || isArchiving} onClick={(e) => {
              if (isDeleting || isArchiving) {
                e.preventDefault()
              }
            }}>Cancel</AlertDialogCancel>
            {!isArchived && (
              <Button
                variant="outline"
                onClick={handleArchiveInstead}
                disabled={isDeleting || isArchiving}
                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-500 dark:hover:bg-amber-950/30"
              >
                <Archive className="mr-2 h-4 w-4" />
                {isArchiving ? "Archiving..." : "Archive Instead"}
              </Button>
            )}
            <Button
              onClick={handleDelete}
              disabled={isDeleting || isArchiving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
