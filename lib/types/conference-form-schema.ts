// ── Conference Dynamic Form Schema Types ────────────────────────────────────
// Shared between client and server. No "use server" directive.
// This file defines the shape of the JSONB stored in conference_form_schemas.form_config.

export type FieldType =
  | "text"       // Single-line text input
  | "textarea"   // Multi-line text area
  | "email"      // Email with validation
  | "tel"        // Phone number
  | "number"     // Numeric input
  | "select"     // Dropdown (single choice)
  | "radio"      // Radio button group (single choice)
  | "checkbox"   // Checkbox group (multiple choice)
  | "toggle"     // Single boolean checkbox
  | "heading"    // Section heading (non-input)
  | "paragraph"  // Read-only text block
  | "date"       // Date picker (Phase 4)
  | "url"        // URL input with validation (Phase 4)
  | "file"       // File upload via Supabase Storage (Phase 4)
  | "dateRange"  // Start/end date pair
  | "signature"  // Canvas-drawn signature
  | "rating"     // Star rating (1-5)
  | "slider"     // Numeric range slider
  | "repeating"  // Repeating section (group registration)
  | "richText"   // Rich text editor (HTML)

export type FieldStorage = "core" | "custom"

export type ConditionalOperator = 
  | "equals" 
  | "notEquals" 
  | "isEmpty" 
  | "isNotEmpty"
  | "contains"        // Partial match (Phase 4)
  | "notContains"     // Does not contain (Phase 4)
  | "greaterThan"     // Numeric comparison (Phase 4)
  | "lessThan"        // Numeric comparison (Phase 4)
  | "greaterThanOrEqual"  // Numeric comparison (Phase 4)
  | "lessThanOrEqual"     // Numeric comparison (Phase 4)

export interface FieldOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string          // Regex for text fields
  patternMessage?: string   // User-facing error for pattern mismatch
}

export interface FieldConditional {
  dependsOn: string           // Another field's ID
  operator: ConditionalOperator
  value: string               // The value to compare against
  logic?: "and" | "or"        // Logic operator for multiple conditions (Phase 4)
  conditions?: FieldConditional[]  // Nested conditions for AND/OR (Phase 4)
}

// Phase 4: File upload configuration
export interface FileUploadConfig {
  maxSizeMB?: number          // Maximum file size in MB (default: 5)
  allowedTypes?: string[]     // MIME types (e.g., ["image/png", "application/pdf"])
  multiple?: boolean          // Allow multiple file uploads
  storageBucket?: string      // Supabase storage bucket name
}

// Phase 4: Date validation configuration
export interface DateValidationConfig {
  minDate?: string            // ISO date string or "today"
  maxDate?: string            // ISO date string or "today+90d"
  disabledDates?: string[]    // Array of ISO date strings to disable
  disabledDaysOfWeek?: number[] // 0=Sunday, 6=Saturday
}

// Date range configuration
export interface DateRangeConfig {
  minSpan?: number            // Minimum days between start and end
  maxSpan?: number            // Maximum days between start and end
}

// Rating configuration
export interface RatingConfig {
  maxStars?: number           // Maximum stars (default: 5)
  allowHalf?: boolean         // Allow half-star ratings
}

// Slider configuration
export interface SliderConfig {
  min?: number                // Minimum value (default: 0)
  max?: number                // Maximum value (default: 100)
  step?: number               // Step increment (default: 1)
  unit?: string               // Display unit (e.g., "%", "days", "km")
}

// Repeating section configuration
export interface RepeatingConfig {
  minRows?: number            // Minimum repetitions (default: 0)
  maxRows?: number            // Maximum repetitions (default: 10)
  addLabel?: string           // Label for "Add" button (default: "Add another")
  fields?: FormField[]        // Sub-fields within each repetition
}

export interface FormField {
  id: string                        // Unique field identifier (snake_case)
  type: FieldType
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  defaultValue?: string | string[] | boolean

  // For select/radio/checkbox — the options
  options?: FieldOption[]

  // Multi-select constraints
  minSelections?: number
  maxSelections?: number

  // Validation
  validation?: FieldValidation

  // Layout — full width by default
  width?: "full" | "half"

  // Conditional visibility
  conditional?: FieldConditional

