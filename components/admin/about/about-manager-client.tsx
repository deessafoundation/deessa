"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { notifications } from "@/lib/notifications"
import { Save, RotateCcw, Eye, Users, Heart, Footprints, Building, Network, HandHeart, Settings } from "lucide-react"
import { aboutPageSettingsSchema, type AboutPageSettings } from "@/lib/types/about-settings"
import type { Partner } from "@/lib/types/admin"
import { PartnersManager } from "@/components/admin/partners/partners-manager"
import { useUnsavedChanges } from "@/components/admin/common/admin-navigation-guard"
import { AboutSectionEditor, type AboutSection } from "./about-section-editor"
import { aboutFieldId } from "./content-fields"
import { cn } from "@/lib/utils"
import styles from "./about-manager-client.module.css"

interface AboutManagerClientProps {
  initialSettings: AboutPageSettings
  userId: string
  canEditPage: boolean
  canManagePartners: boolean
  initialTab: string
  initialPartners: Partner[] | null
  partnersError?: string
  initialPartner?: string
  pageLoadError?: string
}
const contentTabs = [
  { value: "hero", label: "Hero", icon: Users },
  { value: "intro", label: "Who We Are", icon: Heart },
  { value: "howWeDoIt", label: "How We Do It", icon: Footprints },
  { value: "governance", label: "Governance", icon: Network },
  { value: "people", label: "Our People", icon: Users },
  { value: "partners", label: "Partners", icon: Building },
  { value: "getInvolved", label: "Get Involved", icon: HandHeart },
  { value: "pageSettings", label: "Page settings", icon: Settings },
]
function ownerTab(path: string) {
  const section = path.split(".")[0]
  if (path === "intro.sinceBadge") return "pageSettings"
  return section === "partnerSection" ? "partners" : ["seo", "visibility", "journey"].includes(section) ? "pageSettings" : section
}

