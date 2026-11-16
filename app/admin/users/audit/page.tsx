import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { canManageUsers, type AdminRole } from "@/lib/types/admin"
import { getSystemAuditLogs } from "@/lib/actions/admin-users"
import { SystemAuditClient } from "@/components/admin/users/system-audit-client"

export const metadata = {
  title: "Security & Activity Audit Trail | Management Portal",
  description: "Immutable security ledger tracking administrative access, role changes, and system operations.",
}

export default async function AdminAuditTrailPage() {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin || !canManageUsers(currentAdmin.role as AdminRole)) {
    redirect("/admin")
  }

  const logsResult = await getSystemAuditLogs({ limit: 150 })
  const initialLogs = logsResult.logs || []

  return (
    <SystemAuditClient
      initialLogs={initialLogs}
      currentAdminId={currentAdmin.id}
      currentAdminRole={currentAdmin.role as AdminRole}
    />
  )
}
