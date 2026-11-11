"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ShieldAlert,
  Shield,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Lock,
  Search,
  Filter,
  LayoutGrid,
  UserCheck,
  Copy,
  Check,
  Info,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import type { AdminRole } from "@/lib/types/admin"

interface RolePermissionsGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PermissionRow {
  domain: string
  subitem: string
  description?: string
  superAdmin: { allowed: "full" | "scoped" | "none"; note: string }
  admin: { allowed: "full" | "scoped" | "none"; note: string }
  editor: { allowed: "full" | "scoped" | "none"; note: string }
  finance: { allowed: "full" | "scoped" | "none"; note: string }
}

const PERMISSION_MATRIX: PermissionRow[] = [
  // 1. Content & CMS
  {
    domain: "Content & CMS",
    subitem: "Public Stories & Impact Articles",
    description: "Create, format, publish, and delete community impact stories and testimonials.",
    superAdmin: { allowed: "full", note: "Publish, edit, delete" },
    admin: { allowed: "full", note: "Publish, edit, delete" },
    editor: { allowed: "full", note: "Publish, edit, delete" },
    finance: { allowed: "none", note: "Restricted" },
  },
  {
    domain: "Content & CMS",
    subitem: "Programs & Community Campaigns",
    description: "Manage core initiatives, milestones, objectives, and public call-to-actions.",
    superAdmin: { allowed: "full", note: "Full builder access" },
    admin: { allowed: "full", note: "Full builder access" },
    editor: { allowed: "full", note: "Full builder access" },
    finance: { allowed: "none", note: "Restricted" },
  },
  {
    domain: "Content & CMS",
    subitem: "Events & Attendee Registrations",
    description: "Publish workshop dates, venue schedules, and manage participant registrations.",
    superAdmin: { allowed: "full", note: "Create & manage" },
    admin: { allowed: "full", note: "Create & manage" },
    editor: { allowed: "full", note: "Create & manage" },
    finance: { allowed: "none", note: "Restricted" },
  },
  {
    domain: "Content & CMS",
    subitem: "Media Library & Photo Wall",
    description: "Upload high-res photographic assets, banners, and gallery collections.",
    superAdmin: { allowed: "full", note: "Upload & organize" },
    admin: { allowed: "full", note: "Upload & organize" },
    editor: { allowed: "full", note: "Upload & organize" },
    finance: { allowed: "none", note: "Restricted" },
  },

  // 2. Finance & Donations
  {
    domain: "Finances & Donations",
    subitem: "Bank Transfer Review & Approvals",
    description: "Verify bank deposit receipts, match donor references, and approve transactions.",
    superAdmin: { allowed: "full", note: "Approve & reject" },
    admin: { allowed: "scoped", note: "View transactions only" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "full", note: "Approve, verify, issue" },
  },
  {
    domain: "Finances & Donations",
    subitem: "Official Tax Exemption Receipts",
    description: "Issue cryptographic serial receipts and email 80G tax exemptions to donors.",
    superAdmin: { allowed: "full", note: "Generate & email" },
    admin: { allowed: "none", note: "Restricted" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "full", note: "Generate & email" },
  },
  {
    domain: "Finances & Donations",
    subitem: "Donation Ledger & Fiscal CSV Exports",
    description: "Access complete transaction audit trails, revenue analytics, and bank ledgers.",
    superAdmin: { allowed: "full", note: "All-time records" },
    admin: { allowed: "scoped", note: "Summaries only" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "full", note: "Full ledger export" },
  },

  // 3. Inquiries & Community
  {
    domain: "Inquiries & Community",
    subitem: "Contact Submissions & Support Tickets",
    description: "Triage public inquiries, assign support tickets, and manage correspondence.",
    superAdmin: { allowed: "full", note: "Manage & assign" },
    admin: { allowed: "full", note: "Manage & assign" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "none", note: "Restricted" },
  },
  {
    domain: "Inquiries & Community",
    subitem: "Volunteer Applications & Onboarding",
    description: "Screen candidate submissions, review skills, and track volunteer deployments.",
    superAdmin: { allowed: "full", note: "Screen & approve" },
    admin: { allowed: "full", note: "Screen & approve" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "none", note: "Restricted" },
  },

  // 4. Team & IAM
  {
    domain: "Team & Security (IAM)",
    subitem: "Provision & Invite Administrator Accounts",
    description: "Grant administrative access, configure roles, and manage team member rosters.",
    superAdmin: { allowed: "full", note: "All roles" },
    admin: { allowed: "none", note: "Restricted" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "none", note: "Restricted" },
  },
  {
    domain: "Team & Security (IAM)",
    subitem: "Credential Override & Account Suspension",
    description: "Terminate sessions, suspend compromised accounts, and issue recovery tokens.",
    superAdmin: { allowed: "full", note: "Direct override & magic link" },
    admin: { allowed: "none", note: "Restricted" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "none", note: "Restricted" },
  },
  {
    domain: "Team & Security (IAM)",
    subitem: "System-Wide Security Audit Logs",
    description: "Inspect immutable audit ledgers, login attempts, IP addresses, and data diffs.",
    superAdmin: { allowed: "full", note: "Complete history" },
    admin: { allowed: "none", note: "Restricted" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "none", note: "Restricted" },
  },

  // 5. Site Settings
  {
    domain: "Platform Settings",
    subitem: "Branding, Typography & Visual Identity",
    description: "Configure system logos, favicon, open-graph cards, and accessibility modes.",
    superAdmin: { allowed: "full", note: "Full control" },
    admin: { allowed: "none", note: "Restricted" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "none", note: "Restricted" },
  },
  {
    domain: "Platform Settings",
    subitem: "Payment Rails & Gateway API Keys",
    description: "Manage Razorpay, Stripe, and direct bank transfer credentials and webhooks.",
    superAdmin: { allowed: "full", note: "Full control" },
    admin: { allowed: "none", note: "Restricted" },
    editor: { allowed: "none", note: "Restricted" },
    finance: { allowed: "none", note: "Restricted" },
  },
]

