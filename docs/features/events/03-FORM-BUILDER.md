---
title: "Form Builder System"
description: "Version: 2.0"
owner: "deessa Team"
status: active
category: feature
audience: developer
last_updated: 2026-09-12
---
# Form Builder System

**Version:** 2.0  
**Last Updated:** July 25, 2026

---

## Overview

The Form Builder is a dynamic, schema-driven system that allows admins to create custom registration forms for each event. It supports 21 field types, drag-and-drop reordering, conditional logic, and template application.

---

## Architecture

### Component Structure

```
EventFormBuilder/
├── index.tsx                 # Main builder (3-panel layout)
├── FieldPalette.tsx          # Left panel - field type selector
├── FormCanvas.tsx            # Center panel - sortable steps
├── SortableStepCard.tsx      # Sortable step with inline editing
├── SortableFieldCard.tsx     # Sortable field with actions
├── FieldPropertiesPanel.tsx  # Right panel - field configuration
├── OptionsEditor.tsx         # Inline option list editor
├── SchemaImportExport.tsx    # JSON import/export
├── useBuilderState.ts        # State management with undo/redo
└── builder-actions.ts        # Pure helper functions
```

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ FieldPalette│────>│  FormCanvas  │────>│  Properties │
│  (Add Field)│     │ (Drag/Drop)  │     │  (Configure)│
└─────────────┘     └──────────────┘     └─────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ useBuilder   │
                   │ State        │
                   │ (useReducer) │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Save/Publish│
                   │  (API Call)  │
                   └──────────────┘
```

---

## Layout

The builder uses a 3-panel layout:

```
┌──────────────────────────────────────────────────────────────┐
│ Action Bar: [Templates] [Export] [Import] [Undo] [Redo]     │
│             [Save Draft] [Publish]                            │
├──────────┬──────────────────────────┬────────────────────────┤
│ Palette  │       Form Canvas        │   Field Properties     │
│ (220px)  │        (1fr)             │      (340px)           │
│          │                          │                        │
│ [Input]  │ ┌──────────────────────┐ │ ┌────────────────────┐ │
│  Text    │ │ Step 1: Personal     │ │ │ Field Type: select │ │
│  Email   │ │  ○ Full Name *       │ │ │                    │ │
│  Phone   │ │  ○ Email *           │ │ │ Label: Your Role   │ │
│  ...     │ │  ○ Phone             │ │ │ Required: [ON]     │ │
│          │ │                      │ │ │                    │ │
│ [Choice] │ │ ┌──────────────────┐ │ │ │ Options            │ │
│  Select  │ │ │ + Add option     │ │ │ │ ○ Attendee         │ │
│  Radio   │ │ └──────────────────┘ │ │ │ ○ Speaker          │ │
│  ...     │ │                      │ │ │ ○ Panelist         │ │
│          │ │ Step 2: Preferences  │ │ │ + Add option       │ │
│          │ │  ...                 │ │ │                    │ │
│          │ └──────────────────────┘ │ │ Width: [Full][Half]│ │
│          │                          │ │                    │ │
│          │ [+ Add Step]             │ │ [Delete Field]     │ │
│          │                          │ └────────────────────┘ │
└──────────┴──────────────────────────┴────────────────────────┘
```

---

## Features

### 1. Field Management

**Adding Fields:**
- Click a field type in the left palette
- Field is added to the **selected step** (highlighted with blue border)
- Click a step card to select it

**Configuring Fields:**
- Click any field in the canvas
- Right panel shows field properties
- Edit label, required, placeholder, help text, width
- Configure field-specific options (select options, file types, etc.)

**Reordering:**
- Drag fields within a step to reorder
- Drag steps to reorder
- Use the move button to move fields between steps

**Deleting:**
- Click delete button on field or step
- Press Delete/Backspace key when field is selected

### 2. Steps

- Each form has one or more steps (multi-step wizard)
- Steps are collapsible
- Click step header to select it (blue border)
- Inline editing for step label and description
- Add new steps with "Add Step" button

### 3. Undo/Redo

- **Ctrl+Z** — Undo last action (50 steps)
- **Ctrl+Shift+Z** — Redo
- Visual indicators show undo/redo availability

### 4. Preview Mode

- Toggle between Builder and Preview views
- Preview shows actual field components (not placeholders)
- Responsive preview: Desktop / Tablet / Mobile
- Interactive — you can fill in fields to test

### 5. Templates

- Click "Templates" button to open template chooser
- Browse 15 pre-built templates by category
- Apply template to load its schema
- Save current form as a custom template

### 6. Import/Export

- **Export** — Downloads schema as JSON file
- **Import** — Upload JSON file to load schema
- Confirmation dialog before import

### 7. Conditional Logic

- Click a field → expand "Conditional Logic" section
- Set conditions: Show field when another field equals/is empty/etc.
- Supports AND/OR logic for multiple conditions
- 10 comparison operators

### 8. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+D` | Duplicate selected field |
| `Delete` / `Backspace` | Delete selected field |
| `Escape` | Deselect field |

---

## State Management

### useBuilderState Hook

Uses `useReducer` with undo/redo history:

```typescript
interface BuilderState {
  present: FormSchema  // Current state
  past: FormSchema[]   // Undo history (max 50)
  future: FormSchema[] // Redo history
}
```

### Actions

| Action | Description |
|--------|-------------|
| `SET_SCHEMA` | Replace entire schema |
| `ADD_FIELD` | Add field to step |
| `REMOVE_FIELD` | Remove field from step |
| `UPDATE_FIELD` | Update field properties |
| `REORDER_FIELDS` | Reorder fields within step |
| `MOVE_FIELD_TO_STEP` | Move field between steps |
| `DUPLICATE_FIELD` | Clone a field |
| `ADD_STEP` | Add new step |
| `REMOVE_STEP` | Remove step |
| `UPDATE_STEP` | Update step properties |
| `REORDER_STEPS` | Reorder steps |
| `UNDO` | Undo last action |
| `REDO` | Redo last action |

---

## Saving

### Save Draft
- Saves to `event_form_schemas` with `is_active: false`
- Creates a new version (incremental)
- Does NOT affect public registration form

### Publish
- Saves to `event_form_schemas` with `is_active: true`
- Deactivates all previous active schemas
- Public registration form uses the published schema

---

## Field Types

See [04-FIELD-TYPES.md](./04-FIELD-TYPES.md) for complete reference.

---

## Known Issues

1. **Rich Text in Preview** — Preview shows HTML content from `helpText` property
2. **Repeating Section** — Sub-fields render as typed components (was text-only before fix)

---

**Last Updated:** July 25, 2026
