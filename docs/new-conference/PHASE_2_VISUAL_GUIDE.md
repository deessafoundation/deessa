# Phase 2 Visual Guide - Form Builder UI

## 🎨 Complete Interface Tour

### 1. Settings Navigation
```
Conference Settings
├─ [General Settings] ← Event details, payment, agenda, emails
└─ [Form Builder] ← NEW! Build your registration form
```

---

### 2. Form Builder Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Conference Settings                        [Preview] [Draft] [●]  │
│  Version 3 | ⚠ Unsaved Changes | ❌ 2 Errors                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐  ┌───────────────────────┐  ┌────────────────────┐  │
│  │ PALETTE │  │      CANVAS           │  │    PROPERTIES      │  │
│  │         │  │                       │  │                    │  │
│  │ Steps   │  │  📝 Step 1: Personal  │  │  Field Properties  │  │
│  │ ├─ +Add │  │  ├─ [T] Name *  🔒   │  │                    │  │
│  │ ├─ Step1│  │  ├─ [@] Email * 🔒   │  │  Label: [_______]  │  │
│  │ └─ Step2│  │  └─ [📞] Phone        │  │  Placeholder: []   │  │
│  │         │  │                       │  │  Required: [○──●]  │  │
│  │ Add to: │  │  📝 Step 2: Details   │  │  Width: [F][H]     │  │
│  │ [Step1▼]│  │  ├─ [▼] Role *        │  │                    │  │
│  │         │  │  └─ [◯] Mode *        │  │  Options:          │  │
│  │ Fields  │  │                       │  │  • Option 1  [×]   │  │
│  │ ├─ Text │  │  [Empty Step]         │  │  • Option 2  [×]   │  │
│  │ ├─ Email│  │  Add fields →         │  │  [+ Add]           │  │
│  │ ├─ Phone│  │                       │  │                    │  │
│  │ ├─ #    │  │                       │  │  Conditional:      │  │
│  │ ├─ ▼    │  │                       │  │  Show when:        │  │
│  │ ├─ ◯    │  │                       │  │  [Field ▼]         │  │
│  │ ├─ ☑    │  │                       │  │  [Equals ▼]        │  │
│  │ ├─ ⚡   │  │                       │  │  Value: [______]   │  │
│  │ └─ H    │  │                       │  │                    │  │
│  └─────────┘  └───────────────────────┘  └────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Key Components

### Left Panel: Field Palette
**Purpose:** Add fields and manage steps

**Features:**
- 📋 Step Management
  - Add new step button
  - Step list with field counts
  - Click to edit step
- 🎯 Target Step Selector
  - Choose which step to add fields to
  - Only shows when multiple steps exist
- 🧩 Field Types (10 types)
  - Each with icon and description
  - Click to add instantly

**Visual Example:**
```
┌───────────────────────┐
│  Form Steps           │
│  ┌─────────────────┐  │
│  │ [+ Add Step]    │  │
│  └─────────────────┘  │
│                       │
│  ① Step 1 (3 fields)  │
│  ② Step 2 (2 fields)  │
│                       │
│  ┌─────────────────┐  │
│  │ Add fields to:  │  │
│  │ [Step 1      ▼] │  │
│  └─────────────────┘  │
│                       │
│  Field Types          │
│  ┌─────────────────┐  │
│  │ T  Text Input   │  │
│  │ Single-line     │  │
│  └─────────────────┘  │
│  ┌─────────────────┐  │
│  │ @  Email        │  │
│  │ Email address   │  │
│  └─────────────────┘  │
│  ┌─────────────────┐  │
│  │ ▼  Dropdown     │  │
│  │ Single choice   │  │
│  └─────────────────┘  │
└───────────────────────┘
```

---

### Center Panel: Form Canvas
**Purpose:** Visual representation of form structure

**Features:**
- 📝 Step Cards
  - Step number, label, description
  - Field count indicator
- 📋 Field Cards
  - Type icon
  - Label with required indicator (*)
  - Lock icon for locked fields
  - Core field badge
  - Hover actions: ↑↓ reorder, × delete
- 📭 Empty States
  - Helpful prompts when no steps/fields

