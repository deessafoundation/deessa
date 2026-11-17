"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SlidersHorizontal,
  Compass,
  Table as TableIcon,
  LayoutList,
  Volume2,
  VolumeX,
  RotateCcw,
  Save,
  Loader2,
  Maximize2,
  Minimize2,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { updatePreferences } from "@/lib/actions/admin-profile"
import { notifications } from "@/lib/notifications"
import type { AdminUser, AdminUserPreferences } from "@/lib/types/admin"

interface PreferencesFormProps {
  adminUser: AdminUser
}

const LANDING_PAGES = [
  { value: "/admin", label: "Operations Dashboard (System Overview)", hint: "Core system health, metrics & summary" },
  { value: "/admin/donations", label: "Treasury & Donations Ledger", hint: "Fiscal contributions & verification" },
  { value: "/admin/stories", label: "Editorial Stories & Articles", hint: "Publishing and content moderation" },
  { value: "/admin/contacts", label: "Citizen Inquiries & Contact Desk", hint: "Direct inquiries and resolution tickets" },
  { value: "/admin/newsletters", label: "Newsletter Audience", hint: "Subscriber lists & communications" },
  { value: "/admin/volunteers", label: "Volunteer Applications", hint: "Community recruitments and review" },
  { value: "/admin/users/audit", label: "System Audit & Compliance Ledger", hint: "Enterprise security and forensic logs" },
]

export function PreferencesForm({ adminUser }: PreferencesFormProps) {
  const router = useRouter()
  const currentPrefs: AdminUserPreferences = adminUser.preferences || {}

  const [landingPage, setLandingPage] = useState(currentPrefs.defaultLandingPage || "/admin")
  const [ledgerView, setLedgerView] = useState<"timeline" | "table">(
    currentPrefs.ledgerDefaultView || "table"
  )
  const [density, setDensity] = useState<"comfortable" | "compact">(
    currentPrefs.density || "comfortable"
  )
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    currentPrefs.soundEnabled ?? true
  )

  const [isSaving, setIsSaving] = useState(false)

  const isDirty =
    landingPage !== (currentPrefs.defaultLandingPage || "/admin") ||
    ledgerView !== (currentPrefs.ledgerDefaultView || "table") ||
    density !== (currentPrefs.density || "comfortable") ||
    soundEnabled !== (currentPrefs.soundEnabled ?? true)

  const handleReset = () => {
    setLandingPage(currentPrefs.defaultLandingPage || "/admin")
    setLedgerView(currentPrefs.ledgerDefaultView || "table")
    setDensity(currentPrefs.density || "comfortable")
    setSoundEnabled(currentPrefs.soundEnabled ?? true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload: AdminUserPreferences = {
        defaultLandingPage: landingPage,
        ledgerDefaultView: ledgerView,
        density,
        soundEnabled,
      }

      const result = await updatePreferences(payload)
      if (result.error) {
        notifications.showError({
          title: "Failed to Update Preferences",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Preferences Saved",
          description: "Your personalized administrative portal workflow has been updated.",
        })
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to update preferences.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Default Landing Page Preference */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/15 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <Label htmlFor="landing-page-select" className="text-sm font-semibold text-foreground">
              Default Landing Page
            </Label>
            <p className="text-xs text-muted-foreground">
              Choose which operational console opens immediately upon signing in to the administration portal.
            </p>
          </div>
        </div>

        <div className="max-w-md pt-1">
          <Select value={landingPage} onValueChange={setLandingPage}>
            <SelectTrigger
              id="landing-page-select"
              className="h-10 text-xs bg-background border-border/80 shadow-2xs cursor-pointer"
            >
              <SelectValue placeholder="Select default console" />
            </SelectTrigger>
            <SelectContent>
              {LANDING_PAGES.map((page) => (
                <SelectItem key={page.value} value={page.value} className="text-xs py-2 cursor-pointer">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground">{page.label}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{page.value} • {page.hint}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Audit Ledger Default View & Layout Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ledger View Mode */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/15 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TableIcon className="h-4 w-4" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground">Audit Ledger Default View</Label>
              <p className="text-xs text-muted-foreground">
                Set how chronological audit records are presented.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setLedgerView("table")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1",
                ledgerView === "table"
                  ? "bg-background border-primary shadow-xs ring-1 ring-primary/40 text-foreground"
                  : "bg-background/50 border-border/70 text-muted-foreground hover:bg-background"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <TableIcon className="h-3.5 w-3.5 text-primary" />
                  Table Grid
                </span>
                {ledgerView === "table" && <Check className="h-3.5 w-3.5 text-primary" />}
              </div>
              <span className="text-[11px] text-muted-foreground leading-snug">
                Dense rows with sorting and immediate column metrics.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLedgerView("timeline")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1",
                ledgerView === "timeline"
                  ? "bg-background border-primary shadow-xs ring-1 ring-primary/40 text-foreground"
                  : "bg-background/50 border-border/70 text-muted-foreground hover:bg-background"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <LayoutList className="h-3.5 w-3.5 text-primary" />
                  Visual Timeline
                </span>
                {ledgerView === "timeline" && <Check className="h-3.5 w-3.5 text-primary" />}
              </div>
              <span className="text-[11px] text-muted-foreground leading-snug">
                Chronological cards with step-by-step metadata details.
              </span>
            </button>
          </div>
        </div>

        {/* Interface Density */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/15 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground">Workspace Density</Label>
              <p className="text-xs text-muted-foreground">
                Control spacing across data tables and action toolbars.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDensity("comfortable")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1",
                density === "comfortable"
                  ? "bg-background border-primary shadow-xs ring-1 ring-primary/40 text-foreground"
                  : "bg-background/50 border-border/70 text-muted-foreground hover:bg-background"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Maximize2 className="h-3.5 w-3.5 text-primary" />
                  Comfortable
                </span>
                {density === "comfortable" && <Check className="h-3.5 w-3.5 text-primary" />}
              </div>
              <span className="text-[11px] text-muted-foreground leading-snug">
                Spacious touch-friendly spacing and expanded rows.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1",
                density === "compact"
                  ? "bg-background border-primary shadow-xs ring-1 ring-primary/40 text-foreground"
                  : "bg-background/50 border-border/70 text-muted-foreground hover:bg-background"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Minimize2 className="h-3.5 w-3.5 text-primary" />
                  Compact
                </span>
                {density === "compact" && <Check className="h-3.5 w-3.5 text-primary" />}
              </div>
              <span className="text-[11px] text-muted-foreground leading-snug">
                Streamlined information-dense layouts for power users.
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Audio Chimes & Notification Audio */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-muted/15 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="sound-toggle" className="text-sm font-semibold text-foreground cursor-pointer">
                Action Chimes & Notification Sound
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                Play subtle auditory chimes when critical system alerts, privileged role promotions, or export tasks conclude.
              </p>
            </div>
          </div>

          <Switch
            id="sound-toggle"
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
            className="cursor-pointer shrink-0"
          />
        </div>
      </div>

      {/* 4. Action Footer */}
      <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {isDirty ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              You have unsaved preference adjustments.
            </span>
          ) : (
            <span>Workflow preferences are synchronized with your account profile.</span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
            className="h-9 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Discard
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || isSaving}
            className="h-9 text-xs min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
