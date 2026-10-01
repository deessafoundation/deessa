---
title: "Conference Dynamic Form System - Analysis & Proposal"
description: "Located at: /conference/register"
owner: "deessa Team"
status: archived
category: archived
audience: admin
last_updated: 2026-09-12
---
# Conference Dynamic Form System - Analysis & Proposal

## Current Implementation Overview

### 1. **Conference Registration Form**
Located at: `/conference/register`

**Current Structure:**
- **4-step multi-step form** with progress indicator
- **Fixed fields** hardcoded into React components
- **Three form steps** + one review step

#### Step 1: Personal Details
- Full Name (required)
- Email (required)
- Phone (optional)
- Organization (optional)

#### Step 2: Participation Details
- Role (required) - dropdown with 5 fixed options
- Attendance Mode (required) - radio buttons (in-person/online)
- Workshops (optional) - multi-select, max 2 from 6 fixed options

#### Step 3: Additional Info
- Dietary Preference - dropdown with 5 fixed options
- T-Shirt Size - radio buttons (S, M, L, XL, XXL)
- Heard Via - multi-select checkboxes (5 fixed options)
- Emergency Contact Name (optional)
- Emergency Contact Phone (optional)

#### Step 4: Review & Submit
- Displays all entered data
- Consent checkboxes (terms & newsletter)

### 2. **Admin Settings Panel**
Located at: `/admin/conference/settings`

**Current Capabilities:**
 Event Details (name, dates, venue, contact)
 Payment Configuration (fees, currency, expiry)
 Agenda/Timeline Management (add/remove/reorder items)
 Email Templates (3 types: general, reminder, directions)

**What's Missing:**
❌ No form field management
❌ No ability to add/remove/modify registration form fields
❌ No control over field types, validation, or options
❌ No conditional field logic

### 3. **Database Schema**
Table: `conference_registrations`

**Fixed Columns:**
```sql
-- Personal Details
full_name, email, phone, organization

-- Participation
role, attendance_mode, workshops (TEXT[])

-- Additional Info
dietary_preference, tshirt_size, heard_via (TEXT[]),
emergency_contact_name, emergency_contact_phone

-- System
consent_terms, consent_newsletter, status, notes
```

**Problem:** Schema is rigid and doesn't support dynamic fields.

---

## Problems with Current System

### 1. **Lack of Flexibility**
- Form fields are **hardcoded** in React components
- Field options (roles, workshops, dietary preferences) are **static arrays**
- Any change requires **code modification** and **redeployment**

### 2. **No Admin Control**
- Admin cannot add custom questions (e.g., "What's your LinkedIn profile?")
- Cannot remove unnecessary fields
- Cannot change field labels, placeholders, or help text
- Cannot reorder fields or change step organization

### 3. **Database Rigidity**
- Schema has fixed columns for specific fields
- No way to store additional custom field responses
- Cannot adapt to different conference types or requirements

### 4. **Scalability Issues**
- Each new conference might need different registration questions
- Multi-event organizations need different forms per event
- Cannot A/B test different form structures

---

## Proposed Solution: Dynamic Form Builder

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Panel                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Form Builder UI                                       │  │
│  │  - Add/Remove Fields                                   │  │
│  │  - Configure Field Types                               │  │
│  │  - Set Validation Rules                                │  │
│  │  - Organize into Steps                                 │  │
│  │  - Preview Form                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Database: conference_form_schema                      │  │
│  │  - Stores JSON configuration                           │  │
│  │  - Version control                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Public Registration Form                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Dynamic Form Renderer                                 │  │
│  │  - Reads JSON schema                                   │  │
│  │  - Renders appropriate field types                     │  │
│  │  - Applies validation rules                            │  │
│  │  - Handles conditional logic                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Database: conference_registrations                    │  │
│  │  - Fixed columns for core fields                       │  │
│  │  - JSONB column for custom field responses            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Database Changes Required