**Visual Example:**
```
┌─────────────────────────────────┐
│ Step 1: Personal Details    ①  │
│ Please provide your contact info│
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │ T  Full Name *       🔒   │ │
│  │ Text | Enter your name    │ │
│  │                [↑][↓][×]  │ │ ← Hover actions
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ @  Email Address *   🔒   │ │
│  │ Email | your@email.com    │ │
│  │ Core              [↑][↓]  │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 📞 Phone Number           │ │
│  │ Tel | +1 (555) 000-0000   │ │
│  │                [↑][↓][×]  │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Step 2: Participation       ②  │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │ ▼  Your Role *            │ │
│  │ Select | Select role...   │ │
│  │                [↑][↓][×]  │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

---

### Right Panel: Properties Editor
**Purpose:** Edit selected field's properties

**Features:**
- ✏️ Basic Properties
  - Label, placeholder, help text
  - Required toggle
  - Width selector (full/half)
- 🎛️ Options Editor (select/radio/checkbox)
  - Add/remove options
  - Inline label editing
  - Drag to reorder
- ✅ Validation Rules
  - Text: min/max length
  - Number: min/max value
  - Checkbox: min/max selections
- 🔀 Conditional Logic
  - Show when field [▼] equals [▼] value
  - Smart value selector
  - Rule summary

**Visual Example:**
```
┌────────────────────────┐
│ Field Properties   [×] │
├────────────────────────┤
│                        │
│ ⚠ Required Field       │
│ Cannot be removed      │
│                        │
│ Label *                │
│ ┌────────────────────┐ │
│ │ Full Name          │ │
│ └────────────────────┘ │
│                        │
│ Placeholder            │
│ ┌────────────────────┐ │
│ │ Enter your name... │ │
│ └────────────────────┘ │
│                        │
│ Help Text              │
│ ┌────────────────────┐ │
│ │ As on ID document  │ │
│ └────────────────────┘ │
│                        │
│ Required    [●───○]    │
│ Users must fill this   │
│                        │
│ Width                  │
│ ┌────┐ ┌────┐         │
│ │Full│ │Half│         │
│ └────┘ └────┘         │
│                        │
│ ──────────────────────│
│ Validation             │
│ Min Length   Max       │
│ ┌────┐ ┌────┐         │
│ │  2 │ │100 │         │
│ └────┘ └────┘         │
│                        │
│ ──────────────────────│
│ Conditional Logic      │
│              [Enable]  │
│                        │
│ ℹ No conditional set   │
│ Click Enable to show   │
│ this field conditionally│
│                        │
│ ──────────────────────│
│ Field Info             │
│ ID: full_name          │
│ Storage: core          │
│ Column: full_name      │
└────────────────────────┘
```

---

## 🎬 User Workflows

### Workflow 1: Add a New Text Field
```
1. Select target step (if multiple)
   └─ "Add fields to: [Step 2 ▼]"

2. Click "Text Input" in palette
   └─ Field appears in canvas
   └─ Auto-selected in properties panel

3. Edit properties:
   ├─ Label: "Company Name"
   ├─ Placeholder: "e.g. Acme Corp"
   ├─ Help Text: "Your current employer"
   └─ Required: [○──●] ON

4. Done! Field ready to use
```

### Workflow 2: Add Conditional Logic
```
1. Select the field to make conditional
   └─ Click field card in canvas

2. Scroll to "Conditional Logic" section
   └─ Click [Enable]

3. Configure condition:
   ├─ Show when field: [Attendance Mode ▼]
   ├─ Condition: [Equals ▼]
   └─ Value: [in-person ▼]

4. Review summary:
   └─ "Show 'Workshops' when 'Attendance Mode' 
       equals 'in-person'"

5. Done! Field hidden for online attendees
```

### Workflow 3: Reorder Form Steps
```
1. Locate step in left panel
   └─ "① Step 1: Personal Details"

2. Click [↓] arrow to move down
   └─ Step becomes "② Step 2"
   └─ Other steps renumber automatically

3. Done! Order updated in canvas
```

### Workflow 4: Create Multi-Select with Limits
```
1. Add checkbox field from palette

