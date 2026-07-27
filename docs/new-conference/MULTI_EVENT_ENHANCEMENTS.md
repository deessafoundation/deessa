# Multi-Event Form Management — Enhancement Proposal

> **Issue:** While the system supports multiple events via `event_id`, the admin UX doesn't clearly show which form is active for which event, and the registrations table doesn't clearly indicate event/form attribution.

---

## 🎯 Problems to Solve

### 1. Form Builder Context
**Current State:**
- Form builder doesn't show which event's form is being edited
- No way to switch between events
- Could accidentally edit wrong event's form

**User Question:** *"Am I editing the form for Conference 2024 or Conference 2025?"*

### 2. Active Schema Visibility
**Current State:**
- No admin dashboard showing all events and their active form schemas
- Can't see at a glance which events have custom forms
- No version history per event visible

**User Question:** *"Which form is live for each of my events?"*

### 3. Registration Attribution
**Current State:**
- Registrations table doesn't clearly show which event
- Doesn't show which form schema version was used
- Hard to filter by event or form version

**User Question:** *"Are these registrations for Conference 2024 or 2025? Which form did they fill?"*

---

## ✅ Proposed Solutions

### Solution 1: Event Context in Form Builder

**Add Event Selector to Form Builder:**

```tsx
// At top of form builder
<div className="mb-6 p-4 border rounded-lg bg-muted">
  <div className="flex items-center justify-between">
    <div>
      <Label>Editing Form For:</Label>
      <Select value={selectedEventId} onValueChange={setSelectedEventId}>
        <SelectTrigger className="w-[300px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.name} ({event.start_date})
              {event.id === currentEventId && " — Current"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    
    <div className="text-sm text-muted-foreground">
      <div>Active Version: {activeSchema.version}</div>
      <div>Last Updated: {activeSchema.updated_at}</div>
    </div>
  </div>
</div>
```

**Benefits:**
- ✅ Admin always knows which event they're editing
- ✅ Can switch between events easily
- ✅ Shows current vs. other events
- ✅ Displays active version info

---

### Solution 2: Form Schema Dashboard

**Create New Admin Page: `/admin/conference/forms`**

Shows all events and their form schemas in a table:

| Event | Status | Active Form | Last Updated | Fields | Registrations | Actions |
|-------|--------|-------------|--------------|--------|---------------|---------|
| Conference 2024 | Past | v3 | 2024-11-15 | 18 fields | 245 | View • Clone |
| Conference 2025 | Current | v2 | 2024-12-01 | 22 fields | 12 | Edit • Preview |
| Conference 2026 | Future | Default | — | 14 fields | 0 | Edit • Use Template |

**Features:**
- ✅ See all events at a glance
- ✅ Quickly identify which forms are active
- ✅ Compare field counts across events
- ✅ See registration counts per event
- ✅ Quick actions (edit, preview, clone)

**Implementation:**

```tsx
// app/admin/conference/forms/page.tsx
export default async function FormsOverviewPage() {
  const events = await getEvents()
  const schemas = await getAllFormSchemas()
  
  return (
    <div>
      <h1>Conference Form Management</h1>
      <p>Manage registration forms for all events</p>
      
      <DataTable
        columns={formSchemaColumns}
        data={eventsWithSchemas}
        filters={[
          { column: "status", options: ["past", "current", "future"] },
          { column: "hasCustomForm", label: "Has Custom Form" },
        ]}
      />
    </div>
  )
}
```

---

### Solution 3: Enhanced Registrations Table

**Add Event/Form Columns to Registrations Table:**

Current columns:
- Name, Email, Role, Status, Date, Actions

**Add these columns:**

1. **Event Column** (new)
   - Shows event name
   - Color-coded by event status (past/current/future)
   - Sortable and filterable

2. **Form Version Column** (new)
   - Shows `v1`, `v2`, `v3`, etc.
   - Tooltip shows form details
   - Links to form schema viewer

