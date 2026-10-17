import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import type { AdminRole } from "@/lib/types/admin"

type QueryResult = { data: unknown; error: { message: string; code?: string } | null }
const mockAdmin = jest.fn<() => Promise<{ id: string; role: AdminRole } | null>>()
const mockResult = jest.fn<() => Promise<QueryResult>>()
const mockInsert = jest.fn<(row: unknown) => unknown>()
const mockUpdate = jest.fn<(row: unknown) => unknown>()
const mockDelete = jest.fn<() => unknown>()
const mockSelect = jest.fn<(columns?: string) => unknown>()
const mockEq = jest.fn<(key: string, value: unknown) => unknown>()
const mockFrom = jest.fn<(table: string) => unknown>()
const mockRevalidate = jest.fn<(path: string) => void>()
interface Query {
  select: (columns?: string) => Query
  eq: (key: string, value: unknown) => Query
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
  select: columns => { mockSelect(columns); return query },
  eq: (key, value) => { mockEq(key, value); return query },
  order: () => query, limit: () => query,
  single: () => mockResult(), maybeSingle: () => mockResult(),
  insert: row => { mockInsert(row); return query },
  update: row => { mockUpdate(row); return query },
  delete: () => { mockDelete(); return query },
  then: (resolve, reject) => mockResult().then(resolve, reject),
}
jest.mock("server-only", () => ({}), { virtual: true })
jest.mock("@/lib/actions/admin-auth", () => ({ getCurrentAdmin: () => mockAdmin() }))
jest.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: (table: string) => mockFrom(table) }) }))
jest.mock("next/cache", () => ({ revalidatePath: (path: string) => mockRevalidate(path) }))
import { createTeamMember, updateTeamMember, deleteTeamMember, reorderTeamMembers, getTeamMembers, getTeamMember } from "@/lib/actions/admin-team"
import { getAboutTeamMembers } from "@/lib/data/about-team"

function form() {
  const data = new FormData()
  data.set("name", "Saved person")
  data.set("role", "Advocate")
  data.set("image", "/team/person.png")
  data.set("facebook", "https://facebook.com/person")
  data.set("isPublished", "true")
  return data
}
beforeEach(() => {
  jest.clearAllMocks()
  mockRevalidate.mockReset()
  mockResult.mockReset()
  mockAdmin.mockResolvedValue({ id: "admin-id", role: "ADMIN" })
  mockFrom.mockReturnValue(query)
  mockResult.mockResolvedValue({ data: { id: "member-id" }, error: null })
  jest.spyOn(console, "error").mockImplementation(() => {})
})

describe("Team ownership and persistence", () => {
  it.each([null, { id: "finance-id", role: "FINANCE" as AdminRole }])("requires Team permission for every action: %p", async admin => {
    mockAdmin.mockResolvedValue(admin)
    await expect(getTeamMembers()).rejects.toThrow("Unauthorized")
    await expect(getTeamMember("member-id")).rejects.toThrow("Unauthorized")
    for (const result of [await createTeamMember(form()), await updateTeamMember("member-id", form()), await deleteTeamMember("member-id"), await reorderTeamMembers([])]) expect(result).toEqual({ error: "Unauthorized" })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it.each(["javascript:alert(1)", "//evil.example", "https://user:secret@example.com", "/\\evil.example"])("rejects unsafe social links before writing: %s", async value => {
    const data = form()
    data.set("facebook", value)
    expect(await createTeamMember(data)).toHaveProperty("error")
    expect(await updateTeamMember("member-id", data)).toHaveProperty("error")
    expect(mockInsert).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("rejects insecure images, oversized names, and invalid private contact data", async () => {
    for (const [key, value] of [["image", "http://example.com/photo.png"], ["name", "a".repeat(201)], ["email", "not-an-email"]]) {
      const data = form()
      data.set(key, value)
      expect(await createTeamMember(data)).toHaveProperty("error")
    }
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it("saves validated publishing fields and all social links for an Editor", async () => {
    mockAdmin.mockResolvedValue({ id: "editor-id", role: "EDITOR" })
    mockResult.mockResolvedValueOnce({ data: null, error: null })
    expect(await createTeamMember(form())).toMatchObject({ success: true })
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ name: "Saved person", role: "Advocate", image: "/team/person.png", is_published: true, sort_order: 0, social_links: expect.objectContaining({ facebook: "https://facebook.com/person" }) }))
    expect(mockRevalidate).toHaveBeenCalledWith("/about")
  })

  it("clears social links when the last link is removed", async () => {
    const data = form()
    data.set("facebook", "")
    expect(await updateTeamMember("member-id", data)).toMatchObject({ success: true })
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ social_links: null }))
  })

  it("does not silently retry without social links when a migration is missing", async () => {
    mockResult.mockResolvedValueOnce({ data: null, error: null })
    mockResult.mockResolvedValueOnce({ data: null, error: { message: "social_links column is missing" } })
    expect(await createTeamMember(form())).toHaveProperty("error")
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockRevalidate).not.toHaveBeenCalled()
  })

  it("reports a missing or denied update as a failure, without raw database details", async () => {
    mockResult.mockResolvedValue({ data: null, error: { message: "secret SQL details", code: "PGRST116" } })
    expect(await updateTeamMember("member-id", form())).toEqual({ error: "This member no longer exists. Refresh the list." })
    expect(await deleteTeamMember("member-id")).toHaveProperty("error")
    expect(mockRevalidate).not.toHaveBeenCalled()
  })

  it("keeps a confirmed save successful when its activity log fails", async () => {
    mockResult.mockResolvedValueOnce({ data: { id: "member-id" }, error: null })
    mockResult.mockResolvedValueOnce({ data: null, error: { message: "Log failed" } })
    expect(await updateTeamMember("member-id", form())).toMatchObject({ success: true, warning: expect.stringContaining("activity log") })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  it("rejects duplicate or invalid ordering identifiers before a write", async () => {
    const id = "c2eeed4b-d5d4-4319-afc4-3cfc8778d5f1"
    expect(await reorderTeamMembers([id, id])).toHaveProperty("error")
    expect(await reorderTeamMembers(["invalid"])).toHaveProperty("error")
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("reports a partial reorder failure instead of false success", async () => {
    mockResult.mockResolvedValueOnce({ data: { id: "first" }, error: null })
    mockResult.mockResolvedValueOnce({ data: null, error: { message: "Write failed" } })
    expect(await reorderTeamMembers(["c2eeed4b-d5d4-4319-afc4-3cfc8778d5f1", "7fd70abd-8968-4566-bbb9-274ae7236f45"])).toHaveProperty("error")
    expect(mockRevalidate).toHaveBeenCalledWith("/about")
  })
})

describe("Public Team loading", () => {
  it("preserves an intentionally empty published team and never creates fallback people", async () => {
    mockResult.mockResolvedValue({ data: [], error: null })
    expect(await getAboutTeamMembers()).toEqual({ members: [], unavailable: false })
    expect(mockEq).toHaveBeenCalledWith("is_published", true)
    expect(mockSelect).toHaveBeenCalledWith("id, name, role, bio, image, social_links")
  })

  it("distinguishes database failure from an empty published team", async () => {
    mockResult.mockResolvedValue({ data: null, error: { message: "Unavailable" } })
    expect(await getAboutTeamMembers()).toEqual({ members: [], unavailable: true })
  })
})
