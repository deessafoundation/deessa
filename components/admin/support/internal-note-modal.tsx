"use client"

import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Props { id: string }

export default function InternalNoteModal({ id }: Props) {
  const [open, setOpen] = React.useState(false)
  const [note, setNote] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  async function submit() {
    if (!note) return alert('Please enter a note')
    setLoading(true)
    try {
      const payload: any = { note }
      const res = await fetch('/api/admin/support/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'add-note', payload }),
      })
      if (!res.ok) throw new Error(await res.text())
      setOpen(false)
      setNote('')
      router.refresh()
    } catch (err) {
      alert('Failed to add note')
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">Add Note</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Internal Note</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full h-40 p-2 border rounded-md" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>{loading ? 'Saving...' : 'Save Note'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
