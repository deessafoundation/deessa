// ── Form Testing Helpers ────────────────────────────────────────────────────
// Phase 5: Utilities for testing form functionality, validation, and edge cases.

import { FormSchema, FormField, FormStep, FieldType } from "@/lib/types/conference-form-schema"

/**
 * Creates a mock form schema for testing.
 */
export function createMockSchema(overrides?: Partial<FormSchema>): FormSchema {
  return {
    version: 1,
    steps: [
      {
        id: "step1",
        label: "Step 1",
        order: 0,
        fields: [
          createMockField({ id: "name", type: "text", required: true }),
          createMockField({ id: "email", type: "email", required: true }),
        ],
      },
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      notes: "Test schema",
    },
    ...overrides,
  }
}

/**
 * Creates a mock field for testing.
 */
export function createMockField(overrides?: Partial<FormField>): FormField {
  return {
    id: "test_field",
    type: "text",
    label: "Test Field",
    required: false,
    storage: "custom",
    order: 0,
    width: "full",
    ...overrides,
  }
}

/**
 * Creates a mock step for testing.
 */
export function createMockStep(overrides?: Partial<FormStep>): FormStep {
  return {
    id: "test_step",
    label: "Test Step",
    order: 0,
    fields: [],
    ...overrides,
  }
}

/**
 * Generates test data for all field types.
 */
export function generateFieldTestData(type: FieldType): unknown {
  const testData: Record<FieldType, unknown> = {
    text: "Test text value",
    textarea: "Test multiline\ntext value",
    email: "test@example.com",
    tel: "+1234567890",
    number: 42,
    select: "option1",
    radio: "option1",
    checkbox: ["option1", "option2"],
    toggle: true,
    heading: undefined, // Non-input field
    paragraph: undefined, // Non-input field
    date: "2024-12-31",
    url: "https://example.com",
    file: "https://storage.example.com/file.pdf",
  }
  
  return testData[type]
}

/**
 * Validates that form data contains all required fields.
 */
export function validateRequiredFields(
  schema: FormSchema,
  formData: Record<string, unknown>
): { valid: boolean; missingFields: string[] } {
  const requiredFields = schema.steps
    .flatMap((step) => step.fields)
    .filter((field) => field.required && field.type !== "heading" && field.type !== "paragraph")
    .map((field) => field.id)
  
  const missingFields = requiredFields.filter(
    (fieldId) =>
      formData[fieldId] === undefined ||
      formData[fieldId] === null ||
      formData[fieldId] === ""
  )
  
  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}

/**
 * Simulates form submission and returns validation errors.
 */
export function simulateFormSubmission(
  schema: FormSchema,
  formData: Record<string, unknown>
): {
  success: boolean
  errors: Record<string, string>
  coreFields: Record<string, unknown>
  customFields: Record<string, unknown>
} {
  const errors: Record<string, string> = {}
  const coreFields: Record<string, unknown> = {}
  const customFields: Record<string, unknown> = {}
  
  // Validate required fields
  for (const step of schema.steps) {
    for (const field of step.fields) {
      const value = formData[field.id]
      
      // Check required
      if (field.required && !value) {
        errors[field.id] = `${field.label} is required`
      }
      
      // Route to core or custom
      if (field.storage === "core") {
        coreFields[field.coreColumn || field.id] = value
      } else {
        customFields[field.id] = value
      }
    }
  }
  
  return {
    success: Object.keys(errors).length === 0,
    errors,
    coreFields,
    customFields,
  }
}

/**
 * Tests conditional logic evaluation.
 */
export function testConditionalLogic(
  field: FormField,
  formData: Record<string, unknown>
): boolean {
  if (!field.conditional) return true
  
  const { dependsOn, operator, value } = field.conditional
  const dependencyValue = formData[dependsOn]
  
  switch (operator) {
    case "equals":
      return dependencyValue === value
    case "notEquals":
      return dependencyValue !== value
    case "isEmpty":
      return !dependencyValue
    case "isNotEmpty":
      return !!dependencyValue
    default:
      return true
  }
}

