"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Wifi,
  Laptop,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Lock,
  LogOut,
  Radio,
} from "lucide-react"
import { revokeOtherSessions } from "@/lib/actions/admin-profile"
import { notifications } from "@/lib/notifications"

interface SessionManagerCardProps {
  clientIp: string
  clientInfo: {
    browser: string
    os: string
    device: string
  }
}

export function SessionManagerCard({ clientIp, clientInfo }: SessionManagerCardProps) {
  const [isRevoking, setIsRevoking] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleRevoke = async () => {
    setIsRevoking(true)
    try {
      const result = await revokeOtherSessions()
      if (result.error) {
        notifications.showError({
          title: "Session Invalidation Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Remote Sessions Terminated",
          description: "All other device sessions have been revoked. Only this browser remains authenticated.",
        })
        setDialogOpen(false)
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to revoke other sessions.",
      })
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/20 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-primary" />
              Active Session & Device Control
            </span>
            <Badge
              variant="outline"
              className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-mono px-2 py-0"
            >
              TLS 1.3 Encrypted
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage your authenticated hardware devices and remotely terminate untrusted sessions.
          </p>
        </div>

        {/* Remote Invalidation Trigger with Modal Confirmation */}
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRevoking}
              className="h-8.5 text-xs font-semibold rounded-xl gap-1.5 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 self-start sm:self-auto cursor-pointer"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Invalidating...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out of Other Devices</span>
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md rounded-2xl">
            <AlertDialogHeader className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <AlertDialogTitle className="text-lg font-bold">
                Revoke Remote Administrator Sessions?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                This will immediately invalidate token secrets across all other browsers, mobile devices, and
                staged sessions under your credentials. Your active browser session will remain securely connected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel disabled={isRevoking} className="text-xs">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleRevoke()
                }}
                disabled={isRevoking}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5"
              >
                {isRevoking ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Revoking Sessions...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Revoke All Other Sessions</span>
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Hardware & Diagnostics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3 text-indigo-500" />
            Session Origin IP
          </span>
          <span className="font-mono text-xs font-semibold text-foreground block truncate">
            {clientIp}
          </span>
          <span className="text-[10px] text-muted-foreground block">Verified Geo-Proxy Gateway</span>
        </div>

        <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Laptop className="h-3 w-3 text-blue-500" />
            Current Device
          </span>
          <span className="text-xs font-semibold text-foreground block truncate" title={clientInfo.device}>
            {clientInfo.device}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-500" />
            Active Controller Node
          </span>
        </div>

        <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            Brute-Force Guard
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Active (Rate Limited)
          </span>
          <span className="text-[10px] text-muted-foreground block">Adaptive IP Throttling</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
        <span>Session anchored to HTTP-only cookie token verified by Supabase Auth GoTrue.</span>
        <span className="font-mono text-[10px] text-muted-foreground/80">Scope: others</span>
      </div>
    </div>
  )
}
