# ClipForge AI - Local Development Setup Guide

Complete guide for setting up ClipForge AI for local development.

## System Requirements

- **Node.js**: 18.17+ or 20+
- **npm**: 9+
- **PostgreSQL**: 13+ (or use Supabase)
- **FFmpeg**: For video processing
- **Git**: For version control

## Installation

### 1. Install System Dependencies

#### macOS
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install FFmpeg
brew install ffmpeg

# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15
```

#### Windows
```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install dependencies
choco install nodejs
choco install ffmpeg
choco install postgresql15

# Start PostgreSQL
net start postgresql-x64-15
```

#### Ubuntu/Debian
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Clone Repository

```bash
git clone https://github.com/your-org/clipforge-ai.git
cd clipforge-ai
```

### 3. Run Setup Script

#### macOS/Linux
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### Windows
```powershell
npm install
```

### 4. Configure Environment Variables

```bash
# Copy example to local
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
# Database - Create a local PostgreSQL database
# Option 1: Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/clipforge"

# Option 2: Supabase Free Tier (Recommended)
# 1. Go to https://supabase.com
# 2. Create free project
# 3. Copy connection string
DATABASE_URL="postgresql://postgres:xxxxx@xxxxx.supabase.co:5432/postgres"

# NextAuth Security
NEXTAUTH_URL="http://localhost:3000"
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET="your-generated-secret-here"

# Google OAuth (Optional for local development)
# Create at: https://console.cloud.google.com
# Set authorized redirect to: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-your-key-here"

# AWS S3 (for video storage)
# Option 1: AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="clipforge-dev"

# Option 2: Cloudflare R2 (Cheaper)
# Available at https://dash.cloudflare.com/
AWS_REGION="auto"
AWS_ACCESS_KEY_ID="your-app-id"
AWS_SECRET_ACCESS_KEY="your-secret"
S3_BUCKET_NAME="clipforge"

# Stripe (Optional for local development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_SECRET_KEY="sk_test_your-key"
STRIPE_WEBHOOK_SECRET="whsec_test_your-secret"

# Redis (for job queue)
# Option 1: Local Redis
REDIS_URL="redis://localhost:6379"

# Option 2: Redis Cloud Free (Recommended)
# Get from https://redis.com/cloud
REDIS_URL="redis://default:password@host:port"

# FFmpeg paths (usually auto-detected)
FFMPEG_PATH="/usr/bin/ffmpeg"
FFPROBE_PATH="/usr/bin/ffprobe"

# Application
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

### 5. Setup Database

#### Option A: Local PostgreSQL

```bash
# Create database
createdb clipforge

# Run migrations
npx prisma migrate dev --name init

# View data (optional)
npx prisma studio
```

#### Option B: Supabase (Recommended for Development)

1. Go to https://supabase.com
2. Sign up (free tier available)
3. Create new project
4. Copy connection string to DATABASE_URL
5. Run migrations:

```bash
npx prisma migrate deploy
```

### 6. Install Optional Services

#### Redis (for background jobs)

**macOS**
```bash
brew install redis
brew services start redis
```

**Windows**
```powershell
choco install redis-64
# or use Windows Subsystem for Linux (WSL)
wsl sudo service redis-server start
```

**Using Redis Cloud (Free)**
1. Go to https://redis.com/cloud
2. Create free account
3. Copy URL to REDIS_URL

#### FFmpeg Verification

Verify FFmpeg is installed:
```bash
ffmpeg -version
ffprobe -version
```

If not found, update paths in `.env.local`:
```bash
# macOS
which ffmpeg    # /usr/local/bin/ffmpeg
which ffprobe   # /usr/local/bin/ffprobe

# Windows
where ffmpeg    # C:\Program Files\FFmpeg\bin\ffmpeg.exe
where ffprobe   # C:\Program Files\FFmpeg\bin\ffprobe.exe
```

## Development

### Start Development Server

Terminal 1 - Frontend:
```bash
npm run dev
```

Open http://localhost:3000