const DOMAIN_CATEGORIES = [
  "ALL",
  "Content & CMS",
  "Finances & Donations",
  "Inquiries & Community",
  "Team & Security (IAM)",
  "Platform Settings",
]

interface RoleProfile {
  id: AdminRole
  title: string
  level: string
  tagline: string
  targetUser: string
  mission: string
  badgeColor: string
  borderActive: string
  bgSelected: string
  icon: React.ElementType
  allowedHighlights: string[]
  restrictedHighlights: string[]
  bestPractice: string
}

const ROLE_PROFILES: Record<AdminRole, RoleProfile> = {
  SUPER_ADMIN: {
    id: "SUPER_ADMIN",
    title: "Super Admin",
    level: "Tier 1 · Root System Authority",
    tagline: "Unrestricted Governance",
    targetUser: "Founders, Executive Directors, Lead Systems Architects",
    mission: "Absolute authority over security infrastructure, administrative IAM rosters, financial audits, payment gateway configurations, and global website settings.",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    borderActive: "border-rose-500 ring-2 ring-rose-500/20",
    bgSelected: "bg-rose-500/[0.04]",
    icon: ShieldAlert,
    allowedHighlights: [
      "Create, edit, suspend, and delete any administrative account",
      "Zero-knowledge single-use recovery link and reset email dispatch",
      "Inspect full system security audit logs with IP tracking",
      "Configure payment rails, bank accounts, and webhook secrets",
      "Full editorial control over CMS stories, programs, and events",
      "Verify and approve offline donations and issue tax receipts",
    ],
    restrictedHighlights: [
      "Self-demotion or self-suspension locked by session protection",
    ],
    bestPractice: "Strictly limit to at most 2 designated executive custodians. Mandatory high-entropy credentials.",
  },
  ADMIN: {
    id: "ADMIN",
    title: "Administrator",
    level: "Tier 2 · Operations & Moderation",
    tagline: "Day-to-Day Operations",
    targetUser: "Operations Managers, Program Leads, Community Coordinators",
    mission: "Autonomous operational management over public-facing foundation programs, attendee registrations, contact inquiries, and volunteer screening.",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    borderActive: "border-indigo-500 ring-2 ring-indigo-500/20",
    bgSelected: "bg-indigo-500/[0.04]",
    icon: Shield,
    allowedHighlights: [
      "Publish and manage foundation stories, news, and press releases",
      "Build and edit community programs and initiatives",
      "Organize community events and oversee attendee registrations",
      "Review incoming contact messages and resolve support inquiries",
      "Review volunteer applications and screen candidates",
      "Read-only visibility into donation records (summaries only)",
    ],
    restrictedHighlights: [
      "Cannot modify administrative user accounts or assign roles",
      "Cannot approve or reject offline donation receipts",
      "Cannot issue tax exemption certificates",
      "Cannot modify payment credentials or platform configuration",
    ],
    bestPractice: "Ideal standard role for general foundation staff managing daily outreach and events.",
  },
  EDITOR: {
    id: "EDITOR",
    title: "Content Editor",
    level: "Tier 3 · Editorial & Media",
    tagline: "Storytelling & Campaigns",
    targetUser: "Communications Team, Content Writers, Photojournalists",
    mission: "Focused editorial access dedicated to crafting impact stories, uploading photo galleries, publishing programs, and curating public outreach narratives.",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    borderActive: "border-emerald-500 ring-2 ring-emerald-500/20",
    bgSelected: "bg-emerald-500/[0.04]",
    icon: FileText,
    allowedHighlights: [
      "Draft, format, and publish impact stories and photo essays",
      "Manage photo wall and upload media library assets",
      "Create and edit public programmatic announcements",
      "Manage event descriptions and schedule dates",
      "Update leadership and team member public profiles",
    ],
    restrictedHighlights: [
      "Zero access to financial donations or payment records",
      "Cannot review contact messages or support tickets",
      "Cannot access volunteer screening or volunteer details",
      "No access to user administration or site configuration",
    ],
    bestPractice: "Assign to content contributors and external copywriters to keep fiscal and IAM data quarantined.",
  },
  FINANCE: {
    id: "FINANCE",
    title: "Finance Manager",
    level: "Tier 3 · Fiscal & Tax Compliance",
    tagline: "Donations & Receipts",
    targetUser: "Chartered Accountants, Treasurers, Compliance Officers",
    mission: "Specialized fiscal governance encompassing offline bank transfer verification, automated 80G tax receipt generation, donor reconciliation, and audit reporting.",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    borderActive: "border-purple-500 ring-2 ring-purple-500/20",
    bgSelected: "bg-purple-500/[0.04]",
    icon: CreditCard,
    allowedHighlights: [
      "Review and verify incoming bank transfer donations",
      "Approve or reject pending offline payment submissions",
      "Generate cryptographic serial numbers for official tax receipts",
      "Email automated 80G tax deduction receipts to donors",
      "Export complete donation ledgers as audit-ready CSVs",
      "Inspect payment gateway status logs and reconciliation records",
    ],
    restrictedHighlights: [
      "Cannot modify stories, programs, or website editorial content",
      "Cannot manage event registrations or volunteer applications",
      "Cannot modify administrator accounts or change user roles",
      "Cannot alter payment gateway secrets or infrastructure keys",
    ],
    bestPractice: "Pair with dual-verification workflows for large institutional donations.",
  },
}

