"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FancySelect } from "@/components/ui/fancy-select"
import { Loader2, AlertCircle } from "lucide-react"
import { createPartner, updatePartner } from "@/lib/actions/admin-partners"
import { FileUpload } from "@/components/admin/media/file-upload"
import type { Partner } from "@/lib/types/admin"
import { cn } from "@/lib/utils"
import styles from "./partners-manager.module.css"

interface PartnerFormProps {
  partner?: Partner
  onSaved?: (warning?: string) => void
  onCancel?: () => void
  onBusyChange?: (busy: boolean) => void
  onDirtyChange?: (dirty: boolean) => void
}

export function PartnerForm({ partner, onSaved, onCancel, onBusyChange, onDirtyChange }: PartnerFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState(partner?.type || "partner")
  const [logoUrl, setLogoUrl] = useState(partner?.logo || "")
  const router = useRouter()
  const submitting = useRef(false)
  const uploading = useRef(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    if (submitting.current || uploading.current || uploadError) return
    submitting.current = true
    setIsLoading(true)
    onBusyChange?.(true)
    setError(null)

    formData.set("type", type)
    try {
      const result = partner ? await updatePartner(partner.id, formData) : await createPartner(formData)
      if (result.error) {
        setError(result.error)
        return
      }
      if (!result.success) throw new Error("The save could not be confirmed. Please try again.")
      if (onSaved) onSaved(result.warning)
      else {
        router.push("/admin/about?tab=partners")
        router.refresh()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save the partner. Your edits are still here.")
    } finally {
      submitting.current = false
      setIsLoading(false)
      onBusyChange?.(false)
    }
  }

  return (
    <form onChange={() => onDirtyChange?.(true)} onSubmit={(event) => { event.preventDefault(); void handleSubmit(new FormData(event.currentTarget)) }} className={cn(styles.surface, "space-y-6")}>
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <fieldset disabled={isLoading} className="grid min-w-0 gap-6 lg:grid-cols-3">
        <legend className="sr-only">Partner details</legend>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Partner Name *</Label>
                  <Input id="name" name="name" defaultValue={partner?.name} required aria-required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <FancySelect
                    id="type"
                    aria-required
                    disabled={isLoading}
                    value={type}
                    onValueChange={(value) => { setType(value); onDirtyChange?.(true) }}
                    placeholder="Select type"
                    options={[
                      { value: "partner", label: "Partner" },
                      { value: "donor", label: "Donor" },
                      { value: "sponsor", label: "Sponsor" },
                    ]}
                    size="sm"
                    className="min-h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={partner?.description || ""}
                  rows={3}
                  maxLength={10000}
                  placeholder="Brief description of the partnership..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <FileUpload
                    bucket="partner-logos"
                    currentUrl={logoUrl}
                    onUpload={(url) => { setLogoUrl(url); onDirtyChange?.(true) }}
                    disabled={isLoading}
                    onBusyChange={(value) => { uploading.current = value; setIsUploading(value); onBusyChange?.(value) }}
                    onErrorChange={setUploadError}
                    label="Partner Logo"
                    maxSizeMB={2}
                    allowUrl={true}
                  />
                  <input type="hidden" name="logo" value={logoUrl} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    defaultValue={partner?.website || ""}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Show on Website</Label>
                <Switch
                  id="isPublished"
                  name="isPublished"
                  defaultChecked={partner?.is_published ?? true}
                  value="true"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Published records are available to partner displays. The About page's category tiles are edited separately.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="min-h-11 flex-1 bg-transparent" onClick={() => onCancel ? onCancel() : router.back()} disabled={isLoading || isUploading}>
              Cancel
            </Button>
            <Button type="submit" data-contrast="filled" className="min-h-11 flex-1" disabled={isLoading || isUploading || !!uploadError}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {partner ? "Save Changes" : "Add Partner"}
            </Button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
