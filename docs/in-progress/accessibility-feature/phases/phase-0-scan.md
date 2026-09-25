# Phase 0: Accessibility Scan

**Date:** 2026-09-16
**Status:** Ready to Execute
**Tools:** axe-core v4.13.0 (installed), WAVE, Lighthouse

---

## Objective

Run automated accessibility scans on all 22 public routes + demo routes to:
1. Establish baseline metrics
2. Identify quick wins
3. Document issues for A1 phase
4. Track improvement over time

---

## Prerequisites

- **axe-core CLI installed** - v4.13.0 added to devDependencies
- **Dev server running** - Must run `pnpm dev` in separate terminal

---

## Scanning Tools

### Option 1: axe-core CLI (Recommended for CI/CD)

**Install:**
```powershell
pnpm add -D @axe-core/cli
```

**Usage:**
```powershell
# Scan single page
pnpm axe http://localhost:3000 --save results.json

# Scan multiple pages
pnpm axe http://localhost:3000 `
        http://localhost:3000/about `
        http://localhost:3000/donate `
        --save results.json
```

**Pros:** Comprehensive WCAG coverage, JSON output, CI/CD integration, industry standard
**Cons:** Requires running dev server, command-line only

---

### Option 2: axe DevTools Browser Extension (Recommended for Manual)

**Install:**
- Chrome: https://chrome.google.com/webstore (search "axe DevTools")
- Firefox: https://addons.mozilla.org
- Edge: Same as Chrome store

**Usage:**
1. Open page in browser
2. Open DevTools (F12)
3. Click "axe DevTools" tab
4. Click "Scan ALL of my page"
5. Review results

**Pros:** Visual interface, shows exact element locations, provides fix guidance
**Cons:** Manual per-page scanning, harder to track over time

---

### Option 3: WAVE Browser Extension

**Install:**
- Chrome/Edge: https://wave.webaim.org/extension/
- Firefox: https://addons.mozilla.org

**Pros:** Visual overlay on page, shows errors inline, free and simple
**Cons:** Less comprehensive than axe, manual only

---

### Option 4: Lighthouse (Built into Chrome)

```powershell
# Via CLI
pnpm dlx lighthouse http://localhost:3000 `
  --only-categories=accessibility `
  --output=html `
  --output-path=./lighthouse-accessibility.html

# Or use Chrome DevTools:
# F12 > Lighthouse tab > Accessibility > Analyze
```

**Pros:** Built into Chrome, HTML reports, performance + accessibility
**Cons:** Less detailed than axe, focused on common issues

---

## Routes to Scan (28 Total)

### Core Public Routes:

| Route | Priority | Notes |
|-------|----------|-------|
| `/` | Critical | Homepage with carousel, intro video |
| `/about` | Critical | About sections |
| `/donate` | Critical | Donation form - HIGH PRIORITY |
| `/contact` | Critical | Contact form |
| `/events` | High | Event listing |
| `/events/[slug]` | High | Event detail (use real slug) |
| `/get-involved` | High | CTA page |
| `/whatwedo` | High | Programs overview |
| `/programs` | High | Programs listing |
| `/impact` | High | Impact metrics |
| `/our-story` | Medium | Story page |
| `/podcasts` | Medium | Podcast listing |
| `/stories` | Medium | Stories |
| `/press` | Medium | Press/media |
| `/support` | Medium | Support form |
| `/conference` | Medium | Conference info |
| `/conference/register` | High | Registration form |
| `/newsletter-archive` | Low | Newsletter archive |
| `/verify` | Low | Email verification |
| `/privacy` | Low | Privacy policy |
| `/terms` | Low | Terms of service |
| `/payments` | Low | Payment handling |

### Payment Result Pages:

| Route | Priority | Notes |
|-------|----------|-------|
| `/complete-payment` | High | Post-checkout |
| `/donate/success` | High | Success state |
| `/donate/cancel` | High | Cancelled state |

### Demo Routes:

| Route | Priority | Notes |
|-------|----------|-------|
| `/demo/accessibility-test` | Critical | Main test page |
| `/demo/1000-families` | Low | Demo only |
| `/demo/aac-support` | Low | Demo only |
| `/demo/community-outreach` | Low | Demo only |
| `/demo/deessa-companion` | Low | Demo only |
| `/demo/programs` | Low | Demo only |

---

## Execution Steps

### Step 1: Start Dev Server

```powershell
# In Terminal 1
pnpm dev
```

Wait for the server to start and note the URL (usually http://localhost:3000)

---

### Step 2: Run Quick Scan (5 Critical Pages)

```powershell
# In Terminal 2
# Scan the 5 most critical pages first
pnpm axe http://localhost:3000 --save scan-critical.json
pnpm axe http://localhost:3000/donate --save scan-donate.json
pnpm axe http://localhost:3000/contact --save scan-contact.json
pnpm axe http://localhost:3000/about --save scan-about.json
pnpm axe http://localhost:3000/events --save scan-events.json
```

**Expected Time:** 5-10 minutes

---

### Step 3: Run Comprehensive Scan (All Routes)

Create scan script for all 28 routes:

```powershell
# Save this as: scripts/scan-all-routes.ps1

