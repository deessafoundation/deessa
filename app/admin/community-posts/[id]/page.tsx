import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getFacebookPost } from "@/lib/actions/facebook-posts"
import { FacebookPostsManager } from "@/components/admin/facebook-posts/facebook-posts-manager"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission, type AdminRole } from "@/lib/types/admin"

export const metadata = { title: "Community Post Details | Admin" }

export default async function CommunityPostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")

  if (!hasPermission(admin.role as AdminRole, "settings")) {
    redirect("/admin")
  }

  const { id } = await params
  const result = await getFacebookPost(id)
  
  if (result.error) {
    return (
      <div className="space-y-4">
        <Link href="/admin/community-posts" className="text-sm text-primary hover:underline">
          ← Back to community posts
        </Link>
        <p role="alert" className="rounded-lg border p-6">{result.error}</p>
      </div>
    )
  }
  
  if (!result.post) notFound()
  
  return <FacebookPostsManager key={result.post.id} post={result.post} />
}
