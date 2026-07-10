"use client"

import { useEffect, useState, useCallback, useRef, Suspense } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Clock, AlertTriangle, Loader2, Calendar } from "lucide-react"

/**
 * Payment Success Page — Event Registration
 *
 * Dual-path verification:
 * 1. Direct verify via provider API (fast feedback)
 * 2. Poll DB status endpoint (production reliability)
 *
 * Handles Stripe (session_id), Khalti (pidx), and eSewa (paid=1) flows.
 */

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const slug = (params.slug as string) ?? ""
  const rid = searchParams.get("rid") ?? ""
  const sessionId = searchParams.get("session_id") ?? "" // Stripe appends this
  const pidx = searchParams.get("pidx") ?? "" // Khalti appends this
  const paid = searchParams.get("paid") === "1" // eSewa/manual
  const statusParam = searchParams.get("status") // review/failed

  const [status, setStatus] = useState<
    "loading" | "confirmed" | "processing" | "failed" | "review"
  >("loading")
  const [reg, setReg] = useState<{
    fullName: string
    eventName: string
    expiresAt: string | null
  } | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const hasVerified = useRef(false) // prevent double-verify on StrictMode
  const MAX_POLLS = 18 // 90s total (18 × 5s)

  /**
   * Step 1 (runs once): directly confirm payment via provider API.
   * - Stripe: calls /api/events/confirm-stripe-session
   * - Khalti: calls /api/payments/khalti/verify
   * eSewa is already handled by the callback route, so we skip direct verify.
   */
  const confirmViaProvider = useCallback(async () => {
    if (!rid || hasVerified.current) return
    hasVerified.current = true

    // If eSewa already confirmed via callback (paid=1), skip direct verify
    if (paid) {
      await fetchStatus()
      return
    }

    // If status param indicates failure, skip
    if (statusParam === "failed") {
      setStatus("failed")
      return
    }

    // If status param indicates review, skip
    if (statusParam === "review") {
      setStatus("review")
      return
    }

    try {
      if (sessionId) {
        // ── Stripe ──────────────────────────────────────────────────────────
        const res = await fetch("/api/events/confirm-stripe-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rid, sessionId }),
        })
        try {
          const data = await res.json()
          if (data.ok && data.status === "confirmed") await fetchStatus()
          else if (data.ok && data.status === "review") setStatus("review")
          // else polling will handle it
        } catch (parseErr) {
          console.warn("Stripe response JSON parse error:", parseErr)
          // Non-JSON response — fall through to polling
        }
      } else if (pidx) {
        // ── Khalti ──────────────────────────────────────────────────────────
        const res = await fetch("/api/payments/khalti/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pidx, purchase_order_id: rid }),
        })
        try {
          const data = await res.json()
          if (data.ok && (data.status === "paid" || data.status === "completed"))
            await fetchStatus()
          else if (data.ok && data.status === "review") setStatus("review")
          // else polling will handle it
        } catch (parseErr) {
          console.warn("Khalti response JSON parse error:", parseErr)
          // Non-JSON response — fall through to polling
        }
      }
    } catch (err) {
      console.warn("payment verify error:", err)
      // Non-fatal — fall through to polling
    }
  }, [rid, sessionId, pidx, paid, statusParam]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Step 2: Poll the public status endpoint to read the confirmed state from DB.
   */
  const fetchStatus = useCallback(async () => {
    if (!rid) {
      setStatus("failed")
      return
    }

    const res = await fetch(
      `/api/events/status?rid=${encodeURIComponent(rid)}`,
    )
    if (!res.ok) {
      setStatus("failed")
      return
    }

    try {
      const data = await res.json()
      if (!data.ok) {
        setStatus("failed")
        return
      }

      setReg({
        fullName: sessionStorage.getItem("event_payment_name") || "",
        eventName: data.eventName,
        expiresAt: data.expiresAt,
      })

      if (data.paymentStatus === "paid" && data.status === "confirmed") {
        setStatus("confirmed")
      } else if (data.paymentStatus === "review") {
        setStatus("review")
      } else if (
        data.status === "cancelled" ||
        data.status === "expired"
      ) {
        setStatus("failed")
      } else {
        setStatus("processing")
      }
    } catch (parseErr) {
      console.warn("Status endpoint JSON parse error:", parseErr)
      setStatus("failed")
    }
  }, [rid])

  // On mount: verify payment directly with provider, then poll status
  useEffect(() => {
    const init = async () => {
      await confirmViaProvider()
      await fetchStatus()
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep polling every 5s while status is still processing
  useEffect(() => {
    if (status !== "processing" || pollCount >= MAX_POLLS) return
    const t = setTimeout(async () => {
      setPollCount((c) => c + 1)
      await fetchStatus()
    }, 5_000)
    return () => clearTimeout(t)
  }, [status, pollCount, fetchStatus])

  const shortId = reg
    ? `${reg.eventName.slice(0, 10).toUpperCase()}-${rid.slice(0, 6).toUpperCase()}`
    : rid
      ? `REG-${rid.slice(0, 6).toUpperCase()}`
      : ""

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Verifying your payment…
        </p>
      </div>
    )
  }

  // ── Confirmed ─────────────────────────────────────────────────────────────
  if (status === "confirmed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-foreground">
            You&apos;re Confirmed!
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Your payment was received and your spot is secured for{" "}
            {reg?.eventName ?? "the event"}.
          </p>
          {reg && (
            <div className="mb-8 rounded-xl bg-muted/60 p-5 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Registration ID
                  </p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {shortId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Attendee
                  </p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {reg.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Event
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {reg.eventName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Status
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                    <CheckCircle className="size-3" /> Confirmed
                  </span>
                </div>
              </div>
            </div>
          )}
          <p className="mb-6 text-xs text-muted-foreground">
            A confirmation email has been sent to your registered email address.
          </p>
          <Link
            href={`/events/${slug}`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Calendar className="size-4 mr-2" />
            Back to Event
          </Link>
        </div>
      </div>
    )
  }

  // ── Processing (polling) ──────────────────────────────────────────────────
  if (status === "processing") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-amber-100">
            <Clock className="size-10 text-amber-600 animate-pulse" />
          </div>
          <h1 className="mb-2 text-xl font-extrabold text-foreground">
            Processing Payment…
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            We&apos;re confirming your payment. This usually takes a few
            seconds. This page refreshes automatically.
          </p>
          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
          {pollCount >= MAX_POLLS && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-800">
                This is taking longer than expected. Please{" "}
                <Link href={`/events/${slug}`} className="text-primary underline">
                  contact support
                </Link>{" "}
                quoting Registration ID:{" "}
                <span className="font-mono font-bold">{shortId}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Under Review ──────────────────────────────────────────────────────────
  if (status === "review") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="size-10 text-amber-600" />
          </div>
          <h1 className="mb-2 text-xl font-extrabold text-foreground">
            Payment Under Review
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Your payment was received but requires manual verification. Our team
            will confirm your registration within 24 hours and send you an email.
          </p>
          <p className="text-sm text-muted-foreground">
            Registration ID:{" "}
            <span className="font-mono font-bold text-foreground">{shortId}</span>
          </p>
        </div>
      </div>
    )
  }

  // ── Failed / default ──────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-xl">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="mb-2 text-xl font-extrabold text-foreground">
          Payment Failed
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Your payment could not be processed. Your registration is still saved —
          you can try again using your payment link.
        </p>
        <Link
          href={`/events/${slug}/register/pending-payment?rid=${encodeURIComponent(rid)}&email=${encodeURIComponent(searchParams.get("email") ?? "")}`}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-white transition hover:opacity-90"
        >
          Try Again →
        </Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
