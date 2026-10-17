import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { NextRequest } from "next/server"
import { aboutPageSettingsSchema, DEFAULT_ABOUT_PAGE_SETTINGS } from "@/lib/types/about-settings"
import { normalizeAboutPageSettings, resolvePublicAboutSettings } from "@/lib/data/about-settings-normalization"

const mockAdmin = jest.fn<() => Promise<unknown>>()
const mockUpsert = jest.fn<(row: unknown, options: unknown) => Promise<{ error: unknown }>>()
const mockLoad = jest.fn<() => Promise<{ data: { value: unknown } | null; error: unknown }>>()
const mockRevalidate = jest.fn<(path: string) => void>()
jest.mock("server-only", () => ({}), { virtual: true })
jest.mock("@/lib/actions/admin-auth", () => ({ getCurrentAdmin: () => mockAdmin() }))
jest.mock("@/lib/supabase/service", () => ({ createServiceRoleClient: () => ({ from: () => ({ upsert: mockUpsert }) }) }))
jest.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => mockLoad() }) }) }) }) }))
jest.mock("next/cache", () => ({ revalidatePath: (path: string) => mockRevalidate(path) }))
import { getAboutPageSettings, getPublicAboutPageSettings } from "@/lib/data/about-settings"
import { POST } from "@/app/api/admin/about-settings/route"

const fresh = () => structuredClone(DEFAULT_ABOUT_PAGE_SETTINGS)
const request = (settings: unknown, origin = "https://example.com") => new NextRequest("https://example.com/api/admin/about-settings", {
  method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify({ settings }),
})

beforeEach(() => {
  jest.clearAllMocks()
  mockRevalidate.mockReset()
  mockAdmin.mockResolvedValue({ id: "admin-id", role: "ADMIN" })
  mockUpsert.mockResolvedValue({ error: null })
  mockLoad.mockResolvedValue({ data: null, error: null })
  jest.spyOn(console, "error").mockImplementation(() => {})
})