#### 1. New Table: `conference_form_schemas`
```sql
CREATE TABLE conference_form_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Versioning
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Form configuration
  form_config JSONB NOT NULL,
  -- Structure example:
  -- {
  --   "steps": [
  --     {
  --       "id": "personal",
  --       "label": "Personal Details",
  --       "fields": [
  --         {
  --           "id": "full_name",
  --           "type": "text",
  --           "label": "Full Name",
  --           "required": true,
  --           "placeholder": "Enter your full name",
  --           "validation": {"minLength": 2, "maxLength": 100}
  --         }
  --       ]
  --     }
  --   ]
  -- }
  
  -- Metadata
  created_by UUID REFERENCES admin_users(id),
  notes TEXT
);
```

#### 2. Update Existing Table: `conference_registrations`
```sql
ALTER TABLE conference_registrations
  ADD COLUMN custom_fields JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN form_schema_version INT REFERENCES conference_form_schemas(version);

-- Index for efficient JSONB queries
CREATE INDEX idx_conference_reg_custom_fields 
  ON conference_registrations USING GIN (custom_fields);
```

### Form Field Schema Definition

```typescript
type FieldType = 
  | "text"           // Single-line text input
  | "textarea"       // Multi-line text
  | "email"          // Email with validation
  | "phone"          // Phone number
  | "number"         // Numeric input
  | "date"           // Date picker
  | "select"         // Dropdown (single choice)
  | "radio"          // Radio buttons (single choice)
  | "checkbox"       // Checkboxes (multiple choice)
  | "toggle"         // Boolean switch
  | "file"           // File upload
  | "url"            // URL with validation

interface FormField {
  id: string                    // Unique identifier
  type: FieldType               // Field type
  label: string                 // Display label
  placeholder?: string          // Placeholder text
  helpText?: string            // Help/hint text
  required: boolean            // Required validation
  defaultValue?: any           // Default value
  
  // Validation rules
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number               // For numbers/dates
    max?: number
    pattern?: string           // Regex pattern
    customMessage?: string     // Custom error message
  }
  
  // For select/radio/checkbox fields
  options?: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  
  // For checkbox groups
  maxSelections?: number      // Max items that can be selected
  minSelections?: number      // Min items required
  
  // Conditional logic
  conditional?: {
    dependsOn: string         // Field ID to depend on
    condition: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan"
    value: any                // Value to compare against
  }
  
  // Layout
  width?: "full" | "half" | "third"  // Column width
  order: number                       // Display order
  
  // Database mapping
  storageType: "core" | "custom"     // Core = fixed column, Custom = JSONB
  columnName?: string                 // If core, which column
}

interface FormStep {
  id: string
  label: string
  description?: string
  order: number
  fields: FormField[]
}

interface FormSchema {
  version: number
  steps: FormStep[]
  metadata: {
    createdAt: string
    createdBy: string
    lastModified: string
    isActive: boolean
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Set up database and basic dynamic rendering

**Tasks:**
1. Create `conference_form_schemas` table
2. Add `custom_fields` JSONB column to `conference_registrations`
3. Create default form schema from current hardcoded form
4. Build Dynamic Form Renderer component
5. Update registration form to read from schema

**Deliverables:**
- Migration scripts
- Dynamic form renderer that works with current fields
- Zero visual/functional changes to end users

### Phase 2: Admin Form Builder UI (Week 3-4)
**Goal:** Build admin interface for form management

**Tasks:**
1. Create Form Builder page at `/admin/conference/settings/form-builder`
2. Field management UI:
   - Add new field button
   - Field configuration modal (type, label, validation, etc.)
   - Drag-and-drop field reordering
   - Delete field with confirmation
3. Step management:
   - Add/remove/reorder steps
   - Assign fields to steps
4. Preview functionality
5. Save/publish workflow with version control

**Deliverables:**
- Full form builder interface
- Real-time preview
- Version history tracking

### Phase 3: Advanced Features (Week 5-6)
**Goal:** Add conditional logic and advanced field types

**Tasks:**
1. Conditional field visibility
2. Advanced field types (file upload, URL, etc.)
3. Field dependencies and validation chains
4. Custom validation rules
5. Import/Export form templates
6. Duplicate form schema

**Deliverables:**
- Conditional logic engine
- Template marketplace
- Advanced field types

### Phase 4: Data Management (Week 7)
**Goal:** Handle custom field data in admin panel

**Tasks:**
1. Update admin registrations table to display custom fields
2. Export functionality for custom field data
3. Filtering and searching by custom fields
4. Analytics for custom field responses

**Deliverables:**
- Enhanced admin dashboard
- Custom field data exports
- Analytics views

---

## Technical Implementation Details

### 1. Dynamic Form Renderer Component

```typescript
// components/conference/dynamic-form-renderer.tsx
interface DynamicFormRendererProps {
  schema: FormSchema
  onSubmit: (data: any) => Promise<void>
}

