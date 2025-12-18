# Backend Files Explanation

## 📁 Two Main Backend Files

### 1. **Localhost Backend** → `src/server.ts`
- **Used when:** Running `npm run dev` locally
- **How it works:** Starts a traditional Express server on port 3000
- **Entry point:** `package.json` → `"dev": "ts-node-dev --respawn --transpile-only src/server.ts"`
- **Key difference:** Uses `app.listen(PORT)` to start the server

### 2. **Vercel Backend** → `api/index.ts`
- **Used when:** Deployed to Vercel
- **How it works:** Exports a serverless function handler
- **Entry point:** `vercel.json` → `"destination": "/api/index.ts"`
- **Key difference:** Exports `export default async function handler(req, res)`

## 🔍 Key Differences

| Feature | `src/server.ts` (Localhost) | `api/index.ts` (Vercel) |
|---------|----------------------------|-------------------------|
| **Import paths** | `'./routes/userRoutes'` | `'../src/routes/userRoutes'` |
| **Server start** | `app.listen(PORT)` | No server start (serverless) |
| **Export** | No export (runs directly) | `export default handler` |
| **Database connection** | In `startServer()` function | In `handler()` function |
| **File location** | `src/server.ts` | `api/index.ts` |

## ✅ Both Files Should Have Same Routes

Both files should register the same routes:
- `/api/users`
- `/api/referrals`
- `/api/listings`
- `/api/rewards` ⚠️
- `/api/payments`
- `/api/bookings`
- `/api/webhooks`
- `/api/host`

## 🐛 Current Issue

The deployed Vercel version (`api/index.ts`) has all routes registered, but rewards endpoints return "Route not found". This suggests:
1. The deployed version is using an old cached build
2. Need to force redeploy without cache

## 🔧 How to Keep Them in Sync

When adding new routes:
1. ✅ Add import to `src/server.ts`
2. ✅ Add `app.use()` to `src/server.ts`
3. ✅ Add import to `api/index.ts` (with `../src/` prefix)
4. ✅ Add `app.use()` to `api/index.ts`
5. ✅ Commit and push
6. ✅ Force redeploy to Vercel

## 📝 Current Status

**`src/server.ts` (Localhost):** ✅ All routes present
**`api/index.ts` (Vercel):** ✅ All routes present in code, but deployed version may be outdated

