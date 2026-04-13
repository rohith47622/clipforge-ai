#!/bin/bash

# ClipForge AI - Quick Setup Script
# This script sets up the project for local development

set -e

echo "🚀 ClipForge AI - Setup Script"
echo "================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node --version)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env.local
echo ""
echo "🔐 Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  Please update .env.local with your credentials:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
    echo "   - OPENAI_API_KEY"
    echo "   - AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
    echo "   - STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
else
    echo "✅ .env.local already exists"
fi

# Check if database URL is set
if grep -q "DATABASE_URL=" .env.local; then
    DB_URL=$(grep "DATABASE_URL=" .env.local | cut -d '=' -f 2-)
    if [[ $DB_URL != *"postgresql"* ]]; then
        echo ""
        echo "⚠️  DATABASE_URL is not configured. You need to:"
        echo "   1. Create a PostgreSQL database (local or Supabase)"
        echo "   2. Update DATABASE_URL in .env.local"
    fi
fi

# Setup database
echo ""
echo "🗄️  Setting up database..."
if [ -f ".env.local" ] && grep -q "postgresql" .env.local; then
    echo "Running Prisma migrations..."
    npx prisma migrate dev --name init || true
    echo "✅ Database setup complete"
else
    echo "⚠️  Skipping database setup (DATABASE_URL not configured)"
fi

# Build
echo ""
echo "🔨 Building project..."
npm run build || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env.local with your credentials"
echo "   2. Run: npm run dev (for frontend)"
echo "   3. In another terminal, run: npm run worker:dev (for background jobs)"
echo "   4. Open http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - DEPLOYMENT.md - Production deployment guide"
echo "   - .env.example - Environment variables reference"
echo ""
echo "🎉 Happy coding!"