export function DynamicFormRenderer({ schema, onSubmit }: DynamicFormRendererProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  
  // Render field based on type
  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
        return <TextInput field={field} value={formData[field.id]} onChange={...} />
      case "select":
        return <SelectInput field={field} value={formData[field.id]} onChange={...} />
      // ... other field types
    }
  }
  
  // Check conditional visibility
  const isFieldVisible = (field: FormField) => {
    if (!field.conditional) return true
    const dependentValue = formData[field.conditional.dependsOn]
    // Apply condition logic
    return evaluateCondition(field.conditional, dependentValue)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {schema.steps[currentStep].fields
        .filter(isFieldVisible)
        .map(renderField)}
    </form>
  )
}
```

### 2. Form Builder Admin Interface

```typescript
// components/admin/conference-form-builder.tsx
export function ConferenceFormBuilder() {
  const [schema, setSchema] = useState<FormSchema>()
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Field Library */}
      <div className="col-span-1">
        <FieldLibrary onFieldSelect={addField} />
      </div>
      
      {/* Center: Canvas */}
      <div className="col-span-1">
        <FormCanvas 
          schema={schema}
          onFieldClick={setSelectedField}
          onReorder={handleReorder}
        />
      </div>
      
      {/* Right: Properties Panel */}
      <div className="col-span-1">
        {selectedField && (
          <FieldProperties 
            field={selectedField}
            onChange={updateField}
          />
        )}
      </div>
    </div>
  )
}
```

### 3. Server Actions for Form Management

```typescript
// lib/actions/conference-form-schema.ts
export async function getActiveFormSchema(): Promise<FormSchema> {
  const { data } = await supabase
    .from('conference_form_schemas')
    .select('*')
    .eq('is_active', true)
    .single()
  
  return data.form_config
}

