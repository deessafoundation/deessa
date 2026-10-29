import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { renderToStaticMarkup } from "react-dom/server"

const mockUser = jest.fn<() => Promise<{ data: { user: { id: string } | null } }>>()
const mockAdminRow = jest.fn<() => Promise<{ data: { id: string; is_active: boolean } | null }>>()
jest.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: () => mockUser() },
  from: () => ({ select: () => ({ eq: () => ({ single: () => mockAdminRow() }) }) }),
}) }))
jest.mock("@/components/admin/layout/admin-layout-content", () => ({
  AdminLayoutContent: ({ children }: { children: React.ReactNode }) => <div data-test-admin-shell>{children}</div>,
}))
import AdminLayout from "@/app/admin/layout"

beforeEach(() => {
  mockUser.mockResolvedValue({ data: { user: { id: "user-id" } } })
})
describe("Administrator login layout", () => {
  it("keeps login available to inactive sessions without a redirect loop or admin shell", async () => {
    mockAdminRow.mockResolvedValue({ data: { id: "inactive-admin", is_active: false } })
    const html = renderToStaticMarkup(await AdminLayout({ children: <p>Sign in</p> }))
    expect(html).toContain("Sign in")
    expect(html).not.toContain("data-test-admin-shell")
  })
  it("renders the admin shell for active administrators", async () => {
    mockAdminRow.mockResolvedValue({ data: { id: "admin-id", is_active: true } })
    const html = renderToStaticMarkup(await AdminLayout({ children: <p>Editor</p> }))
    expect(html).toContain("data-test-admin-shell")
  })
})