$routes = @(
    "",
    "/about",
    "/complete-payment",
    "/conference",
    "/conference/register",
    "/contact",
    "/demo/1000-families",
    "/demo/aac-support",
    "/demo/accessibility-test",
    "/demo/community-outreach",
    "/demo/deessa-companion",
    "/demo/programs",
    "/donate",
    "/donate/cancel",
    "/donate/success",
    "/events",
    "/get-involved",
    "/impact",
    "/newsletter-archive",
    "/our-story",
    "/payments",
    "/podcasts",
    "/press",
    "/privacy",
    "/programs",
    "/stories",
    "/support",
    "/terms",
    "/verify",
    "/whatwedo"
)

$baseUrl = "http://localhost:3000"
$outputDir = "accessibility-scan-results"

# Create output directory
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Write-Host "Starting accessibility scan of $($routes.Count) routes..." -ForegroundColor Cyan
Write-Host ""

$success = 0
$failed = 0

foreach ($route in $routes) {
    $url = "$baseUrl$route"
    $sanitizedRoute = $route -replace '/', '-'
    if ($sanitizedRoute -eq "") { $sanitizedRoute = "home" }
    $outputFile = "$outputDir/$sanitizedRoute.json"

    Write-Host "Scanning: $url" -ForegroundColor Yellow

    try {
        pnpm axe $url --save $outputFile 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Completed: $outputFile" -ForegroundColor Green
            $success++
        } else {
            Write-Host "  Failed with exit code $LASTEXITCODE" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "  Error: $_" -ForegroundColor Red
        $failed++
    }

    Write-Host ""
}

Write-Host "Scan Complete!" -ForegroundColor Cyan
Write-Host "  Success: $success" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host ""
Write-Host "Results saved to: $outputDir/" -ForegroundColor Cyan


# Aggregate and analyze results
Write-Host "Aggregating results..." -ForegroundColor Cyan
$allResults = @()

Get-ChildItem -Path $outputDir -Filter "*.json" | ForEach-Object {
    $content = Get-Content $_.FullName | ConvertFrom-Json
    $allResults += [PSCustomObject]@{
        Route = $_.BaseName
        Violations = $content.violations.Count
        Passes = $content.passes.Count
        Incomplete = $content.incomplete.Count
    }
}

# Generate summary report
$summaryFile = "$outputDir/SUMMARY.md"
@"
# Accessibility Scan Summary

**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Routes Scanned:** $($routes.Count)
**Tool:** axe-core v4.13.0

---

## Results by Route

| Route | Violations | Passes | Incomplete |
|-------|-----------|--------|-----------|
$($allResults | ForEach-Object { "| $($_.Route) | $($_.Violations) | $($_.Passes) | $($_.Incomplete) |" } | Out-String)

---

## Summary Statistics

- **Total Routes:** $($allResults.Count)
- **Total Violations:** $($allResults | Measure-Object -Property Violations -Sum | Select-Object -ExpandProperty Sum)
- **Total Passes:** $($allResults | Measure-Object -Property Passes -Sum | Select-Object -ExpandProperty Sum)
- **Total Incomplete:** $($allResults | Measure-Object -Property Incomplete -Sum | Select-Object -ExpandProperty Sum)

---

## Next Steps

1. Review individual JSON files for detailed violation information
2. Prioritize critical and serious violations
3. Create issues in tracking document
4. Begin Phase 1 fixes

"@ | Out-File -FilePath $summaryFile -Encoding utf8

Write-Host "Summary report saved to: $summaryFile" -ForegroundColor Green
```

**Usage:**
```powershell
# Make sure dev server is running first!
# pnpm dev

# Run the scan script
.\scripts\scan-all-routes.ps1
```

**Expected Time:** 15-20 minutes for all 28 routes

---

### Step 4: Alternative - Browser Extension Scan

If the CLI scan fails or you prefer visual feedback:

1. **Install axe DevTools Extension**
   - Chrome: https://chrome.google.com/webstore (search "axe DevTools")
   - Edge: Same as Chrome
   - Firefox: https://addons.mozilla.org

2. **Manual Scan Process:**
   - Open each route in browser
   - Press F12 to open DevTools
   - Click "axe DevTools" tab
   - Click "Scan ALL of my page"
   - Export results as JSON

3. **Priority Routes for Manual Scan:**
   - `/` - Homepage (critical)
   - `/donate` - Donation form (critical)
   - `/contact` - Contact form (critical)
   - `/about` - About page (critical)
   - `/events` - Event listing (high)
   - `/demo/accessibility-test` - Test page (critical)

---

## Expected Findings (Based on Inventory)

### Violations We Already Know About:

1. **Forms Missing ARIA Attributes** (Expected: 5-7 violations)
   - Missing `aria-invalid` on error states
   - Missing `aria-describedby` for error messages
   - Missing autocomplete attributes

2. **Media Autoplay** (Expected: 2-3 violations)
   - IntroVideo autoplays without user interaction
   - HeroCarousel auto-advances

3. **Image Alt Text** (Expected: 3-5 violations)
   - Some decorative images may need `alt=""`
   - Some content images may need better descriptions

4. **Color Contrast** (Expected: 0-2 violations)
   - Generally good, but some text-over-image may fail

5. **Heading Structure** (Expected: 1-3 violations)
   - Some pages may skip heading levels

6. **Link Text** (Expected: 2-4 violations)
   - Generic "Click here" or "Read more" links

### Expected Severity Distribution:

| Severity | Count | Description |
|----------|-------|-------------|
| Critical | 0-2 | Blocks access completely |
| Serious | 5-10 | Significant barrier |
| Moderate | 10-15 | Noticeable problem |
| Minor | 5-10 | Annoying but not blocking |

**Total Expected Violations:** 20-35 across all 28 routes

---

## Issue Tracking Template

For each issue found:

```markdown
### Issue #X: [Brief Description]

