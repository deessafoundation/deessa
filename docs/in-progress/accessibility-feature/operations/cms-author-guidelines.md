# CMS Author Accessibility Guidelines

**For:** Content Authors, Editors, Marketing Team  
**Last Updated:** September 16, 2026

---

## Introduction

As a content author at deessa Foundation, you play a crucial role in maintaining an accessible website. This guide provides practical tips and checklists to ensure the content you create is accessible to all users, including those with disabilities.

**Remember:** Accessibility features (like text scaling and high contrast) work alongside well-structured content. Both are needed for full accessibility!

---

## Quick Checklist

Before publishing any content, verify:

- [ ] All images have alt text (or marked decorative)
- [ ] Headings are in logical order (H2 → H3 → H4, not H2 → H4)
- [ ] Links have descriptive text (not "click here")
- [ ] Videos have captions
- [ ] Tables have headers
- [ ] Lists use proper list formatting
- [ ] Text is not in all caps
- [ ] Colors have sufficient contrast
- [ ] No information conveyed by color alone

---

## 1. Images

### Adding Alt Text

**What is alt text?**  
Alt text is a text description of an image that screen readers announce to blind users.

**How to write good alt text:**

✅ **DO:**
- Describe what's in the image
- Keep it concise (under 150 characters)
- Include relevant context
- End with punctuation (helps screen readers pause)

```
✅ Good: "Students participating in a science workshop at deessa Foundation."
❌ Bad: "Image123.jpg"
❌ Bad: "Students"
❌ Bad: "A group of people doing something in a room with tables."
```

**When to leave alt text empty:**

Some images are purely decorative and don't add information. Mark these as decorative:

```
Examples of decorative images:
- Border patterns
- Spacer images
- Background textures
- Icons that duplicate adjacent text
```

**In CMS:** Check "Mark as decorative" or leave alt text field empty for decorative images.

---

**Complex Images (Charts, Diagrams):**

For infographics, charts, or diagrams:

1. **Short alt text:** Brief description
2. **Long description:** Full explanation in text nearby

```
Example:
Alt text: "Bar chart showing donation growth 2020-2026."
Text below image: "Donations increased from $50,000 in 2020 to 
$200,000 in 2026, with steady growth each year..."
```

---

### Image Best Practices

**Size and Quality:**
- Use web-optimized images (not 5 MB originals!)
- Recommended: JPG for photos, PNG for graphics, WebP when possible
- Maximum width: 2000px for full-width images

**File Names:**
- Use descriptive file names: `students-workshop-2026.jpg`
- Not: `IMG_1234.jpg` or `photo.jpg`

**Captions:**
- Captions complement alt text (not replace it)
- Use captions for context, credits, or additional info
- Alt text describes the image, captions explain its relevance

---

## 2. Headings

### Heading Hierarchy

**Headings are like a table of contents** - they must be in order!

✅ **DO:**
```
H1: Page Title (only one per page)
  H2: Main Section
    H3: Subsection
    H3: Another Subsection
  H2: Another Main Section
    H3: Subsection
      H4: Sub-subsection
```

❌ **DON'T:**
```
H1: Page Title
  H4: Section (skipped H2 and H3!)
  H2: Section
    H5: Subsection (skipped H3 and H4!)
```

**Why it matters:**
- Screen readers use headings for navigation
- Users can jump between sections
- Helps everyone scan content

---

### Choosing Heading Levels

