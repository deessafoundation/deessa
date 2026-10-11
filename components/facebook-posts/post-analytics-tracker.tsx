"use client"

import { useEffect } from "react"
import { trackFacebookPostView } from "@/lib/actions/facebook-posts"

/**
 * Tracks when a post comes into view on the homepage or community page.
 * Uses IntersectionObserver to track only when 50% of the card is visible.
 */
export function PostAnalyticsTracker({ postId }: { postId: string }) {
  useEffect(() => {
    let tracked = false
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !tracked) {
            tracked = true
            trackFacebookPostView(postId).catch(() => {
              // Silent fail for analytics
            })
          }
        })
      },
      { threshold: 0.5 }
    )

    const element = document.getElementById(`post-${postId}`)
    if (element) {
      observer.observe(element)
    }

    return () => {
      observer.disconnect()
    }
  }, [postId])

  return null
}
