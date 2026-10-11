import { CommunityPostsList } from "@/components/admin/facebook-posts/community-posts-list"
import { listFacebookPosts } from "@/lib/actions/facebook-posts"

export const metadata = { title: "Community Posts | Admin" }

export default async function CommunityPostsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; q?: string; status?: string }> 
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const search = params.q
  const status = params.status as "published" | "draft" | "all" | undefined
  
  const result = await listFacebookPosts(page, search, status)
  
  return <CommunityPostsList initialResult={result} initialPage={page} initialSearch={search} initialStatus={status} />
}
