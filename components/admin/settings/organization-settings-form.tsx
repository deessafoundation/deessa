"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Building2,
  Save,
  RotateCcw,
  ShieldCheck,
  Receipt,
  Eye,
  PenTool,
} from "lucide-react"
import { FileUpload } from "@/components/admin/media/file-upload"
import { notifications } from "@/lib/notifications"
import { updateSiteSetting } from "@/lib/actions/admin-settings"

export interface OrganizationDetails {
  name: string
  vat_registration_number: string
  pan_number: string
  swc_registration_number: string
  ird_exemption_number: string
  address: string
  phone: string
  email: string
  website: string
  logo_url: string
  receipt_prefix: string
  receipt_number_start: number
  authorized_signatory_name: string
  authorized_signatory_designation: string
  stamp_url: string
  signature_url: string
}

interface OrganizationSettingsFormProps {
  initialData?: OrganizationDetails
}

const DEFAULT_DETAILS: OrganizationDetails = {
  name: "deessa Foundation",
  vat_registration_number: "",
  pan_number: "",
  swc_registration_number: "",
  ird_exemption_number: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  logo_url: "",
  receipt_prefix: "DF",
  receipt_number_start: 1001,
  authorized_signatory_name: "",
  authorized_signatory_designation: "",
  stamp_url: "",
  signature_url: "",
}

