"use client"

import GenericErrorPage from "@/components/errors/generic-error-page"

export default function ProgramDetailError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <GenericErrorPage error={error} onRetry={retry} errorTitle="We couldn’t load this program."
    errorMessage="Please try again in a moment, or explore our other programs."
    secondaryHref="/whatwedo" secondaryLabel="Browse programs" />
}
