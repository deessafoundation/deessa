"use client"

import { useReducer, useCallback, useEffect } from "react"
import type { ProgramSection } from "@/lib/programs/content"
import * as actions from "./section-actions"

const MAX_HISTORY = 50

interface SectionState {
  present: ProgramSection[]
  past: ProgramSection[][]
  future: ProgramSection[][]
}

type SectionAction =
  | { type: "SET"; sections: ProgramSection[] }
  | { type: "ADD"; sectionType: ProgramSection["content"]["type"]; index?: number }
  | { type: "REMOVE"; sectionId: string }
  | { type: "UPDATE"; sectionId: string; updates: Partial<ProgramSection> }
  | { type: "UPDATE_CONTENT"; sectionId: string; content: ProgramSection["content"] }
  | { type: "DUPLICATE"; sectionId: string }
  | { type: "MOVE"; oldIndex: number; newIndex: number }
  | { type: "TOGGLE_ENABLED"; sectionId: string }
  | { type: "UNDO" }
  | { type: "REDO" }

function pushState(state: SectionState, newPresent: ProgramSection[]): SectionState {
  return {
    present: newPresent,
    past: [...state.past.slice(-MAX_HISTORY + 1), state.present],
    future: [],
  }
}

function reducer(state: SectionState, action: SectionAction): SectionState {
  switch (action.type) {
    case "SET":
      return { present: action.sections, past: [], future: [] }
    case "ADD":
      return pushState(state, actions.addSection(state.present, action.sectionType, action.index))
    case "REMOVE":
      return pushState(state, actions.removeSection(state.present, action.sectionId))
    case "UPDATE":
      return pushState(state, actions.updateSection(state.present, action.sectionId, action.updates))
    case "UPDATE_CONTENT":
      return pushState(state, actions.updateSectionContent(state.present, action.sectionId, action.content))
    case "DUPLICATE":
      return pushState(state, actions.duplicateSection(state.present, action.sectionId))
    case "MOVE":
      return pushState(state, actions.moveSection(state.present, action.oldIndex, action.newIndex))
    case "TOGGLE_ENABLED":
      return pushState(state, actions.toggleSectionEnabled(state.present, action.sectionId))
    case "UNDO": {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future],
      }
    }
    case "REDO": {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        present: next,
        past: [...state.past, state.present],
        future: state.future.slice(1),
      }
    }
    default:
      return state
  }
}

export interface UseSectionStateReturn {
  sections: ProgramSection[]
  canUndo: boolean
  canRedo: boolean
  totalCount: number
  enabledCount: number
  setSections: (sections: ProgramSection[]) => void
  addSection: (type: ProgramSection["content"]["type"], index?: number) => void
  removeSection: (sectionId: string) => void
  updateSection: (sectionId: string, updates: Partial<ProgramSection>) => void
  updateSectionContent: (sectionId: string, content: ProgramSection["content"]) => void
  duplicateSection: (sectionId: string) => void
  moveSection: (oldIndex: number, newIndex: number) => void
  toggleSectionEnabled: (sectionId: string) => void
  undo: () => void
  redo: () => void
}

export function useSectionState(initial: ProgramSection[] = []): UseSectionStateReturn {
  const [state, dispatch] = useReducer(reducer, {
    present: initial,
    past: [],
    future: [],
  })

  const undo = useCallback(() => dispatch({ type: "UNDO" }), [])
  const redo = useCallback(() => dispatch({ type: "REDO" }), [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs/textareas or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }

      const isMod = e.metaKey || e.ctrlKey
      if (!isMod) return
      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); redo() }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  return {
    sections: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    totalCount: state.present.length,
    enabledCount: state.present.filter((s) => s.enabled).length,
    setSections: useCallback((sections: ProgramSection[]) => dispatch({ type: "SET", sections }), []),
    addSection: useCallback((type, index) => dispatch({ type: "ADD", sectionType: type, index }), []),
    removeSection: useCallback((id) => dispatch({ type: "REMOVE", sectionId: id }), []),
    updateSection: useCallback((id, updates) => dispatch({ type: "UPDATE", sectionId: id, updates }), []),
    updateSectionContent: useCallback((id, content) => dispatch({ type: "UPDATE_CONTENT", sectionId: id, content }), []),
    duplicateSection: useCallback((id) => dispatch({ type: "DUPLICATE", sectionId: id }), []),
    moveSection: useCallback((oldIdx, newIdx) => dispatch({ type: "MOVE", oldIndex: oldIdx, newIndex: newIdx }), []),
    toggleSectionEnabled: useCallback((id) => dispatch({ type: "TOGGLE_ENABLED", sectionId: id }), []),
    undo,
    redo,
  }
}
