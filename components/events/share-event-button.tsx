"use client"

import { Share2 } from "lucide-react"

interface ShareEventButtonProps {
  title: string
  description: string
}

export function ShareEventButton({ title, description }: ShareEventButtonProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: description,
        url: window.location.href,
      }).catch((err) => {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', err)
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Share2 className="size-4" />
      Share Event
    </button>
  )
}
