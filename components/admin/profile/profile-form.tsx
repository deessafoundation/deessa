"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, CheckCircle } from "lucide-react"
import { updateProfile } from "@/lib/actions/admin-profile"
import type { AdminUser } from "@/lib/types/admin"

interface ProfileFormProps {
  adminUser: AdminUser
}

export function ProfileForm({ adminUser }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(adminUser.avatar_url || "")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    setSuccess(false)

    const result = await updateProfile(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={adminUser.email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" defaultValue={adminUser.full_name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 border">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Avatar preview" className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
              {adminUser.full_name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <Input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">Enter a direct image URL for your profile picture</p>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  )
}
