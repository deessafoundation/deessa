import type { ProgramSection } from "@/lib/programs/content"
import type { SectionType } from "./types"
import { createSection } from "./types"

export function addSection(sections: ProgramSection[], type: SectionType, index?: number): ProgramSection[] {
  const insertAt = index !== undefined ? index : sections.length
  const newSection = createSection(type)
  const next = [...sections]
  next.splice(insertAt, 0, newSection)
  return next
}

export function removeSection(sections: ProgramSection[], sectionId: string): ProgramSection[] {
  return sections.filter((s) => s.id !== sectionId)
}

export function updateSection(sections: ProgramSection[], sectionId: string, updates: Partial<ProgramSection>): ProgramSection[] {
  return sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
}

export function updateSectionContent(
  sections: ProgramSection[],
  sectionId: string,
  content: ProgramSection["content"]
): ProgramSection[] {
  return sections.map((s) => (s.id === sectionId ? { ...s, content } : s))
}

export function duplicateSection(sections: ProgramSection[], sectionId: string): ProgramSection[] {
  const idx = sections.findIndex((s) => s.id === sectionId)
  if (idx === -1) return sections
  const original = sections[idx]
  const clone: ProgramSection = {
    ...structuredClone(original),
    id: `${original.id}-copy-${Date.now().toString(36)}`.slice(0, 80),
  }
  const next = [...sections]
  next.splice(idx + 1, 0, clone)
  return next
}

export function moveSection(sections: ProgramSection[], oldIndex: number, newIndex: number): ProgramSection[] {
  if (oldIndex === newIndex) return sections
  const next = [...sections]
  const [moved] = next.splice(oldIndex, 1)
  next.splice(newIndex, 0, moved)
  return next
}

export function toggleSectionEnabled(sections: ProgramSection[], sectionId: string): ProgramSection[] {
  return sections.map((s) => (s.id === sectionId ? { ...s, enabled: !s.enabled } : s))
}
