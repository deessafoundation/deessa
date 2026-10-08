import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { NextRequest } from "next/server"
import { DEFAULT_WHAT_WE_DO_SETTINGS, whatWeDoSettingsSchema } from "@/lib/types/what-we-do-settings"

const mockAdmin = jest.fn<() => Promise<unknown>>()
const mockUpsert = jest.fn<(row: unknown, options: unknown) => Promise<{ error: unknown }>>()
const mockRevalidate = jest.fn<(path: string) => void>()
jest.mock("@/lib/actions/admin-auth", () => ({ getCurrentAdmin: () => mockAdmin() }))
jest.mock("@/lib/supabase/service", () => ({ createServiceRoleClient: () => ({ from: () => ({ upsert: mockUpsert }) }) }))
jest.mock("next/cache", () => ({ revalidatePath: (path: string) => mockRevalidate(path) }))
import { POST } from "@/app/api/admin/what-we-do-settings/route"

const request = (settings: unknown, origin = "https://example.com") => new NextRequest("https://example.com/api/admin/what-we-do-settings", { method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify({ settings }) })
beforeEach(() => { jest.clearAllMocks(); mockAdmin.mockResolvedValue({ id: "admin-id", role: "ADMIN" }); mockUpsert.mockResolvedValue({ error: null }) })

describe("What We Do content", () => {
  it("accepts the complete initial content", () => { expect(whatWeDoSettingsSchema.safeParse(DEFAULT_WHAT_WE_DO_SETTINGS).success).toBe(true) })
  it.each(["javascript:alert(1)", "//evil.example", "/\\evil.example", "data:text/html,test"])("rejects unsafe destinations: %s", href => {
    const settings = structuredClone(DEFAULT_WHAT_WE_DO_SETTINGS); settings.hero.primaryHref = href
    expect(whatWeDoSettingsSchema.safeParse(settings).success).toBe(false)
  })
  it("rejects missing cards and changed route identities", () => {
    const settings = structuredClone(DEFAULT_WHAT_WE_DO_SETTINGS); settings.cards.pop()
    expect(whatWeDoSettingsSchema.safeParse(settings).success).toBe(false)
  })
  it("blocks unauthenticated writes", async () => { mockAdmin.mockResolvedValue(null); expect((await POST(request(DEFAULT_WHAT_WE_DO_SETTINGS))).status).toBe(401); expect(mockUpsert).not.toHaveBeenCalled() })
  it("blocks users without settings permissions", async () => { mockAdmin.mockResolvedValue({ role: "FINANCE" }); expect((await POST(request(DEFAULT_WHAT_WE_DO_SETTINGS))).status).toBe(403); expect(mockUpsert).not.toHaveBeenCalled() })
  it("blocks cross-origin writes", async () => { expect((await POST(request(DEFAULT_WHAT_WE_DO_SETTINGS, "https://other.example"))).status).toBe(403); expect(mockUpsert).not.toHaveBeenCalled() })
  it("rejects malformed content without writing", async () => { expect((await POST(request({}))).status).toBe(400); expect(mockUpsert).not.toHaveBeenCalled() })
  it("saves edited content and refreshes all four pages", async () => {
    const settings = structuredClone(DEFAULT_WHAT_WE_DO_SETTINGS); settings.areas.awareness.headline = "An updated heading"
    expect((await POST(request(settings))).status).toBe(200)
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ value: settings, updated_by: "admin-id" }), { onConflict: "key" })
    for (const slug of Object.keys(settings.areas)) expect(mockRevalidate).toHaveBeenCalledWith(`/whatwedo/${slug}`)
  })
  it("reports database failures without success or revalidation", async () => { mockUpsert.mockResolvedValue({ error: { message: "unavailable" } }); expect((await POST(request(DEFAULT_WHAT_WE_DO_SETTINGS))).status).toBe(500); expect(mockRevalidate).not.toHaveBeenCalled() })
})
