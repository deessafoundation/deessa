"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Building, Plus, Pencil, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPartners } from "@/lib/actions/admin-partners"
import type { Partner } from "@/lib/types/admin"
import { PartnerForm } from "./partner-form"
import { PartnerActions } from "./partner-actions"
import { cn } from "@/lib/utils"
import styles from "./partners-manager.module.css"
import { useUnsavedChanges } from "@/components/admin/common/admin-navigation-guard"
import { isSafeMediaUrl } from "@/lib/media-validation"

interface PartnersManagerProps {
  initialPartners: Partner[] | null
  loadError?: string
  initialPartner?: string
}

function safeUrl(value?: string, allowLocal = false) {
  if (allowLocal) return value && isSafeMediaUrl(value) ? value : undefined
  if (!value || /[\\\u0000-\u001f]/.test(value)) return undefined
  if (allowLocal && value.startsWith("/") && !value.startsWith("//")) return value
  try {
    const url = new URL(value)
    if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return url.href
  } catch { /* Invalid legacy URLs are shown without a clickable link. */ }
  return undefined
}

export function PartnersManager({ initialPartners, loadError, initialPartner }: PartnersManagerProps) {
  const router = useRouter()
  const [partners, setPartners] = useState(initialPartners)
  const [error, setError] = useState(loadError || "")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(false)
  const [editor, setEditor] = useState<Partner | "new" | null>(null)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const refreshing = useRef(false)
  const returnFocus = useRef<HTMLButtonElement | null>(null)
  const addButton = useRef<HTMLButtonElement>(null)
  const handledPartner = useRef<string | undefined>(undefined)
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty, busy)

  useEffect(() => {
    if (initialPartners !== null) setPartners(initialPartners)
  }, [initialPartners])

  useEffect(() => {
    if (!initialPartner) { handledPartner.current = undefined; return }
    if (handledPartner.current === initialPartner) return
    if (initialPartner === "new") {
      handledPartner.current = initialPartner
      setEditor("new")
    }
    else {
      const records = initialPartners ?? partners
      if (!records) return
      handledPartner.current = initialPartner
      const partner = records.find((item) => item.id === initialPartner)
      if (partner) setEditor(partner)
      else setError("This partner could not be found. Choose a partner from the list below.")
    }
  }, [initialPartner, initialPartners, partners])

  async function refresh() {
    if (refreshing.current) return
    refreshing.current = true
    setLoading(true)
    setError("")
    try {
      setPartners(await getPartners())
    } catch {
      setError("Could not load the latest partners. Please try again.")
    } finally {
      refreshing.current = false
      setLoading(false)
    }
  }

  function closeEditor() {
    if (busyRef.current) return
    if (dirty && !window.confirm("Discard the unsaved partner changes?")) return
    setDirty(false)
    setEditor(null)
    if (initialPartner) router.replace("/admin/about?tab=partners", { scroll: false })
  }

  function saved(warning?: string) {
    // The database write has succeeded; a list refresh must not be reported as a failed save.
    setNotice(warning || "Partner saved.")
    setDirty(false)
    setEditor(null)
    if (initialPartner) router.replace("/admin/about?tab=partners", { scroll: false })
    void refresh()
  }

  return (
    <section className={cn(styles.surface, "min-w-0 space-y-4")} aria-labelledby="partners-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 id="partners-heading" className="text-xl font-semibold">Partners & Sponsors</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">Manage partners, donors, and sponsors here. Save each partner in its form; page content is saved separately.</p>
          <p className="max-w-2xl text-sm text-muted-foreground">The Who We Are page currently displays partner categories. These records do not replace those category tiles.</p>
        </div>
        <Button ref={addButton} className="min-h-11" data-contrast="filled" disabled={loading} onClick={(event) => { returnFocus.current = event.currentTarget; setEditor("new"); setNotice("") }}>
          <Plus className="size-4" aria-hidden="true" /> Add partner
        </Button>
      </div>
      {notice && <p role="status" className="rounded-lg border bg-background p-3 text-sm">{notice}</p>}
      {error && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive bg-background p-3">
        <p className="flex-1 text-sm text-destructive">{error}</p>
        <Button variant="outline" className="min-h-11" disabled={loading} onClick={() => void refresh()}>{loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}Retry</Button>
      </div>}
      <Card aria-busy={loading}>
        <CardContent className="p-0">
          {partners && partners.length > 0 ? (
            <Table aria-label="Partners, donors, and sponsors">
              <TableHeader><TableRow>
                <TableHead>Partner</TableHead><TableHead>Type</TableHead><TableHead>Website</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>{partners.map((partner) => {
                const website = safeUrl(partner.website)
                const logo = safeUrl(partner.logo, true)
                return <TableRow key={partner.id}>
                  <TableCell><div className="flex min-w-52 items-center gap-3">
                    {logo ? <img src={logo} alt="" className="size-12 shrink-0 rounded-lg border bg-background object-contain p-1" /> : <Building className="size-8 shrink-0 text-muted-foreground" aria-hidden="true" />}
                    <div><p className="font-medium">{partner.name}</p>{partner.description && <p className="max-w-sm whitespace-normal text-sm text-muted-foreground">{partner.description}</p>}</div>
                  </div></TableCell>
                  <TableCell className="capitalize">{partner.type}</TableCell>
                  <TableCell>{website ? <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Visit ${partner.name} website (opens in a new tab)`}>Visit website<ExternalLink className="size-4" aria-hidden="true" /></a> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell><Badge variant={partner.is_published ? "default" : "secondary"}>{partner.is_published ? "Published" : "Hidden"}</Badge></TableCell>
                  <TableCell><div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="size-11" aria-label={`Edit ${partner.name}`} disabled={loading} onClick={(event) => { returnFocus.current = event.currentTarget; setEditor(partner); setNotice("") }}><Pencil className="size-4" aria-hidden="true" /></Button>
                    <PartnerActions partnerId={partner.id} partnerName={partner.name} onDeleted={(warning) => { setNotice(warning || "Partner deleted."); void refresh() }} />
                  </div></TableCell>
                </TableRow>
              })}</TableBody>
            </Table>
          ) : partners && !error ? <div className="space-y-2 p-8 text-center"><Building className="mx-auto size-8 text-muted-foreground" aria-hidden="true" /><p className="font-medium">No partners yet</p><p className="text-sm text-muted-foreground">Add your first partner, donor, or sponsor.</p></div> : <p className="p-6 text-sm text-muted-foreground">{loading ? "Loading partners…" : "Partners are unavailable until the list can be loaded."}</p>}
        </CardContent>
      </Card>
      <Dialog open={editor !== null} onOpenChange={(open) => { if (!open) closeEditor() }}>
        <DialogContent className={cn(styles.surface, "max-h-[85dvh] overflow-y-auto sm:max-w-4xl [&>[data-slot=dialog-close]]:size-11")} showCloseButton={!busy} onInteractOutside={(event) => event.preventDefault()} onEscapeKeyDown={(event) => { if (busyRef.current) event.preventDefault() }} onCloseAutoFocus={(event) => { event.preventDefault(); (returnFocus.current || addButton.current)?.focus() }}>
          <DialogHeader><DialogTitle>{editor === "new" ? "Add partner" : "Edit partner"}</DialogTitle><DialogDescription>Update the partner details and publishing status.</DialogDescription></DialogHeader>
          {editor && <PartnerForm key={editor === "new" ? "new" : editor.id} partner={editor === "new" ? undefined : editor} onDirtyChange={setDirty} onSaved={saved} onCancel={closeEditor} onBusyChange={(value) => { busyRef.current = value; setBusy(value) }} />}
        </DialogContent>
      </Dialog>
    </section>
  )
}