function PermissionBadge({
  status,
  note,
}: {
  status: "full" | "scoped" | "none"
  note: string
}) {
  if (status === "full") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span className="truncate">{note}</span>
      </div>
    )
  }
  if (status === "scoped") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
        <span className="truncate">{note}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
      <XCircle className="h-4 w-4 shrink-0" />
      <span className="truncate">{note}</span>
    </div>
  )
}

export function RolePermissionsGuideModal({
  open,
  onOpenChange,
}: RolePermissionsGuideModalProps) {
  const [viewMode, setViewMode] = useState<"matrix" | "deep-dive">("matrix")
  const [selectedRole, setSelectedRole] = useState<AdminRole>("SUPER_ADMIN")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("ALL")
  const [copiedSummary, setCopiedSummary] = useState(false)

  const filteredMatrix = useMemo(() => {
    return PERMISSION_MATRIX.filter((item) => {
      const matchesDomain =
        selectedDomain === "ALL" || item.domain === selectedDomain

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.subitem.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.superAdmin.note.toLowerCase().includes(q) ||
        item.admin.note.toLowerCase().includes(q) ||
        item.editor.note.toLowerCase().includes(q) ||
        item.finance.note.toLowerCase().includes(q)

      return matchesDomain && matchesSearch
    })
  }, [searchQuery, selectedDomain])

  const activeRoleProfile = ROLE_PROFILES[selectedRole]
  const ActiveRoleIcon = activeRoleProfile.icon

  const handleCopyPolicySummary = () => {
    const summaryText = [
      "# Deesha Foundation — Administrative Access Control Policy",
      `Generated: ${new Date().toLocaleDateString()}`,
      "",
      "## Role Overview:",
      ...Object.values(ROLE_PROFILES).map(
        (r) => `- ${r.title} (${r.level}): ${r.mission}`
      ),
      "",
      "## Principle of Least Privilege:",
      "All team accounts must be provisioned with the minimal sufficient tier required for operational duties.",
    ].join("\n")

    navigator.clipboard.writeText(summaryText)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
    notifications.showSuccess({
      title: "Policy Summary Copied",
      description: "Governance policy brief copied to clipboard.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[88vw] sm:max-w-3xl md:max-w-4xl lg:max-w-[940px] max-w-4xl h-[88vh] sm:h-[90vh] max-h-[92vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl bg-card">
        {/* 1. Sleek Modal Header Bar */}
        <DialogHeader className="py-3.5 px-6 sm:px-8 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Administrative Roles & Access Policy Guide
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Security clearance scopes, operational boundaries, and permissions matrix across all 3 clearance tiers (Tier 1 Root, Tier 2 Operations, Tier 3 Staff).
                </DialogDescription>
              </div>
            </div>

            {/* View Mode Switcher & Copy Summary */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <div className="flex items-center border rounded-xl p-0.5 bg-muted/50">
                <button
                  type="button"
                  onClick={() => setViewMode("matrix")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                    viewMode === "matrix"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Comparison Matrix</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("deep-dive")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                    viewMode === "deep-dive"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Role Deep-Dive</span>
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPolicySummary}
                className="h-8 text-xs gap-1.5 hidden md:inline-flex"
                title="Copy governance brief to clipboard"
              >
                {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSummary ? "Copied" : "Copy Policy"}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 2. Compact Role Selector Cards - Minimal Vertical Footprint */}
        <div className="px-6 sm:px-8 py-2.5 sm:py-3 border-b border-border/60 bg-muted/10 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
            {(["SUPER_ADMIN", "ADMIN", "EDITOR", "FINANCE"] as AdminRole[]).map((rKey) => {
              const r = ROLE_PROFILES[rKey]
              const RIcon = r.icon
              const isSelected = selectedRole === rKey

              return (
                <button
                  type="button"
                  key={rKey}
                  onClick={() => setSelectedRole(rKey)}
                  className={cn(
                    "p-2 sm:p-2.5 rounded-xl border transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs relative overflow-hidden group",
                    isSelected
                      ? cn("border-primary/50 shadow-xs ring-1 ring-primary/20", r.borderActive, r.bgSelected)
                      : "border-border/80 bg-card hover:bg-muted/30 hover:border-border"
                  )}
                  title={`View details for ${r.title}`}
                  aria-pressed={isSelected}
                >
                  <div className={cn("p-1.5 rounded-lg border shrink-0 transition-transform group-hover:scale-105", r.badgeColor)}>
                    <RIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-foreground truncate">{r.title}</span>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                      {r.tagline}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Main Workspace: Prominent Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {viewMode === "matrix" ? (
            /* ── VIEW A: FULL COMPARISON MATRIX ── */
            <div className="space-y-5">
              {/* Search & Legend Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search capability or operational scope (e.g. Stories, Tax Receipts, Passwords, Payments)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 text-xs sm:text-sm bg-background"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Legend Chips with comfortable spacing */}
                <div className="flex items-center gap-3.5 text-xs text-muted-foreground font-medium shrink-0">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Full Access
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Scoped
                  </span>
                  <span className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-muted-foreground/60" />
                    Restricted
                  </span>
                </div>
              </div>

              {/* Domain Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1.5 shrink-0">
                  <Filter className="h-3.5 w-3.5" />
                  Domain:
                </span>
                {DOMAIN_CATEGORIES.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => setSelectedDomain(domain)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                      selectedDomain === domain
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {domain}
                  </button>
                ))}
              </div>

              {/* Matrix Table with Airy Rows */}
              {filteredMatrix.length === 0 ? (
                <div className="p-16 text-center border border-dashed rounded-2xl space-y-2">
                  <HelpCircle className="h-9 w-9 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No matching capabilities found</p>
                  <p className="text-xs text-muted-foreground">Try clearing search terms or selecting another domain filter.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/80 overflow-hidden shadow-xs">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="border-b border-border/80">
                        <TableHead className="w-[260px] py-3 px-3.5 font-semibold text-foreground">
                          Capability & Scope
                        </TableHead>
                        <TableHead className="w-[145px] py-3 px-3.5">
                          <span className="text-rose-600 dark:text-rose-400 font-bold">Super Admin</span>
                        </TableHead>
                        <TableHead className="w-[145px] py-3 px-3.5">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Administrator</span>
                        </TableHead>
                        <TableHead className="w-[145px] py-3 px-3.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Content Editor</span>
                        </TableHead>
                        <TableHead className="w-[145px] py-3 px-3.5">
                          <span className="text-purple-600 dark:text-purple-400 font-bold">Finance Manager</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMatrix.map((row, idx) => {
                        const isNewDomain =
                          idx === 0 || filteredMatrix[idx - 1].domain !== row.domain

                        return (
                          <TableRow key={idx} className="hover:bg-muted/30 transition-colors group">
                            <TableCell className="py-3 px-3.5">
                              <div className="space-y-1">
                                {isNewDomain && (
                                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 mb-1 text-muted-foreground">
                                    {row.domain}
                                  </Badge>
                                )}
                                <p className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {row.subitem}
                                </p>
                                {row.description && (
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {row.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-3.5">
                              <PermissionBadge status={row.superAdmin.allowed} note={row.superAdmin.note} />
                            </TableCell>
                            <TableCell className="py-3 px-3.5">
                              <PermissionBadge status={row.admin.allowed} note={row.admin.note} />
                            </TableCell>
                            <TableCell className="py-3 px-3.5">
                              <PermissionBadge status={row.editor.allowed} note={row.editor.note} />
                            </TableCell>
                            <TableCell className="py-3 px-3.5">
                              <PermissionBadge status={row.finance.allowed} note={row.finance.note} />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            /* ── VIEW B: ROLE DEEP-DIVE ── */
            <div className="space-y-6">
              {/* Role Header Banner */}
              <div className={cn("p-6 sm:p-7 rounded-2xl border space-y-4", activeRoleProfile.borderActive, activeRoleProfile.bgSelected)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl border shadow-xs", activeRoleProfile.badgeColor)}>
                      <ActiveRoleIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-bold text-foreground">{activeRoleProfile.title}</h3>
                        <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-0.5", activeRoleProfile.badgeColor)}>
                          {activeRoleProfile.level}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                        Target Audience: {activeRoleProfile.targetUser}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
                    {activeRoleProfile.level.slice(0, 6)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed border-t pt-4">
                  {activeRoleProfile.mission}
                </p>
              </div>

              {/* Two Column Breakdown: Authorized vs Restricted */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Authorized Column */}
                <div className="p-5 sm:p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] space-y-4">
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Explicitly Authorized Capabilities
                  </h4>
                  <ul className="space-y-3">
                    {activeRoleProfile.allowedHighlights.map((hl, i) => (
                      <li key={i} className="text-xs sm:text-sm text-foreground/90 flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Restricted Column */}
                <div className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-muted/20 space-y-4">
                  <h4 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-muted-foreground/80" />
                    Enforced Security Boundaries
                  </h4>
                  <ul className="space-y-3">
                    {activeRoleProfile.restrictedHighlights.map((hl, i) => (
                      <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2.5">
                        <XCircle className="h-4 w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best Practice Callout */}
              <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-primary/[0.03] text-xs sm:text-sm flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Operational Governance Recommendation:</span>
                  <p className="text-muted-foreground leading-relaxed">{activeRoleProfile.bestPractice}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Sleek Footer */}
        <div className="py-3 px-6 sm:px-8 border-t border-border/60 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-[11px] sm:text-xs">Principle of Least Privilege: Assign the lowest necessary role to reduce operational security risks.</span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs px-3.5 self-end sm:self-auto"
          >
            Close Guide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
