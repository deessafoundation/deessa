"use client"

import GenericErrorPage from "@/components/errors/generic-error-page"

export default function WhatWeDoError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <GenericErrorPage error={error} onRetry={retry} errorTitle="We couldn’t load our programs."
    errorMessage="Please try again in a moment. You can also return to the homepage to explore more of deessa."
    secondaryHref="/" secondaryLabel="Back to home" />
}
