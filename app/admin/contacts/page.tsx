import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { fetchContacts } from "@/lib/data/contacts"
import { ContactsClient } from "@/components/admin/contacts/contacts-client"

export const metadata = {
  title: "Contact Inquiries & Communications | Admin",
  description:
    "Review visitor inquiries, triage messages, assign to staff members, and send direct email replies.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

async function checkContactsPermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!adminUser) return false

  return hasPermission(adminUser.role as AdminRole, "contacts")
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    assignee?: string
    archived?: string
    page?: string
  }>
}) {
  const hasAccess = await checkContactsPermission()
  if (!hasAccess) {
    redirect("/admin")
  }

  const params = await searchParams

  const page = params.page ? parseInt(params.page, 10) : 1
  const search = params.search || undefined
  const status = params.status || undefined
  const assignee = params.assignee || undefined
  const archived = params.archived === "true" ? true : undefined

  const data = await fetchContacts({
    type: "general",
    page,
    pageSize: 10,
    search,
    status,
    assignee,
    archived,
  })

  return <ContactsClient initialData={data} />
}
