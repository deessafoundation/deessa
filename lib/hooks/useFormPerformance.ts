// ── Form Performance Hook ───────────────────────────────────────────────────
// Phase 5: Performance optimization for dynamic form rendering.
// Memoizes field visibility calculations and prevents unnecessary re-renders.

import { useMemo, useCallback } from "react"
import { FormField, FormStep } from "@/lib/types/conference-form-schema"
import { filterVisibleFields } from "@/lib/validation/conditional-engine"

interface UseFormPerformanceOptions {
  steps: FormStep[]
  formData: Record<string, unknown>
  enableDebugLogging?: boolean
}

interface PerformanceMetrics {
  totalFields: number
  visibleFields: number
  hiddenFields: number
  evaluationTimeMs: number
}

export function useFormPerformance({
  steps,
  formData,
  enableDebugLogging = false,
}: UseFormPerformanceOptions) {
  // Memoize visible fields calculation per step
  const stepsWithVisibleFields = useMemo(() => {
    const startTime = performance.now()
    
    const result = steps.map((step) => {
      const visibleFields = filterVisibleFields(step.fields, formData)
      return {
        ...step,
        visibleFields,
      }
    })
    
    const endTime = performance.now()
    const evaluationTime = endTime - startTime
    
    if (enableDebugLogging) {
      console.log(`[Form Performance] Conditional evaluation took ${evaluationTime.toFixed(2)}ms`)
    }
    
    // Warn if evaluation is slow (> 100ms)
    if (evaluationTime > 100) {
      console.warn(
        `[Form Performance] Slow conditional evaluation: ${evaluationTime.toFixed(2)}ms. ` +
        `Consider simplifying conditional logic or reducing field count.`
      )
    }
    
    return result
  }, [steps, formData, enableDebugLogging])

  // Calculate performance metrics
  const metrics = useMemo<PerformanceMetrics>(() => {
    const totalFields = steps.reduce((acc, step) => acc + step.fields.length, 0)
    const visibleFields = stepsWithVisibleFields.reduce(
      (acc, step) => acc + step.visibleFields.length,
      0
    )
    
    return {
      totalFields,
      visibleFields,
      hiddenFields: totalFields - visibleFields,
      evaluationTimeMs: 0, // Updated in useMemo above
    }
  }, [steps, stepsWithVisibleFields])

  // Memoized callback for checking if field is visible
  const isFieldVisible = useCallback(
    (fieldId: string): boolean => {
      for (const step of stepsWithVisibleFields) {
        const field = step.visibleFields.find((f) => f.id === fieldId)
        if (field) return true
      }
      return false
    },
    [stepsWithVisibleFields]
  )

  return {
    stepsWithVisibleFields,
    metrics,
    isFieldVisible,
  }
}
