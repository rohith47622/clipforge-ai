# ClipForge AI - Production-Ready SaaS Video Platform

A complete, production-grade SaaS application for generating viral short-form video clips from long-form content using AI.

## 🎯 Features

### Core Features
- **Video Upload**: Support for MP4, MOV, MKV, WebM up to 5GB
- **AI-Powered Analysis**: OpenAI Whisper for transcription, GPT for viral moment detection
- **Auto Clip Generation**: Automatically generates 3-20 optimized clips per video
- **Multi-Platform**: YouTube Shorts, Instagram Reels, TikTok, Facebook Reels ready
- **Real-Time Processing**: Queue-based job system with background workers
- **Download System**: Real S3 downloads with signed URLs
- **User Dashboard**: Project management, usage stats, clip management
- **Billing Integration**: Stripe subscriptions with 3 tier plans (Free, Pro, Business)
- **Authentication**: Email/password + Google OAuth with NextAuth
- **Admin Panel**: User management, revenue stats, job monitoring

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Axios** for HTTP requests

### Backend
- **Next.js API Routes** for REST endpoints
- **PostgreSQL** with Prisma ORM
- **NextAuth** for authentication
- **BullMQ + Redis** for job queues
- **OpenAI API** (Whisper & GPT-4)

### Storage & Processing
- **AWS S3 / Cloudflare R2** for video storage
- **FFmpeg** for video processing
- **Node.js Workers** for background jobs

### Payments & Hosting
- **Stripe** for subscriptions and payments
- **Vercel** for frontend deployment
- **Railway / Render** for backend workers
- **Supabase / Neon** for PostgreSQL

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- AWS S3 bucket (or Cloudflare R2)
- OpenAI API key
- Stripe account
- Google OAuth credentials

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd clipforge-ai
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clipforge"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="sk-your-key"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your-key"
STRIPE_SECRET_KEY="sk_live_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-secret"

# Redis
REDIS_URL="redis://localhost:6379"
```

### 3. Database Setup

```bash
# Create database
npx prisma migrate dev --name init

# Seed with test data (optional)
npm run db:seed
```

For local development, use Supabase:
```bash
# Create free PostgreSQL at https://supabase.com
# Copy the connection string to DATABASE_URL
```

### 4. Start Development Server

```bash
npm run dev
```

Access at `http://localhost:3000`

### 5. Start Video Processing Worker

In a separate terminal:

```bash
npm run worker:dev
```

## 📁 Project Structure

```
clipforge-ai/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication
│   │   ├── videos/         # Video upload
│   │   ├── clips/          # Clip management
│   │   ├── billing/        # Stripe integration
│   │   ├── dashboard/      # Stats
│   │   ├── webhooks/       # Stripe webhooks
│   │   └── user/           # User profile
│   ├── auth/               # Auth pages (login, register)
│   ├── dashboard/          # User dashboard
│   │   ├── upload/         # Video upload page
│   │   ├── clips/          # Clips list
│   │   ├── billing/        # Billing page
│   │   └── settings/       # Settings
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── navbar.tsx          # Navigation
│   └── footer.tsx          # Footer
├── lib/
│   ├── auth.config.ts      # NextAuth config
│   ├── auth-provider.tsx   # Auth provider
│   ├── prisma.ts           # Prisma client
│   ├── s3.ts               # S3 utilities
│   ├── ffmpeg.ts           # FFmpeg utilities
│   ├── stripe.ts           # Stripe utilities
│   └── utils.ts            # Helper functions
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/
│   └── worker.ts           # Video processing worker
├── public/                 # Static files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Videos
- `POST /api/videos/upload` - Upload video
- `GET /api/videos/:id` - Get video details
- `DELETE /api/videos/:id` - Delete video

### Clips
- `GET /api/clips` - List clips
- `GET /api/clips/:id/download` - Download clip
- `DELETE /api/clips/:id` - Delete clip

### Billing
- `GET /api/billing/subscription` - Get subscription
- `POST /api/billing/checkout` - Create checkout session
- `POST /api/webhooks/stripe` - Stripe webhooks

### Dashboard
- `GET /api/dashboard/stats` - Get user stats

### User
- `PUT /api/user/profile` - Update profile
- `DELETE /api/user/account` - Delete account

## 🔄 Video Processing Pipeline

1. **Upload**: Video uploaded to S3, record created in DB
2. **Audio Extraction**: Extract audio from video using FFmpeg
3. **Transcription**: Transcribe audio using OpenAI Whisper
4. **Analysis**: Analyze transcript with GPT-4 to find viral moments
5. **Clip Generation**: Generate multiple clips using FFmpeg
6. **Upload**: Upload clips to S3
7. **Completed**: Update DB with clip URLs and status

Processing is handled by background workers that run continuously.

## 💳 Stripe Subscription Plans

### Free
- 3 videos/month
- SD quality (480p)
- Watermark included

### Pro ($49/month)
- 50 videos/month
- HD quality (1080p)
- No watermark
- Priority support

### Business ($199/month)
- Unlimited videos
- 4K quality
- Team dashboard
- API access

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Connect repo to Vercel
# Set environment variables in Vercel dashboard
# Deploy automatically on push
```

