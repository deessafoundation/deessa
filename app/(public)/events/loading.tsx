export default function EventsLoading() {
  return <div role="status" aria-label="Loading events" className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
    <span className="sr-only">Loading events…</span>
    <div aria-hidden="true" className="space-y-8 motion-safe:animate-pulse">
      <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.5fr]">
        <div className="space-y-5"><div className="h-20 w-48 rounded-lg bg-slate-200" /><div className="h-24 rounded-lg bg-slate-100" /><div className="h-12 w-48 rounded-full bg-slate-200" /></div>
        <div className="grid grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5].map((item) => <div key={item} className={`${item < 4 ? "col-span-2" : "col-span-3"} h-36 rounded-full bg-slate-100 sm:h-44`} />)}
        </div>
      </div>
      <div className="h-10 w-1/2 rounded bg-slate-200" />
      <div className="grid overflow-hidden rounded-2xl lg:grid-cols-2"><div className="h-72 bg-slate-200" /><div className="space-y-5 bg-slate-100 p-8"><div className="h-16 rounded bg-slate-200" /><div className="h-10 rounded bg-slate-200" /><div className="h-12 w-48 rounded-full bg-slate-200" /></div></div>
    </div>
  </div>
}
