# ClipForge AI - Deployment Guide

Complete guide for deploying ClipForge AI to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Stripe webhooks configured
- [ ] AWS S3 bucket created
- [ ] OpenAI API key set up
- [ ] Google OAuth credentials obtained
- [ ] SSL/HTTPS enabled
- [ ] Domain name purchased
- [ ] Email service configured

## Hosting Architecture

```
┌─────────────────────────────────────────┐
│        Edge / CDN (Cloudflare)          │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────────┐         ┌──────▼────────┐
│  Vercel    │         │  Railway      │
│ (Frontend) │         │ (Workers)     │
└────────────┘         └───────────────┘
    │                         │
    └────────────┬────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────┐      ┌───────▼───┐
│  Supabase    │      │  AWS S3   │
│ (PostgreSQL) │      │ (Storage) │
└──────────────┘      └───────────┘
```

## Step 1: Frontend Deployment (Vercel)

### Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository

### Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-new-secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Deploy
```bash
# Push to GitHub
git push origin main

# Vercel automatically deploys on push
# Check deployment status in Vercel Dashboard
```

## Step 2: PostgreSQL Database (Supabase)

### Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait for database to initialize

### Update Connection String
```bash
# Copy DATABASE_URL from Supabase
# Update in environment variables
```

### Run Migrations
```bash
DATABASE_URL=<your-supabase-url> npx prisma migrate deploy
```

## Step 3: Redis Cache (Redis Cloud)

### Create Redis Instance
1. Go to https://redis.com/cloud
2. Create free or paid instance
3. Copy connection string

### Configure
Add to environment variables:
```
REDIS_URL=redis://username:password@host:port
```

## Step 4: S3 Storage (AWS)

### Create S3 Bucket
```bash
aws s3 mb s3://clipforge-prod --region us-east-1
```

### Configure Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::clipforge-prod/*"
    }
  ]
}
```

### Enable CORS
```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"]
  }
]
```

### Create IAM User for API Access
1. Create new IAM user
2. Attach S3 full access policy
3. Create access keys
4. Add to environment variables:

```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=clipforge-prod
```

## Step 5: Worker Deployment (Railway or Render)

### Using Railway

1. Go to https://railway.app
2. Create new project
3. Connect GitHub repo
4. Set as "Worker" service

```bash
# Set NODE_ENV to production
# Add all environment variables
# Deploy
```

Start command:
```
npm run build && npm run worker:start
```

### Using Render

1. Go to https://render.com
2. Create new service
3. Connect GitHub repo
4. Choose "Background Worker"
5. Set environment variables
6. Deploy

## Step 6: Stripe Configuration

### Create Products
1. Go to https://dashboard.stripe.com
2. Create products:
   - Pro ($49/month)
   - Business ($199/month)

### Copy Price IDs
Add to environment variables:
```
STRIPE_PRO_PRICE_ID=price_1...
STRIPE_BUSINESS_PRICE_ID=price_1...
```

### Configure Webhooks
1. Go to Webhooks in Stripe Dashboard
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - payment_intent.succeeded
   - payment_intent.payment_failed

4. Copy webhook secret to environment:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 7: Google OAuth Setup

### Create OAuth Credentials
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI:
   ```
   https://your-domain.com/api/auth/callback/google
   ```

### Add to Environment
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Step 8: Domain & SSL

### Add Custom Domain (Vercel)
1. In Vercel Dashboard → Settings → Domains
2. Add your domain
3. Follow DNS configuration steps
4. SSL automatically provisioned

### Update NEXTAUTH_URL
```
NEXTAUTH_URL=https://your-domain.com
```

## Step 9: Email Service (Optional)

For production email notifications, set up:

### Using SendGrid
```bash
# npm install @sendgrid/mail

# .env
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=noreply@your-domain.com
```

### Or using Resend
```bash
# npm install resend

# .env
RESEND_API_KEY=re_xxx...
```

## Step 10: Monitoring & Logging

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

Initialize in `instrumentation.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Logs (LogRocket)

```bash
npm install logrocket
```

Initialize in client:
```typescript
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');
```

## Step 11: Performance Optimization

### CDN Configuration (CloudFlare)

1. Add domain to CloudFlare
2. Update nameservers
3. Enable:
   - Automatic HTTPS Rewrites
   - Browser Caching
   - Image Optimization
   - Rate Limiting

### Database Optimization

Enable slow query logging:
```sql
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

## Step 12: Backup Strategy

### Database Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

In Supabase, configure automatic backups in Settings.

### S3 Backups

Enable S3 versioning:
```bash
aws s3api put-bucket-versioning \
  --bucket clipforge-prod \
  --versioning-configuration Status=Enabled
```

## Scaling Considerations

### Horizontal Scaling
- Serverless functions scale automatically (Vercel)
- Workers run on demand (Railway/Render)
- Database can be upgraded for more connections

### Caching Strategy
- Cache API responses with Redis
- Cache static assets on CDN
- Database query caching with Prisma

### Database Optimization
- Add indexes on frequently queried fields
- Archive old videos after 90 days
- Partition large tables by user

## Health Checks

### API Health Check
```bash
curl https://your-domain.com/api/health
```

### Database Health
```sql
SELECT 1;
```

### Monitor Dashboard
1. Vercel Analytics
2. Stripe Dashboard
3. AWS CloudWatch
4. Supabase Database Dashboard

## Rollback Procedure

### Vercel
Push to `main` branch triggers new deployment. Previous deployments available in Vercel Dashboard for quick rollback.

### Database
```bash
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate deploy
```

### Environment Variables
Update in Vercel Dashboard and environments will be automatically refreshed.

## Security Hardening

### Environment Variables
```bash
# Review .env.production
# Ensure all secrets are in Vercel, not in code
# Never commit .env files
```

### Database Access
```sql
-- Restrict user permissions
CREATE ROLE app_user WITH LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE clipforge TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
```

### Rate Limiting
Enable in environment:
```
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### CORS Configuration
```
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

## Maintenance

### Weekly Tasks
- Check error logs (Sentry)
- Monitor database performance
- Review user feedback
- Check API quotas (OpenAI, Stripe)

### Monthly Tasks
- Database cleanup (old logs, temp files)
- Security updates
- Performance analysis
- Backup verification

### Quarterly Tasks
- Load testing
- Security audit
- Cost optimization
- Feature planning

## Support & Troubleshooting

### Common Issues

**CORS errors**
- Check ALLOWED_ORIGINS in Stripe webhooks
- Verify S3 bucket CORS config

**Webhook failures**
- Verify webhook secret in `.env`
- Check Stripe Dashboard for retry attempts
- Review CloudFlare logs

**Slow video processing**
- Check worker logs on Railway/Render
- Increase worker concurrency
- Optimize FFmpeg settings

---

For 24/7 support, consider enterprise plans:
- Vercel Pro
- Supabase Team
- AWS Support Plans
