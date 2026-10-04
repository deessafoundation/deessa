import type { ProgramSection } from "@/lib/programs/content"

export type SectionType = ProgramSection["content"]["type"]

export interface SectionTypeConfig {
  type: SectionType
  label: string
  description: string
  icon: string
  accent: string
}

export const SECTION_TYPES: SectionTypeConfig[] = [
  { type: "built_in_demo", label: "Communication Board", description: "Interactive Research concept with checklist", icon: "MessageCircle", accent: "#3FABDE" },
  { type: "rich_text", label: "Rich Text", description: "Formatted text content", icon: "FileText", accent: "#3FABDE" },
  { type: "stats", label: "Statistics", description: "Key metrics and numbers", icon: "BarChart3", accent: "#F59E0B" },
  { type: "gallery", label: "Image Gallery", description: "Grid or story layout images", icon: "Images", accent: "#0EA5E9" },
  { type: "features", label: "Features", description: "Grid or list of features", icon: "LayoutGrid", accent: "#D6336C" },
  { type: "how_it_works", label: "How It Works", description: "Step-by-step process", icon: "ListOrdered", accent: "#95C11F" },
  { type: "timeline", label: "Timeline", description: "Milestones with dates", icon: "Clock", accent: "#0B5F8A" },
  { type: "quote", label: "Quote", description: "Testimonial or statement", icon: "Quote", accent: "#8B5CF6" },
  { type: "faq", label: "FAQ", description: "Frequently asked questions", icon: "HelpCircle", accent: "#3FABDE" },
  { type: "progress_tracker", label: "Progress Tracker", description: "Goal progress bar", icon: "TrendingUp", accent: "#F59E0B" },
  { type: "cta", label: "Call to Action", description: "Action buttons with links", icon: "MousePointerClick", accent: "#3FABDE" },
  { type: "activities", label: "Activities", description: "Events and activities", icon: "Calendar", accent: "#F59E0B" },
  { type: "resources", label: "Resources", description: "Links and documents", icon: "BookOpen", accent: "#95C11F" },
  { type: "who_we_support", label: "Who We Support", description: "Target audience groups", icon: "Users", accent: "#D6336C" },
  { type: "facts_bar", label: "Facts Bar", description: "4-column key-value info strip", icon: "AlignJustify", accent: "#3FABDE" },
  { type: "story", label: "Story", description: "Photo, quote, and mini stats", icon: "BookMarked", accent: "#8B5CF6" },
]

export const SECTION_TYPE_MAP = Object.fromEntries(
  SECTION_TYPES.map((s) => [s.type, s])
) as Record<SectionType, SectionTypeConfig>

export const SECTION_CATEGORIES = [
  {
    name: "Content",
    types: ["rich_text", "quote", "story", "faq"] as SectionType[],
  },
  {
    name: "Data & Metrics",
    types: ["stats", "progress_tracker", "facts_bar"] as SectionType[],
  },
  {
    name: "Media",
    types: ["gallery"] as SectionType[],
  },
  {
    name: "Structure",
    types: ["features", "how_it_works", "timeline", "who_we_support"] as SectionType[],
  },
  {
    name: "Engagement",
    types: ["cta", "activities", "resources", "built_in_demo"] as SectionType[],
  },
]

export function createEmptyContent(type: SectionType): ProgramSection["content"] {
  switch (type) {
    case "rich_text":
      return { type: "rich_text", body: "" }
    case "stats":
      return { type: "stats", stats: [{ value: "", label: "" }] }
    case "gallery":
      return { type: "gallery", layout: "grid", images: [] }
    case "features":
      return { type: "features", layout: "grid", features: [{ title: "", description: "" }] }
    case "how_it_works":
      return { type: "how_it_works", items: [{ title: "", description: "" }] }
    case "timeline":
      return { type: "timeline", items: [{ title: "", description: "", date: "", status: "upcoming" }] }
    case "quote":
      return { type: "quote", quote: "", person: "" }
    case "faq":
      return { type: "faq", items: [{ question: "", answer: "" }] }
    case "progress_tracker":
      return { type: "progress_tracker", current: 0, goal: 100, unit: "families" }
    case "cta":
      return { type: "cta", title: "", description: "", buttons: [{ label: "", url: "/", variant: "primary" }] }
    case "activities":
      return { type: "activities", activities: [{ place: "", date: "", title: "", description: "" }] }
    case "resources":
      return { type: "resources", resources: [{ label: "", description: "", url: "/" }] }
    case "who_we_support":
      return { type: "who_we_support", groups: [{ title: "", description: "" }] }
    case "facts_bar":
      return { type: "facts_bar", facts: [{ label: "", value: "" }] }
    case "story":
      return { type: "story", quote: "", person: "", stats: [] }
    case "built_in_demo":
      return { type: "built_in_demo", component: "communication_board" }
  }
}

export function generateSectionId(type: SectionType): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  const prefix = type.replace(/_/g, "-")
  return `${prefix}-${ts}-${rand}`.slice(0, 80)
}

export function createSection(type: SectionType): ProgramSection {
  return {
    id: generateSectionId(type),
    enabled: true,
    content: createEmptyContent(type),
  }
}

export type ProgramCategoryType = "service" | "outreach" | "research" | "campaign"

export const CATEGORY_DEFAULTS: Record<ProgramCategoryType, { label: string; sectionTypes: SectionType[] }> = {
  service: {
    label: "Service",
    sectionTypes: ["facts_bar", "features", "how_it_works", "story", "faq", "cta", "stats", "gallery"],
  },
  outreach: {
    label: "Outreach",
    sectionTypes: ["stats", "rich_text", "activities", "gallery", "quote", "cta", "stats", "gallery"],
  },
  research: {
    label: "Research",
    sectionTypes: ["rich_text", "how_it_works", "built_in_demo", "features", "faq", "cta", "stats", "gallery"],
  },
  campaign: {
    label: "Campaign",
    sectionTypes: ["progress_tracker", "rich_text", "features", "timeline", "story", "stats", "gallery", "cta"],
  },
}

export function getDefaultSectionsForCategory(category: ProgramCategoryType): ProgramSection[] {
  const config = CATEGORY_DEFAULTS[category]
  return config.sectionTypes.map((type, index) => {
    const section = createSection(type)
    if (category === "research" && type === "features") section.presentation = "insights"
    if (category === "research" && type === "rich_text") section.presentation = "question"
    if (category === "outreach" && type === "stats") section.presentation = index === 0 ? "ribbon" : "auto"
    if (category === "outreach" && type === "gallery") section.presentation = index === 3 ? "essay" : "auto"
    return section
  })
}
