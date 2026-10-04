"use client"
import { useId, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export function TemplateSection({ title, hint, accent = '#3FABDE', defaultOpen = false, children, actions }: {
  title: string; hint?: string; accent?: string; defaultOpen?: boolean; children: ReactNode; actions?: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return <section className="overflow-hidden rounded-lg border bg-card">
    <div className="flex flex-wrap items-center gap-1 pr-3">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-2.5 px-5 py-3 text-left hover:bg-muted/50">
        <span className="h-5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
        <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span>{hint && <span className="block text-xs text-muted-foreground">{hint}</span>}</span>
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
      {actions && <div className="flex items-center gap-1 pb-1 pl-4 sm:pb-0">{actions}</div>}
    </div>
    {open && <div id={id} className="space-y-4 border-t px-5 py-5">{children}</div>}
  </section>
}

export function TemplateTextField({ label, hint, value = '', onChange, max = 200, rows = 1 }: {
  label: string; hint?: string; value?: string; onChange: (value: string) => void; max?: number; rows?: number
}) {
  const id = useId()
  return <div className="space-y-1">
    <div className="flex justify-between gap-3"><label htmlFor={id} className="text-xs text-muted-foreground">{label}</label><span className="text-[10px] tabular-nums text-muted-foreground">{value.length}/{max}</span></div>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    <textarea id={id} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" rows={rows} maxLength={max} value={value} onChange={event => onChange(event.target.value)} />
  </div>
}

