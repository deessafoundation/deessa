"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Loader2 } from "lucide-react"
import { deletePartner } from "@/lib/actions/admin-partners"
import styles from "./partners-manager.module.css"

interface PartnerActionsProps {
  partnerId: string
  partnerName: string
  onDeleted?: (warning?: string) => void
}

export function PartnerActions({ partnerId, partnerName, onDeleted }: PartnerActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const deleting = useRef(false)
  const router = useRouter()

  async function handleDelete() {
    if (deleting.current) return
    deleting.current = true
    setIsDeleting(true)
    setError("")
    try {
      const result = await deletePartner(partnerId)
      if (result.error) throw new Error(result.error)
      if (!result.success) throw new Error("The deletion could not be confirmed.")
      setOpen(false)
      if (onDeleted) onDeleted(result.warning)
      else router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not delete this partner. Please try again.")
    } finally {
      deleting.current = false
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!deleting.current) { setOpen(next); setError("") } }}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Delete ${partnerName}`} className="size-11 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={styles.surface}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Partner</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{partnerName}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="min-h-11">Cancel</AlertDialogCancel>
          <AlertDialogAction
            data-contrast="filled"
            onClick={(event) => { event.preventDefault(); void handleDelete() }}
            disabled={isDeleting}
            className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
