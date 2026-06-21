interface DetailRowProps {
  label: string
  value: string | string[] | null | undefined
}

export function DetailRow({ label, value }: DetailRowProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
        <p className="text-sm text-muted-foreground min-w-[160px]">{label}</p>
        <p className="text-sm text-muted-foreground">—</p>
      </div>
    )
  }
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
      <p className="text-sm text-muted-foreground min-w-[160px]">{label}</p>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap justify-end gap-1">
          {value.map((v, idx) => (
            <span
              key={`${v}-${idx}`}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {v}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-right text-sm font-medium text-foreground capitalize">
          {value}
        </p>
      )}
    </div>
  )
}
