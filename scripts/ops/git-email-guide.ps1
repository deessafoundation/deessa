# Fix Git Email Configuration Script
# Run this script to fix the Git email issue

Write-Host "Current Git Configuration:" -ForegroundColor Cyan
Write-Host "Global Email: $(git config --global user.email)"
Write-Host "Local Email: $(git config user.email)"
Write-Host ""

Write-Host "To fix the deployment issue:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/settings/emails" -ForegroundColor White
Write-Host "2. Find your verified email address" -ForegroundColor White
Write-Host "3. Run this command with your verified email:" -ForegroundColor White
Write-Host ""
Write-Host '   git config --global user.email "your-verified-email@example.com"' -ForegroundColor Green
Write-Host ""
Write-Host "4. Then amend the last commit:" -ForegroundColor White
Write-Host '   git commit --amend --reset-author --no-edit' -ForegroundColor Green
Write-Host ""
Write-Host "5. Force push to update remote:" -ForegroundColor White
Write-Host '   git push --force-with-lease origin main' -ForegroundColor Green
Write-Host ""
Write-Host "Alternative: Make a new commit after updating email" -ForegroundColor Yellow
Write-Host '   git add .' -ForegroundColor Green
Write-Host '   git commit -m "fix: update configuration"' -ForegroundColor Green
Write-Host '   git push origin main' -ForegroundColor Green
