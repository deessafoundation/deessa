"use client"

import ServerErrorPage from "@/components/errors/server-error-page"
// The global boundary replaces the root layout, including its stylesheet imports.
import "./globals.css"

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>Website unavailable | deessa Foundation</title>
        <ServerErrorPage error={error} onRetry={retry} standalone />
      </body>
    </html>
  )
}
