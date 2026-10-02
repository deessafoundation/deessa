"use client"

import GenericErrorPage from "@/components/errors/generic-error-page"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return <GenericErrorPage error={error} reset={reset} />
}
