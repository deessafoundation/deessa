import { normalizeForSpeech } from "@/lib/tts/text-normalizer"
import {
  clearTranslationCache,
  translateSectionsToNepali,
} from "@/lib/tts/translator"
import type { SpeechSection } from "@/lib/tts/types"

const source = normalizeForSpeech(
  "deessa began with two little girls, our twin daughters, Deetya and Marissa.",
  "ne-NP"
)

function section(): SpeechSection {
  return {
    id: "story",
    text: source,
    locale: "ne-NP",
    element: {} as HTMLElement,
    kind: "paragraph",
  }
}

afterEach(() => {
  jest.restoreAllMocks()
  clearTranslationCache()
})

it("translates an English paragraph even when pronunciation inserted Nepali letters", async () => {
  const translated = "दीसा दुई साना केटीहरूबाट सुरु भयो।"
  const request = jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ translations: [translated] }),
  } as Response)

  const result = await translateSectionsToNepali([section()])

  expect(source).toContain("दीसा")
  expect(request).toHaveBeenCalledTimes(1)
  expect(JSON.parse(request.mock.calls[0]![1]!.body as string).texts).toEqual([source])
  expect(result).toMatchObject({ translated: 1, failed: 0 })
  expect(result.sections[0]).toMatchObject({ locale: "ne-NP", text: translated })
})

it("does not switch an untranslated paragraph to an English voice", async () => {
  jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ translations: [null] }),
  } as Response)

  const result = await translateSectionsToNepali([section()])

  expect(result).toMatchObject({ translated: 0, failed: 1 })
  expect(result.sections[0]).toMatchObject({ locale: "ne-NP", text: source })
})

it("rejects a provider result that is still mostly English", async () => {
  jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ translations: [source] }),
  } as Response)

  const result = await translateSectionsToNepali([section()])

  expect(result).toMatchObject({ translated: 0, failed: 1 })
})
