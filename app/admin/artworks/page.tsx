import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { listAllArtworks } from "@/lib/actions/artworks"
import { getArtsContent } from "@/lib/data/artworks"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { ArtworksManagerClient } from "@/components/admin/arts/artworks-manager-client"

export const metadata = {
  title: "Artworks | Admin",
  description: "Manage the art gallery and homepage art feature",
}

export default async function ArtworksAdminPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")

  if (!hasPermission(admin.role as AdminRole, "settings")) {
    redirect("/admin")
  }

  const [result, content] = await Promise.all([listAllArtworks(), getArtsContent()])

  return (
    <div className="space-y-6">
      <ArtworksManagerClient
        initialArtworks={result.ok ? result.data ?? [] : []}
        loadError={result.ok ? null : result.error}
        initialContent={content}
      />
    </div>
  )
}
