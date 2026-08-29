#!/bin/bash

# Deployment Setup Script for Artainment (Supabase + Vercel Free Tier)

echo "🚀 Setting up deployment for Artainment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is required but not installed.${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ Node.js/npm is required but not installed.${NC}"
        exit 1
    fi
    
    if ! command -v php &> /dev/null; then
        echo -e "${RED}❌ PHP is required but not installed.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements satisfied${NC}"
}

# Setup Supabase project
setup_supabase() {
    echo "🗄️ Setting up Supabase project..."
    
    read -p "Enter your Supabase project URL (e.g., https://your-project.supabase.co): " SUPABASE_URL
    read -p "Enter your Supabase database password: " -s SUPABASE_DB_PASSWORD
    echo
    read -p "Enter your Supabase S3 access key: " SUPABASE_ACCESS_KEY
    read -p "Enter your Supabase S3 secret key: " -s SUPABASE_SECRET_KEY
    echo
    
    # Extract project reference from URL
    PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\///' | sed 's/.supabase.co//')
    
    # Create backend .env file
    cp deployment-configs/supabase-env.example backend/.env
    
    # Replace placeholders in backend .env
    sed -i "s/your-project-ref/$PROJECT_REF/g" backend/.env
    sed -i "s/your-project.supabase.co/$PROJECT_REF.supabase.co/g" backend/.env
    sed -i "s/your-supabase-db-password/$SUPABASE_DB_PASSWORD/g" backend/.env
    sed -i "s/your-s3-access-key/$SUPABASE_ACCESS_KEY/g" backend/.env
    sed -i "s/your-s3-secret-key/$SUPABASE_SECRET_KEY/g" backend/.env
    
    echo -e "${GREEN}✅ Supabase configuration created${NC}"
}

# Setup Vercel project
setup_vercel() {
    echo "🌐 Setting up Vercel project..."
    
    read -p "Enter your Vercel app URL (e.g., https://your-app.vercel.app): " VERCEL_URL
    
    # Create frontend .env file
    cp deployment-configs/frontend-env.example .env.production
    
    # Replace placeholders
    sed -i "s|https://your-project.supabase.co|$SUPABASE_URL|g" .env.production
    sed -i "s|https://your-app.vercel.app|$VERCEL_URL|g" .env.production
    
    # Update backend .env with frontend URL
    sed -i "s|https://your-app.vercel.app|$VERCEL_URL|g" backend/.env
    
    echo -e "${GREEN}✅ Vercel configuration created${NC}"
}

# Generate Laravel app key
generate_app_key() {
    echo "🔑 Generating Laravel application key..."
    cd backend
    php artisan key:generate --env=production
    cd ..
    echo -e "${GREEN}✅ Laravel app key generated${NC}"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Backend dependencies
    echo "Installing Laravel dependencies..."
    cd backend
    composer install --optimize-autoloader --no-dev
    cd ..
    
    # Frontend dependencies
    echo "Installing React dependencies..."
    npm install
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Setup database
setup_database() {
    echo "🗃️ Setting up database..."
    
    echo "Please run the following commands in your Supabase SQL Editor:"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Run the migrations by executing:"
    echo -e "${YELLOW}   php artisan migrate --env=production${NC}"
    echo "   (Run this from your local backend directory after deployment)"
    
    read -p "Press Enter when you've noted the instructions..."
    
    echo -e "${GREEN}✅ Database setup instructions provided${NC}"
}

# Create deployment checklist
create_checklist() {
    cat > DEPLOYMENT_CHECKLIST.md << EOF
# Deployment Checklist

## Pre-deployment
- [ ] Supabase project created
- [ ] Database configured
- [ ] Storage bucket 'media' created (public)
- [ ] Environment variables set
- [ ] Dependencies installed

## Supabase Deployment
- [ ] Code deployed to Supabase Edge Functions
- [ ] Database migrations run
- [ ] Storage permissions configured
- [ ] API endpoints tested

## Vercel Deployment  
- [ ] GitHub repository connected
- [ ] Environment variables configured in Vercel dashboard
- [ ] Build configuration verified
- [ ] Domain configured (if custom)

## Post-deployment Testing
- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database operations work
- [ ] File uploads work
- [ ] Authentication flows work

## Free Tier Monitoring
- [ ] Supabase usage dashboard bookmarked
- [ ] Vercel usage dashboard bookmarked
- [ ] Monitoring alerts configured

## Notes
- Supabase free tier: 500MB database, 1GB storage
- Vercel free tier: 100GB bandwidth
- Monitor usage regularly to avoid overages
EOF

    echo -e "${GREEN}✅ Deployment checklist created${NC}"
}

# Main execution
main() {
    echo "🎬 Artainment Deployment Setup"
    echo "================================"
    
    check_requirements
    setup_supabase
    setup_vercel
    generate_app_key
    install_dependencies
    setup_database
    create_checklist
    
    echo ""
    echo -e "${GREEN}🎉 Setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review the generated .env files"
    echo "2. Follow the DEPLOYMENT_CHECKLIST.md"
    echo "3. Deploy to Supabase and Vercel"
    echo "4. Test the deployment"
    echo ""
    echo "Happy deploying! 🚀"
}

# Run the script
main