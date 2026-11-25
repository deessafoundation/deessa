"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, User, Copy, Check, MessageSquareQuote, Search, ArrowUpRight } from "lucide-react"
import { copyToClipboard } from "@/lib/utils/clipboard"
import { notifications } from "@/lib/notifications"

interface DonorInformationProps {
  donor: {
    name: string
    email: string
    phone?: string | null
    message?: string | null
  }
}

export function DonorInformation({ donor }: DonorInformationProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedKey(label)
      notifications.showSuccess(`${label} copied to clipboard`)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  const initials = (donor.name || "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const searchParam = encodeURIComponent(donor.email || donor.name || "")

  return (
    <Card className="border-border/80 shadow-xs overflow-hidden bg-card">
      <CardHeader className="bg-muted/30 border-b border-border/60 py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="size-4 text-primary" />
          <CardTitle className="text-base font-bold">Donor Dossier</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs font-medium bg-background px-2.5 py-0.5">
          Verified Supporter
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Donor Profile Header */}
        <div className="flex items-center justify-between gap-3.5 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-12 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-sm font-extrabold text-primary shrink-0 ring-2 ring-primary/10">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-foreground truncate">
                {donor.name || "Anonymous Donor"}
              </h3>
              <p className="text-xs text-muted-foreground">Community Supporter</p>
            </div>
          </div>

          {/* Quick link: search all gifts by this donor */}
          {searchParam && (
            <Link
              href={`/admin/donations?search=${searchParam}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
              title="Filter donations ledger for this donor"
            >
              <Search className="size-3" />
              <span className="hidden sm:inline">All Contributions</span>
              <ArrowUpRight className="size-3" />
            </Link>
          )}
        </div>

        {/* Contact Details List */}
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground block">Email Address</span>
                <a
                  href={`mailto:${donor.email}`}
                  className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary hover:underline truncate block"
                >
                  {donor.email || "No email registered"}
                </a>
              </div>
            </div>

            {donor.email && (
              <button
                type="button"
                onClick={() => handleCopy(donor.email, "Email")}
                title="Copy email address"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-border/60"
              >
                {copiedKey === "Email" ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Phone className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground block">Contact Phone</span>
                {donor.phone ? (
                  <a
                    href={`tel:${donor.phone}`}
                    className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary hover:underline truncate block"
                  >
                    {donor.phone}
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Not provided</span>
                )}
              </div>
            </div>

            {donor.phone && (
              <button
                type="button"
                onClick={() => handleCopy(donor.phone!, "Phone")}
                title="Copy phone number"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-border/60"
              >
                {copiedKey === "Phone" ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Dedication / Message */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Donor Dedication / Message
          </span>
          {donor.message ? (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs sm:text-sm text-foreground relative">
              <MessageSquareQuote className="size-5 text-primary/40 mb-1" />
              <p className="italic whitespace-pre-wrap leading-relaxed">&ldquo;{donor.message}&rdquo;</p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground italic">
              No personalized message attached with this donation.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
