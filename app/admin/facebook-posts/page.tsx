import { redirect } from "next/navigation"

export const metadata = { title: "Community Posts | Admin" }

export default async function FacebookPostsPage() {
  redirect("/admin/community-posts")
}
