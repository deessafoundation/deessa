// ── Conditional Logic Engine ────────────────────────────────────────────────
// Evaluates conditional visibility rules for form fields.
// Phase 4 enhancement: Supports advanced operators (contains, greaterThan, etc.)
// and nested conditions with AND/OR logic.

import {
  FormField,
  FormStep,
  FieldConditional,
  ConditionalOperator,
} from "@/lib/types/conference-form-schema"

type FormData = Record<string, unknown>

/**
 * Evaluates a single conditional rule against form data.
 */
export function evaluateCondition(
  conditional: FieldConditional,
  formData: FormData
): boolean {
  const { dependsOn, operator, value } = conditional

  // Get the value of the dependency field
  const dependencyValue = formData[dependsOn]

  // If dependency field doesn't exist or is undefined, treat as empty
  const isEmpty = dependencyValue === undefined || 
                  dependencyValue === null || 
                  dependencyValue === "" ||
                  (Array.isArray(dependencyValue) && dependencyValue.length === 0)

  switch (operator) {
    case "isEmpty":
      return isEmpty

    case "isNotEmpty":
      return !isEmpty

    case "equals":
      return compareValues(dependencyValue, value, "equals")

    case "notEquals":
      return !compareValues(dependencyValue, value, "equals")

    case "contains":
      return compareValues(dependencyValue, value, "contains")

    case "notContains":
      return !compareValues(dependencyValue, value, "contains")

    case "greaterThan":
      return compareValues(dependencyValue, value, "greaterThan")

    case "lessThan":
      return compareValues(dependencyValue, value, "lessThan")

    case "greaterThanOrEqual":
      return compareValues(dependencyValue, value, "greaterThanOrEqual")

    case "lessThanOrEqual":
      return compareValues(dependencyValue, value, "lessThanOrEqual")

    default:
      console.warn(`Unknown conditional operator: ${operator}`)
      return true // Show field by default if operator is unknown
  }
}

/**
 * Compares two values based on the specified operator.
 */
function compareValues(
  actual: unknown,
  expected: string,
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual"
): boolean {
  // Handle array values (checkbox groups)
  if (Array.isArray(actual)) {
    if (operator === "equals") {
      return actual.includes(expected)
    }
    if (operator === "contains") {
      return actual.some((item) =>
        String(item).toLowerCase().includes(expected.toLowerCase())
      )
    }
    // For numeric comparisons, use array length
    const actualNum = actual.length
    const expectedNum = parseFloat(expected)
    if (isNaN(expectedNum)) return false

    switch (operator) {
      case "greaterThan":
        return actualNum > expectedNum
      case "lessThan":
        return actualNum < expectedNum
      case "greaterThanOrEqual":
        return actualNum >= expectedNum
      case "lessThanOrEqual":
        return actualNum <= expectedNum
    }
  }

  // Handle boolean values
  if (typeof actual === "boolean") {
    const expectedBool = expected === "true" || expected === "1"
    return operator === "equals" ? actual === expectedBool : false
  }

  // Handle string/number values
  const actualStr = String(actual || "")
  const expectedStr = String(expected || "")

  switch (operator) {
    case "equals":
      return actualStr.toLowerCase() === expectedStr.toLowerCase()

    case "contains":
      return actualStr.toLowerCase().includes(expectedStr.toLowerCase())

    case "greaterThan":
    case "lessThan":
    case "greaterThanOrEqual":
    case "lessThanOrEqual": {
      const actualNum = parseFloat(actualStr)
      const expectedNum = parseFloat(expectedStr)

      if (isNaN(actualNum) || isNaN(expectedNum)) {
        return false
      }

      switch (operator) {
        case "greaterThan":
          return actualNum > expectedNum
        case "lessThan":
          return actualNum < expectedNum
        case "greaterThanOrEqual":
          return actualNum >= expectedNum
        case "lessThanOrEqual":
          return actualNum <= expectedNum
      }
    }
  }

  return false
}

/**
 * Evaluates nested conditions with AND/OR logic.
 * Returns true if the field should be visible.
 */
export function evaluateConditionalWithLogic(
  conditional: FieldConditional,
  formData: FormData
): boolean {
  // If no nested conditions, evaluate single condition
  if (!conditional.conditions || conditional.conditions.length === 0) {
    return evaluateCondition(conditional, formData)
  }

  // Evaluate nested conditions (recursively support nested logic)
  const results = conditional.conditions.map((cond) =>
    evaluateConditionalWithLogic(cond, formData)
  )

  // Apply logic operator
  const logic = conditional.logic || "and"

  if (logic === "and") {
    return results.every((result) => result === true)
  } else {
    // OR logic
    return results.some((result) => result === true)
  }
}

