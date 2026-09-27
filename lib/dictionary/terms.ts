export type DictionaryResult = {
  term: string
  language: 'en'
  senses: { partOfSpeech: string; definition: string }[]
  sourceUrl: string
  licenseName: string
  licenseUrl: string
}

export function normalizeTerm(value: string): string | null {
  const term = value.normalize('NFC').trim().replace(/^[“”‘’"'([{.,;:!?]+|[“”‘’"')\]}.,;:!?]+$/g, '')
  return [...term].length <= 64 && /^[\p{Script=Latin}][\p{Script=Latin}\p{M}]*(?:[-'’][\p{Script=Latin}][\p{Script=Latin}\p{M}]*)*$/u.test(term) ? term : null
}

export const dictionarySource = (term: string) => `https://en.wiktionary.org/wiki/${encodeURIComponent(term)}#English`

export function dictionaryAllowedOnPath(path: string) {
  return !/^\/(?:admin|donate|complete-payment|payments|verify|receipt|receipts)(?:\/|$)/.test(path) && !/\/register(?:\/|$)/.test(path)
}
