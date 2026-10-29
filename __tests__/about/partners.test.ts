import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { adminNavSections, canAccessAdminNavItem } from "@/components/admin/layout/admin-nav-config"
import type { AdminRole } from "@/lib/types/admin"

type QueryResult = { data: unknown; error: { message: string } | null }
const mockAdmin = jest.fn<() => Promise<{ id: string; role: AdminRole } | null>>()
const mockResult = jest.fn<() => Promise<QueryResult>>()
const mockInsert = jest.fn<(row: unknown) => unknown>()
const mockUpdate = jest.fn<(row: unknown) => unknown>()
const mockDelete = jest.fn<() => unknown>()
const mockFrom = jest.fn<(table: string) => unknown>()
const mockRevalidate = jest.fn<(path: string) => void>()
interface Query {
  select: () => Query
  eq: () => Query
  order: () => Query
  limit: () => Query
  single: () => Promise<QueryResult>
  maybeSingle: () => Promise<QueryResult>
  insert: (row: unknown) => Query
  update: (row: unknown) => Query
  delete: () => Query
  then: (resolve: (result: QueryResult) => unknown, reject?: (error: unknown) => unknown) => Promise<unknown>
}
const query: Query = {
  select: () => query,
  eq: () => query,
  order: () => query,
  limit: () => query,
  single: () => mockResult(),
  maybeSingle: () => mockResult(),
  insert: (row: unknown) => { mockInsert(row); return query },
  update: (row: unknown) => { mockUpdate(row); return query },
  delete: () => { mockDelete(); return query },
  then: (resolve: (result: QueryResult) => unknown, reject?: (error: unknown) => unknown) => mockResult().then(resolve, reject),
}

jest.mock("@/lib/actions/admin-auth", () => ({ getCurrentAdmin: () => mockAdmin() }))
jest.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: (table: string) => mockFrom(table) }) }))
jest.mock("next/cache", () => ({ revalidatePath: (path: string) => mockRevalidate(path) }))
import { createPartner, deletePartner, getPartner, getPartners, updatePartner } from "@/lib/actions/admin-partners"

function form() {
  const data = new FormData()
  data.set("name", "Saved partner")
  data.set("type", "partner")
  data.set("website", "https://example.com")
  data.set("logo", "/partners/logo.png")
  data.set("isPublished", "true")
  return data
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRevalidate.mockReset()
  mockResult.mockReset()
  mockAdmin.mockResolvedValue({ id: "admin-id", role: "ADMIN" })
  mockFrom.mockReturnValue(query)
  mockResult.mockResolvedValue({ data: { id: "partner-id" }, error: null })
  jest.spyOn(console, "error").mockImplementation(() => {})
})

describe("Partners in Who We Are", () => {
  it.each([null, { id: "finance-id", role: "FINANCE" as AdminRole }])("blocks reads and writes without Partners permission: %p", async (admin) => {
    mockAdmin.mockResolvedValue(admin)
    await expect(getPartners()).rejects.toThrow("Unauthorized")
    await expect(getPartner("partner-id")).rejects.toThrow("Unauthorized")
    expect(await createPartner(form())).toEqual({ error: "Unauthorized" })
    expect(await updatePartner("partner-id", form())).toEqual({ error: "Unauthorized" })
    expect(await deletePartner("partner-id")).toEqual({ error: "Unauthorized" })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it("preserves editor access through the consolidated sidebar entry", async () => {
    mockAdmin.mockResolvedValue({ id: "editor-id", role: "EDITOR" })
    const navigation = adminNavSections.flatMap(section => section.items)
    const about = navigation.find(item => item.href === "/admin/about")!
    expect(canAccessAdminNavItem("EDITOR", about)).toBe(true)
    expect(canAccessAdminNavItem("ADMIN", about)).toBe(true)
    expect(canAccessAdminNavItem("FINANCE", about)).toBe(false)
    expect(navigation.filter(item => item.href.startsWith("/admin/partners"))).toEqual([])
    mockResult.mockResolvedValueOnce({ data: [], error: null })
    expect(await getPartners()).toEqual([])
    expect(await updatePartner("partner-id", form())).toMatchObject({ success: true })
  })

  it("does not turn a list-load failure into an empty list", async () => {
    mockResult.mockResolvedValue({ data: null, error: { message: "Database unavailable" } })
    await expect(getPartners()).rejects.toThrow("Could not load partners")
  })

  it.each(["javascript:alert(1)", "//evil.example", "https://user:secret@example.com", "/\\evil.example"])("rejects unsafe website URLs before a write: %s", async (url) => {
    const data = form()
    data.set("website", url)
    expect(await createPartner(data)).toHaveProperty("error")
    expect(await updatePartner("partner-id", data)).toHaveProperty("error")
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("creates in the existing table, retaining publishing fields and refreshing both routes", async () => {
    mockResult.mockResolvedValueOnce({ data: { sort_order: 6 }, error: null })
    expect(await createPartner(form())).toMatchObject({ success: true, data: { id: "partner-id" } })
    expect(mockFrom).toHaveBeenCalledWith("partners")
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ name: "Saved partner", type: "partner", logo: "/partners/logo.png", website: "https://example.com", is_published: true, sort_order: 7 }))
    for (const path of ["/admin/about", "/admin/partners", "/"]) expect(mockRevalidate).toHaveBeenCalledWith(path)
  })

  it("reports a failed write without success or cache refresh", async () => {
    mockResult.mockResolvedValue({ data: null, error: { message: "Write failed" } })
    expect(await updatePartner("partner-id", form())).toEqual({ error: "Could not update the partner. Please try again." })
    expect(await deletePartner("partner-id")).toEqual({ error: "Could not delete the partner. Please try again." })
    expect(mockRevalidate).not.toHaveBeenCalled()
  })

  it("reports a persisted partner as saved when cache refresh fails", async () => {
    mockRevalidate.mockImplementation(() => { throw new Error("Cache unavailable") })
    expect(await updatePartner("partner-id", form())).toMatchObject({ success: true, warning: expect.any(String) })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  it("rejects insecure logo URLs and oversized fields before writing", async () => {
    const data = form()
    data.set("logo", "http://example.com/logo.png")
    expect(await createPartner(data)).toHaveProperty("error")
    data.set("logo", "/logo.png")
    data.set("name", "a".repeat(201))
    expect(await updatePartner("partner-id", data)).toHaveProperty("error")
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("reports a returned activity-log error without repeating a persisted write", async () => {
    mockResult.mockResolvedValueOnce({ data: { id: "partner-id" }, error: null })
    mockResult.mockResolvedValueOnce({ data: null, error: { message: "Audit log unavailable" } })
    expect(await updatePartner("partner-id", form())).toMatchObject({ success: true, warning: expect.stringContaining("activity log") })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalled()
  })
})
