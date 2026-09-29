"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, Bug, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import styles from "./development-notice-modal.module.css"

const showDevNotice = process.env.NEXT_PUBLIC_SITE_STATUS !== "live"

export function DevelopmentNoticeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!showDevNotice || typeof window === "undefined") return

    // Only show on homepage
    if (window.location.pathname !== "/") return

    let timeoutId: NodeJS.Timeout

    const showModal = () => {
      setOpen(true)
    }

    // Listen for intro completion
    const handleIntroComplete = () => {
      // Show modal 500ms after intro completes
      timeoutId = setTimeout(showModal, 500)
    }

    window.addEventListener("intro-animation-complete", handleIntroComplete)

    // Fallback: if intro doesn't fire or is skipped, show after 1.5 seconds
    const fallbackTimeout = setTimeout(showModal, 1500)

    return () => {
      window.removeEventListener("intro-animation-complete", handleIntroComplete)
      clearTimeout(timeoutId)
      clearTimeout(fallbackTimeout)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
  }

  if (!showDevNotice) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          "max-w-[calc(100%-2rem)] border-slate-200 bg-white p-0 shadow-2xl sm:rounded-3xl",
          styles.content,
        )}
      >
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-t-lg border-b border-slate-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 px-6 py-8 sm:rounded-t-3xl sm:px-8">
          <div
            aria-hidden="true"
            className={cn("absolute right-0 top-0 size-32 rounded-full bg-amber-200/40 blur-3xl", styles.decoration)}
          />
          <div
            aria-hidden="true"
            className={cn("absolute bottom-0 left-0 size-24 rounded-full bg-orange-200/30 blur-2xl", styles.decoration)}
          />

          <DialogHeader className="relative space-y-4 text-left">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
              <AlertTriangle className="size-4" />
              Development Mode
            </div>

            <DialogTitle className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              We&apos;re still building. Help us improve!
            </DialogTitle>

            <DialogDescription className="text-base leading-relaxed text-slate-700">
              This website is under active development. If you spot any bugs, broken layouts, or have suggestions,
              please report them so we can fix them before launch.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          {/* Quick Info Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Bug className="size-5 text-red-600" />
                <h3 className="font-bold text-slate-950">Report Issues</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Found a bug or broken feature? Let us know with details and screenshots.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h3 className="font-bold text-slate-950">Share Ideas</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Have suggestions to improve the experience? We&apos;d love to hear them.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={cn("flex flex-col gap-3 sm:flex-row", styles.actions)}>
            <Button
              asChild
              size="lg"
              className={cn(
                "w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-base font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30 sm:flex-1",
                styles.report,
              )}
            >
              <Link href="/support">
                <Bug className="mr-2 size-5" />
                Report an Issue
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleClose}
              className={cn(
                "w-full !rounded-full border-slate-300 bg-white text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:!border-slate-300 focus-visible:!ring-slate-400/50 sm:flex-1",
                styles.dismiss,
              )}
            >
              <X className="mr-2 size-5" />
              Continue Browsing
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-slate-500">
            This notice appears every time you visit the homepage during development
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
