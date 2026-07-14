# Field Types Reference

**Version:** 2.0  
**Last Updated:** July 25, 2026

---

## Overview

The form builder supports 21 field types organized into 6 categories. Each field type has specific configuration options and validation rules.

---

## Categories

| Category | Field Types |
|----------|-------------|
| **Input** | Text, Text Area, Email, Phone, Number, URL |
| **Choice** | Dropdown, Radio, Checkbox, Toggle |
| **Date & Time** | Date, Date Range |
| **Media & Files** | File Upload, Signature |
| **Feedback** | Rating, Slider |
| **Layout** | Heading, Paragraph, Rich Text, Repeating |

---

## Input Fields

### Text
Single-line text input.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Text Field" |
| `placeholder` | string | - |
| `required` | boolean | false |
| `validation.minLength` | number | - |
| `validation.maxLength` | number | - |
| `validation.pattern` | string | - |

**Value type:** `string`

---

### Text Area
Multi-line text input.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Text Area" |
| `placeholder` | string | - |
| `required` | boolean | false |
| `validation.minLength` | number | - |
| `validation.maxLength` | number | - |

**Value type:** `string`

---

### Email
Email input with validation.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Email Address" |
| `placeholder` | string | - |
| `required` | boolean | false |

**Validation:** RFC 5322 format check

**Value type:** `string`

---

### Phone
Phone number input.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Phone Number" |
| `placeholder` | string | - |
| `required` | boolean | false |

**Value type:** `string`

---

### Number
Numeric input.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Number" |
| `placeholder` | string | - |
| `required` | boolean | false |
| `validation.min` | number | - |
| `validation.max` | number | - |

**Value type:** `number`

---

### URL
URL input with auto-https.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "URL" |
| `placeholder` | string | - |
| `required` | boolean | false |

**Features:** Auto-prepends `https://` on blur, shows link preview

**Value type:** `string`

---

## Choice Fields

### Dropdown (Select)
Single-choice dropdown.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Dropdown" |
| `options` | FieldOption[] | [] |
| `required` | boolean | false |
| `placeholder` | string | "Select..." |

**Value type:** `string`

---

### Radio
Single-choice radio buttons.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Radio Group" |
| `options` | FieldOption[] | [] |
| `required` | boolean | false |

**Value type:** `string`

---

### Checkbox
Multiple-choice checkboxes.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Checkbox Group" |
| `options` | FieldOption[] | [] |
| `required` | boolean | false |
| `minSelections` | number | - |
| `maxSelections` | number | - |

**Value type:** `string[]`

---

### Toggle
Boolean toggle switch.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Toggle" |
| `required` | boolean | false |

**Value type:** `boolean`

---

## Date & Time Fields

### Date
Date picker.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Date" |
| `required` | boolean | false |
| `dateValidation.minDate` | string | - |
| `dateValidation.maxDate` | string | - |
| `dateValidation.disabledDaysOfWeek` | number[] | - |
| `dateValidation.disabledDates` | string[] | - |

**Date formats:** ISO string, "today", "today+30d"

**Value type:** `string` (ISO date)

---

### Date Range
Start/end date pair.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Date Range" |
| `required` | boolean | false |
| `dateRangeConfig.minSpan` | number | - |
| `dateRangeConfig.maxSpan` | number | - |

**Value type:** `{ start: string, end: string } | null`

---

## Media & Files

### File Upload
File upload to Supabase Storage.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "File Upload" |
| `required` | boolean | false |
| `fileUploadConfig.maxSizeMB` | number | 5 |
| `fileUploadConfig.allowedTypes` | string[] | images, pdf, docs |
| `fileUploadConfig.multiple` | boolean | false |
| `fileUploadConfig.storageBucket` | string | "conference-uploads" |

**Value type:** `string | string[]` (URL(s))

---

### Signature
Canvas-drawn signature.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Signature" |
| `required` | boolean | false |

**Value type:** `string | null` (base64 data URL)

---

## Feedback Fields

### Rating
Star rating (1-N).

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Rating" |
| `required` | boolean | false |
| `ratingConfig.maxStars` | number | 5 |

**Value type:** `number | null`

---

### Slider
Numeric range slider.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Slider" |
| `required` | boolean | false |
| `sliderConfig.min` | number | 0 |
| `sliderConfig.max` | number | 100 |
| `sliderConfig.step` | number | 1 |
| `sliderConfig.unit` | string | - |

**Value type:** `number | null`

---

## Layout Fields

### Heading
Display-only heading.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Section Heading" |
| `helpText` | string | - |

**Value type:** N/A (display only)

---

### Paragraph
Display-only text block.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Paragraph" |
| `helpText` | string | - |

**Value type:** N/A (display only)

---

### Rich Text
WYSIWYG editor (bold, italic, lists, links).

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Rich Text" |
| `required` | boolean | false |
| `placeholder` | string | - |

**Value type:** `string | null` (HTML)

---

### Repeating
Repeating section for group registrations.

| Property | Type | Default |
|----------|------|---------|
| `label` | string | "Repeating Section" |
| `required` | boolean | false |
| `repeatingConfig.minRows` | number | 0 |
| `repeatingConfig.maxRows` | number | 10 |
| `repeatingConfig.addLabel` | string | "Add another" |
| `repeatingConfig.fields` | FormField[] | [] |

**Value type:** `Record<string, unknown>[]`

---

## Core Fields

Some fields map to fixed database columns:

| Field ID | DB Column | Storage |
|----------|-----------|---------|
| `full_name` | full_name | core |
| `email` | email | core |
| `phone` | phone | core |
| `organization` | organization | core |
| `role` | role | core |
| `attendance_mode` | attendance_mode | core |
| `workshops` | workshops | core |
| `dietary_preference` | dietary_preference | core |
| `tshirt_size` | tshirt_size | core |
| `heard_via` | heard_via | core |
| `emergency_contact_name` | emergency_contact_name | core |
| `emergency_contact_phone` | emergency_contact_phone | core |
| `consent_terms` | consent_terms | core |
| `consent_newsletter` | consent_newsletter | core |

---

## Conditional Logic

Fields can have conditional visibility:

```typescript
interface FieldConditional {
  dependsOn: string           // Field ID to check
  operator: ConditionalOperator
  value: string               // Comparison value
  logic?: "and" | "or"       // For multiple conditions
  conditions?: FieldConditional[]  // Nested conditions
}
```

### Operators

| Operator | Description |
|----------|-------------|
| `equals` | Exact match |
| `notEquals` | Does not match |
| `isEmpty` | Field is empty |
| `isNotEmpty` | Field has value |
| `contains` | Partial string match |
| `notContains` | Does not contain |
| `greaterThan` | Numeric greater than |
| `lessThan` | Numeric less than |
| `greaterThanOrEqual` | Numeric >= |
| `lessThanOrEqual` | Numeric <= |

---

**Last Updated:** July 25, 2026
