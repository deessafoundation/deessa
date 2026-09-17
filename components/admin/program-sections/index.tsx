"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Undo2, Redo2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ProgramSection } from "@/lib/programs/content"
import { useSectionState, type UseSectionStateReturn } from "./useSectionState"
import { SectionTypePicker } from "./SectionTypePicker"
import { SectionList } from "./SectionList"
import { SectionPropertiesPanel } from "./SectionPropertiesPanel"
import { SECTION_TYPE_MAP } from "./types"
import { ProgramIdProvider } from "./program-id-context"

interface SectionEditorProps {
  programId: string
  initialSections: ProgramSection[]
  onChange: (sections: ProgramSection[]) => void
}

export function SectionEditor({ programId, initialSections, onChange }: SectionEditorProps) {
  const state = useSectionState(initialSections)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showDisabled, setShowDisabled] = useState(true)
  const isInitialMount = useRef(true)

  // Sync section state to parent whenever it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    onChange(state.sections)
  }, [state.sections, onChange])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const selectedSection = state.sections.find((s) => s.id === selectedId) ?? null

  // Auto-select newly added sections
  const prevCountRef = useRef(state.sections.length)
  useEffect(() => {
    if (state.sections.length > prevCountRef.current && state.sections.length > 0) {
      // A section was added — select the last one (newest)
      const lastSection = state.sections[state.sections.length - 1]
      if (lastSection) setSelectedId(lastSection.id)
    }
    prevCountRef.current = state.sections.length
  }, [state.sections])

  const handleAdd = useCallback(
    (type: ProgramSection["content"]["type"]) => {
      state.addSection(type)
    },
    [state]
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = state.sections.findIndex((s) => s.id === active.id)
      const newIndex = state.sections.findIndex((s) => s.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        state.moveSection(oldIndex, newIndex)
      }
    },
    [state]
  )

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const handleUpdateContent = useCallback(
    (content: ProgramSection["content"]) => {
      if (!selectedId) return
      state.updateSectionContent(selectedId, content)
    },
    [selectedId, state]
  )

  const filteredSections = showDisabled
    ? state.sections
    : state.sections.filter((s) => s.enabled)

  const activeSection = activeId ? state.sections.find((s) => s.id === activeId) : null

  return (
    <ProgramIdProvider programId={programId}>
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <SectionTypePicker onAdd={handleAdd} />
          <div className="h-5 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={state.undo}
            disabled={!state.canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={state.redo}
            disabled={!state.canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDisabled(!showDisabled)}
            className="text-xs"
          >
            {showDisabled ? <EyeOff className="mr-1.5 h-3 w-3" /> : <Eye className="mr-1.5 h-3 w-3" />}
            {showDisabled ? "Hide disabled" : "Show disabled"}
          </Button>
          <Badge variant="outline" className="text-xs">
            {state.enabledCount}/{state.totalCount} sections
          </Badge>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Left: Section list */}
        <div className="min-h-[200px]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SectionList
              sections={filteredSections}
              allSections={state.sections}
              selectedId={selectedId}
              onSelect={handleSelect}
              onRemove={state.removeSection}
              onDuplicate={state.duplicateSection}
              onToggleEnabled={state.toggleSectionEnabled}
              onAdd={handleAdd}
            />
            <DragOverlay>
              {activeSection ? (
                <div className="rounded-lg border bg-background px-4 py-3 shadow-lg opacity-90">
                  <span className="text-sm font-medium">
                    {SECTION_TYPE_MAP[activeSection.content.type]?.label ?? activeSection.content.type}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Right: Properties panel */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <SectionPropertiesPanel
            section={selectedSection}
            onUpdate={state.updateSection}
            onUpdateContent={handleUpdateContent}
            onRemove={state.removeSection}
            onDuplicate={state.duplicateSection}
          />
        </div>
      </div>
    </div>
    </ProgramIdProvider>
  )
}