/**
 * Filters fields based on conditional visibility rules.
 * Returns only fields that should be visible given the current form data.
 */
export function filterVisibleFields(
  fields: FormField[],
  formData: FormData
): FormField[] {
  return fields.filter((field) => {
    // No conditional rule = always visible
    if (!field.conditional) {
      return true
    }

    // Evaluate conditional with nested logic support
    return evaluateConditionalWithLogic(field.conditional, formData)
  })
}

/**
 * Filters steps based on conditional visibility rules.
 * Returns only steps that should be visible given the current form data.
 */
export function filterVisibleSteps(
  steps: FormStep[],
  formData: FormData
): FormStep[] {
  return steps.filter((step) => {
    // No conditional rule = always visible
    if (!step.conditional) {
      return true
    }

    // Evaluate conditional with nested logic support
    return evaluateConditionalWithLogic(step.conditional, formData)
  })
}

/**
 * Detects circular dependencies in conditional rules.
 * Returns an array of field IDs that form a cycle, or empty array if no cycles.
 */
export function detectCircularDependencies(
  fields: FormField[]
): string[] {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycle(fieldId: string): boolean {
    if (recursionStack.has(fieldId)) {
      return true // Cycle detected
    }

    if (visited.has(fieldId)) {
      return false // Already checked, no cycle
    }

    visited.add(fieldId)
    recursionStack.add(fieldId)

    // Find this field's conditional dependencies
    const field = fields.find((f) => f.id === fieldId)
    if (field?.conditional) {
      // Check direct dependency
      if (hasCycle(field.conditional.dependsOn)) {
        return true
      }

      // Check nested conditions (AND/OR logic)
      if (field.conditional.conditions) {
        for (const cond of field.conditional.conditions) {
          if (hasCycle(cond.dependsOn)) {
            return true
          }
        }
      }
    }

    recursionStack.delete(fieldId)
    return false
  }

  // Check each field for cycles
  for (const field of fields) {
    if (hasCycle(field.id)) {
      return Array.from(recursionStack)
    }
  }

  return []
}

/**
 * Validates conditional rules for a field.
 * Returns validation errors, or null if valid.
 */
export function validateConditionalRule(
  field: FormField,
  allFields: FormField[]
): string | null {
  if (!field.conditional) return null

  const { dependsOn, operator, value, conditions, logic } = field.conditional

  // Check if dependency field exists
  const depField = allFields.find((f) => f.id === dependsOn)
  if (!depField) {
    return `Dependency field "${dependsOn}" does not exist`
  }

  // Check if dependency is in an earlier step (not implemented here, requires step context)
  // This validation should be done at the form builder level

  // Validate operator requires a value (except isEmpty/isNotEmpty)
  const operatorsRequiringValue: ConditionalOperator[] = [
    "equals",
    "notEquals",
    "contains",
    "notContains",
    "greaterThan",
    "lessThan",
    "greaterThanOrEqual",
    "lessThanOrEqual",
  ]

  if (operatorsRequiringValue.includes(operator) && !value) {
    return `Operator "${operator}" requires a comparison value`
  }

  // Validate numeric operators are used with numeric fields or arrays
  const numericOperators: ConditionalOperator[] = [
    "greaterThan",
    "lessThan",
    "greaterThanOrEqual",
    "lessThanOrEqual",
  ]

  if (
    numericOperators.includes(operator) &&
    depField.type !== "number" &&
    depField.type !== "checkbox"
  ) {
    console.warn(
      `Numeric operator "${operator}" used with non-numeric field "${dependsOn}" (type: ${depField.type})`
    )
  }

  // Validate nested conditions (AND/OR logic)
  if (conditions && conditions.length > 0) {
    if (!logic) {
      return "Logic operator (and/or) is required when using nested conditions"
    }

    for (let i = 0; i < conditions.length; i++) {
      const nestedError = validateConditionalRule(
        { ...field, conditional: conditions[i] },
        allFields
      )
      if (nestedError) {
        return `Nested condition ${i + 1}: ${nestedError}`
      }
    }
  }

  return null
}
