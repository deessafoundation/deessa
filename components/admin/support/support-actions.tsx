"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import InternalNoteModal from "./internal-note-modal"
import AssignModal from "./assign-modal"
import { MoreHorizontal, Download, FileJson, UserPlus } from "lucide-react"

interface AdminUser {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
  avatar_url?: string
}

interface Props {
  id: string
  reviewed?: boolean
  status?: string | null
  assignee?: string | null
  email?: string | null
  adminUsers?: AdminUser[]
}

export default function SupportActions({ 
  id, 
  reviewed = false, 
  status = null, 
  assignee = null, 
  email = null,
  adminUsers = []
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [localReviewed, setLocalReviewed] = React.useState(reviewed)
  const [localStatus, setLocalStatus] = React.useState(status || "open")

  async function callAction(action: string, payload: any = {}) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/support/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, payload }),
      })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()

      if (action === "mark-reviewed") setLocalReviewed(true)
      if (action === "change-status") setLocalStatus(payload.status)

      router.refresh()
      return data
    } catch (err) {
      console.error(err)
      alert("Action failed: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Status menu helper (performed_by taken from authenticated session server-side)
  const getStatusColor = () => {
    if (localStatus === 'closed') return 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300 hover:text-red-800'
    if (localStatus === 'in-progress') return 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 hover:border-amber-300 hover:text-amber-800'
    return 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 hover:text-green-800' // open
  }

  const StatusMenu = (
    <div className="inline-flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className={`${getStatusColor()} transition-all font-medium capitalize`}>
            Status: {localStatus}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => callAction('change-status', { status: 'open' })}>Open</DropdownMenuItem>
          <DropdownMenuItem onClick={() => callAction('change-status', { status: 'in-progress' })}>In Progress</DropdownMenuItem>
          <DropdownMenuItem onClick={() => callAction('change-status', { status: 'closed' })}>Closed</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  const handleAssign = async () => {
    // This function is now replaced by AssignModal component
    // Keeping for backward compatibility if needed
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/admin/support/export?id=${id}`)
      if (!res.ok) throw new Error('Unable to fetch')
      const data = await res.json()
      if (data.screenshot_path) {
        const signRes = await fetch(`/api/admin/support/signed?path=${encodeURIComponent(data.screenshot_path)}`)
        if (!signRes.ok) throw new Error('No signed url')
        const { url } = await signRes.json()
        window.open(url, '_blank')
      } else {
        alert('No screenshot available')
      }
    } catch (err) { 
      console.error(err)
      alert('Failed to open screenshot')
    }
  }

  const handleExportJSON = () => {
    window.open(`/api/admin/support/export?id=${id}`, '_blank')
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <AssignModal 
        reportId={id} 
        currentAssignee={assignee} 
        adminUsers={adminUsers}
      />

      <Button 
        size="sm" 
        variant="outline"
        disabled={loading} 
        onClick={handleDownload}
        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300 transition-all"
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>

      <Button 
        size="sm" 
        variant="outline"
        disabled={loading} 
        onClick={handleExportJSON}
        className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-300 transition-all"
      >
        <FileJson className="h-4 w-4 mr-1" />
        Export JSON
      </Button>
    </div>
  )
}
