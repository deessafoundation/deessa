import { CommunityPostsList } from "@/components/admin/facebook-posts/community-posts-list"
import { listFacebookPosts } from "@/lib/actions/facebook-posts"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission, type AdminRole } from "@/lib/types/admin"

export const metadata = { title: "Community Posts | Admin" }

export default async function CommunityPostsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; q?: string; status?: string }> 
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")

  if (!hasPermission(admin.role as AdminRole, "settings")) {
    redirect("/admin")
  }

  const params = await searchParams
  const page = Number(params.page ?? 1)
  const search = params.q
  const status = params.status as "published" | "draft" | "all" | undefined
  
  const result = await listFacebookPosts(page, search, status)
  
  return <CommunityPostsList initialResult={result} initialPage={page} initialSearch={search} initialStatus={status} />
}
