# ClipForge AI - 5 Minute Quick Start

For impatient developers who want to see it running NOW.

## Prerequisites
- Node.js 18+
- PostgreSQL or Supabase account
- Git

## 1. Clone & Install (1 min)
```bash
cd clipforge-ai
npm install
```

## 2. Setup Database (1 min)

### Option A: Quick (Supabase Free)
```bash
cp .env.example .env.local

# Go to https://supabase.com, create account
# Paste connection string into DATABASE_URL in .env.local

npx prisma migrate deploy
```

### Option B: Local PostgreSQL
```bash
createdb clipforge
DATABASE_URL="postgresql://postgres:password@localhost/clipforge" npx prisma migrate dev --name init
```

## 3. Add Minimal Secrets (2 min)
Edit `.env.local`:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"

# Skip these for now, add later:
# OPENAI_API_KEY
# AWS credentials
# Stripe keys
```

## 4. Run (1 min)
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: In new terminal, background worker
npm run worker:dev
```

## 5. Visit
Open http://localhost:3000

Register with: `test@example.com` / `Test123456!`

## ✅ Done!

You now have:
- ✅ Working frontend
- ✅ User authentication
- ✅ Dashboard
- ✅ Database
- ✅ Background worker system

## Next: Add External Services

Add these when ready:

```env
# OpenAI (for video analysis)
OPENAI_API_KEY=sk-...

# AWS S3 (for storage) OR use Cloudflare R2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=clipforge-dev

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Redis (for job queue)
REDIS_URL=redis://localhost:6379
# OR use Redis Cloud: https://redis.com/cloud
```

Then test file upload feature.

## ⚡ Pro Tips

- Use Supabase free tier (includes PostgreSQL, auth, edge functions)
- Use AWS S3 free tier (5GB free for 12 months)
- Test Stripe with test keys (no charges)
- Run `npx prisma studio` to view database visually

## 🐛 Stuck?

Check SETUP_GUIDE.md for detailed troubleshooting.

---

**Total time: ~5 minutes to working app**

See you on the dashboard! 🚀