3. **Custom Fields Indicator** (enhanced)
   - Badge showing count: `+5 custom fields`
   - Hover to see field names
   - Click to expand inline

**Enhanced Table Layout:**

```tsx
<DataTable
  columns={[
    { header: "Name", accessor: "full_name" },
    { header: "Email", accessor: "email" },
    { 
      header: "Event", 
      accessor: "event_id",
      cell: ({ row }) => (
        <Badge variant={getEventStatusVariant(row.event.status)}>
          {row.event.name}
        </Badge>
      ),
      filter: "select",
    },
    { 
      header: "Form", 
      accessor: "form_schema_version",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">v{row.form_schema_version}</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Form Version {row.form_schema_version}</p>
              <p className="text-xs">
                {row.schema.steps.length} steps, 
                {row.schema.totalFields} fields
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    { 
      header: "Custom Data", 
      accessor: "custom_fields",
      cell: ({ row }) => {
        const count = Object.keys(row.custom_fields || {}).length
        if (count === 0) return "—"
        
        return (
          <Popover>
            <PopoverTrigger>
              <Badge variant="secondary">+{count} fields</Badge>
            </PopoverTrigger>
            <PopoverContent>
              {Object.entries(row.custom_fields).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </PopoverContent>
          </Popover>
        )
      },
    },
    // ... rest of columns
  ]}
  filters={[
    { column: "event_id", label: "Event" },
    { column: "form_schema_version", label: "Form Version" },
    { column: "status", label: "Status" },
  ]}
/>
```

**Benefits:**
- ✅ Clear event attribution
- ✅ Form version visible
- ✅ Easy filtering by event
- ✅ Custom fields discoverable

---

### Solution 4: Registration Detail Page Enhancement

**Add Event/Form Context to Detail Page:**

```tsx
// Add info card at top of registration detail
<Card>
  <CardHeader>
    <CardTitle>Registration Information</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="text-muted-foreground">Event</Label>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={getEventStatusVariant(event.status)}>
            {event.name}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDate(event.start_date)}
          </span>
        </div>
      </div>
      
      <div>
        <Label className="text-muted-foreground">Form Used</Label>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline">Version {registration.form_schema_version}</Badge>
          <Button variant="ghost" size="sm" onClick={viewFormSchema}>
            <Eye className="h-4 w-4 mr-1" />
            View Form
          </Button>
        </div>
      </div>
      
      <div>
        <Label className="text-muted-foreground">Submitted</Label>
        <p>{formatDateTime(registration.created_at)}</p>
      </div>
      
      <div>
        <Label className="text-muted-foreground">Status</Label>
        <StatusBadge status={registration.status} />
      </div>
    </div>
  </CardContent>
</Card>
```

---

### Solution 5: Form Schema Viewer

**Create Read-Only Form Schema Viewer:**

Allows admins to see exactly which form a registration used.

```tsx
// Modal or separate page
<Dialog>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>Form Schema — Version {version}</DialogTitle>
      <DialogDescription>
        This is the form that was active when this registration was submitted
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-6">
      {schema.steps.map((step, index) => (
        <Card key={step.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              Step {index + 1}: {step.label}
            </CardTitle>
            {step.description && (
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {step.fields.map((field) => (
                <div key={field.id} className="flex items-start gap-3 p-2 rounded border">
                  <div className="flex-1">
                    <div className="font-medium">{field.label}</div>
                    <div className="text-sm text-muted-foreground">
                      Type: {field.type}
                      {field.required && " • Required"}
                      {field.conditional && " • Conditional"}
                    </div>
                  </div>
                  {field.storage === "core" && (
                    <Badge variant="secondary">Core Field</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </DialogContent>
</Dialog>
```

---

## 🗄️ Database Schema Enhancements

### Current Schema (Already Implemented):