  // Storage routing
  storage: FieldStorage     // core = fixed column, custom = JSONB
  coreColumn?: string       // Populated automatically for core fields

  // Display
  order: number

  // Phase 4: File upload configuration
  fileUploadConfig?: FileUploadConfig

  // Phase 4: Date validation configuration
  dateValidation?: DateValidationConfig

  // Date range configuration
  dateRangeConfig?: DateRangeConfig

  // Rating configuration
  ratingConfig?: RatingConfig

  // Slider configuration
  sliderConfig?: SliderConfig

  // Repeating section configuration
  repeatingConfig?: RepeatingConfig

  // Phase 4: Calculated field (auto-compute based on other fields)
  calculation?: {
    formula: string           // JavaScript expression (e.g., "field1 + field2")
    dependsOn: string[]       // Field IDs this calculation depends on
  }
}

export interface FormStep {
  id: string            // e.g. "personal", "participation", "additional"
  label: string         // e.g. "Personal Details"
  description?: string  // e.g. "Please provide your contact information"
  order: number
  fields: FormField[]
}

export interface FormSchemaMeta {
  createdAt: string
  updatedAt?: string
  notes?: string
  createdBy?: string
}

export interface FormSchema {
  version: number
  steps: FormStep[]
  metadata: FormSchemaMeta
}

// ── Core field names (fixed columns in conference_registrations) ────────────
// These are used by the server action to extract core vs custom data.
export const CORE_FIELD_IDS = [
  "full_name",
  "email",
  "phone",
  "organization",
  "role",
  "attendance_mode",
  "workshops",
  "dietary_preference",
  "tshirt_size",
  "heard_via",
  "emergency_contact_name",
  "emergency_contact_phone",
  "consent_terms",
  "consent_newsletter",
] as const

export type CoreFieldId = (typeof CORE_FIELD_IDS)[number]

// Fields that are locked — cannot be hidden or removed
export const LOCKED_CORE_FIELDS: CoreFieldId[] = [
  "full_name",
  "email",
  "consent_terms",
]

export function isCoreField(fieldId: string): boolean {
  return (CORE_FIELD_IDS as readonly string[]).includes(fieldId)
}

export function isLockedCoreField(fieldId: string): boolean {
  return (LOCKED_CORE_FIELDS as readonly string[]).includes(fieldId)
}

// ── Column mapping: field ID → DB column name ───────────────────────────────
export const CORE_FIELD_COLUMN_MAP: Record<CoreFieldId, string> = {
  full_name: "full_name",
  email: "email",
  phone: "phone",
  organization: "organization",
  role: "role",
  attendance_mode: "attendance_mode",
  workshops: "workshops",
  dietary_preference: "dietary_preference",
  tshirt_size: "tshirt_size",
  heard_via: "heard_via",
  emergency_contact_name: "emergency_contact_name",
  emergency_contact_phone: "emergency_contact_phone",
  consent_terms: "consent_terms",
  consent_newsletter: "consent_newsletter",
}

// ── Helper: build a default field option object ─────────────────────────────
export function fieldOption(value: string, label?: string): FieldOption {
  return { value, label: label ?? value }
}

// ── Helper: build a form field (for creating the default schema) ────────────
export function coreField(
  id: CoreFieldId,
  overrides: Partial<FormField> = {},
): FormField {
  // Map snake_case field IDs to a human label
  const defaultLabels: Partial<Record<CoreFieldId, string>> = {
    full_name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    organization: "Organization",
    role: "Your Role",
    attendance_mode: "Attendance Mode",
    workshops: "Select Workshops",
    dietary_preference: "Dietary Preferences",
    tshirt_size: "T-Shirt Size",
    heard_via: "How did you hear about us?",
    emergency_contact_name: "Emergency Contact Name",
    emergency_contact_phone: "Emergency Contact Phone",
    consent_terms: "Terms & Conditions",
    consent_newsletter: "Newsletter Consent",
  }

  return {
    id,
    type: "text",
    label: defaultLabels[id] ?? id,
    required: isLockedCoreField(id),
    storage: "core",
    coreColumn: CORE_FIELD_COLUMN_MAP[id],
    order: 0,
    ...overrides,
  }
}
