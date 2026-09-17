import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, ExternalLink, Pencil, TriangleAlert, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

async function requireProgramsAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  const { data: admin } = await supabase.from("admin_users").select("role, is_active").eq("user_id", user.id).single()
  if (!admin?.is_active || !hasPermission(admin.role as AdminRole, "programs")) redirect("/admin")
}

const categoryLabels: Record<string, string> = {
  service: "Service",
  outreach: "Outreach",
  research: "Research",
  campaign: "Campaign",
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "destructive",
}

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>
}) {
  await requireProgramsAccess()
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("programs")
    .select("id, slug, status, display_order, updated_at, created_at")
    .order("display_order")
    .order("updated_at", { ascending: false })

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status)
  }

  const { data: programs, error } = await query

  if (error) {
    const code = "code" in error ? error.code : undefined
    const isMissingTable = code === "42P01" || code === "PGRST205"
    const isPermissionError = code === "42501" || code === "PGRST116"
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-muted-foreground">Manage the four public program categories.</p>
        </div>
        <Card>
          <CardContent className="flex items-start gap-3 p-6">
            <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h2 className="font-semibold">Programs CMS is not ready yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isMissingTable
                  ? "Apply scripts/migrations/060-programs-cms-foundation.sql in the Supabase SQL Editor, then refresh this page."
                  : isPermissionError
                    ? "The CMS tables exist, but this admin account does not have the required programs permission or database policy."
                    : "The CMS tables could not be loaded. Check the Supabase migration and server logs before retrying."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch drafts to get titles and categories (programs table may not have them)
  // Fetch titles and categories from the programs master table
  const programIds = programs?.map((p) => p.id) || []
  let draftsMap: Record<string, { title: string; category: string }> = {}
  if (programIds.length > 0) {
    const { data: programData } = await supabase
      .from("programs")
      .select("id, title, category")
      .in("id", programIds)

    if (programData) {
      for (const p of programData) {
        draftsMap[p.id] = {
          title: p.title || p.id,
          category: p.category || "unknown",
        }
      }
    }
  }

  // Apply search filter (client-side on title/slug)
  let filtered = programs || []
  if (params.q) {
    const q = params.q.toLowerCase()
    filtered = filtered.filter((p) => {
      const info = draftsMap[p.id]
      const title = info?.title?.toLowerCase() || ""
      const slug = p.slug?.toLowerCase() || ""
      return title.includes(q) || slug.includes(q)
    })
  }

  // Apply category filter
  if (params.category && params.category !== "all") {
    filtered = filtered.filter((p) => {
      const info = draftsMap[p.id]
      return info?.category === params.category
    })
  }

  const buildUrl = (key: string, value: string) => {
    const sp = new URLSearchParams()
    if (params.q) sp.set("q", params.q)
    if (params.status && params.status !== "all") sp.set("status", params.status)
    if (params.category && params.category !== "all") sp.set("category", params.category)
    sp.set(key, value)
    return `/admin/programs?${sp.toString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-muted-foreground">Manage the four public program categories.</p>
        </div>
        <Button asChild>
          <Link href="/admin/programs/new">
            <Plus className="mr-2 h-4 w-4" />
            New program
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search title or slug..."
                defaultValue={params.q || ""}
                className="pl-9"
              />
            </div>
            <Select name="status" defaultValue={params.status || "all"}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select name="category" defaultValue={params.category || "all"}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="outreach">Outreach</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary" size="sm">
              Filter
            </Button>
            {(params.q || (params.status && params.status !== "all") || (params.category && params.category !== "all")) && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/programs">Clear</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filtered.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {programs?.length ? "No programs match your filters." : "No CMS programs yet. Create the first draft."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((program) => {
                  const info = draftsMap[program.id]
                  return (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium max-w-[250px] truncate">
                        {info?.title || program.slug}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {program.slug}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[info?.category || ""] || info?.category || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[program.status] || "secondary"}>
                          {program.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{program.display_order}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(program.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/programs/${program.id}/edit`} aria-label={`Edit ${info?.title || program.slug}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          {program.status === "published" && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/whatwedo/${program.slug}`} target="_blank" aria-label={`View ${info?.title || program.slug}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
