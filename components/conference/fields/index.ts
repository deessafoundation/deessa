// ── Field Component Registry ────────────────────────────────────────────────
// Barrel export for all field components.
// The FIELD_REGISTRY map is used by DynamicStep to look up the right component
// for each field type.

import type { ComponentType } from "react"
import type { FormField, FieldType } from "@/lib/types/conference-form-schema"

import { FieldText } from "./field-text"
import { FieldTextarea } from "./field-textarea"
import { FieldEmail } from "./field-email"
import { FieldTel } from "./field-tel"
import { FieldNumber } from "./field-number"
import { FieldSelect } from "./field-select"
import { FieldRadio } from "./field-radio"
import { FieldCheckbox } from "./field-checkbox"
import { FieldToggle } from "./field-toggle"
import { FieldHeading } from "./field-heading"
import { FieldParagraph } from "./field-paragraph"
import { FieldDate } from "./field-date"
import { FieldUrl } from "./field-url"
import { FieldFile } from "./field-file"
import { FieldDateRange } from "./field-date-range"
import { FieldSignature } from "./field-signature"
import { FieldRating } from "./field-rating"
import { FieldSlider } from "./field-slider"
import { FieldRepeating } from "./field-repeating"
import { FieldRichText } from "./field-rich-text"

// ── Shared props that every field component receives ─────────────────────────
export interface FieldProps {
  field: FormField
  value: unknown
  error?: string
  onChange: (value: unknown) => void
  onBlur?: () => void
}

// ── Registry: maps FieldType to its React component ──────────────────────────
// Components with custom prop interfaces are cast to ComponentType<FieldProps>
// because their value types (string, number, etc.) are subsets of unknown.
export const FIELD_REGISTRY: Record<FieldType, ComponentType<FieldProps>> = {
  text: FieldText,
  textarea: FieldTextarea,
  email: FieldEmail,
  tel: FieldTel,
  number: FieldNumber,
  select: FieldSelect,
  radio: FieldRadio,
  checkbox: FieldCheckbox,
  toggle: FieldToggle,
  heading: FieldHeading,
  paragraph: FieldParagraph,
  date: FieldDate as unknown as ComponentType<FieldProps>,
  url: FieldUrl as unknown as ComponentType<FieldProps>,
  file: FieldFile as unknown as ComponentType<FieldProps>,
  dateRange: FieldDateRange as unknown as ComponentType<FieldProps>,
  signature: FieldSignature as unknown as ComponentType<FieldProps>,
  rating: FieldRating as unknown as ComponentType<FieldProps>,
  slider: FieldSlider as unknown as ComponentType<FieldProps>,
  repeating: FieldRepeating as unknown as ComponentType<FieldProps>,
  richText: FieldRichText as unknown as ComponentType<FieldProps>,
}

// Re-export all components for direct use if needed
export {
  FieldText,
  FieldTextarea,
  FieldEmail,
  FieldTel,
  FieldNumber,
  FieldSelect,
  FieldRadio,
  FieldCheckbox,
  FieldToggle,
  FieldHeading,
  FieldParagraph,
  FieldDate,
  FieldUrl,
  FieldFile,
  FieldDateRange,
  FieldSignature,
  FieldRating,
  FieldSlider,
  FieldRepeating,
  FieldRichText,
}
