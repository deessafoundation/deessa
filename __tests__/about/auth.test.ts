import { beforeEach, describe, expect, it, jest } from "@jest/globals"

const mockUser = jest.fn<() => Promise<{ data: { user: { id: string } | null } }>>()
const mockAdminRow = jest.fn<() => Promise<{ data: { id: string; role: string; is_active: boolean } | null }>>()
const mockFrom = jest.fn()
jest.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: () => mockUser() },
  from: () => { mockFrom(); return { select: () => ({ eq: () => ({ single: () => mockAdminRow() }) }) } },
}) }))
jest.mock("@/lib/supabase/service", () => ({ createServiceRoleClient: jest.fn() }))
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }))
jest.mock("next/navigation", () => ({ redirect: jest.fn() }))
import { getCurrentAdmin } from "@/lib/actions/admin-auth"

beforeEach(() => {
  jest.clearAllMocks()
  mockUser.mockResolvedValue({ data: { user: { id: "user-id" } } })
  mockAdminRow.mockResolvedValue({ data: { id: "admin-id", role: "ADMIN", is_active: true } })
})
describe("Active administrator boundary", () => {
  it("returns an active administrator", async () => {
    expect(await getCurrentAdmin()).toMatchObject({ id: "admin-id", is_active: true })
  })
  it("rejects a deactivated administrator even if their row is readable", async () => {
    mockAdminRow.mockResolvedValue({ data: { id: "admin-id", role: "SUPER_ADMIN", is_active: false } })
    expect(await getCurrentAdmin()).toBeNull()
  })
  it("rejects a signed-out visitor without querying administrator records", async () => {
    mockUser.mockResolvedValue({ data: { user: null } })
    expect(await getCurrentAdmin()).toBeNull()
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
