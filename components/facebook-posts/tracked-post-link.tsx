"use client"

import { trackFacebookPostClick } from "@/lib/actions/facebook-posts"

interface TrackedPostLinkProps {
  postId: string
  url: string
  title: string
  className?: string
  children: React.ReactNode
}

/**
 * A link that tracks clicks on Facebook posts for analytics.
 * Tracks before navigation to ensure the event is recorded.
 */
export function TrackedPostLink({ postId, url, title, className, children }: TrackedPostLinkProps) {
  function handleClick(e: React.MouseEvent) {
    // Track the click (fire and forget)
    trackFacebookPostClick(postId).catch(() => {
      // Silent fail for analytics
    })
    // Let the default link behavior proceed
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={title}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
