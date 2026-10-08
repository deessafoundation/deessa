"use client"

import { ErrorPage, useIsOffline, type ErrorPageProps } from "./error-page"

interface ServerErrorPageProps extends Omit<ErrorPageProps, "variant"> {
  reset?: () => void
}

export default function ServerErrorPage({ reset, onRetry, ...props }: ServerErrorPageProps = {}) {
  const offline = useIsOffline()
  return <ErrorPage {...props} variant={offline ? "network" : "server"} onRetry={onRetry ?? reset} />
}
