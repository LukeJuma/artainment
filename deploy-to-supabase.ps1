# Supabase Deployment Script for Windows (PowerShell)
# Deploy the secure, functional Edge Function with all fixes

Write-Host "🚀 Deploying Artainment to Supabase..." -ForegroundColor Green
Write-Host "=================================="

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
}

# Login to Supabase (if not already logged in)
Write-Host "🔐 Checking Supabase authentication..." -ForegroundColor Yellow
$loginCheck = supabase projects list 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Supabase first:" -ForegroundColor Yellow
    Write-Host "supabase login" -ForegroundColor Cyan
    supabase login
}

# Link to your project (if not already linked)
Write-Host "🔗 Linking to Supabase project..." -ForegroundColor Yellow
if (-not (Test-Path "supabase/.temp/project-ref")) {
    Write-Host "Please link to your project first:" -ForegroundColor Yellow
    Write-Host "supabase link --project-ref etjkivwwnqafyphqamgh" -ForegroundColor Cyan
    supabase link --project-ref etjkivwwnqafyphqamgh
}

# Deploy the Edge Function with security fixes
Write-Host "📤 Deploying Edge Function..." -ForegroundColor Blue
supabase functions deploy api --project-ref etjkivwwnqafyphqamgh

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Edge Function deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Edge Function deployment failed!" -ForegroundColor Red
    exit 1
}

# Set environment variables for production
Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
supabase secrets set JWT_SECRET="your-256-bit-secret-change-in-production-$timestamp" --project-ref etjkivwwnqafyphqamgh
supabase secrets set ADMIN_EMAIL="admin@theartainment.co.ke" --project-ref etjkivwwnqafyphqamgh
supabase secrets set ADMIN_PASSWORD="SecureAdmin2024!#`$" --project-ref etjkivwwnqafyphqamgh

Write-Host "🏗️ Building frontend..." -ForegroundColor Blue
npm run build

Write-Host "📤 Deploying frontend to Vercel..." -ForegroundColor Blue
npx vercel --prod

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "=================================="
Write-Host "🌐 Frontend: https://the-artainment.vercel.app" -ForegroundColor Cyan
Write-Host "🔗 API: https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔒 Security Features Enabled:" -ForegroundColor Green
Write-Host "  ✅ JWT Authentication"
Write-Host "  ✅ XSS Protection" 
Write-Host "  ✅ Input Sanitization"
Write-Host "  ✅ Audit Logging"
Write-Host "  ✅ Protected Video Streaming"
Write-Host "  ✅ Draft Content Filtering"
Write-Host "  ✅ Secure File Uploads"
Write-Host ""
Write-Host "🧪 Test your deployment:" -ForegroundColor Yellow
Write-Host "  Invoke-RestMethod -Uri 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/health'" -ForegroundColor Cyan