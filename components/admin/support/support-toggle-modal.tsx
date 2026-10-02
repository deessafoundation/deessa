"use client"

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2, Settings, Power } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { notifications } from '@/lib/notifications'

export function SupportToggleModal() {
  const [open, setOpen] = React.useState(false)
  const [enabled, setEnabled] = React.useState(true)
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    if (open) {
      fetchStatus()
    }
  }, [open])

  async function fetchStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings/support')
      const data = await res.json()
      setEnabled(data.enabled)
    } catch (error) {
      console.error('Failed to fetch support status:', error)
      notifications.showError({
        title: 'Failed to load',
        description: 'Could not load current support status. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(newStatus: boolean) {
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/settings/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newStatus }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update')
      }

      setEnabled(newStatus)
      router.refresh()
      
      notifications.showSuccess({
        title: 'Success!',
        description: `Support feature has been ${newStatus ? 'enabled' : 'disabled'} successfully.`,
      })
      
      // Close modal after successful update
      setTimeout(() => {
        setOpen(false)
      }, 500)
    } catch (error) {
      console.error('Failed to update support status:', error)
      notifications.showError({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update support status. Please try again.',
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Support Feature
          </CardTitle>
          <CardDescription>Control the public support page visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Power className="h-4 w-4 mr-2" />
                Manage Support Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Support Feature Control</DialogTitle>
                <DialogDescription>
                  Enable or disable the public support page and form
                </DialogDescription>
              </DialogHeader>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {enabled ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {enabled ? 'Support is Currently Enabled' : 'Support is Currently Disabled'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {enabled 
                            ? 'Visitors can access /support and submit reports' 
                            : 'Support page shows 404, link hidden from navbar'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p className="text-sm font-medium">What happens when you {enabled ? 'disable' : 'enable'} support:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      {enabled ? (
                        <>
                          <li>Support link will be hidden from navigation</li>
                          <li>Support link removed from contact page</li>
                          <li>Direct access to /support will show 404</li>
                          <li>Existing reports remain accessible in admin</li>
                        </>
                      ) : (
                        <>
                          <li>Support link will appear in navigation</li>
                          <li>Support link shown on contact page</li>
                          <li>Users can access /support page</li>
                          <li>Users can submit new support reports</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={updating}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                {!loading && (
                  <Button
                    onClick={() => handleToggle(!enabled)}
                    disabled={updating}
                    variant={enabled ? "destructive" : "default"}
                    className="w-full sm:w-auto"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        {enabled ? 'Disable Support' : 'Enable Support'}
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  )
}
