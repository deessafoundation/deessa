"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Archive, ArchiveRestore, Loader2 } from "lucide-react"

export default function ShowArchivedButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showArchived = searchParams.get('showArchived') === 'true'
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(() => {
      if (showArchived) {
        router.push('/admin/support')
      } else {
        router.push('/admin/support?showArchived=true')
      }
    })
  }

  return (
    <Button 
      onClick={handleToggle}
      disabled={isPending}
      variant="outline"
      size="sm"
      className={`transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 ${
        showArchived 
          ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-400 focus-visible:ring-green-500" 
          : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-400 focus-visible:ring-amber-500"
      }`}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {showArchived ? (
            <>
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Hide Archived
            </>
          ) : (
            <>
              <Archive className="h-4 w-4 mr-2" />
              Show Archived
            </>
          )}
        </>
      )}
    </Button>
  )
}