### Start Background Worker

Terminal 2 - Video Processing:
```bash
npm run worker:dev
```

This processes uploaded videos in the background.

### View Database

Terminal 3 (optional):
```bash
npx prisma studio
```

This opens Prisma Studio at http://localhost:5555

## Testing

### Create Test Account

1. Go to http://localhost:3000
2. Click "Get Started"
3. Register with test email:
   - Email: `test@example.com`
   - Password: `Test123456!`

### Test Video Upload

1. Login to dashboard
2. Click "Upload Video"
3. Use a test video file (find samples online)
4. Upload and watch processing in worker terminal

### Test Stripe Webhooks (Local)

1. Install ngrok: https://ngrok.com
2. Start tunnel:
```bash
ngrok http 3000
```

3. In Stripe Dashboard, set webhook endpoint to `https://your-ngrok-url/api/webhooks/stripe`
4. Use Stripe CLI to test: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Debugging

### Enable Debug Logging

```bash
# In .env.local
DEBUG="prisma:*"
DEBUG="next-auth:*"
```

### View API Requests

```bash
# Terminal output shows all API calls
# Check browser DevTools > Network tab
```

### Database Issues

Check connection:
```bash
# Local PostgreSQL
psql -U postgres -d clipforge

# Supabase
psql $DATABASE_URL
```

### FFmpeg Issues

Test FFmpeg directly:
```bash
# Check version
ffmpeg -version

# Test video processing
ffmpeg -i input.mp4 output.mp4
```

## Project Structure

```
clipforge-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── dashboard/         # User dashboard
│   └── page.tsx          # Landing page
├── components/            # React components
├── lib/                   # Utilities & configs
├── prisma/               # Database schema
├── scripts/              # Helper scripts
│   ├── worker.ts        # Video processing
│   └── setup.sh         # Setup script
├── public/               # Static files
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── README.md
└── DEPLOYMENT.md
```

## Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run worker:dev          # Start background worker
npm run build              # Build for production
npm start                  # Start production server

# Database
npx prisma migrate dev     # Create and run migration
npx prisma studio         # View/edit database
npx prisma seed          # Seed test data (if available)

# Code Quality
npm run lint              # Run ESLint
npm run type-check        # Check TypeScript

# Deployment
npm run build             # Build optimized bundle
```

## Troubleshooting

### "DATABASE_URL is not set"
```bash
# Check .env.local exists
ls -la .env.local

# Verify DATABASE_URL is filled in
grep DATABASE_URL .env.local
```

### "Cannot find module 'ffmpeg'"
```bash
# Reinstall FFmpeg and update path in .env.local
# Or test directly:
which ffmpeg
echo $FFMPEG_PATH
```

### "Prisma Client not found"
```bash
# Regenerate client
npx prisma generate

# Or reinstall
npm install
npx prisma generate
```

### "Port 3000 already in use"
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### "Redis connection refused"
```bash
# Start Redis service
redis-server  # macOS/Linux

# or Windows
redis-cli

# Or use Redis Cloud instead (update REDIS_URL)
```

### "OpenAI API quota exceeded"
```bash
# Check usage at https://platform.openai.com/account/usage
# Upgrade plan or use test key with lower limits
```

## Performance Tips

- Use Supabase for free PostgreSQL (no setup)
- Use Redis Cloud (free tier available)
- Monitor API usage at services dashboards
- Clear tmp files: `rm -rf /tmp/clipforge/*`

## Next Steps

1. ✅ Complete local setup
2. 📝 Review the [README.md](README.md)
3. 🚀 Check the [DEPLOYMENT.md](DEPLOYMENT.md) when ready for production
4. 💡 Review API documentation in code comments
5. 🔐 Set up Stripe for payments (when needed)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [FFmpeg Guide](https://ffmpeg.org/documentation.html)

## Getting Help

- Check existing issues on GitHub
- Review error messages in terminal
- Check browser console (F12)
- Review API response in DevTools Network tab
- Read comments in source code

---

Happy coding! 🚀
