import type { Metadata } from "next"
import { getSubscriberByToken } from "@/lib/data/newsletter"
import { UnsubscribeClient } from "@/components/newsletter/unsubscribe-client"

export const metadata: Metadata = {
  title: "Unsubscribe from Newsletter | deessa Foundation",
  description: "Manage your deessa Foundation email subscription preferences.",
  robots: {
    index: false,
    follow: false,
  },
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams
  const subscriber = token ? await getSubscriberByToken(token) : null

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <UnsubscribeClient initialSubscriber={subscriber} token={token || null} />
      </div>
    </main>
  )
}