**H1:** Page title (automatic in our CMS - don't add another!)  
**H2:** Major sections of the page  
**H3:** Subsections within H2  
**H4:** Sub-subsections within H3  
**H5-H6:** Rarely needed

**Don't choose headings by size** - use the level that fits the content structure. Our accessibility features let users adjust text size themselves!

---

### Writing Good Headings

✅ **DO:**
- Be descriptive: "Our Impact in 2026"
- Use plain language: "How to Donate"
- Keep concise: "Contact Us"

❌ **DON'T:**
- Be vague: "Information"
- Use questions unnecessarily: "Want to Know More?"
- Make them too long: "This is the Section Where We Talk About..."

---

## 3. Links

### Link Text

**Link text should make sense out of context.**

✅ **DO:**
```
"Read our 2026 Annual Report (PDF, 2 MB)"
"View upcoming events calendar"
"Learn about our autism support programs"
```

❌ **DON'T:**
```
"Click here" (here? where?)
"Read more" (more of what?)
"Download" (download what?)
"Link" (obviously it's a link!)
```

---

### Link Best Practices

**1. Descriptive Text:**
The link text should describe the destination or action.

**2. Context Matters:**
If you must use "click here", add context:
```
"For donation information, click here."
Better: "View donation information and payment options."
```

**3. Avoid URLs as Link Text:**
```
❌ Bad: "Visit https://www.deessafoundation.org/donate"
✅ Good: "Visit our donation page"
```

**Exception:** Email addresses and phone numbers are okay:
```
✅ OK: "Email us at info@deeshafoundation.org"
✅ OK: "Call +977-XXX-XXXX"
```

**4. Indicate File Type and Size:**
```
"Download Annual Report (PDF, 2.5 MB)"
"View Financial Statement (Excel, 150 KB)"
```

**5. External Links:**
Our CMS automatically adds an icon for external links, but you can mention it:
```
"Visit WHO website (opens in new window)"
```

---

## 4. Videos and Audio

### Video Captions

**All videos MUST have captions** - not optional!

**Captions include:**
- Spoken dialogue
- Speaker identification
- Sound effects: [applause], [music playing]
- Important non-speech sounds

**How to add captions:**
1. **YouTube:** Use auto-captions as a starting point, then edit for accuracy
2. **Upload SRT/VTT file:** For videos hosted on our site
3. **Request help:** Contact [accessibility@deeshafoundation.org] if you need assistance

**Caption Quality Checklist:**
- [ ] Accurate (match what's said)
- [ ] Synchronized (appear at right time)
- [ ] Complete (include all spoken words)
- [ ] Readable (not too fast)
- [ ] Include sound effects when relevant

---

### Audio Descriptions

For videos where visual information is important (demonstrations, tours, etc.), consider audio descriptions:

**Audio description** = Narration of visual content during pauses in dialogue

**Example:**
```
[Visual: Person signing "hello" in sign language]
[Audio description: "She signs 'hello' by waving her hand"]
```

**When needed:**
- Instructional videos
- Tours or walkthroughs
- Videos with important visual information
- Silent demonstrations

---

### Transcripts

**Provide transcripts for:**
- Podcasts
- Audio-only content
- Video content (in addition to captions)

**Transcript Format:**
```
[00:00] Speaker Name: "Welcome to our podcast..."
[00:15] Host: "Today we're discussing..."
[Sound effect: Phone ringing]
[01:30] Guest: "Thank you for having me..."
```

**In CMS:** Use the "Transcript" field below video/audio embeds

---

## 5. Lists

### When to Use Lists

Use lists for:
- Steps in a process
- Items in a category
- Options or choices
- Related items

**Don't use lists for:**
- Normal paragraphs (just because they're short)
- Single items

---

### Types of Lists

**Unordered (Bullet) Lists:**
When order doesn't matter:
```
• Programs we offer
• Benefits of volunteering
• Contact methods
```

**Ordered (Numbered) Lists:**
When order matters:
```
1. Fill out the application form
2. Submit required documents
3. Wait for approval
4. Attend orientation
```

**In CMS:** Use the list buttons in the toolbar, don't manually type bullets or numbers!

---

## 6. Tables

### When to Use Tables

✅ **DO use tables for:**
- Tabular data (numbers, statistics)
- Comparison charts
- Schedules
- Data that has rows and columns

❌ **DON'T use tables for:**
- Page layout
- Image galleries
- Content that's not actually tabular

---

### Table Structure

**Essential Elements:**

**1. Table Caption:**
Describes what the table shows:
```html
<caption>2026 Program Enrollment by Month</caption>
```

**2. Column Headers:**
First row should identify what each column contains:
```
| Month | Enrollments | Completions |
```

**3. Row Headers (if applicable):**
First column can also be headers

**In CMS:**
1. Insert table
2. Check "First row is header"
3. Add caption in "Table Caption" field
4. Fill in data

---

### Table Best Practices

**Keep it Simple:**
- Avoid merged cells when possible
- Don't nest tables
- Keep tables reasonably sized (split large tables)

**Add Summary:**
For complex tables, add explanatory text before or after:
```
"The table below shows monthly program enrollment and completion 
rates for 2026. Enrollment peaked in March with 150 participants."
```

---

## 7. Text Formatting

### Emphasis and Importance

**Use semantic formatting:**

**Bold (strong):** Important information
```
CMS: Use "Bold" button
HTML: <strong>important text</strong>
Screen reader: "important text, emphasized"
```

**Italic (emphasis):** Slight emphasis or titles
```
CMS: Use "Italic" button  
HTML: <em>emphasized text</em>
Screen reader: "emphasized text, stressed"
```

---

### What to Avoid

**❌ ALL CAPS TEXT:**
- Harder to read
- Screen readers may spell it out letter by letter
- Comes across as shouting

**Instead:** Use bold or headings for emphasis

---

**❌ Underlined Text:**
- Looks like a link
- Confusing for users

**Instead:** Use bold or italic

---

**❌ Color Alone:**
Don't convey information only with color:
```
❌ "Click the green button to continue"
✅ "Click the Continue button (green, bottom right)"

❌ Red text for errors (only)
✅ Red text + error icon + "Error:" label
```

---

### Text Alignment

**Left-align by default** - Easiest to read

**Center:** Only for short text (headings, buttons)

**Justified:** Avoid - creates uneven spacing

**Right-align:** Only for specific design needs (rarely)

---

## 8. Color and Contrast

### Contrast Requirements

**Text must have sufficient contrast with its background:**

**Minimum Ratios (WCAG AA):**
- Normal text: 4.5:1
- Large text (18pt+ or 14pt+ bold): 3:1

**How to Check:**
Use a contrast checker tool:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Browser extension: "WCAG Color Contrast Checker"

**In CMS:**
Our default text colors meet contrast requirements. Be careful when:
- Changing text color
- Adding colored backgrounds
- Using text over images

---

### Color Use

**Don't rely on color alone** to convey information:

❌ **Bad:**
"Required fields are in red"

✅ **Good:**
"Required fields are marked with a red asterisk (*)"

---

**Use color purposefully:**
- Links: Blue/underlined
- Errors: Red + icon + label
- Success: Green + icon + label
- Warnings: Yellow/orange + icon + label

---

## 9. Forms

### Form Labels

**Every form field needs a label!**

✅ **DO:**
```
Name: [input field]
Email: [input field]
Message: [textarea]
```

❌ **DON'T:**
```
[input field with placeholder "Name"]
[input field with no label at all]
```

**Placeholders are NOT labels** - they disappear when you start typing!

---

### Instructions

**Provide clear instructions:**

```
✅ Good:
"Phone Number
Format: +977-XXX-XXXX
Example: +977-1-4444444"

❌ Bad:
"Phone
(Enter your phone number)"
```

**Required Fields:**
```
Name *
(* indicates required field)
```

Or use "Required" label:
```
Name (Required)
```

---

### Error Messages

**Error messages must be:**
1. **Clear:** Explain what's wrong
2. **Specific:** Not just "Error"
3. **Actionable:** Tell users how to fix it

✅ **Good Error Messages:**
```
"Email is required. Please enter your email address."
"Phone number format is incorrect. Use +977-XXX-XXXX format."
"Password must be at least 8 characters with one number."
```

❌ **Bad Error Messages:**
```
"Error"
"Invalid input"
"Please fix errors"
```

---

## 10. PDFs and Documents

### Creating Accessible PDFs

**If you must use PDFs:**

1. **Start with accessible Word/Google Docs:**
   - Use Styles for headings
   - Add alt text to images
   - Use built-in list formatting

2. **Export as "Accessible PDF":**
   - Word: File > Export > Create PDF/XPS > Options > "Document structure tags for accessibility"
   - Google Docs: File > Download > PDF

3. **Check accessibility:**
   - Adobe Acrobat: Tools > Accessibility > Full Check
   - Preview: Not sufficient, use Acrobat

**Better alternative: HTML pages instead of PDFs**

---

### Document Alternatives

**Always provide:**
- HTML version of content (preferred)
- Or: Offer to send accessible format on request

```
"Annual Report available in:
- PDF (2.5 MB)
- HTML (web version)
- Accessible format available on request: email info@deeshafoundation.org"
```

---

## 11. Writing Style

### Plain Language

**Use simple, clear language:**

✅ **DO:**
- Use short sentences (15-20 words)
- Use common words
- Explain jargon if necessary
- Write conversationally

❌ **DON'T:**
- Use unnecessarily complex words
- Write long, winding sentences
- Assume everyone knows acronyms
- Use passive voice excessively

---

### Reading Level

**Aim for 8th-grade reading level** for general content

**Tools to check:**
- Hemingway Editor: http://hemingwayapp.com/
- MS Word: File > Options > Proofing > "Show readability statistics"
- Grammarly

**Exceptions:**
- Technical documentation (can be more advanced)
- Legal requirements (but explain in plain language too)

---

### Acronyms and Abbreviations

**Spell out on first use:**

```
✅ Good: "World Health Organization (WHO)"
Then use: "WHO" for rest of article

❌ Bad: "The WHO announced..." (what's WHO?)
```

**Common acronyms are okay:**
- NGO (Non-Governmental Organization)
- UN (United Nations)
- USA (United States of America)

But spell them out once anyway!

---

## 12. Content Updates

### Archiving Old Content

**Mark outdated content clearly:**

```
"Note: This information is from 2024 and may be outdated.
For current information, visit [link]."
```

**Remove or update:**
- Expired events
- Old news (older than 2 years)
- Broken links
- Outdated statistics

---

### Maintaining Accessibility

**When updating content:**
- [ ] Check all images still have alt text
- [ ] Verify headings are still in order
- [ ] Test all links
- [ ] Update dates ("Last updated: [date]")
- [ ] Check contrast if colors changed
- [ ] Re-check accessibility before publishing

---

## Tools and Resources

### Accessibility Checkers

**Browser Extensions:**
- WAVE (Web Accessibility Evaluation Tool)
- axe DevTools
- Lighthouse (built into Chrome DevTools)

**How to use:**
1. Install extension
2. Navigate to your page
3. Run the checker
4. Fix reported issues
5. Re-check

---

### Contrast Checkers

- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Contrast Ratio: https://contrast-ratio.com/
- Browser extensions: "Colour Contrast Checker"

---

### Alt Text Guides

- WebAIM Alternative Text: https://webaim.org/articles/alt/
- W3C Images Tutorial: https://www.w3.org/WAI/tutorials/images/

---

### Plain Language Resources

- PlainLanguage.gov: https://www.plainlanguage.gov/
- Hemingway Editor: http://hemingwayapp.com/

---

## CMS-Specific Features

### Built-in Accessibility Checks

Our CMS includes:

✅ **Automated checks:**
- Missing alt text warnings
- Heading order issues
- Low contrast detection
- Empty links

⚠️ **Review before publishing:**
Check the "Accessibility" tab in the editor

---

### CMS Accessibility Toolbar

**Available tools:**
- Add alt text
- Insert accessible table
- Check heading structure
- Preview with screen reader simulation
- Run accessibility scan

---

## Getting Help

### Questions?

**Contact:**
- Accessibility Lead: [accessibility@deeshafoundation.org]
- Content Team: [content@deeshafoundation.org]
- Tech Support: [support@deeshafoundation.org]

### Training

**Available resources:**
- Monthly accessibility workshops
- One-on-one training sessions
- Video tutorials in CMS help section
- This guide (always available in CMS)

---

## Quick Reference Card

### Before Publishing Checklist

Print and keep this near your workspace:

```
┌─────────────────────────────────────────────┐
│         ACCESSIBILITY CHECKLIST             │
├─────────────────────────────────────────────┤
│ □ All images have alt text                 │
│ □ Headings are in order (H2→H3→H4)        │
│ □ Links are descriptive                    │
│ □ Videos have captions                     │
│ □ Lists use proper formatting             │
│ □ Tables have headers and captions        │
│ □ Text has sufficient contrast            │
│ □ No ALL CAPS text                        │
│ □ Forms have labels                       │
│ □ Error messages are clear                │
│ □ Content is in plain language            │
│ □ Acronyms spelled out on first use       │
│ □ Ran CMS accessibility checker           │
│ □ Tested with keyboard (Tab key)          │
└─────────────────────────────────────────────┘
```

---

**Remember: Accessibility benefits everyone!**

Clear, well-structured content is easier for all users to read and understand - not just those using assistive technology.

Thank you for your commitment to creating accessible content! 🎉

---

**Last Updated:** September 16, 2026  
**Version:** 1.0  
**Questions?** Email [accessibility@deeshafoundation.org]
