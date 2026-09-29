import { normalizeForSpeech } from "@/lib/tts/text-normalizer"

describe("normalizeForSpeech", () => {
  it("speaks the organisation name as words, never as initials", () => {
    expect(
      normalizeForSpeech("deessa Foundation supports families.", "en-US")
    ).toBe("Dee sah Foundation supports families.")

    expect(normalizeForSpeech("deessa is here.", "en-US")).toBe(
      "Dee sah is here."
    )
  })

  it("uses the Nepali spelling when Nepali speech is selected", () => {
    expect(normalizeForSpeech("deessa Foundation", "ne-NP")).toBe(
      "दीसा Foundation"
    )
  })

  it("speaks 2022 as Nepali words in Nepali mode", () => {
    expect(normalizeForSpeech("Founded in 2022", "ne-NP")).toBe(
      "Founded in सन् दुई हजार बाइस"
    )
  })
})
