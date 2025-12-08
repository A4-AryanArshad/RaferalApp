# Deploy Backend to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```

## Step 1: Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

## Step 3: Configure Environment Variables

Set these in Vercel dashboard or via CLI:

```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add CORS_ORIGIN
```

**Required Environment Variables:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Secret for JWT tokens (use a strong random string)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `CORS_ORIGIN` - Allowed origins (e.g., `https://your-app.vercel.app`)

## Step 4: Deploy

### Option A: Deploy via CLI

```bash
# From project root
vercel

# For production deployment
vercel --prod
```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Connect your GitHub repository
4. Vercel will auto-deploy on every push

## Step 5: Update Mobile App API URL

After deployment, update `AirbnbReferralApp/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'https://your-app.vercel.app/api'  // Your Vercel URL
  : 'https://your-app.vercel.app/api'; // Production
```

## Important Notes

### ✅ What Works on Vercel:
- REST API endpoints
- MongoDB connections (with connection pooling)
- JWT authentication
- File uploads (with proper configuration)
- All your existing routes

### ⚠️ Limitations:
- **Cold Starts**: First request after inactivity may be slower (1-2 seconds)
- **Function Timeout**: 10 seconds (Hobby), 60 seconds (Pro)
- **No WebSockets**: Real-time features won't work
- **No Long-Running Processes**: Background jobs need separate service

### 🔧 Optimizations:

1. **Database Connection Pooling**: Already configured in `api/index.ts`
2. **Keep-Alive**: Vercel handles this automatically
3. **Environment Variables**: Set in Vercel dashboard

## Troubleshooting

### Database Connection Issues:
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check MongoDB connection string is correct
- Verify environment variables are set in Vercel

### CORS Errors:
- Set `CORS_ORIGIN` to your app's domain
- Or use `*` for development (not recommended for production)

### Cold Start Issues:
- Use Vercel Pro plan for better performance
- Or deploy to a traditional server (Heroku, Railway, etc.)

## Alternative: Deploy to Other Platforms

If Vercel doesn't meet your needs, consider:

- **Railway**: Easy deployment, good for Node.js
- **Render**: Free tier available, good for Express apps
- **Heroku**: Traditional PaaS (paid plans)
- **AWS/GCP/Azure**: More control, more setup

## Quick Deploy Command

```bash
# One-time setup
vercel login
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET

# Deploy
vercel --prod
```

## After Deployment

1. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Update mobile app API URL
3. Test all endpoints
4. Share with client!