/**
 * Generates edge case test scenarios.
 */
export function generateEdgeCases() {
  return {
    // Empty values
    emptyString: "",
    emptyArray: [],
    null: null,
    undefined: undefined,
    
    // Special characters
    unicodeEmoji: "Hello 👋 World 🌍",
    htmlTags: "<script>alert('xss')</script>",
    sqlInjection: "'; DROP TABLE users; --",
    specialChars: "!@#$%^&*()_+-=[]{}|;':\",./<>?",
    
    // Large values
    longText: "x".repeat(10000),
    largeArray: Array(1000).fill("item"),
    
    // Boundary values
    maxNumber: Number.MAX_SAFE_INTEGER,
    minNumber: Number.MIN_SAFE_INTEGER,
    zero: 0,
    negativeNumber: -42,
    
    // Dates
    pastDate: "1900-01-01",
    futureDate: "2100-12-31",
    invalidDate: "not-a-date",
    
    // URLs
    validUrl: "https://example.com",
    invalidUrl: "not a url",
    urlWithSpecialChars: "https://example.com/?foo=bar&baz=qux",
  }
}

/**
 * Performance test: measures conditional logic evaluation time.
 */
export function benchmarkConditionalLogic(
  schema: FormSchema,
  formData: Record<string, unknown>,
  iterations = 1000
): {
  averageMs: number
  minMs: number
  maxMs: number
  totalMs: number
} {
  const times: number[] = []
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    
    // Evaluate all conditionals
    for (const step of schema.steps) {
      for (const field of step.fields) {
        testConditionalLogic(field, formData)
      }
    }
    
    const end = performance.now()
    times.push(end - start)
  }
  
  return {
    averageMs: times.reduce((a, b) => a + b, 0) / times.length,
    minMs: Math.min(...times),
    maxMs: Math.max(...times),
    totalMs: times.reduce((a, b) => a + b, 0),
  }
}

/**
 * Validates schema structure for common issues.
 */
export function validateSchemaStructure(schema: FormSchema): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check steps
  if (!schema.steps || schema.steps.length === 0) {
    errors.push("Schema must have at least one step")
  }
  
  // Check for duplicate step IDs
  const stepIds = new Set<string>()
  for (const step of schema.steps) {
    if (stepIds.has(step.id)) {
      errors.push(`Duplicate step ID: ${step.id}`)
    }
    stepIds.add(step.id)
    
    // Check fields
    if (step.fields.length === 0) {
      warnings.push(`Step "${step.label}" has no fields`)
    }
  }
  
  // Check for duplicate field IDs
  const fieldIds = new Set<string>()
  for (const step of schema.steps) {
    for (const field of step.fields) {
      if (fieldIds.has(field.id)) {
        errors.push(`Duplicate field ID: ${field.id}`)
      }
      fieldIds.add(field.id)
      
      // Validate conditional dependencies
      if (field.conditional) {
        if (!fieldIds.has(field.conditional.dependsOn)) {
          errors.push(
            `Field "${field.label}" depends on non-existent field: ${field.conditional.dependsOn}`
          )
        }
      }
      
      // Validate options for select/radio/checkbox
      if (["select", "radio", "checkbox"].includes(field.type)) {
        if (!field.options || field.options.length === 0) {
          errors.push(`Field "${field.label}" requires options`)
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Creates a complete test form data set.
 */
export function createCompleteFormData(schema: FormSchema): Record<string, unknown> {
  const formData: Record<string, unknown> = {}
  
  for (const step of schema.steps) {
    for (const field of step.fields) {
      formData[field.id] = generateFieldTestData(field.type)
    }
  }
  
  return formData
}

/**
 * Creates a minimal valid form data set (only required fields).
 */
export function createMinimalFormData(schema: FormSchema): Record<string, unknown> {
  const formData: Record<string, unknown> = {}
  
  for (const step of schema.steps) {
    for (const field of step.fields) {
      if (field.required) {
        formData[field.id] = generateFieldTestData(field.type)
      }
    }
  }
  
  return formData
}
