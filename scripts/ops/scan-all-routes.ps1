# Accessibility Scan Script
# Scans all 28 public routes with axe-core
# Prerequisites: Dev server must be running (pnpm dev)

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

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Accessibility Scan - All Routes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Routes to scan: $($routes.Count)" -ForegroundColor White
Write-Host "Base URL: $baseUrl" -ForegroundColor White
Write-Host "Output directory: $outputDir" -ForegroundColor White
Write-Host ""
Write-Host "Starting scan..." -ForegroundColor Cyan
Write-Host ""

$success = 0
$failed = 0
$startTime = Get-Date

foreach ($route in $routes) {
    $url = "$baseUrl$route"
    $sanitizedRoute = $route -replace '/', '-'
    if ($sanitizedRoute -eq "") { $sanitizedRoute = "home" }
    $outputFile = "$outputDir/$sanitizedRoute.json"
    
    Write-Host "[$($success + $failed + 1)/$($routes.Count)] Scanning: $url" -ForegroundColor Yellow
    
    try {
        $result = pnpm axe $url --save $outputFile 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Saved: $outputFile" -ForegroundColor Green
            $success++
        } else {
            Write-Host "  ✗ Failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
        $failed++
    }
    
    # Small delay to avoid overwhelming the server
    Start-Sleep -Milliseconds 500
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Scan Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Duration: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor White
Write-Host ""

if ($success -eq 0) {
    Write-Host "⚠️  No routes were scanned successfully." -ForegroundColor Yellow
    Write-Host "    Make sure the dev server is running:" -ForegroundColor Yellow
    Write-Host "    pnpm dev" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Generating summary report..." -ForegroundColor Cyan

# Aggregate and analyze results
$allResults = @()
$totalViolations = 0
$totalPasses = 0
$totalIncomplete = 0

Get-ChildItem -Path $outputDir -Filter "*.json" | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw | ConvertFrom-Json
        
        $violations = if ($content.violations) { $content.violations.Count } else { 0 }
        $passes = if ($content.passes) { $content.passes.Count } else { 0 }
        $incomplete = if ($content.incomplete) { $content.incomplete.Count } else { 0 }
        
        $totalViolations += $violations
        $totalPasses += $passes
        $totalIncomplete += $incomplete
        
        $allResults += [PSCustomObject]@{
            Route = $_.BaseName -replace '-', '/'
            Violations = $violations
            Passes = $passes
            Incomplete = $incomplete
        }
    } catch {
        Write-Host "Warning: Could not parse $($_.Name)" -ForegroundColor Yellow
    }
}

# Sort by violations (highest first)
$allResults = $allResults | Sort-Object -Property Violations -Descending

# Generate summary report
$summaryFile = "$outputDir/SUMMARY.md"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$summaryContent = @"
# Accessibility Scan Summary

**Date:** $timestamp  
**Routes Scanned:** $($allResults.Count)  
**Tool:** axe-core v4.13.0  
**Base URL:** $baseUrl

---

## 📊 Summary Statistics

- **Total Routes Scanned:** $($allResults.Count)
- **Total Violations:** $totalViolations
- **Total Passes:** $totalPasses
- **Total Incomplete:** $totalIncomplete
- **Average Violations per Route:** $([math]::Round($totalViolations / $allResults.Count, 2))

---

## 🚨 Routes by Violation Count (Highest First)

| Route | Violations | Passes | Incomplete |
|-------|-----------|--------|-----------|
$($allResults | ForEach-Object { "| ``$($_.Route)`` | **$($_.Violations)** | $($_.Passes) | $($_.Incomplete) |" } | Out-String)
---

## 🎯 Priority Actions

### Routes with Most Violations:
$($allResults | Select-Object -First 5 | ForEach-Object { "- **$($_.Route)** - $($_.Violations) violations" } | Out-String)

### Clean Routes (0 Violations):
$($cleanRoutes = $allResults | Where-Object { $_.Violations -eq 0 }
if ($cleanRoutes.Count -gt 0) {
    $cleanRoutes | ForEach-Object { "- $($_.Route) ✓" } | Out-String
} else {
    "No routes without violations"
})

---

## 📝 Next Steps

1. **Review high-priority violations**
   - Open individual JSON files in \`$outputDir\`
   - Focus on Critical and Serious severity
   
2. **Document issues**
   - Create \`phase-0-issues-found.md\`
   - Categorize by WCAG criterion
   - Assign to appropriate phase
   
3. **Create tracking**
   - Add to project management
   - Estimate effort for fixes
   - Schedule implementation

4. **Re-scan after fixes**
   - Track improvement metrics
   - Verify all violations resolved

---

## 📁 Individual Reports

Detailed JSON reports for each route are available in:
\`\`\`
$outputDir/
\`\`\`

Use axe DevTools browser extension to inspect specific violations visually.

---

**Generated:** $timestamp  
**Script:** scripts/scan-all-routes.ps1
"@

$summaryContent | Out-File -FilePath $summaryFile -Encoding utf8

Write-Host ""
Write-Host "✓ Summary report saved: $summaryFile" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Stats:" -ForegroundColor Cyan
Write-Host "  Routes scanned: $($allResults.Count)" -ForegroundColor White
Write-Host "  Total violations: $totalViolations" -ForegroundColor White
Write-Host "  Average per route: $([math]::Round($totalViolations / $allResults.Count, 2))" -ForegroundColor White
Write-Host ""
Write-Host "Next: Review $summaryFile for detailed analysis" -ForegroundColor Cyan
Write-Host ""
