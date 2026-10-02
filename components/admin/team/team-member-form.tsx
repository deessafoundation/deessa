"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Globe, MessageCircle, Link as LinkIcon } from "lucide-react"
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/lib/actions/admin-team"
import { notifications } from "@/lib/notifications"
import { FileUpload } from "@/components/admin/file-upload"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import type { TeamMember } from "@/lib/types/admin"

interface TeamMemberFormProps {
  member?: TeamMember
}

export function TeamMemberForm({ member }: TeamMemberFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(member?.image || "")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = member ? await updateTeamMember(member.id, formData) : await createTeamMember(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (member) {
      notifications.showSuccess({ description: "Member updated." })
      router.refresh()
      setIsLoading(false)
    } else {
      notifications.showSuccess({ description: "Member created." })
      router.push("/admin/team")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" defaultValue={member?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Position *</Label>
                  <Input id="role" name="role" defaultValue={member?.role} placeholder="Executive Director" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={member?.bio || ""}
                  rows={3}
                  maxLength={150}
                  placeholder="Brief biography (max 150 characters)..."
                />
                <p className="text-xs text-muted-foreground">Shown on hover over team photo. Keep it short — 150 characters max.</p>
              </div>

              <FileUpload
                bucket="team-photos"
                currentUrl={imageUrl}
                onUpload={setImageUrl}
                label="Team Member Photo"
                maxSizeMB={5}
                allowUrl={true}
              />
              <input type="hidden" name="image" value={imageUrl} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={member?.email || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={member?.phone || ""} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <span className="size-4 text-blue-600 font-bold">f</span>
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    type="url"
                    placeholder="https://facebook.com/username"
                    defaultValue={member?.social_links?.facebook || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <span className="size-4 text-sky-500 font-bold">X</span>
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    type="url"
                    placeholder="https://x.com/username"
                    defaultValue={member?.social_links?.twitter || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <span className="size-4 text-blue-700 font-bold">in</span>
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    defaultValue={member?.social_links?.linkedin || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <span className="size-4 text-pink-600 font-bold">IG</span>
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    type="url"
                    placeholder="https://instagram.com/username"
                    defaultValue={member?.social_links?.instagram || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="flex items-center gap-2">
                    <Globe className="size-4 text-gray-800" />
                    TikTok
                  </Label>
                  <Input
                    id="tiktok"
                    name="tiktok"
                    type="url"
                    placeholder="https://tiktok.com/@username"
                    defaultValue={member?.social_links?.tiktok || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <MessageCircle className="size-4 text-green-600" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="url"
                    placeholder="https://wa.me/1234567890"
                    defaultValue={member?.social_links?.whatsapp || ""}
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
                  defaultChecked={member?.is_published ?? true}
                  value="true"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, this team member will be visible on the public About page.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            {member && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {member ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Team Member"
        description={`Are you sure you want to delete ${member?.name ?? "this member"}? This action cannot be undone.`}
        loading={deleteLoading}
        onConfirm={async () => {
          if (!member) return
          setDeleteLoading(true)
          const result = await deleteTeamMember(member.id)
          if (result.error) {
            notifications.showError({ description: result.error })
            setDeleteLoading(false)
          } else {
            notifications.showSuccess({ description: "Member deleted." })
            router.push("/admin/team")
          }
        }}
      />
    </form>
  )
}
