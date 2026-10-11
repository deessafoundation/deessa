import Link from "next/link"
import { notFound } from "next/navigation"
import { getFacebookPost } from "@/lib/actions/facebook-posts"
import { FacebookPostsManager } from "@/components/admin/facebook-posts/facebook-posts-manager"

export const metadata = { title: "Community Post Details | Admin" }

export default async function CommunityPostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getFacebookPost(id)
  if (result.error) return <div className="space-y-4"><Link href="/admin/community-posts" className="underline">Back to community posts</Link><p role="alert">{result.error}</p></div>
  if (!result.post) notFound()
  return <FacebookPostsManager key={result.post.id} post={result.post} />
}
