"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, UserPlus } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { addNewsletterSubscriber } from "@/lib/actions/admin-newsletter"

interface AddSubscriberDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddSubscriberDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: AddSubscriberDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [source, setSource] = useState("manual_admin")
  const [sendWelcome, setSendWelcome] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !email.includes("@")) {
      notifications.showError("Please enter a valid email address")
      return
    }

    startTransition(async () => {
      const res = await addNewsletterSubscriber({
        email: email.trim(),
        name: name.trim() || undefined,
        source,
        sendWelcome,
      })

      if (res.success) {
        notifications.showSuccess(`Added ${email} to subscriber list`)
        setEmail("")
        setName("")
        setSource("manual_admin")
        setSendWelcome(true)
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        notifications.showError(res.error || "Failed to add subscriber")
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserPlus className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">Add New Subscriber</DialogTitle>
                <DialogDescription className="text-xs">
                  Manually register a community member to receive email broadcasts.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="subscriber-email" className="text-xs font-semibold">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subscriber-email"
                type="email"
                placeholder="supporter@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subscriber-name" className="text-xs font-semibold">
                Subscriber Name <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="subscriber-name"
                type="text"
                placeholder="e.g. Sarah Adhikari"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subscriber-source" className="text-xs font-semibold">
                Acquisition Channel
              </Label>
              <Select value={source} onValueChange={setSource} disabled={isPending}>
                <SelectTrigger id="subscriber-source" className="h-10 text-sm">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_admin">Admin Manual Entry</SelectItem>
                  <SelectItem value="event_registration">Event Attendee</SelectItem>
                  <SelectItem value="donation">Donor Outreach</SelectItem>
                  <SelectItem value="import">Imported List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="send-welcome"
                checked={sendWelcome}
                onCheckedChange={(checked) => setSendWelcome(Boolean(checked))}
                disabled={isPending}
              />
              <Label
                htmlFor="send-welcome"
                className="text-xs font-medium text-foreground cursor-pointer"
              >
                Send welcome introduction email immediately
              </Label>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1 sm:flex-none h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-none h-10 gap-2 bg-primary text-primary-foreground"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Subscriber"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
