"use client"

import ServerErrorPage from "@/components/errors/server-error-page"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <ServerErrorPage error={error} reset={reset} />
      </body>
    </html>
  )
}
