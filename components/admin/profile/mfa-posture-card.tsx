"use client"

import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  Smartphone,
  Key,
  CheckCircle2,
  Lock,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdminRole } from "@/lib/types/admin"

interface MfaPostureCardProps {
  role: AdminRole
}

export function MfaPostureCard({ role }: MfaPostureCardProps) {
  const isPrivileged = role === "SUPER_ADMIN" || role === "ADMIN"

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/20 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Two-Factor Authentication (2FA) Posture
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold px-2 py-0",
                isPrivileged
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
                  : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30"
              )}
            >
              {isPrivileged ? "Mandatory Clearance Tier" : "Standard Clearance Tier"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Multi-factor verification safeguards privileged administrative sessions against credential replay attacks.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shadow-2xs self-start sm:self-auto">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          MFA Enforced
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Smartphone className="h-3 w-3 text-primary" />
            Primary Factor
          </span>
          <p className="text-xs font-semibold text-foreground">Time-Based OTP (TOTP)</p>
          <p className="text-[10px] text-muted-foreground">RFC 6238 Authenticator App</p>
        </div>

        <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Key className="h-3 w-3 text-indigo-500" />
            Recovery Assurance
          </span>
          <p className="text-xs font-semibold text-foreground">One-Time Backup Keys</p>
          <p className="text-[10px] text-muted-foreground">Stored Offline & Sealed</p>
        </div>

        <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3 text-emerald-500" />
            Session Assurance
          </span>
          <p className="text-xs font-semibold text-foreground">AAL2 Verified Token</p>
          <p className="text-[10px] text-muted-foreground">High-Assurance Cryptography</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
        <Layers className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
        <span>
          Clearance Tier Policy: Administrative state modifications (User Role Elevation, Treasury Ledger Operations) require explicit multi-factor verification.
        </span>
      </div>
    </div>
  )
}
