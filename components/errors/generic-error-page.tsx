"use client"

import { ErrorPage, useIsOffline, type ErrorPageProps } from "./error-page"

interface GenericErrorPageProps extends Omit<ErrorPageProps, "variant" | "title" | "message"> {
  reset?: () => void
  errorTitle?: string
  errorMessage?: string
}

export default function GenericErrorPage({ reset, onRetry, errorTitle, errorMessage, ...props }: GenericErrorPageProps) {
  const offline = useIsOffline()
  return <ErrorPage {...props} variant={offline ? "network" : "generic"} onRetry={onRetry ?? reset}
    title={offline ? undefined : errorTitle} message={offline ? undefined : errorMessage} />
}
