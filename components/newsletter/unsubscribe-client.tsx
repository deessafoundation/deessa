"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { CheckCircle2, AlertCircle, ArrowLeft, RotateCcw, HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { unsubscribeByToken, resubscribeByToken } from "@/lib/actions/newsletter-unsubscribe"
import type { NewsletterSubscriber } from "@/lib/data/newsletter"

interface UnsubscribeClientProps {
  initialSubscriber: NewsletterSubscriber | null
  token: string | null
}

export function UnsubscribeClient({ initialSubscriber, token }: UnsubscribeClientProps) {
  const [isPending, startTransition] = useTransition()
  const [subscriber] = useState<NewsletterSubscriber | null>(initialSubscriber)
  const [status, setStatus] = useState<"idle" | "unsubscribed" | "resubscribed" | "error">(
    initialSubscriber ? (initialSubscriber.is_active ? "idle" : "unsubscribed") : "error"
  )
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")

  if (!token || !initialSubscriber) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="size-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Invalid Unsubscribe Link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This unsubscribe link is either missing or has expired. If you wish to manage your email preferences, please reach out to our team.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Return to Homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Contact Us
          </Link>
        </div>
      </div>
    )
  }

  const handleUnsubscribe = () => {
    startTransition(async () => {
      const res = await unsubscribeByToken(token)
      if (res.success) {
        setStatus("unsubscribed")
        setFeedbackMessage("You have been unsubscribed from all deessa Foundation updates.")
      } else {
        setStatus("error")
        setFeedbackMessage(res.error || "Failed to update preferences")
      }
    })
  }

  const handleResubscribe = () => {
    startTransition(async () => {
      const res = await resubscribeByToken(token)
      if (res.success) {
        setStatus("resubscribed")
        setFeedbackMessage("Welcome back! Your subscription has been restored.")
      } else {
        setStatus("error")
        setFeedbackMessage(res.error || "Failed to reactivate subscription")
      }
    })
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
      {status === "unsubscribed" ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <CheckCircle2 className="size-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">You are Unsubscribed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We’ve removed <strong className="text-foreground font-semibold">{subscriber?.email}</strong> from our community newsletter mailing list. You won’t receive any further regular bulletins.
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
            Unsubscribed by mistake? You can instantly restore your subscription anytime.
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              type="button"
              onClick={handleResubscribe}
              disabled={isPending}
              variant="outline"
              className="h-10 w-full gap-2 border-primary/40 font-semibold text-primary hover:bg-primary/10"
            >
              <RotateCcw className="size-4" />
              {isPending ? "Restoring..." : "Resubscribe to Updates"}
            </Button>
            <Link
              href="/"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to deessa Foundation Home
            </Link>
          </div>
        </div>
      ) : status === "resubscribed" ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <HeartHandshake className="size-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Welcome Back!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your subscription for <strong className="text-foreground font-semibold">{subscriber?.email}</strong> has been successfully reactivated. Thank you for staying part of our mission!
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continue to Homepage
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Unsubscribe from Newsletter?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Are you sure you want to stop receiving newsletters and community updates for{" "}
            <strong className="text-foreground font-semibold">{subscriber?.email}</strong>?
          </p>

          {status === "error" && (
            <p className="mt-3 text-xs text-destructive font-medium">{feedbackMessage}</p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Button
              type="button"
              onClick={handleUnsubscribe}
              disabled={isPending}
              variant="destructive"
              className="h-10 w-full font-semibold"
            >
              {isPending ? "Processing..." : "Yes, Unsubscribe Me"}
            </Button>
            <Link
              href="/"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel and Return Home
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