```sql
-- ✅ Already has event_id
CREATE TABLE conference_form_schemas (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  version INT,
  is_active BOOLEAN,
  form_config JSONB,
  -- ...
);

-- ✅ Already has form_schema_version
CREATE TABLE conference_registrations (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),  -- ❓ Does this exist?
  form_schema_version INT,
  custom_fields JSONB,
  -- ...
);
```

### Missing: `event_id` in `conference_registrations`

**Issue:** If registrations don't have `event_id`, we can't easily filter by event.

**Solution:** Add `event_id` to registrations table:

```sql
-- Add event_id to registrations (if not exists)
ALTER TABLE conference_registrations 
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id);

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_conference_registrations_event
  ON conference_registrations(event_id, status);

-- Update existing registrations to link to current event
UPDATE conference_registrations
SET event_id = (SELECT id FROM events WHERE is_current = true)
WHERE event_id IS NULL;
```

---

## 🎨 UI Mockups

### 1. Form Builder with Event Selector

```
┌─────────────────────────────────────────────────────────┐
│ Conference Form Builder                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📋 Editing Form For:  [Conference 2025 ▼]         │ │
│ │                                                     │ │
│ │ Active Version: v2    Last Updated: Dec 1, 2024   │ │
│ │ 22 fields • 4 steps   12 registrations so far     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────┐ ┌──────────────────┐ ┌──────────────────┐│
│ │ Palette  │ │ Form Canvas      │ │ Properties       ││
│ │          │ │                  │ │                  ││
│ └──────────┘ └──────────────────┘ └──────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 2. Forms Overview Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ Conference Forms Overview                               │
├─────────────────────────────────────────────────────────┤
│ Filter: [All Events ▼] [All Versions ▼] [Search...]    │
├──────────┬────────┬───────┬──────────┬────────┬────────┤
│ Event    │ Status │ Form  │ Updated  │ Fields │ Regs   │
├──────────┼────────┼───────┼──────────┼────────┼────────┤
│ Conf2024 │ 🔴Past │ v3    │ Nov 15   │ 18     │ 245    │
│ Conf2025 │ 🟢Live │ v2    │ Dec 1    │ 22     │ 12     │
│ Conf2026 │ ⚪Soon │ v1    │ —        │ 14     │ 0      │
└──────────┴────────┴───────┴──────────┴────────┴────────┘
```

### 3. Enhanced Registrations Table

```
┌──────────────────────────────────────────────────────────────┐
│ Conference Registrations                                     │
├──────────────────────────────────────────────────────────────┤
│ Filter: [Event ▼] [Form Version ▼] [Status ▼] [Search...]  │
├────────────┬─────────┬───────┬──────┬────────┬────────┬─────┤
│ Name       │ Email   │ Event │ Form │ Custom │ Status │ ... │
├────────────┼─────────┼───────┼──────┼────────┼────────┼─────┤
│ John Doe   │ john@...│🟢2025 │ v2   │ +5     │ Paid   │ ... │
│ Jane Smith │ jane@...│🔴2024 │ v3   │ +3     │ Done   │ ... │
└────────────┴─────────┴───────┴──────┴────────┴────────┴─────┘
```

---

## 📋 Implementation Checklist

### Phase 1: Database Updates
- [ ] Verify `event_id` exists in `conference_registrations`
- [ ] If missing, add `event_id` column with migration
- [ ] Add index on `(event_id, status)`
- [ ] Backfill existing registrations with current event ID
- [ ] Update registration creation to include `event_id`

### Phase 2: Form Builder Enhancement
- [ ] Add event selector to form builder header
- [ ] Fetch all events for dropdown
- [ ] Load schema based on selected event
- [ ] Save/publish to correct event
- [ ] Show active version info
- [ ] Add event context warning when switching

### Phase 3: Forms Overview Dashboard
- [ ] Create `/admin/conference/forms` page
- [ ] Fetch all events with their active schemas
- [ ] Display in sortable/filterable table
- [ ] Add quick actions (edit, preview, clone)
- [ ] Show registration counts per event
- [ ] Add form version history per event

