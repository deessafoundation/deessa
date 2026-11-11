"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  RotateCcw,
  Loader2,
  ExternalLink,
  Share2,
} from "lucide-react"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "@/components/shared/icons/social-icons"
import { notifications } from "@/lib/notifications"
import { updateSiteSetting } from "@/lib/actions/admin-settings"

interface GeneralSectionProps {
  initialGeneral?: Record<string, string>
  initialContact?: Record<string, string>
  initialSocial?: Record<string, string>
}

export function GeneralSection({
  initialGeneral = {},
  initialContact = {},
  initialSocial = {},
}: GeneralSectionProps) {
  const router = useRouter()

  const [general, setGeneral] = useState({
    siteName: initialGeneral.siteName || "deessa Foundation",
    tagline: initialGeneral.tagline || "",
    description: initialGeneral.description || "",
    siteUrl: initialGeneral.siteUrl || "",
  })

  const [contact, setContact] = useState({
    email: initialContact.email || "",
    phone: initialContact.phone || "",
    alternatePhone: initialContact.alternatePhone || "",
    address: initialContact.address || "",
    hours: initialContact.hours || "",
    googleMapsUrl: initialContact.googleMapsUrl || "",
  })

  const [social, setSocial] = useState({
    facebook: initialSocial.facebook || "",
    twitter: initialSocial.twitter || "",
    instagram: initialSocial.instagram || "",
    linkedin: initialSocial.linkedin || "",
    youtube: initialSocial.youtube || "",
    github: initialSocial.github || "",
  })

  const [isSaving, setIsSaving] = useState(false)

  // Dirty state tracking
  const isGeneralDirty =
    general.siteName !== (initialGeneral.siteName || "deessa Foundation") ||
    general.tagline !== (initialGeneral.tagline || "") ||
    general.description !== (initialGeneral.description || "") ||
    general.siteUrl !== (initialGeneral.siteUrl || "")

  const isContactDirty =
    contact.email !== (initialContact.email || "") ||
    contact.phone !== (initialContact.phone || "") ||
    contact.alternatePhone !== (initialContact.alternatePhone || "") ||
    contact.address !== (initialContact.address || "") ||
    contact.hours !== (initialContact.hours || "") ||
    contact.googleMapsUrl !== (initialContact.googleMapsUrl || "")

  const isSocialDirty =
    social.facebook !== (initialSocial.facebook || "") ||
    social.twitter !== (initialSocial.twitter || "") ||
    social.instagram !== (initialSocial.instagram || "") ||
    social.linkedin !== (initialSocial.linkedin || "") ||
    social.youtube !== (initialSocial.youtube || "") ||
    social.github !== (initialSocial.github || "")

  const isAnyDirty = isGeneralDirty || isContactDirty || isSocialDirty

  const handleReset = () => {
    setGeneral({
      siteName: initialGeneral.siteName || "deessa Foundation",
      tagline: initialGeneral.tagline || "",
      description: initialGeneral.description || "",
      siteUrl: initialGeneral.siteUrl || "",
    })
    setContact({
      email: initialContact.email || "",
      phone: initialContact.phone || "",
      alternatePhone: initialContact.alternatePhone || "",
      address: initialContact.address || "",
      hours: initialContact.hours || "",
      googleMapsUrl: initialContact.googleMapsUrl || "",
    })
    setSocial({
      facebook: initialSocial.facebook || "",
      twitter: initialSocial.twitter || "",
      instagram: initialSocial.instagram || "",
      linkedin: initialSocial.linkedin || "",
      youtube: initialSocial.youtube || "",
      github: initialSocial.github || "",
    })
  }

  const handleSaveAll = async () => {
    setIsSaving(true)

    try {
      // Parallel saves with Zod validation via updateSiteSetting
      const updates = []

      if (isGeneralDirty) {
        updates.push(updateSiteSetting("general", general))
      }
      if (isContactDirty) {
        updates.push(updateSiteSetting("contact", contact))
      }
      if (isSocialDirty) {
        updates.push(updateSiteSetting("social", social))
      }

      const results = await Promise.all(updates)
      const failed = results.find((r) => r && "error" in r && r.error)

      if (failed && "error" in failed) {
        notifications.showError({
          title: "Save Failed",
          description: failed.error,
        })
      } else {
        notifications.showSuccess({
          title: "Settings Saved",
          description: "General identity, contact, and social settings have been updated.",
        })
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to save settings.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Site Identity */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Site Identity & Metadata</CardTitle>
              <CardDescription>Primary organization title, mission tagline, and site URL</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName" className="font-semibold text-sm">
                Organization / Site Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="siteName"
                value={general.siteName}
                onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                placeholder="deessa Foundation"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Used in page headers, titles, and automated emails</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteUrl" className="font-semibold text-sm">
                Production Website URL
              </Label>
              <Input
                id="siteUrl"
                type="url"
                value={general.siteUrl}
                onChange={(e) => setGeneral({ ...general, siteUrl: e.target.value })}
                placeholder="https://deessa.org"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Canonical base domain used for links and sitemaps</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline" className="font-semibold text-sm">
              Tagline / Headline
            </Label>
            <Input
              id="tagline"
              value={general.tagline}
              onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
              placeholder="Empowering communities, transforming lives"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Short brand slogan displayed under headers and in previews</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold text-sm">
              Global Site Description
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={general.description}
              onChange={(e) => setGeneral({ ...general, description: e.target.value })}
              placeholder="A registered non-profit organization dedicated to healthcare, education, and women empowerment..."
            />
            <p className="text-xs text-muted-foreground">Default summary used for SEO meta tags and social shares</p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Official Contact Information */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Official Contact & Office Information</CardTitle>
              <CardDescription>Public contact details displayed across the footer, contact page, and receipts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="font-semibold text-sm flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Primary Support Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="contact@deessa.org"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Public inbox for general inquiries and visitor questions</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="font-semibold text-sm flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Primary Phone Number
              </Label>
              <Input
                id="contactPhone"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="+977 1-4567890"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Direct helpline displayed in website footer</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="alternatePhone" className="font-semibold text-sm">
                Alternate / Mobile Helpline
              </Label>
              <Input
                id="alternatePhone"
                value={contact.alternatePhone}
                onChange={(e) => setContact({ ...contact, alternatePhone: e.target.value })}
                placeholder="+977 9801234567"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Secondary helpline or mobile contact</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours" className="font-semibold text-sm flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Operating Hours
              </Label>
              <Input
                id="hours"
                value={contact.hours}
                onChange={(e) => setContact({ ...contact, hours: e.target.value })}
                placeholder="Sunday - Friday: 9:00 AM - 5:00 PM"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Office visitation and helpline availability</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="font-semibold text-sm flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Physical Office Address
            </Label>
            <Input
              id="address"
              value={contact.address}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              placeholder="Kathmandu, Bagmati Province, Nepal"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Official headquarters address shown in footer and contact page</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleMapsUrl" className="font-semibold text-sm flex items-center gap-1.5">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              Google Maps Location Link
            </Label>
            <Input
              id="googleMapsUrl"
              type="url"
              value={contact.googleMapsUrl}
              onChange={(e) => setContact({ ...contact, googleMapsUrl: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Used for the &ldquo;Get Directions&rdquo; link on the contact page</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Social Media Channels */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Social Media Profiles</CardTitle>
              <CardDescription>Social links rendered in footer navigation, header drawer, and author profiles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebook" className="font-semibold text-sm flex items-center gap-2">
                <Facebook className="h-4 w-4 text-[#1877F2]" />
                Facebook Page
              </Label>
              <Input
                id="facebook"
                type="url"
                value={social.facebook}
                onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                placeholder="https://facebook.com/deessafoundation"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="font-semibold text-sm flex items-center gap-2">
                <Twitter className="h-4 w-4 text-foreground" />
                X / Twitter Profile
              </Label>
              <Input
                id="twitter"
                type="url"
                value={social.twitter}
                onChange={(e) => setSocial({ ...social, twitter: e.target.value })}
                placeholder="https://twitter.com/deessanepal"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="font-semibold text-sm flex items-center gap-2">
                <Instagram className="h-4 w-4 text-[#E4405F]" />
                Instagram Handle
              </Label>
              <Input
                id="instagram"
                type="url"
                value={social.instagram}
                onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                placeholder="https://instagram.com/deessafoundation"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="font-semibold text-sm flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                LinkedIn Organization
              </Label>
              <Input
                id="linkedin"
                type="url"
                value={social.linkedin}
                onChange={(e) => setSocial({ ...social, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/deessa-foundation"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube" className="font-semibold text-sm flex items-center gap-2">
                <Youtube className="h-4 w-4 text-[#FF0000]" />
                YouTube Channel
              </Label>
              <Input
                id="youtube"
                type="url"
                value={social.youtube}
                onChange={(e) => setSocial({ ...social, youtube: e.target.value })}
                placeholder="https://youtube.com/@deessafoundation"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github" className="font-semibold text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-foreground" />
                GitHub / Open Source
              </Label>
              <Input
                id="github"
                type="url"
                value={social.github}
                onChange={(e) => setSocial({ ...social, github: e.target.value })}
                placeholder="https://github.com/deessa-foundation"
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating or Docked Action Bar */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm">
        <div className="text-sm text-muted-foreground">
          {isAnyDirty ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              You have unsaved changes in general settings.
            </span>
          ) : (
            <span>All general settings are up-to-date.</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!isAnyDirty || isSaving}
            className="h-10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Discard
          </Button>
          <Button
            type="button"
            onClick={handleSaveAll}
            disabled={!isAnyDirty || isSaving}
            className="h-10 min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
