import { normalizeForSpeech } from "@/lib/tts/text-normalizer"

describe("normalizeForSpeech", () => {
  it("speaks the organisation name as words, never as initials", () => {
    expect(
      normalizeForSpeech("Deessa Foundation supports families.", "en-US")
    ).toBe("Dee sah Foundation supports families.")

    expect(normalizeForSpeech("DEESSA is here.", "en-US")).toBe(
      "Dee sah is here."
    )
  })

  it("uses the Nepali spelling when Nepali speech is selected", () => {
    expect(normalizeForSpeech("deessa Foundation", "ne-NP")).toBe(
      "दीसा Foundation"
    )
  })
})
