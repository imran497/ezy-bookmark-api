# 🚀 EzyBookmark API - Railway Deployment Guide

## Overview
Deploy your EzyBookmark API to Railway with Supabase PostgreSQL database.

## Prerequisites

### 1. Accounts Setup
- [ ] Railway account: [railway.app](https://railway.app)
- [ ] Supabase account: [supabase.com](https://supabase.com)
- [ ] Clerk account: [clerk.com](https://clerk.com)
- [ ] GitHub repository ready

### 2. Supabase Database Setup
1. Create new Supabase project
2. Note your database password
3. Copy the connection string from Settings → Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

## Step-by-Step Deployment

### Phase 1: Database Setup

1. **Create Supabase Project**:
   - Project name: `ezy-bookmark-db`
   - Set strong password
   - Select region

2. **Get Database URL**:
   - Settings → Database → Connection string
   - Copy the URI format connection string

### Phase 2: Deploy to Railway

1. **Connect GitHub Repository**:
   - Railway Dashboard → New Project
   - Deploy from GitHub repo
   - Select your `ezy-bookmark-api` repository

2. **Set Environment Variables**:
   ```bash
   # Database
   DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
   
   # Authentication  
   CLERK_SECRET_KEY=your_clerk_production_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   
   # Server Configuration
   NODE_ENV=production
   PORT=3001
   
   # Security
   ALLOWED_ORIGINS=https://your-frontend.railway.app
   LOG_LEVEL=info
   ```

3. **Deploy**:
   - Railway will auto-detect Node.js
   - Build: `npm run build`
   - Start: `npm run start:prod`

### Phase 3: Database Migration

```bash
# After deployment, run migration
railway run npm run db:migrate
```

### Phase 4: Clerk Webhook Setup

1. Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-api.railway.app/api/webhooks/clerk`
3. Enable events: `user.created`, `user.updated`, `user.deleted`

## Environment Variables Reference

### Required Variables
```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
CLERK_SECRET_KEY=your_clerk_production_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
NODE_ENV=production
```

### Optional Variables
```bash
PORT=3001
ALLOWED_ORIGINS=https://your-frontend.railway.app
LOG_LEVEL=info
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
CACHE_TTL=300000
CACHE_MAX_ITEMS=100
```

## Testing Deployment

### Health Check
```bash
curl https://your-api.railway.app/api/health
```

### Test Endpoints
```bash
# Get tools
curl https://your-api.railway.app/api/tools

# Get categories  
curl https://your-api.railway.app/api/tools/categories
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Railway build logs
   - Verify package.json scripts
   - Ensure all dependencies are listed

2. **Database Connection**:
   - Verify DATABASE_URL format
   - Check Supabase project status
   - Ensure migrations are applied

3. **CORS Issues**:
   - Update ALLOWED_ORIGINS with exact frontend URL
   - No trailing slashes in URLs

4. **Authentication Issues**:
   - Verify Clerk keys are production keys
   - Check webhook URL in Clerk dashboard
   - Ensure webhook secret matches

## Production Checklist

- [ ] Supabase database created and configured
- [ ] Railway deployment successful
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Health check responding
- [ ] Clerk webhooks configured
- [ ] CORS configured for frontend
- [ ] Logs showing no errors

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Clerk Docs**: [clerk.com/docs](https://clerk.com/docs)

---

Your EzyBookmark API will be live at: `https://your-app.railway.app`

🎉 **Ready for production deployment!**