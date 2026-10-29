import { describe, expect, it, jest } from "@jest/globals"
import { renderToStaticMarkup } from "react-dom/server"
import { DEFAULT_ABOUT_PAGE_SETTINGS } from "@/lib/types/about-settings"

jest.mock("@/lib/hooks/use-accessibility", () => ({ useAccessibility: () => ({ preferences: { reduceMotion: true, sensoryFriendly: false } }) }))
jest.mock("@/lib/supabase/client", () => ({ createClient: jest.fn() }))
jest.mock("@/lib/actions/admin-partners", () => ({ getPartners: jest.fn(), createPartner: jest.fn(), updatePartner: jest.fn(), deletePartner: jest.fn() }))
jest.mock("@/lib/actions/admin-team", () => ({ createTeamMember: jest.fn(), updateTeamMember: jest.fn(), deleteTeamMember: jest.fn() }))
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))
jest.mock("@/lib/notifications", () => ({ notifications: { showSuccess: jest.fn(), showError: jest.fn() } }))
import { AboutSections } from "@/app/(public)/about/AboutSections"
import { AboutSectionEditor, type AboutSection } from "@/components/admin/about/about-section-editor"
import AboutManagerClient from "@/components/admin/about/about-manager-client"
import { FileUpload } from "@/components/admin/media/file-upload"
import { TeamCard } from "@/components/about/team-card"
import { TeamMemberForm } from "@/components/admin/team/team-member-form"
import { AboutHero } from "@/components/about/about-hero"

describe("About CMS rendering contracts", () => {
  it("omits an empty photo column rather than inventing Team portraits", () => {
    const html = renderToStaticMarkup(<AboutHero teamMembers={[]} />)
    expect(html).toContain('data-has-portraits="false"')
    expect(html).not.toContain("<figure")
  })
  it("renders the linked Team manager with labeled photo and profile controls", () => {
    const html = renderToStaticMarkup(<TeamMemberForm />)
    for (const match of html.matchAll(/<label[^>]*for="([^"]+)"/g)) expect(html).toContain(`id="${match[1]}"`)
    expect(html).toContain('type="file"')
    expect(html).toContain("Add Member")
  })
  it("uses root CMS intro values and renders a text-only introduction after video removal", () => {
    const settings = structuredClone(DEFAULT_ABOUT_PAGE_SETTINGS)
    settings.intro.headline = "Edited root introduction"
    settings.intro.media.src = ""
    const html = renderToStaticMarkup(<AboutSections settings={settings} />)
    expect(html).toContain("Edited root")
    expect(html).not.toContain("<video")
    expect(html).toContain('data-has-media="false"')
  })

  it("keeps social links separate from the native profile button and rejects unsafe URLs", () => {
    const html = renderToStaticMarkup(<TeamCard member={{ id: "person", name: "Our Person", role: "Advocate", bio: null, image: null, social_links: { facebook: "https://facebook.com/person", twitter: "javascript:alert(1)" } }} index={0} active={false} onActivate={() => {}} reduced />)
    expect(html).toContain('aria-controls="about-team-profile-person"')
    expect(html).toMatch(/<button[^>]*><\/button>/)
    expect(html).toContain('href="https://facebook.com/person"')
    expect(html).not.toContain("javascript:")
    expect(html).toContain('inert=""')
  })
  it.each(["hero", "intro", "howWeDoIt", "governance", "people", "partnerSection", "getInvolved", "pageSettings"] as AboutSection[])("every editor associates its field labels: %s", section => {
    const html = renderToStaticMarkup(<AboutSectionEditor section={section} settings={DEFAULT_ABOUT_PAGE_SETTINGS} onUpdate={() => {}} errors={{}} onUploadBusy={() => {}} onUploadError={() => {}} />)
    expect(html).toContain("<label")
    for (const match of html.matchAll(/<label[^>]*for="([^"]+)"/g)) expect(html).toContain(`id="${match[1]}"`)
    for (const match of html.matchAll(/<(?:input|textarea)\b[^>]*>/g)) {
      if (/type="hidden"|aria-hidden="true"/.test(match[0])) continue
      expect(match[0]).toMatch(/\bid="[^"]+"/)
    }
  })

  it("binds edited governance, team, category, and CTA copy to public output", () => {
    const settings = structuredClone(DEFAULT_ABOUT_PAGE_SETTINGS)
    settings.governance.title = "Our edited governance"
    settings.people.emptyMessage = "No published people today"
    settings.partnerSection.categories[0].label = "Edited category"
    settings.getInvolved.title = "Our edited invitation"
    settings.getInvolved.primaryHref = "/get-involved"
    const html = renderToStaticMarkup(<AboutSections settings={settings} intro={settings.intro} howWeDoIt={settings.howWeDoIt} teamMembers={[]} />)
    for (const copy of ["Our edited governance", "No published people today", "Edited category", "Our edited invitation"]) expect(html).toContain(copy)
    expect(html).not.toContain("autoplay=")
    expect(html).toContain('href="/get-involved"')
  })

  it("hides disabled sections without restoring retired Journey", () => {
    const settings = structuredClone(DEFAULT_ABOUT_PAGE_SETTINGS)
    settings.visibility.governance = false
    settings.visibility.partners = false
    const html = renderToStaticMarkup(<AboutSections settings={settings} intro={settings.intro} />)
    expect(html).not.toContain('id="organization"')
    expect(html).not.toContain('id="partners"')
    expect(html).not.toContain('id="journey"')
  })

  it("gives Partners editors record access without exposing page editors", () => {
    const html = renderToStaticMarkup(<AboutManagerClient initialSettings={DEFAULT_ABOUT_PAGE_SETTINGS} userId="editor" canEditPage={false} canManagePartners initialTab="partners" initialPartners={[]} />)
    expect(html).toContain("Partner records")
    expect(html).not.toContain("Save &amp; publish")
    expect(html).not.toContain('id="about-hero-headlineLine1"')
  })

  it("uses a keyboard-operable file input and names draft removal", () => {
    const html = renderToStaticMarkup(<FileUpload bucket="partner-logos" currentUrl="https://example.com/logo.png" label="Partner logo" onUpload={() => {}} />)
    expect(html).toContain('type="file"')
    expect(html).not.toMatch(/<input[^>]*type="file"[^>]*class="hidden"/)
    expect(html).toContain("Remove Partner logo from this draft")
  })
})