### Phase 4: Registrations Table Enhancement
- [ ] Add "Event" column to registrations table
- [ ] Add "Form Version" column with tooltip
- [ ] Enhance "Custom Data" column with popover
- [ ] Add event filter
- [ ] Add form version filter
- [ ] Color-code events by status

### Phase 5: Detail Page Enhancement
- [ ] Add event/form context card at top
- [ ] Link to form schema viewer
- [ ] Show event details (name, date, status)
- [ ] Show form version used
- [ ] Add "View Form" button

### Phase 6: Form Schema Viewer
- [ ] Create read-only schema viewer component
- [ ] Show all steps and fields
- [ ] Highlight conditional fields
- [ ] Show core vs custom fields
- [ ] Make accessible from registrations detail

---

## 🎯 User Flows

### Flow 1: Admin Edits Form for Specific Event

1. Admin goes to `/admin/conference/settings/form-builder`
2. Sees event selector at top: "Currently editing: Conference 2025"
3. Wants to edit different event
4. Clicks dropdown, selects "Conference 2026"
5. Form builder reloads with Conference 2026's schema
6. Admin makes changes and publishes
7. Only Conference 2026's form is affected

### Flow 2: Admin Views All Forms

1. Admin goes to `/admin/conference/forms`
2. Sees table of all events and their forms
3. Notices Conference 2026 still uses default form (v1)
4. Clicks "Use Template" → selects "Workshop Registration"
5. Template applied to Conference 2026
6. Returns to overview, sees Conference 2026 now has custom form

### Flow 3: Admin Views Registration

1. Admin goes to `/admin/conference`
2. Sees registrations with Event and Form columns
3. Filters to "Conference 2025 only"
4. Clicks on a registration
5. Detail page shows: "Event: Conference 2025 | Form: v2"
6. Clicks "View Form" to see exact form they filled
7. Sees the form had conditional logic that affected their submission

---

## ⚠️ Breaking Changes

**None!** All enhancements are additive:
- ✅ Existing schemas continue to work
- ✅ Existing registrations unaffected
- ✅ New column (`event_id` in registrations) can be nullable initially
- ✅ Backfill can happen gradually
- ✅ UI changes are purely visual enhancements

---

## 🚀 Deployment Plan

### Stage 1: Database (Low Risk)
1. Add `event_id` to `conference_registrations` (nullable)
2. Add index
3. Backfill existing records
4. Make `event_id` required for new registrations

### Stage 2: Backend (Medium Risk)
1. Update registration creation to include `event_id`
2. Update queries to join with events table
3. Add new server actions for forms overview

### Stage 3: Frontend (Low Risk)
1. Add event selector to form builder
2. Create forms overview page
3. Enhance registrations table
4. Add schema viewer component

---

## 📊 Expected Impact

**Admin Clarity:**
- 🎯 **100% clear** which event they're working on
- 📊 **Dashboard view** of all events and forms
- 🔍 **Easy filtering** by event in registrations

**Data Attribution:**
- ✅ Every registration linked to specific event
- ✅ Every registration shows form version used
- ✅ Easy to analyze forms across events

**User Confidence:**
- ✅ No more "Am I editing the right form?" anxiety
- ✅ Clear visual indicators everywhere
- ✅ Audit trail preserved

---

## 💡 Future Enhancements

### Phase 7: Form Comparison Tool
- Compare forms across events side-by-side
- See what changed between versions
- Clone form from one event to another

### Phase 8: Form Analytics
- Track completion rates per event
- Identify which fields cause drop-offs
- A/B test different form versions

### Phase 9: Automated Form Migration
- "Use last year's form for this year's event"
- Smart field mapping when cloning
- Bulk operations across events

---

**Status:** Proposal Ready for Implementation  
**Priority:** High (Core UX issue)  
**Estimated Effort:** 3-5 days  
**Breaking Changes:** None  
**Backward Compatible:** Yes