2. Edit properties:
   ├─ Label: "Workshop Preferences"
   └─ Type: checkbox (auto)

3. Add options:
   ├─ [+ Add] "AI & Ethics"
   ├─ [+ Add] "Grant Writing"
   ├─ [+ Add] "Digital Marketing"
   └─ [+ Add] "Youth Leadership"

4. Set limits:
   ├─ Min Selections: 1
   └─ Max Selections: 2

5. Done! Users must pick 1-2 workshops
```

### Workflow 5: Save and Publish
```
1. Make changes to form
   └─ Badge appears: "⚠ Unsaved Changes"

2. Check for errors
   └─ Badge shows: "❌ 2 Errors" (if any)
   └─ Fix errors (publish disabled until fixed)

3. Preview (optional)
   └─ Click [Preview] button
   └─ See exact form as registrants will
   └─ Close preview

4. Save draft (optional)
   └─ Click [Save Draft]
   └─ Changes saved but not live

5. Publish
   └─ Click [Publish]
   └─ Confirm any warnings
   └─ Form goes live immediately
   └─ Toast: "Form Published ✓"
```

---

## 🚦 Visual Status Indicators

### Action Bar Badges
```
┌──────────────────────────────────────────────┐
│ Version 3 | ⚠ Unsaved Changes | ❌ 2 Errors  │
└──────────────────────────────────────────────┘

Status Badges:
• Version 3          → Current schema version
• ⚠ Unsaved Changes  → Changes not saved yet
• ❌ 2 Errors         → Validation errors (publish blocked)
• ⚠ 1 Warning        → Validation warnings (publish allowed)
```

### Field Indicators
```
┌────────────────────────────┐
│ T  Full Name *       🔒    │  ← Asterisk = required
│ Email | your@email.com     │  ← Lock = cannot delete
│ Core              [↑][↓]   │  ← "Core" = database column
└────────────────────────────┘
```

### Validation States
```
Input States:
┌────────────────┐  ← Normal
│ Enter text...  │
└────────────────┘

┌────────────────┐  ← Focus (blue border)
│ Text here      │
└────────────────┘

┌────────────────┐  ← Error (red border)
│ Too short!     │
└────────────────┘
```

---

## 🎯 Best Practices

### ✅ DO
- Create logical step groups (Personal, Professional, Preferences)
- Use clear, concise field labels
- Add helpful placeholder examples
- Use help text for complex fields
- Preview before publishing
- Fix all errors before publishing
- Save drafts frequently

### ❌ DON'T
- Create too many steps (3-5 optimal)
- Use vague labels like "Field 1"
- Forget to add options to select/radio/checkbox
- Create circular dependencies
- Delete locked core fields
- Publish with validation errors
- Ignore validation warnings without review

---

## 🔍 Quick Reference

### Keyboard Shortcuts
```
Currently using mouse/click interactions
Future: Cmd/Ctrl+S to save, Delete to remove, etc.
```

### Field Type Guide
```
Type        | Use For                    | Has Options | Validation
------------|----------------------------|-------------|------------
Text        | Names, addresses           | No          | Length
Textarea    | Long descriptions          | No          | Length
Email       | Email addresses            | No          | Format + Length
Tel         | Phone numbers              | No          | Length
Number      | Age, quantity              | No          | Min/Max value
Select      | Single choice dropdown     | Yes         | None
Radio       | Single choice visible      | Yes         | None
Checkbox    | Multiple choice            | Yes         | Min/Max selections
Toggle      | Yes/No questions           | No          | None
Heading     | Section titles             | No          | None
```

### Conditional Operators
```
equals       → Field value exactly matches
notEquals    → Field value does not match
isEmpty      → Field has no value
isNotEmpty   → Field has any value
```

---

## 📱 Responsive Design

The form builder is optimized for desktop use (1280px+ recommended). The three-panel layout provides the best experience on larger screens where all panels are visible simultaneously.

---

**End of Visual Guide**

For technical details, see `PHASE_2_IMPLEMENTATION.md`  
For completion summary, see `PHASE_2_COMPLETE.md`
