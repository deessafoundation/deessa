"use client"

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SupportToggle() {
  const [enabled, setEnabled] = React.useState(true)
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const res = await fetch('/api/admin/settings/support')
      const data = await res.json()
      setEnabled(data.enabled)
    } catch (error) {
      console.error('Failed to fetch support status:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(checked: boolean) {
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/settings/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setEnabled(checked)
      router.refresh()
    } catch (error) {
      console.error('Failed to update support status:', error)
      alert('Failed to update support status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Feature</CardTitle>
          <CardDescription>Enable or disable the public support page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Feature</CardTitle>
        <CardDescription>Enable or disable the public support page and form</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            {enabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <Label htmlFor="support-toggle" className="text-base font-semibold cursor-pointer">
                Support Page Status
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                {enabled ? 'Support page is currently accessible to visitors' : 'Support page is currently disabled (404)'}
              </p>
            </div>
          </div>
          <Switch
            id="support-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={updating}
          />
        </div>

        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <p className="text-sm font-medium">When disabled:</p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Support link will be hidden from the navigation bar</li>
            <li>Direct access to /support will show a 404 page</li>
            <li>Existing support reports remain accessible in admin</li>
          </ul>
        </div>

        {updating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
