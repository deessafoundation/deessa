export type HomeTone = "sky" | "sunny" | "lavender" | "mint"

const CYCLE: HomeTone[] = ["sky", "sunny", "lavender", "mint"]

const KEYWORDS: [RegExp, HomeTone][] = [
  [/blue|sky|cyan/i, "sky"],
  [/green|emerald|lime|teal/i, "mint"],
  [/orange|amber|yellow/i, "sunny"],
  [/purple|violet|indigo|pink|fuchsia|rose/i, "lavender"],
]

/** Map a CMS colour class (e.g. "bg-blue-500") to a pastel tone; unknown values cycle by index. */
export function getHomeTone(colorClass: string | undefined, index: number): HomeTone {
  if (typeof colorClass === "string" && colorClass) {
    for (const [pattern, tone] of KEYWORDS) {
      if (pattern.test(colorClass)) return tone
    }
  }
  const i = Number.isFinite(index) ? Math.abs(Math.trunc(index)) : 0
  return CYCLE[i % CYCLE.length]
}

/** Split a CMS heading into a plain lead and a highlighted last word. */
export function splitHeadingAccent(text: string | undefined): { lead: string; accent: string } {
  const words = typeof text === "string" ? text.trim().split(/\s+/).filter(Boolean) : []
  if (words.length === 0) return { lead: "", accent: "" }
  const accent = words[words.length - 1]
  return { lead: words.slice(0, -1).join(" "), accent }
}