**Severity:** Critical | Serious | Moderate | Minor
**WCAG Criterion:** [e.g., 1.1.1 Non-text Content]
**Affected Routes:** [List routes]
**Component/File:** [File path if known]

**Problem:**
[What the violation is]

**Impact:**
[How it affects users]

**Fix:**
[What needs to be done]

**Estimated Effort:** [hours]
**Phase:** A1 | A2 | A3 | A4
```

---

## Recommended: Manual Checks

Automated tools miss these:

### Keyboard Navigation:
- [ ] Tab through entire page
- [ ] All interactive elements reachable
- [ ] Focus visible at all times
- [ ] Focus order logical
- [ ] No keyboard traps

### Screen Reader:
- [ ] NVDA on Windows + Chrome
- [ ] VoiceOver on Mac + Safari
- [ ] Landmarks announced
- [ ] Headings structure clear
- [ ] Forms completely usable

### Visual:
- [ ] Zoom to 200% (no horizontal scroll)
- [ ] Text resize to 200% (readable)
- [ ] Color alone not used for meaning
- [ ] Contrast meets 4.5:1 minimum
- [ ] Animations respect preferences

---

## Output Structure

```
accessibility-scans/
├── 2026-09-16-1430/           # Timestamp
│   ├── homepage.json
│   ├── about.json
│   ├── donate.json
│   ├── contact.json
│   ├── events.json
│   └── ...
├── reports/
│   ├── lighthouse-home.html
│   ├── lighthouse-donate.html
│   └── summary-report.md
└── screenshots/
    ├── homepage-errors.png
    ├── donate-form-issues.png
    └── ...
```

---

## Troubleshooting

### Dev Server Not Running
```powershell
# Error: connect ECONNREFUSED
# Fix: Start dev server
pnpm dev
```

### Port Different Than 3000
```powershell
# If dev runs on different port, update script:
$baseUrl = "http://localhost:3001"  # or whatever port
```

### Axe Timeout Errors
```powershell
# Some pages may be slow, increase timeout:
pnpm axe $url --timeout 30000 --save $outputFile
```

### Dynamic Route 404s
```powershell
# For /events/[slug], use a real event slug:
pnpm axe http://localhost:3000/events/real-event-slug
```

---

## Scan Execution Checklist

### Preparation:
- [ ] Dev server running (`pnpm dev`)
- [ ] All routes accessible
- [ ] No auth required for public pages
- [ ] Install scan tools

### Quick Scan:
- [ ] Scan homepage with browser extension
- [ ] Scan donate page
- [ ] Scan contact page
- [ ] Document critical issues
- [ ] Take screenshots

### Comprehensive Scan:
- [ ] Run automated scan on all routes
- [ ] Export results to JSON
- [ ] Create summary report
- [ ] Categorize by severity
- [ ] Estimate fix efforts

### Analysis:
- [ ] Group similar issues
- [ ] Identify patterns
- [ ] Create fix priorities
- [ ] Update A1 task list
- [ ] Document quick wins

---

## Success Metrics

**Baseline (Expected):**
- Errors: 50-100 across all pages
- Warnings: 100-200 across all pages
- Manual checks: 50-100 items

**Target After A1:**
- Errors: <10 critical, 0 on forms
- Warnings: <50 total
- Manual checks: All reviewed

**Target After A1-A6:**
- Errors: 0
- Warnings: <10 (false positives)
- WCAG 2.2 AA: Pass all applicable criteria

---

## Next Steps After Scan

1. **Create issue list** - Document all findings
2. **Prioritize fixes** - Critical errors first
3. **Update A1 tasks** - Add specific fixes
4. **Estimate effort** - Hours per issue
5. **Start fixing** - Begin A1 phase!

---

**Status:** Ready to execute
**Estimated Time:** 30 min (quick) to 3 hours (comprehensive)
**Blocker:** Need running dev server
**Output:** Baseline metrics + issue list for A1
