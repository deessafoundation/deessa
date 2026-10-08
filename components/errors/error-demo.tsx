"use client"

import { useState, type CSSProperties } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, CheckCircle2, RotateCcw } from "lucide-react"
import { ErrorPage, type ErrorPageProps } from "./error-page"
import { cn } from "@/lib/utils"
import styles from "./error-demo.module.css"

const examples = {
  "not-found": { label: "404 · Page not found", props: { variant: "not-found", standalone: true } },
  generic: { label: "Unexpected error", props: { variant: "generic", standalone: true } },
  server: { label: "500 · Server error", props: { variant: "server", standalone: true } },
  network: { label: "Connection error", props: { variant: "network", standalone: true } },
  unauthorized: { label: "403 · Access denied", props: { variant: "unauthorized", standalone: true } },
  program: { label: "Program not found", props: { variant: "not-found", title: "We couldn’t find this program.",
    message: "This program may have moved or is no longer available. Explore our current programs to find another way to connect.",
    primaryHref: "/whatwedo", primaryLabel: "Browse programs", secondaryHref: "/", secondaryLabel: "Back to home" } },
  event: { label: "Event not found", props: { variant: "not-found", title: "We couldn’t find this event.",
    message: "This event may have moved or is no longer available. Discover our upcoming events and find another opportunity to join us.",
    primaryHref: "/events", primaryLabel: "Browse events", secondaryHref: "/", secondaryLabel: "Back to home" } },
  closed: { label: "Registration closed", props: { variant: "closed", primaryHref: "/events", primaryLabel: "Browse events", secondaryHref: "/", secondaryLabel: "Back to home" } },
} satisfies Record<string, { label: string; props: ErrorPageProps }>

export type ErrorExample = keyof typeof examples

export default function ErrorDemo({ initialExample = "not-found", focused = false }: { initialExample?: ErrorExample; focused?: boolean }) {
  const [example, setExample] = useState<ErrorExample>(initialExample)
  const [contrast, setContrast] = useState("normal")
  const [scale, setScale] = useState("1")
  const [recovered, setRecovered] = useState(false)
  const [retryResult, setRetryResult] = useState("success")
  const [retryCount, setRetryCount] = useState(0)
  const selected = examples[example]
  const hasRetry = ["generic", "server", "network"].includes(example)
  const error = example === "generic" || example === "server" ? Object.assign(new Error("Demo only"), { digest: "DEESSA-DEMO-001" }) : undefined

  function tryAgain() {
    setRetryCount((count) => count + 1)
    if (retryResult === "success") setRecovered(true)
    else throw new Error("Simulated persistent failure")
  }

  return (
    <div className={cn(styles.demo, "min-h-screen")}>
      <a href="#error-demo-preview" className={styles.skip}>Skip to error preview</a>
      <header className="mx-auto max-w-7xl px-5 pb-7 pt-8 sm:px-8">
        <Link className={cn(styles.link, "mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold")} href={focused ? "/demo/errors" : "/demo"}>
          <ArrowLeft aria-hidden="true" className="size-4" />{focused ? "All error previews" : "Demo hub"}
        </Link>
        <p className={cn(styles.eyebrow, "mb-2 text-xs font-bold uppercase tracking-widest")}>deessa design studio</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Connection, even when things go wrong.</h1>
        <p className={cn(styles.muted, "mt-3 max-w-2xl leading-relaxed")}>A new error-page collection in deessa’s colors, inspired by communication and inclusion. These previews don’t trigger a real outage or access restriction.</p>
      </header>
      <div className={cn(styles.toolbar, "border-y")}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-end gap-4 px-5 py-5 sm:px-8">
          <label className="grid gap-2 text-sm font-bold">Error state
            <select className={styles.select} value={example} onChange={(event) => { setExample(event.target.value as ErrorExample); setRecovered(false); setRetryCount(0) }}>
              {Object.entries(examples).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">Contrast
            <select className={styles.select} value={contrast} onChange={(event) => setContrast(event.target.value)}>
              <option value="normal">Normal</option><option value="high">High contrast</option><option value="inverted">Inverted contrast</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">Text size
            <select className={styles.select} value={scale} onChange={(event) => setScale(event.target.value)}>
              <option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option>
            </select>
          </label>
          {hasRetry && <label className="grid gap-2 text-sm font-bold">Retry outcome
            <select className={styles.select} value={retryResult} onChange={(event) => setRetryResult(event.target.value)}>
              <option value="success">Recover successfully</option><option value="failure">Keep showing the error</option>
            </select>
          </label>}
          <Link className={cn(styles.link, "inline-flex min-h-11 items-center gap-2 text-sm font-bold")} href={`/demo/errors/${example}`}>
            Open this preview <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
      <main id="error-demo-preview" tabIndex={-1} className="mx-auto max-w-7xl px-3 py-6 sm:px-8">
        <div className={cn(styles.preview, "overflow-hidden rounded-2xl border")} data-error-contrast={contrast}
          style={{ "--error-text-scale": scale } as CSSProperties}>
          {recovered ? (
            <section aria-labelledby="demo-recovered-title" className={cn(styles.success, "px-6 py-24 text-center")}>
              <CheckCircle2 aria-hidden="true" className="mx-auto mb-5 size-12" />
              <h2 id="demo-recovered-title" className="text-3xl font-bold">Connected again.</h2>
              <p role="status" className="mt-4">The demo retry succeeded. The real page would replace the error with its content.</p>
              <button type="button" className={cn(styles.control, "mt-7 inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-5 py-3 font-bold")}
                onClick={() => setRecovered(false)}><RotateCcw aria-hidden="true" className="size-4" />Show the error again</button>
            </section>
          ) : <ErrorPage key={example} {...selected.props} preview error={error} onRetry={hasRetry ? tryAgain : undefined} />}
        </div>
        <p role="status" className={cn(styles.muted, "mt-4 text-sm")}>{hasRetry ? `Retry attempts: ${retryCount}. ` : ""}Navigation links open their real destinations. Contrast and text-size controls apply only to this preview.</p>
      </main>
      <section aria-labelledby="error-demo-notes" className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <h2 id="error-demo-notes" className="text-lg font-bold">Try it out</h2>
        <ul className={cn(styles.muted, "mt-3 list-disc space-y-2 pl-5 leading-relaxed")}>
          <li>Resize the browser to check the mobile layout, and use Tab to follow every action.</li>
          <li>Open the support reference on the server or unexpected-error preview and copy it.</li>
          <li>Choose a retry outcome, then press “Try again” to see recovery or a persistent failure.</li>
          <li><Link href="/demo/errors/check-this-missing-page" className={styles.link}>Open a real unmatched URL</Link> to see the actual site 404.</li>
        </ul>
        <p className={cn(styles.muted, "mt-5 text-sm")}>The connection preview does not turn off your internet. A first visit while offline still uses the browser’s own offline screen.</p>
      </section>
    </div>
  )
}
