"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Loader2, X } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface AdminUser {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string
}

interface AssignModalProps {
  reportId: string
  currentAssignee?: string | null
  adminUsers: AdminUser[]
}

export default function AssignModal({
  reportId,
  currentAssignee,
  adminUsers,
}: AssignModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<string>(currentAssignee || "")
  const [isAssigning, setIsAssigning] = useState(false)
  const router = useRouter()

  const handleAssign = async () => {
    if (!selectedAdmin) {
      notifications.showError({
        title: "No admin selected",
        description: "Please select an admin to assign this report to.",
      })
      return
    }

    setIsAssigning(true)

    try {
      const admin = adminUsers.find(a => a.email === selectedAdmin)
      
      const response = await fetch("/api/admin/support/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reportId,
          action: "assign",
          payload: { 
            assignee: selectedAdmin,
            assignee_name: admin?.full_name,
            assignee_id: admin?.user_id,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to assign report")
      }

      notifications.showSuccess({
        title: "Report assigned",
        description: `Successfully assigned to ${admin?.full_name || selectedAdmin}`,
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error assigning report:", error)
      notifications.showError({
        title: "Assignment failed",
        description: error instanceof Error ? error.message : "Failed to assign report",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async () => {
    setIsAssigning(true)

    try {
      const response = await fetch("/api/admin/support/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reportId,
          action: "unassign",
          payload: {},
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to unassign report")
      }

      notifications.showSuccess({
        title: "Report unassigned",
        description: "Successfully removed assignment",
      })

      setSelectedAdmin("")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error unassigning report:", error)
      notifications.showError({
        title: "Unassignment failed",
        description: error instanceof Error ? error.message : "Failed to unassign report",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    if (!role) return "text-slate-600"
    
    switch (role) {
      case "SUPER_ADMIN":
        return "text-purple-600"
      case "ADMIN":
        return "text-blue-600"
      case "EDITOR":
        return "text-green-600"
      case "FINANCE":
        return "text-amber-600"
      default:
        return "text-slate-600"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 hover:border-indigo-300 transition-all"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          {currentAssignee ? "Reassign" : "Assign"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Support Report</DialogTitle>
          <DialogDescription>
            Assign this support report to an admin team member. They will be notified via email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentAssignee && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-900">Currently Assigned To</p>
              <p className="text-sm text-blue-700 mt-1">{currentAssignee}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Admin</label>
            <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an admin..." />
              </SelectTrigger>
              <SelectContent>
                {adminUsers.map((admin) => (
                  <SelectItem key={admin.id} value={admin.email}>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{admin.full_name}</span>
                        <span className="text-xs text-muted-foreground">{admin.email}</span>
                      </div>
                      <span className={`text-xs font-semibold ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role ? admin.role.replace('_', ' ') : 'N/A'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {adminUsers.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">No admin users available</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {currentAssignee && (
            <Button
              variant="outline"
              onClick={handleUnassign}
              disabled={isAssigning}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unassigning...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Unassign
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleAssign}
            disabled={isAssigning || !selectedAdmin}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
