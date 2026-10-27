# Automated deployment to Vercel and Push to GitHub
Write-Host "1. Building Next.js application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Aborting deploy." -ForegroundColor Red
    exit 1
}

Write-Host "2. Deploying to Vercel Production..." -ForegroundColor Cyan
npx vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel deploy failed! Aborting GitHub push." -ForegroundColor Red
    exit 1
}

Write-Host "3. Pushing code to GitHub (main)..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment and GitHub push completed successfully!" -ForegroundColor Green
} else {
    Write-Host "GitHub push failed. Please check credentials or network." -ForegroundColor Red
}
