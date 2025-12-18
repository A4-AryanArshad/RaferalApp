# Force Vercel Rebuild - Fix Filter Issue

## Problem
Filters work on localhost but not on deployed Vercel backend, even after pushing all changes.

## Solution: Force Clean Rebuild

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to your Vercel project dashboard
2. Click on the latest deployment
3. Click "Redeploy" → "Use existing Build Cache" → **UNCHECK THIS**
4. Click "Redeploy"

### Option 2: Via Vercel CLI
```bash
# From project root
vercel --prod --force
```

### Option 3: Clear Build Cache via API
```bash
# Get your Vercel token from: https://vercel.com/account/tokens
# Then run:
curl -X POST "https://api.vercel.com/v1/deployments" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "your-project-name",
    "force": true
  }'
```

## Verify Deployment

After redeploying, check the logs:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for logs from `/api/referrals/user/:userId`
   - You should see: `[ReferralRoutes] GET /user/:userId - Query params: { status, confirmationStatus, ... }`

2. **Test the Endpoint:**
   ```bash
   # Replace with your actual userId and token
   curl "https://raferal-app-pqbq.vercel.app/api/referrals/user/YOUR_USER_ID?confirmationStatus=host_confirmed" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check Frontend Console:**
   - Open your app
   - Go to "Mes Recommandations"
   - Click "Acceptées" filter
   - Check console logs for: `[ReferralService] Fetching referrals from: /referrals/user/...?confirmationStatus=host_confirmed`

## Common Issues

### Issue 1: Vercel Using Cached Build
**Solution:** Force rebuild without cache (see above)

### Issue 2: Query Parameters Not Parsed
**Check:** Make sure `req.query` is being logged. If it's empty, Vercel might not be parsing query strings correctly.

### Issue 3: TypeScript Not Compiling
**Check:** Vercel should auto-compile TypeScript. If not, add to `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Issue 4: Environment Variables Missing
**Check:** Make sure all env vars are set in Vercel dashboard:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Debug Steps

1. **Add More Logging:**
   The route now logs:
   - Query parameters received
   - User ID
   - Number of referrals returned

2. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Filter by "ReferralRoutes" or "ReferralService"
   - Look for the log messages we added

3. **Compare Local vs Deployed:**
   - Test the same endpoint locally
   - Compare the logs
   - Check if query parameters are different

## Quick Fix Command

```bash
# Force redeploy without cache
vercel --prod --force

# Or via Git (if auto-deploy is enabled)
git commit --allow-empty -m "Force Vercel rebuild"
git push
```

