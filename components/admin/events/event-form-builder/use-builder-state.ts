"use client"

import { useReducer, useCallback, useEffect } from "react"
import type { FormSchema, FormField, FormStep, FieldType } from "@/lib/types/conference-form-schema"
import {
  addFieldToStep,
  removeFieldFromStep,
  updateFieldInSchema,
  reorderFieldsInStep,
  moveFieldToStep,
  reorderSteps,
  addStep as addStepAction,
  removeStep as removeStepAction,
  updateStepInSchema,
  duplicateField,
  countFields,
} from "./builder-actions"

// ── Action types ───────────────────────────────────────────────────────────────
type BuilderAction =
  | { type: "SET_SCHEMA"; schema: FormSchema }
  | { type: "ADD_FIELD"; stepId: string; fieldType: FieldType }
  | { type: "REMOVE_FIELD"; stepId: string; fieldId: string }
  | { type: "UPDATE_FIELD"; stepId: string; fieldId: string; updates: Partial<FormField> }
  | { type: "REORDER_FIELDS"; stepId: string; oldIndex: number; newIndex: number }
  | { type: "MOVE_FIELD_TO_STEP"; fromStepId: string; toStepId: string; fieldId: string; newIndex?: number }
  | { type: "DUPLICATE_FIELD"; stepId: string; fieldId: string }
  | { type: "ADD_STEP" }
  | { type: "REMOVE_STEP"; stepId: string }
  | { type: "UPDATE_STEP"; stepId: string; updates: Partial<FormStep> }
  | { type: "REORDER_STEPS"; oldIndex: number; newIndex: number }
  | { type: "UNDO" }
  | { type: "REDO" }

// ── State shape ────────────────────────────────────────────────────────────────
interface BuilderState {
  present: FormSchema
  past: FormSchema[]
  future: FormSchema[]
}

const MAX_HISTORY = 50

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  const { present, past, future } = state

  function pushState(newSchema: FormSchema): BuilderState {
    return {
      present: newSchema,
      past: [...past.slice(-(MAX_HISTORY - 1)), present],
      future: [],
    }
  }

  switch (action.type) {
    case "SET_SCHEMA":
      return pushState(action.schema)

    case "ADD_FIELD":
      return pushState(addFieldToStep(present, action.stepId, action.fieldType))

    case "REMOVE_FIELD":
      return pushState(removeFieldFromStep(present, action.stepId, action.fieldId))

    case "UPDATE_FIELD":
      return pushState(updateFieldInSchema(present, action.stepId, action.fieldId, action.updates))

    case "REORDER_FIELDS":
      return pushState(reorderFieldsInStep(present, action.stepId, action.oldIndex, action.newIndex))

    case "MOVE_FIELD_TO_STEP":
      return pushState(moveFieldToStep(present, action.fromStepId, action.toStepId, action.fieldId, action.newIndex))

    case "DUPLICATE_FIELD": {
      const step = present.steps.find((s) => s.id === action.stepId)
      const field = step?.fields.find((f) => f.id === action.fieldId)
      if (!step || !field) return state
      const newField = duplicateField(field, step.fields.length)
      return pushState({
        ...present,
        steps: present.steps.map((s) =>
          s.id === action.stepId ? { ...s, fields: [...s.fields, newField] } : s
        ),
      })
    }

    case "ADD_STEP":
      return pushState(addStepAction(present))

    case "REMOVE_STEP":
      return pushState(removeStepAction(present, action.stepId))

    case "UPDATE_STEP":
      return pushState(updateStepInSchema(present, action.stepId, action.updates))

    case "REORDER_STEPS":
      return pushState(reorderSteps(present, action.oldIndex, action.newIndex))

    case "UNDO":
      if (past.length === 0) return state
      return {
        present: past[past.length - 1],
        past: past.slice(0, -1),
        future: [present, ...future],
      }

    case "REDO":
      if (future.length === 0) return state
      return {
        present: future[0],
        past: [...past, present],
        future: future.slice(1),
      }

    default:
      return state
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useBuilderState(initialSchema: FormSchema) {
  const [state, dispatch] = useReducer(reducer, {
    present: initialSchema,
    past: [],
    future: [],
  })

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        dispatch({ type: "UNDO" })
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault()
        dispatch({ type: "REDO" })
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault()
        dispatch({ type: "REDO" })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const schema = state.present
  const canUndo = state.past.length > 0
  const canRedo = state.future.length > 0
  const totalFields = countFields(schema)

  const addField = useCallback((stepId: string, fieldType: FieldType) =>
    dispatch({ type: "ADD_FIELD", stepId, fieldType }), [])

  const removeField = useCallback((stepId: string, fieldId: string) =>
    dispatch({ type: "REMOVE_FIELD", stepId, fieldId }), [])

  const updateField = useCallback((stepId: string, fieldId: string, updates: Partial<FormField>) =>
    dispatch({ type: "UPDATE_FIELD", stepId, fieldId, updates }), [])

  const reorderFields = useCallback((stepId: string, oldIndex: number, newIndex: number) =>
    dispatch({ type: "REORDER_FIELDS", stepId, oldIndex, newIndex }), [])

  const moveFieldToStepAction = useCallback((fromStepId: string, toStepId: string, fieldId: string, newIndex?: number) =>
    dispatch({ type: "MOVE_FIELD_TO_STEP", fromStepId, toStepId, fieldId, newIndex }), [])

  const duplicateFieldAction = useCallback((stepId: string, fieldId: string) =>
    dispatch({ type: "DUPLICATE_FIELD", stepId, fieldId }), [])

  const addStepActionDispatch = useCallback(() =>
    dispatch({ type: "ADD_STEP" }), [])

  const removeStep = useCallback((stepId: string) =>
    dispatch({ type: "REMOVE_STEP", stepId }), [])

  const updateStep = useCallback((stepId: string, updates: Partial<FormStep>) =>
    dispatch({ type: "UPDATE_STEP", stepId, updates }), [])

  const reorderStepsAction = useCallback((oldIndex: number, newIndex: number) =>
    dispatch({ type: "REORDER_STEPS", oldIndex, newIndex }), [])

  const undo = useCallback(() => dispatch({ type: "UNDO" }), [])
  const redo = useCallback(() => dispatch({ type: "REDO" }), [])

  const setSchema = useCallback((newSchema: FormSchema) =>
    dispatch({ type: "SET_SCHEMA", schema: newSchema }), [])

  return {
    schema,
    canUndo,
    canRedo,
    totalFields,
    addField,
    removeField,
    updateField,
    reorderFields,
    moveFieldToStep: moveFieldToStepAction,
    duplicateField: duplicateFieldAction,
    addStep: addStepActionDispatch,
    removeStep,
    updateStep,
    reorderSteps: reorderStepsAction,
    setSchema,
    undo,
    redo,
  }
}
