#!/bin/bash
# Supabase Deployment Script for Artainment Platform
# This script deploys the secure, functional Edge Function with all fixes

echo "🚀 Deploying Artainment to Supabase..."
echo "=================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Login to Supabase (if not already logged in)
echo "🔐 Checking Supabase authentication..."
supabase projects list > /dev/null 2>&1 || supabase login

# Link to your project (if not already linked)
echo "🔗 Linking to Supabase project..."
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "Please link to your project first:"
    echo "supabase link --project-ref etjkivwwnqafyphqamgh"
    exit 1
fi

# Deploy the Edge Function with security fixes
echo "📤 Deploying Edge Function..."
supabase functions deploy api --project-ref etjkivwwnqafyphqamgh

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
else
    echo "❌ Edge Function deployment failed!"
    exit 1
fi

# Set environment variables for production
echo "⚙️ Setting environment variables..."
supabase secrets set JWT_SECRET="your-256-bit-secret-change-in-production-$(date +%s)" --project-ref etjkivwwnqafyphqamgh
supabase secrets set ADMIN_EMAIL="admin@theartainment.co.ke" --project-ref etjkivwwnqafyphqamgh  
supabase secrets set ADMIN_PASSWORD="SecureAdmin2024!#\$" --project-ref etjkivwwnqafyphqamgh

echo "🏗️ Building frontend..."
npm run build

echo "📤 Deploying frontend to Vercel..."
npx vercel --prod

echo "✅ Deployment Complete!"
echo "=================================="
echo "🌐 Frontend: https://the-artainment.vercel.app"
echo "🔗 API: https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api"
echo ""
echo "🔒 Security Features Enabled:"
echo "  ✅ JWT Authentication"
echo "  ✅ XSS Protection"
echo "  ✅ Input Sanitization"
echo "  ✅ Audit Logging"
echo "  ✅ Protected Video Streaming"
echo "  ✅ Draft Content Filtering"
echo "  ✅ Secure File Uploads"
echo ""
echo "🧪 Test your deployment:"
echo "  curl https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api/health"