### Backend Workers (Railway/Render)

```bash
# Create new service
# Connect git repo
# Set environment variables
# Deploy with:
npm run build
npm run worker:start
```

### Database (Supabase/Neon)

```bash
# Create PostgreSQL instance
# Update DATABASE_URL
# Run migrations:
npx prisma migrate deploy
```

### Environment Variables for Production

- `NEXTAUTH_URL` - Production URL (e.g., https://clipforge.ai)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- All API keys and secrets from respective services

## 📊 Monitoring & Admin

### Database
Monitor with Prisma Studio:
```bash
npx prisma studio
```

### Job Queue
Monitor workers in logs:
```bash
# In deployment, check service logs
# Monitor Redis queue status
redis-cli -n 0 KEYS 'bull:*'
```

## 🔒 Security

- ✅ Rate limiting on API endpoints
- ✅ Input validation with Zod
- ✅ CSRF protection via NextAuth
- ✅ Secure password hashing with bcryptjs
- ✅ JWT sessions
- ✅ Signed S3 URLs with expiry
- ✅ SQL injection prevention (Prisma)
- ✅ Environment variable isolation

## 📈 Performance

- Video streaming from CDN (S3 CloudFront)
- Database query optimization with Prisma
- Background job processing so UI stays responsive
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Caching strategies for static assets

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📝 Environment Variables Reference

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Random secret for JWT
- `OPENAI_API_KEY` - OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

### Optional
- `GOOGLE_CLIENT_ID` - For Google login
- `GOOGLE_CLIENT_SECRET` - For Google login
- `REDIS_URL` - For job queue (defaults to localhost:6379)
- `NODE_ENV` - development/production

## 🆘 Troubleshooting

### FFmpeg not found
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Database connection error
```bash
# Check DATABASE_URL is correct
# Ensure PostgreSQL is running
# Test connection: psql $DATABASE_URL
```

### Stripe webhook not working
- Ensure STRIPE_WEBHOOK_SECRET is set
- Check webhook endpoint in Stripe dashboard
- Verify ngrok tunnel if testing locally: npx ngrok http 3000

### OpenAI quota exceeded
- Check API usage at https://platform.openai.com/account/usage
- Upgrade API plan if needed
- Consider using Whisper for transcription (cheaper)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

## 📄 License

MIT - Feel free to use this as a starting point for your SaaS

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check NextAuth, Prisma, or Stripe docs
4. Create an issue with details

## 🚀 What's Next

Production checklist:
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure CDN for media delivery
- [ ] Set up analytics (Mixpanel, Amplitude)
- [ ] Implement email notifications
- [ ] Add more AI features
- [ ] Create mobile app
- [ ] Implement team collaboration features
- [ ] Add more video export options

---

**Built with ❤️ for creators**

Make great content. Let AI handle the editing.
