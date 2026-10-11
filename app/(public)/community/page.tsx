import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, HandHeart, Home } from "lucide-react"
import { getPublicFacebookPosts } from "@/lib/data/facebook-posts"
import { FacebookPostPreview } from "@/components/facebook-posts/facebook-post-preview"
import { PostAnalyticsTracker } from "@/components/facebook-posts/post-analytics-tracker"
import { TrackedPostLink } from "@/components/facebook-posts/tracked-post-link"
import type { SVGProps } from "react"
import styles from "@/components/facebook-posts/community-section.module.css"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = generateSEOMetadata({
  title: "Community Moments | deessa Foundation",
  description: "Stories, celebrations, and everyday moments from the deessa community. See how we're making an impact through connection, learning, and support.",
  path: "/community",
  keywords: [
    "deessa community",
    "Nepal community stories",
    "autism community Nepal",
    "special education stories",
    "community impact",
    "social development stories",
  ],
})

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

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const { posts, count } = await getPublicFacebookPosts(page, 12)
  const totalPages = Math.ceil(count / 12)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <Home className="size-4" />
              Back to home
            </Link>
          </div>
          
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
              <HandHeart aria-hidden="true" className="size-5 text-blue-600" />
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-900">The deessa community</p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Little moments. Big impact.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Stories, celebrations, and everyday moments from our community.
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <>
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
                        <h2 className="text-xl font-bold leading-tight text-gray-900">
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
                        </h2>
                        {post.excerpt && (
                          <p className="line-clamp-3 text-sm text-gray-600">
                            {post.excerpt}
                          </p>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="relative z-10 px-5 pb-5">
                        <FacebookPostPreview url={post.post_url} title={post.title} automatic mode="public" />
                      </div>
                    </article>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Community posts pagination" className="mt-12 flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-600">
                    Page {page} of {totalPages} · {count} total post{count !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Button asChild variant="outline">
                        <Link href={`/community?page=${page - 1}`}>Previous</Link>
                      </Button>
                    )}
                    {page < totalPages && (
                      <Button asChild variant="outline">
                        <Link href={`/community?page=${page + 1}`}>Next</Link>
                      </Button>
                    )}
                  </div>
                </nav>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <h2 className="text-2xl font-semibold text-gray-900">No posts yet</h2>
              <p className="mt-2 text-gray-600">Check back soon for community updates.</p>
            </div>
          )}

          {/* Follow CTAs */}
          <div className="mt-16 flex flex-wrap justify-center gap-4 border-t pt-12">
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
    </main>
  )
}
