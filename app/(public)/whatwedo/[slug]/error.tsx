"use client"

import Link from "next/link"
import { AlertTriangle, RefreshCcw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProgramDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Program Unavailable
        </h1>
        <p className="text-muted-foreground mb-8">
          We&apos;re having trouble loading this program. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => reset()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild>
            <Link href="/whatwedo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