export default function AboutManagerClient({
  initialSettings, canEditPage, canManagePartners, initialTab, initialPartners, partnersError, initialPartner, pageLoadError,
}: AboutManagerClientProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [saved, setSaved] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [active, setActive] = useState(initialTab)
  const [partnerView, setPartnerView] = useState(canEditPage && !pageLoadError && !initialPartner ? "content" : "records")
  const [discardVersion, setDiscardVersion] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusPath, setFocusPath] = useState("")
  const [status, setStatus] = useState("")
  const [uploads, setUploads] = useState<Record<string, boolean>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string | null>>({})
  const saving = useRef(false)
  const settingsRef = useRef(settings)
  const previousInitial = useRef(initialSettings)
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(saved)
  const mediaBusy = Object.values(uploads).some(Boolean)
  const mediaInvalid = Object.values(uploadErrors).some(Boolean)
  useUnsavedChanges(hasChanges, isSaving || mediaBusy)
  const tabs = canEditPage ? contentTabs : contentTabs.filter(tab => tab.value === "partners")

  useEffect(() => { setActive(initialTab) }, [initialTab])
  useEffect(() => { if (initialPartner) setPartnerView("records") }, [initialPartner])
  useEffect(() => { if (pageLoadError && canManagePartners) setPartnerView("records") }, [pageLoadError, canManagePartners])
  useEffect(() => {
    if (previousInitial.current === initialSettings) return
    previousInitial.current = initialSettings
    if (!hasChanges && !saving.current && !pageLoadError && !mediaBusy) {
      settingsRef.current = initialSettings
      setSettings(initialSettings)
      setSaved(initialSettings)
    }
  }, [initialSettings, hasChanges, pageLoadError, mediaBusy])
  useEffect(() => {
    if (!focusPath) return
    let secondFrame = 0
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const field = document.getElementById(aboutFieldId(focusPath))
        let ancestor = field?.parentElement
        while (ancestor) { if (ancestor instanceof HTMLDetailsElement) ancestor.open = true; ancestor = ancestor.parentElement }
        if (field) field.focus()
        else document.getElementById("about-errors")?.focus()
      })
    })
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame) }
  }, [focusPath, active])

  function validation(next: AboutPageSettings) {
    const parsed = aboutPageSettingsSchema.safeParse(next)
    return parsed.success ? {} : Object.fromEntries(parsed.error.issues.map(issue => [issue.path.map(String).join("."), issue.message]))
  }
  const update = useCallback((updater: (previous: AboutPageSettings) => AboutPageSettings) => {
    if (saving.current || !canEditPage || pageLoadError) return
    const next = updater(settingsRef.current)
    settingsRef.current = next
    setSettings(next)
    setFocusPath("")
    setStatus("")
    setErrors(previous => Object.keys(previous).length ? validation(next) : previous)
  }, [canEditPage, pageLoadError])
  const uploadBusy = useCallback((key: string, busy: boolean) => setUploads(previous => ({ ...previous, [key]: busy })), [])
  const uploadError = useCallback((key: string, error: string | null) => setUploadErrors(previous => ({ ...previous, [key]: error })), [])

  function showErrors(issues: { path: (string | number)[]; message: string }[]) {
    const next = Object.fromEntries(issues.map(issue => [issue.path.map(String).join("."), issue.message]))
    setErrors(next)
    const first = issues[0]?.path.map(String).join(".") || ""
    setFocusPath(first)
    setActive(ownerTab(first))
    if (ownerTab(first) === "partners") setPartnerView("content")
  }
  async function save() {
    if (saving.current || !hasChanges || !canEditPage || pageLoadError || mediaBusy || mediaInvalid) return
    const parsed = aboutPageSettingsSchema.safeParse(settingsRef.current)
    if (!parsed.success) { showErrors(parsed.error.issues.map(issue => ({ path: issue.path.map(String), message: issue.message }))); return }
    saving.current = true
    setIsSaving(true)
    setStatus("")
    try {
      const response = await fetch("/api/admin/about-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: parsed.data }) })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.success !== true) {
        if (Array.isArray(result?.issues)) showErrors(result.issues)
        throw new Error(result?.error || "Save could not be confirmed. Your edits are still here.")
      }
      settingsRef.current = parsed.data
      setSettings(parsed.data)
      setSaved(parsed.data)
      setErrors({})
      setFocusPath("")
      setStatus(result.warning || "Page changes published.")
      notifications.showSuccess({ title: "Page saved", description: result.warning || "Who We Are content has been updated." })
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save page changes.")
      notifications.showError({ title: "Save not confirmed", description: "Your edits have been kept. Please try again." })
    } finally { saving.current = false; setIsSaving(false) }
  }
  function discard() {
    if (saving.current || mediaBusy) return
    settingsRef.current = saved
    setSettings(saved)
    setErrors({})
    setFocusPath("")
    setStatus("Unsaved page changes discarded.")
    setUploadErrors({})
    setDiscardVersion(value => value + 1)
  }

  return <div className={cn(styles.root, "min-w-0 space-y-6")}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Who We Are</h1>
        <p className="text-muted-foreground">{canEditPage ? "Edit sections in page order, or manage partner records." : "Manage partners, donors, and sponsors."}</p>
        {hasChanges && <Badge variant="outline">Unsaved page changes</Badge>}
      </div>
      <Button variant="outline" className="min-h-11" onClick={() => window.open("/about", "_blank", "noopener,noreferrer")} aria-label="View public page (opens in a new tab)">
        <Eye className="size-4" aria-hidden="true" /> View page
      </Button>
    </div>
    {canEditPage && !pageLoadError && (active !== "partners" || partnerView === "content") && (
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3"><Badge variant="outline">{hasChanges ? "Unsaved changes" : "Up to date"}</Badge>
          <p className="text-sm text-muted-foreground">{mediaBusy ? "Wait for the upload to finish." : "Publish updates this page's content."}</p></div>
        <div className="flex gap-2">
          <Button variant="outline" className="min-h-11" onClick={discard} disabled={(!hasChanges && !mediaInvalid) || isSaving || mediaBusy}><RotateCcw className="size-4" aria-hidden="true" /> Discard</Button>
          <Button data-contrast="filled" className="min-h-11" onClick={() => void save()} disabled={!hasChanges || isSaving || mediaBusy || mediaInvalid}><Save className="size-4" aria-hidden="true" /> {isSaving ? "Publishing…" : "Save & publish"}</Button>
        </div>
      </div>
    )}
    {!!Object.keys(errors).length && <div id="about-errors" tabIndex={-1} role="alert" className="space-y-2 rounded-xl border border-destructive bg-background p-4">
      <p className="font-medium">Correct these fields before publishing.</p>
      <ul className="list-disc space-y-1 pl-5">{Object.entries(errors).map(([path, message]) => <li key={path}><button type="button" className="min-h-11 text-left text-sm underline" onClick={() => {
        const tab = ownerTab(path)
        setActive(tab)
        if (tab === "partners") setPartnerView("content")
        setFocusPath("")
        requestAnimationFrame(() => setFocusPath(path))
      }}>{contentTabs.find(tab => tab.value === ownerTab(path))?.label || "Page settings"}: {message} <span className="sr-only">Open the affected field</span></button></li>)}</ul>
    </div>}
    {status && <p role="status" className="rounded-xl border bg-background p-4 text-sm">{status}</p>}
    {pageLoadError && <p role="alert" className="rounded-xl border border-destructive p-4 text-sm text-destructive">{pageLoadError} Page editing is disabled until saved content can be loaded.</p>}
    {mediaInvalid && <p role="alert" className="text-sm text-destructive">Resolve the media upload error before publishing, or discard the page changes.</p>}
    <fieldset disabled={isSaving || mediaBusy} className="min-w-0"><legend className="sr-only">Who We Are management</legend>
      <Tabs value={active} onValueChange={setActive} className="gap-6">
        <Card><CardContent className="overflow-x-auto p-4">
          <TabsList aria-label="Who We Are sections" className={cn(styles.track, "flex h-auto w-full min-w-max gap-1 rounded-xl p-1")}>
            {tabs.map(({ value, label, icon: Icon }) => <TabsTrigger key={value} value={value} disabled={isSaving || mediaBusy}
              className={cn(styles.tab, "h-auto min-h-11 gap-2 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-all")}
              onFocus={(event) => event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })}><Icon className="size-4" aria-hidden="true" /> {label}</TabsTrigger>)}
          </TabsList>
        </CardContent></Card>
        {canEditPage && !pageLoadError && tabs.filter(tab => tab.value !== "partners").map(tab => (
          <TabsContent key={tab.value} value={tab.value} forceMount className={cn("mt-0", active !== tab.value && "hidden")}>
            <AboutSectionEditor key={discardVersion} section={tab.value as AboutSection} settings={settings} onUpdate={update} errors={errors}
              focusPath={focusPath} onUploadBusy={uploadBusy} onUploadError={uploadError} />
          </TabsContent>
        ))}
        <TabsContent value="partners" forceMount className={cn("mt-0", active !== "partners" && "hidden")}>
          <Tabs value={partnerView} onValueChange={setPartnerView} className="gap-4">
            <TabsList className="h-auto min-h-11" aria-label="Partners management">
              {canEditPage && !pageLoadError && <TabsTrigger value="content" className="min-h-11">Section content</TabsTrigger>}
              {canManagePartners && <TabsTrigger value="records" className="min-h-11">Partner records</TabsTrigger>}
            </TabsList>
            {canEditPage && !pageLoadError && <TabsContent value="content" forceMount className={cn("mt-0", partnerView !== "content" && "hidden")}>
              <AboutSectionEditor key={discardVersion} section="partnerSection" settings={settings} onUpdate={update} errors={errors}
                focusPath={focusPath} onUploadBusy={uploadBusy} onUploadError={uploadError} />
            </TabsContent>}
            {canManagePartners && <TabsContent value="records" forceMount className={cn("mt-0", partnerView !== "records" && "hidden")}>
              <PartnersManager initialPartners={initialPartners} loadError={partnersError} initialPartner={initialPartner} />
            </TabsContent>}
          </Tabs>
        </TabsContent>
      </Tabs>
    </fieldset>
  </div>
}
