"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldAlert,
  Shield,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { AdminRole } from "@/lib/types/admin"

interface RoleClearanceCardProps {
  role: AdminRole
}

interface DomainCapability {
  domain: string
  allowed: boolean
  description: string
}

const ROLE_METADATA: Record<
  AdminRole,
  {
    title: string
    clearanceLevel: string
    description: string
    badgeColor: string
    icon: React.ElementType
    capabilities: DomainCapability[]
  }
> = {
  SUPER_ADMIN: {
    title: "Super Administrator",
    clearanceLevel: "Tier 1 — Unrestricted Root Authority",
    description: "Complete sovereign authority across all foundation systems, database tables, user access controls, and financial operations.",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: ShieldAlert,
    capabilities: [
      {
        domain: "Identity & Access Management (IAM)",
        allowed: true,
        description: "Create, suspend, delete, and configure roles and passwords for all administrative team members.",
      },
      {
        domain: "Financial Oversight & Receipts",
        allowed: true,
        description: "Review incoming bank donations, approve tax receipts, and export official financial audit reports.",
      },
      {
        domain: "Content Management & Stories",
        allowed: true,
        description: "Draft, edit, publish, and delete programs, stories, events, artworks, and news articles.",
      },
      {
        domain: "Community Outreach & Inquiries",
        allowed: true,
        description: "Review volunteer applications, respond to contact messages, and manage newsletter subscribers.",
      },
      {
        domain: "Site Configuration & Payment Rails",
        allowed: true,
        description: "Manage global branding, typography, live donation payment credentials, and SEO configuration.",
      },
      {
        domain: "Security & Activity Telemetry",
        allowed: true,
        description: "Inspect immutable system-wide activity logs, review failed login attempts, and monitor IP addresses.",
      },
    ],
  },
  ADMIN: {
    title: "Administrator",
    clearanceLevel: "Tier 2 — Operational Management",
    description: "Broad operational authority over day-to-day community submissions, editorial workflow, and visitor engagements.",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: Shield,
    capabilities: [
      {
        domain: "Content Management & Stories",
        allowed: true,
        description: "Draft, edit, and publish programs, stories, events, media, and photo essays.",
      },
      {
        domain: "Community Outreach & Inquiries",
        allowed: true,
        description: "Review volunteer submissions, contact form inquiries, and newsletter distributions.",
      },
      {
        domain: "Financial Oversight (Read-Only)",
        allowed: false,
        description: "Can view incoming donation records; cannot edit receipt amounts, delete logs, or approve tax vouchers.",
      },
      {
        domain: "Identity & Access Management (IAM)",
        allowed: false,
        description: "Cannot invite, suspend, delete, or reset credentials of other administrative users.",
      },
      {
        domain: "Site Configuration & Payment Rails",
        allowed: false,
        description: "Cannot modify core payment gateway credentials or root database settings.",
      },
      {
        domain: "Security & Activity Telemetry",
        allowed: true,
        description: "View personal activity records and general editorial timeline logs.",
      },
    ],
  },
  EDITOR: {
    title: "Content Editor",
    clearanceLevel: "Tier 3 — Editorial & Storytelling",
    description: "Dedicated to drafting, publishing, and updating stories, programs, events, and community impact media.",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: FileText,
    capabilities: [
      {
        domain: "Content Management & Stories",
        allowed: true,
        description: "Create, edit, and update programs, impact stories, upcoming events, and articles.",
      },
      {
        domain: "Media Assets & Banners",
        allowed: true,
        description: "Upload photo essays, partner logos, banners, and artwork gallery items.",
      },
      {
        domain: "Financial Operations & Receipts",
        allowed: false,
        description: "No access to donor personal details, payment receipts, or financial ledger.",
      },
      {
        domain: "Identity & Access Management (IAM)",
        allowed: false,
        description: "No access to team role administration or credential management.",
      },
      {
        domain: "Site Configuration & Payment Rails",
        allowed: false,
        description: "No access to payment settings, site typography, or theme configuration.",
      },
      {
        domain: "Community Outreach & Inquiries",
        allowed: false,
        description: "No access to incoming private contact submissions or donor inquiries.",
      },
    ],
  },
  FINANCE: {
    title: "Finance Manager",
    clearanceLevel: "Tier 3 — Financial Verification & Auditing",
    description: "Dedicated to verifying contributions, issuing tax exemption receipts, and conducting fiscal reporting.",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: CreditCard,
    capabilities: [
      {
        domain: "Financial Operations & Receipts",
        allowed: true,
        description: "Review bank deposits, verify donor payment proofs, generate official tax receipts, and export audit files.",
      },
      {
        domain: "Financial Analytics & Reports",
        allowed: true,
        description: "Inspect donation trends, average contributions, recurring payment analytics, and fiscal summaries.",
      },
      {
        domain: "Content Management & Stories",
        allowed: false,
        description: "No editorial access to public stories, events, programs, or homepage banners.",
      },
      {
        domain: "Identity & Access Management (IAM)",
        allowed: false,
        description: "Cannot invite, modify, or manage administrative staff user accounts.",
      },
      {
        domain: "Site Configuration & Payment Rails",
        allowed: false,
        description: "Cannot alter gateway credentials or core application configuration.",
      },
      {
        domain: "Community Inquiries",
        allowed: false,
        description: "Restricted from general volunteer applications and support tickets.",
      },
    ],
  },
}

export function RoleClearanceCard({ role }: RoleClearanceCardProps) {
  const meta = ROLE_METADATA[role] || ROLE_METADATA.EDITOR
  const RoleIcon = meta.icon

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={cn("p-2.5 rounded-xl border shrink-0", meta.badgeColor)}>
            <RoleIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground">{meta.title}</h3>
              <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5", meta.badgeColor)}>
                {role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{meta.clearanceLevel}</p>
          </div>
        </div>

        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline shrink-0"
        >
          <span>View Team Directory</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {meta.description}
      </p>

      {/* 2. Capabilities Matrix */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Functional Domain Clearances
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {meta.capabilities.map((cap, i) => (
            <Card
              key={i}
              className={cn(
                "border shadow-2xs transition-all",
                cap.allowed
                  ? "border-border/80 bg-card hover:border-primary/30"
                  : "border-dashed border-border/60 bg-muted/20 opacity-80"
              )}
            >
              <CardContent className="p-3.5 flex items-start gap-3">
                {cap.allowed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-foreground truncate">
                      {cap.domain}
                    </h5>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.2 rounded border font-mono shrink-0",
                        cap.allowed
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border/60"
                      )}
                    >
                      {cap.allowed ? "Authorized" : "Restricted"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Elevation Notice */}
      <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 flex items-start gap-3 text-xs text-muted-foreground">
        <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground">Need Adjusted System Permissions?</p>
          <p className="text-[11px] leading-relaxed">
            Privilege escalation and role adjustments are managed centrally by Super Administrators. If your duties require expanded access, reach out to your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
