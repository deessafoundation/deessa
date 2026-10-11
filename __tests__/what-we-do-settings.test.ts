import { describe, expect, it } from "@jest/globals"
import { DEFAULT_WHAT_WE_DO_SETTINGS, whatWeDoSettingsSchema } from "@/lib/types/what-we-do-settings"

describe("What We Do card settings", () => {
  it("loads legacy documents without replacing saved copy or changing icon identities", () => {
    const { cardsLayout: _layout, ...legacy } = structuredClone(DEFAULT_WHAT_WE_DO_SETTINGS)
    legacy.cards[0].title = "Our saved campaign title"
    legacy.cards.reverse()
    const result = whatWeDoSettingsSchema.parse(legacy)
    expect(result.cards.map(card => [card.slug, card.icon, card.tag])).toEqual([
      ["advocacy", "scale", "Policies"],
      ["resources", "file-text", "Resources"],
      ["training", "book-open", "Trained"],
      ["awareness", "megaphone", "Communities"],
    ])
    expect(result.cards[3].title).toBe("Our saved campaign title")
    expect(result.cards[3].enabled).toBe(true)
    expect(result.cardsLayout).toEqual({ columns: "4", spacing: "comfortable" })
  })

  it("preserves added cards, order, visibility, appearance and layout on round trip", () => {
    const settings = whatWeDoSettingsSchema.parse(DEFAULT_WHAT_WE_DO_SETTINGS)
    const custom = { ...settings.cards[0], slug: "community-partners", icon: "handshake", tag: "Partners", accent: "mint", arrow: "arrow-up-right", enabled: false, showIcon: false, showArrow: false, showDecoration: false }
    const result = whatWeDoSettingsSchema.parse({ ...settings, cards: [custom, settings.cards[2]], cardsLayout: { columns: "2", spacing: "compact" } })
    expect(result.cards).toEqual([custom, settings.cards[2]])
    expect(result.cardsLayout).toEqual({ columns: "2", spacing: "compact" })
    expect(whatWeDoSettingsSchema.parse(JSON.parse(JSON.stringify(result)))).toEqual(result)
    expect(whatWeDoSettingsSchema.parse({ ...settings, cards: [] }).cards).toEqual([])
  })

  it("rejects duplicate identities, unsafe URLs, arbitrary SVGs and unsupported themes", () => {
    const settings = whatWeDoSettingsSchema.parse(DEFAULT_WHAT_WE_DO_SETTINGS)
    expect(whatWeDoSettingsSchema.safeParse({ ...settings, cards: [settings.cards[0], settings.cards[0]] }).success).toBe(false)
    for (const patch of [{ href: "javascript:alert(1)" }, { href: "//example.com" }, { icon: "<svg onload=alert(1)>" }, { accent: "invisible" }, { slug: "../other" }, { arbitraryField: true }]) {
      expect(whatWeDoSettingsSchema.safeParse({ ...settings, cards: [{ ...settings.cards[0], ...patch }] }).success).toBe(false)
    }
    expect(whatWeDoSettingsSchema.safeParse({ ...settings, cardsLayout: { columns: "20", spacing: "compact" } }).success).toBe(false)
    expect(whatWeDoSettingsSchema.safeParse({ ...settings, cards: Array.from({ length: 21 }, (_, index) => ({ ...settings.cards[0], slug: `area-${index}` })) }).success).toBe(false)
  })
})