describe("About settings compatibility and validation", () => {
  it("replaces only the known broken reports action, preserving custom actions", () => {
    const value = fresh()
    value.hero.secondaryCtaLabel = "View Annual Reports"
    value.hero.secondaryCtaUrl = "/impact#reports"
    expect(normalizeAboutPageSettings(value).hero).toMatchObject({ secondaryCtaLabel: "View Our Impact", secondaryCtaUrl: "/impact" })
    value.hero.secondaryCtaLabel = "Our custom action"
    expect(normalizeAboutPageSettings(value).hero.secondaryCtaUrl).toBe("/impact#reports")
  })

  it("allows video removal but requires captions for a retained video with speech", () => {
    const value = fresh()
    value.intro.media.hasSpeech = true
    expect(aboutPageSettingsSchema.safeParse(value).success).toBe(false)
    value.intro.media.src = ""
    expect(aboutPageSettingsSchema.safeParse(value).success).toBe(true)
    value.intro.media.src = "/video.mp4"
    value.intro.media.captionsSrc = "/captions.vtt"
    expect(aboutPageSettingsSchema.safeParse(value).success).toBe(true)
  })

  it("requires sharing-image descriptions and unique category identifiers", () => {
    const value = fresh()
    value.seo.image = "/sharing.png"
    expect(aboutPageSettingsSchema.safeParse(value).success).toBe(false)
    value.seo.imageAlt = "Children learning together"
    expect(aboutPageSettingsSchema.safeParse(value).success).toBe(true)
    value.partnerSection.categories[1].id = value.partnerSection.categories[0].id
    expect(aboutPageSettingsSchema.safeParse(value).success).toBe(false)
  })

  it.each(["javascript:alert(1)", "//evil.example", "/\\evil.example"])("rejects unsafe managed calls to action: %s", href => {
    const value = fresh()
    value.getInvolved.primaryHref = href
    expect(aboutPageSettingsSchema.safeParse(value).success).toBe(false)
  })
  it("preserves current defaults and retained legacy content on a round trip", () => {
    const value = { ...fresh(), whatWeDo: { cards: [{ id: "legacy-card", title: "Keep this content" }] } }
    expect(aboutPageSettingsSchema.parse(value)).toEqual(value)
    expect(normalizeAboutPageSettings(value)).toEqual(value)
    expect(aboutPageSettingsSchema.parse(JSON.parse(JSON.stringify(normalizeAboutPageSettings(value))))).toEqual(value)
  })

  it("fills missing nested fields without replacing copy or explicit empty lists", () => {
    const value = { hero: { headlineLine1: "Saved heading", trustBadges: [] }, intro: { paragraphs: [], flowSteps: [] } }
    const result = normalizeAboutPageSettings(value)
    expect(result.hero.headlineLine1).toBe("Saved heading")
    expect(result.hero.secondaryCtaUrl).toBe(DEFAULT_ABOUT_PAGE_SETTINGS.hero.secondaryCtaUrl)
    expect(result.hero.trustBadges).toEqual([])
    expect(result.intro.paragraphs).toEqual([])
    expect(result.intro.flowSteps).toEqual([])
    expect(result.journey).toEqual(DEFAULT_ABOUT_PAGE_SETTINGS.journey)
    expect(value).toEqual({ hero: { headlineLine1: "Saved heading", trustBadges: [] }, intro: { paragraphs: [], flowSteps: [] } })
  })

  it("matches legacy milestone defaults by ID after reordering, without inventing custom images", () => {
    const value = fresh()
    value.journey.milestones = [
      { id: "custom", year: "2030", title: "Our own milestone", description: "Custom copy" },
      { id: "building-understanding", year: "2023", title: "Saved title", description: "Saved description" },
      { id: "foundation-begins", year: "2022", title: "First", description: "Retained" },
    ]
    const result = normalizeAboutPageSettings(value)
    expect(result.journey.milestones.map(item => item.id)).toEqual(["custom", "building-understanding", "foundation-begins"])
    expect(result.journey.milestones[0].image).toBeUndefined()
    expect(result.journey.milestones[1]).toMatchObject({ year: "2024", title: "Saved title", image: DEFAULT_ABOUT_PAGE_SETTINGS.journey.milestones[1].image })
    expect(result.journey.milestones[2].image).toBe(DEFAULT_ABOUT_PAGE_SETTINGS.journey.milestones[0].image)
    expect(value.journey.milestones[1].year).toBe("2023")
  })

  it("preserves explicit image removal and a customized year", () => {
    const value = fresh()
    value.journey.milestones[1] = { ...value.journey.milestones[1], year: "2031", image: "" }
    expect(normalizeAboutPageSettings(value).journey.milestones[1]).toMatchObject({ year: "2031", image: "" })
  })

  it("corrects a known old headline without resetting custom intro content", () => {
    const value = fresh()
    value.intro = { ...value.intro, headline: "Every child deserves to be understood, accepted, and valued — just as they are.", paragraphs: ["Our saved introduction"], quote: "Our saved quote", flowSteps: ["Our label"] }
    const result = normalizeAboutPageSettings(value)
    expect(result.intro.headline).toBe("Every child deserves to be understood, accepted, and valued just as they are.")
    expect(result.intro.paragraphs).toEqual(["Our saved introduction"])
    expect(result.intro.quote).toBe("Our saved quote")
    expect(result.intro.flowSteps).toEqual(["Our label"])
  })

  it.each([undefined, null, {}, "broken", { hero: null }])("does not convert malformed saved content into defaults: %p", value => {
    expect(() => normalizeAboutPageSettings(value)).toThrow()
  })

  it("rejects the nested page document produced by the old Journey updater", () => {
    const value = fresh()
    expect(() => normalizeAboutPageSettings({ ...value, journey: { ...value, milestones: value.journey.milestones } })).toThrow()
  })

  it.each(["javascript:alert(1)", "//evil.example", "/\\evil.example", "data:text/html,test", "http://example.com", "https://user:password@example.com"])("rejects unsafe button URLs: %s", url => {
    const value = fresh()
    value.hero.primaryCtaUrl = url
    expect(aboutPageSettingsSchema.safeParse(value).success).toBe(false)
  })

  it("rejects duplicate IDs, oversized lists and images missing alternative text", () => {
    const value = fresh()
    expect(aboutPageSettingsSchema.safeParse({ ...value, howWeDoIt: { ...value.howWeDoIt, steps: [value.howWeDoIt.steps[0], value.howWeDoIt.steps[0]] } }).success).toBe(false)
    expect(aboutPageSettingsSchema.safeParse({ ...value, hero: { ...value.hero, trustBadges: Array.from({ length: 101 }, () => "Badge") } }).success).toBe(false)
    value.journey.milestones[0].imageAlt = ""
    expect(aboutPageSettingsSchema.safeParse(value).success).toBe(false)
  })
})

