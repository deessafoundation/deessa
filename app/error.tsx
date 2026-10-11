"use client"

import GenericErrorPage from "@/components/errors/generic-error-page"

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <GenericErrorPage error={error} onRetry={retry} standalone />
}
