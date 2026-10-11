import Link from "next/link"
import { ArrowUpRight, HandHeart } from "lucide-react"
import type { SVGProps } from "react"
import type { FacebookPost } from "@/lib/facebook-posts/types"
import { FacebookPostPreview } from "./facebook-post-preview"
import { PostAnalyticsTracker } from "./post-analytics-tracker"
import { TrackedPostLink } from "./tracked-post-link"
import styles from "./community-section.module.css"
import { cn } from "@/lib/utils"

// Lucide no longer ships brand icons; keep these decorative marks local.
function Facebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M15 21v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H8v4h3v8" />
    </svg>
  )
}

function Instagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  )
}

export function CommunitySection({ posts }: { posts: FacebookPost[] }) {
  // Show section even when empty, with placeholder
  if (!posts.length) {
    return (
      <section aria-labelledby="community-heading" className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
              <HandHeart aria-hidden="true" className="size-5 text-blue-600" />
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-900">The deessa community</p>
            </div>
            <h2 id="community-heading" className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Little moments. Big impact.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Check back soon for stories, celebrations, and everyday moments from our community.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a 
              className={cn(styles.follow, "group inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-6 py-3 font-semibold transition-all duration-200")} 
              href="https://www.instagram.com/deessa.foundation/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Instagram aria-hidden="true" className="size-5 transition-transform group-hover:scale-110" />
              Follow on Instagram
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a 
              className={cn(styles.follow, "group inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-6 py-3 font-semibold transition-all duration-200")} 
              href="https://www.facebook.com/deessaFoundation" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Facebook aria-hidden="true" className="size-5 transition-transform group-hover:scale-110" />
              Follow on Facebook
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section aria-labelledby="community-heading" className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
            <HandHeart aria-hidden="true" className="size-5 text-blue-600" />
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-900">The deessa community</p>
          </div>
          <h2 id="community-heading" className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Little moments. Big impact.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Stories, celebrations, and everyday moments from our community.
          </p>
        </div>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <li key={post.id} id={`post-${post.id}`} className={cn(styles.card, "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl")}>
              <PostAnalyticsTracker postId={post.id} />
              <article className="flex flex-col">
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-blue-50">
                        <Facebook aria-hidden="true" className="size-3.5 text-blue-600" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Facebook Post</span>
                    </div>
                    <time className="text-xs text-gray-500" dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>
                  </div>
                  <h3 className="text-xl font-bold leading-tight text-gray-900">
                    <TrackedPostLink
                      postId={post.id}
                      url={post.post_url}
                      title={post.title}
                      className="group/link inline-flex items-start gap-1.5 after:absolute after:inset-0"
                    >
                      <span className="line-clamp-2">{post.title}</span>
                      <ArrowUpRight aria-hidden="true" className="mt-0.5 size-5 shrink-0 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </TrackedPostLink>
                  </h3>
                  {post.excerpt && (
                    <p className="line-clamp-3 text-sm text-gray-600">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <div className="relative z-10 px-5 pb-5">
                  <FacebookPostPreview url={post.post_url} title={post.title} automatic mode="public" />
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Link 
            href="/community" 
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700"
          >
            View all moments
            <ArrowUpRight className="size-4" />
          </Link>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              className={cn(styles.follow, "group inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-6 py-3 font-semibold transition-all duration-200")} 
              href="https://www.instagram.com/deessa.foundation/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Instagram aria-hidden="true" className="size-5 transition-transform group-hover:scale-110" />
              Follow on Instagram
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a 
              className={cn(styles.follow, "group inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-6 py-3 font-semibold transition-all duration-200")} 
              href="https://www.facebook.com/deessaFoundation" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Facebook aria-hidden="true" className="size-5 transition-transform group-hover:scale-110" />
              Follow on Facebook
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