describe("About settings loading", () => {
  it("keeps valid live sections when hidden legacy content is invalid", () => {
    const value = fresh()
    value.hero.headlineLine1 = "Saved live headline"
    const recovered = resolvePublicAboutSettings({ ...value, journey: { ...value, milestones: value.journey.milestones } })
    expect(recovered.hero.headlineLine1).toBe("Saved live headline")
    expect(recovered.journey).toEqual(DEFAULT_ABOUT_PAGE_SETTINGS.journey)
  })

  it("keeps the public page available on a read failure while blocking the admin", async () => {
    mockLoad.mockResolvedValue({ data: null, error: { message: "unavailable" } })
    await expect(getPublicAboutPageSettings()).resolves.toEqual(DEFAULT_ABOUT_PAGE_SETTINGS)
    await expect(getAboutPageSettings()).rejects.toThrow("Could not load About content")
    expect(mockUpsert).not.toHaveBeenCalled()
  })
  it("uses defaults only for an absent row", async () => {
    await expect(getAboutPageSettings()).resolves.toEqual(DEFAULT_ABOUT_PAGE_SETTINGS)
    mockLoad.mockResolvedValue({ data: { value: null }, error: null })
    await expect(getAboutPageSettings()).rejects.toThrow("invalid")
  })

  it("blocks editing when the database fails instead of returning default content", async () => {
    mockLoad.mockResolvedValue({ data: null, error: { message: "unavailable" } })
    await expect(getAboutPageSettings()).rejects.toThrow("Could not load About content")
  })
})

describe("About settings save boundary", () => {
  it("rejects missing authentication, wrong permissions and cross-origin writes before persistence", async () => {
    mockAdmin.mockResolvedValue(null)
    expect((await POST(request(fresh()))).status).toBe(401)
    mockAdmin.mockResolvedValue({ id: "editor", role: "EDITOR" })
    expect((await POST(request(fresh()))).status).toBe(403)
    mockAdmin.mockResolvedValue({ id: "admin-id", role: "ADMIN" })
    expect((await POST(request(fresh(), "https://other.example"))).status).toBe(403)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it("rejects partial and unsafe documents without silently supplying defaults", async () => {
    expect((await POST(request({ hero: fresh().hero }))).status).toBe(400)
    const value = fresh()
    value.hero.secondaryCtaUrl = "javascript:invalid"
    const response = await POST(request(value))
    expect(response.status).toBe(400)
    expect((await response.json()).issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ["hero", "secondaryCtaUrl"] })]))
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it("rejects malformed JSON and oversized UTF-8 payloads before writing", async () => {
    const malformed = new NextRequest("https://example.com/api/admin/about-settings", { method: "POST", headers: { origin: "https://example.com" }, body: "{" })
    expect((await POST(malformed)).status).toBe(400)
    expect((await POST(request({ ...fresh(), retained: "é".repeat(500_001) }))).status).toBe(413)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it("writes the entire validated document and refreshes its real consumers", async () => {
    const value = { ...fresh(), retained: { value: "Keep me" } }
    value.hero.badge = "Our saved caption"
    const response = await POST(request(value))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ value, updated_by: "admin-id", key: "about_page_content" }), { onConflict: "key" })
    expect(mockRevalidate.mock.calls.map(([path]) => path)).toEqual(["/about", "/admin/about"])
  })

  it("reports write failure without exposing database details or requesting refresh", async () => {
    mockUpsert.mockResolvedValue({ error: { message: "internal database detail" } })
    const response = await POST(request(fresh()))
    expect(response.status).toBe(500)
    expect(JSON.stringify(await response.json())).not.toContain("internal database detail")
    expect(mockRevalidate).not.toHaveBeenCalled()
  })

  it("confirms persistence with a warning when invalidation fails after writing", async () => {
    mockRevalidate.mockImplementation(() => { throw new Error("cache unavailable") })
    const response = await POST(request(fresh()))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true, warning: expect.stringContaining("Saved") })
    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })
})