export function OrganizationSettingsForm({ initialData }: OrganizationSettingsFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const baselineData = initialData || DEFAULT_DETAILS
  const [formData, setFormData] = useState<OrganizationDetails>(baselineData)

  const isDirty = JSON.stringify(formData) !== JSON.stringify(baselineData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "receipt_number_start" ? (value === "" ? 1 : parseInt(value, 10)) : value,
    }))
  }

  const handleReset = () => {
    setFormData(baselineData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateSiteSetting(
        "organization_details",
        formData as unknown as Record<string, unknown>
      )

      if (result?.error) {
        notifications.showError({
          title: "Save Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Organization Details Saved",
          description: "Legal entity information and receipt configuration updated successfully.",
        })
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to update organization settings.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const sampleReceiptNo = `${formData.receipt_prefix || "DF"}-${currentYear}-${String(
    formData.receipt_number_start || 1
  ).padStart(4, "0")}`

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Legal Entity Identification */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Building2 className="h-4 w-4 text-primary" />
          <span>Legal Entity Identification</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="font-semibold text-sm">
            Official Non-Profit Entity Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="deessa Foundation"
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            Must match your registered tax exemption certificate and government charter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-sm">Official Invoicing Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="finance@deessa.org"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-semibold text-sm">Official Helpline Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="+977 1-4567890"
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="font-semibold text-sm">Registered Office Address</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="Ward No. 3, Maharajgunj, Kathmandu, Nepal"
            rows={2}
          />
        </div>
      </div>

      <Separator />

      {/* 2. Tax & Government Registration Numbers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span>Tax & Government Registration Credentials</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pan_number" className="font-semibold text-sm">PAN Number</Label>
            <Input
              id="pan_number"
              name="pan_number"
              value={formData.pan_number}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. 610123456"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Permanent Account Number issued by Inland Revenue Dept</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat_registration_number" className="font-semibold text-sm">VAT Number (Optional)</Label>
            <Input
              id="vat_registration_number"
              name="vat_registration_number"
              value={formData.vat_registration_number}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. 610123456789"
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="swc_registration_number" className="font-semibold text-sm">Social Welfare Council (SWC) ID</Label>
            <Input
              id="swc_registration_number"
              name="swc_registration_number"
              value={formData.swc_registration_number}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. SWC-49210"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Required for NGO compliance and non-profit accreditation</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ird_exemption_number" className="font-semibold text-sm">IRD Tax Exemption Certificate No.</Label>
            <Input
              id="ird_exemption_number"
              name="ird_exemption_number"
              value={formData.ird_exemption_number}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. IRD-EX-2080-81"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Printed on receipts under Section 12, Income Tax Act 2058</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 3. Automated Receipt Engine Numbering */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Receipt Generator Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="receipt_prefix" className="font-semibold text-sm">Receipt Prefix Code</Label>
            <Input
              id="receipt_prefix"
              name="receipt_prefix"
              value={formData.receipt_prefix}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="DF"
              maxLength={10}
              className="h-10 uppercase font-mono"
            />
            <p className="text-xs text-muted-foreground">Alphanumeric prefix (e.g. DF, RCP, DON)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt_number_start" className="font-semibold text-sm">Starting Number Sequence</Label>
            <Input
              id="receipt_number_start"
              name="receipt_number_start"
              type="number"
              value={formData.receipt_number_start}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="1001"
              min={1}
              className="h-10 font-mono"
            />
            <p className="text-xs text-muted-foreground">Next issued receipt will start at this sequence</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 4. Authorized Signatory & Official Seals */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <PenTool className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span>Authorized Signatory & Digital Seals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="authorized_signatory_name" className="font-semibold text-sm">Signatory Full Name</Label>
            <Input
              id="authorized_signatory_name"
              name="authorized_signatory_name"
              value={formData.authorized_signatory_name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Ramesh Shrestha"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorized_signatory_designation" className="font-semibold text-sm">Signatory Designation / Title</Label>
            <Input
              id="authorized_signatory_designation"
              name="authorized_signatory_designation"
              value={formData.authorized_signatory_designation}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Executive Director / Treasurer"
              className="h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Digital Signature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">Authorized Signature Image</Label>
              <Badge variant="outline" className="text-[10px]">Transparent PNG • 160×60px</Badge>
            </div>
            <FileUpload
              bucket="site-assets"
              currentUrl={formData.signature_url}
              onUpload={(url) => setFormData((prev) => ({ ...prev, signature_url: url }))}
              label="Upload Signature PNG"
              maxSizeMB={2}
            />
            <p className="text-xs text-muted-foreground">
              Digitally affixed above the signatory name in generated PDF receipts.
            </p>
          </div>

          {/* Official Stamp */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">Official Organization Stamp</Label>
              <Badge variant="outline" className="text-[10px]">Round/Square PNG • 100×100px</Badge>
            </div>
            <FileUpload
              bucket="site-assets"
              currentUrl={formData.stamp_url}
              onUpload={(url) => setFormData((prev) => ({ ...prev, stamp_url: url }))}
              label="Upload Organization Stamp"
              maxSizeMB={2}
            />
            <p className="text-xs text-muted-foreground">
              Official circular non-profit seal stamped over the receipt footer.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Live Computerized Receipt Simulator */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
            <Eye className="h-4 w-4 text-muted-foreground" />
            Live Generated Receipt Simulator
          </Label>
          <Badge variant="secondary" className="text-[11px] font-mono">
            {sampleReceiptNo}
          </Badge>
        </div>

        <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 space-y-4 max-w-2xl mx-auto shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4">
            <div>
              <h4 className="font-bold text-base text-foreground">{formData.name || "deessa Foundation"}</h4>
              <p className="text-xs text-muted-foreground">{formData.address || "Kathmandu, Nepal"}</p>
              <p className="text-[11px] text-muted-foreground">
                PAN: <span className="font-mono font-semibold">{formData.pan_number || "XXXXXXXXX"}</span>
                {formData.swc_registration_number ? ` • SWC: ${formData.swc_registration_number}` : ""}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Official Receipt
              </span>
              <span className="font-mono text-xs font-bold text-primary">{sampleReceiptNo}</span>
            </div>
          </div>

          {/* Sample Line items */}
          <div className="py-2 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Contribution: Child Healthcare Fund</span>
              <span className="font-mono font-semibold text-foreground">NPR 10,000.00</span>
            </div>
            {formData.ird_exemption_number && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Tax Exempt under Section 12, Income Tax Act (Exemption #{formData.ird_exemption_number})
              </p>
            )}
          </div>

          {/* Signatory & Stamp Footer */}
          <div className="border-t pt-4 flex items-end justify-between">
            {/* Signature Area */}
            <div className="space-y-1">
              {formData.signature_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.signature_url}
                  alt="Signatory Signature"
                  className="h-10 w-auto object-contain max-w-[120px]"
                />
              ) : (
                <div className="h-8 w-24 border-b border-muted-foreground/30 flex items-center justify-center text-[10px] text-muted-foreground italic">
                  [Signatory Signature]
                </div>
              )}
              <p className="text-xs font-bold text-foreground">
                {formData.authorized_signatory_name || "Authorized Signatory"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formData.authorized_signatory_designation || "Executive Director"}
              </p>
            </div>

            {/* Stamp Area */}
            <div>
              {formData.stamp_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.stamp_url}
                  alt="Official Stamp"
                  className="h-16 w-16 object-contain rounded-full opacity-85 rotate-[-6deg]"
                />
              ) : (
                <div className="h-14 w-14 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-[9px] text-muted-foreground text-center p-1 uppercase">
                  Seal / Stamp
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm sticky bottom-4 z-10">
        <div className="text-sm text-muted-foreground">
          {isDirty ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              You have unsaved changes in organization details.
            </span>
          ) : (
            <span>All organization and legal details are saved.</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || isSubmitting}
            className="h-10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Discard
          </Button>
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="h-10 min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Organization
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
