---
title: "Conference Form Builder — Admin User Guide"
description: " For: Conference administrators and event organizers"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Conference Form Builder — Admin User Guide

> **For:** Conference administrators and event organizers  
> **Purpose:** Learn how to create and manage dynamic registration forms  
> **Estimated Reading Time:** 15 minutes

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Form](#creating-your-first-form)
3. [Field Types Guide](#field-types-guide)
4. [Conditional Logic](#conditional-logic)
5. [Form Templates](#form-templates)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Form Builder

1. Log in to the admin panel
2. Navigate to **Conference > Settings**
3. Click on the **Form Builder** tab

You'll see three main areas:
- **Left Panel:** Field types palette
- **Center Panel:** Form canvas (your form structure)
- **Right Panel:** Properties editor

---

## Creating Your First Form

### Step 1: Manage Steps

Forms are organized into steps (pages). Each step can contain multiple fields.

**To add a step:**
1. Click "+ Add Step" at the top of the canvas
2. Enter a step label (e.g., "Personal Information")
3. Optionally add a description
4. Click "Create"

**To edit a step:**
- Click the pencil icon next to the step name
- Change the label or description
- Click "Save"

**To reorder steps:**
- Click the up/down arrows next to each step

**To delete a step:**
- Click the trash icon (you'll be asked to confirm)
- ⚠️ **Warning:** Deleting a step removes all its fields

### Step 2: Add Fields

**To add a field:**
1. Select which step you want to add to (dropdown at top of left panel)
2. Click on any field type from the palette
3. The field appears in the selected step
4. Click on the field to edit its properties

### Step 3: Configure Field Properties

Click any field in the canvas to edit in the right panel:

**Basic Properties:**
- **Label:** The field name users see
- **Placeholder:** Hint text inside the input
- **Help Text:** Additional guidance below the field
- **Required:** Toggle to make field mandatory
- **Width:** Full width or half width (for side-by-side layout)

**Validation:** (varies by field type)
- **Min/Max Length:** For text fields
- **Min/Max Value:** For numbers
- **File Size Limit:** For file uploads
- **Allowed File Types:** For file uploads
- **Date Restrictions:** For date pickers

### Step 4: Preview Your Form

1. Click "Preview" button at the top
2. A modal shows your form exactly as users will see it
3. Test field validation and step navigation
4. Close preview when done

### Step 5: Save and Publish

**Save as Draft:**
- Click "Save Draft" to save without publishing
- Draft forms are NOT visible to registrants
- You can have multiple draft versions

**Publish:**
- Click "Publish" to make your form live
- Only ONE version can be active at a time
- Previous version is automatically deactivated
- Published forms appear immediately on the registration page

---

## Field Types Guide

### 13 Available Field Types

#### 1. **Text Input** 📝
Single-line text entry (names, titles, short answers)

**Best for:** Names, job titles, company names  
**Validation:** Min/max length, pattern matching  
**Example:** "Full Name", "Job Title"

#### 2. **Text Area** 📄
Multi-line text entry (long descriptions, comments)

**Best for:** Bio, comments, additional information  
**Validation:** Min/max length  
**Example:** "Tell us about yourself"

#### 3. **Email** ✉️
Email address with automatic validation

**Best for:** Contact email, alternate email  
**Validation:** Email format automatically checked  
**Example:** "Email Address" (required field)

#### 4. **Phone** ☎️
Phone number input

**Best for:** Contact number, emergency contact  
**Validation:** Phone format (flexible, supports international)  
**Example:** "Mobile Number"

#### 5. **Number** #️⃣
Numeric input with up/down controls

**Best for:** Age, quantity, years of experience  
**Validation:** Min/max value, decimal places  
**Example:** "Years of Experience"

#### 6. **Dropdown** ⬇️
Single choice from a list

**Best for:** Role, dietary preference, country (long lists)  
**Configuration:** Add options with value + label  
**Example:** "What's your role?"

#### 7. **Radio Buttons** ⭕
Single choice displayed as buttons

**Best for:** Attendance mode, yes/no questions (short lists)  
**Configuration:** Add 2-5 options  
**Example:** "Will you attend in person or virtually?"

#### 8. **Checkboxes** ☑️
Multiple choice (select many)

**Best for:** Workshop selections, interests, preferences  
**Configuration:** Add options + set min/max selections  
**Example:** "Select workshops to attend (max 3)"

#### 9. **Toggle** 🔘
Single yes/no checkbox

**Best for:** Consent, agreements, single choices  
**Validation:** Can make required  
**Example:** "I agree to terms and conditions"

#### 10. **Date Picker** 📅 *NEW*
Calendar date selection

**Best for:** Birth date, preferred dates  
**Configuration:**
- Min date (e.g., "today" or "2024-01-01")
- Max date (e.g., "today+90d")
- Disabled dates or days of week

**Example:** "Preferred arrival date"

#### 11. **URL Input** 🔗 *NEW*
Website link with validation

**Best for:** LinkedIn profile, portfolio, company website  
**Validation:** Automatically adds https:// if missing  
**Features:** Preview link icon when valid  
**Example:** "LinkedIn Profile URL"

#### 12. **File Upload** 📎 *NEW*
Upload documents or images

**Best for:** Resume, photo, certificate  
**Configuration:**
- Max file size (default: 5MB)
- Allowed types (PDF, images, documents)
- Multiple files (on/off)

**Example:** "Upload your resume (PDF only, max 5MB)"

#### 13. **Heading** / **Paragraph** 📋
Non-input fields for information

**Best for:** Section titles, instructions  
**Example:** "Workshop Preferences" (heading)

---

## Conditional Logic

Show or hide fields based on other field values.

### Simple Conditionals

**Use case:** Show "Job Title" only if Role is "Employee"

**Steps:**
1. Click the field you want to conditionally show ("Job Title")
2. In properties panel, enable "Conditional Visibility"
3. Choose dependency field ("Role")
4. Select operator ("equals")
5. Enter value ("Employee")
6. Save

**Available Operators:**
- **Equals** — Field value exactly matches
- **Not Equals** — Field value does not match
- **Is Empty** — Field has no value
- **Is Not Empty** — Field has any value
- **Contains** — Text includes substring *(advanced)*
- **Greater Than** — Numeric comparison *(advanced)*
- **Less Than** — Numeric comparison *(advanced)*

### Advanced Conditionals (AND/OR)

**Use case:** Show "Skills" if Experience > 5 OR Certification is checked

**Steps:**
1. Enable conditional visibility
2. Click "Use Advanced Logic"
3. Click "+ Add Condition" for each rule
4. Set logic operator: "AND" (all must be true) or "OR" (any can be true)
5. Configure each condition
6. Save

**Tips:**
- Keep conditions simple (max 3 rules)
- Dependency fields must be from earlier steps
- Test with preview before publishing
- Circular dependencies are automatically prevented

---

## Form Templates

Save time by reusing form structures.

### Using a Template

**To browse templates:**
1. Click "Templates" button
2. Browse "Browse Templates" tab
3. Filter by category if needed
4. Click a template to select it
5. Click "Apply Template"
6. Template loads into form builder (as draft)
7. Customize as needed
8. Publish when ready

**Default Templates:**
- **Basic Registration** — Name, email, consent only
- **Workshop Registration** — Personal info + workshop preferences

### Creating a Template

**To save your form as a template:**
1. Build your form
2. Click "Templates" → "Save as Template" tab
3. Enter template name (required)
4. Add description (optional but recommended)
5. Choose category (e.g., "workshop", "seminar")
6. Toggle "Make public" if you want other admins to use it
7. Click "Save Template"

**Your template is now available for future events!**

---

## Best Practices

### Form Design

 **DO:**
- Keep steps focused (5-7 fields per step max)
- Use clear, descriptive labels
- Add help text for complex fields
- Test your form before publishing
- Use conditional logic to reduce clutter

❌ **DON'T:**
- Create 20-field single-step forms (use multiple steps)
- Use jargon in field labels
- Make everything required (only essentials)
- Forget to preview before publishing

### Field Organization

**Step 1:** Personal details (name, email, contact)  
**Step 2:** Event-specific info (role, attendance, workshops)  
**Step 3:** Additional info (dietary, t-shirt, emergency contact)  
**Step 4:** Review (auto-generated, cannot edit)

### Performance Tips

- **Limit conditional chains:** Max 3 levels deep
- **File uploads:** Set appropriate size limits (5MB default)
- **Large dropdown lists:** Use search-enabled dropdowns (auto-enabled for 10+ options)

### Accessibility

- Always fill in field labels (screen reader users rely on them)
- Use help text instead of placeholder for important info
- Test keyboard navigation (Tab, Shift+Tab, Enter)
- Avoid color-only indicators (use icons + text)

---

## Troubleshooting

### Common Issues

**Q: My form changes aren't visible on the registration page**  
A: Make sure you clicked "Publish" not just "Save Draft"

**Q: A field won't show up even though I added it**  
A: Check if it has a conditional rule that's not being met. Disable conditions to test.

**Q: File uploads are failing**  
A: Check:
- File size is under the limit (default 5MB)
- File type is allowed (check field configuration)
- Storage bucket is properly configured (contact developer if issue persists)

**Q: I can't delete a field**  
A: Core fields (name, email, consent) are locked and cannot be deleted. You can hide them but they remain in the database.

**Q: Conditional logic isn't working**  
A: Verify:
- Dependency field is in an earlier step
- Operator matches the data type (e.g., use "Greater Than" for numbers, not text)
- Values match exactly (case-sensitive)
- No circular dependencies

**Q: Form is slow to load**  
A: Consider:
- Reducing total number of fields (use conditional logic to hide some)
- Simplifying complex conditional rules
- Using templates instead of huge custom forms

### Getting Help

- **Technical Issues:** Contact your development team
- **Form Design Questions:** Check examples in template library
- **Bug Reports:** Use the issue tracker or email support

---

## Quick Reference Card

| Action | Steps |
|--------|-------|
| Add field | Select step → Click field type in palette |
| Edit field | Click field in canvas → Edit in right panel |
| Delete field | Click field → Click trash icon in right panel |
| Add step | Click "+ Add Step" button |
| Reorder steps | Use up/down arrows next to step name |
| Preview form | Click "Preview" button at top |
| Save draft | Click "Save Draft" (not visible to users) |
| Publish | Click "Publish" (goes live immediately) |
| Apply template | Click "Templates" → Browse → Select → Apply |
| Save template | Click "Templates" → Save as Template tab |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save draft |
| `Ctrl + P` | Preview form |
| `Ctrl + Z` | Undo last change |
| `Ctrl + Y` | Redo |
| `Tab` | Navigate between fields |
| `Esc` | Close modal/cancel edit |

---

## Video Tutorials

*(Links to be added in future)*

1. Creating Your First Form (5 min)
2. Using Conditional Logic (7 min)
3. File Uploads and Advanced Fields (6 min)
4. Form Templates Masterclass (10 min)

---

## Changelog

- **Phase 5** — Added: Accessibility features, performance improvements
- **Phase 4** — Added: Date, URL, file upload fields; advanced conditionals; templates
- **Phase 3** — Added: Custom field data visibility in admin dashboard
- **Phase 2** — Initial form builder release
- **Phase 1** — Dynamic form rendering foundation

---

**Need more help?** Contact your system administrator or check the developer documentation.

**Last Updated:** Phase 5 Complete  
**Version:** 1.0