export async function updateFormSchema(schema: FormSchema): Promise<Result> {
  // Increment version
  const newVersion = schema.version + 1
  
  // Insert new version
  const { error } = await supabase
    .from('conference_form_schemas')
    .insert({
      version: newVersion,
      form_config: schema,
      is_active: true,
      created_by: getCurrentAdminId()
    })
  
  // Deactivate old versions
  if (!error) {
    await supabase
      .from('conference_form_schemas')
      .update({ is_active: false })
      .neq('version', newVersion)
  }
  
  return { success: !error, error: error?.message }
}
```

---

## Benefits

### For Admins
 **Full control** over registration form without code changes
 **Easy customization** for different events or conferences
 **Quick iterations** - test different questions, reorder fields
 **Version history** - rollback to previous form versions
 **Better data collection** - ask exactly what you need

### For Developers
 **Reduced maintenance** - no code changes for form updates
 **Reusable system** - can extend to other forms (volunteer, contact, etc.)
 **Clean separation** - form structure decoupled from rendering logic
 **Type-safe** - schema validation ensures data integrity

### For Users (Registrants)
 **Faster forms** - only relevant fields shown
 **Better UX** - conditional logic reduces clutter
 **Clear guidance** - custom help text per field
 **No unnecessary questions** - admins can remove unused fields

---

## Migration Strategy

### Backward Compatibility
1. Keep existing fixed columns for core fields (name, email, etc.)
2. New custom fields go into JSONB column
3. Existing registrations continue to work without changes
4. Default schema matches current form exactly

### Rollout Plan
1. **Phase 1:** Deploy foundation with zero UI changes
2. **Test:** Ensure all existing functionality works
3. **Phase 2:** Enable admin form builder in staging
4. **Train:** Admin team learns to use form builder
5. **Phase 3:** Roll out to production with feature flag
6. **Monitor:** Track usage and gather feedback
7. **Phase 4:** Gradually enable advanced features

---

## Alternative Approaches Considered

### Option 1: Use Third-Party Form Builder (e.g., Typeform, Google Forms)
**Pros:** Quick to implement, no development needed
**Cons:** 
- External dependency
- Data lives outside your database
- Limited customization
- Ongoing costs
- No integration with payment flow

### Option 2: Build Simple Field Toggle System
**Pros:** Simpler to build
**Cons:**
- Still limited flexibility
- Can only show/hide existing fields
- Cannot add new questions
- Doesn't solve the core problem

### Option 3: One Form Per Event (Multiple Tables)
**Pros:** Complete isolation per event
**Cons:**
- Schema management nightmare
- Duplicate code for each form
- Analytics across events difficult
- Scalability issues

**Conclusion:** Custom dynamic form builder is the best long-term solution.

---

## Estimated Effort

| Phase | Tasks | Time Estimate | Complexity |
|-------|-------|---------------|------------|
| Phase 1: Foundation | Database schema, Dynamic renderer | 1-2 weeks | Medium |
| Phase 2: Admin Builder | Form builder UI, CRUD operations | 2-3 weeks | High |
| Phase 3: Advanced Features | Conditional logic, advanced fields | 1-2 weeks | High |
| Phase 4: Data Management | Admin dashboard updates | 1 week | Low |
| **Total** | | **5-8 weeks** | |

---

## Risks & Mitigation

### Risk 1: Complex State Management
**Mitigation:** Use Zustand or React Context for form state, comprehensive testing

### Risk 2: Performance with Large Forms
**Mitigation:** Lazy load field components, virtualize long forms, optimize re-renders

### Risk 3: Data Migration Issues
**Mitigation:** Extensive testing, gradual rollout, maintain backward compatibility

### Risk 4: Admin Learning Curve
**Mitigation:** Intuitive UI, comprehensive documentation, training sessions, video tutorials

---

## Recommendations

### Immediate Next Steps (If Approved)
1. **Review & approve** this proposal with stakeholders
2. **Set up project** in task management system
3. **Create database migration scripts** for Phase 1
4. **Start building** dynamic form renderer component
5. **Design** form builder UI mockups

### Quick Wins (Can Do Now)
While planning the full system, you can make these improvements:
1. Move hardcoded field options to database table
2. Create admin UI to edit field options (roles, workshops, dietary preferences)
3. Add ability to enable/disable optional fields
4. This gives some flexibility without major architecture changes

---

## Questions to Decide

1. **Scope:** Do you want this for conference forms only, or should it work for other forms too (volunteer, contact)?
2. **Timeline:** When do you need this feature? Is there a specific conference deadline?
3. **Priority:** What's most important - basic field management or full conditional logic?
4. **Resources:** Who will be working on this? Do you need to hire/contract additional help?
5. **Budget:** Any budget constraints for external services or tools?

---

## Conclusion

The current conference registration system is functional but inflexible. Building a dynamic form builder system will:

- **Empower admins** to manage forms without developer help
- **Improve user experience** through conditional logic and relevant questions
- **Reduce development overhead** by eliminating code changes for form updates
- **Enable scalability** for multiple events with different requirements
- **Provide better data** by asking exactly the right questions

This is a **significant but worthwhile investment** that will pay dividends in flexibility, efficiency, and user satisfaction. The phased approach allows you to deliver value incrementally while managing risk.

**Recommendation: Proceed with Phase 1 & 2, then evaluate before committing to advanced features.**
