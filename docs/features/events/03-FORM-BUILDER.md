---
title: "Form Builder System"
description: "Version: 2.0"
owner: "Deessa Team"
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
â”œâ”€â”€ index.tsx                 # Main builder (3-panel layout)
â”œâ”€â”€ FieldPalette.tsx          # Left panel - field type selector
â”œâ”€â”€ FormCanvas.tsx            # Center panel - sortable steps
â”œâ”€â”€ SortableStepCard.tsx      # Sortable step with inline editing
â”œâ”€â”€ SortableFieldCard.tsx     # Sortable field with actions
â”œâ”€â”€ FieldPropertiesPanel.tsx  # Right panel - field configuration
â”œâ”€â”€ OptionsEditor.tsx         # Inline option list editor
â”œâ”€â”€ SchemaImportExport.tsx    # JSON import/export
â”œâ”€â”€ useBuilderState.ts        # State management with undo/redo
â””â”€â”€ builder-actions.ts        # Pure helper functions
```

### Data Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ FieldPaletteâ”‚â”€â”€â”€â”€>â”‚  FormCanvas  â”‚â”€â”€â”€â”€>â”‚  Properties â”‚
â”‚  (Add Field)â”‚     â”‚ (Drag/Drop)  â”‚     â”‚  (Configure)â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â”‚
                          â–¼
                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                   â”‚ useBuilder   â”‚
                   â”‚ State        â”‚
                   â”‚ (useReducer) â”‚
                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â”‚
                          â–¼
                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                   â”‚  Save/Publishâ”‚
                   â”‚  (API Call)  â”‚
                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Layout

The builder uses a 3-panel layout:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Action Bar: [Templates] [Export] [Import] [Undo] [Redo]     â”‚
â”‚             [Save Draft] [Publish]                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Palette  â”‚       Form Canvas        â”‚   Field Properties     â”‚
â”‚ (220px)  â”‚        (1fr)             â”‚      (340px)           â”‚
â”‚          â”‚                          â”‚                        â”‚
â”‚ [Input]  â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  Text    â”‚ â”‚ Step 1: Personal     â”‚ â”‚ â”‚ Field Type: select â”‚ â”‚
â”‚  Email   â”‚ â”‚  â—‹ Full Name *       â”‚ â”‚ â”‚                    â”‚ â”‚
â”‚  Phone   â”‚ â”‚  â—‹ Email *           â”‚ â”‚ â”‚ Label: Your Role   â”‚ â”‚
â”‚  ...     â”‚ â”‚  â—‹ Phone             â”‚ â”‚ â”‚ Required: [ON]     â”‚ â”‚
â”‚          â”‚ â”‚                      â”‚ â”‚ â”‚                    â”‚ â”‚
â”‚ [Choice] â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚ â”‚ â”‚ Options            â”‚ â”‚
â”‚  Select  â”‚ â”‚ â”‚ + Add option     â”‚ â”‚ â”‚ â”‚ â—‹ Attendee         â”‚ â”‚
â”‚  Radio   â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚ â”‚ â—‹ Speaker          â”‚ â”‚
â”‚  ...     â”‚ â”‚                      â”‚ â”‚ â”‚ â—‹ Panelist         â”‚ â”‚
â”‚          â”‚ â”‚ Step 2: Preferences  â”‚ â”‚ â”‚ + Add option       â”‚ â”‚
â”‚          â”‚ â”‚  ...                 â”‚ â”‚ â”‚                    â”‚ â”‚
â”‚          â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚ Width: [Full][Half]â”‚ â”‚
â”‚          â”‚                          â”‚ â”‚                    â”‚ â”‚
â”‚          â”‚ [+ Add Step]             â”‚ â”‚ [Delete Field]     â”‚ â”‚
â”‚          â”‚                          â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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

- **Ctrl+Z** â€” Undo last action (50 steps)
- **Ctrl+Shift+Z** â€” Redo
- Visual indicators show undo/redo availability

### 4. Preview Mode

- Toggle between Builder and Preview views
- Preview shows actual field components (not placeholders)
- Responsive preview: Desktop / Tablet / Mobile
- Interactive â€” you can fill in fields to test

### 5. Templates

- Click "Templates" button to open template chooser
- Browse 15 pre-built templates by category
- Apply template to load its schema
- Save current form as a custom template

### 6. Import/Export

- **Export** â€” Downloads schema as JSON file
- **Import** â€” Upload JSON file to load schema
- Confirmation dialog before import

### 7. Conditional Logic

- Click a field â†’ expand "Conditional Logic" section
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

1. **Rich Text in Preview** â€” Preview shows HTML content from `helpText` property
2. **Repeating Section** â€” Sub-fields render as typed components (was text-only before fix)

---

**Last Updated:** July 25, 2026
