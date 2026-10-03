"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteTeamMember } from "@/lib/actions/admin-team"
import { notifications } from "@/lib/notifications"
import { ConfirmDialog } from "./common/confirm-dialog"

export function TeamDeleteButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const result = await deleteTeamMember(id)
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Member deleted." })
      router.push("/admin/team")
    }
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setOpen(true) }}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Team Member"
        description="This action cannot be undone. The member will be permanently removed."
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  )
}
