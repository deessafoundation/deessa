"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  CreditCard,
  DollarSign,
} from "lucide-react"
import {
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from "@/lib/actions/events-module/event-pricing"
import { notifications } from "@/lib/notifications"
import type { EventTicketType } from "@/lib/types/events-module"

interface PricingEditorProps {
  eventId: string
  ticketTypes: EventTicketType[]
  isFree: boolean
}

const CURRENCIES = [
  { value: "NPR", label: "NPR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
]

function stringToDate(s: string | null): Date | null {
  if (!s) return null
  return new Date(s)
}

function dateToString(d: Date | null): string | null {
  if (!d) return null
  return d.toISOString()
}

export function PricingEditor({ eventId, ticketTypes: initial, isFree }: PricingEditorProps) {
  const [localItems, setLocalItems] = useState<EventTicketType[]>(initial)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)

  // Add form state
  const [addName, setAddName] = useState("")
  const [addPrice, setAddPrice] = useState("")
  const [addCurrency, setAddCurrency] = useState("NPR")
  const [addCapacity, setAddCapacity] = useState("")
  const [addSalesStart, setAddSalesStart] = useState<Date | null>(null)
  const [addSalesEnd, setAddSalesEnd] = useState<Date | null>(null)

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editCurrency, setEditCurrency] = useState("NPR")
  const [editCapacity, setEditCapacity] = useState("")
  const [editSalesStart, setEditSalesStart] = useState<Date | null>(null)
  const [editSalesEnd, setEditSalesEnd] = useState<Date | null>(null)

  function resetAddForm() {
    setAddName("")
    setAddPrice("")
    setAddCurrency("NPR")
    setAddCapacity("")
    setAddSalesStart(null)
    setAddSalesEnd(null)
    setShowAddForm(false)
  }

  function startEdit(ticket: EventTicketType) {
    setEditingId(ticket.id)
    setEditName(ticket.name)
    setEditPrice(String(ticket.price))
    setEditCurrency(ticket.currency)
    setEditCapacity(ticket.capacity ? String(ticket.capacity) : "")
    setEditSalesStart(stringToDate(ticket.sales_start))
    setEditSalesEnd(stringToDate(ticket.sales_end))
  }

  async function handleAdd() {
    if (!addName.trim()) {
      notifications.showError({ description: "Ticket name is required" })
      return
    }
    setIsLoading("add")
    const result = await createTicketType({
      event_id: eventId,
      name: addName.trim(),
      price: Number(addPrice) || 0,
      currency: addCurrency,
      capacity: addCapacity ? Number(addCapacity) : undefined,
      sales_start: dateToString(addSalesStart) || undefined,
      sales_end: dateToString(addSalesEnd) || undefined,
    })
    if (result.error) {
      notifications.showError({ description: result.error })
    } else if (result.data) {
      notifications.showSuccess({ description: "Ticket type added." })
      setLocalItems((prev) => [...prev, result.data!])
      resetAddForm()
    }
    setIsLoading(null)
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) {
      notifications.showError({ description: "Ticket name is required" })
      return
    }
    setIsLoading(id)
    const result = await updateTicketType(id, {
      event_id: eventId,
      name: editName.trim(),
      price: Number(editPrice) || 0,
      currency: editCurrency,
      capacity: editCapacity ? Number(editCapacity) : undefined,
      sales_start: dateToString(editSalesStart) || undefined,
      sales_end: dateToString(editSalesEnd) || undefined,
    })
    if (result.error) {
      notifications.showError({ description: result.error })
    } else if (result.data) {
      notifications.showSuccess({ description: "Ticket type updated." })
      setLocalItems((prev) => prev.map((t) => (t.id === id ? result.data! : t)))
      setEditingId(null)
    }
    setIsLoading(null)
  }

  async function handleDelete(id: string) {
    const removed = localItems.find((t) => t.id === id)
    setLocalItems((prev) => prev.filter((t) => t.id !== id))
    setDeleteDialogOpen(null)
    setIsLoading(id)
    const result = await deleteTicketType(id, eventId)
    if (result.error) {
      notifications.showError({ description: result.error })
      if (removed) setLocalItems((prev) => [...prev, removed])
    } else {
      notifications.showSuccess({ description: "Ticket type deleted." })
    }
    setIsLoading(null)
  }

  const handleToggleActive = useCallback(async (id: string, isActive: boolean) => {
    setLocalItems((prev) => prev.map((t) => (t.id === id ? { ...t, is_active: isActive } : t)))
    setIsLoading(id)
    await updateTicketType(id, { event_id: eventId, is_active: isActive })
    setIsLoading(null)
  }, [eventId])

  if (isFree) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/50">
          <DollarSign className="size-7 text-muted-foreground/50" />
        </div>
        <p className="text-base font-semibold text-foreground">Free Event</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          This event is marked as free. No ticket types needed.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          To add pricing, disable the &quot;Free Event&quot; toggle in the Details tab.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Ticket Types</h2>
          <p className="text-sm text-muted-foreground">
            {localItems.length} type{localItems.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="size-4" />
          Add Ticket Type
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              <Plus className="size-3.5" />
            </div>
            <span className="text-sm font-semibold text-foreground">New Ticket Type</span>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Name *</Label>
                <Input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Early Bird, General, VIP"
                  className="h-9 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Price</Label>
                <div className="flex items-center">
                  <select
                    value={addCurrency}
                    onChange={(e) => setAddCurrency(e.target.value)}
                    className="h-9 w-20 shrink-0 rounded-l-lg border border-r-0 border-border bg-muted px-2 text-xs font-bold text-muted-foreground"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    placeholder="0"
                    className="h-9 rounded-lg rounded-l-none text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Capacity</Label>
                <Input
                  type="number"
                  min="0"
                  value={addCapacity}
                  onChange={(e) => setAddCapacity(e.target.value)}
                  placeholder="Unlimited"
                  className="h-9 rounded-lg text-sm"
                />
                <p className="text-[10px] text-muted-foreground/60">Total tickets available. Sold: {localItems.reduce((sum, t) => sum + (t.sold_count || 0), 0)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Sales Start</Label>
                <DateTimePicker
                  value={addSalesStart}
                  onChange={setAddSalesStart}
                  placeholder="When sales open"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Sales End</Label>
                <DateTimePicker
                  value={addSalesEnd}
                  onChange={setAddSalesEnd}
                  placeholder="When sales close"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleAdd} disabled={isLoading === "add"} className="gap-2">
                {isLoading === "add" && <Loader2 className="size-3.5 animate-spin" />}
                Add Ticket
              </Button>
              <Button size="sm" variant="outline" onClick={resetAddForm}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket List */}
      {localItems.length === 0 && !showAddForm ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/50">
            <CreditCard className="size-7 text-muted-foreground/50" />
          </div>
          <p className="text-base font-semibold text-foreground">No ticket types</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Add ticket types to set pricing for this event.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {localItems.map((ticket) => (
            <div
              key={ticket.id}
              className={`rounded-xl border p-4 transition-colors ${
                editingId === ticket.id
                  ? "border-primary/30 bg-primary/5"
                  : ticket.is_active
                    ? "border-border bg-muted/20 hover:bg-muted/30"
                    : "border-border bg-muted/10 opacity-60"
              }`}
            >
              {editingId === ticket.id ? (
                /* ── Edit Mode ── */
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Name</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-9 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Price</Label>
                      <div className="flex items-center">
                        <select
                          value={editCurrency}
                          onChange={(e) => setEditCurrency(e.target.value)}
                          className="h-9 w-20 shrink-0 rounded-l-lg border border-r-0 border-border bg-muted px-2 text-xs font-bold text-muted-foreground"
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="h-9 rounded-lg rounded-l-none text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Capacity</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(e.target.value)}
                        placeholder="Unlimited"
                        className="h-9 rounded-lg text-sm"
                      />
                      {editingId && (() => {
                        const t = localItems.find((x) => x.id === editingId)
                        return t?.capacity ? (
                          <p className="text-[10px] text-muted-foreground/60">
                            Currently: {t.capacity - (t.sold_count || 0)} of {t.capacity} remaining
                          </p>
                        ) : null
                      })()}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Sales Start</Label>
                      <DateTimePicker
                        value={editSalesStart}
                        onChange={setEditSalesStart}
                        placeholder="When sales open"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Sales End</Label>
                      <DateTimePicker
                        value={editSalesEnd}
                        onChange={setEditSalesEnd}
                        placeholder="When sales close"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => handleUpdate(ticket.id)} disabled={isLoading === ticket.id} className="gap-2">
                      {isLoading === ticket.id && <Loader2 className="size-3.5 animate-spin" />}
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Display Mode ── */
                <div className="flex items-center gap-4">
                  {/* Price badge */}
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                    ticket.price > 0 ? "bg-primary/10 text-primary" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    <span className="text-xs font-black">
                      {ticket.price > 0 ? ticket.currency : "FREE"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{ticket.name}</p>
                      {!ticket.is_active && (
                        <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {ticket.price === 0 ? "Free" : `${ticket.currency} ${ticket.price.toLocaleString()}`}
                      </span>
                      {ticket.capacity ? (
                        <span className={ticket.sold_count >= ticket.capacity ? "text-red-500 font-semibold" : ""}>
                          {ticket.sold_count >= ticket.capacity
                            ? "Sold out"
                            : `${ticket.capacity - ticket.sold_count} of ${ticket.capacity} remaining`}
                        </span>
                      ) : (
                        <span>{ticket.sold_count || 0} registered</span>
                      )}
                      {ticket.sales_start && (
                        <span>Sales from {new Date(ticket.sales_start).toLocaleDateString()}</span>
                      )}
                      {ticket.sales_end && (
                        <span>until {new Date(ticket.sales_end).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={ticket.is_active}
                      onCheckedChange={(checked) => handleToggleActive(ticket.id, checked)}
                      disabled={isLoading === ticket.id}
                    />
                    <button
                      onClick={() => startEdit(ticket)}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Edit ticket"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <Dialog
                      open={deleteDialogOpen === ticket.id}
                      onOpenChange={(open) => setDeleteDialogOpen(open ? ticket.id : null)}
                    >
                      <DialogTrigger asChild>
                        <button
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Delete ticket"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Ticket Type</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &quot;{ticket.name}&quot;?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={() => handleDelete(ticket.id)}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
