import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { renderToStaticMarkup } from "react-dom/server"
import { DEFAULT_ABOUT_PAGE_SETTINGS } from "@/lib/types/about-settings"

const mockSettings = jest.fn<() => Promise<typeof DEFAULT_ABOUT_PAGE_SETTINGS>>()
const mockTeam = jest.fn<() => Promise<{ members: []; unavailable: boolean }>>()
jest.mock("@/lib/data/about-settings", () => ({ getPublicAboutPageSettings: () => mockSettings() }))
jest.mock("@/lib/data/about-team", () => ({ getAboutTeamMembers: () => mockTeam() }))
jest.mock("@/lib/hooks/use-accessibility", () => ({ useAccessibility: () => ({ preferences: { reduceMotion: true, sensoryFriendly: false } }) }))
import AboutPage, { generateMetadata } from "@/app/(public)/about/page"

beforeEach(() => {
  mockSettings.mockResolvedValue(structuredClone(DEFAULT_ABOUT_PAGE_SETTINGS))
  mockTeam.mockResolvedValue({ members: [], unavailable: false })
})
describe("Public About page contract", () => {
  it("uses managed SEO while preserving the canonical About route", async () => {
    const settings = structuredClone(DEFAULT_ABOUT_PAGE_SETTINGS)
    settings.seo = { title: "Our edited title", description: "Edited search description", keywords: ["Edited keyword"], image: "/edited-sharing.jpg", imageAlt: "Edited image description", noIndex: true }
    mockSettings.mockResolvedValue(settings)
    const metadata = await generateMetadata()
    expect(metadata).toMatchObject({ title: "Our edited title | deessa Foundation", description: "Edited search description", keywords: ["Edited keyword"], robots: { index: false, follow: false }, openGraph: { images: [{ url: "/edited-sharing.jpg", alt: "Edited image description" }] } })
    expect(metadata.alternates?.canonical).toEqual(expect.stringMatching(/\/about$/))
  })
  it("passes an intentionally empty team through to both public consumers", async () => {
    const html = renderToStaticMarkup(await AboutPage())
    expect(html).toContain("Team members coming soon.")
    expect(html).not.toContain("<figure")
    expect(html).not.toContain("Team profiles are temporarily unavailable")
  })
  it("passes the unavailable state through without publishing fallback profiles", async () => {
    mockTeam.mockResolvedValue({ members: [], unavailable: true })
    const html = renderToStaticMarkup(await AboutPage())
    expect(html).toContain("Team profiles are temporarily unavailable")
    expect(html).not.toContain("<figure")
  })
})
